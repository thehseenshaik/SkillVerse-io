const express = require('express');
const router = express.Router();
const { db } = require('../index');
const { normalizeUserActivities } = require('../services/activity-service');

// Get recent activities for user
router.get('/recent', async (req, res) => {
  try {
    const { uid, limit = 10, platform = 'all' } = req.query;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID in query' });
    }

    const database = db || global.db;
    let userData = null;

    if (database && database.collection) {
      try {
        const userDoc = await database.collection('users').doc(uid).get();
        if (userDoc.exists) {
          userData = userDoc.data();
        }
      } catch (err) {
        console.warn('[Activity Route] Lookup warning:', err.message);
      }
    }

    if (!userData) {
      return res.json({
        activities: [],
        summary: {
          totalCount: 0,
          todayCount: 0,
          lastSyncedAt: null,
        },
        connectedPlatformsCount: 0,
      });
    }

    const connections = userData.connections || {};
    const connectedPlatforms = Object.keys(connections).filter(
      (k) => connections[k] && connections[k].connected
    );

    // Normalize activities from user data
    let allActivities = normalizeUserActivities(userData, uid);

    // Apply platform filter if requested
    if (platform && platform !== 'all') {
      allActivities = allActivities.filter(
        (act) => act.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    // Calculate metrics
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = allActivities.filter(
      (act) => act.timestamp && act.timestamp.slice(0, 10) === todayStr
    ).length;

    // Find most recent lastSynced timestamp from connections
    let lastSyncedAt = null;
    Object.values(connections).forEach((conn) => {
      if (conn && conn.lastSynced) {
        if (!lastSyncedAt || new Date(conn.lastSynced) > new Date(lastSyncedAt)) {
          lastSyncedAt = conn.lastSynced;
        }
      }
    });

    const parsedLimit = parseInt(limit, 10) || 10;
    const paginatedActivities = allActivities.slice(0, parsedLimit);

    res.json({
      activities: paginatedActivities,
      summary: {
        totalCount: allActivities.length,
        todayCount,
        lastSyncedAt: lastSyncedAt || (allActivities[0] ? allActivities[0].syncedAt : null),
      },
      connectedPlatformsCount: connectedPlatforms.length,
    });
  } catch (error) {
    console.error('[Activity Route] Error fetching recent activities:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch activities' });
  }
});

module.exports = router;
