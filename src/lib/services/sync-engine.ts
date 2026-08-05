/**
 * Sync Engine
 * Handles synchronization of data from connected platforms
 */

import type {
  Platform,
  PlatformConnection,
  SyncStatus,
  SyncHistory,
  UnifiedProfile,
} from "@/types/identity-hub";

export interface SyncOptions {
  forceFullSync?: boolean;
  platforms?: Platform[];
  onProgress?: (platform: Platform, progress: number) => void;
  onComplete?: (results: SyncResult[]) => void;
}

export interface SyncResult {
  platform: Platform;
  status: SyncStatus;
  itemsSynced: number;
  duration: number;
  error?: string;
  timestamp: Date;
}

export class SyncEngine {
  private syncHistory: SyncHistory[] = [];
  private isSyncing = false;
  private syncQueue: Platform[] = [];

  /**
   * Start synchronization for connected platforms
   */
  async sync(
    connections: PlatformConnection[],
    options: SyncOptions = {},
  ): Promise<SyncResult[]> {
    if (this.isSyncing) {
      throw new Error("Sync already in progress");
    }

    this.isSyncing = true;
    const results: SyncResult[] = [];

    try {
      const platformsToSync = options.platforms
        ? options.platforms
        : connections
            .filter((c) => c.status === "connected")
            .map((c) => c.platform);

      for (const platform of platformsToSync) {
        const result = await this.syncPlatform(platform, options);
        results.push(result);
        options.onProgress?.(platform, 100);
      }

      options.onComplete?.(results);
      return results;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single platform
   */
  private async syncPlatform(
    platform: Platform,
    options: SyncOptions,
  ): Promise<SyncResult> {
    const startTime = Date.now();
    let status: SyncStatus = "syncing";
    let itemsSynced = 0;
    let error: string | undefined;

    try {
      // Simulate sync process (replace with actual connector calls)
      await this.simulateSync(platform, (progress) => {
        options.onProgress?.(platform, progress);
      });

      status = "synced";
      itemsSynced = Math.floor(Math.random() * 50) + 10; // Simulated count
    } catch (err: unknown) {
      status = "failed";
      error = err instanceof Error ? err.message : "Unknown error";
    }

    const duration = Date.now() - startTime;

    const result: SyncResult = {
      platform,
      status,
      itemsSynced,
      duration,
      error,
      timestamp: new Date(),
    };

    // Record sync history
    this.recordSyncHistory(result);

    return result;
  }

  /**
   * Simulate sync process (replace with actual implementation)
   */
  private async simulateSync(
    platform: Platform,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      onProgress(((i + 1) / steps) * 100);
    }
  }

  /**
   * Record sync history
   */
  private recordSyncHistory(result: SyncResult): void {
    const historyItem: SyncHistory = {
      id: `sync-${Date.now()}-${result.platform}`,
      platform: result.platform,
      timestamp: result.timestamp,
      status: result.status,
      itemsSynced: result.itemsSynced,
      duration: result.duration,
      error: result.error,
    };

    this.syncHistory.unshift(historyItem);

    // Keep only last 100 sync records
    if (this.syncHistory.length > 100) {
      this.syncHistory = this.syncHistory.slice(0, 100);
    }
  }

  /**
   * Get sync history for a platform
   */
  getSyncHistory(platform?: Platform): SyncHistory[] {
    if (platform) {
      return this.syncHistory.filter((h) => h.platform === platform);
    }
    return this.syncHistory;
  }

  /**
   * Get last sync time for a platform
   */
  getLastSyncTime(platform: Platform): Date | undefined {
    const lastSync = this.syncHistory.find(
      (h) => h.platform === platform && h.status === "synced",
    );
    return lastSync?.timestamp;
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Cancel current sync
   */
  cancelSync(): void {
    this.isSyncing = false;
  }

  /**
   * Perform incremental sync (only sync changed data)
   */
  async incrementalSync(
    connections: PlatformConnection[],
  ): Promise<SyncResult[]> {
    return this.sync(connections, { forceFullSync: false });
  }

  /**
   * Perform full sync (sync all data)
   */
  async fullSync(connections: PlatformConnection[]): Promise<SyncResult[]> {
    return this.sync(connections, { forceFullSync: true });
  }

  /**
   * Detect conflicts between local and remote data
   */
  detectConflicts(
    localData: UnifiedProfile,
    remoteData: UnifiedProfile,
  ): string[] {
    const conflicts: string[] = [];

    // Check for skill conflicts
    localData.skills.forEach((localSkill) => {
      const remoteSkill = remoteData.skills.find((s) => s.id === localSkill.id);
      if (remoteSkill && remoteSkill.proficiency !== localSkill.proficiency) {
        conflicts.push(`Skill ${localSkill.name} proficiency mismatch`);
      }
    });

    // Check for project conflicts
    localData.projects.forEach((localProject) => {
      const remoteProject = remoteData.projects.find(
        (p) => p.id === localProject.id,
      );
      if (
        remoteProject &&
        remoteProject.description !== localProject.description
      ) {
        conflicts.push(`Project ${localProject.name} description mismatch`);
      }
    });

    return conflicts;
  }

  /**
   * Resolve conflicts by choosing data source
   */
  resolveConflicts(
    localData: UnifiedProfile,
    remoteData: UnifiedProfile,
    preferLocal: boolean,
  ): UnifiedProfile {
    if (preferLocal) {
      return localData;
    }
    return remoteData;
  }

  /**
   * Check for duplicate data
   */
  detectDuplicates(data: UnifiedProfile): {
    duplicateSkills: string[];
    duplicateProjects: string[];
  } {
    const skillNames = data.skills.map((s) => s.name.toLowerCase());
    const projectNames = data.projects.map((p) => p.name.toLowerCase());

    const duplicateSkills = skillNames.filter(
      (name, index) => skillNames.indexOf(name) !== index,
    );
    const duplicateProjects = projectNames.filter(
      (name, index) => projectNames.indexOf(name) !== index,
    );

    return {
      duplicateSkills: [...new Set(duplicateSkills)],
      duplicateProjects: [...new Set(duplicateProjects)],
    };
  }

  /**
   * Remove duplicates from data
   */
  removeDuplicates(data: UnifiedProfile): UnifiedProfile {
    const skillMap = new Map<string, (typeof data.skills)[0]>();
    data.skills.forEach((skill) => {
      skillMap.set(skill.name.toLowerCase(), skill);
    });

    const projectMap = new Map<string, (typeof data.projects)[0]>();
    data.projects.forEach((project) => {
      projectMap.set(project.name.toLowerCase(), project);
    });

    return {
      ...data,
      skills: Array.from(skillMap.values()),
      projects: Array.from(projectMap.values()),
    };
  }
}

export const syncEngine = new SyncEngine();
