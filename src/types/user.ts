/**
 * Comprehensive User Type Definitions for SkillVerse
 * This file defines all user-related types for the entire platform
 */

// ============================================================================
// CORE USER TYPES
// ============================================================================

export type UserRole = "user" | "admin" | "moderator";

export type AuthProvider = "email" | "google" | "github" | "linkedin" | "apple";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: number;
  lastLoginAt: number;
}

// ============================================================================
// BASIC INFORMATION
// ============================================================================

export interface UserBasicInfo {
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  country: string;
  timezone: string;
  language: string;
}

// ============================================================================
// PROFILE INFORMATION
// ============================================================================

export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  country: string;
  timezone: string;
  language: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  location?: string;
  website?: string;
}

// ============================================================================
// EDUCATION & CAREER
// ============================================================================

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location?: string;
  description?: string;
  skills: string[];
}

export interface CareerGoal {
  targetCompanies: string[];
  preferredDomains: string[];
  interests: string[];
  currentRole: string;
  careerObjective?: string;
  targetRoles: string[];
}

// ============================================================================
// ONBOARDING DATA
// ============================================================================

export interface OnboardingData {
  completed: boolean;
  completedAt?: number;
  steps: {
    profilePhoto: boolean;
    education: boolean;
    career: boolean;
    interests: boolean;
    preferences: boolean;
  };
  profilePhoto?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: string;
  currentRole?: string;
  careerGoal?: string;
  interests: string[];
  preferredDomains: string[];
  preferredCompanies: string[];
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    security: boolean;
    updates: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "connections";
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  accessibility: {
    fontSize: "small" | "medium" | "large";
    reducedMotion: boolean;
    highContrast: boolean;
  };
  language: string;
  timezone: string;
}

// ============================================================================
// CONNECTED PLATFORMS
// ============================================================================

export interface ConnectedPlatform {
  platform: "github" | "linkedin" | "leetcode" | "twitter" | "portfolio";
  connected: boolean;
  username?: string;
  profileUrl?: string;
  connectedAt?: number;
  lastSynced?: number;
  data?: Record<string, any>;
}

export interface ConnectedPlatforms {
  github?: ConnectedPlatform;
  linkedin?: ConnectedPlatform;
  leetcode?: ConnectedPlatform;
  twitter?: ConnectedPlatform;
  portfolio?: ConnectedPlatform;
}

// ============================================================================
// AI DATA (Future)
// ============================================================================

export interface AIData {
  careerTwin?: {
    enabled: boolean;
    personality?: string;
    careerPath?: string;
    lastUpdated?: number;
  };
  resumeAnalysis?: {
    lastAnalyzed?: number;
    score?: number;
    suggestions?: string[];
  };
  interviewPrep?: {
    lastSession?: number;
    sessionsCompleted?: number;
    averageScore?: number;
  };
}

// ============================================================================
// RESUME DATA
// ============================================================================

export interface ResumeData {
  templates: string[];
  lastGenerated?: number;
  publicUrl?: string;
  downloads: number;
  versions: ResumeVersion[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  template: string;
  createdAt: number;
  url: string;
}

// ============================================================================
// PORTFOLIO DATA
// ============================================================================

export interface PortfolioData {
  enabled: boolean;
  publicUrl?: string;
  theme: string;
  customDomain?: string;
  projects: PortfolioProject[];
  lastPublished?: number;
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  featured: boolean;
}

// ============================================================================
// COMMUNITY DATA
// ============================================================================

export interface CommunityData {
  posts: number;
  comments: number;
  likes: number;
  followers: number;
  following: number;
  reputation: number;
  badges: CommunityBadge[];
  joinedAt?: number;
}

export interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
}

// ============================================================================
// METADATA
// ============================================================================

export interface UserMetadata {
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
  lastActiveAt: number;
  emailVerified: boolean;
  emailVerifiedAt?: number;
  onboardingCompleted: boolean;
  accountStatus: "active" | "suspended" | "deleted";
  subscription?: {
    plan: "free" | "pro" | "enterprise";
    startDate: number;
    endDate?: number;
    cancelAtPeriodEnd: boolean;
  };
  referrer?: string;
  referralCode?: string;
  referralCount: number;
}

// ============================================================================
// COMPLETE USER DOCUMENT
// ============================================================================

export interface UserDocument {
  // Basic Information
  basicInfo: UserBasicInfo;

  // Authentication Information
  authInfo: {
    email: string;
    emailVerified: boolean;
    provider: AuthProvider;
    providers: AuthProvider[];
    lastPasswordChange?: number;
  };

  // Profile Information
  profile: UserProfile;

  // Settings
  settings: UserSettings;

  // Privacy
  privacy: {
    profileVisibility: "public" | "private" | "connections";
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    dataSharing: boolean;
  };

  // Connected Platforms
  connectedPlatforms: ConnectedPlatforms;

  // AI Data (Future - empty initially)
  aiData: AIData;

  // Resume Data (Future - empty initially)
  resumeData: ResumeData;

  // Portfolio Data (Future - empty initially)
  portfolioData: PortfolioData;

  // Community Data (Future - empty initially)
  communityData: CommunityData;

  // Metadata
  metadata: UserMetadata;

  // Role
  role: UserRole;
}

// ============================================================================
// SIGN UP FORM DATA
// ============================================================================

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

// ============================================================================
// LOGIN FORM DATA
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// SESSION DATA
// ============================================================================

export interface SessionData {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    ipAddress?: string;
  };
  createdAt: number;
  lastActiveAt: number;
}
