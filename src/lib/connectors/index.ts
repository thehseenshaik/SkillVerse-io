/**
 * Connectors Module
 * Exports all connectors and registry
 */

export { BaseConnector, type PlatformConnector } from "./base-connector";
export {
  PLATFORM_CONFIGS,
  getPlatformConfig,
  getAllPlatforms,
  getProfessionalPlatforms,
  getCodingPlatforms,
} from "./platform-config";
export { connectorRegistry, ConnectorRegistry } from "./connector-registry";

// Export individual connectors
export { GitHubConnector } from "./github";
export { LeetCodeConnector } from "./leetcode";
export { GFGConnector } from "./gfg";
export { HackerRankConnector } from "./hackerrank";
export { CodeChefConnector } from "./codechef";
export { CodeforcesConnector } from "./codeforces";
export { KaggleConnector } from "./kaggle";
export { LinkedInConnector } from "./linkedin";
export { MediumConnector } from "./medium";
export { DevToConnector } from "./devto";
export { PortfolioConnector } from "./portfolio";
