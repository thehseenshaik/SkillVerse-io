export type StoryType =
  | "progress"
  | "achievement"
  | "project"
  | "career"
  | "journey"
  | "opportunity";

export type PosterTemplateId =
  | "minimal"
  | "developer"
  | "progress"
  | "achievement"
  | "dark";

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  subtext?: string;
  category: "dsa" | "github" | "projects" | "profile" | "streak";
}

export interface Achievement {
  id: string;
  type: StoryType;
  title: string;
  subtitle: string;
  value: number | string;
  unit: string;
  iconName: string;
  priority: number; // 1 - 100
  shareable: boolean;
  tagline: string;
  recommendedTemplate: PosterTemplateId;
  defaultStats: string[];
}

export interface UserRealData {
  name: string;
  headline: string;
  role?: string;
  location?: string;
  username?: string;
  skills: string[];
  projectsCount: number;
  liveProjectsCount: number;
  recentProjectName?: string;
  solvedDsaCount: number;
  leetcodeSolved: number;
  gfgSolved: number;
  codingStreak: number;
  githubRepos: number;
  githubStars: number;
  githubFollowers: number;
  githubLanguages: string[];
  careerScore: number;
  profileCompletion: number;
  hasAptitudeHistory: boolean;
}

export interface ShareHistoryEntry {
  id: string;
  achievementId?: string;
  storyType: StoryType;
  storyTitle: string;
  templateId: PosterTemplateId;
  selectedStatIds: string[];
  caption: string;
  platform: "linkedin" | "download" | "clipboard";
  status: "Draft" | "Generated" | "Downloaded" | "Published" | "Failed";
  createdAt: string;
  publishedAt?: string;
  platformPostId?: string;
}

// Configurable milestone thresholds
const DSA_MILESTONES = [500, 250, 100, 50, 25, 10, 2];
const STREAK_MILESTONES = [100, 60, 30, 14, 7];
const REPO_MILESTONES = [20, 10, 5, 3];
const PROJECT_MILESTONES = [5, 3, 2, 1];

/**
 * Evaluates real user data against thresholds to find all eligible achievements
 * and identify the strongest single recommendation (with duplicate share protection).
 */
export function analyzeAchievements(
  data: UserRealData,
  history: ShareHistoryEntry[] = []
): {
  bestAchievement: Achievement;
  allAchievements: Achievement[];
  isBeginner: boolean;
  availableStats: StatItem[];
} {
  const achievements: Achievement[] = [];
  const sharedIds = new Set(
    history
      .filter((h) => h.status === "Published" || h.status === "Downloaded")
      .map((h) => h.achievementId)
      .filter(Boolean)
  );

  const totalDsa = data.solvedDsaCount + data.leetcodeSolved + data.gfgSolved;

  // 1. Check DSA Milestones
  for (const m of DSA_MILESTONES) {
    if (totalDsa >= m) {
      achievements.push({
        id: `dsa_milestone_${m}`,
        type: "achievement",
        title: `${m}+ Problems Solved`,
        subtitle: `Crossed ${totalDsa} verified coding problems across DSA tracks`,
        value: totalDsa,
        unit: "problems",
        iconName: "Code2",
        priority: 60 + Math.min(35, m / 10),
        shareable: true,
        tagline: "Building problem solving mastery one algorithm at a time.",
        recommendedTemplate: "achievement",
        defaultStats: ["dsa_solved", "coding_streak", "github_repos"],
      });
      break; // Only highest reached
    }
  }

  // 2. Check Streak Milestones
  for (const s of STREAK_MILESTONES) {
    if (data.codingStreak >= s) {
      achievements.push({
        id: `streak_milestone_${s}`,
        type: "progress",
        title: `${data.codingStreak} Day Coding Streak`,
        subtitle: "Showing up consistently every single day",
        value: data.codingStreak,
        unit: "days",
        iconName: "Flame",
        priority: 65 + Math.min(30, s / 3),
        shareable: true,
        tagline: "Consistency outperforms motivation. Still coding every day.",
        recommendedTemplate: "progress",
        defaultStats: ["coding_streak", "dsa_solved", "github_repos"],
      });
      break;
    }
  }

  // 3. Check GitHub Repositories
  for (const r of REPO_MILESTONES) {
    if (data.githubRepos >= r) {
      achievements.push({
        id: `github_repos_${r}`,
        type: "project",
        title: `${data.githubRepos} GitHub Repositories`,
        subtitle: "Open-source projects and codebases built & shipped",
        value: data.githubRepos,
        unit: "repositories",
        iconName: "FaGithub",
        priority: 55 + Math.min(25, r * 2),
        shareable: true,
        tagline: "Transforming ideas into tested, production-ready code.",
        recommendedTemplate: "developer",
        defaultStats: ["github_repos", "github_stars", "dsa_solved"],
      });
      break;
    }
  }

  // 4. Check Projects in Profile
  for (const p of PROJECT_MILESTONES) {
    if (data.projectsCount >= p) {
      const recentName = data.recentProjectName ? ` ("${data.recentProjectName}")` : "";
      achievements.push({
        id: `projects_built_${p}`,
        type: "project",
        title: `${data.projectsCount} Projects Built`,
        subtitle: `Engineered portfolio projects${recentName}`,
        value: data.projectsCount,
        unit: "projects",
        iconName: "Layers",
        priority: 50 + p * 8,
        shareable: true,
        tagline: "Building full-stack products with modern architecture.",
        recommendedTemplate: "minimal",
        defaultStats: ["projects_count", "skills_count", "career_score"],
      });
      break;
    }
  }

  // 5. Career Score / Profile Readiness
  if (data.profileCompletion >= 85) {
    achievements.push({
      id: "career_ready_85",
      type: "career",
      title: "Career & ATS Ready",
      subtitle: `${data.profileCompletion}% profile readiness with verified developer skills`,
      value: `${data.profileCompletion}%`,
      unit: "readiness",
      iconName: "Trophy",
      priority: 58,
      shareable: true,
      tagline: "Prepared for top engineering roles and opportunities.",
      recommendedTemplate: "minimal",
      defaultStats: ["profile_completion", "career_score", "skills_count"],
    });
  }

  // 6. Multi-Platform Progress Milestone
  if (data.githubRepos >= 1 && totalDsa >= 5) {
    achievements.push({
      id: "all_round_dev",
      type: "progress",
      title: "Active Developer Progress",
      subtitle: "Building software and solving algorithmic challenges simultaneously",
      value: "Full-Stack + DSA",
      unit: "journey",
      iconName: "TrendingUp",
      priority: 52,
      shareable: true,
      tagline: "Sharpening DSA while building real-world applications.",
      recommendedTemplate: "developer",
      defaultStats: ["dsa_solved", "github_repos", "coding_streak"],
    });
  }

  // Fallback for Beginner / Low-Data Users
  const isBeginner = achievements.length === 0;

  const beginnerAchievement: Achievement = {
    id: "dev_journey_start",
    type: "journey",
    title: "Starting My Developer Journey",
    subtitle: data.headline || (data.skills.length > 0 ? `Focusing on ${data.skills.slice(0, 3).join(", ")}` : "Learning, building, and growing every day"),
    value: data.skills.length > 0 ? `${data.skills.length} Skills` : "Journey",
    unit: "learning",
    iconName: "Compass",
    priority: 50,
    shareable: true,
    tagline: "Still learning. Still building. Still improving.",
    recommendedTemplate: "minimal",
    defaultStats: ["skills_count", "profile_completion", "projects_count"],
  };

  if (isBeginner) {
    achievements.push(beginnerAchievement);
  }

  // Score & Rank Achievements
  // Highest priority first, with a penalty if already shared
  const ranked = [...achievements].sort((a, b) => {
    const aSharedPenalty = sharedIds.has(a.id) ? 100 : 0;
    const bSharedPenalty = sharedIds.has(b.id) ? 100 : 0;
    const aScore = a.priority - aSharedPenalty;
    const bScore = b.priority - bSharedPenalty;
    return bScore - aScore;
  });

  const bestAchievement = ranked[0] || beginnerAchievement;

  // Build list of all genuinely available stats (no fake zeros)
  const availableStats: StatItem[] = [];

  if (totalDsa > 0) {
    availableStats.push({
      id: "dsa_solved",
      label: "Problems Solved",
      value: `${totalDsa}+`,
      subtext: "Verified DSA",
      category: "dsa",
    });
  }

  if (data.codingStreak > 0) {
    availableStats.push({
      id: "coding_streak",
      label: "Coding Streak",
      value: `${data.codingStreak} Days`,
      subtext: "Daily Active",
      category: "streak",
    });
  }

  if (data.githubRepos > 0) {
    availableStats.push({
      id: "github_repos",
      label: "GitHub Repositories",
      value: data.githubRepos,
      subtext: "Public Repos",
      category: "github",
    });
  }

  if (data.githubStars > 0) {
    availableStats.push({
      id: "github_stars",
      label: "GitHub Stars",
      value: data.githubStars,
      subtext: "Community Stars",
      category: "github",
    });
  }

  if (data.projectsCount > 0) {
    availableStats.push({
      id: "projects_count",
      label: "Projects Built",
      value: data.projectsCount,
      subtext: "Portfolio",
      category: "projects",
    });
  }

  if (data.skills.length > 0) {
    availableStats.push({
      id: "skills_count",
      label: "Core Technologies",
      value: `${data.skills.length}+`,
      subtext: data.skills.slice(0, 3).join(", "),
      category: "profile",
    });
  }

  if (data.careerScore > 0) {
    availableStats.push({
      id: "career_score",
      label: "Career Score",
      value: `${data.careerScore}/100`,
      subtext: "AI Evaluated",
      category: "profile",
    });
  }

  if (data.profileCompletion > 0) {
    availableStats.push({
      id: "profile_completion",
      label: "Profile Readiness",
      value: `${data.profileCompletion}%`,
      subtext: "ATS Optimized",
      category: "profile",
    });
  }

  // If no stats exist at all, add genuine learning indicators
  if (availableStats.length === 0) {
    availableStats.push({
      id: "learning_goal",
      label: "Career Goal",
      value: data.role || "Software Engineer",
      subtext: "In Progress",
      category: "profile",
    });
    availableStats.push({
      id: "profile_completion",
      label: "Profile Status",
      value: `${data.profileCompletion || 25}%`,
      subtext: "Active",
      category: "profile",
    });
  }

  return {
    bestAchievement,
    allAchievements: ranked,
    isBeginner,
    availableStats,
  };
}

// LocalStorage helpers for Share History
const SNAPSHOT_HISTORY_KEY = "skillverse_career_snapshots_history";

export function loadSnapshotHistory(): ShareHistoryEntry[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSnapshotHistory(entry: ShareHistoryEntry): ShareHistoryEntry[] {
  try {
    const existing = loadSnapshotHistory();
    // Prepend new entry
    const filtered = existing.filter((e) => e.id !== entry.id);
    const updated = [entry, ...filtered].slice(0, 30);
    localStorage.setItem(SNAPSHOT_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}
