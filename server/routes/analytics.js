const express = require('express');
const router = express.Router();
const { db } = require('../index');

// Get analytics data
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

    const cachedData = userData.cachedData || {};
    const analytics = {
      github: null,
      leetcode: null,
      combined: null,
    };

    // GitHub analytics
    if (cachedData.github && cachedData.github.profile) {
      const github = cachedData.github;
      const profile = github.profile || {};
      const repositories = github.repositories || [];
      const recentActivity = github.recentActivity || [];
      const languages = github.languages || {};

      analytics.github = {
        contributionData: generateContributionData(recentActivity),
        repositoryGrowth: repositories.map(repo => ({
          name: repo.name,
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          createdAt: repo.createdAt,
        })),
        languageDistribution: Object.entries(languages).map(([lang, count]) => ({
          language: lang,
          count,
          percentage: repositories.length > 0 ? ((count / repositories.length) * 100).toFixed(1) : 0,
        })),
        topLanguages: Object.entries(languages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([lang, count]) => ({ language: lang, count })),
        followers: profile.followers || 0,
        following: profile.following || 0,
        totalStars: repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0),
        totalForks: repositories.reduce((sum, repo) => sum + (repo.forks || 0), 0),
        contributionScore: calculateContributionScore({ ...github, repositories, recentActivity }),
        developerScore: calculateDeveloperScore({ ...github, repositories, languages }),
      };
    }

    // LeetCode analytics
    if (cachedData.leetcode && cachedData.leetcode.stats) {
      const leetcode = cachedData.leetcode;
      const stats = leetcode.stats || { Easy: 0, Medium: 0, Hard: 0, All: 0 };
      const contest = leetcode.contest || { rating: 0, globalRanking: 0, attendedContestsCount: 0, topPercentage: 0 };
      const recentSubmissions = leetcode.recentSubmissions || [];
      const badges = leetcode.badges || [];

      analytics.leetcode = {
        difficultyDistribution: [
          { difficulty: 'Easy', count: stats.Easy || 0 },
          { difficulty: 'Medium', count: stats.Medium || 0 },
          { difficulty: 'Hard', count: stats.Hard || 0 },
        ],
        acceptanceRate: leetcode.acceptanceRate || 0,
        contestData: {
          rating: contest.rating || 0,
          ranking: contest.globalRanking || 0,
          attendedContests: contest.attendedContestsCount || 0,
          topPercentage: contest.topPercentage || 0,
        },
        submissionTimeline: generateSubmissionTimeline(recentSubmissions),
        dailyStreak: calculateDailyStreak(recentSubmissions),
        monthlyActivity: calculateMonthlyActivity(recentSubmissions),
        consistencyScore: calculateConsistencyScore({ ...leetcode, stats, contest, recentSubmissions }),
        codingScore: calculateCodingScore({ ...leetcode, stats, contest }),
        badges: badges,
      };
    }

    // Combined analytics
    if (analytics.github && analytics.leetcode) {
      analytics.combined = {
        careerReadiness: calculateCareerReadiness(analytics.github, analytics.leetcode),
        activityScore: (analytics.github.contributionScore + analytics.leetcode.consistencyScore) / 2,
        learningProgress: calculateLearningProgress(analytics.github, analytics.leetcode),
        profileStrength: calculateProfileStrength(analytics.github, analytics.leetcode),
      };
    }

    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
function generateContributionData(activity) {
  // Convert recent activity to contribution data
  return activity.map(event => ({
    date: event.createdAt,
    type: event.type,
    repo: event.repo,
  }));
}

function calculateContributionScore(github) {
  const baseScore = github.recentActivity.length * 5;
  const repoBonus = github.repositories.length * 2;
  const starBonus = github.repositories.reduce((sum, repo) => sum + repo.stars, 0) * 0.5;
  return Math.min(baseScore + repoBonus + starBonus, 100);
}

function calculateDeveloperScore(github) {
  const languageDiversity = Object.keys(github.languages).length * 5;
  const repoQuality = github.repositories.filter(r => r.description).length * 3;
  const activityLevel = github.recentActivity.length * 2;
  return Math.min(languageDiversity + repoQuality + activityLevel, 100);
}

function generateSubmissionTimeline(submissions) {
  return submissions.map(sub => ({
    date: new Date(sub.timestamp),
    status: sub.status,
    difficulty: sub.title, // Would need to fetch problem details
  }));
}

function calculateDailyStreak(submissions) {
  if (!submissions.length) return 0;
  const dates = submissions.map(s => new Date(s.timestamp).toDateString());
  const uniqueDates = [...new Set(dates)];
  return uniqueDates.length;
}

function calculateMonthlyActivity(submissions) {
  const monthly = {};
  submissions.forEach(sub => {
    const date = new Date(sub.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });
  return monthly;
}

function calculateConsistencyScore(leetcode) {
  const recentSubmissions = leetcode.recentSubmissions || [];
  const contest = leetcode.contest || { attendedContestsCount: 0 };
  const acceptanceRate = leetcode.acceptanceRate || 0;
  
  const streakBonus = calculateDailyStreak(recentSubmissions) * 3;
  const acceptanceBonus = acceptanceRate * 0.5;
  const contestBonus = contest.attendedContestsCount * 2;
  return Math.min(streakBonus + acceptanceBonus + contestBonus, 100);
}

function calculateCodingScore(leetcode) {
  const stats = leetcode.stats || { All: 0, Hard: 0, Medium: 0, Easy: 0 };
  const contest = leetcode.contest || { rating: 0 };
  
  const solvedBonus = stats.All * 0.3;
  const difficultyBonus = (stats.Hard * 3 + stats.Medium * 2 + stats.Easy) * 0.2;
  const contestBonus = contest.rating * 0.1;
  return Math.min(solvedBonus + difficultyBonus + contestBonus, 100);
}

function calculateCareerReadiness(github, leetcode) {
  const githubScore = github.developerScore;
  const leetcodeScore = leetcode.codingScore;
  return (githubScore + leetcodeScore) / 2;
}

function calculateLearningProgress(github, leetcode) {
  const stats = leetcode.stats || { All: 0 };
  const repositories = github.repositories || [];
  
  const totalProblems = stats.All;
  const totalRepos = repositories.length;
  const progressScore = (totalProblems * 2 + totalRepos * 5);
  return Math.min(progressScore, 100);
}

function calculateProfileStrength(github, leetcode) {
  const profile = github.profile || { followers: 0 };
  const contest = leetcode.contest || { rating: 0 };
  
  const githubStrength = profile.followers > 10 ? 50 : profile.followers * 5;
  const leetcodeStrength = contest.rating > 1500 ? 50 : contest.rating / 30;
  return Math.min(githubStrength + leetcodeStrength, 100);
}

module.exports = router;
