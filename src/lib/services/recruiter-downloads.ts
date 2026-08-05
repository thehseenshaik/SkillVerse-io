/**
 * Recruiter Downloads Service
 * Handles resume, portfolio, and document downloads for recruiters
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import { privacyControlsService } from "./privacy-controls";
import { profileAnalyticsService } from "./profile-analytics";

const db = fbDb();

export interface DownloadRequest {
  id: string;
  userId: string;
  username: string;
  recruiterId?: string;
  recruiterEmail?: string;
  recruiterName?: string;
  recruiterCompany?: string;
  downloadType: "resume_pdf" | "resume_docx" | "portfolio_pdf" | "project_summary" | "ai_career_summary";
  status: "pending" | "completed" | "failed" | "blocked";
  timestamp: Date;
  metadata?: {
    version?: string;
    format?: string;
    fileSize?: number;
  };
}

export class RecruiterDownloadsService {
  /**
   * Check if download is allowed
   */
  async isDownloadAllowed(userId: string, downloadType: string): Promise<boolean> {
    const privacy = await privacyControlsService.getPrivacySettings(userId);
    if (!privacy) return false;

    // Check if profile is public
    if (privacy.profileVisibility !== "public") {
      return false;
    }

    // Check recruiter visibility
    if (!privacy.recruiterVisibility) {
      return false;
    }

    // Check specific download permissions
    switch (downloadType) {
      case "resume_pdf":
      case "resume_docx":
        return privacy.allowResumeDownload;
      default:
        return true;
    }
  }

  /**
   * Request download
   */
  async requestDownload(
    userId: string,
    username: string,
    downloadType: DownloadRequest["downloadType"],
    recruiterInfo?: {
      email?: string;
      name?: string;
      company?: string;
    },
  ): Promise<string> {
    try {
      // Check if download is allowed
      const allowed = await this.isDownloadAllowed(userId, downloadType);
      if (!allowed) {
        throw new Error("Download not allowed due to privacy settings");
      }

      const requestId = `${userId}_${downloadType}_${Date.now()}`;
      const requestRef = doc(db, "download_requests", requestId);

      await setDoc(requestRef, {
        userId,
        username,
        recruiterEmail: recruiterInfo?.email,
        recruiterName: recruiterInfo?.name,
        recruiterCompany: recruiterInfo?.company,
        downloadType,
        status: "pending",
        timestamp: new Date(),
      });

      // Track download
      await this.trackDownload(userId, username, downloadType);

      return requestId;
    } catch (error) {
      console.error("Error requesting download:", error);
      throw error;
    }
  }

  /**
   * Track download
   */
  private async trackDownload(userId: string, username: string, downloadType: string): Promise<void> {
    try {
      const visitorId = profileAnalyticsService.generateVisitorId();
      
      if (downloadType.includes("resume")) {
        await profileAnalyticsService.trackResumeDownload(userId, username, visitorId);
      } else {
        await profileAnalyticsService.trackLinkShare(userId, username, `download_${downloadType}`);
      }
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  }

  /**
   * Get download requests for user
   */
  async getDownloadRequests(userId: string): Promise<DownloadRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, "download_requests"),
        where("userId", "==", userId)
      );
      const requestsSnapshot = await getDocs(requestsQuery);

      return requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        username: doc.data().username,
        recruiterId: doc.data().recruiterId,
        recruiterEmail: doc.data().recruiterEmail,
        recruiterName: doc.data().recruiterName,
        recruiterCompany: doc.data().recruiterCompany,
        downloadType: doc.data().downloadType,
        status: doc.data().status,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        metadata: doc.data().metadata,
      }));
    } catch (error) {
      console.error("Error getting download requests:", error);
      return [];
    }
  }

  /**
   * Generate download URL
   */
  generateDownloadUrl(username: string, downloadType: DownloadRequest["downloadType"]): string {
    const baseUrl = "https://skillverse.io";
    
    switch (downloadType) {
      case "resume_pdf":
        return `${baseUrl}/r/${username}.pdf`;
      case "resume_docx":
        return `${baseUrl}/r/${username}.docx`;
      case "portfolio_pdf":
        return `${baseUrl}/p/${username}.pdf`;
      case "project_summary":
        return `${baseUrl}/u/${username}/projects/summary.pdf`;
      case "ai_career_summary":
        return `${baseUrl}/u/${username}/ai-summary.pdf`;
      default:
        return `${baseUrl}/u/${username}`;
    }
  }

  /**
   * Generate resume PDF
   */
  async generateResumePDF(userId: string, username: string, version: "ats" | "modern" | "minimal" = "modern"): Promise<Blob> {
    try {
      // This would typically call a PDF generation service
      // For now, return a placeholder
      const pdfContent = `Resume for ${username}\nGenerated by SkillVerse\nVersion: ${version}`;
      return new Blob([pdfContent], { type: "application/pdf" });
    } catch (error) {
      console.error("Error generating resume PDF:", error);
      throw error;
    }
  }

  /**
   * Generate resume DOCX
   */
  async generateResumeDOCX(userId: string, username: string): Promise<Blob> {
    try {
      // This would typically call a DOCX generation service
      const docxContent = `Resume for ${username}\nGenerated by SkillVerse`;
      return new Blob([docxContent], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
      console.error("Error generating resume DOCX:", error);
      throw error;
    }
  }

  /**
   * Generate portfolio PDF
   */
  async generatePortfolioPDF(userId: string, username: string): Promise<Blob> {
    try {
      // This would typically call a PDF generation service
      const pdfContent = `Portfolio for ${username}\nGenerated by SkillVerse`;
      return new Blob([pdfContent], { type: "application/pdf" });
    } catch (error) {
      console.error("Error generating portfolio PDF:", error);
      throw error;
    }
  }

  /**
   * Generate project summary
   */
  async generateProjectSummary(userId: string, username: string): Promise<Blob> {
    try {
      // This would typically call a PDF generation service
      const pdfContent = `Project Summary for ${username}\nGenerated by SkillVerse`;
      return new Blob([pdfContent], { type: "application/pdf" });
    } catch (error) {
      console.error("Error generating project summary:", error);
      throw error;
    }
  }

  /**
   * Generate AI career summary
   */
  async generateAICareerSummary(userId: string, username: string): Promise<Blob> {
    try {
      // This would typically call a PDF generation service
      const pdfContent = `AI Career Summary for ${username}\nGenerated by SkillVerse`;
      return new Blob([pdfContent], { type: "application/pdf" });
    } catch (error) {
      console.error("Error generating AI career summary:", error);
      throw error;
    }
  }

  /**
   * Get download statistics
   */
  async getDownloadStatistics(userId: string): Promise<{
    total: number;
    resumeDownloads: number;
    portfolioDownloads: number;
    projectSummaryDownloads: number;
    aiSummaryDownloads: number;
    blocked: number;
  }> {
    try {
      const requests = await this.getDownloadRequests(userId);

      return {
        total: requests.length,
        resumeDownloads: requests.filter((r) => r.downloadType.includes("resume")).length,
        portfolioDownloads: requests.filter((r) => r.downloadType === "portfolio_pdf").length,
        projectSummaryDownloads: requests.filter((r) => r.downloadType === "project_summary").length,
        aiSummaryDownloads: requests.filter((r) => r.downloadType === "ai_career_summary").length,
        blocked: requests.filter((r) => r.status === "blocked").length,
      };
    } catch (error) {
      console.error("Error getting download statistics:", error);
      return {
        total: 0,
        resumeDownloads: 0,
        portfolioDownloads: 0,
        projectSummaryDownloads: 0,
        aiSummaryDownloads: 0,
        blocked: 0,
      };
    }
  }

  /**
   * Block download
   */
  async blockDownload(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, "download_requests", requestId);
      await updateDoc(requestRef, {
        status: "blocked",
        blockedAt: new Date(),
      });
    } catch (error) {
      console.error("Error blocking download:", error);
      throw error;
    }
  }

  /**
   * Approve download
   */
  async approveDownload(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, "download_requests", requestId);
      await updateDoc(requestRef, {
        status: "completed",
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error approving download:", error);
      throw error;
    }
  }

  /**
   * Get pending download requests
   */
  async getPendingDownloadRequests(userId: string): Promise<DownloadRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, "download_requests"),
        where("userId", "==", userId),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);

      return requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        username: doc.data().username,
        recruiterId: doc.data().recruiterId,
        recruiterEmail: doc.data().recruiterEmail,
        recruiterName: doc.data().recruiterName,
        recruiterCompany: doc.data().recruiterCompany,
        downloadType: doc.data().downloadType,
        status: doc.data().status,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        metadata: doc.data().metadata,
      }));
    } catch (error) {
      console.error("Error getting pending download requests:", error);
      return [];
    }
  }
}

export const recruiterDownloadsService = new RecruiterDownloadsService();
