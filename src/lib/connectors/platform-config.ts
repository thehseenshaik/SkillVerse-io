/**
 * Platform Configuration Registry
 * Centralized configuration for all supported platforms
 */

import type { ConnectorConfig, Platform } from "@/types/identity-hub";

export const PLATFORM_CONFIGS: Record<Platform, ConnectorConfig> = {
  github: {
    platform: "github",
    name: "GitHub",
    icon: "github",
    color: "#24292e",
    requiresAuth: true,
    authType: "token",
    scopes: ["read:user", "repo", "read:org"],
  },
  linkedin: {
    platform: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    color: "#0077b5",
    requiresAuth: true,
    authType: "oauth",
    scopes: ["r_liteprofile", "r_emailaddress"],
  },
  leetcode: {
    platform: "leetcode",
    name: "LeetCode",
    icon: "code",
    color: "#ffa116",
    requiresAuth: false,
    authType: "username",
  },
  gfg: {
    platform: "gfg",
    name: "GeeksforGeeks",
    icon: "code",
    color: "#2f8d46",
    requiresAuth: false,
    authType: "username",
  },
  hackerrank: {
    platform: "hackerrank",
    name: "HackerRank",
    icon: "trophy",
    color: "#00ea64",
    requiresAuth: false,
    authType: "username",
  },
  codechef: {
    platform: "codechef",
    name: "CodeChef",
    icon: "code",
    color: "#5b4632",
    requiresAuth: false,
    authType: "username",
  },
  codeforces: {
    platform: "codeforces",
    name: "Codeforces",
    icon: "trophy",
    color: "#b01e28",
    requiresAuth: false,
    authType: "username",
  },
  kaggle: {
    platform: "kaggle",
    name: "Kaggle",
    icon: "brain",
    color: "#20beff",
    requiresAuth: true,
    authType: "api_key",
  },
  medium: {
    platform: "medium",
    name: "Medium",
    icon: "file-text",
    color: "#000000",
    requiresAuth: false,
    authType: "username",
  },
  devto: {
    platform: "devto",
    name: "Dev.to",
    icon: "file-text",
    color: "#0a0a0a",
    requiresAuth: false,
    authType: "username",
  },
  portfolio: {
    platform: "portfolio",
    name: "Personal Portfolio",
    icon: "globe",
    color: "#6366f1",
    requiresAuth: false,
    authType: "username",
  },
};

export function getPlatformConfig(platform: Platform): ConnectorConfig {
  return PLATFORM_CONFIGS[platform];
}

export function getAllPlatforms(): Platform[] {
  return Object.keys(PLATFORM_CONFIGS) as Platform[];
}

export function getProfessionalPlatforms(): Platform[] {
  return ["github", "linkedin", "medium", "devto", "portfolio"];
}

export function getCodingPlatforms(): Platform[] {
  return ["leetcode", "gfg", "hackerrank", "codechef", "codeforces", "kaggle"];
}
