/**
 * AI Type Definitions for SkillVerse
 * Comprehensive type system for AI features and infrastructure
 */

// ============================================================================
// CORE AI TYPES
// ============================================================================

export type AIModel =
  "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-1.5-flash" | "gemini-1.5-pro";

export type AIProvider =
  "google" | "openai" | "anthropic" | "deepseek" | "grok";

export type AIFeatureType =
  | "resume_analysis"
  | "ats_evaluation"
  | "interview_preparation"
  | "skill_gap_analysis"
  | "career_recommendation"
  | "career_score"
  | "learning_roadmap"
  | "cover_letter"
  | "resume_generator"
  | "portfolio_review"
  | "company_match"
  | "project_review"
  | "learning_recommendations"
  | "career_twin"
  | "general_chat";

// ============================================================================
// AI REQUEST TYPES
// ============================================================================

export interface AIRequest {
  id: string;
  userId: string;
  featureType: AIFeatureType;
  prompt: string;
  systemInstruction?: string;
  context?: Record<string, any>;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  metadata?: AIRequestMetadata;
}

export interface AIRequestMetadata {
  requestId: string;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  source?: "web" | "mobile" | "api";
}

// ============================================================================
// AI RESPONSE TYPES
// ============================================================================

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
  confidence?: number;
  warnings?: string[];
  metadata: AIResponseMetadata;
}

export interface AIResponseMetadata {
  requestId: string;
  timestamp: number;
  responseTime: number;
  model: AIModel;
  provider: AIProvider;
  tokenUsage: TokenUsage;
  costEstimate?: number;
  cached?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

// ============================================================================
// AI ERROR TYPES
// ============================================================================

export type AIErrorCode =
  | "invalid_api_key"
  | "quota_exceeded"
  | "rate_limit_exceeded"
  | "timeout"
  | "network_error"
  | "invalid_response"
  | "content_filter"
  | "safety_violation"
  | "prompt_injection"
  | "unknown_error";

export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public originalError?: any,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = "AIError";
  }
}

// ============================================================================
// AI CONFIGURATION TYPES
// ============================================================================

export interface AIConfig {
  apiKey: string;
  model: AIModel;
  backupModel?: AIModel;
  timeout: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  provider: AIProvider;
  enableSafetyFilters: boolean;
  enableContentModeration: boolean;
  maxPromptLength: number;
  maxResponseLength: number;
  maxRetries: number;
  retryDelay: number;
  retryBackoffMultiplier: number;
}

export interface AIRateLimit {
  perMinute: number;
  perHour: number;
  perDay: number;
}

// ============================================================================
// AI ANALYTICS TYPES
// ============================================================================

export interface AIAnalytics {
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  featureUsage: Record<AIFeatureType, number>;
  dailyUsage: DailyUsage[];
  modelUsage: Record<AIModel, number>;
  errorDistribution: Record<AIErrorCode, number>;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
  errors: number;
}

export interface AIUsageRecord {
  userId: string;
  requestId: string;
  featureType: AIFeatureType;
  timestamp: number;
  tokenUsage: TokenUsage;
  responseTime: number;
  success: boolean;
  errorCode?: AIErrorCode;
  model: AIModel;
}

// ============================================================================
// AI SAFETY TYPES
// ============================================================================

export interface AISafetyCheck {
  safe: boolean;
  reason?: string;
  category?: "harmful" | "injection" | "jailbreak" | "offensive" | "unsafe";
  confidence: number;
}

export interface AISafetyConfig {
  enablePromptInjectionDetection: boolean;
  enableJailbreakDetection: boolean;
  enableContentFiltering: boolean;
  maxHarmfulContentThreshold: number;
  blockOffensiveContent: boolean;
  customBlockedPatterns?: string[];
}

// ============================================================================
// AI PROMPT TYPES
// ============================================================================

export interface AIPromptTemplate {
  id: string;
  name: string;
  featureType: AIFeatureType;
  template: string;
  variables: string[];
  systemInstruction?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIPromptContext {
  [key: string]: any;
}

// ============================================================================
// AI RATE LIMITING TYPES
// ============================================================================

export interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastRequestTime: number;
}

export interface UserRateLimit {
  userId: string;
  perMinute: RateLimitRecord;
  perHour: RateLimitRecord;
  perDay: RateLimitRecord;
  cooldownUntil?: number;
}

// ============================================================================
// AI LOGGING TYPES
// ============================================================================

export interface AILogEntry {
  requestId: string;
  userId: string;
  featureType: AIFeatureType;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, any>;
  error?: {
    code: AIErrorCode;
    message: string;
    stack?: string;
  };
  tokenUsage?: TokenUsage;
  responseTime?: number;
}
