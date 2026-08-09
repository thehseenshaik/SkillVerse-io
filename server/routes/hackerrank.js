const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const HACKERRANK_API_BASE = 'https://hackerrank-stats-api.vercel.app';

// Helper function to make HackerRank API requests
async function hackerrankRequest(username) {
  try {
    const response = await axios.get(`${HACKERRANK_API_BASE}/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('HackerRank user not found');
    }
    throw new Error('Failed to fetch HackerRank data');
  }
}

// Validate HackerRank username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate username format (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid HackerRank username format' });
    }

    // Check if user exists
    const data = await hackerrankRequest(sanitizedUsername);
    
    if (!data || data.error) {
      return res.status(400).json({ error: 'HackerRank user not found' });
    }

    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: sanitizedUsername,
      avatar: null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect HackerRank account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate and fetch profile
    const data = await hackerrankRequest(sanitizedUsername);
    
    if (!data || data.error) {
      return res.status(400).json({ error: 'HackerRank user not found' });
    }

    const connData = {
      username: sanitizedUsername,
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      profile: {
        displayName: sanitizedUsername,
        avatar: null,
      },
    };

    await db.collection('users').doc(uid).set({
      connections: {
        hackerrank: connData,
      },
      'connections.hackerrank': connData,
    }, { merge: true });

    res.json({ success: true, username: sanitizedUsername });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync HackerRank data
router.post('/sync', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Get user's HackerRank connection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    
    const hackerrankConn = userData?.connections?.hackerrank || userData?.['connections.hackerrank'];

    if (!hackerrankConn || !hackerrankConn.connected || !hackerrankConn.username) {
      return res.status(400).json({ error: 'HackerRank not connected' });
    }

    const username = hackerrankConn.username;
    
    // Fetch comprehensive HackerRank data
    const data = await hackerrankRequest(username);
    
    if (!data || data.error) {
      return res.status(400).json({ error: 'HackerRank user not found' });
    }

    // Update Firestore synced data using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.hackerrank.lastSynced': new Date().toISOString(),
      'cachedData.hackerrank': {
        profile: {
          displayName: username,
          avatar: null,
        },
        stats: data,
      },
    }, { merge: true });

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect HackerRank
router.post('/disconnect', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      'connections.hackerrank.connected': false,
      'connections.hackerrank.disconnectedAt': new Date().toISOString(),
      'connections.hackerrank.username': null,
      'cachedData.hackerrank': null,
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
