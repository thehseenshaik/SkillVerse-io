const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
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
let genAI = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("✓ Gemini AI initialized");
  console.log("API Key (first 10 chars):", GEMINI_API_KEY.substring(0, 10) + "...");
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

// Chat endpoint with real Gemini AI and SkillVerse knowledge base
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
    console.log("Using model: gemini-1.5-flash");
    console.log("User message:", lastMessage.content);
    
    // Build conversation context
    const conversation = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `You are SkillVerse AI Assistant — a specialized product assistant for SkillVerse platform users.

Your role: Help users navigate SkillVerse, explain features, and provide career guidance specifically for the SkillVerse platform.

CRITICAL RESPONSE RULES:
- Maximum 120 words unless user asks for "explain in detail"
- Greeting → 1 sentence
- Navigation → 2 sentences  
- Skill advice → 3-5 sentences
- Website help → 2-4 sentences
- Never provide long articles unless explicitly requested
- Guide conversations step by step, don't answer everything at once

FORMATTING RULES:
- Use **bold** for main headings and key points
- Use **bold** for subheadings
- Use *italic* for examples, items, and emphasis
- Keep body text normal (not bold or italic)
- Use markdown formatting for structure

CONVERSATION STYLE:
- Be conversational and helpful
- Ask follow-up questions to guide the user
- Don't dump all information at once
- Guide users to take specific actions

SkillVerse features you know:
Authentication, Dashboard, Identity Hub, Resume Analyzer, ATS Score, Career Score, Portfolio, Public Profile, Recruiter View, Interview Coach, Mock Interview, Learning Roadmap, Company Match, Project Review, Portfolio Review, Privacy Settings, Analytics, Username, Themes, Exports, QR Code, Sharing.

Conversation:
${conversation}

Please respond to the last user message in 120 words maximum, be conversational, use proper markdown formatting with bold for headings/subheadings and italic for examples, and end with a relevant question or action suggestion:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text();

    console.log("AI response received successfully");

    // Generate suggestion chips based on context
    const suggestions = generateSuggestions(lastMessage.content);

    res.json({
      reply: reply.trim(),
      suggestions,
      metadata: {
        model: "gemini-1.5-flash",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Handle high demand errors with fallback
    if (error.message && error.message.includes("503")) {
      console.log("Model experiencing high demand, returning fallback response");
      res.json({
        reply: "I apologize, but the AI service is currently experiencing high demand. Please try again in a moment. In the meantime, I can help you with:\n\n• Resume analysis and optimization\n• Interview preparation tips\n• Career guidance and roadmaps\n• Skill development advice\n\nWhat would you like to explore?",
        suggestions: ["Resume analysis", "Interview tips", "Career guidance", "Skill development"],
        metadata: {
          model: "fallback",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    // Handle quota errors with fallback
    if (error.message && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("exceeded"))) {
      console.log("API quota exceeded, returning fallback response");
      res.json({
        reply: "I apologize, but we've reached the daily API usage limit for the AI service. This is a free tier limitation. Please try again later or consider upgrading for unlimited access.\n\nIn the meantime, I can help you with:\n\n• **Resume Analysis** - Upload your resume for ATS scoring\n• **Career Roadmap** - Get personalized career paths\n• **Interview Prep** - Practice mock interviews\n• **Skill Development** - Track your learning progress\n\nVisit the dashboard to explore these features!",
        suggestions: ["Upload resume", "Career roadmap", "Mock interview", "Skill tracking"],
        metadata: {
          model: "fallback",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to process chat request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Generate context-aware suggestions
function generateSuggestions(userMessage) {
  const message = userMessage.toLowerCase();
  const suggestions = [];

  // Context-specific suggestions based on user query
  if (message.includes("resume") || message.includes("cv")) {
    suggestions.push("Analyze my resume", "Check ATS Score", "Improve resume format");
  } else if (message.includes("ats") || message.includes("score")) {
    suggestions.push("How to improve ATS score", "Fix ATS errors", "Optimize keywords");
  } else if (message.includes("interview") || message.includes("mock")) {
    suggestions.push("Practice technical interview", "Common interview questions", "Behavioral interview tips");
  } else if (message.includes("github") || message.includes("connect")) {
    suggestions.push("How to connect GitHub", "LeetCode integration", "Benefits of connecting");
  } else if (message.includes("portfolio") || message.includes("project")) {
    suggestions.push("Build my portfolio", "Project ideas for resume", "Portfolio best practices");
  } else if (message.includes("career") || message.includes("roadmap")) {
    suggestions.push("Create career roadmap", "Skill development plan", "Industry insights");
  } else if (message.includes("profile") || message.includes("setup")) {
    suggestions.push("Complete my profile", "Add skills", "Add experience");
  } else if (message.includes("skill") || message.includes("learning")) {
    suggestions.push("What skills to learn", "DSA preparation", "System design topics");
  } else if (message.includes("job") || message.includes("placement")) {
    suggestions.push("Job search tips", "Resume for placements", "Interview preparation");
  } else if (message.includes("leetcode") || message.includes("dsa")) {
    suggestions.push("DSA problem solving", "LeetCode strategy", "Topic-wise practice");
  } else if (message.includes("system design") || message.includes("design")) {
    suggestions.push("System design basics", "Scale designs", "Common patterns");
  } else {
    // Default suggestions for general queries
    suggestions.push("Analyze my resume", "Career roadmap", "Interview preparation", "Skill development");
  }

  return suggestions.slice(0, 4); // Return max 4 suggestions
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use(
  (err, req, res, next) => {
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

const server = app.listen(PORT, () => {
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

// Keep the process alive
setInterval(() => {
  // Keep the event loop alive
}, 1000);