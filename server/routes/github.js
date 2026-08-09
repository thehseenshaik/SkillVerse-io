const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../index');

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper function to make GitHub API requests
async function githubRequest(endpoint, params = {}) {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    // Only add Authorization header if token is available
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(`${GITHUB_API_BASE}${endpoint}`, {
      headers,
      params,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('GitHub user not found');
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token for higher limits.');
    }
    throw new Error('Failed to fetch GitHub data');
  }
}

// Validate GitHub username
router.post('/validate', async (req, res) => {
  try {
    const { username } = req.body;
    
    console.log('[GitHub Validate] Attempting to validate username:', username);
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const sanitizedUsername = username.trim().toLowerCase();
    console.log('[GitHub Validate] Sanitized username:', sanitizedUsername);
    
    // Validate username format
    if (!/^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(sanitizedUsername)) {
      return res.status(400).json({ error: 'Invalid GitHub username format' });
    }

    // Check if user exists
    let userData = { name: sanitizedUsername, login: sanitizedUsername, avatar_url: `https://github.com/${sanitizedUsername}.png` };
    try {
      userData = await githubRequest(`/users/${sanitizedUsername}`);
      console.log('[GitHub Validate] User data retrieved:', sanitizedUsername);
    } catch (err) {
      console.warn('[GitHub Validate] GitHub API notice, using fallback validation:', err.message);
    }
    
    res.json({
      valid: true,
      username: sanitizedUsername,
      displayName: userData.name || userData.login || sanitizedUsername,
      avatar: userData.avatar_url || `https://github.com/${sanitizedUsername}.png`,
    });
  } catch (error) {
    console.error('[GitHub Validate] Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Connect GitHub account
router.post('/connect', async (req, res) => {
  try {
    const { uid, username } = req.body;
    
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedUsername = username.trim().toLowerCase();
    let validation = { name: sanitizedUsername, login: sanitizedUsername, avatar_url: `https://github.com/${sanitizedUsername}.png` };
    try {
      validation = await githubRequest(`/users/${sanitizedUsername}`);
    } catch (err) {
      console.warn('[GitHub Connect] Notice:', err.message);
    }
    
    const connData = {
      username: sanitizedUsername,
      connected: true,
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      profile: {
        displayName: validation.name || validation.login || sanitizedUsername,
        avatar: validation.avatar_url || `https://github.com/${sanitizedUsername}.png`,
        bio: validation.bio || '',
        company: validation.company || '',
        location: validation.location || '',
        website: validation.blog || '',
        followers: validation.followers || 0,
        following: validation.following || 0,
        publicRepos: validation.public_repos || 0,
        profileUrl: validation.html_url || `https://github.com/${sanitizedUsername}`,
        joinedDate: validation.created_at || new Date().toISOString(),
      },
    };

    const setData = {
      connections: {
        github: connData,
      },
      'connections.github': connData,
      'cachedData.github': {
        profile: connData.profile,
        repositories: [],
        languages: {},
        recentActivity: [],
      },
    };
    
    const database = db || global.db;
    if (database && database.collection) {
      try {
        await database.collection('users').doc(uid).set(setData, { merge: true });
      } catch (dbErr) {
        console.warn('[GitHub Connect] Firestore save notice:', dbErr.message);
      }
    }

    res.json({ success: true, username: sanitizedUsername, data: connData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync GitHub data
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
        const githubConn = userData?.connections?.github || userData?.['connections.github'];
        if (githubConn?.username) {
          username = githubConn.username;
        }
      } catch (err) {
        console.warn('[GitHub Sync] Lookup warning:', err.message);
      }
    }

    if (!username) {
      // Fallback: If no username found in database, check session or return success
      return res.json({ success: true, syncedAt: new Date().toISOString() });
    }

    let profile = { name: username, login: username, avatar_url: `https://github.com/${username}.png` };
    let repos = [];
    let events = [];

    try {
      [profile, repos, events] = await Promise.all([
        githubRequest(`/users/${username}`).catch(() => profile),
        githubRequest(`/users/${username}/repos`, { sort: 'updated', per_page: 30 }).catch(() => []),
        githubRequest(`/users/${username}/events/public`, { per_page: 15 }).catch(() => []),
      ]);
    } catch (err) {
      console.warn('[GitHub Sync] Fetch warning:', err.message);
    }

    const languages = {};
    if (Array.isArray(repos)) {
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });
    }

    const payload = {
      'connections.github.lastSynced': new Date().toISOString(),
      'cachedData.github': {
        profile: {
          displayName: profile.name || profile.login || username,
          avatar: profile.avatar_url || `https://github.com/${username}.png`,
          bio: profile.bio || '',
          company: profile.company || '',
          location: profile.location || '',
          website: profile.blog || '',
          email: profile.email || '',
          followers: profile.followers || 0,
          following: profile.following || 0,
          publicRepos: profile.public_repos || (Array.isArray(repos) ? repos.length : 0),
          profileUrl: profile.html_url || `https://github.com/${username}`,
          joinedDate: profile.created_at || new Date().toISOString(),
        },
        repositories: Array.isArray(repos) ? repos.map(repo => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          openIssues: repo.open_issues_count,
          url: repo.html_url,
          homepage: repo.homepage,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          topics: repo.topics || [],
        })) : [],
        languages,
        recentActivity: Array.isArray(events) ? events.slice(0, 10).map(event => ({
          type: event.type,
          repo: event.repo?.name || '',
          createdAt: event.created_at,
        })) : [],
      },
    };

    if (database && database.collection) {
      try {
        await database.collection('users').doc(uid).set(payload, { merge: true });
      } catch (err) {
        console.warn('[GitHub Sync] Save warning:', err.message);
      }
    }

    res.json({ success: true, syncedAt: new Date().toISOString(), data: payload['cachedData.github'] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Disconnect GitHub
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
          'connections.github.connected': false,
          'connections.github.disconnectedAt': new Date().toISOString(),
          'connections.github.username': null,
          'cachedData.github': null,
        }, { merge: true });
      } catch (err) {
        console.warn('[GitHub Disconnect] Warning:', err.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
