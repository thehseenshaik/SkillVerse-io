/**
 * Resume Builder TypeScript Types
 * Comprehensive type definitions for all resume data structures
 */

// Basic contact information
export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

// Profile section
export interface Profile {
  fullName: string;
  title: string;
  contact: ContactInfo;
  summary?: string;
  avatar?: string;
}

// Skill entry
export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
}

// Project entry
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  link?: string;
  github?: string;
}

// Work experience entry
export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  achievements?: string[];
}

// Education entry
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  honors?: string[];
}

// Certification entry
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
}

// Achievement entry
export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'award' | 'recognition' | 'milestone' | 'other';
}

// Language entry
export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

// Volunteer work entry
export interface VolunteerWork {
  id: string;
  organization: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

// Publication entry
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  date: string;
  link?: string;
  description?: string;
}

// Reference entry
export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

// Custom section
export interface CustomSection {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    description: string;
  }[];
}

// Complete resume data structure
export interface ResumeData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  volunteerWork: VolunteerWork[];
  publications: Publication[];
  references: Reference[];
  customSections: CustomSection[];
}

// Template type
export type TemplateType = 
  | 'ats-professional'
  | 'modern-minimal'
  | 'executive'
  | 'software-engineer'
  | 'designer'
  | 'fresher'
  | 'internship'
  | 'corporate'
  | 'startup'
  | 'academic';

// Theme configuration
export interface Theme {
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  headingStyle: {
    size: 'small' | 'medium' | 'large';
    weight: 'normal' | 'semibold' | 'bold';
    transform: 'none' | 'uppercase';
  };
  sectionStyle: {
    spacing: 'compact' | 'normal' | 'spacious';
    borders: boolean;
    borderColor: string;
    background: string;
  };
  icons: {
    enabled: boolean;
    style: 'filled' | 'outlined' | 'minimal';
  };
}

// ATS analysis result
export interface ATSAnalysis {
  score: number;
  missingKeywords: string[];
  weakSections: string[];
  formattingProblems: string[];
  suggestions: string[];
  keywordDensity: Record<string, number>;
  readability: {
    score: number;
    level: string;
    avgSentenceLength: number;
  };
}

// Resume health score
export interface ResumeHealthScore {
  overall: number;
  atsScore: number;
  readability: number;
  professionalism: number;
  keywordMatch: number;
  projectQuality: number;
  experienceQuality: number;
  sectionCompleteness: Record<string, number>;
}

// Preview mode
export type PreviewMode = 'desktop' | 'a4' | 'letter' | 'mobile' | 'print';

// Zoom level
export type ZoomLevel = 50 | 75 | 100 | 125 | 150;

// Export format
export type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'json' | 'html' | 'txt';
