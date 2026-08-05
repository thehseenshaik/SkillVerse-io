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
  console.warn("⚠ GEMINI_API_KEY not set, AI features will be limited");
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

    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: "AI service not configured - GEMINI_API_KEY missing",
      });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") {
      return res.status(400).json({
        success: false,
        error: "Last message must be from user",
      });
    }

    // Use Gemini AI to generate response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Build conversation context
    const conversation = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `You are SkillVerse AI — an AI career coach for students and early-career engineers. Give sharp, actionable advice on placements, interviews, resumes, DSA prep, project ideas and portfolio building. Be concise (max ~180 words unless asked for detail). Use markdown lists for steps. Never invent job offers or claim you can send applications.

Conversation:
${conversation}

Please respond to the last user message:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text();

    res.json({
      reply: reply.trim(),
      metadata: {
        model: "gemini-1.5-flash",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message,
    });
  },
);

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(
    `╔════════════════════════════════════════════════════════════╗`,
  );
  console.log(`║                                                          ║`);
  console.log(`║        SkillVerse AI Server                              ║`);
  console.log(`║                                                          ║`);
  console.log(
    `║        Server running on port ${PORT}                          ║`,
  );
  console.log(`║                                                          ║`);
  console.log(
    `║        Endpoints:                                        ║`,
  );
  console.log(
    `║        GET    /api/health                                 ║`,
  );
  console.log(
    `║        POST   /api/chat                                   ║`,
  );
  console.log(`║                                                          ║`);
  console.log(
    `╚════════════════════════════════════════════════════════════╝`,
  );
});

// Keep the process running
console.log('Server is running. Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
