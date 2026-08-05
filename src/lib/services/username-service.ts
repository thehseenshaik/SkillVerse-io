/**
 * Username Service
 * Handles username validation, availability checking, and management
 */

import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";

const db = fbDb();

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "api",
  "auth",
  "blog",
  "careers",
  "contact",
  "dashboard",
  "docs",
  "faq",
  "help",
  "home",
  "jobs",
  "legal",
  "login",
  "logout",
  "news",
  "pricing",
  "privacy",
  "profile",
  "public",
  "recruiter",
  "recruiters",
  "resume",
  "search",
  "settings",
  "signup",
  "support",
  "terms",
  "test",
  "user",
  "users",
  "www",
  "skillverse",
  "skillverse-io",
  "about",
  "careers",
  "company",
  "companies",
  "team",
  "teams",
  "portfolio",
  "portfolios",
  "identity",
  "hub",
  "identityhub",
  "ai",
  "artificial",
  "intelligence",
  "career",
  "careers",
  "job",
  "jobs",
  "talent",
  "talents",
  "developer",
  "developers",
  "engineer",
  "engineers",
];

export interface UsernameValidation {
  valid: boolean;
  message: string;
}

export interface UsernameAvailability {
  available: boolean;
  username: string;
}

export class UsernameService {
  /**
   * Validate username format
   */
  validateUsername(username: string): UsernameValidation {
    if (!username) {
      return { valid: false, message: "Username is required" };
    }

    if (username.length < 3) {
      return { valid: false, message: "Username must be at least 3 characters" };
    }

    if (username.length > 30) {
      return { valid: false, message: "Username must be less than 30 characters" };
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(username)) {
      return { valid: false, message: "Username can only contain letters, numbers, underscores, and hyphens" };
    }

    // Must start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      return { valid: false, message: "Username must start with a letter" };
    }

    // Check if reserved
    if (this.isReserved(username)) {
      return { valid: false, message: "This username is reserved" };
    }

    return { valid: true, message: "Username is valid" };
  }

  /**
   * Check if username is reserved
   */
  isReserved(username: string): boolean {
    return RESERVED_USERNAMES.includes(username.toLowerCase());
  }

  /**
   * Check username availability
   */
  async checkAvailability(username: string): Promise<UsernameAvailability> {
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      return { available: false, username };
    }

    try {
      const usernameRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);

      if (usernameDoc.exists()) {
        return { available: false, username };
      }

      return { available: true, username };
    } catch (error) {
      console.error("Error checking username availability:", error);
      return { available: false, username };
    }
  }

  /**
   * Claim username for user
   */
  async claimUsername(userId: string, username: string): Promise<boolean> {
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      const usernameRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);

      if (usernameDoc.exists()) {
        throw new Error("Username is already taken");
      }

      // Claim the username
      await setDoc(usernameRef, {
        userId,
        username: username.toLowerCase(),
        createdAt: new Date(),
      });

      // Update user profile with username
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        username: username.toLowerCase(),
        usernameClaimedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error claiming username:", error);
      throw error;
    }
  }

  /**
   * Get username by user ID
   */
  async getUsernameByUserId(userId: string): Promise<string | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.username || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting username by user ID:", error);
      return null;
    }
  }

  /**
   * Get user ID by username
   */
  async getUserIdByUsername(username: string): Promise<string | null> {
    try {
      const usernameRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);

      if (usernameDoc.exists()) {
        const usernameData = usernameDoc.data();
        return usernameData.userId || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting user ID by username:", error);
      return null;
    }
  }

  /**
   * Update username (requires releasing old username)
   */
  async updateUsername(userId: string, oldUsername: string, newUsername: string): Promise<boolean> {
    const validation = this.validateUsername(newUsername);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      // Check if new username is available
      const availability = await this.checkAvailability(newUsername);
      if (!availability.available) {
        throw new Error("New username is already taken");
      }

      // Release old username
      if (oldUsername) {
        const oldUsernameRef = doc(db, "usernames", oldUsername.toLowerCase());
        await setDoc(oldUsernameRef, {
          userId,
          username: oldUsername.toLowerCase(),
          releasedAt: new Date(),
        });
      }

      // Claim new username
      await this.claimUsername(userId, newUsername);

      return true;
    } catch (error) {
      console.error("Error updating username:", error);
      throw error;
    }
  }

  /**
   * Release username
   */
  async releaseUsername(username: string): Promise<boolean> {
    try {
      const usernameRef = doc(db, "usernames", username.toLowerCase());
      await setDoc(usernameRef, {
        releasedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error releasing username:", error);
      return false;
    }
  }

  /**
   * Suggest available usernames based on preferred username
   */
  async suggestUsernames(preferred: string): Promise<string[]> {
    const suggestions: string[] = [];
    const base = preferred.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (base.length < 3) {
      return suggestions;
    }

    const variants = [
      base,
      `${base}dev`,
      `${base}devs`,
      `${base}coder`,
      `${base}code`,
      `${base}tech`,
      `${base}pro`,
      `${base}io`,
      `${base}hq`,
      `${base}app`,
      `${base}web`,
      `${base}js`,
      `${base}dev`,
      `${base}2024`,
      `${base}2025`,
      `dev${base}`,
      `code${base}`,
      `the${base}`,
      `iam${base}`,
      `${base}_dev`,
      `${base}_code`,
      `${base}_tech`,
    ];

    for (const variant of variants) {
      const validation = this.validateUsername(variant);
      if (!validation.valid) continue;

      const availability = await this.checkAvailability(variant);
      if (availability.available) {
        suggestions.push(variant);
        if (suggestions.length >= 5) break;
      }
    }

    return suggestions;
  }
}

export const usernameService = new UsernameService();
