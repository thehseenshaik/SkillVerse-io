# SkillVerse AI Infrastructure Documentation

## Overview

The SkillVerse AI Infrastructure is a production-ready, comprehensive AI service layer designed to power all AI features across the platform. This infrastructure provides a unified interface for interacting with AI models, with built-in safety, rate limiting, analytics, and multi-model support.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup & Configuration](#setup--configuration)
3. [Core Components](#core-components)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Safety & Security](#safety--security)
7. [Rate Limiting](#rate-limiting)
8. [Analytics & Monitoring](#analytics--monitoring)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Future Extensions](#future-extensions)

---

## Architecture

### Component Structure

```
src/lib/services/ai/
├── index.ts              # Main AI service entry point
├── config.ts             # Environment configuration & validation
├── gemini.ts             # Google Gemini API integration
├── promptManager.ts      # Centralized prompt templates
├── validator.ts          # Response validation & sanitization
├── safety.ts             # Safety filters & content moderation
├── rateLimiter.ts        # Rate limiting system
├── logger.ts             # Comprehensive logging
├── analytics.ts          # Usage analytics & cost tracking
├── retry.ts              # Retry logic with exponential backoff
├── multiModel.ts         # Multi-model architecture
├── api.ts                # Express API endpoints
└── __tests__/
    └── ai.test.ts        # Test suite
```

### Data Flow

```
User Request → API Endpoint → Authentication → Rate Limiting → Safety Check
→ Prompt Management → AI Generation → Response Validation → Analytics Recording
→ Response to User
```

---

## Setup & Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
AI_MODEL_BACKUP=gemini-2.5-pro
AI_TIMEOUT=30000
AI_MAX_TOKENS=8192
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
AI_TOP_K=40

# Rate Limiting
AI_RATE_LIMIT_PER_MINUTE=20
AI_RATE_LIMIT_PER_HOUR=100
AI_RATE_LIMIT_PER_DAY=500

# Retry Configuration
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000
AI_RETRY_BACKOFF_MULTIPLIER=2

# Safety Settings
AI_ENABLE_SAFETY_FILTERS=true
AI_ENABLE_CONTENT_MODERATION=true
AI_MAX_PROMPT_LENGTH=32000
AI_MAX_RESPONSE_LENGTH=8192

# Analytics
AI_ENABLE_ANALYTICS=true
AI_ENABLE_TOKEN_TRACKING=true
AI_ENABLE_COST_ESTIMATION=true
```

### Installation

The AI infrastructure is already integrated into the SkillVerse project. The required dependencies are:

```json
{
  "@google/generative-ai": "^0.24.1"
}
```

### Initialization

The AI service initializes automatically when the server starts. The initialization process includes:

1. Environment variable validation
2. Configuration validation
3. Gemini API client initialization
4. Connection verification

---

## Core Components

### 1. Main AI Service (`index.ts`)

The main entry point for all AI operations. Provides two primary functions:

#### `processAIRequest()`

For complex AI features with prompt templates:

```typescript
import { processAIRequest } from "@/lib/services/ai";

const response = await processAIRequest(
  "resume_analysis", // Feature type
  {
    // Context
    resumeContent: "...",
    jobDescription: "...",
  },
  "user_123", // User ID
  {
    // Options
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 4096,
  },
);
```

#### `simpleAIRequest()`

For simple AI requests without templates:

```typescript
import { simpleAIRequest } from "@/lib/services/ai";

const response = await simpleAIRequest(
  "Tell me about software engineering",
  "user_123",
);
```

### 2. Configuration (`config.ts`)

Handles environment validation and AI configuration settings.

**Key Functions:**

- `validateEnvironment()` - Validates required environment variables
- `validateConfig()` - Validates AI configuration
- `estimateCost()` - Estimates token costs

### 3. Gemini Integration (`gemini.ts`)

Direct integration with Google Gemini API.

**Key Functions:**

- `initializeGemini()` - Initializes the Gemini client
- `generateResponse()` - Generates AI responses
- `generateResponseWithRetry()` - Generates responses with retry logic
- `generateStreamingResponse()` - Streaming responses (future)

### 4. Prompt Manager (`promptManager.ts`)

Centralized prompt templates for all AI features.

**Available Templates:**

- `resume_analysis` - Resume analysis and feedback
- `ats_evaluation` - ATS compatibility evaluation
- `interview_preparation` - Interview preparation guidance
- `skill_gap_analysis` - Skill gap analysis
- `career_recommendation` - Career path recommendations
- `learning_roadmap` - Learning path generation
- `cover_letter` - Cover letter generation
- `resume_generator` - Resume generation
- `portfolio_review` - Portfolio review
- `company_match` - Company matching
- `career_twin` - AI career mentor
- `general_chat` - General career assistance

**Key Functions:**

- `getPromptTemplate()` - Get template by feature type
- `validateTemplateVariables()` - Validate template context

### 5. Response Validator (`validator.ts`)

Validates and sanitizes AI responses.

**Key Functions:**

- `validateResponse()` - Validates response structure
- `validateJSON()` - Validates JSON strings
- `repairJSON()` - Attempts to repair malformed JSON
- `checkHallucinations()` - Detects AI hallucinations
- `sanitizeResponse()` - Removes sensitive information

### 6. Safety Layer (`safety.ts`)

Implements safety filters and content moderation.

**Safety Checks:**

- Prompt injection detection
- Jailbreak attempt detection
- Harmful content filtering
- Offensive content blocking
- Custom pattern matching

**Key Functions:**

- `checkSafety()` - Comprehensive safety check
- `sanitizePrompt()` - Sanitizes user prompts
- `removeSystemInstructions()` - Removes system instruction attempts

### 7. Rate Limiter (`rateLimiter.ts`)

Implements per-user rate limiting.

**Rate Limits:**

- Per-minute limit (default: 20)
- Per-hour limit (default: 100)
- Per-day limit (default: 500)

**Key Functions:**

- `checkRateLimit()` - Checks if user is within limits
- `recordRateLimitUsage()` - Records API usage
- `getRateLimitStatus()` - Gets current rate limit status

### 8. Logger (`logger.ts`)

Comprehensive logging system for AI operations.

**Log Levels:**

- `info` - General information
- `warn` - Warning messages
- `error` - Error messages
- `debug` - Debug messages

**Key Functions:**

- `logAIRequest()` - Logs AI requests
- `logAIResponse()` - Logs AI responses
- `logAIError()` - Logs AI errors
- `getLogsByUserId()` - Retrieves logs by user

### 9. Analytics (`analytics.ts`)

Tracks usage, performance, and costs.

**Metrics Tracked:**

- Total requests
- Success/failure rates
- Response times
- Token usage
- Cost estimation
- Feature usage patterns

**Key Functions:**

- `recordUsage()` - Records usage data
- `getAnalytics()` - Gets analytics summary
- `getUserStatistics()` - Gets user-specific statistics
- `getCostAnalysis()` - Gets cost breakdown

### 10. Retry System (`retry.ts`)

Implements retry logic with exponential backoff.

**Features:**

- Configurable retry limits
- Exponential backoff
- Circuit breaker pattern
- Automatic fallback to backup model

**Key Functions:**

- `executeWithRetry()` - Execute with retry logic
- `executeWithRetryAndFallback()` - Execute with model fallback
- `CircuitBreaker` - Circuit breaker implementation

### 11. Multi-Model Architecture (`multiModel.ts`)

Abstraction layer for multiple AI providers.

**Supported Providers:**

- Google Gemini (implemented)
- OpenAI (future)
- Anthropic Claude (future)
- DeepSeek (future)
- Grok (future)

**Key Functions:**

- `registerProvider()` - Register new provider
- `generateWithProvider()` - Generate with specific provider
- `generateWithFallback()` - Generate with automatic fallback

---

## API Endpoints

### Authentication

All endpoints require Firebase authentication via Bearer token:

```
Authorization: Bearer <firebase_token>
```

### Endpoints

#### POST `/api/ai/generate`

Main AI generation endpoint for template-based features.

**Request:**

```json
{
  "featureType": "resume_analysis",
  "context": {
    "resumeContent": "...",
    "jobDescription": "..."
  },
  "options": {
    "model": "gemini-2.5-flash",
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {/* AI response data */},
  "metadata": {
    "requestId": "ai_1234567890_abc",
    "timestamp": 1234567890,
    "responseTime": 1500,
    "model": "gemini-2.5-flash",
    "provider": "google",
    "tokenUsage": {
      "promptTokens": 100,
      "responseTokens": 200,
      "totalTokens": 300,
      "estimatedCost": 0.001
    }
  }
}
```

#### POST `/api/ai/chat`

Simple chat endpoint for general AI conversations.

**Request:**

```json
{
  "prompt": "Tell me about software engineering careers",
  "options": {
    "temperature": 0.7
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": "AI response text",
  "metadata": {/* ... */}
}
```

#### GET `/api/ai/status`

Health check endpoint.

**Response:**

```json
{
  "healthy": true,
  "details": {
    "timestamp": "2026-07-29T20:00:00.000Z",
    "totalRequests": 1000,
    "successRate": 0.95,
    "averageResponseTime": 1500
  }
}
```

#### GET `/api/ai/usage`

Get usage statistics for authenticated user.

**Response:**

```json
{
  "success": true,
  "data": {
    "analytics": {/* Analytics data */},
    "rateLimit": {
      "perMinute": { "used": 5, "limit": 20, "resetIn": 45 },
      "perHour": { "used": 15, "limit": 100, "resetIn": 3000 },
      "perDay": { "used": 50, "limit": 500, "resetIn": 72000 }
    }
  }
}
```

#### GET `/api/ai/analytics`

Get detailed analytics (admin only).

#### GET `/api/ai/logs`

Get recent logs (admin only).

#### GET `/api/ai/rate-limit`

Get current rate limit status.

#### POST `/api/ai/admin/reset-rate-limit`

Reset rate limits for a user (admin only).

#### POST `/api/ai/admin/set-cooldown`

Set cooldown for a user (admin only).

#### GET `/api/ai/admin/statistics`

Get global AI statistics (admin only).

---

## Usage Examples

### Resume Analysis

```typescript
import { processAIRequest } from "@/lib/services/ai";

const response = await processAIRequest(
  "resume_analysis",
  {
    resumeContent: userResumeText,
    jobDescription: jobDescriptionText,
  },
  userId,
);

if (response.success) {
  const analysis = JSON.parse(response.data);
  console.log("Resume Score:", analysis.score);
  console.log("Strengths:", analysis.strengths);
  console.log("Weaknesses:", analysis.weaknesses);
}
```

### Interview Preparation

```typescript
const response = await processAIRequest(
  "interview_preparation",
  {
    candidateProfile: userProfile,
    targetRole: "Senior Software Engineer",
    company: "Google",
    interviewType: "technical",
  },
  userId,
);
```

### Career Recommendations

```typescript
const response = await processAIRequest(
  "career_recommendation",
  {
    candidateProfile: userProfile,
    skills: userSkills,
    experience: workExperience,
    interests: careerInterests,
    careerGoals: longTermGoals,
  },
  userId,
);
```

### Simple Chat

```typescript
import { simpleAIRequest } from "@/lib/services/ai";

const response = await simpleAIRequest(
  "What are the best practices for resume writing?",
  userId,
);
```

---

## Safety & Security

### Safety Features

1. **Prompt Injection Detection**
   - Detects attempts to override system instructions
   - Blocks common injection patterns

2. **Jailbreak Detection**
   - Identifies jailbreak attempts
   - Blocks DAN mode and similar patterns

3. **Content Filtering**
   - Filters harmful content
   - Blocks offensive language
   - Custom pattern matching

4. **Response Sanitization**
   - Removes sensitive information
   - Sanitizes HTML/Scripts
   - Redacts PII patterns

### Security Best Practices

1. **API Key Security**
   - Never expose API keys to frontend
   - Use environment variables
   - Rotate keys regularly

2. **Authentication**
   - All endpoints require Firebase auth
   - Verify tokens on each request
   - Implement proper authorization

3. **Rate Limiting**
   - Per-user limits prevent abuse
   - Cooldown periods for violations
   - Admin override capabilities

4. **Logging**
   - Log all AI operations
   - Sanitize logs to remove sensitive data
   - Monitor for suspicious patterns

---

## Rate Limiting

### Default Limits

- **Per Minute:** 20 requests
- **Per Hour:** 100 requests
- **Per Day:** 500 requests

### Rate Limit Response

When limits are exceeded:

```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again after 45 seconds",
  "code": "rate_limit_exceeded",
  "retryable": true
}
```

### Checking Rate Limit Status

```typescript
import { getRateLimitStatus } from "@/lib/services/ai/rateLimiter";

const status = getRateLimitStatus(userId);
console.log(
  "Per-minute usage:",
  status.perMinute.used,
  "/",
  status.perMinute.limit,
);
```

---

## Analytics & Monitoring

### Available Metrics

1. **Request Metrics**
   - Total requests
   - Success/failure rates
   - Average response time

2. **Usage Metrics**
   - Token usage (prompt/response/total)
   - Cost estimation
   - Feature usage patterns

3. **User Metrics**
   - Per-user statistics
   - Most-used features
   - Recent activity

### Accessing Analytics

```typescript
import { getAIAnalytics, getUserStatistics } from "@/lib/services/ai/analytics";

// Global analytics
const globalAnalytics = await getAIAnalytics();

// User-specific analytics
const userStats = await getUserStatistics(userId);
```

### Cost Tracking

```typescript
import { getCostAnalysis } from "@/lib/services/ai/analytics";

const costAnalysis = await getCostAnalysis(userId);
console.log("Total cost:", costAnalysis.totalCost);
console.log("Cost by feature:", costAnalysis.costByFeature);
```

---

## Error Handling

### Error Types

```typescript
type AIErrorCode =
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
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "error_code",
  "retryable": true
}
```

### Handling Errors

```typescript
import { processAIRequest } from "@/lib/services/ai";
import { AIError } from "@/types/ai";

try {
  const response = await processAIRequest(/* ... */);
} catch (error) {
  if (error instanceof AIError) {
    console.error("AI Error:", error.message);
    console.error("Error Code:", error.code);
    console.error("Retryable:", error.retryable);

    if (error.retryable) {
      // Implement retry logic
    }
  }
}
```

---

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

The test suite covers:

- Prompt management
- Response validation
- Safety checks
- Rate limiting
- Error handling
- Integration tests

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";
import { getPromptTemplate } from "../promptManager";

describe("Prompt Templates", () => {
  it("should return resume analysis template", () => {
    const template = getPromptTemplate("resume_analysis");
    expect(template).toBeDefined();
    expect(template?.featureType).toBe("resume_analysis");
  });
});
```

---

## Future Extensions

### Adding New AI Features

1. **Define Feature Type**

   ```typescript
   // src/types/ai.ts
   export type AIFeatureType = "existing_feature" | "your_new_feature";
   ```

2. **Create Prompt Template**

   ```typescript
   // src/lib/services/ai/promptManager.ts
   your_new_feature: {
     id: "your_new_feature_v1",
     name: "Your New Feature",
     featureType: "your_new_feature",
     template: "Your prompt template with {{variables}}",
     variables: ["variable1", "variable2"],
     // ...
   }
   ```

3. **Use the Feature**
   ```typescript
   const response = await processAIRequest(
     "your_new_feature",
     { variable1: "value1", variable2: "value2" },
     userId,
   );
   ```

### Adding New AI Providers

1. **Implement Provider Interface**

   ```typescript
   class YourProvider implements AIProviderClient {
     async initialize(): Promise<void> {
       /* ... */
     }
     async generateResponse(request: AIRequest): Promise<AIResponse> {
       /* ... */
     }
     async healthCheck(): Promise<boolean> {
       /* ... */
     }
     isInitialized(): boolean {
       /* ... */
     }
   }
   ```

2. **Register Provider**

   ```typescript
   registerProvider("your_provider", new YourProvider());
   ```

3. **Add Environment Variables**
   ```bash
   YOUR_PROVIDER_API_KEY=your_api_key
   ```

### Database Integration

For production, consider:

- Storing analytics in Firestore
- Persistent rate limiting
- Audit logging
- User preferences

### Caching

Implement caching for:

- Frequently used prompts
- Common responses
- User preferences
- Rate limit status

---

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure `GEMINI_API_KEY` is set in `.env`
   - Restart the server after adding variables

2. **"Failed to verify Gemini API connection"**
   - Check API key validity
   - Verify network connectivity
   - Check API quota

3. **"Rate limit exceeded"**
   - Implement exponential backoff
   - Display retry time to users
   - Consider upgrading limits for premium users

4. **"Safety violation"**
   - Review safety filters
   - Adjust sensitivity if needed
   - Provide feedback to users

### Debug Mode

Enable debug logging:

```bash
VITE_DEBUG=true
VITE_ENABLE_LOGGING=true
```

---

## Performance Optimization

### Current Optimizations

1. **Connection Reuse**
   - Persistent Gemini client connections
   - Efficient HTTP connection pooling

2. **Request Batching**
   - Batch analytics recording
   - Aggregate log writes

3. **Memory Management**
   - Limited log storage (10,000 entries)
   - Limited usage records (100,000 entries)
   - Automatic cleanup

### Future Optimizations

1. **Response Caching**
   - Cache common responses
   - Implement TTL-based expiration

2. **Request Queuing**
   - Queue high-volume requests
   - Implement priority levels

3. **Database Integration**
   - Persistent analytics storage
   - Distributed rate limiting

---

## Support & Contributing

For issues, questions, or contributions:

1. Check this documentation first
2. Review existing code patterns
3. Follow the established architecture
4. Add tests for new features
5. Update documentation accordingly

---

## License

This AI infrastructure is part of SkillVerse and follows the same license terms.

---

**Last Updated:** 2026-07-29
**Version:** 1.0.0
