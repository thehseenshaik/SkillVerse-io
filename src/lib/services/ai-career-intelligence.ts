/**
 * AI Career Intelligence Service
 * Provides AI-powered career analysis, recommendations, and guidance
 */

import { processAIRequest } from "./ai";
import { aiDataLayer } from "./ai-data-layer";
import type { AIFeatureType } from "@/types/ai";
import { useIdentityHub } from "@/lib/identity-hub-context";

// ============================================================================
// TYPES
// ============================================================================

export interface CareerScore {
  overall: number;
  atsScore: number;
  skillScore: number;
  resumeReadiness: number;
  interviewReadiness: number;
  projectQuality: number;
  githubStrength: number;
  codingProgress: number;
  learningProgress: number;
  employability: number;
}

export interface ResumeAnalysis {
  score: number;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  actionItems: Array<{
    priority: "high" | "medium" | "low";
    action: string;
  }>;
}

export interface ATSReport {
  overallScore: number;
  sectionScores: {
    structure: number;
    formatting: number;
    readability: number;
    skills: number;
    projects: number;
    experience: number;
    education: number;
    contact: number;
  };
  missingKeywords: string[];
  optimizationSuggestions: string[];
}

export interface SkillGapAnalysis {
  targetRole: string;
  existingSkills: string[];
  missingSkills: Array<{
    skill: string;
    importance: "critical" | "important" | "nice_to_have";
  }>;
  learningOrder: Array<{
    skill: string;
    order: number;
    estimatedTime: string;
  }>;
  recommendations: string[];
}

export interface CareerRoadmap {
  title: string;
  duration: string;
  milestones: Array<{
    phase: string;
    timeframe: string;
    goals: string[];
    resources: string[];
    projects: string[];
    certifications: string[];
  }>;
}

export interface InterviewQuestions {
  hr: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  technical: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  behavioral: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  project: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  coding: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  roleSpecific: Array<{ question: string; suggestedAnswer: string; tips: string }>;
}

export interface CompanyMatch {
  companyName: string;
  skillMatch: number;
  resumeMatch: number;
  experienceMatch: number;
  projectMatch: number;
  overallScore: number;
  missingRequirements: string[];
  improvementPlan: string[];
}

export interface ProjectReview {
  complexity: number;
  documentation: number;
  technologies: number;
  readability: number;
  portfolioValue: number;
  recruiterAppeal: number;
  overallScore: number;
  improvements: string[];
}

export interface PortfolioReview {
  design: number;
  content: number;
  navigation: number;
  projects: number;
  professionalism: number;
  recruiterImpression: number;
  overallScore: number;
  feedback: string[];
}

export interface LearningRecommendation {
  type: "course" | "documentation" | "practice" | "opensource" | "challenge" | "book" | "video";
  title: string;
  description: string;
  url?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  priority: "high" | "medium" | "low";
}

export interface AIHistoryItem {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
}

export interface AIUsage {
  totalRequests: number;
  tokensConsumed: number;
  estimatedCost: number;
  dailyUsage: number;
  monthlyUsage: number;
}

// ============================================================================
// AI CAREER INTELLIGENCE SERVICE
// ============================================================================

export class AICareerIntelligenceService {
  private history: AIHistoryItem[] = [];
  private usage: AIUsage = {
    totalRequests: 0,
    tokensConsumed: 0,
    estimatedCost: 0,
    dailyUsage: 0,
    monthlyUsage: 0,
  };
  private feedback: Map<string, { rating: number; comment: string; timestamp: Date }> = new Map();

  /**
   * Calculate comprehensive career score
   */
  async calculateCareerScore(userId: string): Promise<CareerScore> {
    const profile = aiDataLayer.getUnifiedProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    const context = {
      skills: JSON.stringify(profile.skills),
      projects: JSON.stringify(profile.projects),
      experience: JSON.stringify(profile.experience),
      education: JSON.stringify(profile.education),
      codingStats: JSON.stringify(profile.codingStats),
      achievements: JSON.stringify(profile.achievements),
    };

    const response = await processAIRequest("career_score" as AIFeatureType, context, userId, {
      temperature: 0.3,
      maxTokens: 2000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const score = JSON.parse(response.data as string);

    this.addToHistory("career_score", score);
    return score;
  }

  /**
   * Analyze resume with AI
   */
  async analyzeResume(userId: string): Promise<ResumeAnalysis> {
    const resumeData = aiDataLayer.getResumeData();
    if (!resumeData) {
      throw new Error("Resume data not found");
    }

    const context = {
      resume: JSON.stringify(resumeData),
    };

    const response = await processAIRequest("resume_analysis", context, userId, {
      temperature: 0.4,
      maxTokens: 3000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const analysis = JSON.parse(response.data as string);

    this.addToHistory("resume_analysis", analysis);
    return analysis;
  }

  /**
   * Generate ATS score report
   */
  async generateATSReport(userId: string): Promise<ATSReport> {
    const atsData = aiDataLayer.getATSData();
    if (!atsData) {
      throw new Error("ATS data not found");
    }

    const context = {
      atsData: JSON.stringify(atsData),
    };

    const response = await processAIRequest("ats_evaluation" as AIFeatureType, context, userId, {
      temperature: 0.3,
      maxTokens: 2500,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const report = JSON.parse(response.data as string);

    this.addToHistory("ats_report", report);
    return report;
  }

  /**
   * Analyze skill gaps for a target role
   */
  async analyzeSkillGaps(
    userId: string,
    targetRole: string,
  ): Promise<SkillGapAnalysis> {
    const skills = aiDataLayer.getSkills();
    const context = {
      currentSkills: JSON.stringify(skills),
      targetRole,
    };

    const response = await processAIRequest("skill_gap_analysis", context, userId, {
      temperature: 0.4,
      maxTokens: 3000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const analysis = JSON.parse(response.data as string);

    this.addToHistory("skill_gap_analysis", analysis);
    return analysis;
  }

  /**
   * Generate personalized career roadmap
   */
  async generateCareerRoadmap(
    userId: string,
    targetRole?: string,
  ): Promise<CareerRoadmap> {
    const profile = aiDataLayer.getUnifiedProfile();
    const skills = aiDataLayer.getSkills();

    const context = {
      currentSkills: JSON.stringify(skills),
      experience: JSON.stringify(profile?.experience || []),
      targetRole: targetRole || "Full Stack Developer",
    };

    const response = await processAIRequest("learning_roadmap" as AIFeatureType, context, userId, {
      temperature: 0.5,
      maxTokens: 4000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const roadmap = JSON.parse(response.data as string);

    this.addToHistory("career_roadmap", roadmap);
    return roadmap;
  }

  /**
   * Generate AI resume
   */
  async generateResume(
    userId: string,
    template: "fresher" | "student" | "experienced" | "internship" | "ats_friendly" | "modern" | "minimal" | "technical",
  ): Promise<string> {
    const resumeData = aiDataLayer.getResumeData();
    if (!resumeData) {
      throw new Error("Resume data not found");
    }

    const context = {
      resume: JSON.stringify(resumeData),
      template,
    };

    const response = await processAIRequest("resume_generator" as AIFeatureType, context, userId, {
      temperature: 0.6,
      maxTokens: 5000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const resume = response.data as string;

    this.addToHistory("resume_generation", { template, resume });
    return resume;
  }

  /**
   * Generate AI cover letter
   */
  async generateCoverLetter(
    userId: string,
    company: string,
    role: string,
  ): Promise<string> {
    const resumeData = aiDataLayer.getResumeData();
    if (!resumeData) {
      throw new Error("Resume data not found");
    }

    const context = {
      resume: JSON.stringify(resumeData),
      company,
      role,
    };

    const response = await processAIRequest("cover_letter" as AIFeatureType, context, userId, {
      temperature: 0.7,
      maxTokens: 3000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const coverLetter = response.data as string;

    this.addToHistory("cover_letter_generation", { company, role, coverLetter });
    return coverLetter;
  }

  /**
   * Generate interview questions
   */
  async generateInterviewQuestions(
    userId: string,
    role: string,
  ): Promise<InterviewQuestions> {
    const skills = aiDataLayer.getSkills();
    const experience = aiDataLayer.getExperience();
    const projects = aiDataLayer.getProjects();

    const context = {
      skills: JSON.stringify(skills),
      experience: JSON.stringify(experience),
      projects: JSON.stringify(projects),
      role,
    };

    const response = await processAIRequest("interview_preparation" as AIFeatureType, context, userId, {
      temperature: 0.5,
      maxTokens: 4000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const questions = JSON.parse(response.data as string);

    this.addToHistory("interview_questions", questions);
    return questions;
  }

  /**
   * Analyze company match
   */
  async analyzeCompanyMatch(
    userId: string,
    companyName: string,
  ): Promise<CompanyMatch> {
    const skills = aiDataLayer.getSkills();
    const experience = aiDataLayer.getExperience();
    const projects = aiDataLayer.getProjects();

    const context = {
      skills: JSON.stringify(skills),
      experience: JSON.stringify(experience),
      projects: JSON.stringify(projects),
      companyName,
    };

    const response = await processAIRequest("company_match", context, userId, {
      temperature: 0.4,
      maxTokens: 3000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const match = JSON.parse(response.data as string);

    this.addToHistory("company_match", match);
    return match;
  }

  /**
   * Review project with AI
   */
  async reviewProject(userId: string, project: any): Promise<ProjectReview> {
    const context = {
      project: JSON.stringify(project),
    };

    const response = await processAIRequest("project_review", context, userId, {
      temperature: 0.4,
      maxTokens: 2000,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const review = JSON.parse(response.data as string);

    this.addToHistory("project_review", review);
    return review;
  }

  /**
   * Review portfolio with AI
   */
  async reviewPortfolio(userId: string, portfolioUrl: string): Promise<PortfolioReview> {
    const projects = aiDataLayer.getProjects();
    const skills = aiDataLayer.getSkills();

    const context = {
      portfolioUrl,
      projects: JSON.stringify(projects),
      skills: JSON.stringify(skills),
    };

    const response = await processAIRequest("portfolio_review", context, userId, {
      temperature: 0.4,
      maxTokens: 2500,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const review = JSON.parse(response.data as string);

    this.addToHistory("portfolio_review", review);
    return review;
  }

  /**
   * Generate learning recommendations
   */
  async generateLearningRecommendations(
    userId: string,
    targetRole?: string,
  ): Promise<LearningRecommendation[]> {
    const skills = aiDataLayer.getSkills();
    const skillGap = targetRole ? await this.analyzeSkillGaps(userId, targetRole) : null;

    const context = {
      currentSkills: JSON.stringify(skills),
      missingSkills: skillGap ? JSON.stringify(skillGap.missingSkills) : "[]",
      targetRole: targetRole || "Full Stack Developer",
    };

    const response = await processAIRequest("learning_roadmap" as AIFeatureType, context, userId, {
      temperature: 0.5,
      maxTokens: 3500,
    });

    this.recordUsage(response.metadata.tokenUsage);
    const recommendations = JSON.parse(response.data as string);

    this.addToHistory("learning_recommendations", recommendations);
    return recommendations;
  }

  /**
   * Get AI history
   */
  getHistory(type?: string): AIHistoryItem[] {
    if (type) {
      return this.history.filter((item) => item.type === type);
    }
    return this.history;
  }

  /**
   * Get usage statistics
   */
  getUsage(): AIUsage {
    return this.usage;
  }

  /**
   * Record usage
   */
  private recordUsage(tokenUsage: any): void {
    this.usage.totalRequests++;
    this.usage.tokensConsumed += tokenUsage.totalTokens;
    this.usage.estimatedCost += tokenUsage.estimatedCost;
    this.usage.dailyUsage++;
    this.usage.monthlyUsage++;
  }

  /**
   * Add to history
   */
  private addToHistory(type: string, data: any): void {
    this.history.push({
      id: `history_${Date.now()}`,
      type,
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Submit feedback for an AI response
   */
  submitFeedback(historyId: string, rating: number, comment?: string): void {
    this.feedback.set(historyId, {
      rating,
      comment: comment || "",
      timestamp: new Date(),
    });
  }

  /**
   * Get feedback for a specific history item
   */
  getFeedback(historyId: string): { rating: number; comment: string; timestamp: Date } | undefined {
    return this.feedback.get(historyId);
  }

  /**
   * Get all feedback
   */
  getAllFeedback(): Map<string, { rating: number; comment: string; timestamp: Date }> {
    return this.feedback;
  }

  /**
   * Get average rating
   */
  getAverageRating(): number {
    const ratings = Array.from(this.feedback.values()).map((f) => f.rating);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }
}

export const aiCareerIntelligence = new AICareerIntelligenceService();
