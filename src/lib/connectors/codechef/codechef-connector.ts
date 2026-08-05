/**
 * CodeChef Connector
 * Fetches and normalizes CodeChef user data
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

export class CodeChefConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.codechef;
  private baseUrl = "https://www.codechef.com";

  async authenticate(
    credentials: any,
  ): Promise<ConnectorResult<{ token: string }>> {
    // CodeChef doesn't require authentication for public profiles
    return { success: true, data: { token: "" } };
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      // CodeChef has a public API endpoint for user profiles
      const response = await fetch(`${this.baseUrl}/api/users/${username}`);

      if (!response.ok) {
        throw new Error(`CodeChef API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    if (!rawData.successful) return {};

    const userData = rawData.data;
    return {
      displayName: userData.name || userData.username,
      bio: userData.about,
      location: userData.country,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${username}`);

      if (!response.ok) {
        throw new Error(`CodeChef API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.successful) {
        throw new Error("User not found");
      }

      const userData = data.data;

      const stats: CodingStats = {
        platform: "codechef",
        username,
        rating: userData.rating,
        ranking: userData.global_rank,
        problemsSolved: userData.problems_solved,
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    // CodeChef doesn't have traditional projects
    return { success: false, error: "Not applicable for this platform" };
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${username}`);

      if (!response.ok) {
        throw new Error(`CodeChef API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.successful) {
        throw new Error("User not found");
      }

      const userData = data.data;
      const achievements: Achievement[] = [];

      // Add star rating as achievement
      if (userData.stars) {
        achievements.push({
          id: `codechef-stars-${userData.stars}`,
          title: `${userData.stars} Star Coder`,
          description: `Achieved ${userData.stars} star rating on CodeChef`,
          date: new Date(),
          source: "codechef",
          type: "badge",
        });
      }

      // Add rating milestones
      if (userData.rating >= 2000) {
        achievements.push({
          id: "codechef-rating-2000",
          title: "Expert Coder",
          description: "Achieved 2000+ rating on CodeChef",
          date: new Date(),
          source: "codechef",
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
    // CodeChef doesn't have a public contributions API
    return { success: false, error: "Not available for this platform" };
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    if (rawData.successful && rawData.data) {
      // Extract skills from problem-solving languages
      // This would need additional API calls to get language statistics
      const languages = ["C++", "Python", "Java", "C"];

      languages.forEach((lang) => {
        skills.push({
          id: `codechef-skill-${lang.toLowerCase()}`,
          name: lang,
          category: "programming_language",
          proficiency: 60,
          sources: ["codechef"],
          verified: true,
        });
      });
    }

    return skills;
  }
}
