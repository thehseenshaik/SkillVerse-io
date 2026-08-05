# AI API Reference

Complete API reference for SkillVerse AI infrastructure endpoints.

## Base URL

```
http://localhost:3001/api/ai
```

## Authentication

All endpoints require Firebase authentication via Bearer token:

```
Authorization: Bearer <firebase_id_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {/* Response data */},
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

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "error_code",
  "retryable": true
}
```

## Endpoints

### 1. Generate AI Response

Process AI requests using predefined prompt templates.

**Endpoint:** `POST /generate`

**Authentication:** Required

**Request Body:**

```typescript
{
  featureType: "resume_analysis" | "ats_evaluation" | "interview_preparation" |
               "skill_gap_analysis" | "career_recommendation" | "learning_roadmap" |
               "cover_letter" | "resume_generator" | "portfolio_review" |
               "company_match" | "career_twin" | "general_chat";
  context: Record<string, any>;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    skipRateLimit?: boolean;
    skipSafety?: boolean;
  };
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "featureType": "resume_analysis",
    "context": {
      "resumeContent": "John Doe\nSoftware Engineer...",
      "jobDescription": "Senior Software Engineer position..."
    },
    "options": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "score": 85,
    "strengths": ["Strong technical skills", "Clear progression"],
    "weaknesses": ["Missing quantifiable achievements"],
    "atsCompatibility": {
      "score": 80,
      "issues": ["Some keywords missing"],
      "recommendations": ["Add more industry keywords"]
    }
  },
  "metadata": {
    "requestId": "ai_1234567890_abc",
    "timestamp": 1722297600000,
    "responseTime": 2340,
    "model": "gemini-2.5-flash",
    "provider": "google",
    "tokenUsage": {
      "promptTokens": 1500,
      "responseTokens": 800,
      "totalTokens": 2300,
      "estimatedCost": 0.0023
    }
  }
}
```

**Error Codes:**

- `400` - Invalid request body
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Internal server error

---

### 2. Simple Chat

Simple AI chat for general conversations without templates.

**Endpoint:** `POST /chat`

**Authentication:** Required

**Request Body:**

```typescript
{
  prompt: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "What are the key skills for a software engineer?",
    "options": {
      "temperature": 0.7
    }
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": "Key skills for a software engineer include...",
  "metadata": {
    "requestId": "ai_1234567890_def",
    "timestamp": 1722297600000,
    "responseTime": 1200,
    "model": "gemini-2.5-flash",
    "provider": "google",
    "tokenUsage": {
      "promptTokens": 20,
      "responseTokens": 150,
      "totalTokens": 170,
      "estimatedCost": 0.0002
    }
  }
}
```

---

### 3. Health Check

Check the health status of the AI service.

**Endpoint:** `GET /status`

**Authentication:** Optional

**Example Request:**

```bash
curl -X GET http://localhost:3001/api/ai/status
```

**Example Response:**

```json
{
  "healthy": true,
  "details": {
    "timestamp": "2026-07-29T20:00:00.000Z",
    "totalRequests": 1523,
    "successRate": 0.96,
    "averageResponseTime": 1850
  }
}
```

---

### 4. Usage Statistics

Get usage statistics for the authenticated user.

**Endpoint:** `GET /usage`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET http://localhost:3001/api/ai/usage \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalRequests": 45,
      "failedRequests": 2,
      "successRate": 0.956,
      "averageResponseTime": 2100,
      "totalTokensUsed": 12500,
      "totalCost": 0.0125,
      "featureUsage": {
        "resume_analysis": 15,
        "interview_preparation": 10,
        "general_chat": 20
      },
      "dailyUsage": [
        {
          "date": "2026-07-28",
          "requests": 25,
          "tokens": 7500,
          "cost": 0.0075,
          "errors": 1
        }
      ],
      "modelUsage": {
        "gemini-2.5-flash": 45
      },
      "errorDistribution": {
        "rate_limit_exceeded": 1,
        "timeout": 1
      }
    },
    "rateLimit": {
      "perMinute": {
        "used": 5,
        "limit": 20,
        "resetIn": 45
      },
      "perHour": {
        "used": 15,
        "limit": 100,
        "resetIn": 3000
      },
      "perDay": {
        "used": 45,
        "limit": 500,
        "resetIn": 72000
      }
    }
  }
}
```

---

### 5. Detailed Analytics

Get detailed analytics (admin only).

**Endpoint:** `GET /analytics`

**Authentication:** Required (Admin)

**Query Parameters:**

- `userId` (optional) - Target user ID (admin only)

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/ai/analytics?userId=user_123" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "userStats": {
      "totalRequests": 45,
      "successRate": 0.956,
      "averageResponseTime": 2100,
      "totalTokensUsed": 12500,
      "totalCost": 0.0125,
      "mostUsedFeatures": [
        { "feature": "resume_analysis", "count": 15 },
        { "feature": "general_chat", "count": 20 }
      ],
      "recentActivity": []
    },
    "costAnalysis": {
      "totalCost": 0.0125,
      "costByFeature": {
        "resume_analysis": 0.005,
        "general_chat": 0.0075
      },
      "costByModel": {
        "gemini-2.5-flash": 0.0125
      },
      "costByDay": [
        {
          "date": "2026-07-28",
          "requests": 25,
          "tokens": 7500,
          "cost": 0.0075,
          "errors": 1
        }
      ],
      "averageCostPerRequest": 0.00028
    },
    "performanceMetrics": {
      "averageResponseTime": 2100,
      "medianResponseTime": 1950,
      "p95ResponseTime": 3500,
      "p99ResponseTime": 4200,
      "slowestRequests": [],
      "fastestRequests": []
    }
  }
}
```

---

### 6. Recent Logs

Get recent AI operation logs (admin only).

**Endpoint:** `GET /logs`

**Authentication:** Required (Admin)

**Query Parameters:**

- `limit` (optional) - Number of logs to return (default: 100)

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/ai/logs?limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "requestId": "ai_1234567890_abc",
      "userId": "user_123",
      "featureType": "resume_analysis",
      "timestamp": 1722297600000,
      "level": "info",
      "message": "AI request completed successfully",
      "tokenUsage": {
        "promptTokens": 1500,
        "responseTokens": 800,
        "totalTokens": 2300,
        "estimatedCost": 0.0023
      },
      "responseTime": 2340
    }
  ]
}
```

---

### 7. Rate Limit Status

Get current rate limit status for the authenticated user.

**Endpoint:** `GET /rate-limit`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET http://localhost:3001/api/ai/rate-limit \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "perMinute": {
      "used": 5,
      "limit": 20,
      "resetIn": 45
    },
    "perHour": {
      "used": 15,
      "limit": 100,
      "resetIn": 3000
    },
    "perDay": {
      "used": 45,
      "limit": 500,
      "resetIn": 72000
    }
  }
}
```

---

## Admin Endpoints

### 8. Reset Rate Limit

Reset rate limits for a specific user (admin only).

**Endpoint:** `POST /admin/reset-rate-limit`

**Authentication:** Required (Admin)

**Request Body:**

```typescript
{
  targetUserId: string;
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/ai/admin/reset-rate-limit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "targetUserId": "user_123"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Rate limits reset successfully"
}
```

---

### 9. Set Cooldown

Set a cooldown period for a specific user (admin only).

**Endpoint:** `POST /admin/set-cooldown`

**Authentication:** Required (Admin)

**Request Body:**

```typescript
{
  targetUserId: string;
  duration: number; // Duration in milliseconds
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/ai/admin/set-cooldown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "targetUserId": "user_123",
    "duration": 300000
  }'
```

**Example Response:**

```json
{
  "success": true,
  "message": "Cooldown set successfully"
}
```

---

### 10. Global Statistics

Get global AI statistics (admin only).

**Endpoint:** `GET /admin/statistics`

**Authentication:** Required (Admin)

**Example Request:**

```bash
curl -X GET http://localhost:3001/api/ai/admin/statistics \
  -H "Authorization: Bearer <admin_token>"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "logs": {
      "totalLogs": 1500,
      "logsByLevel": {
        "info": 1200,
        "warn": 200,
        "error": 100
      },
      "logsByFeature": {
        "resume_analysis": 500,
        "general_chat": 600,
        "interview_preparation": 400
      },
      "errorRate": 0.067,
      "averageResponseTime": 1950
    },
    "analytics": {
      "totalRequests": 1500,
      "failedRequests": 100,
      "successRate": 0.933,
      "averageResponseTime": 1950,
      "totalTokensUsed": 450000,
      "totalCost": 0.45,
      "featureUsage": {
        "resume_analysis": 500,
        "general_chat": 600,
        "interview_preparation": 400
      },
      "dailyUsage": [],
      "modelUsage": {
        "gemini-2.5-flash": 1500
      },
      "errorDistribution": {
        "rate_limit_exceeded": 50,
        "timeout": 30,
        "unknown_error": 20
      }
    }
  }
}
```

---

## Error Codes

| Code                  | Description                   | Retryable |
| --------------------- | ----------------------------- | --------- |
| `invalid_api_key`     | API key is invalid or expired | No        |
| `quota_exceeded`      | API quota exceeded            | No        |
| `rate_limit_exceeded` | Rate limit exceeded           | Yes       |
| `timeout`             | Request timeout               | Yes       |
| `network_error`       | Network connectivity issue    | Yes       |
| `invalid_response`    | Invalid AI response           | Yes       |
| `content_filter`      | Content blocked by filters    | No        |
| `safety_violation`    | Safety violation detected     | No        |
| `prompt_injection`    | Prompt injection attempt      | No        |
| `unknown_error`       | Unknown error                 | Yes       |

## Rate Limits

Default rate limits per user:

- **Per Minute:** 20 requests
- **Per Hour:** 100 requests
- **Per Day:** 500 requests

Rate limit headers are included in responses:

```
X-RateLimit-Limit-Minute: 20
X-RateLimit-Remaining-Minute: 15
X-RateLimit-Reset-Minute: 45
```

## Feature Types

Complete list of available AI feature types:

1. `resume_analysis` - Resume analysis and scoring
2. `ats_evaluation` - ATS compatibility evaluation
3. `interview_preparation` - Interview coaching
4. `skill_gap_analysis` - Skill gap identification
5. `career_recommendation` - Career path recommendations
6. `learning_roadmap` - Learning path generation
7. `cover_letter` - Cover letter generation
8. `resume_generator` - Resume creation
9. `portfolio_review` - Portfolio feedback
10. `company_match` - Company matching
11. `career_twin` - AI career mentor
12. `general_chat` - General career assistance

## SDK Integration

### JavaScript/TypeScript

```typescript
import { processAIRequest } from "@/lib/services/ai";

const response = await processAIRequest(
  "resume_analysis",
  { resumeContent: "...", jobDescription: "..." },
  userId,
);
```

### Python (using requests)

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'featureType': 'resume_analysis',
    'context': {
        'resumeContent': '...',
        'jobDescription': '...'
    }
}

response = requests.post(
    'http://localhost:3001/api/ai/generate',
    headers=headers,
    json=data
)

result = response.json()
```

---

**Last Updated:** 2026-07-29
**API Version:** 1.0.0
