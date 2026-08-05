/**
 * Privacy Manager
 * Handles privacy settings and visibility controls for profile data
 */

import type {
  PrivacySettings,
  UnifiedProfile,
  Platform,
} from "@/types/identity-hub";

export interface PrivacyRule {
  section: string;
  isVisible: boolean;
  audience: "public" | "private" | "connections_only";
}

export class PrivacyManager {
  /**
   * Default privacy settings
   */
  static getDefaultSettings(): PrivacySettings {
    return {
      profileVisibility: "public",
      showEmail: false,
      showLocation: true,
      showProjects: true,
      showAchievements: true,
      showCodingStats: true,
      recruiterVisibility: true,
      hiddenSections: [],
    };
  }

  /**
   * Apply privacy settings to profile data
   */
  applyPrivacySettings(
    profile: UnifiedProfile,
    settings: PrivacySettings,
  ): UnifiedProfile {
    const filtered = { ...profile };

    // Filter based on visibility settings
    if (!settings.showProjects) {
      filtered.projects = [];
    }

    if (!settings.showAchievements) {
      filtered.achievements = [];
    }

    if (!settings.showCodingStats) {
      filtered.codingStats = [];
    }

    // Filter hidden sections
    if (settings.hiddenSections.length > 0) {
      settings.hiddenSections.forEach((section) => {
        switch (section) {
          case "skills":
            filtered.skills = [];
            break;
          case "projects":
            filtered.projects = [];
            break;
          case "achievements":
            filtered.achievements = [];
            break;
          case "experience":
            filtered.experience = [];
            break;
          case "education":
            filtered.education = [];
            break;
          case "certifications":
            filtered.certifications = [];
            break;
          case "codingStats":
            filtered.codingStats = [];
            break;
        }
      });
    }

    // Filter individual items marked as hidden
    filtered.skills = filtered.skills.filter((s) => !s.isHidden);
    filtered.projects = filtered.projects.filter((p) => !p.isHidden);
    filtered.achievements = filtered.achievements.filter((a) => !a.isHidden);
    filtered.experience = filtered.experience.filter((e) => !e.isHidden);
    filtered.education = filtered.education.filter((e) => !e.isHidden);
    filtered.certifications = filtered.certifications.filter(
      (c) => !c.isHidden,
    );

    return filtered;
  }

  /**
   * Check if a section is visible to a specific audience
   */
  isSectionVisible(
    section: string,
    settings: PrivacySettings,
    audience: "public" | "private" | "connections_only" = "public",
  ): boolean {
    // Check if section is explicitly hidden
    if (settings.hiddenSections.includes(section)) {
      return false;
    }

    // Check overall profile visibility
    if (settings.profileVisibility === "private" && audience !== "private") {
      return false;
    }

    if (
      settings.profileVisibility === "connections_only" &&
      audience === "public"
    ) {
      return false;
    }

    // Section-specific checks
    switch (section) {
      case "email":
        return settings.showEmail;
      case "location":
        return settings.showLocation;
      case "projects":
        return settings.showProjects;
      case "achievements":
        return settings.showAchievements;
      case "codingStats":
        return settings.showCodingStats;
      default:
        return true;
    }
  }

  /**
   * Check if profile is visible to recruiters
   */
  isRecruiterVisible(settings: PrivacySettings): boolean {
    return (
      settings.recruiterVisibility && settings.profileVisibility !== "private"
    );
  }

  /**
   * Hide a section
   */
  hideSection(settings: PrivacySettings, section: string): PrivacySettings {
    return {
      ...settings,
      hiddenSections: [...new Set([...settings.hiddenSections, section])],
    };
  }

  /**
   * Show a section
   */
  showSection(settings: PrivacySettings, section: string): PrivacySettings {
    return {
      ...settings,
      hiddenSections: settings.hiddenSections.filter((s) => s !== section),
    };
  }

  /**
   * Toggle section visibility
   */
  toggleSection(settings: PrivacySettings, section: string): PrivacySettings {
    if (settings.hiddenSections.includes(section)) {
      return this.showSection(settings, section);
    }
    return this.hideSection(settings, section);
  }

  /**
   * Update profile visibility
   */
  updateProfileVisibility(
    settings: PrivacySettings,
    visibility: "public" | "private" | "connections_only",
  ): PrivacySettings {
    return {
      ...settings,
      profileVisibility: visibility,
    };
  }

  /**
   * Update recruiter visibility
   */
  updateRecruiterVisibility(
    settings: PrivacySettings,
    visible: boolean,
  ): PrivacySettings {
    return {
      ...settings,
      recruiterVisibility: visible,
    };
  }

  /**
   * Get privacy summary
   */
  getPrivacySummary(settings: PrivacySettings): {
    totalSections: number;
    hiddenSections: number;
    visibilityLevel: string;
    recruiterAccessible: boolean;
  } {
    const allSections = [
      "skills",
      "projects",
      "achievements",
      "experience",
      "education",
      "certifications",
      "codingStats",
    ];

    return {
      totalSections: allSections.length,
      hiddenSections: settings.hiddenSections.length,
      visibilityLevel: settings.profileVisibility,
      recruiterAccessible: this.isRecruiterVisible(settings),
    };
  }

  /**
   * Validate privacy settings
   */
  validateSettings(settings: PrivacySettings): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      !["public", "private", "connections_only"].includes(
        settings.profileVisibility,
      )
    ) {
      errors.push("Invalid profile visibility setting");
    }

    if (typeof settings.showEmail !== "boolean") {
      errors.push("showEmail must be a boolean");
    }

    if (typeof settings.showLocation !== "boolean") {
      errors.push("showLocation must be a boolean");
    }

    if (typeof settings.showProjects !== "boolean") {
      errors.push("showProjects must be a boolean");
    }

    if (typeof settings.showAchievements !== "boolean") {
      errors.push("showAchievements must be a boolean");
    }

    if (typeof settings.showCodingStats !== "boolean") {
      errors.push("showCodingStats must be a boolean");
    }

    if (typeof settings.recruiterVisibility !== "boolean") {
      errors.push("recruiterVisibility must be a boolean");
    }

    if (!Array.isArray(settings.hiddenSections)) {
      errors.push("hiddenSections must be an array");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export privacy settings
   */
  exportSettings(settings: PrivacySettings): string {
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import privacy settings
   */
  importSettings(json: string): PrivacySettings | null {
    try {
      const parsed = JSON.parse(json);
      const validation = this.validateSettings(parsed);
      if (validation.valid) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get platform-specific privacy recommendations
   */
  getPrivacyRecommendations(platform: Platform): PrivacyRule[] {
    const recommendations: PrivacyRule[] = [];

    switch (platform) {
      case "github":
        recommendations.push({
          section: "projects",
          isVisible: true,
          audience: "public",
        });
        recommendations.push({
          section: "codingStats",
          isVisible: true,
          audience: "public",
        });
        break;

      case "linkedin":
        recommendations.push({
          section: "experience",
          isVisible: true,
          audience: "public",
        });
        recommendations.push({
          section: "education",
          isVisible: true,
          audience: "public",
        });
        break;

      case "leetcode":
        recommendations.push({
          section: "codingStats",
          isVisible: true,
          audience: "public",
        });
        recommendations.push({
          section: "achievements",
          isVisible: true,
          audience: "public",
        });
        break;

      default:
        break;
    }

    return recommendations;
  }
}

export const privacyManager = new PrivacyManager();
