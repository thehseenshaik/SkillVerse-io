/**
 * Profile Completion Service
 * Calculates profile completion percentage and provides suggestions
 */

import type { UnifiedProfile } from "@/types/identity-hub";

export interface CompletionSection {
  id: string;
  name: string;
  completed: boolean;
  weight: number;
  description: string;
  suggestion: string;
}

export interface CompletionResult {
  percentage: number;
  sections: CompletionSection[];
  missingSections: string[];
  suggestions: string[];
}

export class ProfileCompletionService {
  /**
   * Calculate profile completion percentage
   */
  calculateCompletion(profile: UnifiedProfile): CompletionResult {
    const sections: CompletionSection[] = [
      {
        id: "photo",
        name: "Profile Photo",
        completed: !!profile.avatar,
        weight: 10,
        description: "Upload a professional profile photo",
        suggestion: "Add a professional photo to increase visibility",
      },
      {
        id: "bio",
        name: "About/Bio",
        completed: !!profile.bio && profile.bio.length > 50,
        weight: 15,
        description: "Write a compelling bio about yourself",
        suggestion: "Add a detailed bio (at least 50 characters)",
      },
      {
        id: "location",
        name: "Location",
        completed: !!profile.location,
        weight: 5,
        description: "Add your location",
        suggestion: "Add your city and country for better local opportunities",
      },
      {
        id: "website",
        name: "Website/Portfolio",
        completed: !!profile.website,
        weight: 5,
        description: "Link to your personal website or portfolio",
        suggestion: "Add a link to your portfolio or personal website",
      },
      {
        id: "skills",
        name: "Skills",
        completed: profile.skills && profile.skills.length >= 5,
        weight: 15,
        description: "Add at least 5 skills",
        suggestion: "Add more skills to showcase your expertise",
      },
      {
        id: "projects",
        name: "Projects",
        completed: profile.projects && profile.projects.length >= 2,
        weight: 15,
        description: "Add at least 2 projects",
        suggestion: "Add more projects to demonstrate your work",
      },
      {
        id: "experience",
        name: "Experience",
        completed: profile.experience && profile.experience.length >= 1,
        weight: 15,
        description: "Add at least 1 work experience",
        suggestion: "Add your work experience to show career progression",
      },
      {
        id: "education",
        name: "Education",
        completed: profile.education && profile.education.length >= 1,
        weight: 10,
        description: "Add at least 1 education entry",
        suggestion: "Add your educational background",
      },
      {
        id: "achievements",
        name: "Achievements",
        completed: profile.achievements && profile.achievements.length >= 1,
        weight: 5,
        description: "Add at least 1 achievement",
        suggestion: "Add achievements, awards, or recognitions",
      },
      {
        id: "certifications",
        name: "Certifications",
        completed: profile.certifications && profile.certifications.length >= 1,
        weight: 5,
        description: "Add at least 1 certification",
        suggestion: "Add professional certifications",
      },
      {
        id: "platforms",
        name: "Connected Platforms",
        completed: profile.connections && profile.connections.filter((c) => c.status === "connected").length >= 2,
        weight: 10,
        description: "Connect at least 2 platforms (GitHub, LinkedIn, etc.)",
        suggestion: "Connect more platforms to sync your data automatically",
      },
      {
        id: "coding-stats",
        name: "Coding Statistics",
        completed: profile.codingStats && profile.codingStats.length >= 1,
        weight: 5,
        description: "Connect at least 1 coding platform",
        suggestion: "Connect coding platforms to show your activity",
      },
    ];

    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = sections.reduce((sum, section) => sum + (section.completed ? section.weight : 0), 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);

    const missingSections = sections
      .filter((section) => !section.completed)
      .map((section) => section.name);

    const suggestions = sections
      .filter((section) => !section.completed)
      .map((section) => section.suggestion);

    return {
      percentage,
      sections,
      missingSections,
      suggestions,
    };
  }

  /**
   * Get completion level label
   */
  getCompletionLevel(percentage: number): string {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 75) return "Very Good";
    if (percentage >= 50) return "Good";
    if (percentage >= 25) return "Basic";
    return "Incomplete";
  }

  /**
   * Get completion color
   */
  getCompletionColor(percentage: number): string {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  }

  /**
   * Get priority suggestions
   */
  getPrioritySuggestions(profile: UnifiedProfile): string[] {
    const completion = this.calculateCompletion(profile);
    const highPrioritySections = completion.sections
      .filter((section) => !section.completed && section.weight >= 10)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    return highPrioritySections.map((section) => section.suggestion);
  }

  /**
   * Check if profile is ready for public view
   */
  isReadyForPublicView(profile: UnifiedProfile): boolean {
    const completion = this.calculateCompletion(profile);
    return completion.percentage >= 50;
  }

  /**
   * Check if profile is recruiter-ready
   */
  isRecruiterReady(profile: UnifiedProfile): boolean {
    const completion = this.calculateCompletion(profile);
    const hasEssentialSections = completion.sections
      .filter((section) => ["photo", "bio", "skills", "experience", "projects"].includes(section.id))
      .every((section) => section.completed);

    return completion.percentage >= 70 && hasEssentialSections;
  }
}

export const profileCompletionService = new ProfileCompletionService();
