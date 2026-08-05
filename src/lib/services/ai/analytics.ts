/**
 * AI Analytics System
 * Tracks and analyzes AI usage, performance, and costs
 */

import type { AIAnalytics, AIUsageRecord, DailyUsage } from "@/types/ai";

// ============================================================================
// ANALYTICS STORAGE
// ============================================================================

const usageRecords: AIUsageRecord[] = [];
const MAX_RECORDS = 100000; // Keep last 100,000 records

// ============================================================================
// USAGE RECORDING
// ============================================================================

/**
 * Record AI usage
 */
export async function recordUsage(record: AIUsageRecord): Promise<void> {
  // Add to storage
  usageRecords.push(record);

  // Trim if exceeding max size
  if (usageRecords.length > MAX_RECORDS) {
    usageRecords.shift();
  }
}

/**
 * Get analytics summary
 */
export async function getAnalytics(userId?: string): Promise<AIAnalytics> {
  const records = userId
    ? usageRecords.filter((r) => r.userId === userId)
    : usageRecords;

  if (records.length === 0) {
    return {
      totalRequests: 0,
      failedRequests: 0,
      successRate: 1,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      featureUsage: {} as any,
      dailyUsage: [],
      modelUsage: {} as any,
      errorDistribution: {} as any,
    };
  }

  // Calculate basic metrics
  const totalRequests = records.length;
  const failedRequests = records.filter((r) => !r.success).length;
  const successRate = (totalRequests - failedRequests) / totalRequests;

  const totalResponseTime = records.reduce((sum, r) => sum + r.responseTime, 0);
  const averageResponseTime = totalResponseTime / totalRequests;

  const totalTokensUsed = records.reduce(
    (sum, r) => sum + r.tokenUsage.totalTokens,
    0,
  );

  const totalCost = records.reduce(
    (sum, r) => sum + r.tokenUsage.estimatedCost,
    0,
  );

  // Calculate feature usage
  const featureUsage: Record<string, number> = {};
  for (const record of records) {
    featureUsage[record.featureType] =
      (featureUsage[record.featureType] || 0) + 1;
  }

  // Calculate model usage
  const modelUsage: Record<string, number> = {};
  for (const record of records) {
    modelUsage[record.model] = (modelUsage[record.model] || 0) + 1;
  }

  // Calculate error distribution
  const errorDistribution: Record<string, number> = {};
  for (const record of records) {
    if (record.errorCode) {
      errorDistribution[record.errorCode] =
        (errorDistribution[record.errorCode] || 0) + 1;
    }
  }

  // Calculate daily usage
  const dailyUsageMap = new Map<string, DailyUsage>();
  for (const record of records) {
    const date = new Date(record.timestamp).toISOString().split("T")[0];

    if (!dailyUsageMap.has(date)) {
      dailyUsageMap.set(date, {
        date,
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
      });
    }

    const dayUsage = dailyUsageMap.get(date)!;
    dayUsage.requests++;
    dayUsage.tokens += record.tokenUsage.totalTokens;
    dayUsage.cost += record.tokenUsage.estimatedCost;
    if (!record.success) {
      dayUsage.errors++;
    }
  }

  const dailyUsage = Array.from(dailyUsageMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    totalRequests,
    failedRequests,
    successRate,
    averageResponseTime,
    totalTokensUsed,
    totalCost,
    featureUsage: featureUsage as Record<string, number>,
    dailyUsage,
    modelUsage: modelUsage as Record<string, number>,
    errorDistribution,
  };
}

/**
 * Get usage for a specific time period
 */
export async function getUsageByTimePeriod(
  startTime: number,
  endTime: number,
  userId?: string,
): Promise<AIUsageRecord[]> {
  return usageRecords.filter(
    (r) =>
      r.timestamp >= startTime &&
      r.timestamp <= endTime &&
      (!userId || r.userId === userId),
  );
}

/**
 * Get usage for a specific feature
 */
export async function getUsageByFeature(
  featureType: string,
  userId?: string,
): Promise<AIUsageRecord[]> {
  return usageRecords.filter(
    (r) => r.featureType === featureType && (!userId || r.userId === userId),
  );
}

/**
 * Get cost analysis
 */
export async function getCostAnalysis(userId?: string): Promise<{
  totalCost: number;
  costByFeature: Record<string, number>;
  costByModel: Record<string, number>;
  costByDay: DailyUsage[];
  averageCostPerRequest: number;
}> {
  const records = userId
    ? usageRecords.filter((r) => r.userId === userId)
    : usageRecords;

  const totalCost = records.reduce(
    (sum, r) => sum + r.tokenUsage.estimatedCost,
    0,
  );

  const costByFeature: Record<string, number> = {};
  const costByModel: Record<string, number> = {};

  for (const record of records) {
    costByFeature[record.featureType] =
      (costByFeature[record.featureType] || 0) +
      record.tokenUsage.estimatedCost;
    costByModel[record.model] =
      (costByModel[record.model] || 0) + record.tokenUsage.estimatedCost;
  }

  const dailyUsageMap = new Map<string, DailyUsage>();
  for (const record of records) {
    const date = new Date(record.timestamp).toISOString().split("T")[0];

    if (!dailyUsageMap.has(date)) {
      dailyUsageMap.set(date, {
        date,
        requests: 0,
        tokens: 0,
        cost: 0,
        errors: 0,
      });
    }

    const dayUsage = dailyUsageMap.get(date)!;
    dayUsage.cost += record.tokenUsage.estimatedCost;
  }

  const costByDay = Array.from(dailyUsageMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const averageCostPerRequest =
    records.length > 0 ? totalCost / records.length : 0;

  return {
    totalCost,
    costByFeature,
    costByModel,
    costByDay,
    averageCostPerRequest,
  };
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(userId?: string): Promise<{
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestRequests: AIUsageRecord[];
  fastestRequests: AIUsageRecord[];
}> {
  const records = userId
    ? usageRecords.filter((r) => r.userId === userId)
    : usageRecords;

  if (records.length === 0) {
    return {
      averageResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowestRequests: [],
      fastestRequests: [],
    };
  }

  const responseTimes = records
    .map((r) => r.responseTime)
    .sort((a, b) => a - b);
  const averageResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

  const medianResponseTime =
    responseTimes[Math.floor(responseTimes.length / 2)];
  const p95ResponseTime =
    responseTimes[Math.floor(responseTimes.length * 0.95)];
  const p99ResponseTime =
    responseTimes[Math.floor(responseTimes.length * 0.99)];

  const sortedByResponseTime = [...records].sort(
    (a, b) => b.responseTime - a.responseTime,
  );

  return {
    averageResponseTime,
    medianResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    slowestRequests: sortedByResponseTime.slice(0, 10),
    fastestRequests: sortedByResponseTime.slice(-10).reverse(),
  };
}

/**
 * Get user statistics
 */
export async function getUserStatistics(userId: string): Promise<{
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
  recentActivity: AIUsageRecord[];
}> {
  const userRecords = usageRecords.filter((r) => r.userId === userId);

  if (userRecords.length === 0) {
    return {
      totalRequests: 0,
      successRate: 1,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      mostUsedFeatures: [],
      recentActivity: [],
    };
  }

  const totalRequests = userRecords.length;
  const failedRequests = userRecords.filter((r) => !r.success).length;
  const successRate = (totalRequests - failedRequests) / totalRequests;

  const averageResponseTime =
    userRecords.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

  const totalTokensUsed = userRecords.reduce(
    (sum, r) => sum + r.tokenUsage.totalTokens,
    0,
  );

  const totalCost = userRecords.reduce(
    (sum, r) => sum + r.tokenUsage.estimatedCost,
    0,
  );

  const featureCounts: Record<string, number> = {};
  for (const record of userRecords) {
    featureCounts[record.featureType] =
      (featureCounts[record.featureType] || 0) + 1;
  }

  const mostUsedFeatures = Object.entries(featureCounts)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentActivity = userRecords
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return {
    totalRequests,
    successRate,
    averageResponseTime,
    totalTokensUsed,
    totalCost,
    mostUsedFeatures,
    recentActivity,
  };
}

/**
 * Clear all usage records (useful for testing)
 */
export function clearUsageRecords(): void {
  usageRecords.length = 0;
}

/**
 * Export usage records as JSON
 */
export function exportUsageRecords(): string {
  return JSON.stringify(usageRecords, null, 2);
}

/**
 * Import usage records from JSON
 */
export function importUsageRecords(jsonString: string): void {
  try {
    const records = JSON.parse(jsonString) as AIUsageRecord[];
    usageRecords.length = 0;
    usageRecords.push(...records);
  } catch (error) {
    throw new Error("Invalid usage records data format");
  }
}
