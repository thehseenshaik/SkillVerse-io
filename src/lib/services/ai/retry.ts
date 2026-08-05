/**
 * Retry and Recovery System
 * Handles automatic retries with exponential backoff for failed AI requests
 */

import type { AIRequest, AIResponse, AIErrorCode } from "@/types/ai";
import { AIError } from "@/types/ai";
import { generateResponse } from "./gemini";
import { logAIError } from "./logger";

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: Set<AIErrorCode>;
  nonRetryableErrors: Set<AIErrorCode>;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: new Set([
    "timeout",
    "network_error",
    "rate_limit_exceeded",
    "unknown_error",
  ]),
  nonRetryableErrors: new Set([
    "invalid_api_key",
    "quota_exceeded",
    "content_filter",
    "safety_violation",
    "prompt_injection",
  ]),
};

// ============================================================================
// RETRY FUNCTIONS
// ============================================================================

/**
 * Execute request with retry logic
 */
export async function executeWithRetry(
  request: AIRequest,
  config?: Partial<RetryConfig>,
): Promise<AIResponse> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retryConfig.maxRetries) {
    try {
      // Attempt the request
      const response = await generateResponse(request);

      // If successful, return the response
      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIError) {
        if (!isRetryableError(error.code, retryConfig)) {
          // Non-retryable error, throw immediately
          throw error;
        }

        // Log the retry attempt
        await logAIError({
          requestId: request.id,
          userId: request.userId,
          featureType: request.featureType,
          timestamp: Date.now(),
          level: "warn",
          message: `Retry attempt ${attempt + 1}/${retryConfig.maxRetries} for error: ${error.message}`,
          error: {
            code: error.code,
            message: error.message,
            stack: error.stack,
          },
        });
      }

      attempt++;

      // Check if we should retry
      if (attempt <= retryConfig.maxRetries) {
        // Calculate delay with exponential backoff
        const delay = calculateDelay(attempt, retryConfig);

        // Wait before retrying
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw new AIError(
    `Request failed after ${retryConfig.maxRetries} retries: ${lastError?.message || "Unknown error"}`,
    lastError instanceof AIError ? lastError.code : "unknown_error",
    lastError,
    false,
  );
}

/**
 * Execute request with retry and fallback to backup model
 */
export async function executeWithRetryAndFallback(
  request: AIRequest,
  config?: Partial<RetryConfig>,
): Promise<AIResponse> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let attempt = 0;
  let useBackupModel = false;

  while (attempt <= retryConfig.maxRetries) {
    try {
      // Modify request to use backup model if needed
      const modifiedRequest = useBackupModel
        ? {
            ...request,
            model: (request.model === "gemini-2.5-pro"
              ? "gemini-2.5-flash"
              : "gemini-2.5-pro") as any,
          }
        : request;

      // Attempt the request
      const response = await generateResponse(modifiedRequest);

      // If successful, return the response
      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIError) {
        if (!isRetryableError(error.code, retryConfig)) {
          // Non-retryable error, throw immediately
          throw error;
        }

        // Switch to backup model on quota errors
        if (error.code === "quota_exceeded" && !useBackupModel) {
          useBackupModel = true;
          await logAIError({
            requestId: request.id,
            userId: request.userId,
            featureType: request.featureType,
            timestamp: Date.now(),
            level: "warn",
            message: "Switching to backup model due to quota error",
            error: {
              code: error.code,
              message: error.message,
              stack: error.stack,
            },
          });
        }

        // Log the retry attempt
        await logAIError({
          requestId: request.id,
          userId: request.userId,
          featureType: request.featureType,
          timestamp: Date.now(),
          level: "warn",
          message: `Retry attempt ${attempt + 1}/${retryConfig.maxRetries} (backup model: ${useBackupModel})`,
          error: {
            code: error.code,
            message: error.message,
            stack: error.stack,
          },
        });
      }

      attempt++;

      // Check if we should retry
      if (attempt <= retryConfig.maxRetries) {
        // Calculate delay with exponential backoff
        const delay = calculateDelay(attempt, retryConfig);

        // Wait before retrying
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw new AIError(
    `Request failed after ${retryConfig.maxRetries} retries: ${lastError?.message || "Unknown error"}`,
    lastError instanceof AIError ? lastError.code : "unknown_error",
    lastError,
    false,
  );
}

/**
 * Execute request with circuit breaker pattern
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private successThreshold = 5;
  private failureThreshold = 5;
  private timeout = 60000; // 1 minute

  constructor(config?: {
    failureThreshold?: number;
    successThreshold?: number;
    timeout?: number;
  }) {
    if (config?.failureThreshold)
      this.failureThreshold = config.failureThreshold;
    if (config?.successThreshold)
      this.successThreshold = config.successThreshold;
    if (config?.timeout) this.timeout = config.timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
      } else {
        throw new AIError(
          "Circuit breaker is OPEN - too many failures",
          "unknown_error",
          null,
          false,
        );
      }
    }

    try {
      const result = await fn();

      // Success - reset or close circuit
      if (this.state === "half-open") {
        this.failureCount = 0;
        this.state = "closed";
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      // Failure - increment failure count
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Open circuit if threshold reached
      if (this.failureCount >= this.failureThreshold) {
        this.state = "open";
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = "closed";
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if error is retryable
 */
function isRetryableError(
  errorCode: AIErrorCode,
  config: RetryConfig,
): boolean {
  // If explicitly non-retryable, return false
  if (config.nonRetryableErrors.has(errorCode)) {
    return false;
  }

  // If explicitly retryable, return true
  if (config.retryableErrors.has(errorCode)) {
    return true;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay =
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a retry configuration
 */
export function createRetryConfig(config?: Partial<RetryConfig>): RetryConfig {
  return { ...DEFAULT_RETRY_CONFIG, ...config };
}
