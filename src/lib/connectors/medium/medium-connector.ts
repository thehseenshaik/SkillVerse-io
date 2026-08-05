/**
 * Medium Connector
 * Fetches and normalizes Medium user data and articles
 */

import { BaseConnector } from "../base-connector";
import {
  ConnectorConfig,
  ConnectorResult,
  UnifiedProfile,
  CodingStats,
  Project,
  Achievement,
  Skill,
  Contribution,
} from "@/types/identity-hub";
import { PLATFORM_CONFIGS } from "../platform-config";

export class MediumConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.medium;
  private baseUrl = "https://medium.com";

  async authenticate(
    credentials: any,
  ): Promise<ConnectorResult<{ token: string }>> {
    // Medium doesn't require authentication for public profiles
    return { success: true, data: { token: "" } };
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      // Medium doesn't have a public API for user profiles
      // This would require web scraping or RSS feed parsing
      return {
        success: false,
        error: "Medium doesn't have a public API. RSS feed parsing required.",
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    return {
      displayName: rawData.name,
      bio: rawData.bio,
      avatar: rawData.image,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    return { success: false, error: "Not applicable for this platform" };
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    try {
      // Medium articles can be treated as projects/writing samples
      const rssUrl = `${this.baseUrl}/feed/@${username}`;
      const response = await fetch(rssUrl);

      if (!response.ok) {
        throw new Error(`Medium RSS error: ${response.statusText}`);
      }

      const rssText = await response.text();
      // Parse RSS XML to extract articles
      // This would require an XML parser library
      // For now, return placeholder
      return {
        success: false,
        error: "RSS parsing requires XML library. Manual import available.",
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    try {
      // Medium doesn't have traditional achievements
      // Could track article milestones (e.g., 10 articles, 1000 followers)
      return { success: true, data: [] };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchContributions(
    username: string,
  ): Promise<ConnectorResult<Contribution[]>> {
    try {
      // Articles published as contributions
      const rssUrl = `${this.baseUrl}/feed/@${username}`;
      const response = await fetch(rssUrl);

      if (!response.ok) {
        throw new Error(`Medium RSS error: ${response.statusText}`);
      }

      // Parse RSS to get publication dates
      // This would require XML parsing
      return {
        success: false,
        error: "RSS parsing requires XML library.",
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    // Extract skills from article topics/tags
    if (rawData.articles) {
      const topics = new Set<string>();
      rawData.articles.forEach((article: any) => {
        article.tags?.forEach((tag: string) => topics.add(tag));
      });

      topics.forEach((topic) => {
        skills.push({
          id: `medium-skill-${topic.toLowerCase().replace(/\s+/g, "-")}`,
          name: topic,
          category: "tools", // Default category for writing topics
          proficiency: 60,
          sources: ["medium"],
          verified: true,
        });
      });
    }

    return skills;
  }
}
