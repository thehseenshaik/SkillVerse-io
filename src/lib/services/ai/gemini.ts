/**
 * Gemini AI Service
 * Main service for interacting with Google Gemini API
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type {
  AIRequest,
  AIResponse,
  AIModel,
  AIError as AIErrorType,
} from "@/types/ai";
import { AIError } from "@/types/ai";
import { aiConfig, validateConfig, estimateCost } from "./config";

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Initialize Gemini AI client
 * @throws Error if initialization fails
 */
export function initializeGemini(): void {
  try {
    validateConfig();

    if (!genAI) {
      genAI = new GoogleGenerativeAI(aiConfig.apiKey);
    }

    model = genAI.getGenerativeModel({
      model: aiConfig.model,
      generationConfig: {
        temperature: aiConfig.temperature,
        topP: aiConfig.topP,
        topK: aiConfig.topK,
        maxOutputTokens: aiConfig.maxTokens,
      },
    });

    // Verify connection by making a simple request
    verifyConnection();
  } catch (error) {
    throw new AIError(
      "Failed to initialize Gemini AI",
      "unknown_error",
      error,
      false,
    );
  }
}

/**
 * Verify API connection with a simple test request
 */
async function verifyConnection(): Promise<void> {
  try {
    if (!model) {
      throw new Error("Model not initialized");
    }

    const result = await model.generateContent("Test");
    await result.response;
  } catch (error) {
    throw new AIError(
      "Failed to verify Gemini API connection",
      "network_error",
      error,
      false,
    );
  }
}

/**
 * Get the current model instance
 */
function getModel(): GenerativeModel {
  if (!model) {
    initializeGemini();
  }
  return model!;
}

/**
 * Switch to backup model if available
 */
function switchToBackupModel(): void {
  if (aiConfig.backupModel && genAI) {
    model = genAI.getGenerativeModel({
      model: aiConfig.backupModel,
      generationConfig: {
        temperature: aiConfig.temperature,
        topP: aiConfig.topP,
        topK: aiConfig.topK,
        maxOutputTokens: aiConfig.maxTokens,
      },
    });
  }
}

// ============================================================================
// REQUEST GENERATION
// ============================================================================

/**
 * Generate AI response for a given request
 */
export async function generateResponse(
  request: AIRequest,
): Promise<AIResponse> {
  const startTime = Date.now();
  const requestId = request.id;

  try {
    const currentModel = getModel();

    // Prepare the generation config
    const generationConfig = {
      temperature: request.temperature ?? aiConfig.temperature,
      maxOutputTokens: request.maxTokens ?? aiConfig.maxTokens,
    };

    // Generate content
    const result = await currentModel.generateContent(request.prompt);
    const response = await result.response;
    const text = response.text();

    // Calculate token usage (approximate)
    const promptTokens = approximateTokenCount(request.prompt);
    const responseTokens = approximateTokenCount(text);
    const totalTokens = promptTokens + responseTokens;

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Estimate cost
    const costEstimate = estimateCost(
      aiConfig.model,
      promptTokens,
      responseTokens,
    );

    return {
      success: true,
      message: "Request completed successfully",
      data: text,
      metadata: {
        requestId,
        timestamp: Date.now(),
        responseTime,
        model: aiConfig.model,
        provider: aiConfig.provider,
        tokenUsage: {
          promptTokens,
          responseTokens,
          totalTokens,
          estimatedCost: costEstimate,
        },
        costEstimate,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new AIError("Invalid API key", "invalid_api_key", error, false);
      }
      if (error.message.includes("quota")) {
        throw new AIError("API quota exceeded", "quota_exceeded", error, false);
      }
      if (error.message.includes("rate limit")) {
        throw new AIError(
          "Rate limit exceeded",
          "rate_limit_exceeded",
          error,
          true,
        );
      }
      if (error.message.includes("timeout")) {
        throw new AIError("Request timeout", "timeout", error, true);
      }
      if (error.message.includes("safety")) {
        throw new AIError(
          "Content blocked by safety filters",
          "safety_violation",
          error,
          false,
        );
      }
    }

    throw new AIError(
      "Failed to generate AI response",
      "unknown_error",
      error,
      true,
    );
  }
}

/**
 * Generate AI response with retry logic
 */
export async function generateResponseWithRetry(
  request: AIRequest,
  maxRetries: number = aiConfig.maxRetries,
): Promise<AIResponse> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await generateResponse(request);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof AIError) {
        // Don't retry non-retryable errors
        if (!error.retryable) {
          throw error;
        }

        // Switch to backup model on specific errors
        if (error.code === "quota_exceeded" && attempt === 0) {
          switchToBackupModel();
        }
      }

      attempt++;

      if (attempt <= maxRetries) {
        // Exponential backoff
        const delay =
          aiConfig.retryDelay *
          Math.pow(aiConfig.retryBackoffMultiplier, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw new AIError(
    `Failed after ${maxRetries} retries: ${lastError?.message || "Unknown error"}`,
    "unknown_error",
    lastError,
    false,
  );
}

/**
 * Streaming response generation (for future implementation)
 */
export async function generateStreamingResponse(
  request: AIRequest,
): Promise<AsyncGenerator<string>> {
  const currentModel = getModel();

  const result = await currentModel.generateContentStream(request.prompt);

  async function* streamGenerator(): AsyncGenerator<string> {
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }

  return streamGenerator();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Approximate token count (rough estimation)
 * This is a simple approximation - actual token count may vary
 */
function approximateTokenCount(text: string): number {
  // Rough approximation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if the service is initialized
 */
export function isInitialized(): boolean {
  return genAI !== null && model !== null;
}

/**
 * Reset the service (useful for testing or reconfiguration)
 */
export function resetService(): void {
  genAI = null;
  model = null;
}
