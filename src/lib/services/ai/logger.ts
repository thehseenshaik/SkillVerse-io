/**
 * AI Logging System
 * Comprehensive logging for AI requests, responses, and errors
 */

import type { AILogEntry } from "@/types/ai";

// ============================================================================
// LOG STORAGE
// ============================================================================

const logEntries: AILogEntry[] = [];
const MAX_LOG_ENTRIES = 10000; // Keep last 10,000 log entries

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Log an AI request
 */
export async function logAIRequest(
  entry: Omit<AILogEntry, "level"> & { level?: AILogEntry["level"] },
): Promise<void> {
  const logEntry: AILogEntry = {
    level: entry.level || "info",
    ...entry,
  };

  addLogEntry(logEntry);
}

/**
 * Log an AI response
 */
export async function logAIResponse(
  entry: Omit<AILogEntry, "level"> & { level?: AILogEntry["level"] },
): Promise<void> {
  const logEntry: AILogEntry = {
    level: entry.level || "info",
    ...entry,
  };

  addLogEntry(logEntry);
}

/**
 * Log an AI error
 */
export async function logAIError(
  entry: Omit<AILogEntry, "level"> & { level?: AILogEntry["level"] },
): Promise<void> {
  const logEntry: AILogEntry = {
    level: entry.level || "error",
    ...entry,
  };

  addLogEntry(logEntry);

  // Also log to console for immediate visibility
  console.error(`[AI Error] ${entry.message}`, entry.error);
}

/**
 * Log a general AI event
 */
export async function logAIEvent(
  entry: Omit<AILogEntry, "level"> & { level?: AILogEntry["level"] },
): Promise<void> {
  const logEntry: AILogEntry = {
    level: entry.level || "info",
    ...entry,
  };

  addLogEntry(logEntry);
}

/**
 * Add log entry to storage
 */
function addLogEntry(entry: AILogEntry): void {
  // Remove sensitive information
  const sanitizedEntry = sanitizeLogEntry(entry);

  // Add to log storage
  logEntries.push(sanitizedEntry);

  // Trim if exceeding max size
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries.shift();
  }

  // Log to console based on level
  if (sanitizedEntry.level === "error") {
    console.error(`[AI] ${sanitizedEntry.message}`, sanitizedEntry);
  } else if (sanitizedEntry.level === "warn") {
    console.warn(`[AI] ${sanitizedEntry.message}`, sanitizedEntry);
  } else if (
    sanitizedEntry.level === "debug" &&
    import.meta.env.VITE_DEBUG === "true"
  ) {
    console.debug(`[AI] ${sanitizedEntry.message}`, sanitizedEntry);
  } else if (
    sanitizedEntry.level === "info" &&
    import.meta.env.VITE_ENABLE_LOGGING === "true"
  ) {
    console.info(`[AI] ${sanitizedEntry.message}`, sanitizedEntry);
  }
}

/**
 * Sanitize log entry to remove sensitive information
 */
function sanitizeLogEntry(entry: AILogEntry): AILogEntry {
  const sanitized = { ...entry };

  // Remove sensitive data from data object
  if (sanitized.data) {
    sanitized.data = removeSensitiveData(sanitized.data);
  }

  // Don't log full prompt/response content in production
  if (import.meta.env.PROD || import.meta.env.VITE_APP_ENV === "production") {
    if (sanitized.data?.prompt) {
      sanitized.data.prompt = "[REDACTED]";
    }
    if (sanitized.data?.response) {
      sanitized.data.response = "[REDACTED]";
    }
  }

  return sanitized;
}

/**
 * Remove sensitive data from object
 */
function removeSensitiveData(data: any): any {
  if (typeof data === "string") {
    // Remove common sensitive patterns
    return data
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****")
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, "**** **** **** ****")
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        "***@***.***",
      );
  }

  if (Array.isArray(data)) {
    return data.map((item) => removeSensitiveData(item));
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip known sensitive keys
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("secret") ||
        key.toLowerCase().includes("key") ||
        key.toLowerCase().includes("api")
      ) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = removeSensitiveData(value);
      }
    }
    return sanitized;
  }

  return data;
}

// ============================================================================
// LOG RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Get log entries for a specific request
 */
export function getLogsByRequestId(requestId: string): AILogEntry[] {
  return logEntries.filter((entry) => entry.requestId === requestId);
}

/**
 * Get log entries for a specific user
 */
export function getLogsByUserId(
  userId: string,
  limit: number = 100,
): AILogEntry[] {
  return logEntries.filter((entry) => entry.userId === userId).slice(-limit);
}

/**
 * Get log entries by feature type
 */
export function getLogsByFeatureType(
  featureType: string,
  limit: number = 100,
): AILogEntry[] {
  return logEntries
    .filter((entry) => entry.featureType === featureType)
    .slice(-limit);
}

/**
 * Get error logs
 */
export function getErrorLogs(limit: number = 100): AILogEntry[] {
  return logEntries.filter((entry) => entry.level === "error").slice(-limit);
}

/**
 * Get recent logs
 */
export function getRecentLogs(limit: number = 100): AILogEntry[] {
  return logEntries.slice(-limit);
}

/**
 * Get logs within a time range
 */
export function getLogsByTimeRange(
  startTime: number,
  endTime: number,
): AILogEntry[] {
  return logEntries.filter(
    (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime,
  );
}

// ============================================================================
// LOG ANALYTICS
// ============================================================================

/**
 * Get log statistics
 */
export function getLogStatistics(): {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByFeature: Record<string, number>;
  errorRate: number;
  averageResponseTime: number;
} {
  const totalLogs = logEntries.length;
  const logsByLevel: Record<string, number> = {};
  const logsByFeature: Record<string, number> = {};
  let errorCount = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;

  for (const entry of logEntries) {
    // Count by level
    logsByLevel[entry.level] = (logsByLevel[entry.level] || 0) + 1;

    // Count by feature
    logsByFeature[entry.featureType] =
      (logsByFeature[entry.featureType] || 0) + 1;

    // Count errors
    if (entry.level === "error") {
      errorCount++;
    }

    // Sum response times
    if (entry.responseTime) {
      totalResponseTime += entry.responseTime;
      responseTimeCount++;
    }
  }

  return {
    totalLogs,
    logsByLevel,
    logsByFeature,
    errorRate: totalLogs > 0 ? errorCount / totalLogs : 0,
    averageResponseTime:
      responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
  };
}

/**
 * Clear all log entries (useful for testing)
 */
export function clearLogs(): void {
  logEntries.length = 0;
}

/**
 * Export logs as JSON
 */
export function exportLogs(): string {
  return JSON.stringify(logEntries, null, 2);
}

/**
 * Import logs from JSON
 */
export function importLogs(jsonString: string): void {
  try {
    const logs = JSON.parse(jsonString) as AILogEntry[];
    logEntries.length = 0;
    logEntries.push(...logs);
  } catch (error) {
    throw new Error("Invalid log data format");
  }
}
