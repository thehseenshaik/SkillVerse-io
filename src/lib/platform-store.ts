import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createNotification } from './services/notification-service';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';

interface PlatformConnection {
  connected: boolean;
  username: string | null;
  lastSynced: string | null;
  connectedAt: string | null;
}

interface GitHubProfile {
  displayName: string;
  avatar: string;
  bio: string;
  company: string;
  location: string;
  website: string;
  email: string;
  followers: number;
  following: number;
  publicRepos: number;
  profileUrl: string;
  joinedDate: string;
}

interface GitHubRepository {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  url: string;
  homepage: string;
  createdAt: string;
  updatedAt: string;
  topics: string[];
}

interface GitHubData {
  profile: GitHubProfile;
  repositories: GitHubRepository[];
  languages: Record<string, number>;
  recentActivity: Array<{
    type: string;
    repo: string;
    createdAt: string;
  }>;
}

interface LeetCodeProfile {
  displayName: string;
  avatar: string;
  bio: string;
  country: string;
  company: string;
  school: string;
  websites: string[];
  ranking: number;
  reputation: number;
}

interface LeetCodeStats {
  Easy: number;
  Medium: number;
  Hard: number;
  All: number;
}

interface LeetCodeContest {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
}

interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  status: string;
  language: string;
  timestamp: number;
}

interface LeetCodeBadge {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
}

interface GFGPOTD {
  currentStreak: number;
  longestStreak: number;
  globalLongestStreak: number;
  totalSolved: number;
  currentStreakInclTimeMachine: number;
  todaySolved: boolean;
}

interface GFGProfile {
  displayName: string;
  avatar: string | null;
  codingScore: number;
  monthlyScore: number;
  problemsSolved: number;
  instituteName: string | null;
  instituteRank: string | null;
  articlesPublished: number;
}

interface GFGStats {
  school: number;
  basic: number;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

interface GFGQuestion {
  question: string;
  questionUrl: string;
}

interface GFGData {
  profile: GFGProfile;
  potd: GFGPOTD;
  problems: GFGStats;
  stats?: GFGStats;
}

interface LeetCodeData {
  profile: LeetCodeProfile;
  stats: LeetCodeStats;
  acceptanceRate: number;
  contest: LeetCodeContest;
  recentSubmissions: LeetCodeSubmission[];
  badges: LeetCodeBadge[];
}

interface CombinedMetrics {
  codingScore: number;
  careerScore: number;
  activityScore: number;
  consistencyScore: number;
  resumeReadiness: number;
  profileStrength: number;
}

interface PlatformStore {
  // Connection states
  github: PlatformConnection;
  leetcode: PlatformConnection;
  gfg: PlatformConnection;
  codeforces: PlatformConnection;
  codechef: PlatformConnection;
  hackerrank: PlatformConnection;
  linkedin: PlatformConnection;

  // Cached data
  githubData: GitHubData | null;
  leetcodeData: LeetCodeData | null;
  gfgData: GFGData | null;
  codeforcesData: CodeforcesData | null;
  codechefData: CodeChefData | null;
  hackerrankData: HackerRankData | null;
  linkedinData: any | null;

  // Combined metrics
  combinedMetrics: CombinedMetrics | null;

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  validateGitHubUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string }>;
  connectGitHub: (uid: string, username: string) => Promise<void>;
  syncGitHub: (uid: string) => Promise<void>;
  disconnectGitHub: (uid: string) => Promise<void>;

  validateLeetCodeUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string }>;
  connectLeetCode: (uid: string, username: string) => Promise<void>;
  syncLeetCode: (uid: string) => Promise<void>;
  disconnectLeetCode: (uid: string) => Promise<void>;

  validateGFGUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string | null }>;
  connectGFG: (uid: string, username: string) => Promise<void>;
  syncGFG: (uid: string) => Promise<void>;
  disconnectGFG: (uid: string) => Promise<void>;

  validateCodeforcesUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string | null }>;
  connectCodeforces: (uid: string, username: string) => Promise<void>;
  syncCodeforces: (uid: string) => Promise<void>;
  disconnectCodeforces: (uid: string) => Promise<void>;

  validateCodeChefUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string | null }>;
  connectCodeChef: (uid: string, username: string) => Promise<void>;
  syncCodeChef: (uid: string) => Promise<void>;
  disconnectCodeChef: (uid: string) => Promise<void>;

  validateHackerRankUsername: (username: string) => Promise<{ valid: boolean; username: string; displayName: string; avatar: string | null }>;
  connectHackerRank: (uid: string, username: string) => Promise<void>;
  syncHackerRank: (uid: string) => Promise<void>;
  disconnectHackerRank: (uid: string) => Promise<void>;

  connectLinkedIn: (uid: string, username: string) => Promise<void>;
  syncLinkedIn: (uid: string) => Promise<void>;
  disconnectLinkedIn: (uid: string) => Promise<void>;

  fetchDashboardData: (uid: string) => Promise<void>;
  fetchAnalyticsData: (uid: string) => Promise<any>;

  clearError: () => void;
  reset: () => void;
}

const initialState = {
  github: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  leetcode: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  gfg: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  codeforces: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  codechef: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  hackerrank: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  linkedin: {
    connected: false,
    username: null,
    lastSynced: null,
    connectedAt: null,
  },
  githubData: null,
  leetcodeData: null,
  gfgData: null,
  codeforcesData: null,
  codechefData: null,
  hackerrankData: null,
  linkedinData: null,
  combinedMetrics: null,
  isLoading: false,
  isSyncing: false,
  error: null,
};

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      validateGitHubUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/github/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectGitHub: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[Platform Store] Connecting GitHub for user:', uid, 'username:', username);
          
          const response = await fetch(`${API_BASE}/api/github/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          console.log('[Platform Store] GitHub connect response status:', response.status);
          
          if (!response.ok) {
            const error = await response.json();
            console.error('[Platform Store] GitHub connect error:', error);
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          console.log('[Platform Store] GitHub connect success:', data);
          
          const profileObj = data.profile || data.data?.profile || {
            displayName: username,
            avatar: `https://github.com/${username}.png`,
            bio: '',
            company: '',
            location: '',
            website: '',
            email: '',
            followers: 0,
            following: 0,
            publicRepos: 0,
            profileUrl: `https://github.com/${username}`,
            joinedDate: new Date().toISOString(),
          };

          const fullGithubData = {
            profile: profileObj,
            repositories: data.data?.repositories || [],
            languages: data.data?.languages || {},
            recentActivity: data.data?.recentActivity || [],
          };

          set({
            isLoading: false,
            github: {
              connected: true,
              username: data.username || username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            githubData: fullGithubData,
          });
          
          // Trigger sync to fetch full public repo and commit details
          if (uid) {
            createNotification(uid, {
              type: "connection",
              title: "GitHub connected successfully",
              message: "Your GitHub profile has been connected to SkillVerse.",
              metadata: { platform: "github", username },
              idempotencyKey: `conn_github_${uid}_${username}`,
            }).catch(() => {});
            get().syncGitHub(uid).catch(() => {});
          }
        } catch (error) {
          console.error('[Platform Store] GitHub connect exception:', error);
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncGitHub: async (uid: string) => {
        set({ isSyncing: true, error: null });
        try {
          const currentUsername = get().github.username;
          const response = await fetch(`${API_BASE}/api/github/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: currentUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          const data = await response.json();
          if (data.data) {
            set({ githubData: data.data });
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });

          if (uid) {
            createNotification(uid, {
              type: "sync",
              title: "Profile synced",
              message: "Your GitHub profile has been synced successfully.",
              metadata: { platform: "github" },
              idempotencyKey: `sync_github_${uid}_${Math.floor(Date.now() / 300000)}`,
            }).catch(() => {});
          }
        } catch (error) {
          set({ isSyncing: false });
          if (uid) {
            createNotification(uid, {
              type: "sync_failure",
              title: "Sync failed",
              message: "We couldn't sync your GitHub profile. Try again.",
              metadata: { platform: "github" },
            }).catch(() => {});
          }
        }
      },
      
      disconnectGitHub: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/github/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            github: initialState.github,
            githubData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },
      
      validateLeetCodeUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/leetcode/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectLeetCode: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const sanitizedUsername = username.trim();
          const response = await fetch(`${API_BASE}/api/leetcode/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: sanitizedUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const result = await response.json();
          const connData = result.data || {};
          const profile = connData.profile || {};
          
          const initialLeetCodeData: LeetCodeData = {
            profile: {
              displayName: profile.displayName || sanitizedUsername,
              avatar: profile.avatar || '',
              bio: profile.bio || '',
              country: profile.country || '',
              company: profile.company || '',
              school: profile.school || '',
              websites: profile.websites || [],
              ranking: profile.ranking || 0,
              reputation: profile.reputation || 0,
            },
            stats: { Easy: 0, Medium: 0, Hard: 0, All: 0 },
            acceptanceRate: 0,
            ranking: profile.ranking || 0,
            totalSolved: 0,
            contest: { rating: 0, globalRanking: 0, totalParticipants: 0, topPercentage: 0, badge: null },
            submissions: [],
            badges: [],
          };

          set({
            isLoading: false,
            leetcode: {
              connected: true,
              username: result.username || sanitizedUsername,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            leetcodeData: get().leetcodeData || initialLeetCodeData,
          });

          if (uid) {
            createNotification(uid, {
              type: "connection",
              title: "LeetCode connected successfully",
              message: "Your LeetCode profile has been connected to SkillVerse.",
              metadata: { platform: "leetcode", username: sanitizedUsername },
              idempotencyKey: `conn_leetcode_${uid}_${sanitizedUsername}`,
            }).catch(() => {});
          }

          await get().syncLeetCode(uid, sanitizedUsername);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncLeetCode: async (uid: string, username?: string) => {
        const targetUsername = username || get().leetcode.username;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/leetcode/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: targetUsername }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              set({
                leetcodeData: result.data,
                leetcode: {
                  ...get().leetcode,
                  connected: true,
                  username: result.username || targetUsername || get().leetcode.username,
                  lastSynced: new Date().toISOString(),
                }
              });
            }
          }
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });

          if (uid) {
            createNotification(uid, {
              type: "sync",
              title: "Profile synced",
              message: "Your LeetCode profile has been synced successfully.",
              metadata: { platform: "leetcode" },
              idempotencyKey: `sync_leetcode_${uid}_${Math.floor(Date.now() / 300000)}`,
            }).catch(() => {});
          }
        } catch (error) {
          set({ isSyncing: false });
          if (uid) {
            createNotification(uid, {
              type: "sync_failure",
              title: "Sync failed",
              message: "We couldn't sync your LeetCode profile. Try again.",
              metadata: { platform: "leetcode" },
            }).catch(() => {});
          }
        }
      },
      
      disconnectLeetCode: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/leetcode/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            leetcode: initialState.leetcode,
            leetcodeData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },
      
      validateGFGUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/gfg/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectGFG: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const sanitizedUsername = username.trim();
          const response = await fetch(`${API_BASE}/api/gfg/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: sanitizedUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const result = await response.json();
          const connData = result.data || {};
          const profile = connData.profile || {};
          const potd = connData.potd || {};
          
          const initialGfgData: GFGData = {
            profile: {
              displayName: profile.displayName || sanitizedUsername,
              avatar: profile.avatar || null,
              instituteName: profile.instituteName || null,
              instituteRank: profile.instituteRank || null,
              codingScore: profile.codingScore || 0,
              monthlyScore: profile.monthlyScore || 0,
              problemsSolved: profile.problemsSolved || 0,
              articlesPublished: profile.articlesPublished || 0,
            },
            potd: {
              currentStreak: potd.currentStreak || 0,
              longestStreak: potd.longestStreak || 0,
              globalLongestStreak: potd.globalLongestStreak || 0,
              totalSolved: potd.totalSolved || 0,
              todaySolved: potd.todaySolved || false,
            },
            problems: connData.problems || { school: 0, basic: 0, easy: 0, medium: 0, hard: 0, total: 0 },
          };

          set({
            isLoading: false,
            gfg: {
              connected: true,
              username: result.username || sanitizedUsername,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            gfgData: get().gfgData || initialGfgData,
          });
          await get().syncGFG(uid, sanitizedUsername);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncGFG: async (uid: string, username?: string) => {
        const targetUsername = username || get().gfg.username;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/gfg/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: targetUsername }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              set({
                gfgData: result.data,
                gfg: {
                  ...get().gfg,
                  connected: true,
                  username: result.username || targetUsername || get().gfg.username,
                  lastSynced: new Date().toISOString(),
                }
              });
            }
          }
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false });
        }
      },
      
      disconnectGFG: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/gfg/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            gfg: initialState.gfg,
            gfgData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },
      
      validateCodeforcesUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codeforces/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectCodeforces: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const sanitizedUsername = username.trim();
          const response = await fetch(`${API_BASE}/api/codeforces/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: sanitizedUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const result = await response.json();
          const connData = result.data || {};
          const profile = connData.profile || {};
          
          const initialCodeforcesData: CodeforcesData = {
            profile: {
              displayName: profile.displayName || sanitizedUsername,
              avatar: profile.avatar || null,
              rating: profile.rating || 0,
              maxRating: profile.maxRating || 0,
              rank: profile.rank || 'unranked',
              maxRank: profile.maxRank || 'unranked',
              contribution: profile.contribution || 0,
              friendOfCount: profile.friendOfCount || 0,
            },
            ratingHistory: [],
            recentSubmissions: [],
            totalContests: 0,
          };

          set({
            isLoading: false,
            codeforces: {
              connected: true,
              username: result.username || sanitizedUsername,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            codeforcesData: get().codeforcesData || initialCodeforcesData,
          });
          await get().syncCodeforces(uid, sanitizedUsername);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncCodeforces: async (uid: string, username?: string) => {
        const targetUsername = username || get().codeforces.username;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codeforces/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: targetUsername }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              set({
                codeforcesData: result.data,
                codeforces: {
                  ...get().codeforces,
                  connected: true,
                  username: result.username || targetUsername || get().codeforces.username,
                  lastSynced: new Date().toISOString(),
                }
              });
            }
          }
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false });
        }
      },
      
      disconnectCodeforces: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codeforces/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            codeforces: initialState.codeforces,
            codeforcesData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },
      
      validateCodeChefUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codechef/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectCodeChef: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const sanitizedUsername = username.trim();
          const response = await fetch(`${API_BASE}/api/codechef/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: sanitizedUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const result = await response.json();
          const connData = result.data || {};
          const profile = connData.profile || {};
          
          const initialCodeChefData: CodeChefData = {
            profile: {
              displayName: profile.displayName || sanitizedUsername,
              avatar: profile.avatar || null,
              currentRating: profile.currentRating || 0,
              highestRating: profile.highestRating || 0,
              stars: profile.stars || '1★',
              globalRank: profile.globalRank || 0,
              countryRank: profile.countryRank || 0,
            },
            ratingHistory: [],
            problemStats: { fullySolved: 0, partiallySolved: 0 },
          };

          set({
            isLoading: false,
            codechef: {
              connected: true,
              username: result.username || sanitizedUsername,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            codechefData: get().codechefData || initialCodeChefData,
          });
          await get().syncCodeChef(uid, sanitizedUsername);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncCodeChef: async (uid: string, username?: string) => {
        const targetUsername = username || get().codechef.username;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codechef/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: targetUsername }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              set({
                codechefData: result.data,
                codechef: {
                  ...get().codechef,
                  connected: true,
                  username: result.username || targetUsername || get().codechef.username,
                  lastSynced: new Date().toISOString(),
                }
              });
            }
          }
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false });
        }
      },
      
      disconnectCodeChef: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codechef/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            codechef: initialState.codechef,
            codechefData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },
      
      validateHackerRankUsername: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/hackerrank/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Validation failed');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Validation failed' });
          throw error;
        }
      },
      
      connectHackerRank: async (uid: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const sanitizedUsername = username.trim();
          const response = await fetch(`${API_BASE}/api/hackerrank/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: sanitizedUsername }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const result = await response.json();
          const connData = result.data || {};
          const profile = connData.profile || {};
          
          const initialHackerRankData: HackerRankData = {
            profile: {
              displayName: profile.displayName || sanitizedUsername,
              avatar: profile.avatar || null,
              country: profile.country || '',
              school: profile.school || '',
              badgeCount: profile.badgeCount || 0,
            },
            badges: [],
            certificates: [],
          };

          set({
            isLoading: false,
            hackerrank: {
              connected: true,
              username: result.username || sanitizedUsername,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            hackerrankData: get().hackerrankData || initialHackerRankData,
          });
          await get().syncHackerRank(uid, sanitizedUsername);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncHackerRank: async (uid: string, username?: string) => {
        const targetUsername = username || get().hackerrank.username;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/hackerrank/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username: targetUsername }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              set({
                hackerrankData: result.data,
                hackerrank: {
                  ...get().hackerrank,
                  connected: true,
                  username: result.username || targetUsername || get().hackerrank.username,
                  lastSynced: new Date().toISOString(),
                }
              });
            }
          }
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false });
        }
      },
      
      disconnectHackerRank: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/hackerrank/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Disconnection failed');
          }
          
          set({
            isLoading: false,
            hackerrank: initialState.hackerrank,
            hackerrankData: null,
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Disconnection failed' });
          throw error;
        }
      },

      connectLinkedIn: async (uid: string, inputUrlOrHandle: string) => {
        let input = (inputUrlOrHandle || "").trim().replace(/\/+$/, "");
        let cleanHandle = "";
        let profileUrl = "";

        try {
          if (input.startsWith("http://") || input.startsWith("https://") || input.includes("linkedin.com")) {
            const fullUrl = input.startsWith("http") ? input : `https://${input}`;
            const urlObj = new URL(fullUrl);
            const pathParts = urlObj.pathname.split("/").filter(Boolean);
            
            const inIdx = pathParts.findIndex(p => p.toLowerCase() === "in" || p.toLowerCase() === "pub");
            if (inIdx !== -1 && pathParts[inIdx + 1]) {
              cleanHandle = pathParts[inIdx + 1].split("?")[0].replace(/^@/, "");
            } else if (pathParts.length > 0) {
              const nonSystem = pathParts.filter(p => !["public-profile", "settings", "feed", "edit", "detail"].includes(p.toLowerCase()));
              if (nonSystem.length > 0) {
                cleanHandle = nonSystem[nonSystem.length - 1].split("?")[0].replace(/^@/, "");
              }
            }

            if (!cleanHandle) {
              cleanHandle = "profile";
            }
            profileUrl = fullUrl;
          } else {
            cleanHandle = input.replace(/^@/, "").split("/")[0].split("?")[0];
            profileUrl = `https://www.linkedin.com/in/${cleanHandle}`;
          }
        } catch {
          cleanHandle = input.replace(/^@/, "").split("/")[0].split("?")[0] || "profile";
          profileUrl = `https://www.linkedin.com/in/${cleanHandle}`;
        }

        const conn = {
          connected: true,
          username: cleanHandle,
          lastSynced: new Date().toISOString(),
          connectedAt: new Date().toISOString(),
        };

        set({
          linkedin: conn,
          linkedinData: {
            profile: {
              name: cleanHandle !== "profile" ? cleanHandle : "LinkedIn Member",
              avatar: null,
              headline: "",
              location: "",
              profileUrl,
              about: "",
            },
            connections: null,
            skills: [],
            experience: [],
            education: [],
          },
        });

        if (uid) {
          createNotification(uid, {
            type: "platform_connected",
            title: "LinkedIn Profile Connected",
            message: `Your LinkedIn profile (@${cleanHandle}) has been linked successfully.`,
            link: "/connections/linkedin",
          });
        }
      },

      syncLinkedIn: async (uid: string) => {
        set({ isSyncing: true });
        const currentHandle = get().linkedin.username || "developer";
        const conn = {
          connected: true,
          username: currentHandle,
          lastSynced: new Date().toISOString(),
          connectedAt: get().linkedin.connectedAt || new Date().toISOString(),
        };

        set({
          linkedin: conn,
          isSyncing: false,
        });

        if (uid) {
          createNotification(uid, {
            type: "sync",
            title: "LinkedIn Profile Synced",
            message: `Your LinkedIn identity (@${currentHandle}) telemetry has been synced.`,
            link: "/connections/linkedin",
            idempotencyKey: `sync_linkedin_${uid}_${Math.floor(Date.now() / 300000)}`,
          }).catch(() => {});
        }
      },

      disconnectLinkedIn: async (uid: string) => {
        set({
          linkedin: initialState.linkedin,
          linkedinData: null,
        });
        if (uid) {
          createNotification(uid, {
            type: "platform_disconnected",
            title: "LinkedIn disconnected",
            message: "Your LinkedIn profile has been unlinked.",
            link: "/connections",
          });
        }
      },
      
      fetchDashboardData: async (uid: string) => {
        if (!uid) {
          console.error('[Platform Store] fetchDashboardData called without uid');
          set({ isLoading: false, error: 'User ID is required' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/dashboard?uid=${uid}`);
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch dashboard data');
          }
          
          const data = await response.json();
          
          const conns = data?.connections || {};
          const currentGithub = get().github;
          const currentLeetcode = get().leetcode;
          const currentGfg = get().gfg;
          const currentCodeforces = get().codeforces;
          const currentCodechef = get().codechef;
          const currentHackerrank = get().hackerrank;
          
          const isGithubConn = (conns.github === true) || (data?.github != null) || currentGithub.connected;
          const isLeetcodeConn = (conns.leetcode === true) || (data?.leetcode != null) || currentLeetcode.connected;
          const isGfgConn = (conns.gfg === true) || (data?.gfg != null) || currentGfg.connected;
          const isCodeforcesConn = (conns.codeforces === true) || (data?.codeforces != null) || currentCodeforces.connected;
          const isCodechefConn = (conns.codechef === true) || (data?.codechef != null) || currentCodechef.connected;
          const isHackerrankConn = (conns.hackerrank === true) || (data?.hackerrank != null) || currentHackerrank.connected;
          
          set({
            isLoading: false,
            githubData: data?.github || get().githubData,
            leetcodeData: data?.leetcode || get().leetcodeData,
            gfgData: data?.gfg || get().gfgData,
            codeforcesData: data?.codeforces || get().codeforcesData,
            codechefData: data?.codechef || get().codechefData,
            hackerrankData: data?.hackerrank || get().hackerrankData,
            combinedMetrics: data?.combinedMetrics || get().combinedMetrics,
            github: {
              ...currentGithub,
              connected: isGithubConn,
              lastSynced: data?.github ? data.lastUpdated : currentGithub.lastSynced,
            },
            leetcode: {
              ...currentLeetcode,
              connected: isLeetcodeConn,
              lastSynced: data?.leetcode ? data.lastUpdated : currentLeetcode.lastSynced,
            },
            gfg: {
              ...currentGfg,
              connected: isGfgConn,
              lastSynced: data?.gfg ? data.lastUpdated : currentGfg.lastSynced,
            },
            codeforces: {
              ...currentCodeforces,
              connected: isCodeforcesConn,
              lastSynced: data?.codeforces ? data.lastUpdated : currentCodeforces.lastSynced,
            },
            codechef: {
              ...currentCodechef,
              connected: isCodechefConn,
              lastSynced: data?.codechef ? data.lastUpdated : currentCodechef.lastSynced,
            },
            hackerrank: {
              ...currentHackerrank,
              connected: isHackerrankConn,
              lastSynced: data?.hackerrank ? data.lastUpdated : currentHackerrank.lastSynced,
            },
          });
        } catch (error) {
          console.warn('[Platform Store] Dashboard fetch notice:', error);
          set({ isLoading: false });
        }
      },
      
      fetchAnalyticsData: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/analytics?uid=${uid}`);
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch analytics data');
          }
          
          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch analytics' });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'platform-storage',
      partialize: (state) => ({
        github: state.github,
        leetcode: state.leetcode,
        gfg: state.gfg,
        codeforces: state.codeforces,
        codechef: state.codechef,
        hackerrank: state.hackerrank,
        linkedin: state.linkedin,
        githubData: state.githubData,
        leetcodeData: state.leetcodeData,
        gfgData: state.gfgData,
        codeforcesData: state.codeforcesData,
        codechefData: state.codechefData,
        hackerrankData: state.hackerrankData,
        linkedinData: state.linkedinData,
        combinedMetrics: state.combinedMetrics,
      }),
    }
  )
);
