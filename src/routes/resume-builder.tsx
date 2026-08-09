import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { PageShell } from "@/components/SiteChrome";
import { useResumeStore } from "@/lib/resume/store";
import { getTemplate, templateNames } from "@/components/resume/templates";
import { getThemePreset, getThemePresetNames, colorPalettes, fontOptions } from "@/lib/resume/theme-system";
import { analyzeATS, calculateHealthScore } from "@/lib/resume/ats-analyzer";
import { ATSPanel } from "@/components/resume/ATSPanel";
import { IdentityHubImportModal } from "@/components/resume/IdentityHubImportModal";
import { ExportModal } from "@/components/resume/ExportModal";
import { exportResume, exportAsPDF, exportAsWord, printNativePDF, generateDefaultFilename } from "@/lib/resume/export-formats";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X, Clock, Copy, Trash2, Plus, History, Search, User, Briefcase, Mail, Phone, MapPin, Download, Sparkles, ArrowLeft, ArrowRight, Check, CheckCircle2, GraduationCap, Maximize2, Minimize2, ZoomIn, ZoomOut, Loader2, Code, FileText, RefreshCw, Pencil, MoreVertical, Save, Printer, FileCode, ShieldCheck, Globe, Link2 } from "lucide-react";
import { ResumePrinter } from "@/components/ResumePrinter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: "Resume Builder — SkillVerse" },
      {
        name: "description",
        content: "Build your professional resume with AI assistance and live ATS scoring.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Resume Builder — SkillVerse" },
      {
        property: "og:description",
        content: "Create ATS-optimized resumes with AI assistance.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ResumeBuilderPage />
    </AuthGate>
  ),
});

function ResumeBuilderPage() {
  const { resume, template, theme, selectedPreset, setSelectedPreset, zoom, isFullscreen, setZoom, setIsFullscreen, setTemplate, setTheme, lastSaved, isSaving, setIsSaving, updateLastSaved, saveResume, resumes, currentResumeId, loadResume, createNewResume, renameResume, duplicateResume, deleteResume, setResume, updateProfile, updateContact, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, addSkill, updateSkill, removeSkill, addProject, updateProject, removeProject } = useResumeStore();
  const { profile: userProfile, completion, hydrated } = useProfile();
  const { profile: identityProfile } = useIdentityHub();
  const { githubData, leetcodeData } = usePlatformStore();
  const [view, setView] = useState<"landing" | "theme-selection" | "editor">("landing");
  const [activeTab, setActiveTab] = useState<"profile" | "links" | "experience" | "education" | "skills" | "projects">("profile");
  const [rightWorkspaceTab, setRightWorkspaceTab] = useState<"preview" | "ats">("preview");
  const [showATSTab, setShowATSTab] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showATSPanel, setShowATSPanel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newResumeName, setNewResumeName] = useState("Software Engineer Resume");
  const [showRenameModal, setShowRenameModal] = useState<{ isOpen: boolean; resumeId: string; name: string }>({ isOpen: false, resumeId: "", name: "" });
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; resumeId: string; resumeName: string }>({ isOpen: false, resumeId: "", resumeName: "" });
  const [isProfileImported, setIsProfileImported] = useState(false);
  const [showPrinterAnimation, setShowPrinterAnimation] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(400);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [selectedSections, setSelectedSections] = useState({
    personal: true,
    summary: true,
    skills: true,
    education: true,
    experience: true,
    projects: true,
  });

  // Relative Date Formatter
  const formatRelativeDate = useCallback((dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 30) return "Just now";
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} min${mins > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    const isToday = now.toDateString() === date.toDateString();
    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) return "Yesterday";

    if (diffInSeconds < 86400 * 7) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  // Sorted Resumes (Newest updated first)
  const sortedResumes = useMemo(() => {
    return [...resumes].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [resumes]);

  const TemplateComponent = getTemplate(template);

  // Auto-fill profile from SkillVerse Profile & Identity Hub
  const populateFromProfile = useCallback((overrideSections?: Partial<typeof selectedSections>) => {
    const sections = {
      personal: true,
      summary: true,
      skills: true,
      education: true,
      experience: true,
      projects: true,
      ...overrideSections,
    };

    const currentStoreResume = useResumeStore.getState().resume;
    const updated = { ...currentStoreResume };

    // 1. Personal & Contact Info
    if (sections.personal) {
      const fullName = userProfile.fullName || identityProfile?.displayName || "";
      const title = userProfile.headline || "";
      const email = userProfile.email || "";
      const phone = userProfile.phone || "";
      const location = userProfile.location || identityProfile?.location || "";

      updated.profile = {
        ...updated.profile,
        fullName: fullName || updated.profile.fullName,
        title: title || updated.profile.title,
        contact: {
          email: email || updated.profile.contact.email,
          phone: phone || updated.profile.contact.phone,
          location: location || updated.profile.contact.location,
        },
      };

      if (identityProfile?.avatar) {
        setProfilePhoto(identityProfile.avatar);
      }
    }

    // 2. Summary
    if (sections.summary) {
      const summary = userProfile.summary || identityProfile?.bio || "";
      if (summary) {
        updated.profile.summary = summary;
      }
    }

    // 3. Education
    if (sections.education) {
      if (userProfile.education && userProfile.education.length > 0) {
        updated.education = userProfile.education.map((edu, idx) => ({
          id: edu.id || `edu-${idx}-${Date.now()}`,
          institution: edu.school || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.start || "",
          endDate: edu.end || "",
          current: false,
        }));
      } else if (identityProfile?.education && identityProfile.education.length > 0) {
        updated.education = identityProfile.education.map((edu: any, idx: number) => ({
          id: edu.id || `edu-id-${idx}-${Date.now()}`,
          institution: edu.institution || edu.school || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || edu.start || "",
          endDate: edu.endDate || edu.end || "",
          current: !!edu.current,
        }));
      }
    }

    // 4. Experience
    if (sections.experience) {
      if (userProfile.experience && userProfile.experience.length > 0) {
        updated.experience = userProfile.experience.map((exp, idx) => ({
          id: exp.id || `exp-${idx}-${Date.now()}`,
          company: exp.company || "",
          position: exp.role || "",
          startDate: exp.start || "",
          endDate: exp.end || "",
          current: false,
          description: exp.summary ? exp.summary.split("\n").filter(Boolean) : [],
        }));
      } else if (identityProfile?.experience && identityProfile.experience.length > 0) {
        updated.experience = identityProfile.experience.map((exp: any, idx: number) => ({
          id: exp.id || `exp-id-${idx}-${Date.now()}`,
          company: exp.company || "",
          position: exp.position || exp.role || "",
          startDate: exp.startDate || exp.start || "",
          endDate: exp.endDate || exp.end || "",
          current: !!exp.current,
          description: Array.isArray(exp.description)
            ? exp.description
            : exp.summary
            ? exp.summary.split("\n").filter(Boolean)
            : [],
        }));
      }
    }

    // 5. Projects
    if (sections.projects) {
      if (userProfile.projects && userProfile.projects.length > 0) {
        updated.projects = userProfile.projects.map((proj, idx) => ({
          id: proj.id || `proj-${idx}-${Date.now()}`,
          name: proj.name || "",
          description: proj.summary || "",
          technologies: proj.stack ? proj.stack.split(",").map((s) => s.trim()).filter(Boolean) : [],
          link: proj.link || "",
          github: "",
        }));
      } else if (identityProfile?.projects && identityProfile.projects.length > 0) {
        updated.projects = identityProfile.projects.map((proj: any, idx: number) => ({
          id: proj.id || `proj-id-${idx}-${Date.now()}`,
          name: proj.name || "",
          description: proj.description || proj.summary || "",
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies
            : proj.stack
            ? proj.stack.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          link: proj.link || "",
          github: proj.github || "",
        }));
      }
    }

    // 6. Skills
    if (sections.skills) {
      let skillNames: string[] = [];
      if (userProfile.skills && userProfile.skills.trim()) {
        skillNames = userProfile.skills.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (identityProfile?.skills && identityProfile.skills.length > 0) {
        skillNames = identityProfile.skills.map((s: any) => (typeof s === "string" ? s : s.name));
      }

      if (skillNames.length > 0) {
        updated.skills = skillNames.map((name, idx) => ({
          id: `skill-${idx}-${Date.now()}`,
          name,
          level: "Intermediate" as const,
        }));
      }
    }

    setResume(updated);
    setIsProfileImported(true);
  }, [userProfile, identityProfile, setResume]);

  // Initial Auto-fill when resume is uninitialized
  useEffect(() => {
    if (hydrated && (!resume.profile.fullName || (resume.profile.fullName === "Shaik Thehseen" && !isProfileImported))) {
      populateFromProfile();
    }
  }, [hydrated, populateFromProfile, resume.profile.fullName, isProfileImported]);
  
  // Calculate ATS analysis
  const atsAnalysis = useMemo(() => analyzeATS(resume, jobDescription), [resume, jobDescription]);
  const healthScore = useMemo(() => calculateHealthScore(resume, atsAnalysis), [resume, atsAnalysis]);
  
  // Auto-save with debounce and resume history update
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      setTimeout(() => {
        updateLastSaved();
        // Update current resume in history
        if (currentResumeId) {
          setResume({ ...resume, id: currentResumeId });
        }
        setIsSaving(false);
      }, 500);
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [resume, template, theme, setIsSaving, updateLastSaved, setResume, currentResumeId]);

  // Load resumes from localStorage on mount
  useEffect(() => {
    const savedResumes = localStorage.getItem('resume-history');
    if (savedResumes) {
      try {
        const parsedResumes = JSON.parse(savedResumes);
        if (parsedResumes.length > 0) {
          useResumeStore.getState().setResumes(parsedResumes);
          if (!currentResumeId && parsedResumes.length > 0) {
            useResumeStore.getState().loadResume(parsedResumes[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load resume history:', error);
      }
    }
  }, [currentResumeId]);

  // Save resumes to localStorage whenever they change
  useEffect(() => {
    if (resumes.length > 0) {
      localStorage.setItem('resume-history', JSON.stringify(resumes));
    }
  }, [resumes]);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft && leftPanelRef.current) {
        const newWidth = e.clientX;
        if (newWidth >= 300 && newWidth <= 600) {
          setLeftPanelWidth(newWidth);
        }
      }
      if (isResizingRight && rightPanelRef.current) {
        const windowWidth = window.innerWidth;
        const newWidth = windowWidth - e.clientX;
        if (newWidth >= 250 && newWidth <= 500) {
          setRightPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

  return (
    <PageShell>
      {view === "landing" ? (
        // Landing Page - Resume Management Center
        <div className="relative min-h-screen bg-background text-foreground pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            
            {/* 1. HERO SECTION */}
            <div className="space-y-2 animate-fade-up">
              <div className="text-xs font-bold uppercase tracking-widest text-brand">
                RESUME BUILDER
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Create your perfect <span className="text-brand">resume</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Create, customize, and manage professional resumes from your SkillVerse profile.
              </p>
            </div>

            {/* 2. CREATE NEW RESUME CTA CARD */}
            <div className="animate-fade-up">
              <div className="glass rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        +
                      </div>
                      <h2 className="text-lg font-bold text-foreground">Create New Resume</h2>
                    </div>
                    <p className="text-xs text-muted-foreground pl-10 sm:pl-10">
                      Start with your SkillVerse profile data and build a job-ready resume in minutes.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setNewResumeName(`Software Engineer Resume`);
                      setShowCreateModal(true);
                    }}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-semibold px-5 h-10 rounded-xl text-xs shadow-sm shrink-0 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Create Resume
                  </Button>
                </div>
              </div>
            </div>

            {/* 3. RESUME HISTORY SECTION */}
            <div className="space-y-4 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
                  RESUME HISTORY
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your saved resumes
                </p>
              </div>

              {sortedResumes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedResumes.map((r) => {
                    const templateDisplayName = templateNames[r.template || 'ats-professional'] || 'ATS Professional';
                    return (
                      <div
                        key={r.id}
                        className="group relative flex flex-col justify-between p-5 rounded-2xl bg-card border border-border/70 hover:border-brand/40 hover:shadow-md transition-all duration-200"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-bold text-foreground truncate" title={r.name || "My Resume"}>
                                  {r.name || "My Resume"}
                                </h3>
                                <button
                                  onClick={() => setShowRenameModal({ isOpen: true, resumeId: r.id, name: r.name || "My Resume" })}
                                  className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
                                  title="Rename resume"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                {templateDisplayName}
                              </p>
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Saved
                            </span>
                          </div>

                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground/70" /> Updated {formatRelativeDate(r.updatedAt || r.createdAt)}
                          </p>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border/50">
                          <Button
                            size="sm"
                            onClick={() => {
                              loadResume(r.id);
                              setView("editor");
                            }}
                            className="flex-1 bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs h-9 rounded-xl"
                          >
                            Edit Resume
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              duplicateResume(r.id);
                              toast.success("Resume duplicated!");
                            }}
                            className="h-9 px-3 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground"
                            title="Duplicate resume"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDeleteModal({ isOpen: true, resumeId: r.id, resumeName: r.name || "My Resume" });
                            }}
                            className="h-9 px-3 text-xs font-medium rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
                            title="Delete resume"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Compact Empty State */
                <div className="p-8 rounded-2xl border border-dashed border-border/80 bg-card/50 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">No resumes yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first professional resume from your SkillVerse profile data.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewResumeName("Software Engineer Resume");
                      setShowCreateModal(true);
                    }}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs h-9 rounded-xl px-4"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Resume
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : view === "theme-selection" ? (
        // Theme Selection View — Premium SaaS Experience
        <div className="min-h-screen bg-background text-foreground pb-28">
          {/* Header Bar with Breadcrumb and Step Indicator */}
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("landing")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-secondary"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="text-border">/</span>
                <span className="text-xs font-medium text-muted-foreground">
                  Resume Builder / <strong className="text-foreground font-semibold">Create Resume</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-semibold bg-secondary/50 text-foreground border-border/60">
                  Step 1 of 3
                </Badge>
                <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                  <span className="text-brand font-bold">Theme</span> → Details → Preview
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Container */}
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-up">
            
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Choose your resume style
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with a professional template. You can customize everything later.
              </p>
            </div>

            {/* 1. RESUME NAME CARD */}
            <div className="glass rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Resume Name
              </label>
              <Input
                type="text"
                value={resume.name}
                onChange={(e) => setResume({ ...resume, name: e.target.value })}
                placeholder="e.g. Software Engineer Resume"
                className="bg-background text-sm font-medium border-border rounded-xl focus-visible:ring-brand/20 h-11"
              />
              <p className="text-[11px] text-muted-foreground">
                This name is only visible to you.
              </p>
            </div>

            {/* 2. THEME SECTION ("Choose a template") */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Choose a template
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a layout that matches your professional style.
                </p>
              </div>

              {/* Template Cards Responsive Grid */}
              <div 
                role="radiogroup" 
                aria-label="Choose resume template"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {getThemePresetNames().map((presetName) => {
                  const presetTheme = getThemePreset(presetName);
                  const isSelected = (selectedPreset || 'default') === presetName;
                  
                  const descriptions: Record<string, string> = {
                    default: "Simple and balanced",
                    professional: "Classic and corporate",
                    modern: "Clean with a contemporary layout",
                    minimal: "Elegant and distraction-free",
                    creative: "Stand out with personality",
                    tech: "Designed for technical roles",
                  };

                  const presetTemplateMap: Record<string, TemplateType> = {
                    default: 'ats-professional',
                    professional: 'executive',
                    modern: 'modern-minimal',
                    minimal: 'academic',
                    creative: 'designer',
                    tech: 'software-engineer',
                  };

                  const desc = descriptions[presetName] || "Professional layout";

                  const handleSelect = () => {
                    setSelectedPreset(presetName);
                    setTheme(presetTheme);
                    if (presetTemplateMap[presetName]) {
                      setTemplate(presetTemplateMap[presetName]);
                    }
                  };

                  return (
                    <div
                      key={presetName}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect();
                        }
                      }}
                      onClick={handleSelect}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-brand",
                        isSelected
                          ? "border-brand ring-2 ring-brand/30 bg-brand/5 shadow-md"
                          : "border-border/70 hover:border-brand/40"
                      )}
                    >
                      {/* Selected Checkmark Badge (Only on active template) */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 z-10 grid h-6 w-6 place-items-center rounded-full bg-brand text-brand-foreground shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}

                      {/* Realistic Mini Resume Mockup / Visual Thumbnail */}
                      <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50 bg-background/80 p-3 shadow-inner group-hover:border-brand/30 transition-colors">
                        <TemplateThumbnail presetName={presetName} />
                      </div>

                      {/* Theme Details */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-foreground capitalize">
                            {presetName}
                          </h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. COLOR PALETTE ("Choose your color") */}
            <div className="glass rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Choose your color</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set the primary accent color for headers, borders, and skill tags.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {colorPalettes.map((palette) => {
                  const isSelected = theme.colors.primary === palette.primary;
                  return (
                    <button
                      key={palette.name}
                      onClick={() => {
                        setTheme({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: palette.primary,
                            secondary: palette.secondary,
                            accent: palette.accent,
                          },
                        });
                      }}
                      className={cn(
                        "relative h-12 w-12 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105",
                        isSelected
                          ? "ring-2 ring-brand ring-offset-2 scale-105 shadow-md"
                          : "hover:ring-2 hover:ring-border"
                      )}
                      style={{ backgroundColor: palette.primary }}
                      title={palette.name}
                    >
                      {isSelected && <Check className="h-5 w-5 text-white drop-shadow-md" />}
                    </button>
                  );
                })}
              </div>

              {/* Selected Color Name Label */}
              {(() => {
                const match = colorPalettes.find((p) => p.primary === theme.colors.primary);
                return match ? (
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pt-1">
                    Selected: <span className="font-bold text-foreground">{match.name}</span>
                  </p>
                ) : null;
              })()}
            </div>

            {/* 4. FONT FAMILY ("Choose your font") */}
            <div className="glass rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Choose your font</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select typography that matches your professional tone.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {fontOptions.map((font) => {
                  const isSelected = theme.typography.fontFamily === font.value;
                  return (
                    <button
                      key={font.value}
                      onClick={() => {
                        setTheme({
                          ...theme,
                          typography: {
                            ...theme.typography,
                            fontFamily: font.value,
                            headingFont: font.value,
                            bodyFont: font.value,
                          },
                        });
                      }}
                      className={cn(
                        "flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 text-left shadow-sm hover:shadow-md",
                        isSelected
                          ? "border-brand ring-2 ring-brand/30 bg-brand/5"
                          : "border-border/70 bg-card hover:border-brand/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{font.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
                      </div>

                      <div className="mt-3 space-y-0.5" style={{ fontFamily: font.value }}>
                        <div className="text-xl font-bold text-foreground">Aa</div>
                        <div className="text-[11px] text-muted-foreground truncate">Software Engineer</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </main>

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-xl py-3.5 px-4 sm:px-6 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                <span className="font-bold text-foreground">Step 1 of 3</span> — Choose Your Theme
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("landing")}
                  className="rounded-xl text-xs font-semibold px-4 h-10"
                >
                  Back
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    saveResume();
                    setView("editor");
                    toast.success("Theme saved!");
                  }}
                  className="bg-brand text-brand-foreground hover:opacity-90 font-semibold px-6 h-10 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                >
                  Save & Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Editor View — Premium Modern Resume Workspace
        <div className="flex flex-col h-screen bg-background overflow-hidden">
          
          {/* 1. TOP HEADER BAR */}
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl shrink-0">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6">
              
              {/* Left: Back, Title, Saved Badge */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    saveResume();
                    setView("landing");
                  }}
                  className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>

                <span className="text-border/70 hidden sm:inline">|</span>

                <div className="hidden sm:block">
                  <h1 className="text-xs font-bold text-foreground leading-none">
                    SkillVerse Resume Builder
                  </h1>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-[11px] font-medium text-muted-foreground truncate max-w-[170px]">
                      {resume.name || "My Resume"}
                    </p>
                    <button
                      onClick={() => setShowRenameModal({ isOpen: true, resumeId: resume.id, name: resume.name || "My Resume" })}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                      title="Rename resume"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Saved Status Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isSaving ? "Saving..." : "Saved"}
                </span>
              </div>

              {/* Right: Actions (Save, Update from Profile, Template, ATS Panel, Export PDF) */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    saveResume();
                    toast.success("Resume saved successfully!");
                  }}
                  className="h-8 text-xs font-semibold rounded-xl gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Save className="h-3.5 w-3.5" /> <span>Save</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfileUpdateModal(true)}
                  className="h-8 text-xs font-semibold rounded-xl gap-1.5 border-brand/30 text-brand hover:bg-brand/5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Update from Profile</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("theme-selection")}
                  className="h-8 text-xs font-semibold rounded-xl gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand" /> <span className="hidden sm:inline">Template</span>
                </Button>

                {identityProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportModal(true)}
                    className="h-8 text-xs font-medium rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" /> <span className="hidden md:inline">Import</span>
                  </Button>
                )}

                <Button
                  variant={showATSTab && rightWorkspaceTab === "ats" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (showATSTab && rightWorkspaceTab === "ats") {
                      setRightWorkspaceTab("preview");
                    } else {
                      setShowATSTab(true);
                      setRightWorkspaceTab("ats");
                    }
                  }}
                  className={cn(
                    "h-8 text-xs font-semibold rounded-xl gap-1.5",
                    showATSTab && rightWorkspaceTab === "ats" && "bg-brand text-brand-foreground"
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ATS Scanner</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                    atsAnalysis.score >= 80
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : atsAnalysis.score >= 60
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}>
                    {atsAnalysis.score}%
                  </span>
                </Button>

                {/* Primary CTA: Export Resume */}
                <Button
                  size="sm"
                  onClick={() => {
                    saveResume();
                    setShowExportModal(true);
                  }}
                  className="h-8 bg-brand text-brand-foreground hover:opacity-90 font-semibold px-4 rounded-xl text-xs shadow-sm gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </header>

          {/* Profile Completion & Auto-fill Notice Banner */}
          {completion > 0 && completion < 100 && (
            <div className="bg-brand/5 border-b border-brand/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0">
              <span className="text-muted-foreground font-medium">
                Your profile is <strong className="text-brand font-bold">{completion}% complete</strong>. Complete it to pre-fill more resume sections.
              </span>
              <Link to="/profile" className="text-brand hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-4">
                Complete Profile →
              </Link>
            </div>
          )}

          {/* 2. SECTION NAVIGATION BAR (Step Tabs) */}
          <div className="border-b border-border/70 bg-card/60 backdrop-blur-md px-4 sm:px-6 py-2 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: "profile", label: "Profile" },
                { id: "links", label: "Profile Links" },
                { id: "experience", label: "Experience" },
                { id: "education", label: "Education" },
                { id: "skills", label: "Skills" },
                { id: "projects", label: "Projects" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      isActive
                        ? "bg-brand text-brand-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. TWO-PANEL WORKSPACE (Left Form Editor + Right Preview Workspace) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT PANEL: Form Editor */}
            <div 
              ref={leftPanelRef}
              className="relative flex flex-col bg-card border-r border-border/70 overflow-hidden shrink-0"
              style={{ width: `${leftPanelWidth}px` }}
            >
              {/* Resize Handle */}
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-brand/30 transition-colors z-10"
                onMouseDown={() => setIsResizingLeft(true)}
              />

              {/* Form Content Area (Independent Slim Scrollbar) */}
              <div className="flex-1 overflow-y-auto custom-editor-scrollbar p-5 space-y-5">
                
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <div className="space-y-5 animate-fade-up">
                    
                    {/* Basic Information (No Profile Photo) */}
                    <div className="space-y-3">
                      <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">Full Name</label>
                          <Input
                            type="text"
                            value={resume.profile.fullName}
                            onChange={(e) => updateProfile({ fullName: e.target.value })}
                            placeholder="Shaik Thehseen"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">Job Title</label>
                          <Input
                            type="text"
                            value={resume.profile.title}
                            onChange={(e) => updateProfile({ title: e.target.value })}
                            placeholder="Java Full Stack Developer"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Contact Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">Email</label>
                          <Input
                            type="email"
                            value={resume.profile.contact.email}
                            onChange={(e) => updateContact({ email: e.target.value })}
                            placeholder="thehseenshaik@gmail.com"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">Phone</label>
                          <Input
                            type="tel"
                            value={resume.profile.contact.phone}
                            onChange={(e) => updateContact({ phone: e.target.value })}
                            placeholder="9398683053"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">Location</label>
                          <Input
                            type="text"
                            value={resume.profile.contact.location}
                            onChange={(e) => updateContact({ location: e.target.value })}
                            placeholder="Tadepalli, AP"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Online Profiles & Links */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Online Profiles & Links
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                            <span>LinkedIn Profile URL</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Recommended for ATS</span>
                          </label>
                          <Input
                            type="url"
                            value={resume.profile.contact.linkedin || ""}
                            onChange={(e) => updateContact({ linkedin: e.target.value })}
                            placeholder="linkedin.com/in/thehseenshaik"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                            <span>GitHub Profile URL</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Developer Portfolio</span>
                          </label>
                          <Input
                            type="url"
                            value={resume.profile.contact.github || ""}
                            onChange={(e) => updateContact({ github: e.target.value })}
                            placeholder="github.com/thehseenshaik"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-foreground mb-1.5 block">
                            Portfolio / Website URL
                          </label>
                          <Input
                            type="url"
                            value={resume.profile.contact.portfolio || resume.profile.contact.website || ""}
                            onChange={(e) => updateContact({ portfolio: e.target.value, website: e.target.value })}
                            placeholder="thehseen.dev"
                            className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        Professional Summary
                      </h3>
                      <div>
                        <label className="text-[12px] font-bold text-foreground mb-1.5 block">Professional Summary</label>
                        <textarea
                          value={resume.profile.summary || ""}
                          onChange={(e) => updateProfile({ summary: e.target.value })}
                          placeholder="Write a concise professional summary..."
                          className="w-full rounded-xl border border-border bg-background p-3 text-[14px] font-normal text-foreground/90 leading-relaxed focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 min-h-24 resize-y"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PROFILE LINKS TAB */}
                {activeTab === "links" && (
                  <div className="space-y-5 animate-fade-up">
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-bold uppercase tracking-wider text-foreground">
                        Profile Links & Socials
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Add your LinkedIn, GitHub, and Portfolio URLs. These links will appear in your resume header.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Link2 className="h-3.5 w-3.5 text-blue-500" /> LinkedIn Profile
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Recommended for ATS
                          </span>
                        </label>
                        <Input
                          type="url"
                          value={resume.profile.contact.linkedin || ""}
                          onChange={(e) => updateContact({ linkedin: e.target.value })}
                          placeholder="linkedin.com/in/thehseenshaik"
                          className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                        />
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-foreground" /> GitHub Profile
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">Code & Repositories</span>
                        </label>
                        <Input
                          type="url"
                          value={resume.profile.contact.github || ""}
                          onChange={(e) => updateContact({ github: e.target.value })}
                          placeholder="github.com/thehseenshaik"
                          className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                        />
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-brand" /> Portfolio / Personal Website
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">Live Projects</span>
                        </label>
                        <Input
                          type="url"
                          value={resume.profile.contact.portfolio || resume.profile.contact.website || ""}
                          onChange={(e) => updateContact({ portfolio: e.target.value, website: e.target.value })}
                          placeholder="thehseen.dev"
                          className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                        />
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-foreground mb-1.5 block flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-amber-500" /> LeetCode / Coding Profile
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                        </label>
                        <Input
                          type="url"
                          value={resume.profile.contact.leetcode || ""}
                          onChange={(e) => updateContact({ leetcode: e.target.value } as any)}
                          placeholder="leetcode.com/thehseenshaik"
                          className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* EXPERIENCE TAB */}
                {activeTab === "experience" && (
                  <div className="space-y-4 animate-fade-up">
                    <Button
                      onClick={() => addExperience({ company: "", position: "", startDate: "", endDate: "", current: false, description: [] })}
                      className="w-full rounded-xl bg-brand text-brand-foreground text-xs font-semibold h-[42px] gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Experience
                    </Button>

                    {resume.experience.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground py-6">
                        No experience added yet. Click above to add.
                      </div>
                    ) : (
                      resume.experience.map((exp) => (
                        <div key={exp.id} className="p-4 rounded-xl border border-border/70 bg-background/50 space-y-3 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-foreground">Experience Item</span>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-xs text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Position Title</label>
                            <Input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                              placeholder="Position Title"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Company Name</label>
                            <Input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                              placeholder="Company Name"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[12px] font-bold text-foreground mb-1.5 block">Start Date</label>
                              <Input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                placeholder="Start Date"
                                className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                              />
                            </div>
                            <div>
                              <label className="text-[12px] font-bold text-foreground mb-1.5 block">End Date</label>
                              <Input
                                type="text"
                                value={exp.endDate || ""}
                                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                placeholder="End Date"
                                className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Bullet Points (one per line)</label>
                            <textarea
                              value={exp.description.join("\n")}
                              onChange={(e) => updateExperience(exp.id, { description: e.target.value.split("\n") })}
                              placeholder="Bullet points..."
                              className="w-full rounded-xl border border-border bg-background p-3 text-[14px] font-normal text-foreground/90 min-h-20 resize-y focus:border-brand focus:ring-1 focus:ring-brand/30"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* EDUCATION TAB */}
                {activeTab === "education" && (
                  <div className="space-y-4 animate-fade-up">
                    <Button
                      onClick={() => addEducation({ institution: "", degree: "", field: "", startDate: "", endDate: "", current: false })}
                      className="w-full rounded-xl bg-brand text-brand-foreground text-xs font-semibold h-[42px] gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Education
                    </Button>

                    {resume.education.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground py-6">
                        No education added yet. Click above to add.
                      </div>
                    ) : (
                      resume.education.map((edu) => (
                        <div key={edu.id} className="p-4 rounded-xl border border-border/70 bg-background/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-foreground">Education Item</span>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-xs text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Degree</label>
                            <Input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                              placeholder="Degree (e.g. B.Tech)"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Institution</label>
                            <Input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                              placeholder="Institution / University"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Field of Study</label>
                            <Input
                              type="text"
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                              placeholder="Field of Study"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[12px] font-bold text-foreground mb-1.5 block">Start Date</label>
                              <Input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                placeholder="Start Date"
                                className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                              />
                            </div>
                            <div>
                              <label className="text-[12px] font-bold text-foreground mb-1.5 block">End Date</label>
                              <Input
                                type="text"
                                value={edu.endDate || ""}
                                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                placeholder="End Date"
                                className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SKILLS TAB */}
                {activeTab === "skills" && (
                  <div className="space-y-4 animate-fade-up">
                    {(githubData || leetcodeData) && (
                      <Button
                        onClick={() => {
                          const skillsToAdd: string[] = [];
                          if (githubData?.languages) {
                            Object.keys(githubData.languages).forEach(lang => {
                              if (!resume.skills.some(s => s.name.toLowerCase() === lang.toLowerCase())) {
                                skillsToAdd.push(lang);
                              }
                            });
                          }
                          skillsToAdd.forEach(skillName => {
                            addSkill({ name: skillName, level: "Intermediate" });
                          });
                        }}
                        variant="outline"
                        className="w-full rounded-xl text-xs font-semibold h-[42px] gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 text-brand" /> Auto-import from Platforms
                      </Button>
                    )}

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-foreground block mb-1.5">Add New Skill</label>
                      <Input
                        type="text"
                        placeholder="Type skill & press Enter..."
                        className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addSkill({ name: e.currentTarget.value.trim(), level: "Intermediate" });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {resume.skills.map((skill) => (
                        <div key={skill.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 text-foreground rounded-full text-xs font-semibold border border-border">
                          <span>{skill.name}</span>
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === "projects" && (
                  <div className="space-y-4 animate-fade-up">
                    <Button
                      onClick={() => addProject({ name: "", description: "", technologies: [], link: "", github: "" })}
                      className="w-full rounded-xl bg-brand text-brand-foreground text-xs font-semibold h-[42px] gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Project
                    </Button>

                    {resume.projects.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground py-6">
                        No projects added yet. Click above to add.
                      </div>
                    ) : (
                      resume.projects.map((project) => (
                        <div key={project.id} className="p-4 rounded-xl border border-border/70 bg-background/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-foreground">Project Item</span>
                            <button
                              onClick={() => removeProject(project.id)}
                              className="text-xs text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Project Name</label>
                            <Input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, { name: e.target.value })}
                              placeholder="Project Name"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, { description: e.target.value })}
                              placeholder="Project Description..."
                              className="w-full rounded-xl border border-border bg-background p-3 text-[14px] font-normal text-foreground/90 min-h-20 resize-y focus:border-brand focus:ring-1 focus:ring-brand/30"
                            />
                          </div>

                          <div>
                            <label className="text-[12px] font-bold text-foreground mb-1.5 block">Technologies</label>
                            <Input
                              type="text"
                              value={project.technologies.join(", ")}
                              onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(",").map(t => t.trim()) })}
                              placeholder="Technologies (comma separated)"
                              className="bg-background text-[14px] font-normal text-foreground/90 h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT PANEL: Workspace (Chrome-Style Tab Switcher between Live Resume Preview & Full ATS Scanner) */}
            <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden relative">
              
              {/* Chrome-Style Tab Header Bar */}
              <div className="h-11 border-b border-border/70 bg-card/80 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs">
                {/* Chrome-Style Tab List */}
                <div className="flex items-center gap-1.5 h-full pt-1.5" role="tablist">
                  {/* Tab 1: Live Resume Preview (Permanent — NO CLOSE BUTTON) */}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={rightWorkspaceTab === "preview"}
                    onClick={() => setRightWorkspaceTab("preview")}
                    className={cn(
                      "h-9 px-3.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-t border-x transition-all relative cursor-pointer outline-none",
                      rightWorkspaceTab === "preview"
                        ? "bg-background border-border text-foreground font-bold shadow-xs -mb-px z-10"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 text-brand" />
                    <span>Resume Preview</span>
                    <Badge variant="outline" className="text-[9px] font-mono uppercase px-1.5 py-0 h-4 bg-secondary/60 text-muted-foreground border-border/60">
                      {template}
                    </Badge>
                  </button>

                  {/* Tab 2: ATS Scanner & Job Match (Has Close Button ✕) */}
                  {showATSTab && (
                    <div
                      className={cn(
                        "h-9 pl-3 pr-1.5 rounded-t-xl text-xs font-semibold flex items-center gap-1.5 border-t border-x transition-all relative group",
                        rightWorkspaceTab === "ats"
                          ? "bg-background border-border text-foreground font-bold shadow-xs -mb-px z-10"
                          : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={rightWorkspaceTab === "ats"}
                        onClick={() => setRightWorkspaceTab("ats")}
                        className="flex items-center gap-1.5 cursor-pointer outline-none"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>ATS Scanner</span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none",
                          atsAnalysis.score >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : atsAnalysis.score >= 60
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        )}>
                          {atsAnalysis.score}%
                        </span>
                      </button>

                      {/* Close Tab Button (✕) — Only for ATS Scanner, NOT for preview */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowATSTab(false);
                          setRightWorkspaceTab("preview");
                        }}
                        className="h-5 w-5 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors p-0.5"
                        title="Close ATS Scanner tab"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Controls: Zoom Controls in Preview mode, or Back to Resume in ATS mode */}
                <div className="flex items-center gap-2">
                  {rightWorkspaceTab === "preview" ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom(Math.max(50, zoom - 10) as any)}
                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      
                      <span className="text-xs font-bold text-foreground w-9 text-center">
                        {zoom}%
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom(Math.min(150, zoom + 10) as any)}
                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Zoom In"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightWorkspaceTab("preview")}
                      className="h-7 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1"
                    >
                      <FileText className="h-3 w-3 text-brand" /> Back to Resume
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Tab View */}
              {rightWorkspaceTab === "preview" ? (
                /* Centered A4 Resume Paper Canvas */
                <div 
                  className={cn(
                    "flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start",
                    isFullscreen && "fixed inset-0 z-50 bg-background p-12"
                  )}
                >
                  {/* Floating Exit Fullscreen Button */}
                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl shadow-lg hover:opacity-90 transition-opacity text-xs font-bold"
                    >
                      <X className="h-4 w-4" />
                      <span>Exit Fullscreen</span>
                    </button>
                  )}

                  <div 
                    id="resume-preview-document"
                    ref={previewRef}
                    className="bg-white text-black shadow-2xl rounded-sm transition-transform duration-200 resume-page"
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      padding: "16mm 18mm",
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                    }}
                  >
                    <TemplateComponent resume={resume} theme={theme} />
                  </div>
                </div>
              ) : (
                /* Full-Width ATS Panel View */
                <div className="flex-1 overflow-hidden">
                  <ATSPanel
                    atsAnalysis={atsAnalysis}
                    healthScore={healthScore}
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                    onAddSkill={(skillName) => addSkill({ name: skillName, level: "Intermediate" } as any)}
                    resume={resume}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Identity Hub Import Modal */}
      {showImportModal && identityProfile && (
        <IdentityHubImportModal
          identityProfile={identityProfile}
          currentResume={resume}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Update from Profile Section Selection Modal */}
      {showProfileUpdateModal && (
        <Dialog open={showProfileUpdateModal} onOpenChange={setShowProfileUpdateModal}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Update Resume from Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select which resume sections to update with your latest SkillVerse profile information.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-2">
              {Object.entries({
                personal: "Personal Information & Contact",
                summary: "Professional Summary",
                skills: "Skills & Technical Stack",
                education: "Education Entries",
                experience: "Experience Entries",
                projects: "Project Entries",
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-background/50 cursor-pointer hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={selectedSections[key as keyof typeof selectedSections]}
                    onChange={(e) => setSelectedSections({ ...selectedSections, [key]: e.target.checked })}
                    className="h-4 w-4 rounded accent-brand"
                  />
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                </label>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setShowProfileUpdateModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  populateFromProfile(selectedSections);
                  setShowProfileUpdateModal(false);
                  toast.success("Resume updated from SkillVerse profile!");
                }}
                className="bg-brand text-brand-foreground font-semibold"
              >
                Update Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create New Resume Modal */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Create a new resume
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Give your resume a title to easily identify it in your job applications.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-foreground mb-1.5 block">
                  Resume Name
                </label>
                <Input
                  type="text"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                  placeholder="e.g. Java Backend — 2026"
                  className="bg-background text-[14px] font-normal text-foreground h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const nameToUse = newResumeName.trim() || "My Resume";
                      createNewResume(nameToUse);
                      populateFromProfile();
                      setShowCreateModal(false);
                      setView("theme-selection");
                      toast.success("Resume created!");
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const nameToUse = newResumeName.trim() || "My Resume";
                  createNewResume(nameToUse);
                  populateFromProfile();
                  setShowCreateModal(false);
                  setView("theme-selection");
                  toast.success("Resume created!");
                }}
                className="bg-brand text-brand-foreground font-semibold"
              >
                Create Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rename Resume Modal */}
      {showRenameModal.isOpen && (
        <Dialog open={showRenameModal.isOpen} onOpenChange={(open) => setShowRenameModal({ ...showRenameModal, isOpen: open })}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Rename Resume
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter a new name for this resume.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-foreground mb-1.5 block">
                  Resume Name
                </label>
                <Input
                  type="text"
                  value={showRenameModal.name}
                  onChange={(e) => setShowRenameModal({ ...showRenameModal, name: e.target.value })}
                  placeholder="e.g. Software Engineer Resume"
                  className="bg-background text-[14px] font-normal text-foreground h-[42px] px-3.5 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand/30 focus-visible:border-brand"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && showRenameModal.name.trim()) {
                      renameResume(showRenameModal.resumeId, showRenameModal.name.trim());
                      setShowRenameModal({ isOpen: false, resumeId: "", name: "" });
                      toast.success("Resume renamed!");
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setShowRenameModal({ isOpen: false, resumeId: "", name: "" })}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (showRenameModal.name.trim()) {
                    renameResume(showRenameModal.resumeId, showRenameModal.name.trim());
                    setShowRenameModal({ isOpen: false, resumeId: "", name: "" });
                    toast.success("Resume renamed!");
                  }
                }}
                className="bg-brand text-brand-foreground font-semibold"
              >
                Save Name
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal.isOpen && (
        <Dialog open={showDeleteModal.isOpen} onOpenChange={(open) => setShowDeleteModal({ ...showDeleteModal, isOpen: open })}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Delete Resume?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete <strong className="text-foreground font-semibold">"{showDeleteModal.resumeName}"</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal({ isOpen: false, resumeId: "", resumeName: "" })}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteResume(showDeleteModal.resumeId);
                  setShowDeleteModal({ isOpen: false, resumeId: "", resumeName: "" });
                  toast.success("Resume deleted!");
                }}
                className="font-semibold"
              >
                Delete Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Resume Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          resume={resume}
          previewElement={previewRef.current}
        />
      )}

      {/* Printer Animation */}
      {showPrinterAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl px-4">
            <ResumePrinter
              active={showPrinterAnimation}
              onDone={() => setShowPrinterAnimation(false)}
              duration={3000}
            />
          </div>
        </div>
      )}
    </PageShell>
  );
}

function TemplateThumbnail({ presetName }: { presetName: string }) {
  switch (presetName) {
    case "professional":
      return (
        <div className="h-full w-full flex flex-col gap-1.5 p-1">
          <div className="h-5 w-full rounded bg-blue-700 dark:bg-blue-600 flex flex-col justify-center px-2 py-0.5 shadow-xs">
            <div className="h-1.5 w-14 rounded bg-white font-bold" />
            <div className="h-1 w-20 rounded bg-blue-200 mt-0.5" />
          </div>
          <div className="space-y-1 pt-1 px-1">
            <div className="h-1.5 w-12 rounded bg-blue-700/70" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
            <div className="h-1 w-4/5 rounded bg-muted-foreground/20" />
          </div>
          <div className="space-y-1 pt-1 px-1">
            <div className="h-1.5 w-10 rounded bg-blue-700/70" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
          </div>
        </div>
      );

    case "modern":
      return (
        <div className="h-full w-full flex gap-2 p-1">
          <div className="w-1/3 h-full rounded-md bg-pink-500/10 dark:bg-pink-500/20 border-r border-pink-500/20 p-1.5 space-y-1.5">
            <div className="h-5 w-5 rounded-full bg-pink-500/40 mx-auto" />
            <div className="h-1 w-full rounded bg-pink-500/40" />
            <div className="h-1 w-3/4 rounded bg-pink-500/25" />
            <div className="h-1 w-full rounded bg-pink-500/25" />
          </div>
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-2 w-16 rounded bg-foreground/80" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
            <div className="h-1 w-4/5 rounded bg-muted-foreground/20" />
            <div className="h-1.5 w-10 rounded bg-pink-500/60 pt-1" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className="h-full w-full flex flex-col justify-between p-2 bg-background border border-border/40 rounded-md">
          <div className="space-y-1">
            <div className="h-2.5 w-20 rounded-none bg-foreground font-bold" />
            <div className="h-1 w-28 rounded-none bg-muted-foreground/40" />
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full rounded-none bg-muted-foreground/30" />
            <div className="h-1 w-5/6 rounded-none bg-muted-foreground/20" />
            <div className="h-1 w-4/6 rounded-none bg-muted-foreground/20" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-12 rounded-none bg-foreground/60" />
            <div className="h-1 w-full rounded-none bg-muted-foreground/20" />
          </div>
        </div>
      );

    case "creative":
      return (
        <div className="h-full w-full flex flex-col gap-1.5 p-1.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-2 w-16 rounded bg-red-600 font-serif" />
              <div className="h-1 w-12 rounded bg-amber-500/70" />
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded" />
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-12 rounded bg-red-500/70 font-semibold" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
            <div className="h-1 w-3/4 rounded bg-muted-foreground/20" />
          </div>
        </div>
      );

    case "tech":
      return (
        <div className="h-full w-full flex flex-col gap-1.5 p-1.5">
          <div className="h-5 w-full rounded bg-zinc-900 text-emerald-400 p-1 flex items-center justify-between border border-emerald-500/30">
            <div className="h-1.5 w-14 rounded bg-emerald-400" />
            <div className="h-1 w-8 rounded bg-emerald-500/40" />
          </div>
          <div className="flex gap-1">
            <span className="h-2.5 px-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[7px] text-emerald-600 font-mono flex items-center">CLI</span>
            <span className="h-2.5 px-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[7px] text-emerald-600 font-mono flex items-center">GIT</span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-12 rounded bg-emerald-600/70" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
          </div>
        </div>
      );

    default: // default theme
      return (
        <div className="h-full w-full flex flex-col gap-1.5 p-1.5">
          <div className="h-2.5 w-24 rounded bg-foreground font-bold" />
          <div className="h-1 w-32 rounded bg-muted-foreground/40" />
          <div className="h-px w-full bg-border" />
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-14 rounded bg-brand/70 font-semibold" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
            <div className="h-1 w-4/5 rounded bg-muted-foreground/20" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-10 rounded bg-brand/70 font-semibold" />
            <div className="h-1 w-full rounded bg-muted-foreground/30" />
          </div>
        </div>
      );
  }
}
