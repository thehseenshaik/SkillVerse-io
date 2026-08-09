/**
 * Resume Builder State Management
 * Zustand store for managing resume builder state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ResumeData,
  TemplateType,
  Theme,
  PreviewMode,
  ZoomLevel,
  ExportFormat,
  Profile,
  Skill,
  Project,
  Experience,
  Education,
  Certification,
  Achievement,
  Language,
  VolunteerWork,
  Publication,
  Reference,
  CustomSection,
  ContactInfo,
} from './types';

// Default profile
const defaultProfile: Profile = {
  fullName: '',
  title: '',
  contact: {
    email: '',
    phone: '',
    location: '',
  },
};

// Default theme
const defaultTheme: Theme = {
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  colors: {
    primary: '#000000',
    secondary: '#111827',
    accent: '#374151',
    text: '#111827',
    background: '#ffffff',
  },
  headingStyle: {
    size: 'medium',
    weight: 'semibold',
    transform: 'none',
  },
  sectionStyle: {
    spacing: 'normal',
    borders: true,
    borderColor: '#e5e7eb',
    background: '#ffffff',
  },
  icons: {
    enabled: true,
    style: 'outlined',
  },
};

// Create empty resume data
const createEmptyResume = (): ResumeData => ({
  id: crypto.randomUUID(),
  name: 'My Resume',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  profile: defaultProfile,
  skills: [],
  projects: [],
  experience: [],
  education: [],
  certifications: [],
  achievements: [],
  languages: [],
  volunteerWork: [],
  publications: [],
  references: [],
  customSections: [],
});

interface ResumeBuilderStore {
  // Resume data
  resume: ResumeData;
  resumes: ResumeData[];
  currentResumeId: string | null;
  setResume: (resume: ResumeData) => void;
  setResumes: (resumes: ResumeData[]) => void;
  setCurrentResumeId: (id: string | null) => void;
  loadResume: (id: string) => void;
  createNewResume: (name?: string) => void;
  renameResume: (id: string, name: string) => void;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  saveResume: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
  updateContact: (contact: Partial<ContactInfo>) => void;
  
  // Skills
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Projects
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Experience
  addExperience: (experience: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  // Education
  addEducation: (education: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // Certifications
  addCertification: (certification: Omit<Certification, 'id'>) => void;
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  
  // Achievements
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  removeAchievement: (id: string) => void;
  
  // Languages
  addLanguage: (language: Omit<Language, 'id'>) => void;
  updateLanguage: (id: string, language: Partial<Language>) => void;
  removeLanguage: (id: string) => void;
  
  // Volunteer Work
  addVolunteerWork: (work: Omit<VolunteerWork, 'id'>) => void;
  updateVolunteerWork: (id: string, work: Partial<VolunteerWork>) => void;
  removeVolunteerWork: (id: string) => void;
  
  // Publications
  addPublication: (publication: Omit<Publication, 'id'>) => void;
  updatePublication: (id: string, publication: Partial<Publication>) => void;
  removePublication: (id: string) => void;
  
  // References
  addReference: (reference: Omit<Reference, 'id'>) => void;
  updateReference: (id: string, reference: Partial<Reference>) => void;
  removeReference: (id: string) => void;
  
  // Custom Sections
  addCustomSection: (section: Omit<CustomSection, 'id'>) => void;
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  
  // Template & Theme
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
  
  // Preview settings
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  zoom: ZoomLevel;
  setZoom: (zoom: ZoomLevel) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  
  // UI state
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  isBuilderVisible: boolean;
  setIsBuilderVisible: (visible: boolean) => void;
  
  // Auto-save
  lastSaved: string | null;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  updateLastSaved: () => void;
  
  // Reset
  resetResume: () => void;
}

export const useResumeStore = create<ResumeBuilderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resume: createEmptyResume(),
      resumes: [],
      currentResumeId: null,
      template: 'ats-professional',
      selectedPreset: 'default',
      theme: defaultTheme,
      previewMode: 'desktop',
      zoom: 100,
      isFullscreen: false,
      activeSection: null,
      isBuilderVisible: true,
      lastSaved: null,
      isSaving: false,
      
      // Resume operations
      setResume: (resume) => {
        const preset = resume.selectedPreset || get().selectedPreset || 'default';
        const template = resume.template || get().template || 'ats-professional';
        set({ resume, selectedPreset: preset, template });
      },
      setResumes: (resumes) => set({ resumes }),
      setCurrentResumeId: (id) => set({ currentResumeId: id }),
      loadResume: (id) => {
        const state = get();
        const resume = state.resumes.find(r => r.id === id);
        if (resume) {
          const preset = resume.selectedPreset || 'default';
          const template = resume.template || 'ats-professional';
          set({ 
            resume: { ...resume, selectedPreset: preset, template }, 
            currentResumeId: id,
            selectedPreset: preset,
            template: template,
          });
        }
      },
      createNewResume: (name = 'My Resume') => {
        const newResume = createEmptyResume();
        newResume.name = name;
        newResume.selectedPreset = 'default';
        newResume.template = 'ats-professional';
        set((state) => ({
          resumes: [newResume, ...state.resumes],
          resume: newResume,
          currentResumeId: newResume.id,
          selectedPreset: 'default',
          template: 'ats-professional',
        }));
      },
      renameResume: (id, name) => {
        set((state) => {
          const updatedResumes = state.resumes.map((r) =>
            r.id === id ? { ...r, name, updatedAt: new Date().toISOString() } : r
          );
          const updatedCurrent =
            state.resume.id === id ? { ...state.resume, name, updatedAt: new Date().toISOString() } : state.resume;
          return {
            resumes: updatedResumes,
            resume: updatedCurrent,
          };
        });
      },
      duplicateResume: (id) => {
        const state = get();
        const original = state.resumes.find((r) => r.id === id) || (state.resume.id === id ? state.resume : null);
        if (original) {
          const duplicate = {
            ...JSON.parse(JSON.stringify(original)),
            id: crypto.randomUUID(),
            name: `${original.name} — Copy`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            resumes: [duplicate, ...state.resumes],
          }));
        }
      },
      deleteResume: (id) => {
        set((state) => {
          const newResumes = state.resumes.filter(r => r.id !== id);
          if (state.currentResumeId === id) {
            return {
              resumes: newResumes,
              currentResumeId: null,
              resume: newResumes.length > 0 ? newResumes[0] : createEmptyResume(),
            };
          }
          return { resumes: newResumes };
        });
      },
      
      updateProfile: (profile) => set((state) => ({
        resume: {
          ...state.resume,
          profile: { ...state.resume.profile, ...profile },
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateContact: (contact) => set((state) => ({
        resume: {
          ...state.resume,
          profile: {
            ...state.resume.profile,
            contact: { ...state.resume.profile.contact, ...contact },
          },
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Skills
      addSkill: (skill) => set((state) => ({
        resume: {
          ...state.resume,
          skills: [...state.resume.skills, { ...skill, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateSkill: (id, skill) => set((state) => ({
        resume: {
          ...state.resume,
          skills: state.resume.skills.map((s) => s.id === id ? { ...s, ...skill } : s),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeSkill: (id) => set((state) => ({
        resume: {
          ...state.resume,
          skills: state.resume.skills.filter((s) => s.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Projects
      addProject: (project) => set((state) => ({
        resume: {
          ...state.resume,
          projects: [...state.resume.projects, { ...project, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateProject: (id, project) => set((state) => ({
        resume: {
          ...state.resume,
          projects: state.resume.projects.map((p) => p.id === id ? { ...p, ...project } : p),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeProject: (id) => set((state) => ({
        resume: {
          ...state.resume,
          projects: state.resume.projects.filter((p) => p.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Experience
      addExperience: (experience) => set((state) => ({
        resume: {
          ...state.resume,
          experience: [...state.resume.experience, { ...experience, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateExperience: (id, experience) => set((state) => ({
        resume: {
          ...state.resume,
          experience: state.resume.experience.map((e) => e.id === id ? { ...e, ...experience } : e),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeExperience: (id) => set((state) => ({
        resume: {
          ...state.resume,
          experience: state.resume.experience.filter((e) => e.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Education
      addEducation: (education) => set((state) => ({
        resume: {
          ...state.resume,
          education: [...state.resume.education, { ...education, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateEducation: (id, education) => set((state) => ({
        resume: {
          ...state.resume,
          education: state.resume.education.map((e) => e.id === id ? { ...e, ...education } : e),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeEducation: (id) => set((state) => ({
        resume: {
          ...state.resume,
          education: state.resume.education.filter((e) => e.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Certifications
      addCertification: (certification) => set((state) => ({
        resume: {
          ...state.resume,
          certifications: [...state.resume.certifications, { ...certification, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateCertification: (id, certification) => set((state) => ({
        resume: {
          ...state.resume,
          certifications: state.resume.certifications.map((c) => c.id === id ? { ...c, ...certification } : c),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeCertification: (id) => set((state) => ({
        resume: {
          ...state.resume,
          certifications: state.resume.certifications.filter((c) => c.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Achievements
      addAchievement: (achievement) => set((state) => ({
        resume: {
          ...state.resume,
          achievements: [...state.resume.achievements, { ...achievement, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateAchievement: (id, achievement) => set((state) => ({
        resume: {
          ...state.resume,
          achievements: state.resume.achievements.map((a) => a.id === id ? { ...a, ...achievement } : a),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeAchievement: (id) => set((state) => ({
        resume: {
          ...state.resume,
          achievements: state.resume.achievements.filter((a) => a.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Languages
      addLanguage: (language) => set((state) => ({
        resume: {
          ...state.resume,
          languages: [...state.resume.languages, { ...language, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateLanguage: (id, language) => set((state) => ({
        resume: {
          ...state.resume,
          languages: state.resume.languages.map((l) => l.id === id ? { ...l, ...language } : l),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeLanguage: (id) => set((state) => ({
        resume: {
          ...state.resume,
          languages: state.resume.languages.filter((l) => l.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Volunteer Work
      addVolunteerWork: (work) => set((state) => ({
        resume: {
          ...state.resume,
          volunteerWork: [...state.resume.volunteerWork, { ...work, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateVolunteerWork: (id, work) => set((state) => ({
        resume: {
          ...state.resume,
          volunteerWork: state.resume.volunteerWork.map((w) => w.id === id ? { ...w, ...work } : w),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeVolunteerWork: (id) => set((state) => ({
        resume: {
          ...state.resume,
          volunteerWork: state.resume.volunteerWork.filter((w) => w.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Publications
      addPublication: (publication) => set((state) => ({
        resume: {
          ...state.resume,
          publications: [...state.resume.publications, { ...publication, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updatePublication: (id, publication) => set((state) => ({
        resume: {
          ...state.resume,
          publications: state.resume.publications.map((p) => p.id === id ? { ...p, ...publication } : p),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removePublication: (id) => set((state) => ({
        resume: {
          ...state.resume,
          publications: state.resume.publications.filter((p) => p.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // References
      addReference: (reference) => set((state) => ({
        resume: {
          ...state.resume,
          references: [...state.resume.references, { ...reference, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateReference: (id, reference) => set((state) => ({
        resume: {
          ...state.resume,
          references: state.resume.references.map((r) => r.id === id ? { ...r, ...reference } : r),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeReference: (id) => set((state) => ({
        resume: {
          ...state.resume,
          references: state.resume.references.filter((r) => r.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Custom Sections
      addCustomSection: (section) => set((state) => ({
        resume: {
          ...state.resume,
          customSections: [...state.resume.customSections, { ...section, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString(),
        },
      })),
      
      updateCustomSection: (id, section) => set((state) => ({
        resume: {
          ...state.resume,
          customSections: state.resume.customSections.map((s) => s.id === id ? { ...s, ...section } : s),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      removeCustomSection: (id) => set((state) => ({
        resume: {
          ...state.resume,
          customSections: state.resume.customSections.filter((s) => s.id !== id),
          updatedAt: new Date().toISOString(),
        },
      })),
      
      // Template & Theme
      setTemplate: (template) => set((state) => ({ 
        template, 
        resume: { ...state.resume, template, updatedAt: new Date().toISOString() } 
      })),
      setSelectedPreset: (selectedPreset) => set((state) => ({ 
        selectedPreset, 
        resume: { ...state.resume, selectedPreset, updatedAt: new Date().toISOString() } 
      })),
      setTheme: (theme) => set((state) => ({ theme: { ...state.theme, ...theme } })),
      resetTheme: () => set({ theme: defaultTheme }),
      
      // Preview settings
      setPreviewMode: (previewMode) => set({ previewMode }),
      setZoom: (zoom) => set({ zoom }),
      setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
      
      // UI state
      setActiveSection: (activeSection) => set({ activeSection }),
      setIsBuilderVisible: (isBuilderVisible) => set({ isBuilderVisible }),
      
      // Auto-save & Manual Save
      saveResume: () => {
        const state = get();
        const now = new Date().toISOString();
        const current = {
          ...state.resume,
          selectedPreset: state.selectedPreset,
          template: state.template,
          updatedAt: now,
        };
        
        const exists = state.resumes.some((r) => r.id === current.id);
        const updatedResumes = exists
          ? state.resumes.map((r) => (r.id === current.id ? current : r))
          : [current, ...state.resumes];
          
        set({
          resume: current,
          resumes: updatedResumes,
          currentResumeId: current.id,
          lastSaved: now,
          isSaving: false,
        });
      },
      setIsSaving: (isSaving) => set({ isSaving }),
      updateLastSaved: () => set({ lastSaved: new Date().toISOString() }),
      triggerAutoSave: async () => {
        const state = get();
        state.setIsSaving(true);
        state.saveResume();
        state.setIsSaving(false);
      },
      
      // Reset
      resetResume: () => set({
        resume: createEmptyResume(),
        lastSaved: null,
      }),
    }),
    {
      name: 'resume-builder-storage',
    }
  )
);
