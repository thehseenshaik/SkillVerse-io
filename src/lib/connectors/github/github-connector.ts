/**
 * GitHub Connector
 * Fetches and normalizes GitHub user data
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

export class GitHubConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.github;

  private token: string = "";
  private baseUrl = "https://api.github.com";

  async authenticate(credentials: {
    token: string;
  }): Promise<ConnectorResult<{ token: string }>> {
    try {
      this.token = credentials.token;
      // Validate token by fetching user
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: "Invalid token. Please check your credentials.",
          };
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return { success: true, data: { token: this.token } };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}/users/${username}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    return {
      displayName: rawData.name || rawData.login,
      bio: rawData.bio,
      location: rawData.location,
      website: rawData.blog,
      avatar: rawData.avatar_url,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      // Fetch repositories for language stats
      const reposResponse = await fetch(
        `${this.baseUrl}/users/${username}/repos?per_page=100&sort=updated`,
        { headers },
      );

      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.statusText}`);
      }

      const repos = await reposResponse.json();

      // Calculate language distribution
      const languages: Record<string, number> = {};
      repos.forEach((repo: any) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      const stats: CodingStats = {
        platform: "github",
        username,
        languages,
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(
        `${this.baseUrl}/users/${username}/repos?per_page=30&sort=updated`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos = await response.json();

      const projects: Project[] = repos.map((repo: any) => ({
        id: `github-${repo.id}`,
        name: repo.name,
        description: repo.description || "",
        technologies: repo.language ? [repo.language] : [],
        repository: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        source: "github",
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at),
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
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      // GitHub doesn't have a dedicated achievements API, so we'll create some based on stats
      const profileResponse = await fetch(`${this.baseUrl}/users/${username}`, {
        headers,
      });

      if (!profileResponse.ok) {
        throw new Error(`GitHub API error: ${profileResponse.statusText}`);
      }

      const profile = await profileResponse.json();

      const achievements: Achievement[] = [];

      // Create achievements based on milestones
      if (profile.public_repos >= 10) {
        achievements.push({
          id: "github-10-repos",
          title: "Repository Pioneer",
          description: "Created 10+ public repositories",
          date: new Date(),
          source: "github",
          type: "milestone",
        });
      }

      if (profile.followers >= 100) {
        achievements.push({
          id: "github-100-followers",
          title: "Community Builder",
          description: "Gained 100+ followers",
          date: new Date(),
          source: "github",
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
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      // GitHub contributions graph requires GraphQL or scraping
      // For now, we'll return a simplified version based on recent activity
      const response = await fetch(
        `${this.baseUrl}/users/${username}/events/public?per_page=30`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const events = await response.json();

      const contributions: Contribution[] = events.map((event: any) => ({
        date: new Date(event.created_at),
        count: 1,
        platform: "github",
      }));

      return { success: true, data: contributions };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];

    // Extract skills from pinned repositories (if available)
    if (rawData.pinned_items?.repositories) {
      const languages = new Set<string>();
      rawData.pinned_items.repositories.forEach((repo: any) => {
        if (repo.language) {
          languages.add(repo.language);
        }
      });

      languages.forEach((lang) => {
        skills.push({
          id: `github-skill-${lang.toLowerCase()}`,
          name: lang,
          category: "programming_language",
          proficiency: 75, // Default proficiency
          sources: ["github"],
          verified: true,
        });
      });
    }

    return skills;
  }

  async disconnect(): Promise<ConnectorResult<void>> {
    this.token = "";
    return { success: true };
  }
}
