/**
 * Social Sharing Service
 * Handles social media sharing functionality
 */

import { profileAnalyticsService } from "./profile-analytics";
import { seoOptimizerService } from "./seo-optimizer";

export interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  shareUrl: (url: string, text?: string) => string;
}

export const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    shareUrl: (url: string, text?: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "twitter",
    shareUrl: (url: string, text?: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ""}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    shareUrl: (url: string, text?: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "message-circle",
    shareUrl: (url: string, text?: string) =>
      `https://wa.me/?text=${encodeURIComponent(text || "")}${encodeURIComponent(" " + url)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "send",
    shareUrl: (url: string, text?: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ""}`,
  },
  {
    id: "email",
    name: "Email",
    icon: "mail",
    shareUrl: (url: string, text?: string) =>
      `mailto:?subject=${encodeURIComponent(text || "Check out this profile")}&body=${encodeURIComponent(url)}`,
  },
];

export class SocialSharingService {
  /**
   * Share profile to platform
   */
  shareToPlatform(platformId: string, username: string, profile?: any): void {
    const platform = SHARE_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return;

    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;
    const shareText = profile ? seoOptimizerService.generateSocialShareText(profile, username) : undefined;

    const shareUrl = platform.shareUrl(profileUrl, shareText);
    window.open(shareUrl, "_blank", "width=600,height=400");

    // Track share
    this.trackShare(username, platformId);
  }

  /**
   * Copy profile link
   */
  async copyProfileLink(username: string): Promise<boolean> {
    try {
      const baseUrl = "https://skillverse.io";
      const profileUrl = `${baseUrl}/u/${username}`;
      await navigator.clipboard.writeText(profileUrl);
      this.trackShare(username, "copy");
      return true;
    } catch (error) {
      console.error("Error copying link:", error);
      return false;
    }
  }

  /**
   * Track share
   */
  private async trackShare(username: string, platform: string): Promise<void> {
    try {
      const userId = await this.getUserIdByUsername(username);
      if (userId) {
        await profileAnalyticsService.trackLinkShare(userId, username, platform);
      }
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  }

  /**
   * Get user ID by username (helper method)
   */
  private async getUserIdByUsername(username: string): Promise<string | null> {
    // This would typically call the username service
    // For now, return null to avoid circular dependency
    return null;
  }

  /**
   * Generate share preview
   */
  generateSharePreview(profile: any, username: string): {
    title: string;
    description: string;
    image: string;
    url: string;
  } {
    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;
    const displayName = profile.displayName || username;
    const headline = profile.bio || profile.headline || "Professional";

    return {
      title: `${displayName} - ${headline}`,
      description: seoOptimizerService.generateSocialShareText(profile, username),
      image: profile.avatar || `${baseUrl}/og-default.png`,
      url: profileUrl,
    };
  }

  /**
   * Get all available platforms
   */
  getAvailablePlatforms(): SharePlatform[] {
    return SHARE_PLATFORMS;
  }

  /**
   * Generate embed code
   */
  generateEmbedCode(username: string, width: number = 400, height: number = 600): string {
    const baseUrl = "https://skillverse.io";
    const embedUrl = `${baseUrl}/embed/u/${username}`;
    
    return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  scrolling="no">
</iframe>`;
  }

  /**
   * Generate QR code for sharing
   */
  generateQRCodeUrl(username: string, size: number = 300): string {
    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(profileUrl)}`;
  }

  /**
   * Download QR code
   */
  async downloadQRCode(username: string): Promise<void> {
    try {
      const qrUrl = this.generateQRCodeUrl(username, 512);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `skillverse-${username}-qr.png`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      throw error;
    }
  }
}

export const socialSharingService = new SocialSharingService();
