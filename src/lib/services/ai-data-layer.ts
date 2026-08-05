/**
 * AI Data Layer
 * Provides normalized data methods for all AI features
 * This is the single source of truth for AI-powered features
 */

import type {
  UnifiedProfile,
  Skill,
  Project,
  Experience,
  Education,
  Achievement,
  Certification,
  CodingStats,
  Platform,
} from "@/types/identity-hub";

export interface ResumeData {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  skills: {
    technical: Skill[];
    soft: Skill[];
    languages: Skill[];
  };
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  codingStats: CodingStats[];
}

export interface ATSData {
  keywords: string[];
  skills: string[];
  technologies: string[];
  experience: string[];
  education: string[];
  projects: string[];
  matchScore?: number;
  missingKeywords: string[];
  recommendations: string[];
}

export interface CompanyMatchData {
  companyName: string;
  requiredSkills: Skill[];
  missingSkills: Skill[];
  matchPercentage: number;
  experienceMatch: number;
  projectMatch: number;
  overallScore: number;
  recommendations: string[];
}

export class AIDataLayer {
  private profile: UnifiedProfile | null = null;

  /**
   * Set the unified profile
   */
  setProfile(profile: UnifiedProfile): void {
    this.profile = profile;
  }

  /**
   * Get the complete unified profile
   */
  getUnifiedProfile(): UnifiedProfile | null {
    return this.profile;
  }

  /**
   * Get resume-ready data
   */
  getResumeData(): ResumeData | null {
    if (!this.profile) return null;

    const skills = this.groupSkillsByCategory();

    return {
      personalInfo: {
        name: this.profile.displayName || "",
        email: this.profile.privacySettings.showEmail
          ? "user@example.com"
          : undefined,
        location: this.profile.privacySettings.showLocation
          ? this.profile.location
          : undefined,
        website: this.profile.website,
      },
      summary: this.profile.bio,
      skills: {
        technical: skills.programming_language,
        soft: skills.soft_skills,
        languages: skills.programming_language.filter((s) =>
          ["JavaScript", "Python", "Java", "C++", "Go", "Rust"].includes(
            s.name,
          ),
        ),
      },
      experience: this.filterByPrivacy(this.profile.experience),
      education: this.filterByPrivacy(this.profile.education),
      projects: this.filterByPrivacy(this.profile.projects),
      certifications: this.filterByPrivacy(this.profile.certifications),
      achievements: this.filterByPrivacy(this.profile.achievements),
      codingStats: this.profile.codingStats,
    };
  }

  /**
   * Get ATS-optimized data
   */
  getATSData(): ATSData | null {
    if (!this.profile) return null;

    const allSkills = this.profile.skills.map((s) => s.name);
    const allTechnologies = this.profile.projects.flatMap(
      (p) => p.technologies,
    );
    const allKeywords = [...new Set([...allSkills, ...allTechnologies])];

    return {
      keywords: allKeywords,
      skills: allSkills,
      technologies: allTechnologies,
      experience: this.profile.experience.map((e) => e.title),
      education: this.profile.education.map((e) => e.degree),
      projects: this.profile.projects.map((p) => p.name),
      missingKeywords: [],
      recommendations: [],
    };
  }

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    if (!this.profile) return [];
    return this.filterByPrivacy(this.profile.projects);
  }

  /**
   * Get all skills
   */
  getSkills(): Skill[] {
    if (!this.profile) return [];
    return this.profile.skills.filter((s) => !s.isHidden);
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: Skill["category"]): Skill[] {
    return this.getSkills().filter((s) => s.category === category);
  }

  /**
   * Get experience
   */
  getExperience(): Experience[] {
    if (!this.profile) return [];
    return this.filterByPrivacy(this.profile.experience);
  }

  /**
   * Get education
   */
  getEducation(): Education[] {
    if (!this.profile) return [];
    return this.filterByPrivacy(this.profile.education);
  }

  /**
   * Get achievements
   */
  getAchievements(): Achievement[] {
    if (!this.profile) return [];
    return this.filterByPrivacy(this.profile.achievements);
  }

  /**
   * Get certifications
   */
  getCertifications(): Certification[] {
    if (!this.profile) return [];
    return this.filterByPrivacy(this.profile.certifications);
  }

  /**
   * Get coding statistics
   */
  getCodingStatistics(): CodingStats[] {
    if (!this.profile) return [];
    return this.profile.codingStats;
  }

  /**
   * Get coding statistics by platform
   */
  getCodingStatsByPlatform(platform: Platform): CodingStats | null {
    const stats = this.getCodingStatistics();
    return stats.find((s) => s.platform === platform) || null;
  }

  /**
   * Get portfolio data
   */
  getPortfolioData(): {
    projects: Project[];
    skills: Skill[];
    achievements: Achievement[];
    codingStats: CodingStats[];
    profileCompletion: number;
  } {
    if (!this.profile) {
      return {
        projects: [],
        skills: [],
        achievements: [],
        codingStats: [],
        profileCompletion: 0,
      };
    }

    return {
      projects: this.getProjects(),
      skills: this.getSkills(),
      achievements: this.getAchievements(),
      codingStats: this.getCodingStatistics(),
      profileCompletion: this.profile.profileCompletion,
    };
  }

  /**
   * Get skill gap analysis data
   */
  getSkillGapData(requiredSkills: string[]): {
    currentSkills: Skill[];
    missingSkills: string[];
    matchedSkills: Skill[];
    gapPercentage: number;
  } {
    const currentSkills = this.getSkills();
    const currentSkillNames = new Set(
      currentSkills.map((s) => s.name.toLowerCase()),
    );

    const matchedSkills = currentSkills.filter((s) =>
      requiredSkills.some((rs) => rs.toLowerCase() === s.name.toLowerCase()),
    );

    const missingSkills = requiredSkills.filter(
      (rs) => !currentSkillNames.has(rs.toLowerCase()),
    );

    const gapPercentage =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    return {
      currentSkills,
      missingSkills,
      matchedSkills,
      gapPercentage,
    };
  }

  /**
   * Get company match data
   */
  getCompanyMatchData(
    companyName: string,
    requirements: {
      skills: string[];
      experience: number;
      technologies: string[];
    },
  ): CompanyMatchData | null {
    if (!this.profile) return null;

    const skillGap = this.getSkillGapData(requirements.skills);
    const totalExperience = this.calculateTotalExperience();

    const experienceMatch =
      totalExperience >= requirements.experience
        ? 100
        : Math.round((totalExperience / requirements.experience) * 100);

    const projectMatch = this.calculateProjectMatch(requirements.technologies);

    const overallScore = Math.round(
      skillGap.gapPercentage * 0.4 + experienceMatch * 0.3 + projectMatch * 0.3,
    );

    return {
      companyName,
      requiredSkills: this.profile.skills.filter((s) =>
        requirements.skills.includes(s.name),
      ),
      missingSkills: skillGap.missingSkills.map((name) => ({
        id: `missing-${name}`,
        name,
        category: "programming_language" as const,
        proficiency: 0,
        sources: [],
      })),
      matchPercentage: overallScore,
      experienceMatch,
      projectMatch,
      overallScore,
      recommendations: this.generateRecommendations(
        skillGap,
        experienceMatch,
        projectMatch,
      ),
    };
  }

  /**
   * Get interview preparation data
   */
  getInterviewPrepData(): {
    technicalSkills: Skill[];
    projects: Project[];
    experience: Experience[];
    commonQuestions: string[];
    focusAreas: string[];
  } | null {
    if (!this.profile) return null;

    const topSkills = this.getSkills().slice(0, 10);
    const recentProjects = this.getProjects().slice(0, 5);
    const relevantExperience = this.getExperience();

    return {
      technicalSkills: topSkills,
      projects: recentProjects,
      experience: relevantExperience,
      commonQuestions: this.generateCommonQuestions(topSkills, recentProjects),
      focusAreas: this.generateFocusAreas(topSkills, relevantExperience),
    };
  }

  /**
   * Get career recommendations
   */
  getCareerRecommendations(): string[] {
    if (!this.profile) return [];

    const skills = this.getSkills();
    const projects = this.getProjects();
    const codingStats = this.getCodingStatistics();

    const recommendations: string[] = [];

    // Based on skills
    if (skills.some((s) => s.name === "Python" && s.proficiency > 70)) {
      recommendations.push("Consider Data Science or Machine Learning roles");
    }

    if (skills.some((s) => s.name === "React" && s.proficiency > 70)) {
      recommendations.push("Frontend Development roles would be a good fit");
    }

    if (skills.some((s) => s.name === "Node.js" && s.proficiency > 70)) {
      recommendations.push("Backend Development or Full Stack roles");
    }

    // Based on coding stats
    const totalProblems = codingStats.reduce(
      (sum, stat) => sum + (stat.problemsSolved || 0),
      0,
    );
    if (totalProblems > 500) {
      recommendations.push("You're ready for Senior Engineering roles");
    }

    // Based on projects
    if (projects.length > 10) {
      recommendations.push("Strong portfolio - consider Tech Lead positions");
    }

    return recommendations;
  }

  // Helper methods

  private groupSkillsByCategory(): Record<string, Skill[]> {
    const skills = this.getSkills();
    const grouped: Record<string, Skill[]> = {
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

  private filterByPrivacy<T extends { isHidden?: boolean }>(items: T[]): T[] {
    return items.filter((item) => !item.isHidden);
  }

  private calculateTotalExperience(): number {
    const experience = this.getExperience();
    let totalMonths = 0;

    experience.forEach((exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    return Math.round(totalMonths / 12); // Return years
  }

  private calculateProjectMatch(requiredTechnologies: string[]): number {
    const projects = this.getProjects();
    const allTechnologies = projects.flatMap((p) => p.technologies);
    const techSet = new Set(allTechnologies.map((t) => t.toLowerCase()));

    const matched = requiredTechnologies.filter((rt) =>
      techSet.has(rt.toLowerCase()),
    );
    return requiredTechnologies.length > 0
      ? Math.round((matched.length / requiredTechnologies.length) * 100)
      : 0;
  }

  private generateRecommendations(
    skillGap: any,
    experienceMatch: number,
    projectMatch: number,
  ): string[] {
    const recommendations: string[] = [];

    if (skillGap.gapPercentage < 80) {
      recommendations.push("Focus on learning missing required skills");
    }

    if (experienceMatch < 70) {
      recommendations.push("Consider gaining more experience in similar roles");
    }

    if (projectMatch < 70) {
      recommendations.push("Build more projects with required technologies");
    }

    return recommendations;
  }

  private generateCommonQuestions(
    skills: Skill[],
    projects: Project[],
  ): string[] {
    const questions: string[] = [];

    skills.slice(0, 3).forEach((skill) => {
      questions.push(`Explain your experience with ${skill.name}`);
      questions.push(`What are the pros and cons of using ${skill.name}?`);
    });

    projects.slice(0, 2).forEach((project) => {
      questions.push(`Walk me through your ${project.name} project`);
      questions.push(`What challenges did you face in ${project.name}?`);
    });

    return questions;
  }

  private generateFocusAreas(
    skills: Skill[],
    experience: Experience[],
  ): string[] {
    const focusAreas: string[] = [];

    skills.slice(0, 5).forEach((skill) => {
      if (skill.proficiency < 70) {
        focusAreas.push(`Improve ${skill.name} skills`);
      }
    });

    if (experience.length < 2) {
      focusAreas.push("Gain more professional experience");
    }

    return focusAreas;
  }
}

export const aiDataLayer = new AIDataLayer();
