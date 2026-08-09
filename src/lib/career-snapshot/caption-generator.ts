import type { StoryType, UserRealData, StatItem, Achievement } from "./achievement-engine";

export type CaptionTone =
  | "professional"
  | "personal"
  | "technical"
  | "achievement"
  | "humble";

export type CaptionLength = "short" | "medium" | "detailed";

export interface CaptionOptions {
  storyType: StoryType;
  achievement?: Achievement;
  tone: CaptionTone;
  length: CaptionLength;
  selectedStats: StatItem[];
  includeProfileLink: boolean;
  publicProfileUrl?: string;
  data: UserRealData;
}

export function generateLinkedInCaption(opts: CaptionOptions): {
  captionText: string;
  hashtags: string[];
} {
  const { storyType, achievement, tone, length, selectedStats, includeProfileLink, publicProfileUrl, data } = opts;

  const name = data.name || "Developer";
  const headline = data.headline || "Software Developer";
  const primarySkill = data.skills[0] || "Software Engineering";
  const topSkills = data.skills.slice(0, 3).join(", ");
  const totalDsa = data.solvedDsaCount + data.leetcodeSolved + data.gfgSolved;

  // 1. Generate core opening hook based on Story Type & Tone
  let opening = "";
  let body = "";
  let closing = "";

  // Dynamic Opening Hooks
  switch (storyType) {
    case "achievement":
      if (tone === "humble") {
        opening = `Grateful for the journey so far. I recently crossed a meaningful milestone: ${achievement?.title || `${totalDsa}+ coding problems solved`}.`;
      } else if (tone === "technical") {
        opening = `Sharpening algorithmic thinking and problem-solving depth — excited to have completed ${achievement?.title || `${totalDsa}+ problems`}.`;
      } else if (tone === "personal") {
        opening = `Consistency over intensity. When I started coding, solving complex algorithms felt daunting. Today, I crossed ${achievement?.title || `${totalDsa}+ solved problems`}.`;
      } else {
        opening = `Milestone achieved: ${achievement?.title || `${totalDsa}+ verified DSA problems solved`}. Focused on continuous algorithmic improvement and clean architecture.`;
      }
      break;

    case "progress":
      if (tone === "humble") {
        opening = `Small daily efforts compound over time. Staying disciplined with a ${data.codingStreak > 0 ? `${data.codingStreak}-day coding streak` : "daily coding routine"}.`;
      } else if (tone === "technical") {
        opening = `Maintaining steady momentum across full-stack development and data structures. Currently at a ${data.codingStreak > 0 ? `${data.codingStreak}-day streak` : "consistent daily cadence"}.`;
      } else {
        opening = `Showing up consistently every single day. Progress isn't about giant leaps; it's about solving, building, and learning daily.`;
      }
      break;

    case "project":
      if (tone === "technical") {
        opening = `Shipped new code and architectural updates across my projects. Building with ${topSkills || "modern full-stack tools"}.`;
      } else if (tone === "personal") {
        opening = `Building things from scratch is one of the most rewarding parts of software engineering. Currently have ${data.projectsCount} projects built & deployed.`;
      } else {
        opening = `Transforming concepts into working software. Active on GitHub with ${data.githubRepos > 0 ? `${data.githubRepos} repositories` : "projects built"} and tested implementations.`;
      }
      break;

    case "career":
      if (tone === "humble") {
        opening = `Reflecting on my career preparation journey so far. Working hard to bridge academic theory with production-grade engineering standards.`;
      } else {
        opening = `Career readiness checkpoint: optimizing my full-stack skills, portfolio projects, and technical problem-solving foundation.`;
      }
      break;

    case "opportunity":
      opening = `Actively seeking software engineering opportunities where I can contribute, build scalable systems, and collaborate with high-performing teams.`;
      break;

    case "journey":
    default:
      opening = `Starting my developer journey with focused learning, consistent problem-solving, and hands-on project building.`;
      break;
  }

  // 2. Generate Body Content based on Real Stats & Length
  const statSnippets: string[] = [];
  if (totalDsa > 0) statSnippets.push(`${totalDsa}+ DSA problems solved`);
  if (data.codingStreak > 0) statSnippets.push(`${data.codingStreak}-day active coding streak`);
  if (data.githubRepos > 0) statSnippets.push(`${data.githubRepos} GitHub repositories built`);
  if (data.projectsCount > 0) statSnippets.push(`${data.projectsCount} portfolio projects engineered`);
  if (data.skills.length > 0) statSnippets.push(`Core tech: ${topSkills}`);

  if (length === "short") {
    body = `Focused on continuous learning, clean code, and solving real-world engineering challenges.`;
  } else if (length === "medium") {
    const highlights = statSnippets.slice(0, 3).join(" • ");
    body = `Key focus areas:\n${statSnippets.slice(0, 3).map((s) => `• ${s}`).join("\n")}\n\nEvery day is an opportunity to write better code, understand deeper system design trade-offs, and grow as an engineer.`;
  } else {
    // Detailed
    body = `Key milestones & metrics to date:\n${statSnippets.map((s) => `• ${s}`).join("\n")}\n\nWhat I've learned along the way:\n1. Problem solving is about pattern recognition and patience.\n2. Building real projects teaches far more than isolated tutorials.\n3. Consistent daily momentum compounds into massive long-term growth.`;
  }

  // 3. Generate Closing Tagline & Call-To-Action
  if (storyType === "opportunity") {
    closing = `If your team is hiring for ${headline} or software engineering roles, I'd love to connect and chat!`;
  } else if (tone === "humble" || tone === "personal") {
    closing = `Still learning. Still building. Still improving. 🚀`;
  } else {
    closing = `Excited for the next milestones ahead. Onward and upward! ⚡`;
  }

  // Optional Public Profile URL
  let profileSection = "";
  if (includeProfileLink && publicProfileUrl) {
    profileSection = `\n\n🔗 View my verified developer profile: ${publicProfileUrl}`;
  }

  // 4. Generate Relevant, Focused Hashtags (3–6 max)
  const tagSet = new Set<string>();
  tagSet.add("#SoftwareEngineering");
  tagSet.add("#CodingJourney");

  if (totalDsa > 0 || storyType === "achievement") {
    tagSet.add("#DSA");
    tagSet.add("#ProblemSolving");
  }

  if (data.githubRepos > 0 || storyType === "project") {
    tagSet.add("#WebDevelopment");
    tagSet.add("#OpenSource");
  }

  if (primarySkill) {
    const cleanSkill = primarySkill.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanSkill) tagSet.add(`#${cleanSkill}`);
  }

  if (storyType === "opportunity") {
    tagSet.add("#Hiring");
    tagSet.add("#JobHunt");
  }

  const hashtags = Array.from(tagSet).slice(0, 5);

  const fullText = `${opening}\n\n${body}\n\n${closing}${profileSection}\n\n${hashtags.join(" ")}`.trim();

  return {
    captionText: fullText,
    hashtags,
  };
}
