import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
  profileContext: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
      skills: z.string().optional(),
      completion: z.number().optional(),
      githubData: z.object({
        username: z.string().optional(),
        followers: z.number().optional(),
        repositories: z.number().optional(),
        languages: z.record(z.string(), z.number()).optional(),
        stars: z.number().optional(),
      }).optional(),
      leetcodeData: z.object({
        username: z.string().optional(),
        problemsSolved: z.number().optional(),
        contestRating: z.number().optional(),
        acceptanceRate: z.number().optional(),
        ranking: z.number().optional(),
      }).optional(),
    })
    .optional(),
});

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/chat";

async function callGateway(opts: { messages: ChatMessage[] }): Promise<{ reply: string; suggestions: string[] }> {
  try {
    console.log("Attempting to connect to AI backend at:", API_URL);
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
      const error = await res.text();
      console.error("AI Gateway error response:", res.status, error);
      throw new Error(`AI Gateway error: ${res.status} - ${error}`);
    }

    const data = (await res.json()) as {
      reply?: string;
      suggestions?: string[];
    };

    console.log("AI Gateway response received");
    return {
      reply: data.reply ?? "",
      suggestions: data.suggestions || []
    };
  } catch (error) {
    console.error("Failed to connect to AI backend:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        "Unable to connect to AI service. Please ensure the backend server is running on port 3001. Run 'npm run server' in a separate terminal."
      );
    }
    throw error;
  }
}

export async function askAssistant(input: z.infer<typeof Input>) {
  const parsed = Input.parse(input);

  let ctxLine = parsed.profileContext
    ? `\nCandidate context: ${parsed.profileContext.name ?? "user"} — ${parsed.profileContext.role ?? "student"}, profile ${parsed.profileContext.completion ?? 0}% complete. Skills: ${parsed.profileContext.skills || "not listed"}.`
    : "";

  // Add GitHub context if available
  if (parsed.profileContext?.githubData) {
    const gh = parsed.profileContext.githubData;
    ctxLine += `\nGitHub: @${gh.username || "not connected"} — ${gh.followers || 0} followers, ${gh.repositories || 0} repos, ${gh.stars || 0} total stars.`;
    if (gh.languages && Object.keys(gh.languages).length > 0) {
      const topLangs = Object.entries(gh.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang)
        .join(", ");
      ctxLine += ` Top languages: ${topLangs}.`;
    }
  }

  // Add LeetCode context if available
  if (parsed.profileContext?.leetcodeData) {
    const lc = parsed.profileContext.leetcodeData;
    ctxLine += `\nLeetCode: @${lc.username || "not connected"} — ${lc.problemsSolved || 0} problems solved, contest rating: ${lc.contestRating || 0}, acceptance rate: ${lc.acceptanceRate || 0}%, global ranking: #${lc.ranking || "N/A"}.`;
  }

  const system =
    "You are SkillVerse AI — an AI career coach for students and early-career engineers. " +
    "Give sharp, actionable advice on placements, interviews, resumes, DSA prep, project ideas and portfolio building. " +
    "Be concise (max ~180 words unless asked for detail). Use markdown lists for steps. " +
    "Ground answers in the candidate's context when relevant. Use their GitHub and LeetCode data to provide personalized recommendations for skill gaps, project improvements, and interview preparation. " +
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
    reply: response.reply.trim(),
    suggestions: response.suggestions
  };
}
