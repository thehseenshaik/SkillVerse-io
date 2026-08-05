/**
 * Portfolio Generator Service
 * Generates portfolio websites from Identity Hub data
 */

import { aiDataLayer } from "./ai-data-layer";
import { processAIRequest } from "./ai";
import type { AIFeatureType } from "@/types/ai";

export interface PortfolioSection {
  id: string;
  title: string;
  content: any;
  visible: boolean;
  order: number;
}

export interface PortfolioTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  layout: "modern" | "minimal" | "glass" | "developer" | "corporate" | "dark" | "creative";
}

export const PORTFOLIO_THEMES: PortfolioTheme[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design",
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      background: "#ffffff",
      text: "#1f2937",
    },
    typography: {
      heading: "Inter",
      body: "Inter",
    },
    layout: "modern",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    colors: {
      primary: "#000000",
      secondary: "#666666",
      background: "#ffffff",
      text: "#000000",
    },
    typography: {
      heading: "Helvetica",
      body: "Helvetica",
    },
    layout: "minimal",
  },
  {
    id: "glass",
    name: "Glass",
    description: "Glassmorphism effects",
    colors: {
      primary: "#06b6d4",
      secondary: "#8b5cf6",
      background: "#0f172a",
      text: "#ffffff",
    },
    typography: {
      heading: "Inter",
      body: "Inter",
    },
    layout: "glass",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Code-focused design",
    colors: {
      primary: "#10b981",
      secondary: "#3b82f6",
      background: "#0d1117",
      text: "#c9d1d9",
    },
    typography: {
      heading: "JetBrains Mono",
      body: "Inter",
    },
    layout: "developer",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional and formal",
    colors: {
      primary: "#1e40af",
      secondary: "#6b7280",
      background: "#f9fafb",
      text: "#111827",
    },
    typography: {
      heading: "Georgia",
      body: "Arial",
    },
    layout: "corporate",
  },
  {
    id: "dark",
    name: "Dark Professional",
    description: "Dark theme with professional look",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      background: "#111827",
      text: "#f3f4f6",
    },
    typography: {
      heading: "Inter",
      body: "Inter",
    },
    layout: "dark",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and artistic",
    colors: {
      primary: "#f59e0b",
      secondary: "#ec4899",
      background: "#fef3c7",
      text: "#1f2937",
    },
    typography: {
      heading: "Playfair Display",
      body: "Lato",
    },
    layout: "creative",
  },
];

export class PortfolioGeneratorService {
  /**
   * Generate portfolio from Identity Hub data
   */
  generatePortfolio(userId: string, themeId: string = "modern"): PortfolioSection[] {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    const theme = PORTFOLIO_THEMES.find((t) => t.id === themeId) || PORTFOLIO_THEMES[0];

    const sections: PortfolioSection[] = [
      {
        id: "hero",
        title: "Hero",
        content: {
          name: profile.displayName || "User",
          headline: profile.bio || "Professional",
          location: profile.location,
          avatar: profile.avatar,
        },
        visible: true,
        order: 1,
      },
      {
        id: "about",
        title: "About",
        content: {
          description: profile.bio || "",
        },
        visible: !!profile.bio,
        order: 2,
      },
      {
        id: "skills",
        title: "Skills",
        content: {
          skills: profile.skills || [],
        },
        visible: profile.skills && profile.skills.length > 0,
        order: 3,
      },
      {
        id: "experience",
        title: "Experience",
        content: {
          experience: profile.experience || [],
        },
        visible: profile.experience && profile.experience.length > 0,
        order: 4,
      },
      {
        id: "projects",
        title: "Projects",
        content: {
          projects: profile.projects || [],
        },
        visible: profile.projects && profile.projects.length > 0,
        order: 5,
      },
      {
        id: "education",
        title: "Education",
        content: {
          education: profile.education || [],
        },
        visible: profile.education && profile.education.length > 0,
        order: 6,
      },
      {
        id: "achievements",
        title: "Achievements",
        content: {
          achievements: profile.achievements || [],
        },
        visible: profile.achievements && profile.achievements.length > 0,
        order: 7,
      },
      {
        id: "certifications",
        title: "Certifications",
        content: {
          certifications: profile.certifications || [],
        },
        visible: profile.certifications && profile.certifications.length > 0,
        order: 8,
      },
      {
        id: "coding-stats",
        title: "Coding Statistics",
        content: {
          codingStats: profile.codingStats || [],
        },
        visible: profile.codingStats && profile.codingStats.length > 0,
        order: 9,
      },
      {
        id: "contact",
        title: "Contact",
        content: {
          website: profile.website,
        },
        visible: true,
        order: 10,
      },
    ];

    return sections.filter((section) => section.visible);
  }

  /**
   * Get portfolio theme by ID
   */
  getTheme(themeId: string): PortfolioTheme | undefined {
    return PORTFOLIO_THEMES.find((t) => t.id === themeId);
  }

  /**
   * Get all available themes
   */
  getAllThemes(): PortfolioTheme[] {
    return PORTFOLIO_THEMES;
  }

  /**
   * Reorder portfolio sections
   */
  reorderSections(sections: PortfolioSection[], newOrder: string[]): PortfolioSection[] {
    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    return newOrder
      .map((id, index) => {
        const section = sectionMap.get(id);
        if (section) {
          return { ...section, order: index + 1 };
        }
        return null;
      })
      .filter((s): s is PortfolioSection => s !== null);
  }

  /**
   * Toggle section visibility
   */
  toggleSectionVisibility(sections: PortfolioSection[], sectionId: string): PortfolioSection[] {
    return sections.map((section) =>
      section.id === sectionId ? { ...section, visible: !section.visible } : section
    );
  }

  /**
   * Update section content
   */
  updateSectionContent(sections: PortfolioSection[], sectionId: string, content: any): PortfolioSection[] {
    return sections.map((section) =>
      section.id === sectionId ? { ...section, content } : section
    );
  }

  /**
   * Generate portfolio HTML
   */
  generatePortfolioHTML(sections: PortfolioSection[], theme: PortfolioTheme): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio - SkillVerse</title>
  <style>
    :root {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --background: ${theme.colors.background};
      --text: ${theme.colors.text};
    }
    body {
      font-family: ${theme.typography.body};
      background: var(--background);
      color: var(--text);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .hero {
      text-align: center;
      padding: 4rem 0;
    }
    .section {
      padding: 3rem 0;
    }
    .grid {
      display: grid;
      gap: 2rem;
    }
    .card {
      border: 1px solid var(--secondary);
      border-radius: 8px;
      padding: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">`;

    sections.forEach((section) => {
      html += this.generateSectionHTML(section);
    });

    html += `
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate section HTML
   */
  private generateSectionHTML(section: PortfolioSection): string {
    switch (section.id) {
      case "hero":
        return `
    <section class="hero">
      <h1>${section.content.name}</h1>
      <p>${section.content.headline}</p>
      ${section.content.location ? `<p>📍 ${section.content.location}</p>` : ""}
    </section>`;

      case "about":
        return `
    <section class="section">
      <h2>About</h2>
      <p>${section.content.description}</p>
    </section>`;

      case "skills":
        return `
    <section class="section">
      <h2>Skills</h2>
      <div class="grid">
        ${section.content.skills.map((skill: string) => `<span class="card">${skill}</span>`).join("")}
      </div>
    </section>`;

      case "coding-stats":
        return `
    <section class="section">
      <h2>Coding Statistics</h2>
      <div class="grid">
        ${section.content.codingStats.map((stat: any) => `
          <div class="card">
            <h3>${stat.platform}</h3>
            <p>Username: ${stat.username}</p>
            ${stat.problemsSolved ? `<p>Problems Solved: ${stat.problemsSolved}</p>` : ""}
            ${stat.rating ? `<p>Rating: ${stat.rating}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </section>`;

      case "contact":
        return `
    <section class="section">
      <h2>Contact</h2>
      ${section.content.website ? `<p>🌐 <a href="${section.content.website}">${section.content.website}</a></p>` : ""}
    </section>`;

      case "experience":
        return `
    <section class="section">
      <h2>Experience</h2>
      <div class="grid">
        ${section.content.experience.map((exp: any) => `
          <div class="card">
            <h3>${exp.role}</h3>
            <p>${exp.company}</p>
            <p>${exp.startDate} - ${exp.endDate || "Present"}</p>
          </div>
        `).join("")}
      </div>
    </section>`;

      case "projects":
        return `
    <section class="section">
      <h2>Projects</h2>
      <div class="grid">
        ${section.content.projects.map((project: any) => `
          <div class="card">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            ${project.technologies ? `<p>${project.technologies.join(", ")}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </section>`;

      default:
        return `
    <section class="section">
      <h2>${section.title}</h2>
      <p>Section content</p>
    </section>`;
    }
  }

  /**
   * Enhance portfolio section with AI
   */
  async enhanceSectionWithAI(
    userId: string,
    sectionId: string,
    content: any,
  ): Promise<string> {
    const context = {
      section: sectionId,
      content: JSON.stringify(content),
    };

    try {
      const response = await processAIRequest("portfolio_enhancement" as AIFeatureType, context, userId, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      return response.data as string;
    } catch (error) {
      console.error("Error enhancing section with AI:", error);
      throw error;
    }
  }
}

export const portfolioGeneratorService = new PortfolioGeneratorService();
