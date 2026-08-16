import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Printer,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  ArrowRight,
  CheckCircle2,
  Edit3
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { createNotification } from "@/lib/services/notification-service";
import { useResumeStore } from "@/lib/resume/store";
import { getTemplate, templateNames } from "@/components/resume/templates";
import { getThemePreset } from "@/lib/resume/theme-system";
import { exportResume } from "@/lib/resume/export-formats";
import { ResumePrinter } from "@/components/ResumePrinter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { TemplateType } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

const RESUME_TEMPLATES = [
  { value: "ats-professional", label: "ATS Professional", desc: "Clean, structured and optimized for applicant tracking systems." },
  { value: "modern-minimal", label: "Modern Minimal", desc: "Minimal design for modern technology roles." },
  { value: "executive", label: "Executive", desc: "Leadership-focused layout for senior roles." },
  { value: "software-engineer", label: "Software Engineer", desc: "Tailored for developers and software engineering roles." },
  { value: "designer", label: "Designer", desc: "Creative format showcasing visual projects." },
  { value: "fresher", label: "Fresher", desc: "Clean layout emphasizing education and projects." },
  { value: "internship", label: "Internship", desc: "Focuses on coursework and student projects." },
  { value: "corporate", label: "Corporate", desc: "Formal traditional resume layout." },
  { value: "startup", label: "Startup", desc: "High-impact layout highlighting achievements." },
  { value: "academic", label: "Academic", desc: "Detailed format for research and education." },
] as const;

export const Route = createFileRoute("/ai-resume-generator")({
  head: () => ({
    meta: [
      { title: "AI Resume Generator — SkillVerse" },
      {
        name: "description",
        content: "Turn your SkillVerse profile into a professional, job-ready resume in seconds.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ResumeGeneratorPage />
    </AuthGate>
  ),
});

function ResumeGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, completion } = useProfile();
  const { resume, setResume, template, setTemplate, theme, setTheme } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [redirectingToProfile, setRedirectingToProfile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPrinterAnimation, setShowPrinterAnimation] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  // Default template initialization
  useEffect(() => {
    if (!template) {
      setTemplate('ats-professional' as TemplateType);
    }
  }, [template, setTemplate]);

  const TemplateComponent = getTemplate((template || 'ats-professional') as TemplateType);
  const currentTheme = getThemePreset(theme || 'default');

  const validateMandatoryProfile = (p: any) => {
    const missing: string[] = [];
    if (!p?.fullName?.trim()) missing.push("Full Name");
    if (!p?.email?.trim() && !p?.phone?.trim()) missing.push("Contact Details (Email/Phone)");
    if (!p?.skills?.trim()) missing.push("Skills List");
    const hasExp = p?.experience && p.experience.length > 0;
    const hasEdu = p?.education && p.education.length > 0;
    const hasProj = p?.projects && p.projects.length > 0;
    if (!hasExp && !hasEdu && !hasProj) {
      missing.push("Experience, Education, or Projects");
    }
    return missing;
  };

  const missingFields = validateMandatoryProfile(profile || {});

  const analyzeProfileData = (p: any) => {
    const expCount = p.experience?.length || 0;
    const eduCount = p.education?.length || 0;
    const projCount = p.projects?.length || 0;

    let suggested: TemplateType = 'ats-professional';
    if (expCount >= 2) suggested = 'executive';
    else if (expCount === 1) suggested = 'software-engineer';
    else if (projCount >= 3) suggested = 'startup';
    else if (eduCount >= 1) suggested = 'fresher';

    return {
      experienceCount: expCount,
      educationCount: eduCount,
      projectCount: projCount,
      skillCount: p.skills ? p.skills.split(',').length : 0,
      suggestedTemplate: suggested,
    };
  };

  const generateResume = () => {
    if (!user?.id) return;

    if (missingFields.length > 0) {
      toast.warning(`Mandatory profile details missing: ${missingFields.join(', ')}. Redirecting to profile...`, {
        duration: 4000,
      });
      setRedirectingToProfile(true);
      setTimeout(() => {
        navigate({ to: "/profile" });
      }, 1800);
      return;
    }

    setLoading(true);
    setShowPrinterAnimation(true);
    
    const analysis = analyzeProfileData(profile || {});
    setResumeAnalysis(analysis);
    
    if (!template) {
      setTemplate(analysis.suggestedTemplate);
    }
    
    setTimeout(() => {
      try {
        const resumeData = convertProfileToResumeData(profile || {}, template || analysis.suggestedTemplate);
        setResume(resumeData);
        setShowPrinterAnimation(false);
        setShowPreview(true);
        toast.success("Resume generated successfully");
        if (user?.id) {
          createNotification(user.id, {
            type: "resume",
            title: "Resume generated",
            message: "Your resume has been generated successfully.",
            idempotencyKey: `resume_gen_${Date.now()}`,
          }).catch(() => {});
        }
      } catch (error: any) {
        setShowPrinterAnimation(false);
        toast.error(`Failed to generate resume: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }, 4500);
  };

  const convertProfileToResumeData = (p: any, _templateType: TemplateType) => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return {
      id: crypto.randomUUID(),
      name: `${p.fullName || 'Developer'}'s Resume`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        fullName: p.fullName || "",
        title: p.headline || "Software Developer",
        contact: {
          email: p.email || user?.email || "",
          phone: p.phone || "",
          location: p.location || "",
        },
      },
      skills: p.skills ? p.skills.split(',').map((skill: string) => ({
        id: crypto.randomUUID(),
        name: skill.trim(),
        level: 'intermediate' as const,
      })) : [],
      projects: p.projects ? p.projects.map((proj: any) => ({
        id: proj.id || crypto.randomUUID(),
        name: proj.name,
        description: proj.summary,
        technologies: proj.stack ? proj.stack.split(',').map((t: string) => t.trim()) : [],
        link: proj.link || "",
        startDate: '',
        endDate: '',
      })) : [],
      experience: p.experience ? p.experience.map((exp: any) => ({
        id: exp.id || crypto.randomUUID(),
        company: exp.company,
        position: exp.role,
        description: exp.summary,
        startDate: formatDate(exp.start),
        endDate: formatDate(exp.end),
        current: false,
      })) : [],
      education: p.education ? p.education.map((edu: any) => ({
        id: edu.id || crypto.randomUUID(),
        institution: edu.school,
        degree: edu.degree,
        field: edu.field,
        startDate: formatDate(edu.start),
        endDate: formatDate(edu.end),
        gpa: edu.grade || "",
      })) : [],
      certifications: [],
      achievements: p.achievements ? [{
        id: crypto.randomUUID(),
        title: 'Key Achievements',
        description: p.achievements,
        date: '',
        issuer: '',
      }] : [],
      languages: [],
      volunteerWork: [],
      publications: [],
      references: [],
      customSections: [],
    };
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    setIsExporting(true);
    try {
      await exportResume(resume, format, (template || 'ats-professional') as TemplateType, currentTheme);
      toast.success(`Resume exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export resume: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedTemplateObj = RESUME_TEMPLATES.find(t => t.value === (template || 'ats-professional')) || RESUME_TEMPLATES[0];

  return (
    <PageShell>
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
          {/* 1. Page Header */}
          <div className="border-b border-border/50 pb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand block mb-1">
              AI RESUME BUILDER
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Create your resume with <span className="text-brand">AI</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Turn your SkillVerse profile into a professional, job-ready resume in seconds.
            </p>
          </div>

          {/* Redirecting to Profile Loading State */}
          {redirectingToProfile && (
            <div className="py-12 flex justify-center animate-in fade-in-50 duration-200">
              <Card className="p-8 text-center border border-amber-500/30 bg-amber-500/5 max-w-lg w-full shadow-lg rounded-2xl space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Incomplete Profile Details</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Required fields missing: <span className="font-semibold text-amber-600 dark:text-amber-400">{missingFields.join(', ')}</span>.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-2 text-xs font-semibold text-brand">
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  Redirecting to profile page to fill pending details...
                </div>
              </Card>
            </div>
          )}

          {/* 2. Printer Loading State */}
          {showPrinterAnimation && !redirectingToProfile && (
            <div className="py-6">
              <ResumePrinter 
                active={showPrinterAnimation} 
                onDone={() => setShowPrinterAnimation(false)}
                duration={4500}
              />
            </div>
          )}

          {/* 3. Pre-Generation State: Balanced Two-Column Layout */}
          {!showPreview && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
              {/* Left Column: Create Resume Controls */}
              <Card className="border border-border bg-card p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      CREATE YOUR RESUME
                    </span>
                    <h2 className="text-xl font-bold text-foreground">Choose a template & generate</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a professional resume layout and generate your document directly from your saved profile.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-foreground block">Selected Template</label>
                    <Select value={template || 'ats-professional'} onValueChange={(value: any) => setTemplate(value)}>
                      <SelectTrigger className="w-full bg-background border-border rounded-xl text-xs font-medium">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {RESUME_TEMPLATES.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-xs py-2">
                            <div>
                              <div className="font-semibold text-foreground">{t.label}</div>
                              <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs">
                      <span className="font-semibold text-foreground">{selectedTemplateObj.label}: </span>
                      <span className="text-muted-foreground">{selectedTemplateObj.desc}</span>
                    </div>
                  </div>

                  <Button
                    onClick={generateResume}
                    className="w-full bg-brand text-brand-foreground hover:opacity-90 font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Sparkles className="h-4 w-4 text-brand-foreground" />
                    Generate Resume →
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Your resume will use the information currently saved in your SkillVerse profile.
                  </p>
                </div>
              </Card>

              {/* Right Column: Profile Readiness */}
              <Card className="border border-border bg-card p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        PROFILE READINESS
                      </span>
                      <h2 className="text-xl font-bold text-foreground">
                        {completion >= 100 ? 'PROFILE READY' : 'PROFILE STATUS'}
                      </h2>
                    </div>

                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full border",
                      completion >= 30 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    )}>
                      {completion}% Complete
                    </span>
                  </div>

                  {/* Completion Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", completion >= 30 ? "bg-brand" : "bg-amber-500")} 
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  {/* Compact Profile Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center gap-3">
                      <User className="h-4 w-4 text-brand shrink-0" />
                      <div>
                        <div className="text-lg font-bold text-foreground">{completion}%</div>
                        <div className="text-[11px] text-muted-foreground">Profile Data</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-brand shrink-0" />
                      <div>
                        <div className="text-lg font-bold text-foreground">{profile.experience?.length || 0}</div>
                        <div className="text-[11px] text-muted-foreground">Experience</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-brand shrink-0" />
                      <div>
                        <div className="text-lg font-bold text-foreground">{profile.education?.length || 0}</div>
                        <div className="text-[11px] text-muted-foreground">Education</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-brand shrink-0" />
                      <div>
                        <div className="text-lg font-bold text-foreground">{profile.projects?.length || 0}</div>
                        <div className="text-[11px] text-muted-foreground">Projects</div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Readiness Insight */}
                  <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-2">
                    <p>
                      {missingFields.length === 0
                        ? `Your profile is complete and ready for AI resume generation.` 
                        : `You have ${missingFields.length} pending mandatory detail${missingFields.length > 1 ? 's' : ''} (${missingFields.join(', ')}).`}
                    </p>

                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-1 font-semibold text-brand hover:underline pt-1 text-xs"
                    >
                      Fill pending profile details →
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 4. Generated Result View (After Resume Generation) */}
          {showPreview && resume && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Resume Generated</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      READY
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Template: <span className="font-semibold text-foreground">{selectedTemplateObj.label}</span> · Generated just now
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => setShowPreview(false)} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>

                  <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" disabled={isExporting}>
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>

                  <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" disabled={isExporting}>
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>

                  <Button onClick={() => handleExport('docx')} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" disabled={isExporting}>
                    <Download className="h-3.5 w-3.5" /> DOCX
                  </Button>

                  <Link to="/resume-builder">
                    <Button size="sm" className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs gap-1.5 font-semibold">
                      <Edit3 className="h-3.5 w-3.5" /> Edit Resume
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Resume Document Preview Container */}
              <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm overflow-hidden">
                <div className="border border-border rounded-xl p-6 bg-white shadow-elegant overflow-x-auto min-h-[750px]">
                  <TemplateComponent resume={resume} theme={currentTheme} />
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
