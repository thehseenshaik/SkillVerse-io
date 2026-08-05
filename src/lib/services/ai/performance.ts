/**
 * Performance Optimization Utilities
 * Caching, batching, and optimization utilities for AI operations
 */

// ============================================================================
// SIMPLE IN-MEMORY CACHE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    };

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; hits: number; keys: string[] } {
    let totalHits = 0;
    const keys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits;
      keys.push(key);
    }

    return {
      size: this.cache.size,
      hits: totalHits,
      keys,
    };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ============================================================================
// REQUEST BATCHING
// ============================================================================

interface BatchRequest<T> {
  id: string;
  data: T;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestBatcher<T> {
  private batch: BatchRequest<T>[] = [];
  private batchTimeout: number;
  private maxBatchSize: number;
  private processor: (items: T[]) => Promise<any[]>;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    processor: (items: T[]) => Promise<any[]>,
    batchTimeout: number = 100,
    maxBatchSize: number = 10,
  ) {
    this.processor = processor;
    this.batchTimeout = batchTimeout;
    this.maxBatchSize = maxBatchSize;
  }

  async add(data: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);

      this.batch.push({ id, data, resolve, reject });

      // Process batch if full
      if (this.batch.length >= this.maxBatchSize) {
        this.processBatch();
      } else {
        // Set timeout if not already set
        if (!this.timeoutId) {
          this.timeoutId = setTimeout(() => {
            this.processBatch();
          }, this.batchTimeout);
        }
      }
    });
  }

  private async processBatch(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.batch.length === 0) {
      return;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      const items = currentBatch.map((req) => req.data);
      const results = await this.processor(items);

      // Match results to requests
      results.forEach((result, index) => {
        if (index < currentBatch.length) {
          currentBatch[index].resolve(result);
        }
      });
    } catch (error) {
      // Reject all requests in batch
      currentBatch.forEach((req) => req.reject(error));
    }
  }

  size(): number {
    return this.batch.length;
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Reject all pending requests
    this.batch.forEach((req) => {
      req.reject(new Error("Batch cleared"));
    });

    this.batch = [];
  }
}

// ============================================================================
// RESPONSE CACHING
// ============================================================================

// Cache for AI responses
const responseCache = new SimpleCache<string>(500, 300000); // 5 min TTL

/**
 * Get cached response if available
 */
export function getCachedResponse(cacheKey: string): string | null {
  return responseCache.get(cacheKey);
}

/**
 * Cache a response
 */
export function cacheResponse(
  cacheKey: string,
  response: string,
  ttl?: number,
): void {
  responseCache.set(cacheKey, response, ttl);
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
  featureType: string,
  context: Record<string, any>,
): string {
  const contextString = JSON.stringify(context, Object.keys(context).sort());
  // Use btoa for browser compatibility instead of Buffer
  const base64String = typeof Buffer !== 'undefined' 
    ? Buffer.from(contextString).toString("base64")
    : btoa(contextString);
  return `${featureType}_${base64String}`;
}

/**
 * Clear response cache
 */
export function clearResponseCache(): void {
  responseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): ReturnType<typeof responseCache.getStats> {
  return responseCache.getStats();
}

// ============================================================================
// REQUEST QUEUING
// ============================================================================

interface QueuedRequest {
  priority: number;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent: number;
  private currentConcurrent = 0;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(execute: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ priority, execute, resolve, reject });
      this.queue.sort((a, b) => b.priority - a.priority);

      this.process();
    });
  }

  private async process(): void {
    if (this.processing || this.currentConcurrent >= this.maxConcurrent) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (
      this.queue.length > 0 &&
      this.currentConcurrent < this.maxConcurrent
    ) {
      const request = this.queue.shift();

      if (request) {
        this.currentConcurrent++;

        request
          .execute()
          .then(request.resolve)
          .catch(request.reject)
          .finally(() => {
            this.currentConcurrent--;
            this.processing = false;
            this.process();
          });
      }
    }

    this.processing = false;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue.forEach((req) => {
      req.reject(new Error("Queue cleared"));
    });
    this.queue = [];
  }
}

// Global request queue for AI operations
const aiRequestQueue = new RequestQueue(10);

/**
 * Add request to AI queue
 */
export function queueAIRequest<T>(
  execute: () => Promise<T>,
  priority: number = 0,
): Promise<T> {
  return aiRequestQueue.add(execute, priority);
}

/**
 * Get queue size
 */
export function getQueueSize(): number {
  return aiRequestQueue.size();
}

/**
 * Clear queue
 */
export function clearQueue(): void {
  aiRequestQueue.clear();
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;

  startMeasure(name: string, metadata?: Record<string, unknown>): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.addMetric({
        name,
        duration,
        timestamp: Date.now(),
        metadata,
      });
    };
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getPercentile(name: string, percentile: number): number {
    const metrics = this.getMetrics(name)
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    if (metrics.length === 0) return 0;

    const index = Math.floor(metrics.length * percentile);
    return metrics[index];
  }

  clear(): void {
    this.metrics = [];
  }
}

// Global performance monitor
const performanceMonitor = new PerformanceMonitor();

/**
 * Start a performance measurement
 */
export function measurePerformance(
  name: string,
  metadata?: Record<string, any>,
): () => void {
  return performanceMonitor.startMeasure(name, metadata);
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(name?: string): PerformanceMetric[] {
  return performanceMonitor.getMetrics(name);
}

/**
 * Get average duration
 */
export function getAverageDuration(name: string): number {
  return performanceMonitor.getAverageDuration(name);
}

/**
 * Get percentile duration
 */
export function getPercentileDuration(
  name: string,
  percentile: number,
): number {
  return performanceMonitor.getPercentile(name, percentile);
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMonitor.clear();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Schedule periodic cache cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    responseCache.cleanup();
  }, 60000); // Clean up every minute
}
