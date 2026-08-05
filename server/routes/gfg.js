const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const GFG_API_BASE = 'https://geeks-for-geeks-api.vercel.app';

// Helper function to make GFG API requests
async function gfgRequest(username) {
  try {
    const response = await axios.get(`${GFG_API_BASE}/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.data?.error === 'Profile Not Found') {
      throw new Error('GeeksforGeeks user not found');
    }
    throw new Error('Failed to fetch GeeksforGeeks data');
  }
}

// Validate GFG username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate username format (alphanumeric and some special chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid GeeksforGeeks username format' });
    }

    // Check if user exists
    const data = await gfgRequest(sanitizedUsername);
    
    if (data.error === 'Profile Not Found') {
      return res.status(400).json({ error: 'GeeksforGeeks user not found' });
    }

    const info = data.info || {};
    
    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: info.fullName || sanitizedUsername,
      avatar: info.profilePicture || null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect GFG account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate and fetch profile
    const data = await gfgRequest(sanitizedUsername);
    
    if (data.error === 'Profile Not Found') {
      return res.status(400).json({ error: 'GeeksforGeeks user not found' });
    }

    const info = data.info || {};
    const solvedStats = data.solvedStats || {};
    
    // Store connection in Firestore using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.gfg': {
        username: sanitizedUsername,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        profile: {
          displayName: info.fullName || sanitizedUsername,
          avatar: info.profilePicture || null,
          institute: info.institution || null,
          instituteRank: info.instituteRank || null,
          currentStreak: info.currentStreak || '0',
          maxStreak: info.maxStreak || '0',
          codingScore: info.codingScore || '0',
          monthlyScore: info.monthlyCodingScore || '0',
          totalProblemsSolved: info.totalProblemsSolved || '0',
          languagesUsed: info.languagesUsed || null,
        },
      },
    }, { merge: true });

    res.json({ success: true, username: sanitizedUsername });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync GFG data
router.post('/sync', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Get user's GFG connection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData?.connections?.gfg?.connected) {
      return res.status(400).json({ error: 'GeeksforGeeks not connected' });
    }

    const username = userData.connections.gfg.username;
    
    // Fetch comprehensive GFG data
    const data = await gfgRequest(username);
    
    if (data.error === 'Profile Not Found') {
      return res.status(400).json({ error: 'GeeksforGeeks user not found' });
    }

    const info = data.info || {};
    const solvedStats = data.solvedStats || {};
    
    // Calculate difficulty distribution
    const difficultyStats = {
      school: solvedStats.school?.count || 0,
      basic: solvedStats.basic?.count || 0,
      easy: solvedStats.easy?.count || 0,
      medium: solvedStats.medium?.count || 0,
      hard: solvedStats.hard?.count || 0,
      total: info.totalProblemsSolved || '0',
    };

    // Update Firestore synced data using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.gfg.lastSynced': new Date().toISOString(),
      'cachedData.gfg': {
        profile: {
          displayName: info.fullName || username,
          avatar: info.profilePicture || null,
          institute: info.institution || null,
          instituteRank: info.instituteRank || null,
          currentStreak: info.currentStreak || '0',
          maxStreak: info.maxStreak || '0',
          codingScore: info.codingScore || '0',
          monthlyScore: info.monthlyCodingScore || '0',
          totalProblemsSolved: info.totalProblemsSolved || '0',
          languagesUsed: info.languagesUsed || null,
        },
        stats: difficultyStats,
        solvedQuestions: {
          school: solvedStats.school?.questions || [],
          basic: solvedStats.basic?.questions || [],
          easy: solvedStats.easy?.questions || [],
          medium: solvedStats.medium?.questions || [],
          hard: solvedStats.hard?.questions || [],
        },
      },
    }, { merge: true });

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect GFG
router.post('/disconnect', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      'connections.gfg.connected': false,
      'connections.gfg.disconnectedAt': new Date().toISOString(),
      'connections.gfg.username': null,
      'cachedData.gfg': null,
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
