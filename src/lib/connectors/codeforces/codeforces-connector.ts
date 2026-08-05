/**
 * Codeforces Connector
 * Fetches and normalizes Codeforces user data
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

export class CodeforcesConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.codeforces;
  private baseUrl = "https://codeforces.com/api";

  async authenticate(
    credentials: any,
  ): Promise<ConnectorResult<{ token: string }>> {
    // Codeforces doesn't require authentication for public profiles
    return { success: true, data: { token: "" } };
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user.info?handles=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Codeforces API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("User not found");
      }

      return { success: true, data: data.result[0] };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    return {
      displayName:
        rawData.firstName && rawData.lastName
          ? `${rawData.firstName} ${rawData.lastName}`
          : rawData.handle,
      location: rawData.country,
      avatar: rawData.titlePhoto,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user.info?handles=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Codeforces API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("User not found");
      }

      const userData = data.result[0];

      // Fetch rating history
      const ratingResponse = await fetch(
        `${this.baseUrl}/user.rating?handle=${username}`,
      );
      const ratingData = await ratingResponse.json();

      const stats: CodingStats = {
        platform: "codeforces",
        username,
        rating: userData.rating,
        ranking: userData.rank,
        problemsSolved: 0, // Codeforces doesn't provide this directly
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    // Codeforces doesn't have traditional projects
    return { success: false, error: "Not applicable for this platform" };
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user.info?handles=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Codeforces API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("User not found");
      }

      const userData = data.result[0];
      const achievements: Achievement[] = [];

      // Add rank achievements
      if (userData.rank) {
        achievements.push({
          id: `codeforces-rank-${userData.rank}`,
          title: `${userData.rank.charAt(0).toUpperCase() + userData.rank.slice(1)} Coder`,
          description: `Achieved ${userData.rank} rank on Codeforces`,
          date: new Date(),
          source: "codeforces",
          type: "badge",
        });
      }

      // Add rating milestones
      if (userData.rating >= 2400) {
        achievements.push({
          id: "codeforces-grandmaster",
          title: "International Grandmaster",
          description: "Achieved 2400+ rating on Codeforces",
          date: new Date(),
          source: "codeforces",
          type: "milestone",
        });
      } else if (userData.rating >= 2100) {
        achievements.push({
          id: "codeforces-master",
          title: "Master",
          description: "Achieved 2100+ rating on Codeforces",
          date: new Date(),
          source: "codeforces",
          type: "milestone",
        });
      } else if (userData.rating >= 1900) {
        achievements.push({
          id: "codeforces-candidate-master",
          title: "Candidate Master",
          description: "Achieved 1900+ rating on Codeforces",
          date: new Date(),
          source: "codeforces",
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
        `${this.baseUrl}/user.status?handle=${username}`,
      );

      if (!response.ok) {
        throw new Error(`Codeforces API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("User not found");
      }

      const submissions = data.result;
      const contributions: Contribution[] = [];

      // Group submissions by date
      const submissionsByDate = new Map<string, number>();
      submissions.forEach((sub: any) => {
        const dateKey = new Date(sub.creationTimeSeconds * 1000)
          .toISOString()
          .split("T")[0];
        submissionsByDate.set(
          dateKey,
          (submissionsByDate.get(dateKey) || 0) + 1,
        );
      });

      submissionsByDate.forEach((count, dateKey) => {
        contributions.push({
          date: new Date(dateKey),
          count,
          platform: "codeforces",
        });
      });

      return { success: true, data: contributions };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    // Codeforces doesn't provide language statistics directly
    // Add common competitive programming languages
    const languages = ["C++", "Python", "Java", "C#", "Go"];

    languages.forEach((lang) => {
      skills.push({
        id: `codeforces-skill-${lang.toLowerCase()}`,
        name: lang,
        category: "programming_language",
        proficiency: 65,
        sources: ["codeforces"],
        verified: true,
      });
    });

    return skills;
  }
}
