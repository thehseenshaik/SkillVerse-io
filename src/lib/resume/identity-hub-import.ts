import type { UnifiedProfile, Skill, Project, Achievement, Experience, Education, Certification } from "@/types/identity-hub";
import type { ResumeData, Skill as ResumeSkill, Project as ResumeProject, Achievement as ResumeAchievement, Experience as ResumeExperience, Education as ResumeEducation, Certification as ResumeCertification } from "./types";

/**
 * Import data from Identity Hub to Resume Builder
 */

// Map Identity Hub skill to Resume skill
function mapSkill(skill: Skill): ResumeSkill {
  return {
    id: crypto.randomUUID(),
    name: skill.name,
    level: mapProficiencyToLevel(skill.proficiency),
    category: skill.category,
  };
}

// Map proficiency (0-100) to skill level
function mapProficiencyToLevel(proficiency: number): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
  if (proficiency >= 80) return 'Expert';
  if (proficiency >= 60) return 'Advanced';
  if (proficiency >= 40) return 'Intermediate';
  return 'Beginner';
}

// Map Identity Hub project to Resume project
function mapProject(project: Project): ResumeProject {
  return {
    id: crypto.randomUUID(),
    name: project.name,
    description: project.description,
    technologies: project.technologies,
    link: project.liveDemo,
    github: project.repository,
  };
}

// Map Identity Hub achievement to Resume achievement
function mapAchievement(achievement: Achievement): ResumeAchievement {
  return {
    id: crypto.randomUUID(),
    title: achievement.title,
    description: achievement.description,
    date: achievement.date.toISOString().split('T')[0],
    type: achievement.type,
  };
}

// Map Identity Hub experience to Resume experience
function mapExperience(experience: Experience): ResumeExperience {
  return {
    id: crypto.randomUUID(),
    company: experience.company,
    position: experience.title,
    location: experience.location,
    startDate: experience.startDate.toISOString().split('T')[0],
    endDate: experience.endDate ? experience.endDate.toISOString().split('T')[0] : undefined,
    current: !experience.endDate,
    description: experience.description ? [experience.description] : [],
    technologies: experience.technologies,
  };
}

// Map Identity Hub education to Resume education
function mapEducation(education: Education): ResumeEducation {
  return {
    id: crypto.randomUUID(),
    institution: education.institution,
    degree: education.degree,
    field: education.field,
    startDate: education.startDate.toISOString().split('T')[0],
    endDate: education.endDate ? education.endDate.toISOString().split('T')[0] : undefined,
    current: !education.endDate,
    gpa: education.gpa,
  };
}

// Map Identity Hub certification to Resume certification
function mapCertification(certification: Certification): ResumeCertification {
  return {
    id: crypto.randomUUID(),
    name: certification.name,
    issuer: certification.issuer,
    date: certification.issueDate.toISOString().split('T')[0],
    expiryDate: certification.expiryDate ? certification.expiryDate.toISOString().split('T')[0] : undefined,
    credentialId: certification.credentialId,
    link: certification.url,
  };
}

// Import all data from Identity Hub profile
export function importFromIdentityHub(
  identityProfile: UnifiedProfile,
  currentResume: ResumeData,
  options: {
    importSkills?: boolean;
    importProjects?: boolean;
    importAchievements?: boolean;
    importExperience?: boolean;
    importEducation?: boolean;
    importCertifications?: boolean;
    overwrite?: boolean;
  } = {}
): Partial<ResumeData> {
  const {
    importSkills = true,
    importProjects = true,
    importAchievements = true,
    importExperience = true,
    importEducation = true,
    importCertifications = true,
    overwrite = false,
  } = options;

  const updates: Partial<ResumeData> = {};

  // Import profile info
  if (identityProfile.displayName && (!currentResume.profile.fullName || overwrite)) {
    updates.profile = {
      ...currentResume.profile,
      fullName: identityProfile.displayName,
    };
  }

  if (identityProfile.bio && (!currentResume.profile.summary || overwrite)) {
    updates.profile = {
      ...updates.profile || currentResume.profile,
      summary: identityProfile.bio,
    };
  }

  if (identityProfile.location && (!currentResume.profile.contact.location || overwrite)) {
    updates.profile = {
      ...updates.profile || currentResume.profile,
      contact: {
        ...currentResume.profile.contact,
        location: identityProfile.location,
      },
    };
  }

  if (identityProfile.website && (!currentResume.profile.contact.website || overwrite)) {
    updates.profile = {
      ...updates.profile || currentResume.profile,
      contact: {
        ...updates.profile?.contact || currentResume.profile.contact,
        website: identityProfile.website,
      },
    };
  }

  // Import skills
  if (importSkills && identityProfile.skills.length > 0) {
    const mappedSkills = identityProfile.skills
      .filter(skill => !skill.isHidden)
      .map(mapSkill);
    
    if (overwrite) {
      updates.skills = mappedSkills;
    } else {
      // Merge skills, avoiding duplicates
      const existingSkillNames = new Set(currentResume.skills.map(s => s.name.toLowerCase()));
      const newSkills = mappedSkills.filter(s => !existingSkillNames.has(s.name.toLowerCase()));
      updates.skills = [...currentResume.skills, ...newSkills];
    }
  }

  // Import projects
  if (importProjects && identityProfile.projects.length > 0) {
    const mappedProjects = identityProfile.projects
      .filter(project => !project.isHidden)
      .map(mapProject);
    
    if (overwrite) {
      updates.projects = mappedProjects;
    } else {
      // Merge projects, avoiding duplicates
      const existingProjectNames = new Set(currentResume.projects.map(p => p.name.toLowerCase()));
      const newProjects = mappedProjects.filter(p => !existingProjectNames.has(p.name.toLowerCase()));
      updates.projects = [...currentResume.projects, ...newProjects];
    }
  }

  // Import achievements
  if (importAchievements && identityProfile.achievements.length > 0) {
    const mappedAchievements = identityProfile.achievements
      .filter(achievement => !achievement.isHidden)
      .map(mapAchievement);
    
    if (overwrite) {
      updates.achievements = mappedAchievements;
    } else {
      // Merge achievements, avoiding duplicates
      const existingAchievementTitles = new Set(currentResume.achievements.map(a => a.title.toLowerCase()));
      const newAchievements = mappedAchievements.filter(a => !existingAchievementTitles.has(a.title.toLowerCase()));
      updates.achievements = [...currentResume.achievements, ...newAchievements];
    }
  }

  // Import experience
  if (importExperience && identityProfile.experience.length > 0) {
    const mappedExperience = identityProfile.experience
      .filter(exp => !exp.isHidden)
      .map(mapExperience);
    
    if (overwrite) {
      updates.experience = mappedExperience;
    } else {
      // Merge experience, avoiding duplicates
      const existingExperience = new Set(
        currentResume.experience.map(e => `${e.company}-${e.position}`.toLowerCase())
      );
      const newExperience = mappedExperience.filter(
        e => !existingExperience.has(`${e.company}-${e.position}`.toLowerCase())
      );
      updates.experience = [...currentResume.experience, ...newExperience];
    }
  }

  // Import education
  if (importEducation && identityProfile.education.length > 0) {
    const mappedEducation = identityProfile.education
      .filter(edu => !edu.isHidden)
      .map(mapEducation);
    
    if (overwrite) {
      updates.education = mappedEducation;
    } else {
      // Merge education, avoiding duplicates
      const existingEducation = new Set(
        currentResume.education.map(e => `${e.institution}-${e.degree}`.toLowerCase())
      );
      const newEducation = mappedEducation.filter(
        e => !existingEducation.has(`${e.institution}-${e.degree}`.toLowerCase())
      );
      updates.education = [...currentResume.education, ...newEducation];
    }
  }

  // Import certifications
  if (importCertifications && identityProfile.certifications.length > 0) {
    const mappedCertifications = identityProfile.certifications
      .filter(cert => !cert.isHidden)
      .map(mapCertification);
    
    if (overwrite) {
      updates.certifications = mappedCertifications;
    } else {
      // Merge certifications, avoiding duplicates
      const existingCerts = new Set(
        currentResume.certifications.map(c => `${c.issuer}-${c.name}`.toLowerCase())
      );
      const newCertifications = mappedCertifications.filter(
        c => !existingCerts.has(`${c.issuer}-${c.name}`.toLowerCase())
      );
      updates.certifications = [...currentResume.certifications, ...newCertifications];
    }
  }

  return updates;
}

// Get import summary before applying
export function getImportSummary(
  identityProfile: UnifiedProfile,
  currentResume: ResumeData
): {
  skills: number;
  projects: number;
  achievements: number;
  experience: number;
  education: number;
  certifications: number;
} {
  return {
    skills: identityProfile.skills.filter(s => !s.isHidden).length,
    projects: identityProfile.projects.filter(p => !p.isHidden).length,
    achievements: identityProfile.achievements.filter(a => !a.isHidden).length,
    experience: identityProfile.experience.filter(e => !e.isHidden).length,
    education: identityProfile.education.filter(e => !e.isHidden).length,
    certifications: identityProfile.certifications.filter(c => !c.isHidden).length,
  };
}
