/**
 * Contact System Service
 * Handles recruiter contact requests and messaging
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import { profileAnalyticsService } from "./profile-analytics";

const db = fbDb();

export interface ContactRequest {
  id: string;
  userId: string;
  username: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterCompany?: string;
  message: string;
  type: "contact" | "resume_request" | "save_candidate";
  status: "pending" | "accepted" | "declined" | "archived";
  timestamp: Date;
  metadata?: {
    source?: string;
    referrer?: string;
  };
}

export class ContactSystemService {
  /**
   * Send contact request
   */
  async sendContactRequest(
    userId: string,
    username: string,
    recruiterName: string,
    recruiterEmail: string,
    recruiterCompany: string,
    message: string,
    type: "contact" | "resume_request" | "save_candidate" = "contact",
  ): Promise<string> {
    try {
      const requestId = `${userId}_${Date.now()}`;
      const requestRef = doc(db, "contact_requests", requestId);

      await setDoc(requestRef, {
        userId,
        username,
        recruiterName,
        recruiterEmail,
        recruiterCompany,
        message,
        type,
        status: "pending",
        timestamp: new Date(),
        metadata: {
          source: "public_profile",
        },
      });

      return requestId;
    } catch (error) {
      console.error("Error sending contact request:", error);
      throw error;
    }
  }

  /**
   * Get contact requests for user
   */
  async getContactRequests(userId: string, status?: string): Promise<ContactRequest[]> {
    try {
      let requestsQuery = query(
        collection(db, "contact_requests"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );

      if (status) {
        requestsQuery = query(
          collection(db, "contact_requests"),
          where("userId", "==", userId),
          where("status", "==", status),
          orderBy("timestamp", "desc")
        );
      }

      const requestsSnapshot = await getDocs(requestsQuery);

      return requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        username: doc.data().username,
        recruiterName: doc.data().recruiterName,
        recruiterEmail: doc.data().recruiterEmail,
        recruiterCompany: doc.data().recruiterCompany,
        message: doc.data().message,
        type: doc.data().type,
        status: doc.data().status,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        metadata: doc.data().metadata,
      }));
    } catch (error) {
      console.error("Error getting contact requests:", error);
      return [];
    }
  }

  /**
   * Update contact request status
   */
  async updateContactRequestStatus(requestId: string, status: "accepted" | "declined" | "archived"): Promise<void> {
    try {
      const requestRef = doc(db, "contact_requests", requestId);
      await updateDoc(requestRef, {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating contact request status:", error);
      throw error;
    }
  }

  /**
   * Delete contact request
   */
  async deleteContactRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, "contact_requests", requestId);
      await updateDoc(requestRef, {
        archived: true,
        archivedAt: new Date(),
      });
    } catch (error) {
      console.error("Error deleting contact request:", error);
      throw error;
    }
  }

  /**
   * Get contact request by ID
   */
  async getContactRequest(requestId: string): Promise<ContactRequest | null> {
    try {
      const requestRef = doc(db, "contact_requests", requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return null;
      }

      const data = requestDoc.data();
      return {
        id: requestDoc.id,
        userId: data.userId,
        username: data.username,
        recruiterName: data.recruiterName,
        recruiterEmail: data.recruiterEmail,
        recruiterCompany: data.recruiterCompany,
        message: data.message,
        type: data.type,
        status: data.status,
        timestamp: data.timestamp?.toDate() || new Date(),
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Error getting contact request:", error);
      return null;
    }
  }

  /**
   * Get contact statistics
   */
  async getContactStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    archived: number;
  }> {
    try {
      const requests = await this.getContactRequests(userId);

      return {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        accepted: requests.filter((r) => r.status === "accepted").length,
        declined: requests.filter((r) => r.status === "declined").length,
        archived: requests.filter((r) => r.status === "archived").length,
      };
    } catch (error) {
      console.error("Error getting contact statistics:", error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        archived: 0,
      };
    }
  }

  /**
   * Track contact request (analytics)
   */
  async trackContactRequest(userId: string, username: string): Promise<void> {
    try {
      const visitorId = profileAnalyticsService.generateVisitorId();
      await profileAnalyticsService.trackLinkShare(userId, username, "contact_request");
    } catch (error) {
      console.error("Error tracking contact request:", error);
    }
  }

  /**
   * Validate contact request
   */
  validateContactRequest(data: {
    recruiterName: string;
    recruiterEmail: string;
    message: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.recruiterName || data.recruiterName.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!data.recruiterEmail || !this.isValidEmail(data.recruiterEmail)) {
      errors.push("Please enter a valid email address");
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate contact form HTML
   */
  generateContactFormHTML(username: string): string {
    return `
<form id="contact-form" data-username="${username}">
  <div class="form-group">
    <label for="recruiter-name">Your Name</label>
    <input type="text" id="recruiter-name" name="recruiterName" required />
  </div>
  <div class="form-group">
    <label for="recruiter-email">Your Email</label>
    <input type="email" id="recruiter-email" name="recruiterEmail" required />
  </div>
  <div class="form-group">
    <label for="recruiter-company">Company (Optional)</label>
    <input type="text" id="recruiter-company" name="recruiterCompany" />
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  <button type="submit">Send Message</button>
</form>
    `.trim();
  }

  /**
   * Export contact requests
   */
  async exportContactRequests(userId: string): Promise<string> {
    const requests = await this.getContactRequests(userId);
    return JSON.stringify(requests, null, 2);
  }
}

export const contactSystemService = new ContactSystemService();
