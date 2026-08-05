import { askAssistant } from "@/lib/assistant.client";
import type { Experience, Project, Skill } from "./types";

// AI action types
export type AIAction = 
  | 'improve'
  | 'rewrite'
  | 'professional'
  | 'shorten'
  | 'expand'
  | 'fix-grammar'
  | 'ats-optimize'
  | 'generate'
  | 'improve-bullets';

// Generate AI improvement for experience description
export async function improveExperienceDescription(
  original: string,
  action: AIAction,
  context?: {
    position?: string;
    company?: string;
    industry?: string;
  }
): Promise<string> {
  const actionPrompts: Record<AIAction, string> = {
    'improve': 'Improve this bullet point to make it more impactful and professional',
    'rewrite': 'Rewrite this bullet point with better wording and clarity',
    'professional': 'Make this bullet point sound more professional and formal',
    'shorten': 'Shorten this bullet point while keeping the key information',
    'expand': 'Expand this bullet point with more details and context',
    'fix-grammar': 'Fix any grammar issues in this bullet point',
    'ats-optimize': 'Optimize this bullet point for ATS by adding relevant keywords',
    'generate': 'Generate a new bullet point for this role',
    'improve-bullets': 'Improve these bullet points to be more action-oriented and quantifiable',
  };

  const prompt = `You are a professional resume writer. ${actionPrompts[action]}.

${context ? `Context: Position: ${context.position}, Company: ${context.company}` : ''}

Original text: "${original}"

Provide only the improved text, no explanations or additional commentary.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    return response.reply || original;
  } catch (error) {
    console.error('AI improvement failed:', error);
    return original;
  }
}

// Generate AI suggestions for skills
export async function suggestSkills(
  currentSkills: string[],
  targetRole?: string,
  industry?: string
): Promise<string[]> {
  const prompt = `You are a career advisor. Suggest 5-8 relevant skills for a ${targetRole || 'professional'} position in the ${industry || 'tech'} industry.

Current skills: ${currentSkills.join(', ')}

Provide only a comma-separated list of skills, no explanations.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    const suggestions = response.reply.split(',').map(s => s.trim()).filter(s => s);
    return suggestions.slice(0, 8);
  } catch (error) {
    console.error('AI skill suggestions failed:', error);
    return [];
  }
}

// Generate AI improvement for project description
export async function improveProjectDescription(
  original: string,
  action: AIAction,
  technologies?: string[]
): Promise<string> {
  const actionPrompts: Record<AIAction, string> = {
    'improve': 'Improve this project description to highlight technical achievements',
    'rewrite': 'Rewrite this project description with better structure and impact',
    'professional': 'Make this project description sound more professional',
    'shorten': 'Shorten this project description while keeping key details',
    'expand': 'Expand this project description with more technical details',
    'fix-grammar': 'Fix any grammar issues in this project description',
    'ats-optimize': 'Optimize this project description for ATS with relevant keywords',
    'generate': 'Generate a new project description',
    'improve-bullets': 'Improve this project description to be more compelling',
  };

  const techContext = technologies ? `Technologies used: ${technologies.join(', ')}` : '';

  const prompt = `You are a technical resume writer. ${actionPrompts[action]}.

${techContext}

Original description: "${original}"

Provide only the improved description, no explanations.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    return response.reply || original;
  } catch (error) {
    console.error('AI project improvement failed:', error);
    return original;
  }
}

// Generate professional summary
export async function generateProfessionalSummary(
  profile: {
    title?: string;
    skills?: string[];
    experience?: string[];
  }
): Promise<string> {
  const prompt = `You are a professional resume writer. Write a compelling professional summary (50-150 words) for a ${profile.title || 'professional'}.

Skills: ${profile.skills?.join(', ') || 'Not specified'}
Experience: ${profile.experience?.join(' ') || 'Not specified'}

Write the summary in first person, highlighting key strengths and career goals. No explanations, just the summary.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    return response.reply || '';
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return '';
  }
}

// Improve bullet points with metrics
export async function addMetricsToBullet(bullet: string): Promise<string> {
  const prompt = `You are a resume optimization expert. Rewrite this bullet point to include quantifiable metrics (numbers, percentages, time) to demonstrate impact.

Original: "${bullet}"

Provide only the improved bullet point with metrics, no explanations. If metrics cannot be reasonably inferred, return the original.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    return response.reply || bullet;
  } catch (error) {
    console.error('AI metrics addition failed:', error);
    return bullet;
  }
}

// Generate achievement from description
export async function generateAchievement(description: string): Promise<string> {
  const prompt = `You are a resume writer. Convert this work description into a strong achievement statement that highlights impact and results.

Description: "${description}"

Provide only the achievement statement, no explanations.`;

  try {
    const response = await askAssistant({
      messages: [{ role: "user", content: prompt }],
      profileContext: {},
    });
    return response.reply || description;
  } catch (error) {
    console.error('AI achievement generation failed:', error);
    return description;
  }
}
