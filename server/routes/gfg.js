const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Helper function to fetch and parse public GFG profile and POTD data
async function fetchGfgPublicProfile(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid GFG username');
  }

  const sanitizedUsername = username.trim();
  
  // Validate username format (alphanumeric, underscores, hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
    throw new Error('Invalid GeeksforGeeks username format');
  }

  const url = `https://www.geeksforgeeks.org/user/${encodeURIComponent(sanitizedUsername)}/`;
  console.log('[GFG Scraper] Fetching public profile:', url);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GFG profile not found. Check your username and try again.');
      }
      throw new Error(`Failed to fetch GFG profile (HTTP ${response.status})`);
    }

    const html = await response.text();
    const matches = html.match(/self\.__next_f\.push\((.*?)\)/gs) || [];

    let articleCountData = null;
    let mentorData = null;

    for (const m of matches) {
      if (!articleCountData && (m.includes('articleCount') || m.includes('total_problems_solved'))) {
        const match = m.match(/\\"articleCount\\":(\{.*?\}),\\"userData\\"/);
        if (match) {
          try {
            const unescaped = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            articleCountData = JSON.parse(unescaped);
          } catch (e) {
            console.error('[GFG Scraper] articleCount parse error:', e.message);
          }
        }
      }

      if (!mentorData && m.includes('"mentor":')) {
        const match = m.match(/\\"mentor\\":(\{.*?\}),\\"username\\"/);
        if (match) {
          try {
            const unescaped = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            mentorData = JSON.parse(unescaped);
          } catch (e) {
            console.error('[GFG Scraper] mentor parse error:', e.message);
          }
        }
      }
    }

    if (!articleCountData && !mentorData) {
      throw new Error('GFG profile not found. Check your username and try again.');
    }

    // Parse problem difficulty breakdown if present
    let difficultyStats = {
      school: 0,
      basic: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      total: articleCountData?.total_problems_solved ?? 0
    };

    const diffMatch = html.match(/\"solvedStats\":(\{.*?\})/);
    if (diffMatch) {
      try {
        const parsedDiff = JSON.parse(diffMatch[1]);
        difficultyStats.school = parsedDiff.school?.count || 0;
        difficultyStats.basic = parsedDiff.basic?.count || 0;
        difficultyStats.easy = parsedDiff.easy?.count || 0;
        difficultyStats.medium = parsedDiff.medium?.count || 0;
        difficultyStats.hard = parsedDiff.hard?.count || 0;
      } catch (e) {
        /* ignore */
      }
    }

    const currentStreak = articleCountData?.pod_solved_current_streak ?? 0;

    return {
      platform: 'gfg',
      username: sanitizedUsername,
      profileUrl: `https://www.geeksforgeeks.org/user/${encodeURIComponent(sanitizedUsername)}/`,
      profile: {
        displayName: articleCountData?.name || mentorData?.name || sanitizedUsername,
        avatar: articleCountData?.profile_image_url || mentorData?.profile_image_url || null,
        codingScore: articleCountData?.score ?? 0,
        monthlyScore: articleCountData?.monthly_score ?? 0,
        problemsSolved: articleCountData?.total_problems_solved ?? 0,
        instituteName: articleCountData?.institute_name || mentorData?.school_info?.[0]?.institution_name || null,
        instituteRank: articleCountData?.institute_rank || null,
        articlesPublished: articleCountData?.total_articles_published ?? 0,
      },
      potd: {
        currentStreak: currentStreak,
        longestStreak: articleCountData?.pod_solved_longest_streak ?? 0,
        globalLongestStreak: articleCountData?.pod_solved_global_longest_streak ?? 0,
        totalSolved: articleCountData?.pod_correct_submissions_count ?? 0,
        currentStreakInclTimeMachine: articleCountData?.pod_solved_current_streak_incl_timemachine ?? 0,
        todaySolved: currentStreak > 0,
      },
      problems: difficultyStats,
    };
  } catch (error) {
    console.error('[GFG Scraper] Error:', error.message);
    throw error;
  }
}

// Validate GFG username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const data = await fetchGfgPublicProfile(username);
    
    res.json({
      valid: true,
      username: data.username,
      displayName: data.profile.displayName,
      avatar: data.profile.avatar,
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

    const data = await fetchGfgPublicProfile(username);
    
    const connData = {
      username: data.username,
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      profile: data.profile,
      potd: data.potd,
    };

    console.log('[GFG Connect] Saving connection for uid:', uid, 'username:', data.username);

    const database = db || global.db;
    if (database && database.collection) {
      try {
        await database.collection('users').doc(uid).set({
          connections: {
            gfg: connData,
          },
          'connections.gfg': connData,
        }, { merge: true });
      } catch (err) {
        console.warn('[GFG Connect] Firestore save notice:', err.message);
      }
    }

    res.json({ success: true, username: data.username, data: connData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync GFG data
router.post('/sync', async (req, res) => {
  try {
    const { uid, username: providedUsername } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const database = db || global.db;
    let username = providedUsername;

    if (!username && database && database.collection) {
      try {
        const userDoc = await database.collection('users').doc(uid).get();
        const userData = userDoc.data() || {};
        const gfgConn = userData?.connections?.gfg || userData?.['connections.gfg'];
        if (gfgConn?.username) {
          username = gfgConn.username;
        }
      } catch (err) {
        console.warn('[GFG Sync] Lookup warning:', err.message);
      }
    }

    if (!username) {
      return res.json({ success: true, syncedAt: new Date().toISOString() });
    }
    
    // Fetch comprehensive GFG data
    const data = await fetchGfgPublicProfile(username).catch(() => ({ profile: {}, potd: {}, problems: {} }));
    
    const connData = {
      username,
      connected: true,
      lastSynced: new Date().toISOString(),
      profile: data.profile,
      potd: data.potd,
    };

    const cachedObj = {
      profile: data.profile,
      potd: data.potd,
      problems: data.problems,
      stats: data.problems,
    };

    if (database && database.collection) {
      try {
        await database.collection('users').doc(uid).set({
          connections: {
            gfg: connData,
          },
          'connections.gfg': connData,
          'connections.gfg.lastSynced': new Date().toISOString(),
          cachedData: {
            gfg: cachedObj,
          },
          'cachedData.gfg': cachedObj,
        }, { merge: true });
      } catch (err) {
        console.warn('[GFG Sync] Save warning:', err.message);
      }
    }

    res.json({ success: true, syncedAt: new Date().toISOString(), data: cachedObj });
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

    const database = db || global.db;
    if (database && database.collection) {
      try {
        await database.collection('users').doc(uid).set({
          'connections.gfg.connected': false,
          'connections.gfg.disconnectedAt': new Date().toISOString(),
          'connections.gfg.username': null,
          'cachedData.gfg': null,
        }, { merge: true });
      } catch (err) {
        console.warn('[GFG Disconnect] Warning:', err.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
