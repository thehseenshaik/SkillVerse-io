import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// AI CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("✓ Gemini AI initialized");
} else {
  console.warn("⚠ GEMINI_API_KEY not set, AI features will run in fallback mode");
}

// Helper to generate fallback responses when API key is missing or model fails
function generateFallbackResponse(userPrompt: string): { reply: string; suggestions: string[] } {
  const query = userPrompt.toLowerCase();
  
  if (query.includes("resume") || query.includes("ats")) {
    return {
      reply: "**SkillVerse Resume & ATS Analysis**:\n\n1. **Format & Parsing**: Use single-column layouts without complex tables to ensure high ATS parse rates.\n2. **Action Verbs**: Start every bullet point with strong verbs (e.g., *Engineered*, *Architected*, *Optimized*).\n3. **Metrics**: Quantify achievements (e.g., *Reduced latency by 40%* or *Built REST APIs handling 5k req/sec*).\n4. **Tech Stack**: Clearly group skills into Languages, Frameworks, and Tools.",
      suggestions: ["Career roadmap", "Mock interview", "Profile review"]
    };
  }

  if (query.includes("roadmap") || query.includes("career") || query.includes("path")) {
    return {
      reply: "**Software Engineer Career Roadmap**:\n\n1. **Core Fundamentals**: Master Data Structures & Algorithms (Array, Trees, Dynamic Programming).\n2. **Backend / Full-Stack**: Master Java Spring Boot or Node.js + SQL/NoSQL databases.\n3. **Project Portfolio**: Build 2-3 production-grade applications with authentication and CI/CD pipelines.\n4. **Developer Activity**: Sync your GitHub & LeetCode profiles to track daily momentum.",
      suggestions: ["Analyze my resume", "Mock interview", "Connect platforms"]
    };
  }

  if (query.includes("interview") || query.includes("mock")) {
    return {
      reply: "**Technical Interview Preparation Strategy**:\n\n1. **STAR Method**: Frame behavioral questions (Situation, Task, Action, Result).\n2. **System Design Fundamentals**: Practice caching, database indexing, load balancing, and RESTful design.\n3. **Live Coding**: Practice articulating your thought process out loud while solving DSA problems.",
      suggestions: ["Improve ATS score", "Career roadmap", "Profile review"]
    };
  }

  return {
    reply: `Here is your career advice for: **${userPrompt}**\n\n1. **Focus on Projects**: Build production-ready full-stack applications with clear documentation.\n2. **Solve Daily Challenges**: Solve 1-2 LeetCode problems daily to maintain contest rating and DSA fluency.\n3. **Complete SkillVerse Profile**: Ensure your education, projects, and platform connections are up to date.`,
    suggestions: ["Analyze my resume", "Career roadmap", "Mock interview"]
  };
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "SkillVerse AI Server",
    version: "1.0.0",
    aiEnabled: !!genAI,
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "Invalid messages format",
      });
    }

    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || "Career guidance";

    if (!genAI) {
      const fallback = generateFallbackResponse(userContent);
      return res.json({
        reply: fallback.reply,
        suggestions: fallback.suggestions,
        metadata: { model: "fallback-mode", timestamp: new Date().toISOString() }
      });
    }

    // Try Gemini model families
    const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
    let replyText = "";

    const conversation = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `You are SkillVerse AI — an AI career coach for students and early-career engineers. Give sharp, actionable advice on placements, interviews, resumes, DSA prep, project ideas and portfolio building. Be concise (max ~180 words unless asked for detail). Use markdown lists for steps. Never invent job offers or claim you can send applications.

Conversation:
${conversation}

Please respond to the last user message:`;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        replyText = result.response.text();
        if (replyText) break;
      } catch (e) {
        console.warn(`Model ${modelName} attempt failed, trying fallback model...`);
      }
    }

    if (!replyText) {
      const fallback = generateFallbackResponse(userContent);
      replyText = fallback.reply;
    }

    res.json({
      reply: replyText.trim(),
      suggestions: ["Analyze my resume", "Career roadmap", "Mock interview", "Profile review"],
      metadata: {
        model: "gemini-ai",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const lastMsg = req.body?.messages?.[req.body?.messages?.length - 1]?.content || "Career guidance";
    const fallback = generateFallbackResponse(lastMsg);
    res.json({
      reply: fallback.reply,
      suggestions: fallback.suggestions,
      metadata: { model: "error-fallback", timestamp: new Date().toISOString() }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                 SKILLVERSE AI BACKEND SERVER              ║
  ╠═══════════════════════════════════════════════════════════╣
  ║  Server running on: http://localhost:${PORT}               ║
  ║  Endpoints:                                               ║
  ║    GET  /api/health                                       ║
  ║    POST /api/chat                                         ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});
