/**
 * Platform Data Service
 * Centralized data fetching with caching for all platform integrations
 */

import { useAuth } from "@/lib/auth-context";

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class PlatformDataService {
  private cache: Map<string, CachedData<any>> = new Map();
  private defaultCacheDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  private getCacheKey(platform: string, endpoint: string, params?: string): string {
    return `${platform}:${endpoint}:${params || ''}`;
  }

  private isCacheValid(cached: CachedData<any>): boolean {
    return Date.now() < cached.expiresAt;
  }

  private setCache<T>(key: string, data: T, duration?: number): void {
    const cacheDuration = duration || this.defaultCacheDuration;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration,
    });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (!this.isCacheValid(cached)) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  public clearCache(platform?: string): void {
    if (platform) {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(`${platform}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Fetch data with caching
   */
  async fetch<T>(
    platform: string,
    endpoint: string,
    fetcher: () => Promise<T>,
    options?: {
      params?: string;
      cacheDuration?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const { params, cacheDuration, forceRefresh = false } = options || {};
    const cacheKey = this.getCacheKey(platform, endpoint, params);

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = this.getCache<T>(cacheKey);
      if (cached) return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    this.setCache(cacheKey, data, cacheDuration);
    return data;
  }

  /**
   * Sync platform data through the server
   */
  async syncPlatform(platform: string, uid: string): Promise<void> {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    const response = await fetch(`${API_BASE}/api/${platform}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync ${platform}`);
    }

    // Clear cache for this platform after sync
    this.clearCache(platform);
  }

  /**
   * Get cached platform data from Firestore
   */
  async getCachedPlatformData(platform: string, uid: string): Promise<any> {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    const response = await fetch(`${API_BASE}/api/user/${uid}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return userData?.cachedData?.[platform] || null;
  }

  /**
   * Connect platform
   */
  async connectPlatform(platform: string, uid: string, username: string): Promise<void> {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    const response = await fetch(`${API_BASE}/api/${platform}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to connect to ${platform}`);
    }

    // Clear cache after connection
    this.clearCache(platform);
  }

  /**
   * Disconnect platform
   */
  async disconnectPlatform(platform: string, uid: string): Promise<void> {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    const response = await fetch(`${API_BASE}/api/${platform}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect from ${platform}`);
    }

    // Clear cache after disconnection
    this.clearCache(platform);
  }

  /**
   * Validate platform username
   */
  async validateUsername(platform: string, username: string): Promise<{ valid: boolean; username: string; displayName: string; avatar?: string }> {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    const response = await fetch(`${API_BASE}/api/${platform}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to validate ${platform} username`);
    }

    return response.json();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const platformDataService = new PlatformDataService();

// React hook for using the service
export function usePlatformDataService() {
  const { user } = useAuth();

  return {
    fetch: platformDataService.fetch.bind(platformDataService),
    syncPlatform: (platform: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return platformDataService.syncPlatform(platform, user.id);
    },
    getCachedPlatformData: (platform: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return platformDataService.getCachedPlatformData(platform, user.id);
    },
    connectPlatform: (platform: string, username: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return platformDataService.connectPlatform(platform, user.id, username);
    },
    disconnectPlatform: (platform: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return platformDataService.disconnectPlatform(platform, user.id);
    },
    validateUsername: (platform: string, username: string) => {
      return platformDataService.validateUsername(platform, username);
    },
    clearCache: platformDataService.clearCache.bind(platformDataService),
    clearAllCache: platformDataService.clearAllCache.bind(platformDataService),
    getCacheStats: platformDataService.getCacheStats.bind(platformDataService),
  };
}
