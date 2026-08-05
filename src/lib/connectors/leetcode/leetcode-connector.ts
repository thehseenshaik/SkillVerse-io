/**
 * LeetCode Connector
 * Fetches and normalizes LeetCode user data
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

export class LeetCodeConnector extends BaseConnector {
  readonly config: ConnectorConfig = PLATFORM_CONFIGS.leetcode;
  private baseUrl = "https://leetcode.com/graphql";

  async authenticate(
    credentials: any,
  ): Promise<ConnectorResult<{ token: string }>> {
    // LeetCode doesn't require authentication for public profiles
    return { success: true, data: { token: "" } };
  }

  async fetchProfile(username: string): Promise<ConnectorResult<any>> {
    try {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            profile {
              realName
              userAvatar
              aboutMe
              country
              company
              school
              skillTags
              websites
            }
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { username },
        }),
      });

      if (!response.ok) {
        throw new Error(`LeetCode API error: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  normalizeData(rawData: any): Partial<UnifiedProfile> {
    const profile = rawData.matchedUser?.profile;
    if (!profile) return {};

    return {
      displayName: profile.realName,
      bio: profile.aboutMe,
      location: profile.country,
      avatar: profile.userAvatar,
    };
  }

  async fetchCodingStats(
    username: string,
  ): Promise<ConnectorResult<CodingStats>> {
    try {
      const query = `
        query getUserStats($username: String!) {
          matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          user(username: $username) {
            profile {
              ranking
            }
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { username },
        }),
      });

      if (!response.ok) {
        throw new Error(`LeetCode API error: ${response.statusText}`);
      }

      const data = await response.json();

      const submitStats = data.data.matchedUser?.submitStats?.acSubmissionNum;
      const ranking = data.data.user?.profile?.ranking;

      const difficultyBreakdown = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      submitStats?.forEach((stat: any) => {
        if (stat.difficulty === "Easy") difficultyBreakdown.easy = stat.count;
        if (stat.difficulty === "Medium")
          difficultyBreakdown.medium = stat.count;
        if (stat.difficulty === "Hard") difficultyBreakdown.hard = stat.count;
      });

      const totalSolved =
        difficultyBreakdown.easy +
        difficultyBreakdown.medium +
        difficultyBreakdown.hard;

      const stats: CodingStats = {
        platform: "leetcode",
        username,
        problemsSolved: totalSolved,
        ranking,
        difficultyBreakdown,
        lastUpdated: new Date(),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async fetchProjects(username: string): Promise<ConnectorResult<Project[]>> {
    // LeetCode doesn't have traditional projects
    return { success: false, error: "Not applicable for this platform" };
  }

  async fetchAchievements(
    username: string,
  ): Promise<ConnectorResult<Achievement[]>> {
    try {
      const query = `
        query getUserBadges($username: String!) {
          matchedUser(username: $username) {
            badges {
              id
              displayName
              icon
              creationDate
            }
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { username },
        }),
      });

      if (!response.ok) {
        throw new Error(`LeetCode API error: ${response.statusText}`);
      }

      const data = await response.json();

      const badges = data.data.matchedUser?.badges || [];

      const achievements: Achievement[] = badges.map((badge: any) => ({
        id: `leetcode-${badge.id}`,
        title: badge.displayName,
        description: "LeetCode badge",
        icon: badge.icon,
        date: new Date(badge.creationDate),
        source: "leetcode",
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
    // LeetCode doesn't have a public contributions API
    return { success: false, error: "Not available for this platform" };
  }

  extractSkills(rawData: any): Skill[] {
    const skills: Skill[] = [];
    const profile = rawData.matchedUser?.profile;

    if (profile?.skillTags) {
      profile.skillTags.forEach((tag: string) => {
        skills.push({
          id: `leetcode-skill-${tag.toLowerCase().replace(/\s+/g, "-")}`,
          name: tag,
          category: "programming_language",
          proficiency: 70,
          sources: ["leetcode"],
          verified: true,
        });
      });
    }

    return skills;
  }
}
