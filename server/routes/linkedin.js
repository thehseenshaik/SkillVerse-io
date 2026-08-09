const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');

// State storage for CSRF validation
const stateStore = new Map();

// Helper to check if LinkedIn app credentials exist
const isLinkedInConfigured = () => {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_CLIENT_ID !== 'YOUR_LINKEDIN_CLIENT_ID'
  );
};

/**
 * GET /api/linkedin/status
 * Returns current LinkedIn integration availability and user connection status
 */
router.get('/status', async (req, res) => {
  try {
    const configured = isLinkedInConfigured();
    const userId = req.query.userId;

    let connected = false;
    let memberData = null;

    if (userId && global.db) {
      try {
        const doc = await global.db.collection('users').doc(userId).collection('integrations').doc('linkedin').get();
        if (doc.exists) {
          const data = doc.data();
          if (data.accessToken && (!data.expiresAt || data.expiresAt > Date.now())) {
            connected = true;
            memberData = {
              name: data.name,
              headline: data.headline,
              connectedAt: data.connectedAt,
            };
          }
        }
      } catch (err) {
        // ignore
      }
    }

    res.json({
      configured,
      connected,
      member: memberData,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * GET /api/linkedin/auth-url
 * Generates official OAuth 2.0 authorization URL
 */
router.get('/auth-url', (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    if (!isLinkedInConfigured()) {
      return res.json({
        configured: false,
        message: 'LinkedIn API credentials are not yet configured in server/.env.',
        fallbackUrl: 'https://www.linkedin.com/feed/?shareActive=true',
      });
    }

    const state = crypto.randomBytes(16).toString('hex');
    stateStore.set(state, { userId, timestamp: Date.now() });

    // Clean up old states (>15 min)
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    for (const [k, v] of stateStore.entries()) {
      if (v.timestamp < fifteenMinAgo) stateStore.delete(k);
    }

    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/linkedin/callback`;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const scope = encodeURIComponent('openid profile email w_member_social');

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

    res.json({
      configured: true,
      authUrl,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * GET /api/linkedin/callback
 * Exchanges authorization code for LinkedIn access token
 */
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth Error:', error, error_description);
    return res.redirect('/career-snapshot?linkedin_error=' + encodeURIComponent(error_description || error));
  }

  if (!state || !stateStore.has(state)) {
    return res.redirect('/career-snapshot?linkedin_error=Invalid+or+expired+state+token');
  }

  const { userId } = stateStore.get(state);
  stateStore.delete(state);

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/linkedin/callback`;

    // Exchange token via POST to LinkedIn
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString();

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData,
    });

    const tokenJson = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error_description || 'Failed to obtain access token');
    }

    const accessToken = tokenJson.access_token;
    const expiresIn = tokenJson.expires_in || 5184000; // ~60 days

    // Fetch LinkedIn user info
    let profileData = {};
    try {
      const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userinfoRes.ok) {
        profileData = await userinfoRes.json();
      }
    } catch {
      // ignore
    }

    // Save to Firestore under user integrations
    if (global.db && userId) {
      await global.db.collection('users').doc(userId).collection('integrations').doc('linkedin').set({
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
        sub: profileData.sub || null,
        name: profileData.name || null,
        email: profileData.email || null,
        connectedAt: new Date().toISOString(),
      }, { merge: true });
    }

    res.redirect('/career-snapshot?linkedin=connected');
  } catch (err) {
    console.error('LinkedIn Callback Exception:', err);
    res.redirect('/career-snapshot?linkedin_error=' + encodeURIComponent(err.message));
  }
});

/**
 * POST /api/linkedin/publish
 * Publishes UGC / Post to LinkedIn
 */
router.post('/publish', async (req, res) => {
  try {
    const { userId, captionText, posterDataUrl } = req.body;

    if (!userId || !captionText) {
      return res.status(400).json({ error: { message: 'userId and captionText are required' } });
    }

    if (!isLinkedInConfigured()) {
      return res.json({
        success: false,
        fallback: true,
        message: 'Direct API publishing requires LinkedIn client configuration. Please use Copy Caption + Open LinkedIn.',
        shareUrl: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captionText)}`,
      });
    }

    if (!global.db) {
      return res.status(500).json({ error: { message: 'Database not initialized' } });
    }

    const doc = await global.db.collection('users').doc(userId).collection('integrations').doc('linkedin').get();
    if (!doc.exists || !doc.data().accessToken) {
      return res.status(401).json({
        success: false,
        requiresAuth: true,
        message: 'LinkedIn account not connected or authorization expired',
      });
    }

    const { accessToken, sub } = doc.data();

    // Call LinkedIn UGC Post API
    const author = `urn:li:person:${sub}`;
    const payload = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: captionText,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
    });

    const liData = await liRes.json();

    if (!liRes.ok) {
      return res.status(400).json({
        success: false,
        message: liData.message || 'LinkedIn rejected post creation',
        details: liData,
      });
    }

    // Save snapshot in history
    const snapshotId = `snap_${Date.now()}`;
    await global.db.collection('users').doc(userId).collection('careerSnapshots').doc(snapshotId).set({
      snapshotId,
      userId,
      caption: captionText,
      platform: 'linkedin',
      platformPostId: liData.id || null,
      status: 'Published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      postId: liData.id,
      postUrl: `https://www.linkedin.com/feed/update/${liData.id}`,
    });
  } catch (error) {
    console.error('LinkedIn Publish Error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

/**
 * POST /api/linkedin/disconnect
 * Clears LinkedIn integration
 */
router.post('/disconnect', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    if (global.db) {
      await global.db.collection('users').doc(userId).collection('integrations').doc('linkedin').delete();
    }

    res.json({ success: true, message: 'LinkedIn disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
