/**
 * Dashboard Utilities
 * Adaptive widget logic and data processing for the Career Dashboard
 */

import type { Platform, PlatformConnection } from "@/types/identity-hub";
import { getCodingPlatforms, getProfessionalPlatforms } from "./connectors/platform-config";

export interface DashboardData {
  connections: PlatformConnection[];
  careerScore?: number;
  profileCompletion?: number;
  resumeCompletion?: number;
  lastSynced?: Date;
  activities?: any[];
  skills?: string[];
  missingSkills?: string[];
  missingProjects?: string[];
  atsScore?: number;
}

/**
 * Check if a platform has active data
 */
export function hasPlatformData(connections: PlatformConnection[], platform: Platform): boolean {
  const connection = connections.find(c => c.platform === platform);
  return connection?.status === 'connected' && !!connection.username;
}

/**
 * Get all connected platforms
 */
export function getConnectedPlatforms(connections: PlatformConnection[]): Platform[] {
  return connections
    .filter(c => c.status === 'connected' && c.username)
    .map(c => c.platform);
}

/**
 * Export for use in dashboard
 */
export { getConnectedPlatforms as getConnectedPlatformsList };

/**
 * Get connected coding platforms
 */
export function getConnectedCodingPlatforms(connections: PlatformConnection[]): Platform[] {
  const codingPlatforms = getCodingPlatforms();
  return getConnectedPlatforms(connections).filter(p => codingPlatforms.includes(p));
}

/**
 * Get connected professional platforms
 */
export function getConnectedProfessionalPlatforms(connections: PlatformConnection[]): Platform[] {
  const professionalPlatforms = getProfessionalPlatforms();
  return getConnectedPlatforms(connections).filter(p => professionalPlatforms.includes(p));
}

/**
 * Determine if unified activity feed should be shown
 */
export function shouldShowActivityFeed(connections: PlatformConnection[]): boolean {
  return getConnectedPlatforms(connections).length > 0;
}

/**
 * Determine if skills intelligence should be shown
 */
export function shouldShowSkillsIntelligence(skills?: string[]): boolean {
  return !!(skills && skills.length > 0);
}

/**
 * Determine if career goals should be shown
 */
export function shouldShowCareerGoals(connections: PlatformConnection[]): boolean {
  return getConnectedPlatforms(connections).length > 0;
}

/**
 * Determine if resume status should be shown
 */
export function shouldShowResumeStatus(resumeCompletion?: number): boolean {
  return resumeCompletion !== undefined;
}

/**
 * Determine if onboarding card should be shown (when no platforms connected)
 */
export function shouldShowOnboarding(connections: PlatformConnection[]): boolean {
  return getConnectedPlatforms(connections).length === 0;
}

/**
 * Get adaptive layout configuration based on connected platforms
 */
export function getAdaptiveLayout(connections: PlatformConnection[]) {
  const connectedPlatforms = getConnectedPlatforms(connections);
  const codingPlatforms = getConnectedCodingPlatforms(connections);
  const professionalPlatforms = getConnectedProfessionalPlatforms(connections);

  return {
    totalPlatforms: connectedPlatforms.length,
    codingPlatforms: codingPlatforms.length,
    professionalPlatforms: professionalPlatforms.length,
    hasData: connectedPlatforms.length > 0,
    showActivityFeed: shouldShowActivityFeed(connections),
    showCareerGoals: shouldShowCareerGoals(connections),
    showOnboarding: shouldShowOnboarding(connections),
  };
}

/**
 * Generate platform-specific career goals
 */
export function generatePlatformGoals(platform: Platform): Array<{
  id: string;
  title: string;
  completed: boolean;
  platform: Platform;
}> {
  const goalMap: Record<Platform, Array<{ title: string }>> = {
    github: [
      { title: "Push 5 commits this week" },
      { title: "Create a new repository" },
      { title: "Contribute to open source" },
    ],
    leetcode: [
      { title: "Solve 10 problems this week" },
      { title: "Maintain 7-day streak" },
      { title: "Solve 2 Medium problems" },
    ],
    codeforces: [
      { title: "Participate in a contest" },
      { title: "Improve rating by 50" },
      { title: "Solve 5 problems" },
    ],
    gfg: [
      { title: "Solve 10 problems" },
      { title: "Complete a course module" },
      { title: "Improve coding score" },
    ],
    hackerrank: [
      { title: "Earn a new badge" },
      { title: "Complete a challenge" },
      { title: "Solve 5 problems" },
    ],
    codechef: [
      { title: "Participate in a contest" },
      { title: "Improve rating" },
      { title: "Solve 5 problems" },
    ],
    kaggle: [
      { title: "Join a competition" },
      { title: "Complete a notebook" },
      { title: "Earn a medal" },
    ],
    linkedin: [
      { title: "Update profile" },
      { title: "Post an update" },
      { title: "Connect with 5 people" },
    ],
    medium: [
      { title: "Publish an article" },
      { title: "Write 2 drafts" },
      { title: "Get 100 followers" },
    ],
    devto: [
      { title: "Publish a post" },
      { title: "Comment on 5 posts" },
      { title: "Get 50 reactions" },
    ],
    portfolio: [
      { title: "Add a new project" },
      { title: "Update portfolio" },
      { title: "Write a case study" },
    ],
  };

  const goals = goalMap[platform] || [];
  return goals.map((goal, index) => ({
    id: `${platform}-${index}`,
    title: goal.title,
    completed: false,
    platform,
  }));
}

/**
 * Merge activities from multiple platforms into unified timeline
 */
export function mergeActivities(activitiesByPlatform: Record<Platform, any[]>) {
  const allActivities: any[] = [];

  Object.entries(activitiesByPlatform).forEach(([platform, activities]) => {
    activities.forEach(activity => {
      allActivities.push({
        ...activity,
        platform: platform as Platform,
      });
    });
  });

  // Sort by timestamp descending
  return allActivities.sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return bTime - aTime;
  });
}

/**
 * Generate AI insights based on connected platforms and data
 */
export function generateAIInsights(
  connections: PlatformConnection[],
  activities?: any[],
  skills?: string[]
): Array<{
  id: string;
  type: "suggestion" | "warning" | "achievement" | "tip";
  title: string;
  description: string;
  platform?: Platform;
}> {
  const insights: Array<{
    id: string;
    type: "suggestion" | "warning" | "achievement" | "tip";
    title: string;
    description: string;
    platform?: Platform;
  }> = [];

  const connectedPlatforms = getConnectedPlatforms(connections);

  // Platform-specific insights
  if (hasPlatformData(connections, "github")) {
    insights.push({
      id: "github-activity",
      type: "suggestion",
      title: "GitHub Activity",
      description: "Your commit activity has decreased. Consider pushing more frequently.",
      platform: "github",
    });
  }

  if (hasPlatformData(connections, "leetcode")) {
    insights.push({
      id: "leetcode-streak",
      type: "achievement",
      title: "LeetCode Streak",
      description: "Great job! Your solving streak has improved this week.",
      platform: "leetcode",
    });
  }

  if (hasPlatformData(connections, "codeforces")) {
    insights.push({
      id: "codeforces-rating",
      type: "tip",
      title: "Codeforces Rating",
      description: "Participate in more contests to improve your rating.",
      platform: "codeforces",
    });
  }

  // General insights
  if (skills && skills.length < 5) {
    insights.push({
      id: "more-skills",
      type: "suggestion",
      title: "Add More Skills",
      description: "Add more technical skills to improve your profile visibility.",
    });
  }

  if (connectedPlatforms.length < 3) {
    insights.push({
      id: "connect-more",
      type: "suggestion",
      title: "Connect More Platforms",
      description: "Connect more platforms to get comprehensive career insights.",
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}
