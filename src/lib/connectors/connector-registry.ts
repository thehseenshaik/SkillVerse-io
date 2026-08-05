/**
 * Connector Registry
 * Centralized registry for all platform connectors
 */

import type { Platform } from "@/types/identity-hub";
import { GitHubConnector } from "./github";
import { LeetCodeConnector } from "./leetcode";
import { GFGConnector } from "./gfg";
import { HackerRankConnector } from "./hackerrank";
import { CodeChefConnector } from "./codechef";
import { CodeforcesConnector } from "./codeforces";
import { KaggleConnector } from "./kaggle";
import { LinkedInConnector } from "./linkedin";
import { MediumConnector } from "./medium";
import { DevToConnector } from "./devto";
import { PortfolioConnector } from "./portfolio";
import type { PlatformConnector } from "./base-connector";

export class ConnectorRegistry {
  private connectors: Partial<Record<Platform, PlatformConnector>> = {};

  constructor() {
    // Initialize all connectors
    this.connectors.github = new GitHubConnector();
    this.connectors.leetcode = new LeetCodeConnector();
    this.connectors.gfg = new GFGConnector();
    this.connectors.hackerrank = new HackerRankConnector();
    this.connectors.codechef = new CodeChefConnector();
    this.connectors.codeforces = new CodeforcesConnector();
    this.connectors.kaggle = new KaggleConnector();
    this.connectors.linkedin = new LinkedInConnector();
    this.connectors.medium = new MediumConnector();
    this.connectors.devto = new DevToConnector();
    this.connectors.portfolio = new PortfolioConnector();
  }

  /**
   * Get connector for a specific platform
   */
  getConnector(platform: Platform): PlatformConnector | undefined {
    return this.connectors[platform];
  }

  /**
   * Get all available connectors
   */
  getAllConnectors(): Partial<Record<Platform, PlatformConnector>> {
    return this.connectors;
  }

  /**
   * Check if platform is supported
   */
  isPlatformSupported(platform: Platform): boolean {
    return platform in this.connectors;
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return Object.keys(this.connectors) as Platform[];
  }
}

export const connectorRegistry = new ConnectorRegistry();
