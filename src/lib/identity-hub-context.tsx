/**
 * Identity Hub Context
 * Centralized state management for Identity Hub data across the application
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type {
  UnifiedProfile,
  PlatformConnection,
  Platform,
  Skill,
  Project,
  Achievement,
  CodingStats,
  PrivacySettings,
} from "@/types/identity-hub";
import { aiDataLayer } from "./services/ai-data-layer";
import { skillsAggregator } from "./services/skills-aggregator";
import { achievementAggregator } from "./services/achievement-aggregator";
import { syncEngine } from "./services/sync-engine";
import { PrivacyManager } from "./services/privacy-manager";
import { connectorRegistry } from "./connectors";
import { toast } from "sonner";
import { useAuth } from "./auth-context";

interface IdentityHubContextType {
  // State
  profile: UnifiedProfile | null;
  connections: PlatformConnection[];
  isLoading: boolean;
  isSyncing: boolean;
  syncProgress: Record<Platform, number>;

  // Actions
  connectPlatform: (platform: Platform, credentials: any) => Promise<void>;
  disconnectPlatform: (platform: Platform) => Promise<void>;
  syncPlatform: (platform: Platform) => Promise<void>;
  syncAll: () => Promise<void>;
  updateProfile: (updates: Partial<UnifiedProfile>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  addSkill: (skill: Omit<Skill, "id">) => void;
  removeSkill: (skillId: string) => void;
  updateSkill: (skillId: string, updates: Partial<Skill>) => void;
  addProject: (project: Omit<Project, "id">) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  hideProject: (projectId: string) => void;
  pinProject: (projectId: string) => void;
  addAchievement: (achievement: Omit<Achievement, "id">) => void;
  removeAchievement: (achievementId: string) => void;
  hideAchievement: (achievementId: string) => void;
  refreshData: () => Promise<void>;
  refreshConnections: () => Promise<void>;
}

const IdentityHubContext = createContext<IdentityHubContextType | undefined>(
  undefined,
);

export function IdentityHubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UnifiedProfile | null>(null);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<Record<Platform, number>>(
    {} as Record<Platform, number>,
  );

  // Initialize with default privacy settings
  const initializeProfile = useCallback(() => {
    const defaultProfile: UnifiedProfile = {
      displayName: "",
      bio: "",
      location: "",
      website: "",
      avatar: "",
      skills: [],
      projects: [],
      achievements: [],
      codingStats: [],
      contributions: [],
      experience: [],
      education: [],
      certifications: [],
      connections: [],
      profileCompletion: 0,
      privacySettings: PrivacyManager.getDefaultSettings(),
    };
    setProfile(defaultProfile);
    aiDataLayer.setProfile(defaultProfile);
  }, []);

  // Load connections from Firestore on mount
  const loadConnections = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/user/${user.id}`);
      if (!response.ok) return;

      const userData = await response.json();
      const connectionsData = userData.connections || {};

      const ALL_PLATFORMS: Platform[] = [
        "github",
        "leetcode",
        "gfg",
        "codeforces",
        "codechef",
        "hackerrank",
      ];

      const platformConnections: PlatformConnection[] = ALL_PLATFORMS.map(
        (platform) => {
          const data = connectionsData[platform] || {};
          return {
            platform,
            status: data.connected ? "connected" : "disconnected",
            username: data.username || "",
            lastSynced: data.lastSynced ? new Date(data.lastSynced) : undefined,
            syncStatus: data.connected ? "synced" : undefined,
          };
        },
      );

      setConnections(platformConnections);
    } catch (error) {
      console.error("Failed to load connections:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Connect a platform
  const connectPlatform = useCallback(
    async (platform: Platform, credentials: any) => {
      setIsLoading(true);
      try {
        const connector = connectorRegistry.getConnector(platform);
        if (!connector) {
          throw new Error(`Connector not found for platform: ${platform}`);
        }

        // Authenticate with the platform
        const authResult = await connector.authenticate(credentials);
        if (!authResult.success) {
          throw new Error(authResult.error || "Authentication failed");
        }

        const newConnection: PlatformConnection = {
          platform,
          status: "connected",
          username: credentials.username || "demo_user",
          lastSynced: new Date(),
          syncStatus: "synced",
        };

        setConnections((prev) => {
          const filtered = prev.filter((c) => c.platform !== platform);
          return [...filtered, newConnection];
        });

        toast.success(`Successfully connected to ${platform}`);

        // Trigger sync after connection
        await syncPlatform(platform);
      } catch (error: any) {
        toast.error(`Failed to connect to ${platform}: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Disconnect a platform
  const disconnectPlatform = useCallback(
    async (platform: Platform) => {
      try {
        setConnections((prev) => [
          ...prev.filter((c) => c.platform !== platform),
          { platform, status: "disconnected" },
        ]);

        // Remove platform data from profile
        if (profile) {
          const updatedProfile = {
            ...profile,
            skills: profile.skills.filter((s) => !s.sources.includes(platform)),
            projects: profile.projects.filter((p) => p.source !== platform),
            achievements: profile.achievements.filter(
              (a) => a.source !== platform,
            ),
            codingStats: profile.codingStats.filter(
              (s) => s.platform !== platform,
            ),
          };
          setProfile(updatedProfile);
          aiDataLayer.setProfile(updatedProfile);
        }

        toast.success(`Disconnected from ${platform}`);
      } catch (error: any) {
        toast.error(`Failed to disconnect: ${error.message}`);
      }
    },
    [profile],
  );

  // Sync a single platform
  const syncPlatform = useCallback(
    async (platform: Platform) => {
      if (!user?.id) return;
      
      setIsSyncing(true);
      setSyncProgress((prev) => ({ ...prev, [platform]: 0 }));

      try {
        // Update sync status
        setConnections((prev) =>
          prev.map((c) =>
            c.platform === platform ? { ...c, syncStatus: "syncing" } : c,
          ),
        );

        setSyncProgress((prev) => ({ ...prev, [platform]: 50 }));

        // Call backend sync endpoint
        const response = await fetch(`http://localhost:3001/api/${platform}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: user.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync ${platform}`);
        }

        setSyncProgress((prev) => ({ ...prev, [platform]: 100 }));

        // Reload connections after sync
        const userResponse = await fetch(`http://localhost:3001/api/user/${user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const connectionsData = userData.connections || {};

          const platformConnections: PlatformConnection[] = Object.entries(connectionsData).map(
            ([platform, data]: [string, any]) => ({
              platform: platform as Platform,
              status: data.status || 'disconnected',
              username: data.username || '',
              lastSynced: data.lastSynced ? new Date(data.lastSynced) : undefined,
              syncStatus: data.syncStatus || 'idle',
            })
          );

          setConnections(platformConnections);
        }

        // Update connection status
        setConnections((prev) =>
          prev.map((c) =>
            c.platform === platform
              ? { ...c, lastSynced: new Date(), syncStatus: "synced" }
              : c,
          ),
        );

        toast.success(`${platform} synced successfully`);
      } catch (error: any) {
        setConnections((prev) =>
          prev.map((c) =>
            c.platform === platform
              ? { ...c, syncStatus: "failed", errorMessage: error.message }
              : c,
          ),
        );
        toast.error(`Failed to sync ${platform}: ${error.message}`);
      } finally {
        setIsSyncing(false);
        setSyncProgress((prev) => ({ ...prev, [platform]: 0 }));
      }
    },
    [user?.id, connections],
  );

  // Sync all platforms
  const syncAll = useCallback(async () => {
    const connectedPlatforms = connections.filter(
      (c) => c.status === "connected",
    );

    for (const connection of connectedPlatforms) {
      await syncPlatform(connection.platform);
    }
  }, [connections, syncPlatform]);

  // Update profile
  const updateProfile = useCallback(
    (updates: Partial<UnifiedProfile>) => {
      if (!profile) return;

      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Update privacy settings
  const updatePrivacySettings = useCallback(
    (settings: Partial<PrivacySettings>) => {
      if (!profile) return;

      const updatedSettings = { ...profile.privacySettings, ...settings };
      const updatedProfile = { ...profile, privacySettings: updatedSettings };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Add skill
  const addSkill = useCallback(
    (skill: Omit<Skill, "id">) => {
      if (!profile) return;

      const newSkill: Skill = {
        ...skill,
        id: `manual-${Date.now()}`,
        isManuallyAdded: true,
      };

      const updatedProfile = {
        ...profile,
        skills: skillsAggregator.addManualSkill(
          profile.skills,
          skill.name,
          skill.category,
          skill.proficiency,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Remove skill
  const removeSkill = useCallback(
    (skillId: string) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        skills: skillsAggregator.removeSkill(profile.skills, skillId),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Update skill
  const updateSkill = useCallback(
    (skillId: string, updates: Partial<Skill>) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        skills: profile.skills.map((s) =>
          s.id === skillId ? { ...s, ...updates } : s,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Add project
  const addProject = useCallback(
    (project: Omit<Project, "id">) => {
      if (!profile) return;

      const newProject: Project = {
        ...project,
        id: `manual-${Date.now()}`,
        isManuallyAdded: true,
      };

      const updatedProfile = {
        ...profile,
        projects: [...profile.projects, newProject],
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Remove project
  const removeProject = useCallback(
    (projectId: string) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        projects: profile.projects.filter((p) => p.id !== projectId),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Update project
  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        projects: profile.projects.map((p) =>
          p.id === projectId ? { ...p, ...updates } : p,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Hide project
  const hideProject = useCallback(
    (projectId: string) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        projects: profile.projects.map((p) =>
          p.id === projectId ? { ...p, isHidden: !p.isHidden } : p,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Pin project (reorder to top)
  const pinProject = useCallback(
    (projectId: string) => {
      if (!profile) return;

      const project = profile.projects.find((p) => p.id === projectId);
      if (!project) return;

      const otherProjects = profile.projects.filter((p) => p.id !== projectId);
      const updatedProfile = {
        ...profile,
        projects: [project, ...otherProjects],
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Add achievement
  const addAchievement = useCallback(
    (achievement: Omit<Achievement, "id">) => {
      if (!profile) return;

      const newAchievement: Achievement = {
        ...achievement,
        id: `manual-${Date.now()}`,
      };

      const updatedProfile = {
        ...profile,
        achievements: achievementAggregator.addManualAchievement(
          profile.achievements,
          newAchievement,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Remove achievement
  const removeAchievement = useCallback(
    (achievementId: string) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        achievements: achievementAggregator.removeAchievement(
          profile.achievements,
          achievementId,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Hide achievement
  const hideAchievement = useCallback(
    (achievementId: string) => {
      if (!profile) return;

      const updatedProfile = {
        ...profile,
        achievements: achievementAggregator.hideAchievement(
          profile.achievements,
          achievementId,
        ),
      };

      setProfile(updatedProfile);
      aiDataLayer.setProfile(updatedProfile);
    },
    [profile],
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await syncAll();
    } finally {
      setIsLoading(false);
    }
  }, [syncAll]);

  // Refresh connections only
  const refreshConnections = useCallback(async () => {
    await loadConnections();
  }, [loadConnections]);

  // Initialize on mount
  useState(() => {
    initializeProfile();
  });

  const value: IdentityHubContextType = {
    profile,
    connections,
    isLoading,
    isSyncing,
    syncProgress,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    syncAll,
    updateProfile,
    updatePrivacySettings,
    addSkill,
    removeSkill,
    updateSkill,
    addProject,
    removeProject,
    updateProject,
    hideProject,
    pinProject,
    addAchievement,
    removeAchievement,
    hideAchievement,
    refreshData,
    refreshConnections,
  };

  return (
    <IdentityHubContext.Provider value={value}>
      {children}
    </IdentityHubContext.Provider>
  );
}

export function useIdentityHub() {
  const context = useContext(IdentityHubContext);
  if (context === undefined) {
    throw new Error(
      "useIdentityHub must be used within an IdentityHubProvider",
    );
  }
  return context;
}
