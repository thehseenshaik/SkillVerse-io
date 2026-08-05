/**
 * AI Safety Layer
 * Filters harmful prompts, detects injection attempts, and ensures safe AI interactions
 */

import type { AISafetyCheck, AISafetyConfig } from "@/types/ai";

// ============================================================================
// SAFETY CONFIGURATION
// ============================================================================

const safetyConfig: AISafetyConfig = {
  enablePromptInjectionDetection: true,
  enableJailbreakDetection: true,
  enableContentFiltering: true,
  maxHarmfulContentThreshold: 0.5,
  blockOffensiveContent: true,
  customBlockedPatterns: [
    // Add custom patterns here if needed
  ],
};

// ============================================================================
// HARMFUL PATTERNS
// ============================================================================

const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?(previous|above) instructions/gi,
  /disregard (all )?(previous|above) instructions/gi,
  /forget (all )?(previous|above) instructions/gi,
  /override (all )?(previous|above) instructions/gi,
  /new instructions?:/gi,
  /system: /gi,
  /developer: /gi,
  /admin: /gi,
  /as an (ai|assistant), you must/gi,
  /you are now/gi,
  /pretend (you are|to be)/gi,
  /roleplay as/gi,
  /act as/gi,
  /assume the role of/gi,
  /from now on/gi,
  /starting now/gi,
  /beginning now/gi,
];

const JAILBREAK_PATTERNS = [
  /d(an|awn)\s*(your )?chain/gi,
  /unlock your (full )?potential/gi,
  /bypass your (safety )?filters/gi,
  /disable your (safety )?protocols/gi,
  /ignore your (safety )?guidelines/gi,
  /break your (programming|rules)/gi,
  /go beyond your (programming|limitations)/gi,
  /execute any command/gi,
  /no restrictions/gi,
  /without (any )?limitations/gi,
  /unrestricted mode/gi,
  /developer mode/gi,
  /god mode/gi,
  /premium mode/gi,
  /pro mode/gi,
];

const HARMFUL_CONTENT_PATTERNS = [
  /how to (make|create|build|manufacture) (a )?(bomb|explosive|weapon|poison|drug)/gi,
  /how to (kill|murder|assassinate|harm|hurt)/gi,
  /how to (hack|crack|bypass|exploit) (a )?(password|system|network|account)/gi,
  /how to (steal|rob|theft)/gi,
  /how to (commit|perform) (fraud|scam)/gi,
  /how to (create|generate) (fake|false) (identity|documents|information)/gi,
  /how to ( laundering|wash )?money/gi,
  /how to (evade|avoid) (tax|taxes|the law)/gi,
  /how to (abuse|exploit|manipulate)/gi,
  /instructions for (illegal|criminal)/gi,
];

const OFFENSIVE_CONTENT_PATTERNS = [
  /\b(nigger|nigga|faggot|fag|kike|spic|chink|gook|wetback)\b/gi,
  /\b(retard|retarded|mongoloid)\b/gi,
  /\b(cunt|bitch|whore|slut)\b/gi,
  /\b(kill|die) (yourself|yourself)\b/gi,
  /\b(rape|sexual assault)\b/gi,
  /\b(terrorist|terrorism)\b/gi,
  /\b(genocide|ethnic cleansing)\b/gi,
];

// ============================================================================
// SAFETY CHECK FUNCTIONS
// ============================================================================

/**
 * Main safety check function
 * Combines all safety checks into a single comprehensive check
 */
export async function checkSafety(
  prompt: string,
  config?: Partial<AISafetyConfig>,
): Promise<AISafetyCheck> {
  const currentConfig = { ...safetyConfig, ...config };

  // Check for prompt injection
  if (currentConfig.enablePromptInjectionDetection) {
    const injectionCheck = checkPromptInjection(prompt);
    if (!injectionCheck.safe) {
      return injectionCheck;
    }
  }

  // Check for jailbreak attempts
  if (currentConfig.enableJailbreakDetection) {
    const jailbreakCheck = checkJailbreak(prompt);
    if (!jailbreakCheck.safe) {
      return jailbreakCheck;
    }
  }

  // Check for harmful content
  if (currentConfig.enableContentFiltering) {
    const harmfulCheck = checkHarmfulContent(prompt);
    if (!harmfulCheck.safe) {
      return harmfulCheck;
    }
  }

  // Check for offensive content
  if (currentConfig.blockOffensiveContent) {
    const offensiveCheck = checkOffensiveContent(prompt);
    if (!offensiveCheck.safe) {
      return offensiveCheck;
    }
  }

  // Check custom patterns
  if (
    currentConfig.customBlockedPatterns &&
    currentConfig.customBlockedPatterns.length > 0
  ) {
    const customCheck = checkCustomPatterns(
      prompt,
      currentConfig.customBlockedPatterns,
    );
    if (!customCheck.safe) {
      return customCheck;
    }
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

/**
 * Check for prompt injection attempts
 */
function checkPromptInjection(prompt: string): AISafetyCheck {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: "Prompt injection attempt detected",
        category: "injection",
        confidence: 0.9,
      };
    }
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

/**
 * Check for jailbreak attempts
 */
function checkJailbreak(prompt: string): AISafetyCheck {
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: "Jailbreak attempt detected",
        category: "jailbreak",
        confidence: 0.95,
      };
    }
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

/**
 * Check for harmful content
 */
function checkHarmfulContent(prompt: string): AISafetyCheck {
  let matchCount = 0;
  const totalPatterns = HARMFUL_CONTENT_PATTERNS.length;

  for (const pattern of HARMFUL_CONTENT_PATTERNS) {
    if (pattern.test(prompt)) {
      matchCount++;
    }
  }

  if (matchCount > 0) {
    const confidence = matchCount / totalPatterns;
    return {
      safe: false,
      reason: "Harmful content detected",
      category: "harmful",
      confidence: Math.min(confidence + 0.3, 1.0),
    };
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

/**
 * Check for offensive content
 */
function checkOffensiveContent(prompt: string): AISafetyCheck {
  for (const pattern of OFFENSIVE_CONTENT_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: "Offensive content detected",
        category: "offensive",
        confidence: 0.95,
      };
    }
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

/**
 * Check custom blocked patterns
 */
function checkCustomPatterns(
  prompt: string,
  patterns: string[],
): AISafetyCheck {
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern, "gi");
      if (regex.test(prompt)) {
        return {
          safe: false,
          reason: "Custom blocked pattern detected",
          category: "unsafe",
          confidence: 0.9,
        };
      }
    } catch (error) {
      // Invalid regex pattern, skip it
      console.warn(`Invalid custom pattern: ${pattern}`);
    }
  }

  return {
    safe: true,
    confidence: 1.0,
  };
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize prompt by removing or redacting unsafe content
 */
export function sanitizePrompt(prompt: string): string {
  let sanitized = prompt;

  // Remove prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Remove jailbreak patterns
  for (const pattern of JAILBREAK_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Remove harmful content patterns
  for (const pattern of HARMFUL_CONTENT_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  // Remove offensive content patterns
  for (const pattern of OFFENSIVE_CONTENT_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  return sanitized;
}

/**
 * Truncate prompt to maximum safe length
 */
export function truncatePrompt(prompt: string, maxLength: number): string {
  if (prompt.length <= maxLength) {
    return prompt;
  }

  // Truncate at word boundary
  const truncated = prompt.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Remove system instruction attempts from user prompts
 */
export function removeSystemInstructions(prompt: string): string {
  // Remove lines that look like system instructions
  const lines = prompt.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim().toLowerCase();
    return (
      !trimmed.startsWith("system:") &&
      !trimmed.startsWith("developer:") &&
      !trimmed.startsWith("admin:") &&
      !trimmed.startsWith("instruction:")
    );
  });

  return filtered.join("\n");
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Update safety configuration
 */
export function updateSafetyConfig(config: Partial<AISafetyConfig>): void {
  Object.assign(safetyConfig, config);
}

/**
 * Get current safety configuration
 */
export function getSafetyConfig(): AISafetyConfig {
  return { ...safetyConfig };
}

/**
 * Add custom blocked pattern
 */
export function addCustomBlockedPattern(pattern: string): void {
  try {
    // Test if pattern is valid regex
    new RegExp(pattern);
    safetyConfig.customBlockedPatterns?.push(pattern);
  } catch (error) {
    throw new Error(`Invalid regex pattern: ${pattern}`);
  }
}

/**
 * Remove custom blocked pattern
 */
export function removeCustomBlockedPattern(pattern: string): void {
  if (safetyConfig.customBlockedPatterns) {
    safetyConfig.customBlockedPatterns =
      safetyConfig.customBlockedPatterns.filter((p) => p !== pattern);
  }
}
