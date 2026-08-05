/**
 * Achievement Aggregator Service
 * Collects and normalizes achievements from all connected platforms
 */

import type {
  Achievement,
  Platform,
  AchievementTimeline,
} from "@/types/identity-hub";

export class AchievementAggregator {
  /**
   * Aggregate achievements from multiple platforms
   */
  aggregateAchievements(
    achievementsByPlatform: Record<Platform, Achievement[]>,
  ): Achievement[] {
    const allAchievements: Achievement[] = [];

    Object.values(achievementsByPlatform).forEach((achievements) => {
      allAchievements.push(...achievements);
    });

    // Sort by date (most recent first)
    return allAchievements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Create timeline of achievements
   */
  createTimeline(achievements: Achievement[]): AchievementTimeline[] {
    const timelineMap = new Map<string, Achievement[]>();

    achievements.forEach((achievement) => {
      const dateKey = this.getDateKey(achievement.date);
      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, []);
      }
      timelineMap.get(dateKey)!.push(achievement);
    });

    const timeline: AchievementTimeline[] = Array.from(timelineMap.entries())
      .map(([dateKey, achievements]) => ({
        date: new Date(dateKey),
        achievements: achievements.sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        ),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }

  /**
   * Get date key for grouping (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Group achievements by type
   */
  groupByType(achievements: Achievement[]): Record<string, Achievement[]> {
    const grouped: Record<string, Achievement[]> = {
      badge: [],
      certification: [],
      milestone: [],
      medal: [],
      recognition: [],
    };

    achievements.forEach((achievement) => {
      if (grouped[achievement.type]) {
        grouped[achievement.type].push(achievement);
      }
    });

    return grouped;
  }

  /**
   * Group achievements by platform
   */
  groupByPlatform(
    achievements: Achievement[],
  ): Record<Platform, Achievement[]> {
    const grouped: Record<Platform, Achievement[]> = {} as Record<
      Platform,
      Achievement[]
    >;

    achievements.forEach((achievement) => {
      if (!grouped[achievement.source]) {
        grouped[achievement.source] = [];
      }
      grouped[achievement.source].push(achievement);
    });

    return grouped;
  }

  /**
   * Filter achievements by date range
   */
  filterByDateRange(
    achievements: Achievement[],
    startDate: Date,
    endDate: Date,
  ): Achievement[] {
    return achievements.filter(
      (achievement) =>
        achievement.date >= startDate && achievement.date <= endDate,
    );
  }

  /**
   * Filter achievements by type
   */
  filterByType(
    achievements: Achievement[],
    type: Achievement["type"],
  ): Achievement[] {
    return achievements.filter((achievement) => achievement.type === type);
  }

  /**
   * Filter achievements by platform
   */
  filterByPlatform(
    achievements: Achievement[],
    platform: Platform,
  ): Achievement[] {
    return achievements.filter(
      (achievement) => achievement.source === platform,
    );
  }

  /**
   * Get achievement statistics
   */
  getStatistics(achievements: Achievement[]): {
    total: number;
    byType: Record<string, number>;
    byPlatform: Record<string, number>;
    recent: number; // Last 30 days
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const byType = this.groupByType(achievements);
    const byPlatform = this.groupByPlatform(achievements);

    return {
      total: achievements.length,
      byType: Object.fromEntries(
        Object.entries(byType).map(([type, items]) => [type, items.length]),
      ),
      byPlatform: Object.fromEntries(
        Object.entries(byPlatform).map(([platform, items]) => [
          platform,
          items.length,
        ]),
      ),
      recent: achievements.filter((a) => a.date >= thirtyDaysAgo).length,
    };
  }

  /**
   * Add manual achievement
   */
  addManualAchievement(
    existingAchievements: Achievement[],
    achievement: Omit<Achievement, "id" | "source">,
  ): Achievement[] {
    const newAchievement: Achievement = {
      ...achievement,
      id: `manual-${Date.now()}`,
      source: "portfolio" as Platform,
    };

    return [...existingAchievements, newAchievement];
  }

  /**
   * Remove achievement
   */
  removeAchievement(
    existingAchievements: Achievement[],
    achievementId: string,
  ): Achievement[] {
    return existingAchievements.filter((a) => a.id !== achievementId);
  }

  /**
   * Hide achievement
   */
  hideAchievement(
    existingAchievements: Achievement[],
    achievementId: string,
  ): Achievement[] {
    return existingAchievements.map((a) =>
      a.id === achievementId ? { ...a, isHidden: true } : a,
    );
  }

  /**
   * Show achievement
   */
  showAchievement(
    existingAchievements: Achievement[],
    achievementId: string,
  ): Achievement[] {
    return existingAchievements.map((a) =>
      a.id === achievementId ? { ...a, isHidden: false } : a,
    );
  }

  /**
   * Detect duplicate achievements
   */
  detectDuplicates(achievements: Achievement[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    achievements.forEach((achievement) => {
      const key = `${achievement.title}-${achievement.source}`;
      if (seen.has(key)) {
        duplicates.push(achievement.id);
      } else {
        seen.add(key);
      }
    });

    return duplicates;
  }

  /**
   * Remove duplicate achievements
   */
  removeDuplicates(achievements: Achievement[]): Achievement[] {
    const seen = new Set<string>();
    const unique: Achievement[] = [];

    achievements.forEach((achievement) => {
      const key = `${achievement.title}-${achievement.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(achievement);
      }
    });

    return unique;
  }

  /**
   * Get achievement level based on count
   */
  getAchievementLevel(count: number): string {
    if (count >= 50) return "Legendary";
    if (count >= 30) return "Elite";
    if (count >= 20) return "Expert";
    if (count >= 10) return "Advanced";
    if (count >= 5) return "Intermediate";
    return "Beginner";
  }

  /**
   * Get next achievement milestone
   */
  getNextMilestone(currentCount: number): number {
    const milestones = [5, 10, 20, 30, 50, 100, 200, 500];
    for (const milestone of milestones) {
      if (currentCount < milestone) {
        return milestone;
      }
    }
    return currentCount + 100;
  }

  /**
   * Calculate progress to next milestone
   */
  calculateProgress(currentCount: number, targetMilestone: number): number {
    return Math.round((currentCount / targetMilestone) * 100);
  }
}

export const achievementAggregator = new AchievementAggregator();
