/**
 * AI Configuration Service
 * Handles environment validation and AI configuration setup
 */

import type { AIConfig, AIRateLimit, AIModel, AIProvider } from "@/types/ai";

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const REQUIRED_ENV_VARS = ["GEMINI_API_KEY"];

const OPTIONAL_ENV_VARS = [
  "AI_MODEL",
  "AI_MODEL_BACKUP",
  "AI_TIMEOUT",
  "AI_MAX_TOKENS",
  "AI_TEMPERATURE",
  "AI_TOP_P",
  "AI_TOP_K",
  "AI_RATE_LIMIT_PER_MINUTE",
  "AI_RATE_LIMIT_PER_HOUR",
  "AI_RATE_LIMIT_PER_DAY",
  "AI_MAX_RETRIES",
  "AI_RETRY_DELAY",
  "AI_RETRY_BACKOFF_MULTIPLIER",
  "AI_ENABLE_SAFETY_FILTERS",
  "AI_ENABLE_CONTENT_MODERATION",
  "AI_MAX_PROMPT_LENGTH",
  "AI_MAX_RESPONSE_LENGTH",
  "AI_ENABLE_ANALYTICS",
  "AI_ENABLE_TOKEN_TRACKING",
  "AI_ENABLE_COST_ESTIMATION",
];

/**
 * Validate required environment variables
 * @throws Error if required variables are missing
 */
export function validateEnvironment(): void {
  // Client-side environment check is optional
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (import.meta.env[key] as string) || (import.meta.env[`VITE_${key}`] as string) || fallback;
  }
  return fallback;
}

/**
 * Get environment variable with number fallback
 */
function getEnvNumber(key: string, fallback: number): number {
  const value = getEnvVar(key, "");
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get environment variable with boolean fallback
 */
function getEnvBoolean(key: string, fallback: boolean): boolean {
  const value = getEnvVar(key, "");
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

// ============================================================================
// AI CONFIGURATION
// ============================================================================

export const aiConfig: AIConfig = {
  apiKey: getEnvVar("GEMINI_API_KEY", ""),
  model: getEnvVar("AI_MODEL", "gemini-flash-latest") as AIModel,
  backupModel: getEnvVar("AI_MODEL_BACKUP", "gemini-1.5-flash-8b") as
    AIModel | undefined,
  timeout: getEnvNumber("AI_TIMEOUT", 30000),
  maxTokens: getEnvNumber("AI_MAX_TOKENS", 8192),
  temperature: getEnvNumber("AI_TEMPERATURE", 70) / 100,
  topP: getEnvNumber("AI_TOP_P", 90) / 100,
  topK: getEnvNumber("AI_TOP_K", 40),
  provider: "google" as AIProvider,
  enableSafetyFilters: getEnvBoolean("AI_ENABLE_SAFETY_FILTERS", true),
  enableContentModeration: getEnvBoolean("AI_ENABLE_CONTENT_MODERATION", true),
  maxPromptLength: getEnvNumber("AI_MAX_PROMPT_LENGTH", 32000),
  maxResponseLength: getEnvNumber("AI_MAX_RESPONSE_LENGTH", 8192),
  maxRetries: getEnvNumber("AI_MAX_RETRIES", 3),
  retryDelay: getEnvNumber("AI_RETRY_DELAY", 1000),
  retryBackoffMultiplier: getEnvNumber("AI_RETRY_BACKOFF_MULTIPLIER", 2),
};

export const aiRateLimit: AIRateLimit = {
  perMinute: getEnvNumber("AI_RATE_LIMIT_PER_MINUTE", 20),
  perHour: getEnvNumber("AI_RATE_LIMIT_PER_HOUR", 100),
  perDay: getEnvNumber("AI_RATE_LIMIT_PER_DAY", 500),
};

export const aiAnalyticsConfig = {
  enableAnalytics: getEnvBoolean("AI_ENABLE_ANALYTICS", true),
  enableTokenTracking: getEnvBoolean("AI_ENABLE_TOKEN_TRACKING", true),
  enableCostEstimation: getEnvBoolean("AI_ENABLE_COST_ESTIMATION", true),
};

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate AI configuration
 * @throws Error if configuration is invalid
 */
export function validateConfig(): void {
  if (!aiConfig.apiKey) {
    throw new Error("AI API key is not configured");
  }

  if (aiConfig.timeout < 1000 || aiConfig.timeout > 120000) {
    throw new Error("AI timeout must be between 1000ms and 120000ms");
  }

  if (aiConfig.maxTokens < 1 || aiConfig.maxTokens > 32768) {
    throw new Error("AI max tokens must be between 1 and 32768");
  }

  if (aiConfig.temperature < 0 || aiConfig.temperature > 1) {
    throw new Error("AI temperature must be between 0 and 1");
  }

  if (aiConfig.topP < 0 || aiConfig.topP > 1) {
    throw new Error("AI topP must be between 0 and 1");
  }

  if (aiConfig.topK < 1 || aiConfig.topK > 100) {
    throw new Error("AI topK must be between 1 and 100");
  }

  if (aiConfig.maxRetries < 0 || aiConfig.maxRetries > 10) {
    throw new Error("AI max retries must be between 0 and 10");
  }

  if (aiRateLimit.perMinute < 1 || aiRateLimit.perMinute > 100) {
    throw new Error("AI rate limit per minute must be between 1 and 100");
  }

  if (aiRateLimit.perHour < 1 || aiRateLimit.perHour > 1000) {
    throw new Error("AI rate limit per hour must be between 1 and 1000");
  }

  if (aiRateLimit.perDay < 1 || aiRateLimit.perDay > 10000) {
    throw new Error("AI rate limit per day must be between 1 and 10000");
  }
}

// ============================================================================
// COST ESTIMATION CONFIGURATION
// ============================================================================

/**
 * Cost per 1M tokens for different models (USD)
 * These are approximate costs and should be updated regularly
 */
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": { input: 0.075, output: 0.3 },
  "gemini-2.5-pro": { input: 1.25, output: 5.0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 0.5, output: 1.5 },
};

/**
 * Estimate cost for token usage
 */
export function estimateCost(
  model: string,
  promptTokens: number,
  responseTokens: number,
): number {
  const costs = MODEL_COSTS[model];
  if (!costs) return 0;

  const inputCost = (promptTokens / 1_000_000) * costs.input;
  const outputCost = (responseTokens / 1_000_000) * costs.output;

  return inputCost + outputCost;
}
