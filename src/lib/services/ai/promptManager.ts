/**
 * Prompt Management System
 * Centralized prompt templates for all AI features
 */

import type { AIPromptTemplate, AIFeatureType } from "@/types/ai";

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const PROMPT_TEMPLATES: Record<AIFeatureType, AIPromptTemplate> = {
  // ============================================================================
  // RESUME ANALYSIS
  // ============================================================================
  resume_analysis: {
    id: "resume_analysis_v1",
    name: "Resume Analysis",
    featureType: "resume_analysis",
    template: `You are an expert career coach and ATS (Applicant Tracking System) specialist. Analyze the following resume and provide comprehensive feedback.

RESUME CONTENT:
{{resumeContent}}

JOB DESCRIPTION (if provided):
{{jobDescription}}

ANALYSIS REQUIREMENTS:
1. Overall Resume Score (0-100)
2. Strengths (list 3-5 key strengths)
3. Weaknesses (list 3-5 areas for improvement)
4. ATS Compatibility Analysis
5. Keyword Optimization Suggestions
6. Format and Structure Feedback
7. Content Quality Assessment
8. Specific Recommendations for Improvement

Please provide your analysis in the following JSON format:
{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "atsCompatibility": {
    "score": number,
    "issues": string[],
    "recommendations": string[]
  },
  "keywordOptimization": {
    "missingKeywords": string[],
    "suggestedKeywords": string[]
  },
  "formatFeedback": {
    "score": number,
    "issues": string[],
    "recommendations": string[]
  },
  "contentQuality": {
    "score": number,
    "issues": string[],
    "recommendations": string[]
  },
  "overallRecommendations": string[]
}`,
    variables: ["resumeContent", "jobDescription"],
    systemInstruction:
      "You are an expert career coach and ATS specialist with deep knowledge of recruitment processes, resume best practices, and how ATS systems work. Provide objective, actionable feedback.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // ATS EVALUATION
  // ============================================================================
  ats_evaluation: {
    id: "ats_evaluation_v1",
    name: "ATS Evaluation",
    featureType: "ats_evaluation",
    template: `You are an ATS (Applicant Tracking System) simulator. Evaluate how well the resume matches the job description.

RESUME:
{{resumeContent}}

JOB DESCRIPTION:
{{jobDescription}}

EVALUATION CRITERIA:
1. Keyword Match Score (0-100)
2. Skills Match Analysis
3. Experience Alignment
4. Education Requirements
5. Certification Match
6. Overall ATS Score (0-100)

Provide your evaluation in this JSON format:
{
  "keywordMatchScore": number,
  "skillsMatch": {
    "matchedSkills": string[],
    "missingSkills": string[],
    "partialMatches": string[]
  },
  "experienceAlignment": {
    "score": number,
    "alignment": string,
    "gaps": string[]
  },
  "educationMatch": {
    "meetsRequirements": boolean,
    "details": string
  },
  "certificationMatch": {
    "matched": string[],
    "missing": string[]
  },
  "overallATSScore": number,
  "recommendations": string[]
}`,
    variables: ["resumeContent", "jobDescription"],
    systemInstruction:
      "You are an ATS system simulator. Evaluate resumes objectively based on keyword matching, skills alignment, and job requirements. Provide scores and specific feedback.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // INTERVIEW PREPARATION
  // ============================================================================
  interview_preparation: {
    id: "interview_preparation_v1",
    name: "Interview Preparation",
    featureType: "interview_preparation",
    template: `You are an expert interview coach. Help prepare the candidate for an interview.

CANDIDATE PROFILE:
{{candidateProfile}}

TARGET JOB/ROLE:
{{targetRole}}

COMPANY (if provided):
{{company}}

INTERVIEW TYPE:
{{interviewType}}

PREPARATION REQUIREMENTS:
1. Likely Interview Questions (10-15 questions)
2. Key Topics to Focus On
3. Questions to Ask the Interviewer
4. Common Pitfalls to Avoid
5. Success Tips
6. Mock Interview Scenarios

Provide preparation guide in this JSON format:
{
  "likelyQuestions": [
    {
      "question": string,
      "category": string,
      "tips": string[]
    }
  ],
  "keyTopics": string[],
  "questionsToAsk": string[],
  "pitfalls": string[],
  "successTips": string[],
  "mockScenarios": [
    {
      "scenario": string,
      "approach": string
    }
  ]
}`,
    variables: ["candidateProfile", "targetRole", "company", "interviewType"],
    systemInstruction:
      "You are an expert interview coach with experience across various industries and interview formats. Provide practical, actionable advice.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // SKILL GAP ANALYSIS
  // ============================================================================
  skill_gap_analysis: {
    id: "skill_gap_analysis_v1",
    name: "Skill Gap Analysis",
    featureType: "skill_gap_analysis",
    template: `You are a career development expert. Analyze the skill gaps between the candidate's current skills and their target role.

CURRENT SKILLS:
{{currentSkills}}

TARGET ROLE:
{{targetRole}}

CAREER GOALS:
{{careerGoals}}

ANALYSIS REQUIREMENTS:
1. Missing Skills
2. Skills to Improve
3. Recommended Learning Resources
4. Learning Priority Order
5. Estimated Time to Bridge Gaps
6. Alternative Career Paths

Provide analysis in this JSON format:
{
  "missingSkills": [
    {
      "skill": string,
      "importance": "high" | "medium" | "low",
      "category": string
    }
  ],
  "skillsToImprove": [
    {
      "skill": string,
      "currentLevel": string,
      "targetLevel": string,
      "gap": string
    }
  ],
  "learningResources": [
    {
      "skill": string,
      "resources": string[],
      "estimatedTime": string
    }
  ],
  "learningPriority": string[],
  "estimatedTimeToBridge": string,
  "alternativePaths": string[]
}`,
    variables: ["currentSkills", "targetRole", "careerGoals"],
    systemInstruction:
      "You are a career development expert with knowledge of industry requirements and learning paths. Provide realistic and actionable skill gap analysis.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // CAREER RECOMMENDATION
  // ============================================================================
  career_recommendation: {
    id: "career_recommendation_v1",
    name: "Career Recommendation",
    featureType: "career_recommendation",
    template: `You are a career advisor. Provide personalized career recommendations based on the candidate's profile.

CANDIDATE PROFILE:
{{candidateProfile}}

SKILLS:
{{skills}}

EXPERIENCE:
{{experience}}

INTERESTS:
{{interests}}

CAREER GOALS:
{{careerGoals}}

RECOMMENDATION REQUIREMENTS:
1. Suitable Career Paths
2. Role Recommendations
3. Industry Suggestions
4. Company Type Recommendations
5. Next Steps
6. Market Demand Analysis

Provide recommendations in this JSON format:
{
  "careerPaths": [
    {
      "path": string,
      "matchScore": number,
      "reasoning": string
    }
  ],
  "roleRecommendations": [
    {
      "role": string,
      "matchScore": number,
      "requirements": string[],
      "growthPotential": string
    }
  ],
  "industrySuggestions": [
    {
      "industry": string,
      "fit": string,
      "outlook": string
    }
  ],
  "companyTypes": string[],
  "nextSteps": string[],
  "marketDemand": {
    "overall": string,
    "trends": string[]
  }
}`,
    variables: [
      "candidateProfile",
      "skills",
      "experience",
      "interests",
      "careerGoals",
    ],
    systemInstruction:
      "You are a career advisor with deep knowledge of job markets, industry trends, and career paths. Provide personalized, data-driven recommendations.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // LEARNING ROADMAP
  // ============================================================================
  learning_roadmap: {
    id: "learning_roadmap_v1",
    name: "Learning Roadmap",
    featureType: "learning_roadmap",
    template: `You are a learning path expert. Create a personalized learning roadmap for the candidate.

TARGET SKILL/ROLE:
{{targetSkill}}

CURRENT LEVEL:
{{currentLevel}}

TIME COMMITMENT:
{{timeCommitment}}

LEARNING STYLE:
{{learningStyle}}

ROADMAP REQUIREMENTS:
1. Learning Phases
2. Specific Topics per Phase
3. Recommended Resources
4. Practice Projects
5. Milestones
6. Estimated Timeline

Provide roadmap in this JSON format:
{
  "phases": [
    {
      "phase": number,
      "title": string,
      "duration": string,
      "topics": string[],
      "resources": string[],
      "projects": string[],
      "milestones": string[]
    }
  ],
  "totalEstimatedTime": string,
  "prerequisites": string[],
  "successMetrics": string[],
  "tips": string[]
}`,
    variables: [
      "targetSkill",
      "currentLevel",
      "timeCommitment",
      "learningStyle",
    ],
    systemInstruction:
      "You are a learning path expert who creates structured, achievable learning plans. Break down complex skills into manageable phases.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // COVER LETTER
  // ============================================================================
  cover_letter: {
    id: "cover_letter_v1",
    name: "Cover Letter Generator",
    featureType: "cover_letter",
    template: `You are an expert cover letter writer. Create a compelling cover letter for the job application.

CANDIDATE PROFILE:
{{candidateProfile}}

JOB DESCRIPTION:
{{jobDescription}}

COMPANY:
{{company}}

KEY HIGHLIGHTS:
{{keyHighlights}}

COVER LETTER REQUIREMENTS:
1. Professional tone
2. Tailored to the specific role
3. Highlight relevant experience
4. Show enthusiasm
5. Include call to action

Provide cover letter in this JSON format:
{
  "coverLetter": string,
  "wordCount": number,
  "tips": string[],
  "alternativeOpenings": string[]
}`,
    variables: [
      "candidateProfile",
      "jobDescription",
      "company",
      "keyHighlights",
    ],
    systemInstruction:
      "You are an expert cover letter writer who creates personalized, compelling cover letters that stand out.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // RESUME GENERATOR
  // ============================================================================
  resume_generator: {
    id: "resume_generator_v1",
    name: "Resume Generator",
    featureType: "resume_generator",
    template: `You are an expert resume writer. Create a professional resume based on the provided information.

CANDIDATE INFORMATION:
{{candidateInfo}}

TARGET ROLE:
{{targetRole}}

EXPERIENCE:
{{experience}}

EDUCATION:
{{education}}

SKILLS:
{{skills}}

RESUME REQUIREMENTS:
1. Professional summary
2. Work experience with achievements
3. Education section
4. Skills section
5. Appropriate formatting

Provide resume in this JSON format:
{
  "resume": {
    "summary": string,
    "experience": [
      {
        "title": string,
        "company": string,
        "dates": string,
        "achievements": string[]
      }
    ],
    "education": [
      {
        "degree": string,
        "institution": string,
        "dates": string,
        "details": string
      }
    ],
    "skills": string[]
  },
  "tips": string[],
  "atsOptimization": string[]
}`,
    variables: [
      "candidateInfo",
      "targetRole",
      "experience",
      "education",
      "skills",
    ],
    systemInstruction:
      "You are an expert resume writer who creates ATS-friendly, professional resumes that highlight achievements and qualifications.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // PORTFOLIO REVIEW
  // ============================================================================
  portfolio_review: {
    id: "portfolio_review_v1",
    name: "Portfolio Review",
    featureType: "portfolio_review",
    template: `You are a portfolio expert. Review the portfolio and provide constructive feedback.

PORTFOLIO CONTENT:
{{portfolioContent}}

TARGET AUDIENCE:
{{targetAudience}}

GOAL:
{{goal}}

REVIEW REQUIREMENTS:
1. Overall Assessment
2. Strengths
3. Areas for Improvement
4. Project Quality
5. Presentation
6. Recommendations

Provide review in this JSON format:
{
  "overallScore": number,
  "strengths": string[],
  "improvements": string[],
  "projectQuality": {
    "score": number,
    "feedback": string
  },
  "presentation": {
    "score": number,
    "feedback": string
  },
  "recommendations": string[]
}`,
    variables: ["portfolioContent", "targetAudience", "goal"],
    systemInstruction:
      "You are a portfolio expert with experience in reviewing creative and technical portfolios. Provide constructive, actionable feedback.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // COMPANY MATCH
  // ============================================================================
  company_match: {
    id: "company_match_v1",
    name: "Company Match",
    featureType: "company_match",
    template: `You are a career matching expert. Analyze how well the candidate matches with target companies.

CANDIDATE PROFILE:
{{candidateProfile}}

SKILLS:
{{skills}}

TARGET COMPANIES:
{{targetCompanies}}

PREFERENCES:
{{preferences}}

MATCHING REQUIREMENTS:
1. Company Match Scores
2. Culture Fit Analysis
3. Growth Opportunities
4. Role Alignment
5. Recommendations

Provide analysis in this JSON format:
{
  "companyMatches": [
    {
      "company": string,
      "matchScore": number,
      "cultureFit": string,
      "growthOpportunities": string,
      "roleAlignment": string,
      "recommendations": string[]
    }
  ],
  "overallInsights": string[],
  "nextSteps": string[]
}`,
    variables: ["candidateProfile", "skills", "targetCompanies", "preferences"],
    systemInstruction:
      "You are a career matching expert who analyzes candidate-company fit based on skills, culture, and career goals.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // CAREER SCORE
  // ============================================================================
  career_score: {
    id: "career_score_v1",
    name: "Career Score Calculation",
    featureType: "career_score",
    template: `You are an expert career analyst. Calculate a comprehensive career score based on the user's profile data.

USER PROFILE:
Skills: {{skills}}
Projects: {{projects}}
Experience: {{experience}}
Education: {{education}}
Coding Stats: {{codingStats}}
Achievements: {{achievements}}

SCORE CALCULATION REQUIREMENTS:
1. Overall Career Score (0-100)
2. ATS Score (0-100)
3. Skill Score (0-100)
4. Resume Readiness (0-100)
5. Interview Readiness (0-100)
6. Project Quality (0-100)
7. GitHub Strength (0-100)
8. Coding Progress (0-100)
9. Learning Progress (0-100)
10. Overall Employability Score (0-100)

Provide your analysis in this JSON format:
{
  "overall": number,
  "atsScore": number,
  "skillScore": number,
  "resumeReadiness": number,
  "interviewReadiness": number,
  "projectQuality": number,
  "githubStrength": number,
  "codingProgress": number,
  "learningProgress": number,
  "employability": number
}`,
    variables: ["skills", "projects", "experience", "education", "codingStats", "achievements"],
    systemInstruction: "You are an expert career analyst who evaluates profiles based on industry standards and hiring criteria.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // PROJECT REVIEW
  // ============================================================================
  project_review: {
    id: "project_review_v1",
    name: "Project Review",
    featureType: "project_review",
    template: `You are an expert technical recruiter and software engineer. Review the following project for portfolio quality.

PROJECT DETAILS:
{{project}}

EVALUATION CRITERIA:
1. Technical Complexity (0-100)
2. Documentation Quality (0-100)
3. Technology Stack Appropriateness (0-100)
4. Code Readability (0-100)
5. Portfolio Value (0-100)
6. Recruiter Appeal (0-100)

Provide your review in this JSON format:
{
  "complexity": number,
  "documentation": number,
  "technologies": number,
  "readability": number,
  "portfolioValue": number,
  "recruiterAppeal": number,
  "overallScore": number,
  "improvements": string[]
}`,
    variables: ["project"],
    systemInstruction: "You are an expert technical recruiter who evaluates projects based on industry standards and hiring criteria.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // LEARNING RECOMMENDATIONS
  // ============================================================================
  learning_recommendations: {
    id: "learning_recommendations_v1",
    name: "Learning Recommendations",
    featureType: "learning_recommendations",
    template: `You are an expert career coach and learning strategist. Provide personalized learning recommendations based on the user's skill gaps.

CURRENT SKILLS:
{{currentSkills}}

MISSING SKILLS:
{{missingSkills}}

TARGET ROLE:
{{targetRole}}

RECOMMENDATION REQUIREMENTS:
Provide a mix of:
1. Online courses
2. Documentation
3. Practice platforms
4. Open-source projects
5. Coding challenges
6. Books
7. Video tutorials

Each recommendation should include:
- Type
- Title
- Description
- URL (if applicable)
- Difficulty level
- Estimated time
- Priority

Provide recommendations in this JSON format:
[
  {
    "type": "course" | "documentation" | "practice" | "opensource" | "challenge" | "book" | "video",
    "title": string,
    "description": string,
    "url": string,
    "difficulty": "beginner" | "intermediate" | "advanced",
    "estimatedTime": string,
    "priority": "high" | "medium" | "low"
  }
]`,
    variables: ["currentSkills", "missingSkills", "targetRole"],
    systemInstruction: "You are an expert career coach who provides personalized learning recommendations based on skill gaps and career goals.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // CAREER TWIN
  // ============================================================================
  career_twin: {
    id: "career_twin_v1",
    name: "Career Twin AI Mentor",
    featureType: "career_twin",
    template: `You are the candidate's career twin - an AI mentor that understands their career aspirations, challenges, and provides personalized guidance.

CANDIDENT PROFILE:
{{candidateProfile}}

CAREER HISTORY:
{{careerHistory}}

CURRENT CHALLENGE:
{{currentChallenge}}

CAREER GOALS:
{{careerGoals}}

MENTORSHIP REQUIREMENTS:
1. Empathetic understanding
2. Personalized advice
3. Actionable steps
4. Encouragement
5. Strategic thinking

Provide mentorship in this JSON format:
{
  "understanding": string,
  "advice": string[],
  "actionSteps": [
    {
      "step": string,
      "priority": "high" | "medium" | "low",
      "timeline": string
    }
  ],
  "encouragement": string,
  "strategicInsights": string[]
}`,
    variables: [
      "candidateProfile",
      "careerHistory",
      "currentChallenge",
      "careerGoals",
    ],
    systemInstruction:
      "You are a supportive, knowledgeable career mentor who provides personalized guidance based on deep understanding of the candidate's situation.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ============================================================================
  // GENERAL CHAT
  // ============================================================================
  general_chat: {
    id: "general_chat_v1",
    name: "General Career Chat",
    featureType: "general_chat",
    template: `You are a helpful career assistant. Answer the user's question or provide guidance on their career-related query.

USER QUERY:
{{userQuery}}

CONTEXT:
{{context}}

Provide a helpful, informative response in this JSON format:
{
  "response": string,
  "suggestions": string[],
  "relatedTopics": string[]
}`,
    variables: ["userQuery", "context"],
    systemInstruction:
      "You are a helpful career assistant with knowledge across various career topics, job search strategies, and professional development.",
    version: "1.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ============================================================================
// PROMPT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get prompt template by feature type
 */
export function getPromptTemplate(
  featureType: AIFeatureType,
): AIPromptTemplate | undefined {
  return PROMPT_TEMPLATES[featureType];
}

/**
 * Get all prompt templates
 */
export function getAllPromptTemplates(): AIPromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES);
}

/**
 * Get prompt template by ID
 */
export function getPromptTemplateById(
  id: string,
): AIPromptTemplate | undefined {
  return Object.values(PROMPT_TEMPLATES).find((template) => template.id === id);
}

/**
 * Add or update a prompt template
 */
export function upsertPromptTemplate(template: AIPromptTemplate): void {
  PROMPT_TEMPLATES[template.featureType] = template;
}

/**
 * Remove a prompt template
 */
export function removePromptTemplate(featureType: AIFeatureType): boolean {
  if (PROMPT_TEMPLATES[featureType]) {
    delete PROMPT_TEMPLATES[featureType];
    return true;
  }
  return false;
}

/**
 * Validate prompt template variables
 */
export function validateTemplateVariables(
  featureType: AIFeatureType,
  providedContext: Record<string, any>,
): { valid: boolean; missing: string[] } {
  const template = getPromptTemplate(featureType);
  if (!template) {
    return { valid: false, missing: [] };
  }

  const missing = template.variables.filter(
    (variable) => !(variable in providedContext),
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
