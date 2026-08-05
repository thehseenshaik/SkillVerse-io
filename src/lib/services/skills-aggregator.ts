/**
 * Skills Aggregation Service
 * Extracts, normalizes, and aggregates skills from all connected platforms
 */

import type { Skill, SkillCategory, Platform } from "@/types/identity-hub";

// Common skill mapping for normalization
const SKILL_ALIASES: Record<string, string> = {
  // Programming Languages
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  python: "Python",
  py: "Python",
  java: "Java",
  "c++": "C++",
  cpp: "C++",
  c: "C",
  "c#": "C#",
  csharp: "C#",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  r: "R",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  dart: "Dart",
  julia: "Julia",
  haskell: "Haskell",
  elixir: "Elixir",
  erlang: "Erlang",
  clojure: "Clojure",
  "f#": "F#",
  lua: "Lua",
  matlab: "MATLAB",
  perl: "Perl",
  "objective-c": "Objective-C",
  cobol: "COBOL",
  fortran: "Fortran",

  // Frontend Frameworks
  react: "React",
  reactjs: "React",
  "react.js": "React",
  vue: "Vue.js",
  vuejs: "Vue.js",
  "vue.js": "Vue.js",
  angular: "Angular",
  angularjs: "Angular",
  "angular.js": "Angular",
  svelte: "Svelte",
  solid: "SolidJS",
  solidjs: "SolidJS",
  qwik: "Qwik",
  alpine: "Alpine.js",
  alpinejs: "Alpine.js",
  htmx: "HTMX",

  // Full-Stack Frameworks
  "next.js": "Next.js",
  nextjs: "Next.js",
  nuxt: "Nuxt.js",
  nuxtjs: "Nuxt.js",
  remix: "Remix",
  gatsby: "Gatsby",
  astro: "Astro",

  // Backend Frameworks
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express.js",
  expressjs: "Express.js",
  "express.js": "Express.js",
  nest: "NestJS",
  nestjs: "NestJS",
  fastify: "Fastify",
  koa: "Koa",
  hapi: "Hapi",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  tornado: "Tornado",
  spring: "Spring Boot",
  springboot: "Spring Boot",
  "spring boot": "Spring Boot",
  rails: "Ruby on Rails",
  "ruby on rails": "Ruby on Rails",
  laravel: "Laravel",
  symfony: "Symfony",
  "asp.net": "ASP.NET",
  aspnet: "ASP.NET",
  play: "Play Framework",
  "elixir phoenix": "Phoenix",
  phoenix: "Phoenix",

  // Databases
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  redis: "Redis",
  elasticsearch: "Elasticsearch",
  cassandra: "Cassandra",
  dynamodb: "DynamoDB",
  neo4j: "Neo4j",
  influxdb: "InfluxDB",
  firebase: "Firebase",
  supabase: "Supabase",
  prisma: "Prisma",
  typeorm: "TypeORM",
  sequelize: "Sequelize",
  mongoose: "Mongoose",

  // Cloud Platforms
  aws: "AWS",
  "amazon web services": "AWS",
  amazon: "AWS",
  azure: "Azure",
  "microsoft azure": "Azure",
  gcp: "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud platform": "Google Cloud",
  "ibm cloud": "IBM Cloud",
  "oracle cloud": "Oracle Cloud",
  digitalocean: "DigitalOcean",
  heroku: "Heroku",
  vercel: "Vercel",
  netlify: "Netlify",
  cloudflare: "Cloudflare",
  railway: "Railway",
  render: "Render",

  // DevOps & Infrastructure
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  terraform: "Terraform",
  ansible: "Ansible",
  chef: "Chef",
  puppet: "Puppet",
  jenkins: "Jenkins",
  circleci: "CircleCI",
  "travis ci": "Travis CI",
  travisci: "Travis CI",
  "github actions": "GitHub Actions",
  "gitlab ci": "GitLab CI",
  argocd: "ArgoCD",
  helm: "Helm",
  prometheus: "Prometheus",
  grafana: "Grafana",
  elk: "ELK Stack",
  nginx: "NGINX",
  apache: "Apache",

  // Version Control
  git: "Git",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  svn: "SVN",
  mercurial: "Mercurial",

  // Operating Systems
  linux: "Linux",
  unix: "Unix",
  bash: "Bash",
  shell: "Shell Scripting",
  powershell: "PowerShell",
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  ios: "iOS",

  // AI/ML
  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  "deep learning": "Deep Learning",
  dl: "Deep Learning",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",
  nlp: "Natural Language Processing",
  "natural language processing": "Natural Language Processing",
  "computer vision": "Computer Vision",
  "data science": "Data Science",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  keras: "Keras",
  "scikit-learn": "scikit-learn",
  sklearn: "scikit-learn",
  pandas: "Pandas",
  numpy: "NumPy",
  matplotlib: "Matplotlib",
  seaborn: "Seaborn",
  jupyter: "Jupyter",
  "jupyter notebook": "Jupyter",
  xgboost: "XGBoost",
  lightgbm: "LightGBM",
  opencv: "OpenCV",
  "hugging face": "Hugging Face",
  transformers: "Transformers",
  langchain: "LangChain",
  openai: "OpenAI",

  // Testing
  jest: "Jest",
  mocha: "Mocha",
  jasmine: "Jasmine",
  karma: "Karma",
  cypress: "Cypress",
  playwright: "Playwright",
  selenium: "Selenium",
  webdriver: "WebDriver",
  pytest: "Pytest",
  unittest: "unittest",
  rspec: "RSpec",

  // Build Tools
  webpack: "Webpack",
  vite: "Vite",
  rollup: "Rollup",
  parcel: "Parcel",
  esbuild: "esbuild",
  babel: "Babel",
  swc: "SWC",
  turbopack: "Turbopack",
  gradle: "Gradle",
  maven: "Maven",
  npm: "npm",
  yarn: "Yarn",
  pnpm: "pnpm",
  bun: "Bun",

  // Tools & Utilities
  graphql: "GraphQL",
  rest: "REST API",
  "rest api": "REST API",
  grpc: "gRPC",
  websocket: "WebSocket",
  websockets: "WebSocket",
  json: "JSON",
  xml: "XML",
  yaml: "YAML",
  markdown: "Markdown",
  regex: "Regular Expressions",
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  agile: "Agile",
  scrum: "Scrum",
  kanban: "Kanban",

  // Soft Skills
  communication: "Communication",
  leadership: "Leadership",
  teamwork: "Teamwork",
  "problem solving": "Problem Solving",
  "critical thinking": "Critical Thinking",
  "time management": "Time Management",
  adaptability: "Adaptability",
  creativity: "Creativity",
  collaboration: "Collaboration",
  mentoring: "Mentoring",
};

// Skill category mapping
const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  // Programming Languages
  javascript: "programming_language",
  typescript: "programming_language",
  python: "programming_language",
  java: "programming_language",
  "c++": "programming_language",
  c: "programming_language",
  csharp: "programming_language",
  go: "programming_language",
  rust: "programming_language",
  ruby: "programming_language",
  php: "programming_language",
  swift: "programming_language",
  kotlin: "programming_language",
  scala: "programming_language",
  r: "programming_language",
  sql: "programming_language",
  html: "programming_language",
  css: "programming_language",
  dart: "programming_language",
  julia: "programming_language",
  haskell: "programming_language",
  elixir: "programming_language",
  erlang: "programming_language",
  clojure: "programming_language",
  "f#": "programming_language",
  lua: "programming_language",
  matlab: "programming_language",
  perl: "programming_language",
  "objective-c": "programming_language",
  cobol: "programming_language",
  fortran: "programming_language",

  // Frontend Frameworks
  react: "framework",
  "vue.js": "framework",
  angular: "framework",
  svelte: "framework",
  solidjs: "framework",
  qwik: "framework",
  "alpine.js": "framework",
  htmx: "framework",

  // Full-Stack Frameworks
  "next.js": "framework",
  "nuxt.js": "framework",
  remix: "framework",
  gatsby: "framework",
  astro: "framework",

  // Backend Frameworks
  "node.js": "framework",
  "express.js": "framework",
  nestjs: "framework",
  fastify: "framework",
  koa: "framework",
  hapi: "framework",
  django: "framework",
  flask: "framework",
  fastapi: "framework",
  tornado: "framework",
  "spring boot": "framework",
  "ruby on rails": "framework",
  laravel: "framework",
  symfony: "framework",
  "asp.net": "framework",
  "play framework": "framework",
  phoenix: "framework",

  // Databases
  postgresql: "database",
  mysql: "database",
  mariadb: "database",
  sqlite: "database",
  mongodb: "database",
  redis: "database",
  elasticsearch: "database",
  cassandra: "database",
  dynamodb: "database",
  neo4j: "database",
  influxdb: "database",
  firebase: "database",
  supabase: "database",
  prisma: "database",
  typeorm: "database",
  sequelize: "database",
  mongoose: "database",

  // Cloud Platforms
  aws: "cloud",
  azure: "cloud",
  "google cloud": "cloud",
  "ibm cloud": "cloud",
  "oracle cloud": "cloud",
  digitalocean: "cloud",
  heroku: "cloud",
  vercel: "cloud",
  netlify: "cloud",
  cloudflare: "cloud",
  railway: "cloud",
  render: "cloud",

  // DevOps & Infrastructure
  docker: "tools",
  kubernetes: "tools",
  terraform: "tools",
  ansible: "tools",
  chef: "tools",
  puppet: "tools",
  jenkins: "tools",
  circleci: "tools",
  "travis ci": "tools",
  "github actions": "tools",
  "gitlab ci": "tools",
  argocd: "tools",
  helm: "tools",
  prometheus: "tools",
  grafana: "tools",
  "elk stack": "tools",
  nginx: "tools",
  apache: "tools",

  // Version Control
  git: "tools",
  github: "tools",
  gitlab: "tools",
  bitbucket: "tools",
  svn: "tools",
  mercurial: "tools",

  // Operating Systems
  linux: "tools",
  unix: "tools",
  bash: "tools",
  "shell scripting": "tools",
  powershell: "tools",
  windows: "tools",
  macos: "tools",
  android: "tools",
  ios: "tools",

  // AI/ML
  "machine learning": "ai_ml",
  "deep learning": "ai_ml",
  "artificial intelligence": "ai_ml",
  keras: "ai_ml",
  "scikit-learn": "ai_ml",
  pandas: "ai_ml",
  numpy: "ai_ml",
  matplotlib: "ai_ml",
  seaborn: "ai_ml",
  jupyter: "ai_ml",
  xgboost: "ai_ml",
  lightgbm: "ai_ml",
  opencv: "ai_ml",
  "hugging face": "ai_ml",
  transformers: "ai_ml",
  langchain: "ai_ml",
  openai: "ai_ml",

  // Testing
  jest: "tools",
  mocha: "tools",
  jasmine: "tools",
  karma: "tools",
  cypress: "tools",
  playwright: "tools",
  selenium: "tools",
  webdriver: "tools",
  pytest: "tools",
  unittest: "tools",
  rspec: "tools",

  // Build Tools
  webpack: "tools",
  vite: "tools",
  rollup: "tools",
  parcel: "tools",
  esbuild: "tools",
  babel: "tools",
  swc: "tools",
  turbopack: "tools",
  gradle: "tools",
  maven: "tools",
  npm: "tools",
  yarn: "tools",
  pnpm: "tools",
  bun: "tools",

  // Tools & Utilities
  graphql: "tools",
  "rest api": "tools",
  grpc: "tools",
  websocket: "tools",
  json: "tools",
  xml: "tools",
  yaml: "tools",
  markdown: "tools",
  "regular expressions": "tools",
  "ci/cd": "tools",
  agile: "soft_skills",
  scrum: "soft_skills",
  kanban: "soft_skills",

  // Soft Skills
  communication: "soft_skills",
  leadership: "soft_skills",
  teamwork: "soft_skills",
  "problem solving": "soft_skills",
  "critical thinking": "soft_skills",
  "time management": "soft_skills",
  adaptability: "soft_skills",
  creativity: "soft_skills",
  collaboration: "soft_skills",
  mentoring: "soft_skills",
};

export class SkillsAggregator {
  /**
   * Normalize skill name to standard format
   */
  private normalizeSkillName(name: string): string {
    const lowerName = name.toLowerCase().trim();
    return SKILL_ALIASES[lowerName] || name;
  }

  /**
   * Determine skill category based on name
   */
  private determineSkillCategory(name: string): SkillCategory {
    const lowerName = name.toLowerCase();
    return SKILL_CATEGORIES[lowerName] || "tools";
  }

  /**
   * Aggregate skills from multiple platforms
   */
  aggregateSkills(skillsByPlatform: Record<Platform, Skill[]>): Skill[] {
    const skillMap = new Map<string, Skill>();

    Object.entries(skillsByPlatform).forEach(([platform, skills]) => {
      skills.forEach((skill) => {
        const normalizedName = this.normalizeSkillName(skill.name);
        const existingSkill = skillMap.get(normalizedName);

        if (existingSkill) {
          // Merge with existing skill
          const mergedSources = [
            ...new Set([...existingSkill.sources, ...skill.sources]),
          ];
          const avgProficiency = Math.round(
            (existingSkill.proficiency + skill.proficiency) / 2,
          );

          skillMap.set(normalizedName, {
            ...existingSkill,
            sources: mergedSources,
            proficiency: avgProficiency,
            verified: existingSkill.verified || skill.verified,
          });
        } else {
          // Add new skill
          const category =
            skill.category || this.determineSkillCategory(normalizedName);
          skillMap.set(normalizedName, {
            ...skill,
            id: `skill-${normalizedName.toLowerCase().replace(/\s+/g, "-")}`,
            name: normalizedName,
            category,
          });
        }
      });
    });

    return Array.from(skillMap.values()).sort((a, b) => {
      // Sort by category, then by proficiency
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return b.proficiency - a.proficiency;
    });
  }

  /**
   * Group skills by category
   */
  groupSkillsByCategory(skills: Skill[]): Record<SkillCategory, Skill[]> {
    const grouped: Record<SkillCategory, Skill[]> = {
      programming_language: [],
      framework: [],
      database: [],
      cloud: [],
      ai_ml: [],
      tools: [],
      soft_skills: [],
    };

    skills.forEach((skill) => {
      if (grouped[skill.category]) {
        grouped[skill.category].push(skill);
      }
    });

    return grouped;
  }

  /**
   * Calculate skill proficiency based on platform data
   */
  calculateProficiency(
    skillName: string,
    platformData: any,
    platform: Platform,
  ): number {
    // Base proficiency from platform-specific heuristics
    let baseProficiency = 50;

    // GitHub: based on repository count and language frequency
    if (platform === "github" && platformData.languages) {
      const langCount = (platformData.languages[skillName] as number) || 0;
      const totalLangs = Object.values(platformData.languages).reduce(
        (sum: number, val: unknown) => sum + (val as number),
        0,
      );
      if (totalLangs > 0) {
        baseProficiency = Math.round((langCount / totalLangs) * 100);
      }
    }

    // LeetCode: based on problem count in that language
    if (platform === "leetcode" && platformData.languageStats) {
      const langStat = platformData.languageStats[skillName];
      if (langStat) {
        baseProficiency = Math.min(
          100,
          Math.round(langStat.problemsSolved / 10),
        );
      }
    }

    return Math.min(100, Math.max(20, baseProficiency));
  }

  /**
   * Extract skills from raw platform data
   */
  extractSkillsFromPlatform(
    platform: Platform,
    rawData: Record<string, unknown>,
  ): Skill[] {
    const skills: Skill[] = [];

    switch (platform) {
      case "github":
        // Extract from repository languages
        if (rawData.languages) {
          Object.keys(rawData.languages).forEach((lang) => {
            skills.push({
              id: `github-${lang.toLowerCase()}`,
              name: this.normalizeSkillName(lang),
              category: this.determineSkillCategory(lang),
              proficiency: this.calculateProficiency(lang, rawData, platform),
              sources: [platform],
              verified: true,
            });
          });
        }
        break;

      case "leetcode":
        // Extract from skill tags
        if (rawData.skillTags && Array.isArray(rawData.skillTags)) {
          rawData.skillTags.forEach((tag: string) => {
            skills.push({
              id: `leetcode-${tag.toLowerCase().replace(/\s+/g, "-")}`,
              name: this.normalizeSkillName(tag),
              category: this.determineSkillCategory(tag),
              proficiency: 70,
              sources: [platform],
              verified: true,
            });
          });
        }
        break;

      // Add more platform-specific extraction logic here
      default:
        break;
    }

    return skills;
  }

  /**
   * Add manual skill
   */
  addManualSkill(
    existingSkills: Skill[],
    name: string,
    category: SkillCategory,
    proficiency: number,
  ): Skill[] {
    const normalizedName = this.normalizeSkillName(name);
    const existing = existingSkills.find((s) => s.name === normalizedName);

    if (existing) {
      return existingSkills.map((s) =>
        s.name === normalizedName
          ? { ...s, proficiency, isManuallyAdded: true }
          : s,
      );
    }

    return [
      ...existingSkills,
      {
        id: `manual-${normalizedName.toLowerCase().replace(/\s+/g, "-")}`,
        name: normalizedName,
        category,
        proficiency,
        sources: [],
        verified: false,
        isManuallyAdded: true,
      },
    ];
  }

  /**
   * Remove skill
   */
  removeSkill(existingSkills: Skill[], skillId: string): Skill[] {
    return existingSkills.filter((s) => s.id !== skillId);
  }

  /**
   * Update skill proficiency
   */
  updateSkillProficiency(
    existingSkills: Skill[],
    skillId: string,
    newProficiency: number,
  ): Skill[] {
    return existingSkills.map((s) =>
      s.id === skillId
        ? { ...s, proficiency: Math.min(100, Math.max(0, newProficiency)) }
        : s,
    );
  }
}

export const skillsAggregator = new SkillsAggregator();
