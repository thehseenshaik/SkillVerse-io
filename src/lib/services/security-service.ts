/**
 * Security Service
 * Handles security measures for public profiles including rate limiting, CSRF protection, and data validation
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface SecurityConfig {
  enableRateLimiting: boolean;
  enableCSRFProtection: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  rateLimit: RateLimitConfig;
}

export class SecurityService {
  private config: SecurityConfig = {
    enableRateLimiting: true,
    enableCSRFProtection: true,
    enableInputValidation: true,
    enableXSSProtection: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
  };

  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private csrfTokens: Map<string, { token: string; expires: number }> = new Map();

  /**
   * Set security configuration
   */
  setSecurityConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check rate limit
   */
  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() + this.config.rateLimit.windowMs };
    }

    const now = Date.now();
    const stored = this.rateLimitStore.get(identifier);

    if (!stored || now > stored.resetTime) {
      // Reset or create new entry
      const resetTime = now + this.config.rateLimit.windowMs;
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime,
      });
      return { allowed: true, remaining: this.config.rateLimit.maxRequests - 1, resetTime };
    }

    if (stored.count >= this.config.rateLimit.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: stored.resetTime };
    }

    stored.count++;
    this.rateLimitStore.set(identifier, stored);
    return {
      allowed: true,
      remaining: this.config.rateLimit.maxRequests - stored.count,
      resetTime: stored.resetTime,
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(sessionId: string): string {
    if (!this.config.enableCSRFProtection) {
      return "";
    }

    const token = this.generateRandomToken(32);
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    this.csrfTokens.set(sessionId, { token, expires });
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(sessionId: string, token: string): boolean {
    if (!this.config.enableCSRFProtection) {
      return true;
    }

    const stored = this.csrfTokens.get(sessionId);
    if (!stored) return false;

    if (Date.now() > stored.expires) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableInputValidation) {
      return input;
    }

    return input
      .replace(/[<>]/g, "") // Remove < and >
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  /**
   * Validate email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate username
   */
  validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  /**
   * Escape HTML
   */
  escapeHTML(text: string): string {
    if (!this.config.enableXSSProtection) {
      return text;
    }

    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Generate random token
   */
  private generateRandomToken(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Hash string
   */
  async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * Compare hashes
   */
  async compareHash(input: string, hash: string): Promise<boolean> {
    const inputHash = await this.hashString(input);
    return inputHash === hash;
  }

  /**
   * Validate profile access
   */
  validateProfileAccess(userId: string, requesterId: string | null, isPublic: boolean): boolean {
    // If profile is public, allow access
    if (isPublic) {
      return true;
    }

    // If profile is private, only allow owner
    if (!isPublic && requesterId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Sanitize profile data for public view
   */
  sanitizeProfileData(profile: any, isPublic: boolean): any {
    if (!isPublic) {
      return null;
    }

    const sanitized = { ...profile };

    // Remove sensitive fields
    const sensitiveFields = ["email", "phone", "address", "privateNotes", "apiKey", "secret"];
    sensitiveFields.forEach((field) => {
      delete sanitized[field];
    });

    // Sanitize string fields
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = this.sanitizeInput(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Check for suspicious activity
   */
  checkSuspiciousActivity(identifier: string): boolean {
    const rateLimit = this.checkRateLimit(identifier);
    
    // If rate limit exceeded, flag as suspicious
    if (!rateLimit.allowed) {
      return true;
    }

    return false;
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: {
    type: "rate_limit_exceeded" | "csrf_failure" | "invalid_input" | "unauthorized_access";
    identifier: string;
    details?: any;
  }): void {
    // This would typically send to a logging service
    console.warn("Security Event:", event);
  }

  /**
   * Clear expired rate limits
   */
  clearExpiredRateLimits(): void {
    const now = Date.now();
    this.rateLimitStore.forEach((stored, identifier) => {
      if (now > stored.resetTime) {
        this.rateLimitStore.delete(identifier);
      }
    });
  }

  /**
   * Clear expired CSRF tokens
   */
  clearExpiredCSRFTokens(): void {
    const now = Date.now();
    this.csrfTokens.forEach((stored, sessionId) => {
      if (now > stored.expires) {
        this.csrfTokens.delete(sessionId);
      }
    });
  }

  /**
   * Get security statistics
   */
  getSecurityStatistics(): {
    rateLimitEntries: number;
    csrfTokens: number;
    config: SecurityConfig;
  } {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      csrfTokens: this.csrfTokens.size,
      config: this.config,
    };
  }
}

export const securityService = new SecurityService();
