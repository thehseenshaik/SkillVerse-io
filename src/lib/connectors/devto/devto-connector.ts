/**
 * Dev.to Connector
 * Fetches and normalizes Dev.to user data and articles
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

export class DevToConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.devto;
  private baseUrl = "https://dev.to/api";

  async authenticate(credentials: {
    apiKey?: string;
  }): Promise<ConnectorResult<{ token: string }>> {
    // Dev.to doesn't require authentication for public profiles
    // API key can be provided for higher rate limits
    return { success: true, data: { token: credentials.apiKey || "" } };
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/by_username?url=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    return {
      displayName: rawData.name,
      bio: rawData.summary,
      location: rawData.location,
      website: rawData.website_url,
      avatar: rawData.profile_image,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/by_username?url=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }

      const data = await response.json();

      const stats: CodingStats = {
        platform: "devto",
        username,
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    try {
      // Fetch user's articles as projects/writing samples
      const response = await fetch(
        `${this.baseUrl}/articles?username=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }

      const data = await response.json();

      const projects: Project[] = data.map((article: any) => ({
        id: `devto-${article.id}`,
        name: article.title,
        description: article.description || article.tag_list.join(", "),
        technologies: article.tag_list,
        repository: article.url,
        source: "devto",
        createdAt: new Date(article.published_at),
        updatedAt: new Date(article.published_timestamp),
      }));

      return { success: true, data: projects };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/by_username?url=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }

      const data = await response.json();
      const achievements: Achievement[] = [];

      // Add article count milestones
      if (data.article_count >= 10) {
        achievements.push({
          id: "devto-10-articles",
          title: "Prolific Writer",
          description: "Published 10+ articles on Dev.to",
          date: new Date(),
          source: "devto",
          type: "milestone",
        });
      }

      if (data.followers_count >= 100) {
        achievements.push({
          id: "devto-100-followers",
          title: "Community Builder",
          description: "Gained 100+ followers on Dev.to",
          date: new Date(),
          source: "devto",
          type: "milestone",
        });
      }

      return { success: true, data: achievements };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchContributions(
    username: string,
  ): Promise<ConnectorResult<Contribution[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/articles?username=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }

      const data = await response.json();

      const contributions: Contribution[] = data.map((article: any) => ({
        date: new Date(article.published_at),
        count: 1,
        platform: "devto",
      }));

      return { success: true, data: contributions };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    // Extract skills from article tags
    if (rawData.tag_list) {
      rawData.tag_list.forEach((tag: string) => {
        skills.push({
          id: `devto-skill-${tag.toLowerCase().replace(/\s+/g, "-")}`,
          name: tag,
          category: "tools", // Default category for tech topics
          proficiency: 65,
          sources: ["devto"],
          verified: true,
        });
      });
    }

    return skills;
  }
}
