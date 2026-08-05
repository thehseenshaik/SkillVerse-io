import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { PageShell } from "@/components/SiteChrome";
import { useResumeStore } from "@/lib/resume/store";
import { getTemplate, templateNames } from "@/components/resume/templates";
import { getThemePreset, getThemePresetNames, colorPalettes, fontOptions } from "@/lib/resume/theme-system";
import { analyzeATS, calculateHealthScore } from "@/lib/resume/ats-analyzer";
import { ATSPanel } from "@/components/resume/ATSPanel";
import { IdentityHubImportModal } from "@/components/resume/IdentityHubImportModal";
import { generateProfessionalSummary } from "@/lib/resume/ai-assistant";
import { exportResume } from "@/lib/resume/export-formats";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useState, useMemo, useEffect, useRef } from "react";
import { X, Clock, Copy, Trash2, Plus, History, Search, User, Briefcase, Mail, Phone, MapPin, Download, Sparkles } from "lucide-react";
import { ResumePrinter } from "@/components/ResumePrinter";

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
  const { resume, template, theme, zoom, isFullscreen, setZoom, setIsFullscreen, setTemplate, setTheme, lastSaved, isSaving, setIsSaving, updateLastSaved, resumes, currentResumeId, loadResume, createNewResume, duplicateResume, deleteResume, setResume, updateProfile, updateContact, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, addSkill, updateSkill, removeSkill, addProject, updateProject, removeProject } = useResumeStore();
  const { profile: identityProfile } = useIdentityHub();
  const { githubData, leetcodeData } = usePlatformStore();
  const [view, setView] = useState<"landing" | "theme-selection" | "editor">("landing");
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "education" | "skills" | "projects">("profile");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showATSPanel, setShowATSPanel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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

  const TemplateComponent = getTemplate(template);
  
  // Auto-fill profile from Identity Hub when creating new resume
  useEffect(() => {
    if (identityProfile && view === "theme-selection" && !resume.profile.fullName) {
      updateProfile({
        fullName: identityProfile.displayName || "",
        title: "",
        summary: identityProfile.bio || "",
      });
      updateContact({
        email: "",
        phone: "",
        location: identityProfile.location || "",
      });
      if (identityProfile.avatar) {
        setProfilePhoto(identityProfile.avatar);
      }
    }
  }, [identityProfile, view, resume.profile.fullName, updateProfile, updateContact]);
  
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
        // Landing Page - Resume Selection
        <div className="relative overflow-hidden min-h-screen">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand/5 to-purple-500/5 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-blob delay-2000" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-blob delay-4000" />
          </div>

          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8 animate-fade-up">
              <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                Resume Builder
              </div>
              <h1 className="mt-2 text-3xl font-bold text-foreground mb-2">
                Create your perfect{" "}
                <span className="text-gradient">resume</span>
              </h1>
              <p className="text-muted-foreground text-sm">Create, edit, and manage your professional resumes with AI-powered tools</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Create New Resume Card */}
              <button
                onClick={() => {
                  createNewResume();
                  setView("theme-selection");
                }}
                className="group relative overflow-hidden p-5 rounded-2xl border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="relative z-10 flex flex-col items-center justify-center h-40">
                  <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mb-3 group-hover:bg-brand/20 transition-colors">
                    <Plus className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Create New Resume</h3>
                  <p className="text-xs text-muted-foreground">Start from scratch</p>
                </div>
                <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-brand/10 blur-2xl transition-all duration-300 group-hover:bg-brand/20" />
              </button>

              {/* Resume History Cards */}
              {resumes.map((r) => (
                <div
                  key={r.id}
                  className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 hover:border-brand/50 hover:shadow-lg transition-all duration-200 shadow-sm"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground mb-1">{r.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Last updated: {new Date(r.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            duplicateResume(r.id);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this resume?')) {
                              deleteResume(r.id);
                            }
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        loadResume(r.id);
                        setView("editor");
                      }}
                      className="w-full py-2 bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg font-medium hover:shadow-md transition-all duration-200 text-xs"
                    >
                      Edit Resume
                    </button>
                  </div>
                  <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-brand/5 blur-2xl transition-all duration-300 group-hover:bg-brand/10" />
                </div>
              ))}
            </div>

            {resumes.length === 0 && (
              <div className="text-center py-16 animate-fade-up">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-elegant">
                  <History className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-6">Create your first resume to get started</p>
              </div>
            )}
          </div>
        </div>
      ) : view === "theme-selection" ? (
        // Theme Selection View
        <div className="min-h-screen animate-gradient">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-6">
              <button
                onClick={() => setView("landing")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-2">Choose Your Theme</h1>
              <p className="text-muted-foreground text-sm">Select a theme, color palette, and font for your resume</p>
            </div>

            <div className="space-y-6">
              {/* Resume Name */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Resume Name</h2>
                <input
                  type="text"
                  value={resume.name}
                  onChange={(e) => setResume({ ...resume, name: e.target.value })}
                  placeholder="My Resume"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 shadow-sm"
                />
              </div>
              {/* Theme Presets */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Theme Presets</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getThemePresetNames().map((presetName) => (
                    <button
                      key={presetName}
                      onClick={() => {
                        setTheme(getThemePreset(presetName));
                      }}
                      className="p-3 rounded-xl border-2 border-border hover:border-brand hover:bg-brand/5 transition-all duration-200 shadow-sm"
                    >
                      <div className="text-xs font-medium capitalize">{presetName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Color Palette</h2>
                <div className="flex flex-wrap gap-3">
                  {colorPalettes.map((palette) => (
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
                      className="w-12 h-12 rounded-xl border-2 border-border hover:border-brand hover:scale-105 transition-all duration-200 shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                      title={palette.name}
                    />
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Font Family</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {fontOptions.map((font) => (
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
                      className={`p-3 rounded-xl border-2 border-border hover:border-brand hover:bg-brand/5 transition-all duration-200 shadow-sm ${
                        theme.typography.fontFamily === font.value ? "border-brand bg-brand/10" : ""
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="text-xs font-medium">{font.label}</div>
                      <div className="text-xs opacity-70 mt-1">Welcome</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-6">
                <button
                  onClick={() => setView("editor")}
                  className="w-full py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand/90 transition-colors shadow-sm hover:shadow-md"
                >
                  Continue to Editor →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Editor View - Three Panel Layout
        <div className="flex h-screen bg-background">
          {/* Left Panel - Editor */}
          <div 
            ref={leftPanelRef}
            className="relative flex flex-col bg-card shadow-card"
            style={{ width: `${leftPanelWidth}px` }}
          >
            {/* Resize Handle */}
            <div
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-brand/20 transition-colors z-10"
              onMouseDown={() => setIsResizingLeft(true)}
            />
            {/* Toolbar */}
            <div className="border-b border-border p-4 space-y-3 bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xs font-bold">Resume Builder</h1>
                  <p className="text-xs text-muted-foreground">{resume.name}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSaving ? (
                    <span className="flex items-center gap-1 text-brand animate-pulse">
                      <Clock className="h-3 w-3" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      Saved
                    </span>
                  ) : (
                    <span>Unsaved</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView("landing")}
                  className="flex-1 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setShowTemplateSelector(!showTemplateSelector);
                  }}
                  className={`flex-1 px-3 py-2 text-xs font-medium border border-border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                    showTemplateSelector 
                      ? "bg-gradient-to-r from-brand to-brand-strong text-white border-transparent" 
                      : "hover:bg-muted"
                  }`}
                >
                  Template
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Import
                </button>
              </div>
              
              {/* Template Selector */}
              {showTemplateSelector && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Select Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(templateNames).map(([key, name]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setTemplate(key as any);
                          setShowTemplateSelector(false);
                        }}
                        className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                          template === key
                            ? "bg-brand text-white"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Premium Pill Navigation */}
            <div className="px-4 py-3 bg-gradient-to-r from-background to-muted/20 border-b border-border">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "profile", label: "Profile" },
                  { id: "experience", label: "Experience" },
                  { id: "education", label: "Education" },
                  { id: "skills", label: "Skills" },
                  { id: "projects", label: "Projects" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-brand to-brand-strong text-white shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand-strong opacity-0 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto p-4 antialiased">
              {activeTab === "profile" && (
                <div className="space-y-4 animate-slide-in">
                  {/* Profile Photo */}
                  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <label className="block text-xs font-semibold mb-3 text-foreground">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {profilePhoto ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand/20 shadow-md">
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setProfilePhoto("")}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-brand/30 flex items-center justify-center bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                          <span className="text-xs text-muted-foreground">Upload</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfilePhoto(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20"
                        />
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
                    <label className="block text-xs font-semibold text-foreground">Basic Information</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={resume.profile.fullName}
                        onChange={(e) => updateProfile({ fullName: e.target.value })}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={resume.profile.title}
                        onChange={(e) => updateProfile({ title: e.target.value })}
                        placeholder="Job Title"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
                    <label className="block text-xs font-semibold text-foreground">Contact Details</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={resume.profile.contact.email}
                        onChange={(e) => updateContact({ email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={resume.profile.contact.phone}
                        onChange={(e) => updateContact({ phone: e.target.value })}
                        placeholder="Phone Number"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={resume.profile.contact.location}
                        onChange={(e) => updateContact({ location: e.target.value })}
                        placeholder="Location"
                        className="w-full pl-10 pr-4 py-3 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
                    <label className="block text-xs font-semibold text-foreground">Professional Summary</label>
                    <textarea
                      value={resume.profile.summary || ""}
                      onChange={(e) => updateProfile({ summary: e.target.value })}
                      placeholder="Write a brief summary of your professional background..."
                      className="w-full px-4 py-3 text-sm border border-border/50 rounded-xl bg-background min-h-24 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-4 animate-slide-in">
                  <button
                    onClick={() => addExperience({ company: "", position: "", startDate: "", endDate: "", current: false, description: [] })}
                    className="w-full py-3 text-xs font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-xl hover:shadow-md transition-all duration-200 shadow-sm"
                  >
                    + Add Experience
                  </button>
                  {resume.experience.map((exp, index) => (
                    <div key={exp.id} className="relative p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                      {/* Timeline indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-brand-strong rounded-l-2xl" />
                      
                      <div className="ml-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                              className="w-full px-3 py-2 text-sm font-medium border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                              placeholder="Position Title"
                            />
                          </div>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="ml-3 p-2 text-xs text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                          placeholder="Company Name"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            className="px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                            placeholder="Start Date"
                          />
                          <input
                            type="text"
                            value={exp.endDate || ""}
                            onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                            className="px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                            placeholder="End Date"
                          />
                        </div>
                        
                        <textarea
                          value={exp.description.join("\n")}
                          onChange={(e) => updateExperience(exp.id, { description: e.target.value.split("\n") })}
                          className="w-full px-3 py-2 text-sm border border-border/50 rounded-xl bg-background min-h-20 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Description (one point per line)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-3">
                  <button
                    onClick={() => addEducation({ institution: "", degree: "", field: "", startDate: "", endDate: "", current: false })}
                    className="w-full py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    + Add Education
                  </button>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="p-3 border border-border rounded-lg space-y-2 bg-card">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                          className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
                          placeholder="Degree"
                        />
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="ml-2 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Institution"
                      />
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="Field of Study"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                          className="px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
                          placeholder="Start Date"
                        />
                        <input
                          type="text"
                          value={edu.endDate || ""}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                          className="px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50"
                          placeholder="End Date"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-4 animate-slide-in">
                  {(githubData || leetcodeData) && (
                    <button
                      onClick={() => {
                        // Auto-import skills from connected platforms
                        const skillsToAdd: string[] = [];
                        
                        // Add GitHub languages as skills
                        if (githubData?.languages) {
                          Object.keys(githubData.languages).forEach(lang => {
                            if (!resume.skills.some(s => s.name.toLowerCase() === lang.toLowerCase())) {
                              skillsToAdd.push(lang);
                            }
                          });
                        }
                        
                        // Add LeetCode topics as skills
                        if (leetcodeData?.recentSubmissions) {
                          const topics = new Set<string>();
                          leetcodeData.recentSubmissions.forEach(sub => {
                            const title = sub.title.toLowerCase();
                            if (title.includes('array')) topics.add('Arrays');
                            if (title.includes('string')) topics.add('Strings');
                            if (title.includes('tree')) topics.add('Trees');
                            if (title.includes('graph')) topics.add('Graphs');
                            if (title.includes('dynamic') || title.includes('dp')) topics.add('Dynamic Programming');
                            if (title.includes('linked list')) topics.add('Linked Lists');
                            if (title.includes('hash')) topics.add('Hash Tables');
                            if (title.includes('sorting')) topics.add('Sorting');
                            if (title.includes('search')) topics.add('Searching');
                            if (title.includes('recursion')) topics.add('Recursion');
                            if (title.includes('backtracking')) topics.add('Backtracking');
                            if (title.includes('greedy')) topics.add('Greedy Algorithms');
                          });
                          topics.forEach(topic => {
                            if (!resume.skills.some(s => s.name.toLowerCase() === topic.toLowerCase())) {
                              skillsToAdd.push(topic);
                            }
                          });
                        }
                        
                        // Add all unique skills
                        skillsToAdd.forEach(skillName => {
                          addSkill({ name: skillName, level: "Intermediate" });
                        });
                      }}
                      className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-xl hover:shadow-md transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Auto-import from Connected Platforms
                    </button>
                  )}
                  
                  <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        className="flex-1 px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addSkill({ name: e.currentTarget.value.trim(), level: "Intermediate" });
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <select
                        className="px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                        defaultValue="Intermediate"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <div key={skill.id} className="group relative px-3 py-1.5 bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-full text-sm font-medium text-foreground hover:shadow-md transition-all duration-200">
                        <span>{skill.name}</span>
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-4 animate-slide-in">
                  {githubData && (
                    <button
                      onClick={() => {
                        // Auto-import projects from GitHub repositories
                        githubData.repositories.slice(0, 5).forEach(repo => {
                          if (!resume.projects.some(p => p.name.toLowerCase() === repo.name.toLowerCase())) {
                            addProject({
                              name: repo.name,
                              description: repo.description || "",
                              technologies: repo.language ? [repo.language] : [],
                              link: repo.homepage || repo.url,
                              github: repo.url,
                            });
                          }
                        });
                      }}
                      className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-xl hover:shadow-md transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Auto-import from GitHub Repositories
                    </button>
                  )}
                  
                  <button
                    onClick={() => addProject({ name: "", description: "", technologies: [], link: "", github: "" })}
                    className="w-full py-3 text-xs font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-xl hover:shadow-md transition-all duration-200 shadow-sm"
                  >
                    + Add Project Manually
                  </button>
                  {resume.projects.map((project) => (
                    <div key={project.id} className="relative p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                      {/* Project indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-brand-strong rounded-l-2xl" />
                      
                      <div className="ml-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, { name: e.target.value })}
                              className="w-full px-3 py-2 text-sm font-medium border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                              placeholder="Project Name"
                            />
                          </div>
                          <button
                            onClick={() => removeProject(project.id)}
                            className="ml-3 p-2 text-xs text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <textarea
                          value={project.description}
                          onChange={(e) => updateProject(project.id, { description: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-border/50 rounded-xl bg-background min-h-20 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Project Description"
                        />
                        
                        <input
                          type="text"
                          value={project.technologies.join(", ")}
                          onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(",").map(t => t.trim()) })}
                          className="w-full px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                          placeholder="Technologies (comma separated)"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={project.link || ""}
                            onChange={(e) => updateProject(project.id, { link: e.target.value })}
                            className="px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                            placeholder="Live Demo URL"
                          />
                          <input
                            type="text"
                            value={project.github || ""}
                            onChange={(e) => updateProject(project.id, { github: e.target.value })}
                            className="px-3 py-2 text-sm border border-border/50 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                            placeholder="GitHub URL"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 flex flex-col bg-muted/30">
            {/* Preview Toolbar */}
            <div className="border-b border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Preview</span>
                <span className="text-xs text-muted-foreground">
                  ({templateNames[template]})
                </span>
                <div className="flex items-center gap-1 border border-border rounded-md">
                  {[50, 75, 100, 125, 150].map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoom(z as any)}
                      className={`px-2 py-1 text-xs font-medium transition-colors ${
                        zoom === z ? "bg-brand text-white" : "hover:bg-muted"
                      }`}
                    >
                      {z}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`px-3 py-1.5 text-sm border border-border rounded-md transition-colors ${
                    showThemeSelector ? "bg-brand text-white" : "hover:bg-muted"
                  }`}
                >
                  Theme
                </button>
                <button
                  onClick={() => setShowATSPanel(!showATSPanel)}
                  className={`px-3 py-1.5 text-sm border border-border rounded-md transition-colors ${
                    showATSPanel ? "bg-brand text-white" : "hover:bg-muted"
                  }`}
                >
                  ATS Panel
                </button>
                <button
                  onClick={async () => {
                    if (!previewRef.current) return;
                    setShowPrinterAnimation(true);
                    setIsExporting(true);
                    try {
                      await exportResume('pdf', previewRef.current, resume);
                    } catch (error) {
                      console.error('Export failed:', error);
                      alert('Export failed. Please try again or check the console for details.');
                    } finally {
                      setIsExporting(false);
                      setShowPrinterAnimation(false);
                    }
                  }}
                  disabled={isExporting}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            </div>

            {/* Preview Content - Center Panel */}
            <div 
              className="flex-1 flex flex-col bg-muted/30 overflow-hidden"
            >
              {/* Preview Toolbar */}
              <div className="border-b border-border bg-card p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="50"
                      max="150"
                      step="5"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value) as any)}
                      className="w-32 accent-brand"
                    />
                    <span className="text-xs text-muted-foreground font-medium">{zoom}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowATSPanel(!showATSPanel)}
                    className={`px-3 py-1.5 text-xs font-medium border border-border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                      showATSPanel ? "bg-gradient-to-r from-brand to-brand-strong text-white border-transparent" : "hover:bg-muted"
                    }`}
                  >
                    ATS Panel
                  </button>
                  <button
                    onClick={async () => {
                      if (!previewRef.current) return;
                      setShowPrinterAnimation(true);
                      setIsExporting(true);
                      try {
                        await exportResume('pdf', previewRef.current, resume);
                      } catch (error) {
                        console.error('Export failed:', error);
                        alert('Export failed. Please try again or check the console for details.');
                      } finally {
                        setIsExporting(false);
                        setShowPrinterAnimation(false);
                      }
                    }}
                    disabled={isExporting}
                    className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-md transition-all duration-200 shadow-sm disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </button>
                </div>
              </div>

              {/* Resume Preview */}
              <div 
                className={`flex-1 overflow-auto p-8 flex justify-center ${
                  isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
                }`}
              >
                {/* Floating Exit Fullscreen Button */}
                {isFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Exit Fullscreen</span>
                  </button>
                )}
                <div 
                  ref={previewRef}
                  className="bg-white shadow-2xl rounded-lg"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    padding: "20mm",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                >
                  <TemplateComponent resume={resume} theme={theme} />
                </div>
              </div>
            </div>

            {/* ATS Panel - Right Panel */}
            {showATSPanel && (
              <div 
                ref={rightPanelRef}
                className="relative flex flex-col bg-card shadow-card border-l border-border"
                style={{ width: `${rightPanelWidth}px` }}
              >
                {/* Resize Handle */}
                <div
                  className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-brand/20 transition-colors z-10"
                  onMouseDown={() => setIsResizingRight(true)}
                />
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">ATS Analysis</h3>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <ATSPanel
                    atsAnalysis={atsAnalysis}
                    healthScore={healthScore}
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                  />
                </div>
              </div>
            )}

            {/* Theme Selector Panel */}
            {showThemeSelector && (
              <div className="border-t border-border bg-card p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Theme Presets</p>
                    <div className="grid grid-cols-4 gap-2">
                      {getThemePresetNames().map((presetName) => (
                        <button
                          key={presetName}
                          onClick={() => {
                            setTheme(getThemePreset(presetName));
                          }}
                          className="px-3 py-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors capitalize"
                        >
                          {presetName}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Color Palette</p>
                    <div className="flex flex-wrap gap-2">
                      {colorPalettes.map((palette) => (
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
                          className="w-8 h-8 rounded-full border-2 border-border hover:border-brand transition-colors"
                          style={{ backgroundColor: palette.primary }}
                          title={palette.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Font Family</p>
                    <div className="grid grid-cols-2 gap-2">
                      {fontOptions.map((font) => (
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
                          className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                            theme.typography.fontFamily === font.value
                              ? "bg-brand text-white"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          <div className="font-medium">{font.label}</div>
                          <div className="text-xs opacity-70">Welcome</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
