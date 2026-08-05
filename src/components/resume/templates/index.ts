import { ATSProfessional } from "./ATSProfessional";
import { ModernMinimal } from "./ModernMinimal";
import { Executive } from "./Executive";
import { SoftwareEngineer } from "./SoftwareEngineer";
import { Designer } from "./Designer";
import { Fresher } from "./Fresher";
import { Internship } from "./Internship";
import { Corporate } from "./Corporate";
import { Startup } from "./Startup";
import { Academic } from "./Academic";
import type { ResumeData, Theme, TemplateType } from "@/lib/resume/types";

// Template registry
export const templates: Record<TemplateType, React.ComponentType<{ resume: ResumeData; theme: Theme }>> = {
  'ats-professional': ATSProfessional,
  'modern-minimal': ModernMinimal,
  'executive': Executive,
  'software-engineer': SoftwareEngineer,
  'designer': Designer,
  'fresher': Fresher,
  'internship': Internship,
  'corporate': Corporate,
  'startup': Startup,
  'academic': Academic,
};

export function getTemplate(type: TemplateType) {
  return templates[type] || ATSProfessional;
}

export const templateNames: Record<TemplateType, string> = {
  'ats-professional': 'ATS Professional',
  'modern-minimal': 'Modern Minimal',
  'executive': 'Executive',
  'software-engineer': 'Software Engineer',
  'designer': 'Designer',
  'fresher': 'Fresher',
  'internship': 'Internship',
  'corporate': 'Corporate',
  'startup': 'Startup',
  'academic': 'Academic',
};
