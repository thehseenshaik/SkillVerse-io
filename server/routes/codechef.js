const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const CODECHEF_API_BASE = 'https://codechef-api.vercel.app';

// Helper function to make CodeChef API requests
async function codechefRequest(handle) {
  try {
    const response = await axios.get(`${CODECHEF_API_BASE}/handle/${handle}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('CodeChef user not found');
    }
    throw new Error('Failed to fetch CodeChef data');
  }
}

// Validate CodeChef username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate username format (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid CodeChef username format' });
    }

    // Check if user exists
    const data = await codechefRequest(sanitizedUsername);
    
    if (!data || data.success === false) {
      return res.status(400).json({ error: 'CodeChef user not found' });
    }

    const profile = data.profile || {};
    
    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: profile.name || sanitizedUsername,
      avatar: profile.profile || null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect CodeChef account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate and fetch profile
    const data = await codechefRequest(sanitizedUsername);
    
    if (!data || data.success === false) {
      return res.status(400).json({ error: 'CodeChef user not found' });
    }

    const profile = data.profile || {};
    
    const connData = {
      username: sanitizedUsername,
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      profile: {
        displayName: profile.name || sanitizedUsername,
        avatar: profile.profile || null,
        currentRating: profile.currentRating || 0,
        highestRating: profile.highestRating || 0,
        countryFlag: profile.countryFlag || null,
        countryName: profile.countryName || null,
        globalRank: profile.globalRank || 0,
        countryRank: profile.countryRank || 0,
        stars: profile.stars || null,
      },
    };

    await db.collection('users').doc(uid).set({
      connections: {
        codechef: connData,
      },
      'connections.codechef': connData,
    }, { merge: true });

    res.json({ success: true, username: sanitizedUsername });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync CodeChef data
router.post('/sync', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Get user's CodeChef connection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    
    const codechefConn = userData?.connections?.codechef || userData?.['connections.codechef'];

    if (!codechefConn || !codechefConn.connected || !codechefConn.username) {
      return res.status(400).json({ error: 'CodeChef not connected' });
    }

    const username = codechefConn.username;
    
    // Fetch comprehensive CodeChef data
    const data = await codechefRequest(username);
    
    if (!data || data.success === false) {
      return res.status(400).json({ error: 'CodeChef user not found' });
    }

    const profile = data.profile || {};
    
    // Update Firestore synced data using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.codechef.lastSynced': new Date().toISOString(),
      'cachedData.codechef': {
        profile: {
          displayName: profile.name || username,
          avatar: profile.profile || null,
          currentRating: profile.currentRating || 0,
          highestRating: profile.highestRating || 0,
          countryFlag: profile.countryFlag || null,
          countryName: profile.countryName || null,
          globalRank: profile.globalRank || 0,
          countryRank: profile.countryRank || 0,
          stars: profile.stars || null,
        },
      },
    }, { merge: true });

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect CodeChef
router.post('/disconnect', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      'connections.codechef.connected': false,
      'connections.codechef.disconnectedAt': new Date().toISOString(),
      'connections.codechef.username': null,
      'cachedData.codechef': null,
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
