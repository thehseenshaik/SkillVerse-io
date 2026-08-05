const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

// Helper function to make Codeforces API requests
async function codeforcesRequest(endpoint, params = {}) {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}${endpoint}`, {
      params,
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(response.data.comment || 'Codeforces API error');
    }
    
    return response.data.result;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Codeforces user not found');
    }
    throw new Error('Failed to fetch Codeforces data');
  }
}

// Validate Codeforces username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate username format (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid Codeforces username format' });
    }

    // Check if user exists
    const users = await codeforcesRequest('/user.info', { handles: sanitizedUsername });
    
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Codeforces user not found' });
    }

    const user = users[0];
    
    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : sanitizedUsername,
      avatar: user.avatar ? `https:${user.avatar}` : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect Codeforces account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate and fetch profile
    const users = await codeforcesRequest('/user.info', { handles: sanitizedUsername });
    
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Codeforces user not found' });
    }

    const user = users[0];
    
    // Store connection in Firestore using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.codeforces': {
        username: sanitizedUsername,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        profile: {
          displayName: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : sanitizedUsername,
          avatar: user.avatar ? `https:${user.avatar}` : null,
          rating: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank: user.rank || 'unrated',
          maxRank: user.maxRank || 'unrated',
          country: user.country || null,
          city: user.city || null,
          organization: user.organization || null,
          contribution: user.contribution || 0,
          friendOfCount: user.friendOfCount || 0,
        },
      },
    }, { merge: true });

    res.json({ success: true, username: sanitizedUsername });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync Codeforces data
router.post('/sync', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Get user's Codeforces connection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData?.connections?.codeforces?.connected) {
      return res.status(400).json({ error: 'Codeforces not connected' });
    }

    const username = userData.connections.codeforces.username;
    
    // Fetch comprehensive Codeforces data
    const [users, ratingHistory] = await Promise.all([
      codeforcesRequest('/user.info', { handles: username }),
      codeforcesRequest('/user.rating', { handle: username }),
    ]);
    
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Codeforces user not found' });
    }

    const user = users[0];
    
    // Calculate recent rating changes
    const recentRatingChanges = ratingHistory.slice(-10).map(change => ({
      contestId: change.contestId,
      contestName: change.contestName,
      rank: change.rank,
      ratingUpdateTimeSeconds: change.ratingUpdateTimeSeconds,
      oldRating: change.oldRating,
      newRating: change.newRating,
    }));

    // Update Firestore synced data using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.codeforces.lastSynced': new Date().toISOString(),
      'cachedData.codeforces': {
        profile: {
          displayName: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : username,
          avatar: user.avatar ? `https:${user.avatar}` : null,
          rating: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank: user.rank || 'unrated',
          maxRank: user.maxRank || 'unrated',
          country: user.country || null,
          city: user.city || null,
          organization: user.organization || null,
          contribution: user.contribution || 0,
          friendOfCount: user.friendOfCount || 0,
        },
        ratingHistory: recentRatingChanges,
        totalContests: ratingHistory.length,
      },
    }, { merge: true });

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect Codeforces
router.post('/disconnect', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      'connections.codeforces.connected': false,
      'connections.codeforces.disconnectedAt': new Date().toISOString(),
      'connections.codeforces.username': null,
      'cachedData.codeforces': null,
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
