/**
 * SkillVerse Knowledge Base
 * Contains structured information about all SkillVerse features for the AI assistant
 */

export interface KnowledgeBaseItem {
  id: string;
  category: string;
  title: string;
  description: string;
  keyFeatures: string[];
  howToUse: string[];
  relatedFeatures: string[];
  keywords: string[];
}

export const skillVerseKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: "authentication",
    category: "Core",
    title: "Authentication",
    description: "Secure login system supporting email, Google, and GitHub authentication with session management.",
    keyFeatures: [
      "Email/password login",
      "Google OAuth",
      "GitHub OAuth",
      "Session persistence",
      "Email verification",
      "Password reset"
    ],
    howToUse: [
      "Click 'Sign In' on the homepage",
      "Choose your preferred authentication method",
      "Complete the authentication flow",
      "Verify your email if required"
    ],
    relatedFeatures: ["profile-setup", "identity-hub", "dashboard"],
    keywords: ["login", "signup", "sign in", "auth", "authentication", "oauth", "google", "github"]
  },
  {
    id: "dashboard",
    category: "Core",
    title: "Dashboard",
    description: "Main hub displaying your profile completion, career score, recent activity, and quick access to all features.",
    keyFeatures: [
      "Profile completion percentage",
      "Career score overview",
      "Recent activity feed",
      "Quick action buttons",
      "Achievement widgets",
      "GitHub/LeetCode stats"
    ],
    howToUse: [
      "Log in to access your dashboard",
      "View your profile completion status",
      "Access quick actions from the dashboard",
      "Monitor your career progress"
    ],
    relatedFeatures: ["identity-hub", "career-score", "achievements"],
    keywords: ["dashboard", "home", "main page", "overview", "stats"]
  },
  {
    id: "identity-hub",
    category: "Profile",
    title: "Identity Hub",
    description: "Central profile management system for Skills, Achievements, Projects, and Career Timeline.",
    keyFeatures: [
      "Skills management",
      "Achievement tracking",
      "Project showcase",
      "Career timeline",
      "Profile analytics",
      "Achievement badges"
    ],
    howToUse: [
      "Navigate to Identity Hub from dashboard",
      "Add your skills and achievements",
      "Showcase your projects",
      "Track your career milestones"
    ],
    relatedFeatures: ["skills", "projects", "achievements", "profile-completion"],
    keywords: ["identity hub", "profile", "skills", "achievements", "projects", "timeline"]
  },
  {
    id: "resume-analyzer",
    category: "AI Tools",
    title: "Resume Analyzer",
    description: "AI-powered resume analysis that provides feedback on content, formatting, and optimization.",
    keyFeatures: [
      "Content analysis",
      "Format checking",
      "Keyword optimization",
      "ATS compatibility",
      "Improvement suggestions",
      "Score generation"
    ],
    howToUse: [
      "Upload your resume",
      "AI analyzes content and format",
      "Receive optimization suggestions",
      "Improve your resume based on feedback"
    ],
    relatedFeatures: ["ats-score", "ai-resume", "career-score"],
    keywords: ["resume", "analyzer", "analysis", "cv", "resume analysis"]
  },
  {
    id: "ats-score",
    category: "AI Tools",
    title: "ATS Score",
    description: "Measures how well your resume performs against Applicant Tracking Systems used by recruiters.",
    keyFeatures: [
      "ATS compatibility check",
      "Keyword matching",
      "Format validation",
      "Score calculation",
      "Improvement tips",
      "Industry benchmarks"
    ],
    howToUse: [
      "Upload your resume",
      "Get your ATS score",
      "See improvement suggestions",
      "Optimize for better ATS performance"
    ],
    relatedFeatures: ["resume-analyzer", "ai-resume", "recruiter-view"],
    keywords: ["ats", "applicant tracking system", "score", "ats score", "recruiter"]
  },
  {
    id: "career-score",
    category: "Analytics",
    title: "Career Score",
    description: "Overall metric measuring your career readiness based on skills, projects, achievements, and profile completeness.",
    keyFeatures: [
      "Overall career readiness",
      "Skills assessment",
      "Project evaluation",
      "Achievement tracking",
      "Profile completeness",
      "Progress tracking"
    ],
    howToUse: [
      "View your career score on dashboard",
      "See breakdown by category",
      "Follow improvement suggestions",
      "Track your progress over time"
    ],
    relatedFeatures: ["dashboard", "identity-hub", "skills"],
    keywords: ["career score", "readiness", "overall score", "progress"]
  },
  {
    id: "portfolio",
    category: "Profile",
    title: "Portfolio",
    description: "AI-powered portfolio generator and editor for showcasing your projects and skills professionally.",
    keyFeatures: [
      "AI portfolio generation",
      "Custom themes",
      "Project showcase",
      "Skills display",
      "Public sharing",
      "QR code generation"
    ],
    howToUse: [
      "Navigate to Portfolio section",
      "Use AI to generate portfolio",
      "Customize theme and content",
      "Share your public portfolio link"
    ],
    relatedFeatures: ["portfolio-editor", "public-profile", "exports"],
    keywords: ["portfolio", "showcase", "projects", "public profile", "sharing"]
  },
  {
    id: "public-profile",
    category: "Profile",
    title: "Public Profile",
    description: "Shareable profile page that recruiters can view with your skills, projects, and achievements.",
    keyFeatures: [
      "Public URL",
      "Recruiter-friendly view",
      "Skills showcase",
      "Project display",
      "Achievement badges",
      "Contact information"
    ],
    howToUse: [
      "Complete your profile setup",
      "Enable public profile visibility",
      "Share your profile URL",
      "Customize what information is visible"
    ],
    relatedFeatures: ["portfolio", "recruiter-view", "identity-hub"],
    keywords: ["public profile", "shareable", "recruiter", "url", "link"]
  },
  {
    id: "recruiter-view",
    category: "Profile",
    title: "Recruiter View",
    description: "Optimized profile view designed specifically for recruiters and hiring managers.",
    keyFeatures: [
      "Recruiter-focused layout",
      "Key highlights first",
      "Contact information",
      "Skills summary",
      "Project showcase",
      "Quick resume access"
    ],
    howToUse: [
      "Enable recruiter view in settings",
      "Preview how recruiters see your profile",
      "Optimize content for recruiters",
      "Share recruiter-friendly URL"
    ],
    relatedFeatures: ["public-profile", "ats-score", "resume-analyzer"],
    keywords: ["recruiter", "hiring", "recruiter view", "employer"]
  },
  {
    id: "interview-coach",
    category: "AI Tools",
    title: "Interview Coach",
    description: "AI-powered interview preparation tool with mock interviews and personalized feedback.",
    keyFeatures: [
      "Mock interviews",
      "Question bank",
      "Real-time feedback",
      "Performance analysis",
      "Topic-specific preparation",
      "Progress tracking"
    ],
    howToUse: [
      "Select interview topic",
      "Start mock interview session",
      "Answer AI-generated questions",
      "Receive feedback and improvement tips"
    ],
    relatedFeatures: ["mock-interview", "career-roadmap", "ai-interview"],
    keywords: ["interview", "coach", "preparation", "mock interview", "practice"]
  },
  {
    id: "mock-interview",
    category: "AI Tools",
    title: "Mock Interview",
    description: "Simulated interview experience with realistic questions and AI evaluation.",
    keyFeatures: [
      "Realistic questions",
      "Time-limited responses",
      "AI evaluation",
      "Performance scoring",
      "Weakness identification",
      "Improvement suggestions"
    ],
    howToUse: [
      "Choose interview type",
      "Set difficulty level",
      "Answer questions within time limit",
      "Get AI feedback on your performance"
    ],
    relatedFeatures: ["interview-coach", "ai-interview", "career-roadmap"],
    keywords: ["mock interview", "practice", "simulation", "ai interview"]
  },
  {
    id: "career-roadmap",
    category: "AI Tools",
    title: "Career Roadmap",
    description: "AI-generated personalized career development roadmap based on your profile and goals.",
    keyFeatures: [
      "Personalized roadmap",
      "Skill recommendations",
      "Project suggestions",
      "Timeline planning",
      "Goal tracking",
      "Progress monitoring"
    ],
    howToUse: [
      "Input your career goals",
      "AI analyzes your profile",
      "Receive personalized roadmap",
      "Follow the suggested learning path"
    ],
    relatedFeatures: ["learning-roadmap", "ai-career", "skills"],
    keywords: ["roadmap", "career path", "learning path", "goals", "planning"]
  },
  {
    id: "company-match",
    category: "AI Tools",
    title: "Company Match",
    description: "AI-powered company recommendation system based on your skills, experience, and preferences.",
    keyFeatures: [
      "Company recommendations",
      "Skill matching",
      "Culture fit analysis",
      "Salary estimates",
      "Application tracking",
      "Company insights"
    ],
    howToUse: [
      "Set your job preferences",
      "AI matches you with companies",
      "View match scores and reasons",
      "Track application progress"
    ],
    relatedFeatures: ["ai-career", "career-roadmap", "skills"],
    keywords: ["company match", "job match", "recommendations", "companies", "jobs"]
  },
  {
    id: "analytics",
    category: "Analytics",
    title: "Analytics",
    description: "Comprehensive analytics showing profile views, engagement, and career progress metrics.",
    keyFeatures: [
      "Profile views",
      "Engagement metrics",
      "Career progress",
      "Skill development",
      "Achievement tracking",
      "Time-based analysis"
    ],
    howToUse: [
      "Navigate to Analytics section",
      "View your profile performance",
      "Track engagement over time",
      "Monitor career progress"
    ],
    relatedFeatures: ["dashboard", "career-score", "identity-hub"],
    keywords: ["analytics", "stats", "metrics", "views", "engagement"]
  },
  {
    id: "privacy",
    category: "Settings",
    title: "Privacy Settings",
    description: "Control your data visibility, profile sharing preferences, and privacy settings.",
    keyFeatures: [
      "Profile visibility",
      "Data sharing controls",
      "Privacy preferences",
      "Account security",
      "Session management",
      "Data export"
    ],
    howToUse: [
      "Go to Settings",
      "Navigate to Privacy section",
      "Adjust your privacy preferences",
      "Control what information is visible"
    ],
    relatedFeatures: ["public-profile", "recruiter-view", "account-settings"],
    keywords: ["privacy", "settings", "visibility", "data", "security"]
  },
  {
    id: "exports",
    category: "Tools",
    title: "Exports",
    description: "Export your profile, resume, and portfolio in various formats for sharing and applications.",
    keyFeatures: [
      "PDF export",
      "Resume download",
      "Portfolio export",
      "Data export",
      "Multiple formats",
      "Custom branding"
    ],
    howToUse: [
      "Navigate to Exports section",
      "Select what to export",
      "Choose your preferred format",
      "Download or share your export"
    ],
    relatedFeatures: ["portfolio", "resume-analyzer", "public-profile"],
    keywords: ["export", "download", "pdf", "save", "share"]
  },
  {
    id: "github-integration",
    category: "Integrations",
    title: "GitHub Integration",
    description: "Connect your GitHub account to showcase your repositories and coding activity.",
    keyFeatures: [
      "Repository showcase",
      "Commit activity",
      "Languages used",
      "Contributions graph",
      "Profile completion boost",
      "Skill verification"
    ],
    howToUse: [
      "Go to Profile Settings",
      "Select Social Links",
      "Connect your GitHub account",
      "Authorize SkillVerse to access your data"
    ],
    relatedFeatures: ["identity-hub", "career-score", "skills"],
    keywords: ["github", "integration", "connect", "repositories", "coding"]
  },
  {
    id: "leetcode-integration",
    category: "Integrations",
    title: "LeetCode Integration",
    description: "Connect your LeetCode account to showcase your problem-solving skills and contest performance.",
    keyFeatures: [
      "Problem statistics",
      "Contest ranking",
      "Solved problems",
      "Skill badges",
      "Profile completion boost",
      "DSA verification"
    ],
    howToUse: [
      "Go to Profile Settings",
      "Select Social Links",
      "Connect your LeetCode account",
      "Authorize SkillVerse to access your data"
    ],
    relatedFeatures: ["identity-hub", "career-score", "skills"],
    keywords: ["leetcode", "integration", "connect", "dsa", "problems"]
  }
];

export function searchKnowledgeBase(query: string): KnowledgeBaseItem[] {
  const lowerQuery = query.toLowerCase();
  return skillVerseKnowledgeBase.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
    item.keyFeatures.some(feature => feature.toLowerCase().includes(lowerQuery))
  );
}

export function getFeatureById(id: string): KnowledgeBaseItem | undefined {
  return skillVerseKnowledgeBase.find(item => item.id === id);
}

export function getFeaturesByCategory(category: string): KnowledgeBaseItem[] {
  return skillVerseKnowledgeBase.filter(item => item.category === category);
}