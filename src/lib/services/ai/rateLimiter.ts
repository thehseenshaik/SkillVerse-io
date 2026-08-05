/**
 * Rate Limiting System
 * Protects API usage with per-user and global rate limits
 */

import type { UserRateLimit, RateLimitRecord } from "@/types/ai";
import { aiRateLimit } from "./config";

// ============================================================================
// IN-MEMORY RATE LIMIT STORAGE
// ============================================================================

const userRateLimits = new Map<string, UserRateLimit>();

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Check if user is within rate limits
 */
export async function checkRateLimit(
  userId: string,
): Promise<{ allowed: boolean; retryAfter?: number; limits?: any }> {
  const now = Date.now();
  let userLimit = userRateLimits.get(userId);

  // Initialize if not exists
  if (!userLimit) {
    userLimit = createInitialUserLimit(now);
    userRateLimits.set(userId, userLimit);
  }

  // Check cooldown
  if (userLimit.cooldownUntil && now < userLimit.cooldownUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.cooldownUntil - now) / 1000),
    };
  }

  // Check per-minute limit
  if (
    !checkLimitWindow(
      userLimit.perMinute,
      now,
      aiRateLimit.perMinute,
      60 * 1000,
    )
  ) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.perMinute.resetTime - now) / 1000),
      limits: {
        perMinute: aiRateLimit.perMinute,
        perHour: aiRateLimit.perHour,
        perDay: aiRateLimit.perDay,
      },
    };
  }

  // Check per-hour limit
  if (
    !checkLimitWindow(
      userLimit.perHour,
      now,
      aiRateLimit.perHour,
      60 * 60 * 1000,
    )
  ) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.perHour.resetTime - now) / 1000),
      limits: {
        perMinute: aiRateLimit.perMinute,
        perHour: aiRateLimit.perHour,
        perDay: aiRateLimit.perDay,
      },
    };
  }

  // Check per-day limit
  if (
    !checkLimitWindow(
      userLimit.perDay,
      now,
      aiRateLimit.perDay,
      24 * 60 * 60 * 1000,
    )
  ) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.perDay.resetTime - now) / 1000),
      limits: {
        perMinute: aiRateLimit.perMinute,
        perHour: aiRateLimit.perHour,
        perDay: aiRateLimit.perDay,
      },
    };
  }

  return {
    allowed: true,
    limits: {
      perMinute: aiRateLimit.perMinute,
      perHour: aiRateLimit.perHour,
      perDay: aiRateLimit.perDay,
    },
  };
}

/**
 * Record rate limit usage
 */
export async function recordRateLimitUsage(userId: string): Promise<void> {
  const now = Date.now();
  let userLimit = userRateLimits.get(userId);

  if (!userLimit) {
    userLimit = createInitialUserLimit(now);
    userRateLimits.set(userId, userLimit);
  }

  // Increment all limits
  incrementLimit(userLimit.perMinute, now, 60 * 1000);
  incrementLimit(userLimit.perHour, now, 60 * 60 * 1000);
  incrementLimit(userLimit.perDay, now, 24 * 60 * 60 * 1000);

  userLimit.cooldownUntil = undefined;
}

/**
 * Get current rate limit status for user
 */
export function getRateLimitStatus(userId: string): {
  perMinute: { used: number; limit: number; resetIn: number };
  perHour: { used: number; limit: number; resetIn: number };
  perDay: { used: number; limit: number; resetIn: number };
} | null {
  const userLimit = userRateLimits.get(userId);
  if (!userLimit) {
    return null;
  }

  const now = Date.now();

  return {
    perMinute: {
      used: userLimit.perMinute.count,
      limit: aiRateLimit.perMinute,
      resetIn: Math.max(0, userLimit.perMinute.resetTime - now),
    },
    perHour: {
      used: userLimit.perHour.count,
      limit: aiRateLimit.perHour,
      resetIn: Math.max(0, userLimit.perHour.resetTime - now),
    },
    perDay: {
      used: userLimit.perDay.count,
      limit: aiRateLimit.perDay,
      resetIn: Math.max(0, userLimit.perDay.resetTime - now),
    },
  };
}

/**
 * Reset rate limits for a user (admin function)
 */
export function resetRateLimits(userId: string): void {
  userRateLimits.delete(userId);
}

/**
 * Set cooldown for a user (admin function)
 */
export function setCooldown(userId: string, durationMs: number): void {
  const userLimit = userRateLimits.get(userId);
  if (userLimit) {
    userLimit.cooldownUntil = Date.now() + durationMs;
  }
}

/**
 * Clean up expired rate limit records
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  for (const [userId, userLimit] of userRateLimits.entries()) {
    if (userLimit.perDay.resetTime < now - maxAge) {
      userRateLimits.delete(userId);
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create initial user rate limit record
 */
function createInitialUserLimit(now: number): UserRateLimit {
  return {
    userId: "",
    perMinute: {
      count: 0,
      resetTime: now + 60 * 1000,
      lastRequestTime: now,
    },
    perHour: {
      count: 0,
      resetTime: now + 60 * 60 * 1000,
      lastRequestTime: now,
    },
    perDay: {
      count: 0,
      resetTime: now + 24 * 60 * 60 * 1000,
      lastRequestTime: now,
    },
  };
}

/**
 * Check if limit window is valid
 */
function checkLimitWindow(
  record: RateLimitRecord,
  now: number,
  limit: number,
  windowMs: number,
): boolean {
  // Reset if window has expired
  if (now >= record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  return record.count < limit;
}

/**
 * Increment limit counter
 */
function incrementLimit(
  record: RateLimitRecord,
  now: number,
  windowMs: number,
): void {
  // Reset if window has expired
  if (now >= record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  record.lastRequestTime = now;
}

/**
 * Get global rate limit statistics
 */
export function getGlobalRateLimitStats(): {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
} {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  let totalRequests = 0;
  let activeUsers = 0;

  for (const userLimit of userRateLimits.values()) {
    totalRequests += userLimit.perDay.count;

    if (userLimit.perHour.lastRequestTime > oneHourAgo) {
      activeUsers++;
    }
  }

  return {
    totalUsers: userRateLimits.size,
    activeUsers,
    totalRequests,
  };
}

// Schedule periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 60 * 60 * 1000); // Clean up every hour
}
