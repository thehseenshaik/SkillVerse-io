/**
 * AI API Endpoints
 * Express API endpoints for AI services with authentication
 */

import express from "express";
import {
  processAIRequest,
  simpleAIRequest,
  healthCheck as aiHealthCheck,
  getAIAnalytics,
} from "./index";
import {
  getRateLimitStatus,
  resetRateLimits,
  setCooldown,
} from "./rateLimiter";
import { getRecentLogs, getLogStatistics, getLogsByUserId } from "./logger";
import {
  getUserStatistics,
  getCostAnalysis,
  getPerformanceMetrics,
} from "./analytics";
import { AIError } from "@/types/ai";

const router = express.Router();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Verify Firebase authentication token
 */
async function verifyAuthToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    // Verify with Firebase Auth
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication verification failed",
    });
  }
}

/**
 * Optional authentication middleware
 */
async function optionalAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
        };
      } catch {
        // Token invalid, but we'll continue without auth
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

// ============================================================================
// AI ENDPOINTS
// ============================================================================

/**
 * POST /api/ai/generate
 * Main AI generation endpoint
 */
router.post("/generate", verifyAuthToken, async (req, res) => {
  try {
    const { featureType, context, options } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!featureType || !context) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: featureType, context",
      });
    }

    const response = await processAIRequest(
      featureType,
      context,
      userId,
      options,
    );

    res.json(response);
  } catch (error) {
    if (error instanceof AIError) {
      res.status(error.code === "rate_limit_exceeded" ? 429 : 500).json({
        success: false,
        message: error.message,
        code: error.code,
        retryable: error.retryable,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
});

/**
 * POST /api/ai/chat
 * Simple chat endpoint for general AI conversations
 */
router.post("/chat", verifyAuthToken, async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: prompt",
      });
    }

    const response = await simpleAIRequest(prompt, userId, options);

    res.json(response);
  } catch (error) {
    if (error instanceof AIError) {
      res.status(error.code === "rate_limit_exceeded" ? 429 : 500).json({
        success: false,
        message: error.message,
        code: error.code,
        retryable: error.retryable,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
});

/**
 * GET /api/ai/status
 * Health check endpoint
 */
router.get("/status", optionalAuth, async (req, res) => {
  try {
    const health = await aiHealthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      healthy: false,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

/**
 * GET /api/ai/usage
 * Get usage statistics for authenticated user
 */
router.get("/usage", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const [analytics, rateLimitStatus] = await Promise.all([
      getAIAnalytics(userId),
      getRateLimitStatus(userId),
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        rateLimit: rateLimitStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch usage statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/ai/analytics
 * Get detailed analytics (admin only)
 */
router.get("/analytics", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if user is admin (you might want to implement proper admin checks)
    // For now, we'll allow all authenticated users to see their own analytics

    const targetUserId = (req.query.userId as string) || userId;

    // Only allow admins to see other users' analytics
    if (targetUserId !== userId) {
      // TODO: Implement admin check
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    const [userStats, costAnalysis, performanceMetrics] = await Promise.all([
      getUserStatistics(targetUserId),
      getCostAnalysis(targetUserId),
      getPerformanceMetrics(targetUserId),
    ]);

    res.json({
      success: true,
      data: {
        userStats,
        costAnalysis,
        performanceMetrics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/ai/logs
 * Get recent logs (admin only)
 */
router.get("/logs", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // TODO: Implement admin check
    // For now, only allow users to see their own logs
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = getLogsByUserId(userId, limit);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/ai/rate-limit
 * Get current rate limit status
 */
router.get("/rate-limit", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const status = getRateLimitStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rate limit status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * POST /api/ai/admin/reset-rate-limit
 * Reset rate limits for a user (admin only)
 */
router.post("/admin/reset-rate-limit", verifyAuthToken, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const adminUserId = req.user?.uid;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: targetUserId",
      });
    }

    // TODO: Implement admin check
    // For now, we'll allow this for demonstration
    resetRateLimits(targetUserId);

    res.json({
      success: true,
      message: "Rate limits reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset rate limits",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/ai/admin/set-cooldown
 * Set cooldown for a user (admin only)
 */
router.post("/admin/set-cooldown", verifyAuthToken, async (req, res) => {
  try {
    const { targetUserId, duration } = req.body;
    const adminUserId = req.user?.uid;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!targetUserId || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: targetUserId, duration",
      });
    }

    // TODO: Implement admin check
    setCooldown(targetUserId, duration);

    res.json({
      success: true,
      message: "Cooldown set successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set cooldown",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/ai/admin/statistics
 * Get global AI statistics (admin only)
 */
router.get("/admin/statistics", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // TODO: Implement admin check
    const [logStats, globalAnalytics] = await Promise.all([
      getLogStatistics(),
      getAIAnalytics(),
    ]);

    res.json({
      success: true,
      data: {
        logs: logStats,
        analytics: globalAnalytics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
