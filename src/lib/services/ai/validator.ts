/**
 * Response Validation System
 * Validates AI responses before sending them to the frontend
 */

import type { AIResponse } from "@/types/ai";

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate AI response structure and content
 */
export function validateResponse(response: AIResponse): {
  valid: boolean;
  reason?: string;
  warnings?: string[];
} {
  const warnings: string[] = [];

  // Check basic structure
  if (typeof response.success !== "boolean") {
    return { valid: false, reason: "Response missing 'success' field" };
  }

  if (typeof response.message !== "string") {
    return { valid: false, reason: "Response missing 'message' field" };
  }

  if (!response.metadata) {
    return { valid: false, reason: "Response missing 'metadata' field" };
  }

  // Check metadata structure
  if (!response.metadata.requestId) {
    warnings.push("Response missing 'requestId' in metadata");
  }

  if (!response.metadata.timestamp) {
    warnings.push("Response missing 'timestamp' in metadata");
  }

  if (!response.metadata.model) {
    warnings.push("Response missing 'model' in metadata");
  }

  if (!response.metadata.tokenUsage) {
    warnings.push("Response missing 'tokenUsage' in metadata");
  }

  // Check token usage structure
  if (response.metadata.tokenUsage) {
    const { promptTokens, responseTokens, totalTokens } =
      response.metadata.tokenUsage;

    if (typeof promptTokens !== "number" || promptTokens < 0) {
      warnings.push("Invalid promptTokens in metadata");
    }

    if (typeof responseTokens !== "number" || responseTokens < 0) {
      warnings.push("Invalid responseTokens in metadata");
    }

    if (typeof totalTokens !== "number" || totalTokens < 0) {
      warnings.push("Invalid totalTokens in metadata");
    }

    if (totalTokens !== promptTokens + responseTokens) {
      warnings.push("Token count mismatch in metadata");
    }
  }

  // If response is successful, check data field
  if (response.success) {
    if (response.data === undefined && response.data === null) {
      warnings.push("Successful response missing 'data' field");
    }
  }

  // Validate JSON if data is supposed to be JSON
  if (response.data && typeof response.data === "string") {
    const jsonValidation = validateJSON(response.data);
    if (!jsonValidation.valid) {
      return {
        valid: false,
        reason: `Invalid JSON in response data: ${jsonValidation.reason}`,
      };
    }
  }

  // Check for empty responses
  if (response.success && !response.data && !response.suggestions) {
    return { valid: false, reason: "Response contains no data or suggestions" };
  }

  // Check for response length
  if (response.data && typeof response.data === "string") {
    if (response.data.length === 0) {
      return { valid: false, reason: "Response data is empty" };
    }

    if (response.data.length > 100000) {
      warnings.push("Response data is unusually long");
    }
  }

  // Check confidence score if present
  if (response.confidence !== undefined) {
    if (typeof response.confidence !== "number") {
      warnings.push("Confidence score is not a number");
    } else if (response.confidence < 0 || response.confidence > 1) {
      warnings.push("Confidence score is out of range (0-1)");
    }
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate JSON string
 */
export function validateJSON(jsonString: string): {
  valid: boolean;
  reason?: string;
  parsed?: any;
} {
  try {
    const parsed = JSON.parse(jsonString);
    return { valid: true, parsed };
  } catch (error) {
    return {
      valid: false,
      reason: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Attempt to repair malformed JSON
 */
export function repairJSON(jsonString: string): {
  repaired: boolean;
  result?: string;
  error?: string;
} {
  // Common JSON issues and their fixes
  let repaired = jsonString;

  // Fix trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

  // Fix single quotes instead of double quotes
  repaired = repaired.replace(/'/g, '"');

  // Fix unquoted keys
  repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

  // Fix missing quotes around string values
  repaired = repaired.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, ': "$1"');

  // Try to parse the repaired JSON
  const validation = validateJSON(repaired);
  if (validation.valid) {
    return { repaired: true, result: repaired };
  }

  // If repair failed, return original error
  return {
    repaired: false,
    error: "Could not repair malformed JSON",
  };
}

/**
 * Validate and parse JSON response
 */
export function validateAndParseJSON(response: AIResponse): {
  valid: boolean;
  data?: any;
  error?: string;
} {
  if (!response.data) {
    return { valid: false, error: "Response has no data" };
  }

  if (typeof response.data !== "string") {
    // Data is already parsed
    return { valid: true, data: response.data };
  }

  const validation = validateJSON(response.data);
  if (validation.valid) {
    return { valid: true, data: validation.parsed };
  }

  // Try to repair
  const repairResult = repairJSON(response.data);
  if (repairResult.repaired && repairResult.result) {
    const repairedValidation = validateJSON(repairResult.result);
    if (repairedValidation.valid) {
      return { valid: true, data: repairedValidation.parsed };
    }
  }

  return { valid: false, error: validation.reason };
}

/**
 * Check for common AI hallucination patterns
 */
export function checkHallucinations(response: AIResponse): {
  hasHallucinations: boolean;
  patterns: string[];
} {
  const patterns: string[] = [];
  const data =
    typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);

  // Check for common hallucination indicators
  const hallucinationPatterns = [
    /I apologize, but I don't have access to/i,
    /As an AI language model, I don't/i,
    /I cannot provide/i,
    /This information may not be accurate/i,
    /I'm not sure about/i,
    /It's important to note that/i,
  ];

  for (const pattern of hallucinationPatterns) {
    if (pattern.test(data)) {
      patterns.push("Uncertainty or disclaimer detected");
      break;
    }
  }

  // Check for repetitive content
  const sentences = data.split(/[.!?]+/);
  const uniqueSentences = new Set(sentences.map((s) => s.trim().toLowerCase()));
  if (uniqueSentences.size < sentences.length * 0.5) {
    patterns.push("Highly repetitive content detected");
  }

  // Check for very short responses when detailed ones are expected
  if (data.length < 50 && response.metadata.tokenUsage.responseTokens > 100) {
    patterns.push("Unexpectedly short response");
  }

  return {
    hasHallucinations: patterns.length > 0,
    patterns,
  };
}

/**
 * Validate response against expected schema
 */
export function validateSchema(
  response: AIResponse,
  expectedFields: string[],
): { valid: boolean; missing: string[] } {
  if (!response.data || typeof response.data !== "object") {
    return { valid: false, missing: expectedFields };
  }

  const data = response.data as Record<string, any>;
  const missing = expectedFields.filter((field) => !(field in data));

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize response data
 */
export function sanitizeResponse(response: AIResponse): AIResponse {
  const sanitized = { ...response };

  // Remove any sensitive information that might have been included
  if (sanitized.data) {
    sanitized.data = removeSensitiveInfo(sanitized.data);
  }

  // Ensure no script tags or dangerous content
  if (typeof sanitized.data === "string") {
    sanitized.data = sanitized.data.replace(/<script[^>]*>.*?<\/script>/gi, "");
  }

  return sanitized;
}

/**
 * Remove potentially sensitive information from response
 */
function removeSensitiveInfo(data: any): any {
  if (typeof data === "string") {
    // Remove common sensitive patterns
    return data
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****") // SSN pattern
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, "**** **** **** ****") // Credit card pattern
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        "***@***.***",
      ); // Email pattern
  }

  if (Array.isArray(data)) {
    return data.map((item) => removeSensitiveInfo(item));
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = removeSensitiveInfo(value);
    }
    return sanitized;
  }

  return data;
}
