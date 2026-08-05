/**
 * Privacy Controls Service
 * Manages public profile privacy settings and visibility controls
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import type { PrivacySettings } from "@/types/identity-hub";

const db = fbDb();

export interface PrivacyConfig {
  userId: string;
  profileVisibility: "public" | "private" | "connections_only";
  showEmail: boolean;
  showLocation: boolean;
  showProjects: boolean;
  showAchievements: boolean;
  showCodingStats: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showCertifications: boolean;
  showSkills: boolean;
  recruiterVisibility: boolean;
  allowContactRequests: boolean;
  allowResumeDownload: boolean;
  hiddenSections: string[];
  lastUpdated: Date;
}

export class PrivacyControlsService {
  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacyConfig | null> {
    try {
      const privacyRef = doc(db, "privacy_settings", userId);
      const privacyDoc = await getDoc(privacyRef);

      if (!privacyDoc.exists()) {
        // Return default settings
        return this.getDefaultSettings(userId);
      }

      const data = privacyDoc.data();
      return {
        userId: data.userId,
        profileVisibility: data.profileVisibility || "public",
        showEmail: data.showEmail !== false,
        showLocation: data.showLocation !== false,
        showProjects: data.showProjects !== false,
        showAchievements: data.showAchievements !== false,
        showCodingStats: data.showCodingStats !== false,
        showExperience: data.showExperience !== false,
        showEducation: data.showEducation !== false,
        showCertifications: data.showCertifications !== false,
        showSkills: data.showSkills !== false,
        recruiterVisibility: data.recruiterVisibility !== false,
        allowContactRequests: data.allowContactRequests !== false,
        allowResumeDownload: data.allowResumeDownload !== false,
        hiddenSections: data.hiddenSections || [],
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting privacy settings:", error);
      return null;
    }
  }

  /**
   * Get default privacy settings
   */
  getDefaultSettings(userId: string): PrivacyConfig {
    return {
      userId,
      profileVisibility: "public",
      showEmail: false,
      showLocation: true,
      showProjects: true,
      showAchievements: true,
      showCodingStats: true,
      showExperience: true,
      showEducation: true,
      showCertifications: true,
      showSkills: true,
      recruiterVisibility: true,
      allowContactRequests: true,
      allowResumeDownload: true,
      hiddenSections: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(userId: string, settings: Partial<PrivacyConfig>): Promise<void> {
    try {
      const privacyRef = doc(db, "privacy_settings", userId);
      const currentSettings = await this.getPrivacySettings(userId);
      
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date(),
      };

      await setDoc(privacyRef, updatedSettings);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw error;
    }
  }

  /**
   * Toggle section visibility
   */
  async toggleSectionVisibility(userId: string, sectionId: string): Promise<void> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (!settings) return;

      const sectionKey = `show${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}` as keyof PrivacyConfig;
      
      if (sectionKey in settings) {
        await this.updatePrivacySettings(userId, {
          [sectionKey]: !(settings[sectionKey] as boolean),
        });
      }
    } catch (error) {
      console.error("Error toggling section visibility:", error);
      throw error;
    }
  }

  /**
   * Hide section
   */
  async hideSection(userId: string, sectionId: string): Promise<void> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (!settings) return;

      const hiddenSections = [...settings.hiddenSections, sectionId];
      await this.updatePrivacySettings(userId, { hiddenSections });
    } catch (error) {
      console.error("Error hiding section:", error);
      throw error;
    }
  }

  /**
   * Show section
   */
  async showSection(userId: string, sectionId: string): Promise<void> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (!settings) return;

      const hiddenSections = settings.hiddenSections.filter((id) => id !== sectionId);
      await this.updatePrivacySettings(userId, { hiddenSections });
    } catch (error) {
      console.error("Error showing section:", error);
      throw error;
    }
  }

  /**
   * Set profile visibility
   */
  async setProfileVisibility(userId: string, visibility: "public" | "private" | "connections_only"): Promise<void> {
    await this.updatePrivacySettings(userId, { profileVisibility: visibility });
  }

  /**
   * Enable recruiter visibility
   */
  async enableRecruiterVisibility(userId: string): Promise<void> {
    await this.updatePrivacySettings(userId, { recruiterVisibility: true });
  }

  /**
   * Disable recruiter visibility
   */
  async disableRecruiterVisibility(userId: string): Promise<void> {
    await this.updatePrivacySettings(userId, { recruiterVisibility: false });
  }

  /**
   * Check if profile is public
   */
  async isProfilePublic(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    return settings?.profileVisibility === "public" || false;
  }

  /**
   * Check if recruiter can view profile
   */
  async canRecruiterView(userId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    if (!settings) return false;
    
    return settings.profileVisibility === "public" && settings.recruiterVisibility;
  }

  /**
   * Check if section is visible
   */
  async isSectionVisible(userId: string, sectionId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(userId);
    if (!settings) return false;

    // Check if section is in hidden sections
    if (settings.hiddenSections.includes(sectionId)) {
      return false;
    }

    // Check specific visibility setting
    const sectionKey = `show${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}` as keyof PrivacyConfig;
    if (sectionKey in settings) {
      return settings[sectionKey] as boolean;
    }

    return true;
  }

  /**
   * Get filtered profile data based on privacy settings
   */
  async getFilteredProfileData(userId: string, profile: any, isRecruiter: boolean = false): Promise<any> {
    const settings = await this.getPrivacySettings(userId);
    if (!settings) return profile;

    const filtered = { ...profile };

    // Remove sections based on privacy settings
    if (!settings.showEmail) {
      delete filtered.email;
    }
    if (!settings.showLocation) {
      delete filtered.location;
    }
    if (!settings.showProjects) {
      delete filtered.projects;
    }
    if (!settings.showAchievements) {
      delete filtered.achievements;
    }
    if (!settings.showCodingStats) {
      delete filtered.codingStats;
    }
    if (!settings.showExperience) {
      delete filtered.experience;
    }
    if (!settings.showEducation) {
      delete filtered.education;
    }
    if (!settings.showCertifications) {
      delete filtered.certifications;
    }
    if (!settings.showSkills) {
      delete filtered.skills;
    }

    // Remove hidden sections
    settings.hiddenSections.forEach((sectionId) => {
      delete filtered[sectionId];
    });

    // Recruiter-specific filtering
    if (isRecruiter && !settings.recruiterVisibility) {
      // Return minimal data for recruiters when visibility is disabled
      return {
        displayName: filtered.displayName,
        bio: filtered.bio,
        // Only show basic info
      };
    }

    return filtered;
  }

  /**
   * Export privacy settings
   */
  exportPrivacySettings(userId: string): string {
    return JSON.stringify(this.getDefaultSettings(userId), null, 2);
  }

  /**
   * Import privacy settings
   */
  async importPrivacySettings(userId: string, settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson);
      await this.updatePrivacySettings(userId, settings);
    } catch (error) {
      console.error("Error importing privacy settings:", error);
      throw new Error("Invalid privacy settings format");
    }
  }
}

export const privacyControlsService = new PrivacyControlsService();
