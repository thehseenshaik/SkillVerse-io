/**
 * Dashboard Cache System
 * Provides caching for dashboard data to optimize performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DashboardCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private static instance: DashboardCache;

  private constructor() {}

  static getInstance(): DashboardCache {
    if (!DashboardCache.instance) {
      DashboardCache.instance = new DashboardCache();
    }
    return DashboardCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Pre-fetch data for likely future access
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    if (this.has(key)) return;

    try {
      const data = await fetcher();
      this.set(key, data, ttl);
    } catch (error) {
      console.error(`Prefetch failed for ${key}:`, error);
    }
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const dashboardCache = DashboardCache.getInstance();

// Cache key generators
export const cacheKeys = {
  userConnections: (userId: string) => `user:${userId}:connections`,
  platformData: (userId: string, platform: string) => `user:${userId}:platform:${platform}`,
  activities: (userId: string) => `user:${userId}:activities`,
  skills: (userId: string) => `user:${userId}:skills`,
  insights: (userId: string) => `user:${userId}:insights`,
  weeklyProgress: (userId: string) => `user:${userId}:weekly-progress`,
  resumeStatus: (userId: string) => `user:${userId}:resume-status`,
};

// Invalidate all user-related cache on user actions
export function invalidateUserCache(userId: string): void {
  dashboardCache.invalidatePattern(`user:${userId}:`);
}
