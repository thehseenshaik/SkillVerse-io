import { useEffect } from 'react';
import { useAuth } from './auth-context';
import { usePlatformStore } from './platform-store';

const AUTO_SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useAutoSync() {
  const { user } = useAuth();
  const {
    github,
    leetcode,
    fetchDashboardData,
  } = usePlatformStore();

  useEffect(() => {
    if (!user?.id) return;

    const checkAndAutoSync = async () => {
      const now = new Date();
      let needsSync = false;

      // Check GitHub sync
      if (github.connected && github.lastSynced) {
        const lastSync = new Date(github.lastSynced);
        const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceSync >= 24) {
          needsSync = true;
        }
      }

      // Check LeetCode sync
      if (leetcode.connected && leetcode.lastSynced) {
        const lastSync = new Date(leetcode.lastSynced);
        const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceSync >= 24) {
          needsSync = true;
        }
      }

      if (needsSync) {
        try {
          await fetchDashboardData(user.id);
          console.log('Auto-sync completed');
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
    };

    // Initial check
    checkAndAutoSync();

    // Set up interval for auto-sync
    const interval = setInterval(checkAndAutoSync, AUTO_SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [user?.id, github.connected, github.lastSynced, leetcode.connected, leetcode.lastSynced, fetchDashboardData]);
}

// Hook to trigger sync on component mount
export function useInitialSync() {
  const { user, hydrated } = useAuth();
  const {
    github,
    leetcode,
    fetchDashboardData,
  } = usePlatformStore();

  useEffect(() => {
    if (!user?.id || !hydrated) return;

    const loadInitialData = async () => {
      try {
        await fetchDashboardData(user.id);
      } catch (error) {
        console.error('Initial data load failed:', error);
      }
    };

    loadInitialData();
  }, [user?.id, hydrated, fetchDashboardData]);
}
