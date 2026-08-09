import { z } from "zod";

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startYear: z.string(),
  endYear: z.string(),
  gpa: z.string().optional(),
});

const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().optional(),
});

const SkillsSchema = z.object({
  technical: z.array(z.string()),
  soft: z.array(z.string()),
});

const Input = z.object({
  fullName: z.string(),
  headline: z.string().optional(),
  role: z.string(),
  summary: z.string().optional(),
  skills: z.string(),
  achievements: z.string().optional(),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      start: z.string(),
      end: z.string(),
      grade: z.string().optional(),
    }),
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      start: z.string(),
      end: z.string(),
      summary: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      stack: z.string(),
      link: z.string().optional(),
      summary: z.string(),
    }),
  ),
});

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const GATEWAY_URL = "https://api.openai.com/v1/chat/completions";

async function callGatewayJSON<T = unknown>(opts: {
  model?: string;
  messages: ChatMessage[];
}): Promise<T> {
  const key = import.meta.env.VITE_OPENAI_API_KEY || "";
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const body: Record<string, unknown> = {
    model: opts.model ?? "gpt-4o-mini",
    messages: opts.messages,
    response_format: { type: "json_object" },
  };

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`AI Gateway error: ${res.status} - ${error}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("AI returned malformed JSON.");
  }
}

export type AIResume = {
  summary: string;
  headline: string;
  experienceBullets: string[][];
  projectBullets: string[][];
  skillGroups: { label: string; items: string[] }[];
  achievements: string[];
};

export async function generateAIResume(input: z.infer<typeof Input>) {
  const parsed = Input.parse(input);

  const system = `You are an expert resume writer. Generate an ATS-optimized resume for a ${parsed.role} position.
  Return JSON with: summary (string), headline (string), experienceBullets (array of arrays, one per experience), projectBullets (array of arrays, one per project), skillGroups (array of objects with label and items), achievements (array of strings).`;

  const response = await callGatewayJSON<AIResume>({
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Generate a resume for ${parsed.fullName} targeting ${parsed.role} position. Current headline: ${parsed.headline || "N/A"}. Summary: ${parsed.summary || "N/A"}. Skills: ${parsed.skills}. Achievements: ${parsed.achievements || "N/A"}.`,
      },
    ],
  });

  return response;
}
