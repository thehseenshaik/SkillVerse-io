/**
 * Main AI Service
 * Central service layer for all AI operations in SkillVerse
 */

import type {
  AIRequest,
  AIResponse,
  AIFeatureType,
  AIPromptContext,
} from "@/types/ai";
import { generateResponseWithRetry } from "./gemini";
import { getPromptTemplate } from "./promptManager";
import { validateResponse } from "./validator";
import { checkSafety } from "./safety";
import { checkRateLimit, recordRateLimitUsage } from "./rateLimiter";
import { logAIRequest, logAIResponse, logAIError } from "./logger";
import { recordUsage, getAnalytics } from "./analytics";
import { AIError } from "@/types/ai";
import {
  getCachedResponse,
  cacheResponse,
  generateCacheKey,
  measurePerformance,
} from "./performance";

// ============================================================================
// MAIN AI SERVICE
// ============================================================================

/**
 * Main entry point for AI requests
 * This is the primary service that all AI features should use
 */
export async function processAIRequest(
  featureType: AIFeatureType,
  context: AIPromptContext,
  userId: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    skipRateLimit?: boolean;
    skipSafety?: boolean;
    skipCache?: boolean;
  },
): Promise<AIResponse> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Start performance measurement
  const endPerformanceMeasure = measurePerformance("ai_request", {
    featureType,
    userId,
  });

  // Check cache if not skipped
  if (!options?.skipCache) {
    const cacheKey = generateCacheKey(featureType, context);
    const cachedResponse = getCachedResponse(cacheKey);

    if (cachedResponse) {
      endPerformanceMeasure();

      return {
        success: true,
        message: "Request completed successfully (cached)",
        data: cachedResponse,
        metadata: {
          requestId,
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
          model: options?.model || "gemini-2.5-flash",
          provider: "google",
          tokenUsage: {
            promptTokens: 0,
            responseTokens: 0,
            totalTokens: 0,
            estimatedCost: 0,
          },
          cached: true,
        },
      };
    }
  }

  try {
    // Step 1: Check rate limits
    if (!options?.skipRateLimit) {
      const rateLimitCheck = await checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        throw new AIError(
          `Rate limit exceeded. Please try again after ${rateLimitCheck.retryAfter} seconds`,
          "rate_limit_exceeded",
          null,
          false,
        );
      }
    }

    // Step 2: Get prompt template
    const promptTemplate = getPromptTemplate(featureType);
    if (!promptTemplate) {
      throw new AIError(
        `No prompt template found for feature type: ${featureType}`,
        "unknown_error",
        null,
        false,
      );
    }

    // Step 3: Build prompt from template
    const prompt = buildPrompt(promptTemplate.template, context);
    const systemInstruction = promptTemplate.systemInstruction;

    // Step 4: Safety check
    if (!options?.skipSafety) {
      const safetyCheck = await checkSafety(prompt);
      if (!safetyCheck.safe) {
        throw new AIError(
          `Request blocked by safety filters: ${safetyCheck.reason}`,
          "safety_violation",
          null,
          false,
        );
      }
    }

    // Step 5: Create AI request
    const aiRequest: AIRequest = {
      id: requestId,
      userId,
      featureType,
      prompt,
      systemInstruction,
      context,
      model: options?.model as any,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    };

    // Step 6: Log the request
    await logAIRequest({
      requestId,
      userId,
      featureType,
      timestamp: Date.now(),
      level: "info",
      message: "AI request initiated",
      data: {
        model: aiRequest.model,
        temperature: aiRequest.temperature,
        context: Object.keys(context),
      },
    });

    // Step 7: Generate response with retry logic
    const response = await generateResponseWithRetry(aiRequest);

    // Step 8: Validate response
    const validationResult = validateResponse(response);
    if (!validationResult.valid) {
      throw new AIError(
        `Invalid AI response: ${validationResult.reason}`,
        "invalid_response",
        null,
        true,
      );
    }

    // Step 9: Record rate limit usage
    if (!options?.skipRateLimit) {
      await recordRateLimitUsage(userId);
    }

    // Step 10: Record usage analytics
    await recordUsage({
      userId,
      requestId,
      featureType,
      timestamp: Date.now(),
      tokenUsage: response.metadata.tokenUsage,
      responseTime: response.metadata.responseTime,
      success: true,
      model: response.metadata.model,
    });

    // Step 11: Log the response
    await logAIResponse({
      requestId,
      userId,
      featureType,
      timestamp: Date.now(),
      level: "info",
      message: "AI request completed successfully",
      tokenUsage: response.metadata.tokenUsage,
      responseTime: response.metadata.responseTime,
    });

    // Step 12: Cache the response if caching is enabled
    if (!options?.skipCache && response.data) {
      const cacheKey = generateCacheKey(featureType, context);
      const cacheTTL = 300000; // 5 minutes default TTL
      cacheResponse(cacheKey, String(response.data), cacheTTL);
    }

    // End performance measurement
    endPerformanceMeasure();

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // End performance measurement even on error
    endPerformanceMeasure();

    // Log the error
    await logAIError({
      requestId,
      userId,
      featureType,
      timestamp: Date.now(),
      level: "error",
      message: "AI request failed",
      error:
        error instanceof AIError
          ? {
              code: error.code,
              message: error.message,
              stack: error.stack,
            }
          : {
              code: "unknown_error",
              message: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            },
      responseTime,
    });

    // Record failed usage
    await recordUsage({
      userId,
      requestId,
      featureType,
      timestamp: Date.now(),
      tokenUsage: {
        promptTokens: 0,
        responseTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
      },
      responseTime,
      success: false,
      errorCode: error instanceof AIError ? error.code : "unknown_error",
      model: (options?.model as any) || "gemini-2.5-flash",
    });

    // Re-throw the error
    throw error;
  }
}

/**
 * Simple AI request without all the safety checks
 * For internal use where safety is already guaranteed
 */
export async function simpleAIRequest(
  prompt: string,
  userId: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  },
): Promise<AIResponse> {
  const requestId = generateRequestId();

  const aiRequest: AIRequest = {
    id: requestId,
    userId,
    featureType: "general_chat",
    prompt,
    model: options?.model as any,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  };

  return await generateResponseWithRetry(aiRequest);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Build prompt from template with context variables
 */
function buildPrompt(template: string, context: AIPromptContext): string {
  let prompt = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`;
    const replacement = String(value);
    prompt = prompt.replace(new RegExp(placeholder, "g"), replacement);
  }

  return prompt;
}

/**
 * Get AI analytics summary
 */
export async function getAIAnalytics(userId?: string) {
  return await getAnalytics(userId);
}

/**
 * Health check for AI service
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  details: {
    timestamp: string;
    totalRequests?: number;
    successRate?: number;
    averageResponseTime?: number;
    error?: string;
  };
}> {
  try {
    const analytics = await getAnalytics();

    return {
      healthy: true,
      details: {
        timestamp: new Date().toISOString(),
        totalRequests: analytics.totalRequests,
        successRate: analytics.successRate,
        averageResponseTime: analytics.averageResponseTime,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      details: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
