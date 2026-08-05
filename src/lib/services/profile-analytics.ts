/**
 * Profile Analytics Service
 * Tracks profile views, engagement, and provides analytics data
 */

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";

const db = fbDb();

export interface ProfileView {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
  visitorId: string;
  referrer?: string;
  userAgent?: string;
  location?: string;
  duration?: number;
  isRecruiter?: boolean;
}

export interface ProfileAnalytics {
  userId: string;
  username: string;
  totalViews: number;
  uniqueVisitors: number;
  recruiterViews: number;
  resumeDownloads: number;
  portfolioVisits: number;
  qrCodeScans: number;
  linkShares: number;
  averageDuration: number;
  trafficSources: Record<string, number>;
  returningVisitors: number;
  lastUpdated: Date;
}

export class ProfileAnalyticsService {
  /**
   * Track profile view
   */
  async trackProfileView(userId: string, username: string, visitorId: string, referrer?: string): Promise<void> {
    try {
      const viewId = `${userId}_${Date.now()}`;
      const viewRef = doc(db, "profile_views", viewId);
      
      await setDoc(viewRef, {
        userId,
        username,
        timestamp: new Date(),
        visitorId,
        referrer: referrer || null,
        userAgent: navigator.userAgent,
        location: null, // Could be populated with geolocation service
        duration: null,
        isRecruiter: false,
      });

      // Update analytics summary
      await this.updateAnalyticsSummary(userId, username);
    } catch (error) {
      console.error("Error tracking profile view:", error);
    }
  }

  /**
   * Track resume download
   */
  async trackResumeDownload(userId: string, username: string, visitorId: string): Promise<void> {
    try {
      const downloadId = `${userId}_resume_${Date.now()}`;
      const downloadRef = doc(db, "resume_downloads", downloadId);
      
      await setDoc(downloadRef, {
        userId,
        username,
        timestamp: new Date(),
        visitorId,
      });

      await this.updateAnalyticsSummary(userId, username);
    } catch (error) {
      console.error("Error tracking resume download:", error);
    }
  }

  /**
   * Track QR code scan
   */
  async trackQRCodeScan(userId: string, username: string, visitorId: string, type: string): Promise<void> {
    try {
      const scanId = `${userId}_qr_${Date.now()}`;
      const scanRef = doc(db, "qr_scans", scanId);
      
      await setDoc(scanRef, {
        userId,
        username,
        timestamp: new Date(),
        visitorId,
        type, // profile, portfolio, resume, recruiter
      });

      await this.updateAnalyticsSummary(userId, username);
    } catch (error) {
      console.error("Error tracking QR code scan:", error);
    }
  }

  /**
   * Track link share
   */
  async trackLinkShare(userId: string, username: string, platform: string): Promise<void> {
    try {
      const shareId = `${userId}_share_${Date.now()}`;
      const shareRef = doc(db, "link_shares", shareId);
      
      await setDoc(shareRef, {
        userId,
        username,
        timestamp: new Date(),
        platform, // linkedin, twitter, facebook, whatsapp, email, copy
      });

      await this.updateAnalyticsSummary(userId, username);
    } catch (error) {
      console.error("Error tracking link share:", error);
    }
  }

  /**
   * Update analytics summary
   */
  private async updateAnalyticsSummary(userId: string, username: string): Promise<void> {
    try {
      const analyticsRef = doc(db, "profile_analytics", userId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (!analyticsDoc.exists()) {
        await setDoc(analyticsRef, {
          userId,
          username,
          totalViews: 0,
          uniqueVisitors: 0,
          recruiterViews: 0,
          resumeDownloads: 0,
          portfolioVisits: 0,
          qrCodeScans: 0,
          linkShares: 0,
          averageDuration: 0,
          trafficSources: {},
          returningVisitors: 0,
          lastUpdated: new Date(),
        });
      }

      // Recalculate all metrics
      const viewsQuery = query(collection(db, "profile_views"), where("userId", "==", userId));
      const viewsSnapshot = await getDocs(viewsQuery);
      const totalViews = viewsSnapshot.size;

      const uniqueVisitorIds = new Set(viewsSnapshot.docs.map((doc) => doc.data().visitorId));
      const uniqueVisitors = uniqueVisitorIds.size;

      const downloadsQuery = query(collection(db, "resume_downloads"), where("userId", "==", userId));
      const downloadsSnapshot = await getDocs(downloadsQuery);
      const resumeDownloads = downloadsSnapshot.size;

      const qrQuery = query(collection(db, "qr_scans"), where("userId", "==", userId));
      const qrSnapshot = await getDocs(qrQuery);
      const qrCodeScans = qrSnapshot.size;

      const sharesQuery = query(collection(db, "link_shares"), where("userId", "==", userId));
      const sharesSnapshot = await getDocs(sharesQuery);
      const linkShares = sharesSnapshot.size;

      // Calculate traffic sources
      const trafficSources: Record<string, number> = {};
      viewsSnapshot.docs.forEach((doc) => {
        const referrer = doc.data().referrer || "Direct";
        trafficSources[referrer] = (trafficSources[referrer] || 0) + 1;
      });

      await updateDoc(analyticsRef, {
        totalViews,
        uniqueVisitors,
        resumeDownloads,
        qrCodeScans,
        linkShares,
        trafficSources,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error updating analytics summary:", error);
    }
  }

  /**
   * Get profile analytics
   */
  async getProfileAnalytics(userId: string): Promise<ProfileAnalytics | null> {
    try {
      const analyticsRef = doc(db, "profile_analytics", userId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (!analyticsDoc.exists()) {
        return null;
      }

      const data = analyticsDoc.data();
      return {
        userId: data.userId,
        username: data.username,
        totalViews: data.totalViews || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        recruiterViews: data.recruiterViews || 0,
        resumeDownloads: data.resumeDownloads || 0,
        portfolioVisits: data.portfolioVisits || 0,
        qrCodeScans: data.qrCodeScans || 0,
        linkShares: data.linkShares || 0,
        averageDuration: data.averageDuration || 0,
        trafficSources: data.trafficSources || {},
        returningVisitors: data.returningVisitors || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting profile analytics:", error);
      return null;
    }
  }

  /**
   * Get recent views
   */
  async getRecentViews(userId: string, limitCount: number = 10): Promise<ProfileView[]> {
    try {
      const viewsQuery = query(
        collection(db, "profile_views"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const viewsSnapshot = await getDocs(viewsQuery);

      return viewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        username: doc.data().username,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        visitorId: doc.data().visitorId,
        referrer: doc.data().referrer,
        userAgent: doc.data().userAgent,
        location: doc.data().location,
        duration: doc.data().duration,
        isRecruiter: doc.data().isRecruiter,
      }));
    } catch (error) {
      console.error("Error getting recent views:", error);
      return [];
    }
  }

  /**
   * Get views over time (for charts)
   */
  async getViewsOverTime(userId: string, days: number = 30): Promise<Array<{ date: string; views: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const viewsQuery = query(
        collection(db, "profile_views"),
        where("userId", "==", userId),
        where("timestamp", ">=", startDate)
      );
      const viewsSnapshot = await getDocs(viewsQuery);

      const viewsByDate: Record<string, number> = {};
      viewsSnapshot.docs.forEach((doc) => {
        const date = doc.data().timestamp?.toDate().toISOString().split("T")[0] || new Date().toISOString().split("T")[0];
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      // Fill in missing dates
      const result: Array<{ date: string; views: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        result.push({
          date: dateStr,
          views: viewsByDate[dateStr] || 0,
        });
      }

      return result;
    } catch (error) {
      console.error("Error getting views over time:", error);
      return [];
    }
  }

  /**
   * Generate visitor ID
   */
  generateVisitorId(): string {
    let visitorId = localStorage.getItem("skillverse_visitor_id");
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("skillverse_visitor_id", visitorId);
    }
    return visitorId;
  }
}

export const profileAnalyticsService = new ProfileAnalyticsService();
