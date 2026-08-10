import { create } from 'zustand';

export interface ActivityItem {
  id: string;
  userId: string;
  platform: 'github' | 'leetcode' | 'gfg' | 'codeforces' | 'codechef' | 'hackerrank';
  activityType: 'commit' | 'push' | 'pull_request' | 'issue' | 'repo_create' | 'problem_solved' | 'submission' | 'contest' | 'streak_milestone' | 'rating_change' | 'badge_earned';
  title: string;
  description?: string;
  url?: string | null;
  timestamp: string;
  syncedAt?: string;
  metadata?: Record<string, any>;
}

export interface ActivitySummary {
  totalCount: number;
  todayCount: number;
  lastSyncedAt: string | null;
}

interface ActivityStore {
  activities: ActivityItem[];
  summary: ActivitySummary;
  connectedPlatformsCount: number;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  activePlatformFilter: string;
  activeTypeFilter: string;

  fetchActivities: (uid: string, limit?: number, forceRefresh?: boolean) => Promise<void>;
  setPlatformFilter: (filter: string) => void;
  setTypeFilter: (filter: string) => void;
  resetFilters: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  summary: {
    totalCount: 0,
    todayCount: 0,
    lastSyncedAt: null,
  },
  connectedPlatformsCount: 0,
  isLoading: false,
  isSyncing: false,
  error: null,
  activePlatformFilter: 'all',
  activeTypeFilter: 'all',

  fetchActivities: async (uid: string, limit = 20, forceRefresh = false) => {
    if (!uid) return;
    const { activePlatformFilter, isLoading } = get();

    if (isLoading && !forceRefresh) return;
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/api/activity/recent?uid=${encodeURIComponent(uid)}&limit=${limit}&platform=${encodeURIComponent(activePlatformFilter)}`
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load activity feed');
      }

      const data = await response.json();
      set({
        activities: Array.isArray(data.activities) ? data.activities : [],
        summary: data.summary || { totalCount: 0, todayCount: 0, lastSyncedAt: null },
        connectedPlatformsCount: typeof data.connectedPlatformsCount === 'number' ? data.connectedPlatformsCount : 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to fetch activity feed',
      });
    }
  },

  setPlatformFilter: (filter: string) => {
    set({ activePlatformFilter: filter });
  },

  setTypeFilter: (filter: string) => {
    set({ activeTypeFilter: filter });
  },

  resetFilters: () => {
    set({ activePlatformFilter: 'all', activeTypeFilter: 'all' });
  },
}));
