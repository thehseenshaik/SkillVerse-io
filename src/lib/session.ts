/**
 * Session Management Utilities
 * Handles session persistence, token refresh, auto logout, and device management
 */

import {
  onAuthStateChanged,
  signOut as fbSignOut,
  type User as FbUser,
} from "firebase/auth";
import { fbAuth } from "@/lib/firebase";
import type { SessionData } from "@/types/user";

const SESSION_KEY = "skillverse.session";
const SESSIONS_KEY = "skillverse.sessions";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute

let inactivityTimer: NodeJS.Timeout | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;
let isMonitorRunning = false;

/**
 * Get current session data from localStorage
 */
export function getCurrentSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch {
    return null;
  }
}

/**
 * Save current session data to localStorage
 */
export function saveCurrentSession(session: SessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

/**
 * Clear current session from localStorage
 */
export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Get all sessions for the user
 */
export function getAllSessions(): SessionData[] {
  try {
    const sessionsStr = localStorage.getItem(SESSIONS_KEY);
    return sessionsStr ? JSON.parse(sessionsStr) : [];
  } catch {
    return [];
  }
}

/**
 * Save all sessions
 */
export function saveAllSessions(sessions: SessionData[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions:", error);
  }
}

/**
 * Create a new session
 */
export function createSession(user: FbUser): SessionData {
  const session: SessionData = {
    userId: user.uid,
    token: user.refreshToken || "",
    refreshToken: user.refreshToken || "",
    expiresAt: Date.now() + 3600 * 1000, // 1 hour default
    deviceInfo: getDeviceInfo(),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  // Save current session
  saveCurrentSession(session);

  // Add to sessions list
  const sessions = getAllSessions();
  const existingIndex = sessions.findIndex(
    (s) =>
      s.userId === user.uid &&
      s.deviceInfo.deviceType === session.deviceInfo.deviceType,
  );

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  saveAllSessions(sessions);

  return session;
}

/**
 * Update session last active time
 */
export function updateSessionActivity(): void {
  const session = getCurrentSession();
  if (session) {
    session.lastActiveAt = Date.now();
    saveCurrentSession(session);

    // Update in sessions list
    const sessions = getAllSessions();
    const index = sessions.findIndex(
      (s) =>
        s.userId === session.userId &&
        s.deviceInfo.deviceType === session.deviceInfo.deviceType,
    );
    if (index >= 0) {
      sessions[index].lastActiveAt = Date.now();
      saveAllSessions(sessions);
    }
  }
}

/**
 * Delete a specific session
 */
export function deleteSession(sessionId: string): void {
  const sessions = getAllSessions();
  const filtered = sessions.filter((s) => s.token !== sessionId);
  saveAllSessions(filtered);
}

/**
 * Delete all sessions except current
 */
export function deleteOtherSessions(currentUserId: string): void {
  const currentSession = getCurrentSession();
  const sessions = getAllSessions();

  if (currentSession) {
    const filtered = sessions.filter(
      (s) => s.userId === currentUserId && s.token === currentSession.token,
    );
    saveAllSessions(filtered);
  }
}

/**
 * Delete all sessions for a user
 */
export function deleteAllSessions(userId: string): void {
  const sessions = getAllSessions();
  const filtered = sessions.filter((s) => s.userId !== userId);
  saveAllSessions(filtered);
  clearCurrentSession();
}

/**
 * Get device information
 */
function getDeviceInfo(): SessionData["deviceInfo"] {
  const userAgent = navigator.userAgent;

  let deviceType = "desktop";
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = "tablet";
  }

  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return {
    deviceType,
    browser,
    os,
  };
}

// Store event listener functions for cleanup
let eventListeners: Array<{ event: string; handler: () => void }> = [];

/**
 * Start inactivity monitoring
 * Modified to not trigger on page refresh - uses storage events and session persistence
 */
export function startInactivityMonitor(callback: () => void): void {
  if (isMonitorRunning) {
    console.log("Inactivity monitor already running, skipping...");
    return;
  }

  isMonitorRunning = true;
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(callback, INACTIVITY_TIMEOUT);
  };

  // Reset timer on user activity
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
  events.forEach((event) => {
    window.addEventListener(event, resetTimer);
    eventListeners.push({ event, handler: resetTimer });
  });

  // Handle page visibility changes (tab switching, etc.)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User returned to tab, reset timer
      resetTimer();
      updateSessionActivity();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  eventListeners.push({ event: 'visibilitychange', handler: handleVisibilityChange });

  // Initial timer
  resetTimer();

  // Update session activity periodically
  sessionCheckInterval = setInterval(() => {
    updateSessionActivity();
  }, SESSION_CHECK_INTERVAL);
}

/**
 * Stop inactivity monitoring
 */
export function stopInactivityMonitor(): void {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }

  // Remove all event listeners including visibilitychange
  eventListeners.forEach(({ event, handler }) => {
    if (event === 'visibilitychange') {
      document.removeEventListener(event, handler);
    } else {
      window.removeEventListener(event, handler);
    }
  });
  eventListeners = [];
  
  isMonitorRunning = false;
}

/**
 * Check if session is expired
 */
export function isSessionExpired(): boolean {
  const session = getCurrentSession();
  if (!session) return true;

  return Date.now() > session.expiresAt;
}

/**
 * Auto logout on inactivity
 * Only logs out user if they're actually inactive, not on page refresh
 */
export function setupAutoLogout(): void {
  const handleAutoLogout = async () => {
    try {
      console.log("[Session] Auto-logout triggered due to inactivity");
      await fbSignOut(fbAuth());
      clearCurrentSession();
      window.location.href = "/login?reason=inactivity";
    } catch (error) {
      console.error("Auto logout failed:", error);
    }
  };

  // Only start inactivity monitor if user is authenticated and monitor not already running
  const auth = fbAuth();
  if (auth.currentUser && !isMonitorRunning) {
    console.log("[Session] Starting inactivity monitor for user:", auth.currentUser.email);
    startInactivityMonitor(handleAutoLogout);
  }
}

/**
 * Setup remember me functionality
 * Modified to not interfere with Firebase session persistence
 */
export function setupRememberMe(): void {
  const rememberMe = localStorage.getItem("skillverse.rememberMe");

  // Firebase handles session persistence automatically
  // We only use rememberMe for UI preferences, not session management
  if (rememberMe !== "true") {
    console.log("[Session] Remember me is disabled, but Firebase will still persist session");
  }
}

/**
 * Warn before leaving with unsaved changes
 */
export function setupUnsavedChangesWarning(
  hasUnsavedChanges: () => boolean,
): () => void {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}

/**
 * Get all sessions info for display
 */
export function getAllSessionsInfo(): Array<{
  deviceType: string;
  browser: string;
  os: string;
  lastActive: string;
  isCurrent: boolean;
  token: string;
}> {
  const sessions = getAllSessions();
  const currentSession = getCurrentSession();

  return sessions.map((session) => {
    const lastActiveDate = new Date(session.lastActiveAt);
    const timeAgo = getTimeAgo(lastActiveDate);

    return {
      deviceType: session.deviceInfo.deviceType,
      browser: session.deviceInfo.browser,
      os: session.deviceInfo.os,
      lastActive: timeAgo,
      isCurrent: currentSession?.token === session.token,
      token: session.token,
    };
  });
}

/**
 * Get time ago string
 */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

/**
 * Initialize session management
 */
export function initializeSessionManagement(): () => void {
  // Setup remember me
  setupRememberMe();

  // Listen for auth state changes
  // This runs once when auth state is determined, including on page refresh
  const unsubscribe = onAuthStateChanged(fbAuth(), (user) => {
    console.log("[Session] Auth state changed:", user ? `User: ${user.email}` : "No user");
    
    if (user) {
      createSession(user);
      // Only setup auto logout after user is authenticated
      setupAutoLogout();
    } else {
      // User signed out or not authenticated
      clearCurrentSession();
    }
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    stopInactivityMonitor();
  };
}