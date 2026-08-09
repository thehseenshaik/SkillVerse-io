import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  
  // Cached data
  githubData: GitHubData | null;
  leetcodeData: LeetCodeData | null;
  gfgData: GFGData | null;
  codeforcesData: CodeforcesData | null;
  codechefData: CodeChefData | null;
  hackerrankData: HackerRankData | null;
  
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
  githubData: null,
  leetcodeData: null,
  gfgData: null,
  codeforcesData: null,
  codechefData: null,
  hackerrankData: null,
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
          
          set({
            isLoading: false,
            github: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
            githubData: data.profile,
          });
          
          // Trigger dashboard data refresh to sync with identity hub
          if (uid) {
            await get().fetchDashboardData(uid);
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
          const response = await fetch(`${API_BASE}/api/github/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          const response = await fetch(`${API_BASE}/api/leetcode/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          set({
            isLoading: false,
            leetcode: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
          });
          await get().syncLeetCode(uid);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncLeetCode: async (uid: string) => {
        if (get().isSyncing) return;
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/leetcode/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          const response = await fetch(`${API_BASE}/api/gfg/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          set({
            isLoading: false,
            gfg: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
          });
          await get().syncGFG(uid);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncGFG: async (uid: string) => {
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/gfg/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          const response = await fetch(`${API_BASE}/api/codeforces/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          set({
            isLoading: false,
            codeforces: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
          });
          await get().syncCodeforces(uid);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncCodeforces: async (uid: string) => {
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codeforces/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          const response = await fetch(`${API_BASE}/api/codechef/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          set({
            isLoading: false,
            codechef: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
          });
          await get().syncCodeChef(uid);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncCodeChef: async (uid: string) => {
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/codechef/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          const response = await fetch(`${API_BASE}/api/hackerrank/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, username }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Connection failed');
          }
          
          const data = await response.json();
          set({
            isLoading: false,
            hackerrank: {
              connected: true,
              username: data.username,
              lastSynced: new Date().toISOString(),
              connectedAt: new Date().toISOString(),
            },
          });
          await get().syncHackerRank(uid);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Connection failed' });
          throw error;
        }
      },
      
      syncHackerRank: async (uid: string) => {
        set({ isSyncing: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/hackerrank/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Sync failed');
          }
          
          await get().fetchDashboardData(uid);
          set({ isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, error: error instanceof Error ? error.message : 'Sync failed' });
          throw error;
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
          
          // Only update connection states if they're explicitly provided
          // Don't overwrite existing connections with false values
          const currentGithub = get().github;
          const currentLeetcode = get().leetcode;
          const currentGfg = get().gfg;
          const currentCodeforces = get().codeforces;
          const currentCodechef = get().codechef;
          const currentHackerrank = get().hackerrank;
          
          set({
            isLoading: false,
            githubData: data.github,
            leetcodeData: data.leetcode,
            gfgData: data.gfg,
            codeforcesData: data.codeforces,
            codechefData: data.codechef,
            hackerrankData: data.hackerrank,
            combinedMetrics: data.combinedMetrics,
            github: {
              ...currentGithub,
              connected: data.connections.github !== undefined ? data.connections.github : currentGithub.connected,
              lastSynced: data.github ? data.lastUpdated : currentGithub.lastSynced,
            },
            leetcode: {
              ...currentLeetcode,
              connected: data.connections.leetcode !== undefined ? data.connections.leetcode : currentLeetcode.connected,
              lastSynced: data.leetcode ? data.lastUpdated : currentLeetcode.lastSynced,
            },
            gfg: {
              ...currentGfg,
              connected: data.connections.gfg !== undefined ? data.connections.gfg : currentGfg.connected,
              lastSynced: data.gfg ? data.lastUpdated : currentGfg.lastSynced,
            },
            codeforces: {
              ...currentCodeforces,
              connected: data.connections.codeforces !== undefined ? data.connections.codeforces : currentCodeforces.connected,
              lastSynced: data.codeforces ? data.lastUpdated : currentCodeforces.lastSynced,
            },
            codechef: {
              ...currentCodechef,
              connected: data.connections.codechef !== undefined ? data.connections.codechef : currentCodechef.connected,
              lastSynced: data.codechef ? data.lastUpdated : currentCodechef.lastSynced,
            },
            hackerrank: {
              ...currentHackerrank,
              connected: data.connections.hackerrank !== undefined ? data.connections.hackerrank : currentHackerrank.connected,
              lastSynced: data.hackerrank ? data.lastUpdated : currentHackerrank.lastSynced,
            },
          });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch data' });
          throw error;
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
        githubData: state.githubData,
        leetcodeData: state.leetcodeData,
        gfgData: state.gfgData,
        codeforcesData: state.codeforcesData,
        codechefData: state.codechefData,
        hackerrankData: state.hackerrankData,
        combinedMetrics: state.combinedMetrics,
      }),
    }
  )
);
