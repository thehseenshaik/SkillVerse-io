const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Get all connections status
router.get('/', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const connections = userData.connections || {};
    
    res.json({
      github: {
        connected: connections.github?.connected || false,
        username: connections.github?.username || null,
        lastSynced: connections.github?.lastSynced || null,
        connectedAt: connections.github?.connectedAt || null,
      },
      leetcode: {
        connected: connections.leetcode?.connected || false,
        username: connections.leetcode?.username || null,
        lastSynced: connections.leetcode?.lastSynced || null,
        connectedAt: connections.leetcode?.connectedAt || null,
      },
      gfg: {
        connected: connections.gfg?.connected || false,
        username: connections.gfg?.username || null,
        lastSynced: connections.gfg?.lastSynced || null,
        connectedAt: connections.gfg?.connectedAt || null,
      },
      codeforces: {
        connected: connections.codeforces?.connected || false,
        username: connections.codeforces?.username || null,
        lastSynced: connections.codeforces?.lastSynced || null,
        connectedAt: connections.codeforces?.connectedAt || null,
      },
      codechef: {
        connected: connections.codechef?.connected || false,
        username: connections.codechef?.username || null,
        lastSynced: connections.codechef?.lastSynced || null,
        connectedAt: connections.codechef?.connectedAt || null,
      },
      hackerrank: {
        connected: connections.hackerrank?.connected || false,
        username: connections.hackerrank?.username || null,
        lastSynced: connections.hackerrank?.lastSynced || null,
        connectedAt: connections.hackerrank?.connectedAt || null,
      },
      linkedin: { connected: false, comingSoon: true },
      atcoder: { connected: false, comingSoon: true },
      kaggle: { connected: false, comingSoon: true },
      stackoverflow: { connected: false, comingSoon: true },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect all platforms
router.post('/disconnect-all', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      connections: {
        github: { connected: false, disconnectedAt: new Date().toISOString() },
        leetcode: { connected: false, disconnectedAt: new Date().toISOString() },
        gfg: { connected: false, disconnectedAt: new Date().toISOString() },
        codeforces: { connected: false, disconnectedAt: new Date().toISOString() },
        codechef: { connected: false, disconnectedAt: new Date().toISOString() },
        hackerrank: { connected: false, disconnectedAt: new Date().toISOString() },
      },
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear cached data
router.post('/clear-cache', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      cachedData: {},
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
