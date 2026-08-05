/**
 * Export Center Service
 * Handles exporting profile data in various formats
 */

import { aiDataLayer } from "./ai-data-layer";
import { portfolioGeneratorService } from "./portfolio-generator";

export type ExportFormat = "json" | "pdf" | "html" | "csv" | "docx" | "markdown";

export interface ExportOptions {
  format: ExportFormat;
  includePrivate: boolean;
  includeAnalytics: boolean;
  theme?: string;
  sections?: string[];
}

export class ExportCenterService {
  /**
   * Export profile data
   */
  async exportProfile(userId: string, options: ExportOptions): Promise<Blob> {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    switch (options.format) {
      case "json":
        return this.exportJSON(profile, options);
      case "html":
        return this.exportHTML(profile, options);
      case "csv":
        return this.exportCSV(profile, options);
      case "markdown":
        return this.exportMarkdown(profile, options);
      case "pdf":
        return this.exportPDF(profile, options);
      case "docx":
        return this.exportDOCX(profile, options);
      default:
        throw new Error("Unsupported export format");
    }
  }

  /**
   * Export as JSON
   */
  private exportJSON(profile: any, options: ExportOptions): Blob {
    const data = options.includePrivate ? profile : this.filterPrivateData(profile);
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Export as HTML
   */
  private exportHTML(profile: any, options: ExportOptions): Blob {
    const theme = options.theme || "modern";
    const sections = portfolioGeneratorService.generatePortfolio(profile.userId, theme);
    const html = portfolioGeneratorService.generatePortfolioHTML(sections, portfolioGeneratorService.getTheme(theme)!);
    return new Blob([html], { type: "text/html" });
  }

  /**
   * Export as CSV
   */
  private exportCSV(profile: any, options: ExportOptions): Blob {
    const data = options.includePrivate ? profile : this.filterPrivateData(profile);
    const csv = this.objectToCSV(data);
    return new Blob([csv], { type: "text/csv" });
  }

  /**
   * Export as Markdown
   */
  private exportMarkdown(profile: any, options: ExportOptions): Blob {
    const data = options.includePrivate ? profile : this.filterPrivateData(profile);
    const markdown = this.objectToMarkdown(data);
    return new Blob([markdown], { type: "text/markdown" });
  }

  /**
   * Export as PDF
   */
  private exportPDF(profile: any, options: ExportOptions): Blob {
    // This would typically call a PDF generation service
    const pdfContent = `Profile Export\n\n${JSON.stringify(profile, null, 2)}`;
    return new Blob([pdfContent], { type: "application/pdf" });
  }

  /**
   * Export as DOCX
   */
  private exportDOCX(profile: any, options: ExportOptions): Blob {
    // This would typically call a DOCX generation service
    const docxContent = `Profile Export\n\n${JSON.stringify(profile, null, 2)}`;
    return new Blob([docxContent], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  /**
   * Filter private data
   */
  private filterPrivateData(profile: any): any {
    const filtered = { ...profile };
    const privateFields = ["email", "phone", "address", "privateNotes"];
    
    privateFields.forEach((field) => {
      delete filtered[field];
    });

    return filtered;
  }

  /**
   * Convert object to CSV
   */
  private objectToCSV(obj: any): string {
    const flatten = (o: any, prefix = ""): any => {
      const result: any = {};
      for (const key in o) {
        const value = o[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          Object.assign(result, flatten(value, newKey));
        } else if (Array.isArray(value)) {
          result[newKey] = JSON.stringify(value);
        } else {
          result[newKey] = value;
        }
      }
      return result;
    };

    const flattened = flatten(obj);
    const headers = Object.keys(flattened).join(",");
    const values = Object.values(flattened).map((v) => `"${v}"`).join(",");
    
    return `${headers}\n${values}`;
  }

  /**
   * Convert object to Markdown
   */
  private objectToMarkdown(obj: any): string {
    let markdown = `# Profile Export\n\n`;
    
    if (obj.displayName) {
      markdown += `## ${obj.displayName}\n\n`;
    }
    
    if (obj.bio) {
      markdown += `### About\n${obj.bio}\n\n`;
    }
    
    if (obj.skills && obj.skills.length > 0) {
      markdown += `### Skills\n`;
      obj.skills.forEach((skill: any) => {
        markdown += `- ${skill.name || skill}\n`;
      });
      markdown += "\n";
    }
    
    if (obj.experience && obj.experience.length > 0) {
      markdown += `### Experience\n`;
      obj.experience.forEach((exp: any) => {
        markdown += `#### ${exp.title || exp.role} at ${exp.company}\n`;
        if (exp.description) {
          markdown += `${exp.description}\n`;
        }
        markdown += "\n";
      });
    }
    
    if (obj.projects && obj.projects.length > 0) {
      markdown += `### Projects\n`;
      obj.projects.forEach((project: any) => {
        markdown += `#### ${project.name}\n`;
        if (project.description) {
          markdown += `${project.description}\n`;
        }
        if (project.technologies) {
          markdown += `Technologies: ${project.technologies.join(", ")}\n`;
        }
        markdown += "\n";
      });
    }
    
    if (obj.education && obj.education.length > 0) {
      markdown += `### Education\n`;
      obj.education.forEach((edu: any) => {
        markdown += `#### ${edu.degree}\n`;
        markdown += `${edu.institution}\n`;
        if (edu.year) {
          markdown += `${edu.year}\n`;
        }
        markdown += "\n";
      });
    }
    
    return markdown;
  }

  /**
   * Export resume specifically
   */
  async exportResume(userId: string, format: "pdf" | "docx" = "pdf", version: "ats" | "modern" | "minimal" = "modern"): Promise<Blob> {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    const resumeData = aiDataLayer.getResumeData();
    
    if (format === "pdf") {
      const pdfContent = `Resume - ${profile.displayName}\n\n${JSON.stringify(resumeData, null, 2)}`;
      return new Blob([pdfContent], { type: "application/pdf" });
    } else {
      const docxContent = `Resume - ${profile.displayName}\n\n${JSON.stringify(resumeData, null, 2)}`;
      return new Blob([docxContent], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    }
  }

  /**
   * Export portfolio specifically
   */
  async exportPortfolio(userId: string, theme: string = "modern"): Promise<Blob> {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    const sections = portfolioGeneratorService.generatePortfolio(userId, theme);
    const html = portfolioGeneratorService.generatePortfolioHTML(sections, portfolioGeneratorService.getTheme(theme)!);
    
    return new Blob([html], { type: "text/html" });
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(userId: string): Promise<Blob> {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    const analyticsData = {
      profileCompletion: profile.profileCompletion,
      lastSynced: profile.lastSynced,
      skillsCount: profile.skills.length,
      projectsCount: profile.projects.length,
      experienceCount: profile.experience.length,
      educationCount: profile.education.length,
      achievementsCount: profile.achievements.length,
      certificationsCount: profile.certifications.length,
    };

    const jsonString = JSON.stringify(analyticsData, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): Array<{ id: ExportFormat; name: string; description: string }> {
    return [
      { id: "json", name: "JSON", description: "Raw data in JSON format" },
      { id: "html", name: "HTML", description: "Portfolio as standalone HTML file" },
      { id: "pdf", name: "PDF", description: "Profile document in PDF format" },
      { id: "docx", name: "Word Document", description: "Resume in DOCX format" },
      { id: "csv", name: "CSV", description: "Tabular data in CSV format" },
      { id: "markdown", name: "Markdown", description: "Profile in Markdown format" },
    ];
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename
   */
  generateFilename(username: string, format: ExportFormat, type: "profile" | "resume" | "portfolio" = "profile"): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const extension = this.getFileExtension(format);
    return `skillverse-${type}-${username}-${timestamp}.${extension}`;
  }

  /**
   * Get file extension
   */
  private getFileExtension(format: ExportFormat): string {
    const extensions: Record<ExportFormat, string> = {
      json: "json",
      html: "html",
      pdf: "pdf",
      docx: "docx",
      csv: "csv",
      markdown: "md",
    };
    return extensions[format];
  }
}

export const exportCenterService = new ExportCenterService();
