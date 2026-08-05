# AI Infrastructure Quick Start Guide

## Prerequisites

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Environment Setup**: Copy `.env.example` to `.env` and configure your API key

## Setup Steps

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Start the Server

```bash
# Install dependencies (if not already done)
npm install

# Start the development server with AI backend
npm run dev:server
```

The server will start on:

- Frontend: http://localhost:5173
- AI API: http://localhost:3001

### 3. Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-29T20:00:00.000Z",
  "service": "SkillVerse AI Server",
  "version": "1.0.0"
}
```

## Basic Usage

### 1. Simple Chat Request

```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "prompt": "Tell me about software engineering careers"
  }'
```

### 2. Feature-Based Request (e.g., Resume Analysis)

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "featureType": "resume_analysis",
    "context": {
      "resumeContent": "Your resume text here...",
      "jobDescription": "Job description here..."
    }
  }'
```

## Integration in React Components

### 1. Simple Chat Hook

```typescript
import { useState } from "react";
import { simpleAIRequest } from "@/lib/services/ai";

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (prompt: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await simpleAIRequest(prompt, userId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}
```

### 2. Feature-Based Hook

```typescript
import { processAIRequest } from "@/lib/services/ai";

export async function analyzeResume(
  resumeContent: string,
  jobDescription: string,
  userId: string,
) {
  const response = await processAIRequest(
    "resume_analysis",
    { resumeContent, jobDescription },
    userId,
  );

  if (response.success) {
    return JSON.parse(response.data);
  }

  throw new Error(response.message);
}
```

## Available AI Features

| Feature Type            | Description               | Required Context                                                       |
| ----------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `resume_analysis`       | Analyze and score resumes | `resumeContent`, `jobDescription`                                      |
| `ats_evaluation`        | ATS compatibility check   | `resumeContent`, `jobDescription`                                      |
| `interview_preparation` | Interview coaching        | `candidateProfile`, `targetRole`, `company`, `interviewType`           |
| `skill_gap_analysis`    | Identify skill gaps       | `currentSkills`, `targetRole`, `careerGoals`                           |
| `career_recommendation` | Career path suggestions   | `candidateProfile`, `skills`, `experience`, `interests`, `careerGoals` |
| `learning_roadmap`      | Learning path generation  | `targetSkill`, `currentLevel`, `timeCommitment`, `learningStyle`       |
| `cover_letter`          | Cover letter generation   | `candidateProfile`, `jobDescription`, `company`, `keyHighlights`       |
| `resume_generator`      | Resume creation           | `candidateInfo`, `targetRole`, `experience`, `education`, `skills`     |
| `portfolio_review`      | Portfolio feedback        | `portfolioContent`, `targetAudience`, `goal`                           |
| `company_match`         | Company matching          | `candidateProfile`, `skills`, `targetCompanies`, `preferences`         |
| `career_twin`           | AI career mentor          | `candidateProfile`, `careerHistory`, `currentChallenge`, `careerGoals` |
| `general_chat`          | General career assistance | `userQuery`, `context`                                                 |

## Monitoring & Analytics

### Check Your Usage

```bash
curl -X GET http://localhost:3001/api/ai/usage \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Check Rate Limit Status

```bash
curl -X GET http://localhost:3001/api/ai/rate-limit \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Troubleshooting

### "Missing required environment variables"

- Ensure you've created a `.env` file
- Check that `GEMINI_API_KEY` is set
- Restart the server after changes

### "Invalid API key"

- Verify your API key from Google AI Studio
- Ensure the key has the correct permissions
- Check if the key has expired

### "Rate limit exceeded"

- Wait for the retry period (shown in error message)
- Implement exponential backoff in your client
- Consider upgrading to higher tier for production

### "Safety violation"

- Review your prompt content
- Ensure no harmful or injection patterns
- Contact support if false positive

## Next Steps

1. **Read Full Documentation**: See `AI_INFRASTRUCTURE_README.md` for complete details
2. **Explore Examples**: Check the component examples in the codebase
3. **Run Tests**: Execute `npm test` to verify the installation
4. **Build Features**: Start building AI-powered features for SkillVerse

## Support

For detailed documentation, architecture details, and advanced usage, refer to:

- **Full Documentation**: `AI_INFRASTRUCTURE_README.md`
- **Type Definitions**: `src/types/ai.ts`
- **Service Implementation**: `src/lib/services/ai/`

---

**Ready to build AI-powered features! 🚀**
