import type { ResumeData, ATSAnalysis, ResumeHealthScore } from "./types";

// Comprehensive Technical & Domain Keyword Dictionary
const TECH_KEYWORDS = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "c", "golang", "go", "rust",
  "php", "ruby", "swift", "kotlin", "scala", "dart", "r", "matlab", "bash", "shell",
  
  // Frontend
  "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte", "html", "html5",
  "css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "redux", "zustand",
  "webpack", "vite", "responsive design", "ui/ux", "figma",
  
  // Backend & Frameworks
  "node.js", "express", "express.js", "spring", "spring boot", "django", "flask", "fastapi",
  "asp.net", ".net", "nest.js", "graphql", "rest api", "restful", "microservices", "grpc",
  
  // Databases & Caching
  "sql", "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "elasticsearch",
  "cassandra", "dynamodb", "oracle", "prisma", "hibernate", "firebase", "firestore",
  
  // Cloud & DevOps
  "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
  "ci/cd", "github actions", "jenkins", "terraform", "ansible", "linux", "nginx", "serverless",
  
  // Core CS & Methodologies
  "data structures", "algorithms", "dsa", "oop", "object oriented", "system design",
  "dbms", "operating systems", "computer networks", "agile", "scrum", "git", "github",
  "unit testing", "jest", "pytest", "debugging", "problem solving",
  
  // AI & Data
  "machine learning", "deep learning", "ai", "artificial intelligence", "nlp", "llm",
  "computer vision", "pandas", "numpy", "tensorflow", "pytorch", "data analysis",
];

const STRONG_ACTION_VERBS = [
  "developed", "implemented", "designed", "engineered", "architected", "built", "spearheaded",
  "optimized", "improved", "accelerated", "scaled", "reduced", "increased", "boosted",
  "achieved", "delivered", "launched", "executed", "collaborated", "automated", "created",
  "led", "managed", "streamlined", "orchestrated", "transformed", "integrated", "formulated"
];

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was",
  "one", "our", "out", "has", "have", "been", "this", "that", "with", "they", "from",
  "what", "which", "their", "will", "would", "about", "into", "than", "could", "should",
  "your", "them", "very", "also", "some", "more", "like", "just", "over", "such", "these",
  "must", "work", "team", "role", "years", "year", "looking", "needs", "need", "plus",
  "experience", "ability", "strong", "understanding", "knowledge", "working", "using",
  "requirements", "responsibilities", "qualifications", "preferred", "including",
]);

/**
 * Super Accurate ATS Analyzer
 */
export function analyzeATS(resume: ResumeData, jobDescription?: string): ATSAnalysis {
  const resumeText = extractResumeText(resume);
  const rawJobKeywords = jobDescription ? extractJobKeywords(jobDescription) : [];
  
  // Calculate keyword matches
  const keywordDensity: Record<string, number> = {};
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (rawJobKeywords.length > 0) {
    rawJobKeywords.forEach((kw) => {
      const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i");
      const isMatch = regex.test(resumeText);
      if (isMatch) {
        matchedKeywords.push(kw);
        keywordDensity[kw] = (keywordDensity[kw] || 0) + 1;
      } else {
        missingKeywords.push(kw);
      }
    });
  } else {
    // Check against standard technical dictionary
    TECH_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, "i");
      const isMatch = regex.test(resumeText);
      if (isMatch) {
        keywordDensity[kw] = 1;
      }
    });
  }

  // Identify weak sections & formatting issues
  const weakSections = identifyWeakSections(resume);
  const formattingProblems = checkFormatting(resume);
  const suggestions = generateSuggestions(resume, missingKeywords, weakSections, resumeText);
  const readability = calculateReadability(resumeText);

  // Score Calculation
  const score = calculateAccurateATSScore(
    resume,
    matchedKeywords.length,
    missingKeywords.length,
    rawJobKeywords.length,
    weakSections.length,
    formattingProblems.length,
    readability.score
  );

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

/**
 * Extract all searchable text from resume
 */
function extractResumeText(resume: ResumeData): string {
  const parts: string[] = [];

  parts.push(resume.profile.fullName || "");
  parts.push(resume.profile.title || "");
  parts.push(resume.profile.summary || "");
  parts.push(resume.profile.contact.location || "");

  resume.skills.forEach((s) => parts.push(s.name));

  resume.experience.forEach((exp) => {
    parts.push(exp.position);
    parts.push(exp.company);
    parts.push(exp.description.join(" "));
    if (exp.achievements) parts.push(exp.achievements.join(" "));
  });

  resume.education.forEach((edu) => {
    parts.push(edu.degree);
    parts.push(edu.field);
    parts.push(edu.institution);
  });

  resume.projects.forEach((proj) => {
    parts.push(proj.name);
    parts.push(proj.description);
    parts.push(proj.technologies.join(" "));
  });

  if (resume.certifications) {
    resume.certifications.forEach((c) => {
      parts.push(c.name);
      parts.push(c.issuer);
    });
  }

  if (resume.achievements) {
    resume.achievements.forEach((a) => {
      parts.push(a.title);
      parts.push(a.description);
    });
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Extract tech & domain keywords from job description
 */
export function extractJobKeywords(jobDescription: string): string[] {
  const normalized = jobDescription.toLowerCase();
  const found = new Set<string>();

  // 1. Check known technical multi-word & single-word dictionary
  TECH_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
    if (regex.test(normalized)) {
      found.add(keyword);
    }
  });

  // 2. Extract capitalized/acronym technical words from original text
  const tokens = jobDescription.match(/\b[A-Za-z0-9+#.-]{2,}\b/g) || [];
  tokens.forEach((t) => {
    const low = t.toLowerCase();
    if (low.length >= 3 && !STOPWORDS.has(low) && !/^\d+$/.test(low)) {
      if (TECH_KEYWORDS.includes(low)) {
        found.add(low);
      }
    }
  });

  return Array.from(found);
}

/**
 * Check Weak Sections
 */
function identifyWeakSections(resume: ResumeData): string[] {
  const weak: string[] = [];

  if (!resume.profile.summary || resume.profile.summary.length < 50) {
    weak.push("Professional summary is too short or missing (aim for 2–3 impactful lines)");
  }

  if (resume.skills.length < 5) {
    weak.push("Skills section has fewer than 5 skills (add your core technologies)");
  }

  if (resume.education.length === 0) {
    weak.push("No education entries listed");
  }

  if (resume.projects.length === 0 && resume.experience.length === 0) {
    weak.push("No projects or work experience listed");
  }

  if (resume.experience.length > 0) {
    resume.experience.forEach((exp, idx) => {
      if (exp.description.length < 2) {
        weak.push(`Experience #${idx + 1} (${exp.company || 'Role'}) has fewer than 2 bullet points`);
      }
    });
  }

  return weak;
}

/**
 * Check Formatting Problems
 */
function checkFormatting(resume: ResumeData): string[] {
  const problems: string[] = [];

  if (!resume.profile.contact.email) {
    problems.push("Email address is missing");
  }
  if (!resume.profile.contact.phone) {
    problems.push("Phone number is missing");
  }
  if (!resume.profile.contact.location) {
    problems.push("Location is missing");
  }
  if (!resume.profile.contact.linkedin && !resume.profile.contact.github) {
    problems.push("No LinkedIn or GitHub profile links included");
  }

  return problems;
}

/**
 * Generate Smart Actionable Suggestions
 */
function generateSuggestions(
  resume: ResumeData,
  missingKeywords: string[],
  weakSections: string[],
  resumeText: string
): string[] {
  const suggestions: string[] = [];

  if (missingKeywords.length > 0) {
    suggestions.push(`Add these target job keywords: ${missingKeywords.slice(0, 4).join(", ")}`);
  }

  // Check action verbs
  const hasActionVerb = STRONG_ACTION_VERBS.some((v) => resumeText.includes(v));
  if (!hasActionVerb) {
    suggestions.push("Start bullet points with strong action verbs (e.g. 'Engineered', 'Optimized', 'Scaled')");
  }

  // Check metrics
  const hasMetrics = /\b\d+%\b|\b\d+x\b|\b\d+\+\b|\b\$\d+/i.test(resumeText);
  if (!hasMetrics) {
    suggestions.push("Include measurable numbers/metrics (e.g. 'improved performance by 40%', 'served 10,000+ users')");
  }

  if (resume.skills.length < 8) {
    suggestions.push("Add 8–15 specific technical skills for better ATS keyword density");
  }

  if (!resume.profile.contact.github) {
    suggestions.push("Add your GitHub profile URL to showcase your code and repositories");
  }

  return suggestions;
}

/**
 * Calculate Accurate ATS Score (0 - 100)
 */
function calculateAccurateATSScore(
  resume: ResumeData,
  matchedCount: number,
  missingCount: number,
  totalJobKeywords: number,
  weakCount: number,
  formatProblemCount: number,
  readabilityScore: number
): number {
  let score = 50; // Base score

  // 1. Profile Completeness (max +20)
  if (resume.profile.fullName) score += 4;
  if (resume.profile.title) score += 4;
  if (resume.profile.contact.email) score += 4;
  if (resume.profile.contact.phone) score += 4;
  if (resume.profile.summary && resume.profile.summary.length >= 50) score += 4;

  // 2. Education & Skills (max +20)
  if (resume.education.length > 0) score += 8;
  if (resume.skills.length >= 5) score += 6;
  if (resume.skills.length >= 8) score += 6;

  // 3. Projects & Experience (max +20)
  if (resume.projects.length >= 1) score += 10;
  if (resume.projects.length >= 2 || resume.experience.length >= 1) score += 10;

  // 4. Job Keyword Match Adjustments
  if (totalJobKeywords > 0) {
    const matchRatio = matchedCount / totalJobKeywords;
    score = Math.round(score * 0.7 + matchRatio * 30);
  }

  // 5. Deductions for critical issues
  score -= formatProblemCount * 6;
  score -= weakCount * 4;

  // Clamp 0 - 100
  return Math.max(20, Math.min(100, Math.round(score)));
}

/**
 * Calculate Readability
 */
function calculateReadability(text: string): ATSAnalysis["readability"] {
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const avgSentenceLength = sentences > 0 ? words / sentences : 14;

  let score = 90;
  if (avgSentenceLength > 24) score -= 25;
  else if (avgSentenceLength > 18) score -= 10;

  let level = "Professional & Clear";
  if (avgSentenceLength > 24) level = "Complex";
  else if (avgSentenceLength < 8) level = "Very Simple";

  return {
    score: Math.max(30, Math.min(100, Math.round(score))),
    level,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
  };
}

/**
 * Health Score Calculation
 */
export function calculateHealthScore(resume: ResumeData, atsAnalysis: ATSAnalysis): ResumeHealthScore {
  const profileScore = Math.min(100, [
    resume.profile.fullName ? 25 : 0,
    resume.profile.title ? 20 : 0,
    resume.profile.contact.email ? 20 : 0,
    resume.profile.contact.phone ? 15 : 0,
    resume.profile.summary ? 20 : 0,
  ].reduce((a, b) => a + b, 0));

  const expScore = resume.experience.length > 0 ? 90 : resume.projects.length > 0 ? 80 : 30;
  const projScore = resume.projects.length >= 2 ? 95 : resume.projects.length === 1 ? 80 : 20;
  const keywordScore = atsAnalysis.score >= 80 ? 95 : atsAnalysis.score >= 60 ? 75 : 50;

  return {
    overall: atsAnalysis.score,
    atsScore: atsAnalysis.score,
    readability: atsAnalysis.readability.score,
    professionalism: profileScore,
    keywordMatch: keywordScore,
    projectQuality: projScore,
    experienceQuality: expScore,
    sectionCompleteness: {
      profile: profileScore / 100,
      skills: Math.min(1, resume.skills.length / 8),
      experience: expScore / 100,
      education: resume.education.length > 0 ? 1 : 0,
      projects: projScore / 100,
    },
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
