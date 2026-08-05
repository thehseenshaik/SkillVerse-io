/**
 * Identity Hub - Normalized Data Types
 * Unified data structure for all platform integrations
 */

export type Platform =
  | "github"
  | "linkedin"
  | "leetcode"
  | "gfg"
  | "hackerrank"
  | "codechef"
  | "codeforces"
  | "kaggle"
  | "medium"
  | "devto"
  | "portfolio";

export type ConnectionStatus =
  "connected" | "disconnected" | "error" | "expired";
export type SyncStatus = "synced" | "syncing" | "failed" | "pending";

export interface PlatformConnection {
  platform: Platform;
  status: ConnectionStatus;
  username?: string;
  lastSynced?: Date;
  syncStatus?: SyncStatus;
  errorMessage?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 0-100
  sources: Platform[];
  verified?: boolean;
  isManuallyAdded?: boolean;
  isHidden?: boolean;
}

export type SkillCategory =
  | "programming_language"
  | "framework"
  | "database"
  | "cloud"
  | "ai_ml"
  | "tools"
  | "soft_skills";

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  repository?: string;
  liveDemo?: string;
  stars?: number;
  forks?: number;
  language?: string;
  source: Platform;
  createdAt?: Date;
  updatedAt?: Date;
  isHidden?: boolean;
  isManuallyAdded?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  date: Date;
  source: Platform;
  type: "badge" | "certification" | "milestone" | "medal" | "recognition";
  isHidden?: boolean;
}

export interface CodingStats {
  platform: Platform;
  username: string;
  problemsSolved?: number;
  rating?: number;
  ranking?: number;
  streak?: number;
  activeDays?: number;
  acceptanceRate?: number;
  contests?: number;
  badges?: number;
  languages?: Record<string, number>;
  difficultyBreakdown?: {
    easy: number;
    medium: number;
    hard: number;
  };
  lastUpdated?: Date;
}

export interface Contribution {
  date: Date;
  count: number;
  platform: Platform;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  technologies?: string[];
  source: Platform;
  isHidden?: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  source: Platform;
  isHidden?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
  source: Platform;
  isHidden?: boolean;
}

export interface UnifiedProfile {
  // Personal Info
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;

  // Aggregated Data
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  codingStats: CodingStats[];
  contributions: Contribution[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];

  // Metadata
  connections: PlatformConnection[];
  profileCompletion: number;
  lastSynced?: Date;
  privacySettings: PrivacySettings;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "connections_only";
  showEmail: boolean;
  showLocation: boolean;
  showProjects: boolean;
  showAchievements: boolean;
  showCodingStats: boolean;
  recruiterVisibility: boolean;
  hiddenSections: string[];
}

export interface ConnectorConfig {
  platform: Platform;
  name: string;
  icon: string;
  color: string;
  requiresAuth: boolean;
  authType: "oauth" | "token" | "username" | "api_key";
  scopes?: string[];
}

export interface ConnectorResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  partial?: boolean;
}

export interface SyncHistory {
  id: string;
  platform: Platform;
  timestamp: Date;
  status: SyncStatus;
  itemsSynced: number;
  duration: number;
  error?: string;
}

export interface AchievementTimeline {
  date: Date;
  achievements: Achievement[];
}
