const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      console.log('[Dashboard] Missing user ID in request');
      return res.status(400).json({ error: 'Missing user ID. Please ensure you are logged in.' });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      console.log('[Dashboard] User not found:', uid);
      return res.status(404).json({ error: 'User not found' });
    }

    const getConn = (platform) => {
      return userData?.connections?.[platform] || userData?.[`connections.${platform}`] || {};
    };

    const getCache = (platform) => {
      return userData?.cachedData?.[platform] || userData?.[`cachedData.${platform}`] || null;
    };

    const connections = {
      github: getConn('github'),
      leetcode: getConn('leetcode'),
      gfg: getConn('gfg'),
      codeforces: getConn('codeforces'),
      codechef: getConn('codechef'),
      hackerrank: getConn('hackerrank'),
    };

    const cachedData = {
      github: getCache('github'),
      leetcode: getCache('leetcode'),
      gfg: getCache('gfg'),
      codeforces: getCache('codeforces'),
      codechef: getCache('codechef'),
      hackerrank: getCache('hackerrank'),
    };
    
    console.log('[Dashboard] Successfully loaded data for user:', uid);
    console.log('[Dashboard] Connections:', JSON.stringify(connections, null, 2));

    // Calculate combined metrics
    let combinedMetrics = {
      codingScore: 0,
      careerScore: 0,
      activityScore: 0,
      consistencyScore: 0,
      resumeReadiness: 0,
      profileStrength: 0,
    };

    // GitHub metrics
    if (connections.github?.connected && cachedData.github) {
     const github = cachedData.github;
      combinedMetrics.codingScore += Math.min(github.profile.followers * 2, 30);
      combinedMetrics.careerScore += Math.min(github.repositories.length * 3, 40);
      combinedMetrics.activityScore += Math.min(github.recentActivity.length * 5, 30);
      combinedMetrics.profileStrength += 25;
    }

    // LeetCode metrics
    if (connections.leetcode?.connected && cachedData.leetcode) {
      const leetcode = cachedData.leetcode;
      combinedMetrics.codingScore += Math.min(leetcode.stats.All * 0.5, 40);
      combinedMetrics.careerScore += Math.min(leetcode.contest.rating / 10, 30);
      combinedMetrics.activityScore += Math.min(leetcode.recentSubmissions.length * 3, 30);
      combinedMetrics.consistencyScore += Math.min(leetcode.acceptanceRate, 30);
      combinedMetrics.profileStrength += 25;
    }

    // GFG metrics
    if (connections.gfg?.connected && cachedData.gfg) {
      const gfg = cachedData.gfg;
      combinedMetrics.codingScore += Math.min(parseInt(gfg.profile.totalProblemsSolved || 0) * 0.3, 30);
      combinedMetrics.careerScore += Math.min(parseInt(gfg.profile.codingScore || 0) / 10, 25);
      combinedMetrics.activityScore += Math.min(parseInt(gfg.profile.currentStreak || 0) * 2, 20);
      combinedMetrics.consistencyScore += Math.min(parseInt(gfg.profile.maxStreak || 0) / 50, 25);
      combinedMetrics.profileStrength += 25;
    }

    // Codeforces metrics
    if (connections.codeforces?.connected && cachedData.codeforces) {
      const codeforces = cachedData.codeforces;
      combinedMetrics.codingScore += Math.min(codeforces.profile.rating / 5, 35);
      combinedMetrics.careerScore += Math.min(codeforces.profile.maxRating / 10, 30);
      combinedMetrics.activityScore += Math.min(codeforces.totalContests * 2, 25);
      combinedMetrics.consistencyScore += Math.min(codeforces.ratingHistory.length / 5, 20);
      combinedMetrics.profileStrength += 25;
    }

    // CodeChef metrics
    if (connections.codechef?.connected && cachedData.codechef) {
      const codechef = cachedData.codechef;
      combinedMetrics.codingScore += Math.min(codechef.profile.currentRating / 5, 30);
      combinedMetrics.careerScore += Math.min(codechef.profile.highestRating / 10, 25);
      combinedMetrics.activityScore += Math.min(codechef.profile.globalRank > 0 ? 10000 / codechef.profile.globalRank : 0, 20);
      combinedMetrics.consistencyScore += Math.min(codechef.profile.stars ? 20 : 0, 20);
      combinedMetrics.profileStrength += 25;
    }

    // HackerRank metrics
    if (connections.hackerrank?.connected && cachedData.hackerrank) {
      combinedMetrics.profileStrength += 20;
    }

    // Normalize scores
    combinedMetrics.codingScore = Math.min(combinedMetrics.codingScore, 100);
    combinedMetrics.careerScore = Math.min(combinedMetrics.careerScore, 100);
    combinedMetrics.activityScore = Math.min(combinedMetrics.activityScore, 100);
    combinedMetrics.consistencyScore = Math.min(combinedMetrics.consistencyScore, 100);
    combinedMetrics.profileStrength = Math.min(combinedMetrics.profileStrength, 100);
    combinedMetrics.resumeReadiness = Math.round(
      (combinedMetrics.codingScore + combinedMetrics.careerScore + combinedMetrics.activityScore) / 3
    );

    res.json({
      connections: {
        github: connections.github?.connected || false,
        leetcode: connections.leetcode?.connected || false,
        gfg: connections.gfg?.connected || false,
        codeforces: connections.codeforces?.connected || false,
        codechef: connections.codechef?.connected || false,
        hackerrank: connections.hackerrank?.connected || false,
      },
      github: cachedData.github || null,
      leetcode: cachedData.leetcode || null,
      gfg: cachedData.gfg || null,
      codeforces: cachedData.codeforces || null,
      codechef: cachedData.codechef || null,
      hackerrank: cachedData.hackerrank || null,
      combinedMetrics,
      lastUpdated: userData.connections?.github?.lastSynced || userData.connections?.leetcode?.lastSynced || userData.connections?.gfg?.lastSynced || userData.connections?.codeforces?.lastSynced || userData.connections?.codechef?.lastSynced || userData.connections?.hackerrank?.lastSynced || null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
