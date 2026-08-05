/**
 * AI Portfolio Enhancement Service
 * Uses Gemini AI to improve portfolio content
 */

import { processAIRequest } from "./ai";
import type { AIFeatureType } from "@/types/ai";

export interface EnhancementRequest {
  section: string;
  content: any;
  context?: any;
}

export interface EnhancementResult {
  original: string;
  enhanced: string;
  improvements: string[];
  suggestions: string[];
}

export class AIPortfolioEnhancementService {
  /**
   * Enhance about section
   */
  async enhanceAboutSection(
    userId: string,
    currentBio: string,
    profile: any,
  ): Promise<EnhancementResult> {
    const context = {
      currentBio,
      displayName: profile.displayName,
      headline: profile.headline,
      skills: profile.skills?.slice(0, 5).map((s: any) => s.name || s).join(", "),
      experience: profile.experience?.[0]?.role || "",
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.7,
        maxTokens: 500,
      });

      const result = JSON.parse(response.data as string);
      
      return {
        original: currentBio,
        enhanced: result.enhanced || result.bio || currentBio,
        improvements: result.improvements || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Error enhancing about section:", error);
      throw error;
    }
  }

  /**
   * Enhance project description
   */
  async enhanceProjectDescription(
    userId: string,
    projectName: string,
    currentDescription: string,
    technologies: string[],
  ): Promise<EnhancementResult> {
    const context = {
      projectName,
      currentDescription,
      technologies: technologies.join(", "),
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.7,
        maxTokens: 400,
      });

      const result = JSON.parse(response.data as string);
      
      return {
        original: currentDescription,
        enhanced: result.enhanced || result.description || currentDescription,
        improvements: result.improvements || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Error enhancing project description:", error);
      throw error;
    }
  }

  /**
   * Enhance skills summary
   */
  async enhanceSkillsSummary(
    userId: string,
    skills: any[],
  ): Promise<EnhancementResult> {
    const context = {
      skills: skills.map((s) => s.name || s).join(", "),
      skillCount: skills.length,
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.6,
        maxTokens: 300,
      });

      const result = JSON.parse(response.data as string);
      
      return {
        original: skills.map((s) => s.name || s).join(", "),
        enhanced: result.enhanced || result.summary || skills.map((s) => s.name || s).join(", "),
        improvements: result.improvements || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Error enhancing skills summary:", error);
      throw error;
    }
  }

  /**
   * Generate professional headline
   */
  async generateProfessionalHeadline(
    userId: string,
    profile: any,
  ): Promise<string> {
    const context = {
      displayName: profile.displayName,
      experience: profile.experience?.[0]?.role || "",
      skills: profile.skills?.slice(0, 5).map((s: any) => s.name || s).join(", "),
      projects: profile.projects?.slice(0, 3).map((p: any) => p.name).join(", "),
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.8,
        maxTokens: 100,
      });

      const result = JSON.parse(response.data as string);
      return result.headline || result.enhanced || profile.headline || "Professional";
    } catch (error) {
      console.error("Error generating professional headline:", error);
      return profile.headline || "Professional";
    }
  }

  /**
   * Enhance experience description
   */
  async enhanceExperienceDescription(
    userId: string,
    role: string,
    company: string,
    currentDescription: string,
  ): Promise<EnhancementResult> {
    const context = {
      role,
      company,
      currentDescription,
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.7,
        maxTokens: 400,
      });

      const result = JSON.parse(response.data as string);
      
      return {
        original: currentDescription,
        enhanced: result.enhanced || result.description || currentDescription,
        improvements: result.improvements || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Error enhancing experience description:", error);
      throw error;
    }
  }

  /**
   * Enhance achievement wording
   */
  async enhanceAchievementWording(
    userId: string,
    achievementTitle: string,
    currentDescription: string,
  ): Promise<EnhancementResult> {
    const context = {
      achievementTitle,
      currentDescription,
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.7,
        maxTokens: 300,
      });

      const result = JSON.parse(response.data as string);
      
      return {
        original: currentDescription,
        enhanced: result.enhanced || result.description || currentDescription,
        improvements: result.improvements || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Error enhancing achievement wording:", error);
      throw error;
    }
  }

  /**
   * Generate multiple versions
   */
  async generateMultipleVersions(
    userId: string,
    section: string,
    content: string,
    count: number = 3,
  ): Promise<string[]> {
    const versions: string[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const context = {
          section,
          content,
          version: i + 1,
        };

        const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
          temperature: 0.8 + (i * 0.1),
          maxTokens: 300,
        });

        const result = JSON.parse(response.data as string);
        versions.push(result.enhanced || result.content || content);
      } catch (error) {
        console.error(`Error generating version ${i + 1}:`, error);
        versions.push(content);
      }
    }

    return versions;
  }

  /**
   * Get portfolio improvement suggestions
   */
  async getPortfolioImprovementSuggestions(
    userId: string,
    profile: any,
  ): Promise<string[]> {
    const context = {
      profile: JSON.stringify(profile),
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.6,
        maxTokens: 500,
      });

      const result = JSON.parse(response.data as string);
      return result.suggestions || result.improvements || [];
    } catch (error) {
      console.error("Error getting portfolio improvement suggestions:", error);
      return [];
    }
  }

  /**
   * Enhance entire portfolio
   */
  async enhanceEntirePortfolio(
    userId: string,
    profile: any,
  ): Promise<{
    about: EnhancementResult;
    headline: string;
    projectDescriptions: EnhancementResult[];
    experienceDescriptions: EnhancementResult[];
    achievements: EnhancementResult[];
  }> {
    const results = {
      about: await this.enhanceAboutSection(userId, profile.bio || "", profile),
      headline: await this.generateProfessionalHeadline(userId, profile),
      projectDescriptions: [] as EnhancementResult[],
      experienceDescriptions: [] as EnhancementResult[],
      achievements: [] as EnhancementResult[],
    };

    // Enhance project descriptions (limit to first 3)
    for (const project of (profile.projects || []).slice(0, 3)) {
      const enhanced = await this.enhanceProjectDescription(
        userId,
        project.name,
        project.description,
        project.technologies || [],
      );
      results.projectDescriptions.push(enhanced);
    }

    // Enhance experience descriptions (limit to first 2)
    for (const exp of (profile.experience || []).slice(0, 2)) {
      const enhanced = await this.enhanceExperienceDescription(
        userId,
        exp.role,
        exp.company,
        exp.description || "",
      );
      results.experienceDescriptions.push(enhanced);
    }

    // Enhance achievements (limit to first 2)
    for (const achievement of (profile.achievements || []).slice(0, 2)) {
      const enhanced = await this.enhanceAchievementWording(
        userId,
        achievement.title,
        achievement.description,
      );
      results.achievements.push(enhanced);
    }

    return results;
  }
}

export const aiPortfolioEnhancementService = new AIPortfolioEnhancementService();
