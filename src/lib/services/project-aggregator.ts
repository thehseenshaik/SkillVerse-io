/**
 * Project Aggregator Service
 * Intelligently merges and deduplicates projects from multiple platforms
 */

import type { Project, Platform } from "@/types/identity-hub";

export interface ProjectMergeStrategy {
  // How to handle duplicate projects
  mergeStrategy: "keep_all" | "merge_by_name" | "merge_by_url" | "smart_merge";
  // Which platform to prefer when merging
  platformPriority: Platform[];
  // Whether to preserve manual edits
  preserveManualEdits: boolean;
}

export class ProjectAggregator {
  /**
   * Aggregate projects from multiple platforms with intelligent merging
   */
  aggregateProjects(
    projectsByPlatform: Record<Platform, Project[]>,
    strategy: ProjectMergeStrategy = this.getDefaultStrategy(),
  ): Project[] {
    const allProjects: Project[] = [];

    Object.values(projectsByPlatform).forEach((projects) => {
      allProjects.push(...projects);
    });

    // Apply merging strategy
    switch (strategy.mergeStrategy) {
      case "keep_all":
        return this.sortProjects(allProjects);
      case "merge_by_name":
        return this.mergeByName(allProjects, strategy);
      case "merge_by_url":
        return this.mergeByUrl(allProjects, strategy);
      case "smart_merge":
        return this.smartMerge(allProjects, strategy);
      default:
        return this.sortProjects(allProjects);
    }
  }

  /**
   * Get default merge strategy
   */
  private getDefaultStrategy(): ProjectMergeStrategy {
    return {
      mergeStrategy: "smart_merge",
      platformPriority: ["github", "portfolio", "leetcode", "devto", "medium"],
      preserveManualEdits: true,
    };
  }

  /**
   * Merge projects by name similarity
   */
  private mergeByName(
    projects: Project[],
    strategy: ProjectMergeStrategy,
  ): Project[] {
    const merged = new Map<string, Project>();

    projects.forEach((project) => {
      const normalizedName = this.normalizeProjectName(project.name);
      const existing = merged.get(normalizedName);

      if (!existing) {
        merged.set(normalizedName, project);
        return;
      }

      // Merge based on platform priority
      const shouldReplace = this.shouldReplaceProject(
        existing,
        project,
        strategy,
      );
      if (shouldReplace) {
        merged.set(
          normalizedName,
          this.mergeProjectData(existing, project, strategy),
        );
      }
    });

    return this.sortProjects(Array.from(merged.values()));
  }

  /**
   * Merge projects by URL similarity
   */
  private mergeByUrl(
    projects: Project[],
    strategy: ProjectMergeStrategy,
  ): Project[] {
    const merged = new Map<string, Project>();

    projects.forEach((project) => {
      if (!project.repository && !project.liveDemo) {
        // No URL to compare, add as is
        const normalizedName = this.normalizeProjectName(project.name);
        if (!merged.has(normalizedName)) {
          merged.set(normalizedName, project);
        }
        return;
      }

      const url = project.repository || project.liveDemo || "";
      const normalizedUrl = this.normalizeUrl(url);
      const existing = merged.get(normalizedUrl);

      if (!existing) {
        merged.set(normalizedUrl, project);
        return;
      }

      // Merge based on platform priority
      const shouldReplace = this.shouldReplaceProject(
        existing,
        project,
        strategy,
      );
      if (shouldReplace) {
        merged.set(
          normalizedUrl,
          this.mergeProjectData(existing, project, strategy),
        );
      }
    });

    return this.sortProjects(Array.from(merged.values()));
  }

  /**
   * Smart merge using multiple heuristics
   */
  private smartMerge(
    projects: Project[],
    strategy: ProjectMergeStrategy,
  ): Project[] {
    const merged = new Map<string, Project>();

    projects.forEach((project) => {
      // Generate multiple keys for matching
      const nameKey = this.normalizeProjectName(project.name);
      const urlKey = project.repository
        ? this.normalizeUrl(project.repository)
        : null;

      // Check for existing matches
      let existing = merged.get(nameKey);

      if (!existing && urlKey) {
        existing = merged.get(urlKey);
      }

      if (!existing) {
        // No match, add as new
        merged.set(nameKey, project);
        if (urlKey) {
          merged.set(urlKey, project);
        }
        return;
      }

      // Merge with existing
      const shouldReplace = this.shouldReplaceProject(
        existing,
        project,
        strategy,
      );
      if (shouldReplace) {
        const mergedProject = this.mergeProjectData(
          existing,
          project,
          strategy,
        );
        merged.set(nameKey, mergedProject);
        if (urlKey) {
          merged.set(urlKey, mergedProject);
        }
      }
    });

    return this.sortProjects(Array.from(merged.values()));
  }

  /**
   * Determine if new project should replace existing one
   */
  private shouldReplaceProject(
    existing: Project,
    newProject: Project,
    strategy: ProjectMergeStrategy,
  ): boolean {
    // Preserve manual edits
    if (strategy.preserveManualEdits) {
      if (existing.isManuallyAdded && !newProject.isManuallyAdded) {
        return false;
      }
      if (!existing.isManuallyAdded && newProject.isManuallyAdded) {
        return true;
      }
    }

    // Check platform priority
    const existingPriority = strategy.platformPriority.indexOf(existing.source);
    const newPriority = strategy.platformPriority.indexOf(newProject.source);

    if (existingPriority === -1 && newPriority === -1) {
      // Both platforms not in priority list, prefer more recently updated
      return newProject.updatedAt
        ? newProject.updatedAt > (existing.updatedAt || new Date(0))
        : false;
    }

    if (existingPriority === -1) return true;
    if (newPriority === -1) return false;

    return newPriority < existingPriority;
  }

  /**
   * Merge data from two projects
   */
  private mergeProjectData(
    existing: Project,
    newProject: Project,
    strategy: ProjectMergeStrategy,
  ): Project {
    const preferred = this.shouldReplaceProject(existing, newProject, strategy)
      ? newProject
      : existing;
    const other = preferred === existing ? newProject : existing;

    return {
      ...preferred,
      // Merge technologies
      technologies: this.mergeArrays(
        preferred.technologies,
        other.technologies,
      ),
      // Prefer non-empty description
      description: preferred.description || other.description,
      // Add missing URLs
      repository: preferred.repository || other.repository,
      liveDemo: preferred.liveDemo || other.liveDemo,
      // Sum stars if available
      stars: (preferred.stars || 0) + (other.stars || 0),
      // Sum forks if available
      forks: (preferred.forks || 0) + (other.forks || 0),
      // Keep manual edit flag
      isManuallyAdded: preferred.isManuallyAdded || other.isManuallyAdded,
    };
  }

  /**
   * Normalize project name for comparison
   */
  private normalizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
  }

  /**
   * Merge arrays and remove duplicates
   */
  private mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
    const merged = new Set([...arr1, ...arr2]);
    return Array.from(merged);
  }

  /**
   * Sort projects by relevance
   */
  private sortProjects(projects: Project[]): Project[] {
    return projects.sort((a, b) => {
      // Pinned projects first
      if (a.isHidden !== b.isHidden) {
        return a.isHidden ? 1 : -1;
      }

      // Manual projects first
      if (a.isManuallyAdded !== b.isManuallyAdded) {
        return a.isManuallyAdded ? -1 : 1;
      }

      // Sort by stars (descending)
      const aStars = a.stars || 0;
      const bStars = b.stars || 0;
      if (aStars !== bStars) {
        return bStars - aStars;
      }

      // Sort by updated date (descending)
      const aDate = a.updatedAt || a.createdAt || new Date(0);
      const bDate = b.updatedAt || b.createdAt || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  }

  /**
   * Filter projects by visibility
   */
  filterHiddenProjects(projects: Project[]): Project[] {
    return projects.filter((p) => !p.isHidden);
  }

  /**
   * Get project statistics
   */
  getStatistics(projects: Project[]): {
    total: number;
    byPlatform: Record<string, number>;
    totalStars: number;
    totalForks: number;
    withLiveDemo: number;
    manuallyAdded: number;
  } {
    const byPlatform: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;
    let withLiveDemo = 0;
    let manuallyAdded = 0;

    projects.forEach((project) => {
      byPlatform[project.source] = (byPlatform[project.source] || 0) + 1;
      totalStars += project.stars || 0;
      totalForks += project.forks || 0;
      if (project.liveDemo) withLiveDemo++;
      if (project.isManuallyAdded) manuallyAdded++;
    });

    return {
      total: projects.length,
      byPlatform,
      totalStars,
      totalForks,
      withLiveDemo,
      manuallyAdded,
    };
  }

  /**
   * Search projects by query
   */
  searchProjects(projects: Project[], query: string): Project[] {
    const lowerQuery = query.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(lowerQuery),
        ),
    );
  }
}

export const projectAggregator = new ProjectAggregator();
