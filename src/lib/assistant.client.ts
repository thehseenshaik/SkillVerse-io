import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
  profileContext: z
    .object({
      name: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
      skills: z.string().optional().nullable(),
      completion: z.number().optional().nullable(),
      githubData: z
        .object({
          username: z.string().optional().nullable(),
          followers: z.number().optional().nullable(),
          repositories: z.number().optional().nullable(),
          languages: z.record(z.string(), z.number()).optional().nullable(),
          stars: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
      leetcodeData: z
        .object({
          username: z.string().optional().nullable(),
          problemsSolved: z.number().optional().nullable(),
          contestRating: z.number().optional().nullable(),
          acceptanceRate: z.number().optional().nullable(),
          ranking: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/chat";

// Local career advisor fallback when server or API is unreachable
function getLocalFallback(userMessage: string): { reply: string; suggestions: string[] } {
  const query = userMessage.toLowerCase();

  if (query.includes("resume") || query.includes("ats")) {
    return {
      reply: "**SkillVerse Resume & ATS Optimization**:\n\n1. **Clear Hierarchy**: Use standard section headers (*Education*, *Experience*, *Projects*, *Skills*).\n2. **Quantifiable Bullet Points**: Highlight measurable impact (e.g. *Improved database query speed by 35%*).\n3. **Keywords Alignment**: Align project stack keywords with modern industry job descriptions.",
      suggestions: ["Career roadmap", "Mock interview", "Profile review"]
    };
  }

  if (query.includes("roadmap") || query.includes("career")) {
    return {
      reply: "**Software Engineer Career Roadmap**:\n\n1. **DSA Core**: Solve 150+ problems focusing on Arrays, Trees, HashMaps, and Dynamic Programming.\n2. **Full-Stack Projects**: Build 2 production applications with authentication, REST APIs, and database integration.\n3. **Profile Indexing**: Connect your GitHub and LeetCode accounts on SkillVerse for automatic verification.",
      suggestions: ["Analyze my resume", "Mock interview", "Connect platforms"]
    };
  }

  if (query.includes("interview") || query.includes("mock")) {
    return {
      reply: "**Technical & Behavioral Interview Prep**:\n\n1. **System Architecture**: Study fundamental concepts like load balancing, caching, and database schemas.\n2. **Coding Communication**: Practice explaining your thought process out loud before writing code.\n3. **Behavioral STAR Technique**: Prepare stories demonstrating teamwork, problem-solving, and conflict resolution.",
      suggestions: ["Improve ATS score", "Career roadmap", "Profile review"]
    };
  }

  return {
    reply: `Here is guidance for: **${userMessage}**\n\n1. **Project Work**: Build full-stack applications with clean architecture and clear README documentation.\n2. **Daily Consistency**: Commit code and solve coding challenges regularly.\n3. **Complete Profile**: Keep your SkillVerse identity and resume updated for maximum placement readiness.`,
    suggestions: ["Analyze my resume", "Career roadmap", "Mock interview"]
  };
}

async function callGateway(opts: { messages: ChatMessage[] }): Promise<{ reply: string; suggestions: string[] }> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: opts.messages,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI Gateway status: ${res.status}`);
    }

    const data = (await res.json()) as {
      reply?: string;
      suggestions?: string[];
    };

    return {
      reply: data.reply || "",
      suggestions: data.suggestions || ["Career roadmap", "Mock interview", "Profile review"]
    };
  } catch (error) {
    const lastUserMsg = opts.messages.filter(m => m.role === "user").pop()?.content || "Career assistance";
    return getLocalFallback(lastUserMsg);
  }
}

export async function askAssistant(input: z.infer<typeof Input>) {
  const parsed = Input.parse(input);

  let ctxLine = parsed.profileContext
    ? `\nCandidate context: ${parsed.profileContext.name ?? "user"} — ${parsed.profileContext.role ?? "student"}, profile ${parsed.profileContext.completion ?? 0}% complete. Skills: ${parsed.profileContext.skills || "not listed"}.`
    : "";

  if (parsed.profileContext?.githubData) {
    const gh = parsed.profileContext.githubData;
    ctxLine += `\nGitHub: @${gh.username || "not connected"} — ${gh.followers || 0} followers, ${gh.repositories || 0} repos, ${gh.stars || 0} total stars.`;
  }

  if (parsed.profileContext?.leetcodeData) {
    const lc = parsed.profileContext.leetcodeData;
    ctxLine += `\nLeetCode: @${lc.username || "not connected"} — ${lc.problemsSolved || 0} problems solved, contest rating: ${lc.contestRating || 0}, ranking: #${lc.ranking || "N/A"}.`;
  }

  const system =
    "You are SkillVerse AI — an AI career coach for students and early-career engineers. " +
    "Give sharp, actionable advice on placements, interviews, resumes, DSA prep, project ideas and portfolio building. " +
    "Be concise (max ~180 words unless asked for detail). Use markdown lists for steps. " +
    "Ground answers in the candidate's context when relevant. " +
    "Never invent job offers or claim you can send applications." +
    ctxLine;

  const response = await callGateway({
    messages: [
      { role: "system", content: system },
      ...parsed.messages.map(
        (m) => ({ role: m.role, content: m.content }) as const,
      ),
    ],
  });

  return {
    reply: (response.reply || "How else can I assist your career path today?").trim(),
    suggestions: response.suggestions || ["Career roadmap", "Mock interview", "Profile review"]
  };
}
