const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

// Helper function to make LeetCode GraphQL requests
async function leetcodeRequest(query, variables = {}) {
  try {
    const response = await axios.post(LEETCODE_GRAPHQL, {
      query,
      variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch LeetCode data');
  }
}

// GraphQL queries
const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        aboutMe
        country
        company
        school
        websites
        reputation
        ranking
      }
    }
  }
`;

const USER_STATS_QUERY = `
  query getUserStats($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

const USER_CONTEST_QUERY = `
  query getUserContest($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

const RECENT_SUBMISSIONS_QUERY = `
  query recentSubmissions($username: String!, $limit: Int!) {
    recentSubmissionList(username: $username, limit: $limit) {
      title
      titleSlug
      status
      lang
        timestamp
    }
  }
`;

const USER_BADGES_QUERY = `
  query getUserBadges($username: String!) {
    matchedUser(username: $username) {
      badges {
        id
        displayName
        icon
        creationDate
      }
    }
  }
`;

// Validate LeetCode username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate username format (LeetCode allows alphanumeric and some special chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid LeetCode username format' });
    }

    // Check if user exists
    const result = await leetcodeRequest(USER_PROFILE_QUERY, { username: sanitizedUsername });
    
    if (!result.data?.matchedUser) {
      return res.status(400).json({ error: 'LeetCode user not found' });
    }

    const profile = result.data.matchedUser.profile;
    
    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: profile.realName || sanitizedUsername,
      avatar: profile.userAvatar,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect LeetCode account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim();
    
    // Validate and fetch profile
    const result = await leetcodeRequest(USER_PROFILE_QUERY, { username: sanitizedUsername });
    
    if (!result.data?.matchedUser) {
      return res.status(400).json({ error: 'LeetCode user not found' });
    }

    const profile = result.data.matchedUser.profile;
    
    // Store connection in Firestore using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.leetcode': {
        username: sanitizedUsername,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
        profile: {
          displayName: profile.realName || sanitizedUsername,
          avatar: profile.userAvatar,
          bio: profile.aboutMe,
          country: profile.country,
          company: profile.company,
          school: profile.school,
          websites: profile.websites,
          ranking: profile.ranking,
          reputation: profile.reputation,
        },
      },
    }, { merge: true });

    res.json({ success: true, username: sanitizedUsername });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync LeetCode data
router.post('/sync', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Get user's LeetCode connection
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData?.connections?.leetcode?.connected) {
      return res.status(400).json({ error: 'LeetCode not connected' });
    }

    const username = userData.connections.leetcode.username;
    
    // Fetch comprehensive LeetCode data
    const [profileResult, statsResult, contestResult, submissionsResult, badgesResult] = await Promise.all([
      leetcodeRequest(USER_PROFILE_QUERY, { username }),
      leetcodeRequest(USER_STATS_QUERY, { username }),
      leetcodeRequest(USER_CONTEST_QUERY, { username }),
      leetcodeRequest(RECENT_SUBMISSIONS_QUERY, { username, limit: 20 }),
      leetcodeRequest(USER_BADGES_QUERY, { username }),
    ]);

    const profile = profileResult.data?.matchedUser?.profile || {};
    const stats = statsResult.data?.matchedUser?.submitStats?.acSubmissionNum || [];
    const contest = contestResult.data?.userContestRanking || {};
    const submissions = submissionsResult.data?.recentSubmissionList || [];
    const badges = badgesResult.data?.matchedUser?.badges || [];

    // Calculate difficulty distribution
    const difficultyStats = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      All: 0,
    };
    
    stats.forEach(stat => {
      if (stat.difficulty === 'Easy') difficultyStats.Easy = stat.count;
      if (stat.difficulty === 'Medium') difficultyStats.Medium = stat.count;
      if (stat.difficulty === 'Hard') difficultyStats.Hard = stat.count;
      if (stat.difficulty === 'All') difficultyStats.All = stat.count;
    });

    // Calculate acceptance rate
    const acceptanceRate = difficultyStats.All > 0 
      ? ((difficultyStats.Easy + difficultyStats.Medium + difficultyStats.Hard) / difficultyStats.All * 100).toFixed(2)
      : 0;

    // Update Firestore synced data using dot notation to preserve other connections
    await db.collection('users').doc(uid).set({
      'connections.leetcode.lastSynced': new Date().toISOString(),
      'cachedData.leetcode': {
        profile: {
          displayName: profile.realName || username,
          avatar: profile.userAvatar,
          bio: profile.aboutMe,
          country: profile.country,
          company: profile.company,
          school: profile.school,
          websites: profile.websites,
          ranking: profile.ranking,
          reputation: profile.reputation,
        },
        stats: difficultyStats,
        acceptanceRate: parseFloat(acceptanceRate),
        contest: {
          attendedContestsCount: contest.attendedContestsCount || 0,
          rating: contest.rating || 0,
          globalRanking: contest.globalRanking || 0,
          topPercentage: contest.topPercentage || 0,
        },
        recentSubmissions: submissions.map(sub => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          status: sub.status,
          language: sub.lang,
          timestamp: sub.timestamp,
        })),
        badges: badges.map(badge => ({
          id: badge.id,
          displayName: badge.displayName,
          icon: badge.icon,
          creationDate: badge.creationDate,
        })),
      },
    }, { merge: true });

    res.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect LeetCode
router.post('/disconnect', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    await db.collection('users').doc(uid).set({
      'connections.leetcode.connected': false,
      'connections.leetcode.disconnectedAt': new Date().toISOString(),
      'connections.leetcode.username': null,
      'cachedData.leetcode': null,
    }, { merge: true });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
