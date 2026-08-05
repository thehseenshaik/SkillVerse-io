/**
 * Resume Publishing Service
 * Handles resume publishing, visibility, and download management
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import { profileAnalyticsService } from "./profile-analytics";

const db = fbDb();

export interface ResumePublishSettings {
  userId: string;
  isPublic: boolean;
  publicUrl?: string;
  lastPublished?: Date;
  resumeVersion: "ats" | "modern" | "minimal";
  allowDownload: boolean;
  allowContact: boolean;
  qrCodeEnabled: boolean;
}

export class ResumePublishingService {
  /**
   * Get resume publish settings
   */
  async getPublishSettings(userId: string): Promise<ResumePublishSettings | null> {
    try {
      const settingsRef = doc(db, "resume_publish", userId);
      const settingsDoc = await getDoc(settingsRef);

      if (!settingsDoc.exists()) {
        return null;
      }

      const data = settingsDoc.data();
      return {
        userId: data.userId,
        isPublic: data.isPublic || false,
        publicUrl: data.publicUrl,
        lastPublished: data.lastPublished?.toDate(),
        resumeVersion: data.resumeVersion || "modern",
        allowDownload: data.allowDownload !== false,
        allowContact: data.allowContact !== false,
        qrCodeEnabled: data.qrCodeEnabled !== false,
      };
    } catch (error) {
      console.error("Error getting publish settings:", error);
      return null;
    }
  }

  /**
   * Publish resume
   */
  async publishResume(
    userId: string,
    username: string,
    version: "ats" | "modern" | "minimal" = "modern",
  ): Promise<string> {
    try {
      const publicUrl = `https://skillverse.io/r/${username}`;
      const settingsRef = doc(db, "resume_publish", userId);

      await setDoc(settingsRef, {
        userId,
        isPublic: true,
        publicUrl,
        lastPublished: new Date(),
        resumeVersion: version,
        allowDownload: true,
        allowContact: true,
        qrCodeEnabled: true,
      });

      return publicUrl;
    } catch (error) {
      console.error("Error publishing resume:", error);
      throw error;
    }
  }

  /**
   * Unpublish resume
   */
  async unpublishResume(userId: string): Promise<void> {
    try {
      const settingsRef = doc(db, "resume_publish", userId);
      await updateDoc(settingsRef, {
        isPublic: false,
        lastPublished: new Date(),
      });
    } catch (error) {
      console.error("Error unpublishing resume:", error);
      throw error;
    }
  }

  /**
   * Update resume version
   */
  async updateResumeVersion(
    userId: string,
    version: "ats" | "modern" | "minimal",
  ): Promise<void> {
    try {
      const settingsRef = doc(db, "resume_publish", userId);
      await updateDoc(settingsRef, {
        resumeVersion: version,
        lastPublished: new Date(),
      });
    } catch (error) {
      console.error("Error updating resume version:", error);
      throw error;
    }
  }

  /**
   * Toggle download permission
   */
  async toggleDownloadPermission(userId: string, allow: boolean): Promise<void> {
    try {
      const settingsRef = doc(db, "resume_publish", userId);
      await updateDoc(settingsRef, {
        allowDownload: allow,
      });
    } catch (error) {
      console.error("Error toggling download permission:", error);
      throw error;
    }
  }

  /**
   * Toggle contact permission
   */
  async toggleContactPermission(userId: string, allow: boolean): Promise<void> {
    try {
      const settingsRef = doc(db, "resume_publish", userId);
      await updateDoc(settingsRef, {
        allowContact: allow,
      });
    } catch (error) {
      console.error("Error toggling contact permission:", error);
      throw error;
    }
  }

  /**
   * Track resume download
   */
  async trackDownload(userId: string, username: string, visitorId: string): Promise<void> {
    await profileAnalyticsService.trackResumeDownload(userId, username, visitorId);
  }

  /**
   * Generate resume URL
   */
  generateResumeUrl(username: string, version: "ats" | "modern" | "minimal" = "modern"): string {
    return `https://skillverse.io/r/${username}?v=${version}`;
  }

  /**
   * Generate QR code URL
   */
  generateQRCodeUrl(username: string, type: "profile" | "resume" | "portfolio" = "profile"): string {
    const baseUrl = "https://skillverse.io";
    const path = type === "resume" ? `/r/${username}` : `/u/${username}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(baseUrl + path)}`;
  }
}

export const resumePublishingService = new ResumePublishingService();
