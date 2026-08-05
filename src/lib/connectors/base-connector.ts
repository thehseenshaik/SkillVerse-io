/**
 * Base Connector Interface
 * All platform connectors must implement this interface
 */

import type {
  Platform,
  ConnectorConfig,
  ConnectorResult,
  UnifiedProfile,
  CodingStats,
  Project,
  Achievement,
  Skill,
  Contribution,
} from "@/types/identity-hub";

export interface PlatformConnector {
  readonly config: ConnectorConfig;

  /**
   * Authenticate with the platform
   */
  authenticate(credentials: any): Promise<ConnectorResult<{ token: string }>>;

  /**
   * Fetch user profile data from the platform
   */
  fetchProfile(username: string): Promise<ConnectorResult<any>>;

  /**
   * Normalize platform data to SkillVerse format
   */
  normalizeData(rawData: any): Partial<UnifiedProfile>;

  /**
   * Fetch coding statistics
   */
  fetchCodingStats(username: string): Promise<ConnectorResult<CodingStats>>;

  /**
   * Fetch projects
   */
  fetchProjects(username: string): Promise<ConnectorResult<Project[]>>;

  /**
   * Fetch achievements
   */
  fetchAchievements(username: string): Promise<ConnectorResult<Achievement[]>>;

  /**
   * Fetch contributions/activity
   */
  fetchContributions(
    username: string,
  ): Promise<ConnectorResult<Contribution[]>>;

  /**
   * Extract skills from profile data
   */
  extractSkills(rawData: any): Skill[];

  /**
   * Validate connection
   */
  validateConnection(username: string): Promise<ConnectorResult<boolean>>;

  /**
   * Disconnect from platform
   */
  disconnect(): Promise<ConnectorResult<void>>;
}

export abstract class BaseConnector implements PlatformConnector {
  abstract readonly config: ConnectorConfig;

  abstract authenticate(
    credentials: any,
  ): Promise<ConnectorResult<{ token: string }>>;
  abstract fetchProfile(username: string): Promise<ConnectorResult<any>>;
  abstract normalizeData(rawData: any): Partial<UnifiedProfile>;

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    return { success: false, error: "Not implemented for this platform" };
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    return { success: false, error: "Not implemented for this platform" };
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    return { success: false, error: "Not implemented for this platform" };
  }

  async fetchContributions(
    username: string,
  ): Promise<ConnectorResult<Contribution[]>> {
    return { success: false, error: "Not implemented for this platform" };
  }

  extractSkills(rawData: any): Skill[] {
    return [];
  }

  async validateConnection(
    username: string,
  ): Promise<ConnectorResult<boolean>> {
    try {
      const result = await this.fetchProfile(username);
      return { success: true, data: result.success };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Connection validation failed",
      };
    }
  }

  async disconnect(): Promise<ConnectorResult<void>> {
    return { success: true };
  }

  protected handleError(error: any): ConnectorResult<any> {
    console.error(`[${this.config.name}] Error:`, error);

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Authentication expired. Please reconnect.",
      };
    }
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Profile not found. Please check the username.",
      };
    }
    if (error.response?.status === 429) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
