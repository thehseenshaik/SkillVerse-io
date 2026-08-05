import type { ResumeData, ATSAnalysis, ResumeHealthScore } from "./types";

// Common ATS keywords by category
const commonKeywords = {
  skills: [
    'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'sql', 'aws',
    'docker', 'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'data analysis',
    'project management', 'leadership', 'communication', 'problem solving', 'teamwork',
    'analytics', 'marketing', 'sales', 'customer service', 'operations', 'finance',
  ],
  actionVerbs: [
    'developed', 'implemented', 'designed', 'managed', 'led', 'created', 'built',
    'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'launched',
    'executed', 'coordinated', 'collaborated', 'analyzed', 'engineered', 'architected',
  ],
  metrics: [
    '%', 'increased', 'decreased', 'reduced', 'saved', 'generated', 'improved by',
    'growth', 'revenue', 'users', 'customers', 'sales', 'efficiency', 'productivity',
  ],
};

// Analyze resume for ATS compatibility
export function analyzeATS(resume: ResumeData, jobDescription?: string): ATSAnalysis {
  const resumeText = extractResumeText(resume);
  const jobKeywords = jobDescription ? extractKeywords(jobDescription) : [];
  
  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(resumeText, jobKeywords);
  
  // Find missing keywords
  const missingKeywords = findMissingKeywords(resumeText, jobKeywords);
  
  // Identify weak sections
  const weakSections = identifyWeakSections(resume);
  
  // Find formatting problems
  const formattingProblems = checkFormatting(resume);
  
  // Generate suggestions
  const suggestions = generateSuggestions(resume, missingKeywords, weakSections);
  
  // Calculate overall ATS score
  const score = calculateATSScore(
    keywordDensity,
    missingKeywords,
    weakSections,
    formattingProblems
  );
  
  // Calculate readability
  const readability = calculateReadability(resumeText);
  
  return {
    score,
    missingKeywords,
    weakSections,
    formattingProblems,
    suggestions,
    keywordDensity,
    readability,
  };
}

// Extract all text from resume
function extractResumeText(resume: ResumeData): string {
  const parts: string[] = [];
  
  // Profile
  parts.push(resume.profile.fullName);
  parts.push(resume.profile.title);
  parts.push(resume.profile.summary || '');
  
  // Skills
  resume.skills.forEach(skill => parts.push(skill.name));
  
  // Experience
  resume.experience.forEach(exp => {
    parts.push(exp.position);
    parts.push(exp.company);
    parts.push(exp.description.join(' '));
    if (exp.achievements) parts.push(exp.achievements.join(' '));
  });
  
  // Education
  resume.education.forEach(edu => {
    parts.push(edu.degree);
    parts.push(edu.institution);
    parts.push(edu.field);
  });
  
  // Projects
  resume.projects.forEach(proj => {
    parts.push(proj.name);
    parts.push(proj.description);
    parts.push(proj.technologies.join(' '));
  });
  
  return parts.join(' ').toLowerCase();
}

// Extract keywords from job description
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const uniqueWords = [...new Set(words)];
  return uniqueWords.filter(word => 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'this', 'that', 'with', 'they', 'from', 'what', 'which', 'their', 'will', 'would', 'about', 'into', 'than', 'could', 'should'].includes(word)
  );
}

// Calculate keyword density
function calculateKeywordDensity(resumeText: string, jobKeywords: string[]): Record<string, number> {
  const density: Record<string, number> = {};
  
  if (jobKeywords.length === 0) {
    // Use common keywords if no job description
    commonKeywords.skills.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = resumeText.match(regex);
      density[keyword] = matches ? matches.length : 0;
    });
  } else {
    jobKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = resumeText.match(regex);
      density[keyword] = matches ? matches.length : 0;
    });
  }
  
  return density;
}

// Find missing keywords
function findMissingKeywords(resumeText: string, jobKeywords: string[]): string[] {
  if (jobKeywords.length === 0) {
    return [];
  }
  
  return jobKeywords.filter(keyword => {
    const regex = new RegExp(keyword, 'gi');
    return !resumeText.match(regex);
  });
}

// Identify weak sections
function identifyWeakSections(resume: ResumeData): string[] {
  const weakSections: string[] = [];
  
  // Check experience
  if (resume.experience.length === 0) {
    weakSections.push('No work experience listed');
  } else {
    resume.experience.forEach((exp, index) => {
      if (exp.description.length < 2) {
        weakSections.push(`Experience #${index + 1} has insufficient bullet points`);
      }
      if (!exp.achievements || exp.achievements.length === 0) {
        weakSections.push(`Experience #${index + 1} lacks achievements`);
      }
    });
  }
  
  // Check skills
  if (resume.skills.length < 5) {
    weakSections.push('Skills section has fewer than 5 skills');
  }
  
  // Check projects
  if (resume.projects.length === 0) {
    weakSections.push('No projects listed');
  }
  
  // Check education
  if (resume.education.length === 0) {
    weakSections.push('No education listed');
  }
  
  // Check summary
  if (!resume.profile.summary || resume.profile.summary.length < 50) {
    weakSections.push('Summary is too short or missing');
  }
  
  return weakSections;
}

// Check for formatting problems
function checkFormatting(resume: ResumeData): string[] {
  const problems: string[] = [];
  
  // Check for missing contact info
  if (!resume.profile.contact.email) {
    problems.push('Email address is missing');
  }
  if (!resume.profile.contact.phone) {
    problems.push('Phone number is missing');
  }
  if (!resume.profile.contact.location) {
    problems.push('Location is missing');
  }
  
  // Check for incomplete entries
  resume.experience.forEach((exp, index) => {
    if (!exp.startDate) {
      problems.push(`Experience #${index + 1} is missing start date`);
    }
    if (!exp.endDate && !exp.current) {
      problems.push(`Experience #${index + 1} is missing end date`);
    }
  });
  
  resume.education.forEach((edu, index) => {
    if (!edu.startDate) {
      problems.push(`Education #${index + 1} is missing start date`);
    }
  });
  
  return problems;
}

// Generate suggestions
function generateSuggestions(
  resume: ResumeData,
  missingKeywords: string[],
  weakSections: string[]
): string[] {
  const suggestions: string[] = [];
  
  // Keyword suggestions
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these keywords from job description: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  
  // Section suggestions
  if (weakSections.some(s => s.includes('bullet points'))) {
    suggestions.push('Add more bullet points to experience descriptions (aim for 3-5 per role)');
  }
  
  if (weakSections.some(s => s.includes('achievements'))) {
    suggestions.push('Add quantifiable achievements to experience (e.g., "Increased sales by 25%")');
  }
  
  if (weakSections.some(s => s.includes('skills'))) {
    suggestions.push('Add more relevant skills to showcase your expertise');
  }
  
  if (weakSections.some(s => s.includes('projects'))) {
    suggestions.push('Add projects to demonstrate practical experience');
  }
  
  if (weakSections.some(s => s.includes('summary'))) {
    suggestions.push('Write a more detailed professional summary (50-150 words)');
  }
  
  // General suggestions
  if (resume.experience.length > 0) {
    const hasMetrics = resume.experience.some(exp => 
      exp.description.some(desc => /\d+%|\$\d+|\d+ (users|customers|sales)/i.test(desc))
    );
    if (!hasMetrics) {
      suggestions.push('Add metrics and numbers to demonstrate impact (e.g., "Reduced costs by 30%")');
    }
  }
  
  return suggestions;
}

// Calculate overall ATS score
function calculateATSScore(
  keywordDensity: Record<string, number>,
  missingKeywords: string[],
  weakSections: string[],
  formattingProblems: string[]
): number {
  let score = 100;
  
  // Deduct for missing keywords
  const keywordScore = missingKeywords.length > 0 
    ? Math.max(0, 30 - (missingKeywords.length * 5))
    : 30;
  
  // Deduct for weak sections
  const sectionScore = Math.max(0, 40 - (weakSections.length * 8));
  
  // Deduct for formatting problems
  const formatScore = Math.max(0, 30 - (formattingProblems.length * 10));
  
  score = keywordScore + sectionScore + formatScore;
  
  return Math.round(score);
}

// Calculate readability score
function calculateReadability(text: string): ATSAnalysis['readability'] {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;
  
  // Simple readability score based on sentence length
  let score = 100;
  if (avgSentenceLength > 25) score -= 20;
  else if (avgSentenceLength > 20) score -= 10;
  else if (avgSentenceLength < 10) score -= 10;
  
  let level = 'Professional';
  if (avgSentenceLength > 25) level = 'Complex';
  else if (avgSentenceLength < 10) level = 'Simple';
  
  return {
    score: Math.max(0, score),
    level,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
  };
}

// Calculate resume health score
export function calculateHealthScore(resume: ResumeData, atsAnalysis: ATSAnalysis): ResumeHealthScore {
  const completeness = calculateSectionCompleteness(resume);
  
  const overall = Math.round(
    (atsAnalysis.score * 0.4) +
    (atsAnalysis.readability.score * 0.2) +
    (completeness.overall * 0.4)
  );
  
  return {
    overall,
    atsScore: atsAnalysis.score,
    readability: atsAnalysis.readability.score,
    professionalism: Math.round(completeness.profile * 100),
    keywordMatch: Math.round(atsAnalysis.score * 0.8),
    projectQuality: Math.round(completeness.projects * 100),
    experienceQuality: Math.round(completeness.experience * 100),
    sectionCompleteness: completeness.sections,
  };
}

// Calculate section completeness
function calculateSectionCompleteness(resume: ResumeData) {
  const sections: Record<string, number> = {};
  
  // Profile completeness
  let profileScore = 0;
  if (resume.profile.fullName) profileScore += 0.2;
  if (resume.profile.title) profileScore += 0.2;
  if (resume.profile.contact.email) profileScore += 0.2;
  if (resume.profile.contact.phone) profileScore += 0.2;
  if (resume.profile.summary && resume.profile.summary.length > 50) profileScore += 0.2;
  sections.profile = profileScore;
  
  // Experience completeness
  let experienceScore = 0;
  if (resume.experience.length > 0) {
    experienceScore += 0.3;
    const avgBulletPoints = resume.experience.reduce((sum, exp) => sum + exp.description.length, 0) / resume.experience.length;
    experienceScore += Math.min(0.4, avgBulletPoints / 5);
    const hasAchievements = resume.experience.some(exp => exp.achievements && exp.achievements.length > 0);
    if (hasAchievements) experienceScore += 0.3;
  }
  sections.experience = experienceScore;
  
  // Education completeness
  let educationScore = 0;
  if (resume.education.length > 0) {
    educationScore += 0.5;
    const hasDetails = resume.education.every(edu => edu.degree && edu.institution);
    if (hasDetails) educationScore += 0.5;
  }
  sections.education = educationScore;
  
  // Skills completeness
  let skillsScore = 0;
  if (resume.skills.length >= 5) skillsScore += 0.5;
  if (resume.skills.length >= 10) skillsScore += 0.5;
  sections.skills = skillsScore;
  
  // Projects completeness
  let projectsScore = 0;
  if (resume.projects.length > 0) {
    projectsScore += 0.5;
    const hasDetails = resume.projects.every(proj => proj.description && proj.technologies.length > 0);
    if (hasDetails) projectsScore += 0.5;
  }
  sections.projects = projectsScore;
  
  const overall = Object.values(sections).reduce((sum, score) => sum + score, 0) / Object.keys(sections).length;
  
  return {
    overall,
    sections,
  };
}
