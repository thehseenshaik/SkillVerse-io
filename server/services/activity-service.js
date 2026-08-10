/**
 * Activity Normalizer & Aggregator Service
 * Extracts real activity events from connected platform data,
 * normalizes them into a unified schema, deduplicates them using stable IDs,
 * and sorts them chronologically (newest first).
 */

function extractGitHubActivities(githubData, uid) {
  if (!githubData) return [];
  const activities = [];
  const profile = githubData.profile || {};
  const repos = Array.isArray(githubData.repositories) ? githubData.repositories : [];
  const events = Array.isArray(githubData.recentActivity) ? githubData.recentActivity : [];

  // Extract from events
  events.forEach((evt) => {
    if (!evt || !evt.createdAt) return;
    const timestamp = new Date(evt.createdAt).toISOString();
    const repoName = evt.repo ? evt.repo.replace(/^[^/]+\//, '') : 'Repository';
    const fullRepo = evt.repo || '';

    let type = 'push';
    let title = `Pushed updates to ${repoName}`;
    let desc = fullRepo;

    switch (evt.type) {
      case 'PushEvent':
        type = 'push';
        title = `Pushed commits to ${repoName}`;
        break;
      case 'CreateEvent':
        type = 'repo_create';
        title = `Created repository ${repoName}`;
        break;
      case 'PullRequestEvent':
        type = 'pull_request';
        title = `Opened pull request in ${repoName}`;
        break;
      case 'IssuesEvent':
        type = 'issue';
        title = `Activity on issue in ${repoName}`;
        break;
      case 'WatchEvent':
        type = 'badge_earned';
        title = `Starred repository ${repoName}`;
        break;
      case 'ForkEvent':
        type = 'repo_create';
        title = `Forked repository ${repoName}`;
        break;
      default:
        type = 'push';
        title = `Activity on ${repoName}`;
    }

    const id = `github-${evt.type || 'event'}-${fullRepo.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${new Date(timestamp).getTime()}`;

    activities.push({
      id,
      userId: uid,
      platform: 'github',
      activityType: type,
      title,
      description: desc,
      url: fullRepo ? `https://github.com/${fullRepo}` : (profile.profileUrl || null),
      timestamp,
      syncedAt: new Date().toISOString(),
      metadata: { rawType: evt.type, repo: fullRepo },
    });
  });

  // If no events found, extract from top repositories
  if (activities.length === 0 && repos.length > 0) {
    repos.slice(0, 5).forEach((repo) => {
      if (!repo || !repo.name) return;
      const timestamp = repo.updatedAt || repo.createdAt || new Date().toISOString();
      const id = `github-repo-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${new Date(timestamp).getTime()}`;

      activities.push({
        id,
        userId: uid,
        platform: 'github',
        activityType: 'repo_create',
        title: `Updated repository ${repo.name}`,
        description: repo.description || (repo.language ? `Primary language: ${repo.language}` : 'GitHub repository'),
        url: repo.url || `https://github.com/${profile.displayName || 'user'}/${repo.name}`,
        timestamp,
        syncedAt: new Date().toISOString(),
        metadata: { language: repo.language, stars: repo.stars },
      });
    });
  }

  return activities;
}

function extractLeetCodeActivities(leetcodeData, uid) {
  if (!leetcodeData) return [];
  const activities = [];
  const submissions = Array.isArray(leetcodeData.recentSubmissions) ? leetcodeData.recentSubmissions : [];
  const stats = leetcodeData.stats || {};
  const profile = leetcodeData.profile || {};

  submissions.forEach((sub) => {
    if (!sub || !sub.title || !sub.timestamp) return;
    const tsNumber = typeof sub.timestamp === 'number' 
      ? (sub.timestamp > 1e11 ? sub.timestamp : sub.timestamp * 1000)
      : new Date(sub.timestamp).getTime();
    const timestamp = new Date(tsNumber).toISOString();
    const isAccepted = sub.status === 'Accepted' || sub.status === '10' || sub.status === 'AC';
    const slug = sub.titleSlug || sub.title.toLowerCase().replace(/\s+/g, '-');

    const id = `leetcode-${slug}-${tsNumber}`;

    activities.push({
      id,
      userId: uid,
      platform: 'leetcode',
      activityType: isAccepted ? 'problem_solved' : 'submission',
      title: isAccepted ? `Solved "${sub.title}"` : `Submitted "${sub.title}" (${sub.status || 'Attempted'})`,
      description: sub.language ? `Language: ${sub.language}` : 'LeetCode Coding Problem',
      url: `https://leetcode.com/problems/${slug}`,
      timestamp,
      syncedAt: new Date().toISOString(),
      metadata: { status: sub.status, language: sub.language },
    });
  });

  // Fallback if no recent submissions but total solved exists
  if (activities.length === 0 && (leetcodeData.totalSolved || stats.All)) {
    const total = leetcodeData.totalSolved || stats.All || 0;
    const timestamp = leetcodeData.lastSynced || new Date().toISOString();
    activities.push({
      id: `leetcode-summary-${uid}-${total}`,
      userId: uid,
      platform: 'leetcode',
      activityType: 'problem_solved',
      title: `Solved ${total} problems on LeetCode`,
      description: `Easy: ${stats.Easy || 0} · Medium: ${stats.Medium || 0} · Hard: ${stats.Hard || 0}`,
      url: `https://leetcode.com/${profile.displayName || ''}`,
      timestamp,
      syncedAt: new Date().toISOString(),
      metadata: { totalSolved: total },
    });
  }

  return activities;
}

function extractGFGActivities(gfgData, uid) {
  if (!gfgData) return [];
  const activities = [];
  const potd = gfgData.potd || {};
  const profile = gfgData.profile || {};
  const problems = gfgData.problems || {};

  const nowTs = new Date().toISOString();

  if (potd.todaySolved) {
    activities.push({
      id: `gfg-potd-today-${new Date().toISOString().slice(0, 10)}`,
      userId: uid,
      platform: 'gfg',
      activityType: 'problem_solved',
      title: 'Completed Problem of the Day',
      description: 'GeeksforGeeks POTD daily challenge',
      url: 'https://www.geeksforgeeks.org/problem-of-the-day',
      timestamp: nowTs,
      syncedAt: nowTs,
      metadata: { currentStreak: potd.currentStreak },
    });
  }

  if (potd.currentStreak && potd.currentStreak > 0) {
    activities.push({
      id: `gfg-streak-${potd.currentStreak}`,
      userId: uid,
      platform: 'gfg',
      activityType: 'streak_milestone',
      title: `Achieved ${potd.currentStreak}-Day Streak`,
      description: `Current POTD streak on GeeksforGeeks (Longest: ${potd.longestStreak || potd.currentStreak} days)`,
      url: 'https://www.geeksforgeeks.org/problem-of-the-day',
      timestamp: nowTs,
      syncedAt: nowTs,
      metadata: { streak: potd.currentStreak },
    });
  }

  if (profile.problemsSolved || profile.codingScore || problems.total) {
    const total = profile.problemsSolved || problems.total || 0;
    const score = profile.codingScore || 0;
    activities.push({
      id: `gfg-summary-${total}-${score}`,
      userId: uid,
      platform: 'gfg',
      activityType: 'problem_solved',
      title: `Solved ${total} problems on GeeksforGeeks`,
      description: `Coding Score: ${score} · Institute Rank: ${profile.instituteRank || 'N/A'}`,
      url: profile.displayName ? `https://www.geeksforgeeks.org/user/${profile.displayName}` : 'https://www.geeksforgeeks.org',
      timestamp: nowTs,
      syncedAt: nowTs,
      metadata: { totalSolved: total, codingScore: score },
    });
  }

  return activities;
}

function extractCodeforcesActivities(codeforcesData, uid) {
  if (!codeforcesData) return [];
  const activities = [];
  const ratingHistory = Array.isArray(codeforcesData.ratingHistory) ? codeforcesData.ratingHistory : [];
  const profile = codeforcesData.profile || {};

  ratingHistory.slice(-5).forEach((item) => {
    if (!item || !item.contestName) return;
    const tsNumber = item.ratingUpdateTimeSeconds ? item.ratingUpdateTimeSeconds * 1000 : Date.now();
    const timestamp = new Date(tsNumber).toISOString();

    const ratingDiff = (item.newRating || 0) - (item.oldRating || 0);
    const diffText = ratingDiff >= 0 ? `+${ratingDiff}` : `${ratingDiff}`;

    activities.push({
      id: `codeforces-contest-${item.contestId || tsNumber}`,
      userId: uid,
      platform: 'codeforces',
      activityType: 'contest',
      title: `Participated in ${item.contestName}`,
      description: `Ranked #${item.rank || 'N/A'} (Rating: ${item.oldRating || 0} → ${item.newRating || 0} [${diffText}])`,
      url: item.contestId ? `https://codeforces.com/contest/${item.contestId}` : 'https://codeforces.com',
      timestamp,
      syncedAt: new Date().toISOString(),
      metadata: { contestId: item.contestId, rank: item.rank, ratingChange: ratingDiff },
    });
  });

  if (activities.length === 0 && profile.rating) {
    const timestamp = new Date().toISOString();
    activities.push({
      id: `codeforces-rating-${profile.rating}`,
      userId: uid,
      platform: 'codeforces',
      activityType: 'rating_change',
      title: `Codeforces Rating: ${profile.rating} (${profile.rank || 'Unrated'})`,
      description: `Max Rating: ${profile.maxRating || profile.rating} · Contribution: ${profile.contribution || 0}`,
      url: profile.displayName ? `https://codeforces.com/profile/${profile.displayName}` : 'https://codeforces.com',
      timestamp,
      syncedAt: timestamp,
      metadata: { rating: profile.rating, rank: profile.rank },
    });
  }

  return activities;
}

function extractCodeChefActivities(codechefData, uid) {
  if (!codechefData) return [];
  const profile = codechefData.profile || {};
  if (!profile.currentRating && !profile.globalRank && !profile.stars) return [];

  const timestamp = new Date().toISOString();
  return [{
    id: `codechef-summary-${profile.currentRating || 0}-${profile.globalRank || 0}`,
    userId: uid,
    platform: 'codechef',
    activityType: 'rating_change',
    title: `CodeChef Rating: ${profile.currentRating || 0} (${profile.stars || '1★'})`,
    description: `Global Rank: #${profile.globalRank || 'N/A'} · Highest Rating: ${profile.highestRating || profile.currentRating || 0}`,
    url: profile.displayName ? `https://www.codechef.com/users/${profile.displayName}` : 'https://www.codechef.com',
    timestamp,
    syncedAt: timestamp,
    metadata: { rating: profile.currentRating, rank: profile.globalRank },
  }];
}

function extractHackerRankActivities(hackerrankData, uid) {
  if (!hackerrankData) return [];
  const profile = hackerrankData.profile || {};
  const stats = hackerrankData.stats || {};
  if (!profile.displayName && !stats.badgeCount) return [];

  const timestamp = new Date().toISOString();
  return [{
    id: `hackerrank-summary-${profile.displayName || uid}`,
    userId: uid,
    platform: 'hackerrank',
    activityType: 'badge_earned',
    title: `Active HackerRank Developer Profile`,
    description: profile.badgeCount ? `Earned ${profile.badgeCount} badges on HackerRank` : 'HackerRank Connected',
    url: profile.displayName ? `https://www.hackerrank.com/profile/${profile.displayName}` : 'https://www.hackerrank.com',
    timestamp,
    syncedAt: timestamp,
    metadata: { badgeCount: profile.badgeCount },
  }];
}

/**
 * Normalizes all connected platform activities for a user,
 * deduplicates them by ID, and sorts chronologically (newest first).
 */
function normalizeUserActivities(userData, uid) {
  if (!userData) return [];

  const cachedData = userData.cachedData || {};
  const connections = userData.connections || {};

  const allActivities = [];

  if (connections.github?.connected || cachedData.github) {
    allActivities.push(...extractGitHubActivities(cachedData.github || userData.github, uid));
  }

  if (connections.leetcode?.connected || cachedData.leetcode) {
    allActivities.push(...extractLeetCodeActivities(cachedData.leetcode || userData.leetcode, uid));
  }

  if (connections.gfg?.connected || cachedData.gfg) {
    allActivities.push(...extractGFGActivities(cachedData.gfg || userData.gfg, uid));
  }

  if (connections.codeforces?.connected || cachedData.codeforces) {
    allActivities.push(...extractCodeforcesActivities(cachedData.codeforces || userData.codeforces, uid));
  }

  if (connections.codechef?.connected || cachedData.codechef) {
    allActivities.push(...extractCodeChefActivities(cachedData.codechef || userData.codechef, uid));
  }

  if (connections.hackerrank?.connected || cachedData.hackerrank) {
    allActivities.push(...extractHackerRankActivities(cachedData.hackerrank || userData.hackerrank, uid));
  }

  // Deduplicate by ID
  const seenIds = new Set();
  const uniqueActivities = [];

  allActivities.forEach((act) => {
    if (!act || !act.id) return;
    if (!seenIds.has(act.id)) {
      seenIds.add(act.id);
      uniqueActivities.push(act);
    }
  });

  // Sort newest to oldest
  uniqueActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return uniqueActivities;
}

module.exports = {
  normalizeUserActivities,
  extractGitHubActivities,
  extractLeetCodeActivities,
  extractGFGActivities,
  extractCodeforcesActivities,
  extractCodeChefActivities,
  extractHackerRankActivities,
};
