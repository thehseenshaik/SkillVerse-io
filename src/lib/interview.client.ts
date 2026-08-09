import { z } from "zod";

const GenerateInput = z.object({
  role: z.string().trim().min(2).max(80),
  level: z.enum(["intern", "junior", "mid", "senior"]),
  focus: z.enum(["technical", "behavioral", "system-design", "mixed"]),
  count: z.number().int().min(3).max(8).default(5),
});

const EvaluateInput = z.object({
  role: z.string().trim().min(2).max(80),
  level: z.enum(["intern", "junior", "mid", "senior"]),
  question: z.string().trim().min(4).max(600),
  answer: z.string().trim().min(1).max(4000),
});

export type InterviewQuestion = {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
};

export type InterviewFeedback = {
  overall: number; // 0-100
  scores: {
    correctness: number;
    clarity: number;
    depth: number;
    structure: number;
  };
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  verdict: string;
};

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

export async function generateInterviewQuestions(
  input: z.infer<typeof GenerateInput>,
) {
  const parsed = GenerateInput.parse(input);

  const system = `You are an expert technical interviewer. Generate ${parsed.count} interview questions for a ${parsed.level} ${parsed.role} position focused on ${parsed.focus}. 
  Return JSON with: questions array containing id (short uuid), question, category, difficulty (easy/medium/hard), and hint.`;

  const response = await callGatewayJSON<{ questions: InterviewQuestion[] }>({
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Generate ${parsed.count} interview questions for a ${parsed.level} ${parsed.role} position focused on ${parsed.focus}.`,
      },
    ],
  });

  return response;
}

export async function evaluateInterviewAnswer(
  input: z.infer<typeof EvaluateInput>,
) {
  const parsed = EvaluateInput.parse(input);

  const system = `You are an expert technical interviewer. Evaluate the answer to a ${parsed.level} ${parsed.role} interview question.
  Return JSON with: overall (0-100), scores (correctness, clarity, depth, structure each 0-100), strengths (array), improvements (array), modelAnswer, verdict (pass/fail/borderline).`;

  const response = await callGatewayJSON<InterviewFeedback>({
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Question: ${parsed.question}\n\nAnswer: ${parsed.answer}\n\nEvaluate this answer for a ${parsed.level} ${parsed.role} position.`,
      },
    ],
  });

  return response;
}
