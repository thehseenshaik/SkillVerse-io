/**
 * Kaggle Connector
 * Fetches and normalizes Kaggle user data
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

export class KaggleConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.kaggle;
  private baseUrl = "https://www.kaggle.com";
  private apiKey: string = "";

  async authenticate(credentials: {
    apiKey: string;
  }): Promise<ConnectorResult<{ token: string }>> {
    try {
      this.apiKey = credentials.apiKey;
      // Validate API key by making a test request
      const response = await fetch(`${this.baseUrl}/api/v1/account`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Invalid API key. Please check your credentials.",
        };
      }

      return { success: true, data: { token: this.apiKey } };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/${username}`, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    return {
      displayName: rawData.displayName || rawData.userName,
      bio: rawData.about,
      location: rawData.location,
      avatar: rawData.avatarUrl,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/users/${username}/statistics`,
        {
          headers: this.apiKey
            ? { Authorization: `Bearer ${this.apiKey}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();

      const stats: CodingStats = {
        platform: "kaggle",
        username,
        ranking: data.rank,
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/users/${username}/kernels`,
        {
          headers: this.apiKey
            ? { Authorization: `Bearer ${this.apiKey}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();

      const projects: Project[] = data.map((kernel: any) => ({
        id: `kaggle-${kernel.id}`,
        name: kernel.title,
        description: kernel.description || "",
        technologies: ["Python", "Jupyter"], // Default for Kaggle notebooks
        repository: `${this.baseUrl}/code/${username}/${kernel.slug}`,
        source: "kaggle",
        createdAt: new Date(kernel.creationDate),
        updatedAt: new Date(kernel.lastRunTime),
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
        `${this.baseUrl}/api/v1/users/${username}/achievements`,
        {
          headers: this.apiKey
            ? { Authorization: `Bearer ${this.apiKey}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();

      const achievements: Achievement[] = data.map((achievement: any) => ({
        id: `kaggle-${achievement.id}`,
        title: achievement.name,
        description: achievement.description,
        icon: achievement.iconUrl,
        date: new Date(achievement.achievedDate),
        source: "kaggle",
        type: "badge",
      }));

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
        `${this.baseUrl}/api/v1/users/${username}/kernels`,
        {
          headers: this.apiKey
            ? { Authorization: `Bearer ${this.apiKey}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();

      const contributions: Contribution[] = data.map((kernel: any) => ({
        date: new Date(kernel.creationDate),
        count: 1,
        platform: "kaggle",
      }));

      return { success: true, data: contributions };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    // Kaggle focuses on data science skills
    const dataScienceSkills: Array<{
      name: string;
      category: "programming_language" | "ai_ml";
    }> = [
      { name: "Python", category: "programming_language" },
      { name: "R", category: "programming_language" },
      { name: "Machine Learning", category: "ai_ml" },
      { name: "Data Science", category: "ai_ml" },
      { name: "Deep Learning", category: "ai_ml" },
      { name: "Pandas", category: "ai_ml" },
      { name: "NumPy", category: "ai_ml" },
      { name: "Scikit-learn", category: "ai_ml" },
      { name: "TensorFlow", category: "ai_ml" },
      { name: "PyTorch", category: "ai_ml" },
    ];

    dataScienceSkills.forEach((skill) => {
      skills.push({
        id: `kaggle-skill-${skill.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: skill.name,
        category: skill.category,
        proficiency: 70,
        sources: ["kaggle"],
        verified: true,
      });
    });

    return skills;
  }

  async disconnect(): Promise<ConnectorResult<void>> {
    this.apiKey = "";
    return { success: true };
  }
}
