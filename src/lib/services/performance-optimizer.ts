/**
 * Performance Optimizer Service
 * Handles lazy loading, caching, and performance optimizations for public profiles
 */

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in bytes
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export class PerformanceOptimizerService {
  private cache: Map<string, { data: any; timestamp: number; size: number }> = new Map();
  private config: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 10 * 1024 * 1024, // 10MB
  };

  /**
   * Set cache configuration
   */
  setCacheConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get from cache
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set in cache
   */
  set<T>(key: string, data: T): void {
    if (!this.config.enabled) return;

    // Calculate size
    const size = JSON.stringify(data).length;
    
    // Check if cache is too large
    if (this.getCacheSize() + size > this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });
  }

  /**
   * Delete from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  private getCacheSize(): number {
    let size = 0;
    this.cache.forEach((cached) => {
      size += cached.size;
    });
    return size;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((cached, key) => {
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: number;
    hitRate: number;
  } {
    return {
      size: this.getCacheSize(),
      entries: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
    };
  }

  /**
   * Lazy load component
   */
  lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null;

    return () => {
      if (!promise) {
        promise = loader();
      }
      return promise;
    };
  }

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Measure performance
   */
  measurePerformance<T>(fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Measure async performance
   */
  async measureAsyncPerformance<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Prefetch data
   */
  async prefetch<T>(loader: () => Promise<T>): Promise<void> {
    try {
      await loader();
    } catch (error) {
      console.error("Error prefetching data:", error);
    }
  }

  /**
   * Prefetch multiple resources
   */
  async prefetchMultiple<T>(loaders: Array<() => Promise<T>>): Promise<void> {
    await Promise.allSettled(loaders.map((loader) => this.prefetch(loader)));
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading(img: HTMLImageElement, src: string): void {
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
  }

  /**
   * Generate critical CSS
   */
  generateCriticalCSS(css: string, viewport: { width: number; height: number }): string {
    // This would typically use a critical CSS generator
    // For now, return the full CSS
    return css;
  }

  /**
   * Minify CSS
   */
  minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, "$1") // Remove space around special characters
      .replace(/;\}/g, "}") // Remove last semicolon
      .trim();
  }

  /**
   * Minify HTML
   */
  minifyHTML(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/>\s+</g, "><") // Remove space between tags
      .trim();
  }

  /**
   * Generate service worker
   */
  generateServiceWorker(): string {
    return `
const CACHE_NAME = 'skillverse-v1';
const urlsToCache = [
  '/',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
    `.trim();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    if (typeof performance === "undefined") {
      return {
        loadTime: 0,
        renderTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
      };
    }

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    return {
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      renderTime: navigation?.domComplete - navigation?.domInteractive || 0,
      cacheHitRate: this.getCacheStats().hitRate,
      memoryUsage: memory?.usedJSHeapSize || 0,
    };
  }

  /**
   * Report performance metrics
   */
  reportPerformanceMetrics(metrics: PerformanceMetrics): void {
    // This would typically send metrics to an analytics service
    console.log("Performance Metrics:", metrics);
  }
}

export const performanceOptimizerService = new PerformanceOptimizerService();
