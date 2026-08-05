import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
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
  Award,
  Target,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
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

const RESUME_TEMPLATES = [
  { value: "ats-professional", label: "ATS Professional" },
  { value: "modern-minimal", label: "Modern Minimal" },
  { value: "executive", label: "Executive" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "designer", label: "Designer" },
  { value: "fresher", label: "Fresher" },
  { value: "internship", label: "Internship" },
  { value: "corporate", label: "Corporate" },
  { value: "startup", label: "Startup" },
  { value: "academic", label: "Academic" },
] as const;

export const Route = createFileRoute("/ai-resume-generator")({
  head: () => ({
    meta: [
      { title: "Resume Generator — SkillVerse" },
      {
        name: "description",
        content: "Generate professional resumes using your profile data.",
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
  const { user } = useAuth();
  const { profile, completion } = useProfile();
  const { resume, setResume, template, setTemplate, theme, setTheme } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPrinterAnimation, setShowPrinterAnimation] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);

  // Initialize template if not set
  useEffect(() => {
    if (!template) {
      setTemplate('modern-minimal' as TemplateType);
    }
  }, [template, setTemplate]);

  const TemplateComponent = getTemplate((template || 'modern-minimal') as TemplateType);
  const currentTheme = getThemePreset(theme || 'default');

  const analyzeProfileData = (p: any) => {
    const analysis = {
      profileStrength: 0,
      hasContactInfo: !!(p.email && p.phone),
      hasSummary: !!p.summary,
      hasSkills: !!(p.skills && p.skills.length > 0),
      hasExperience: !!(p.experience && p.experience.length > 0),
      hasEducation: !!(p.education && p.education.length > 0),
      hasProjects: !!(p.projects && p.projects.length > 0),
      hasAchievements: !!(p.achievements && p.achievements.length > 0),
      experienceCount: p.experience?.length || 0,
      educationCount: p.education?.length || 0,
      projectCount: p.projects?.length || 0,
      skillCount: p.skills?.split(',').length || 0,
      suggestedTemplate: 'modern-minimal' as TemplateType,
      missingSections: [] as string[],
    };

    // Calculate profile strength
    let strength = 0;
    if (analysis.hasContactInfo) strength += 15;
    if (analysis.hasSummary) strength += 15;
    if (analysis.hasSkills) strength += 20;
    if (analysis.hasExperience) strength += 25;
    if (analysis.hasEducation) strength += 15;
    if (analysis.hasProjects) strength += 10;
    analysis.profileStrength = strength;

    // Identify missing sections
    if (!analysis.hasContactInfo) analysis.missingSections.push('Contact Information');
    if (!analysis.hasSummary) analysis.missingSections.push('Professional Summary');
    if (!analysis.hasSkills) analysis.missingSections.push('Skills');
    if (!analysis.hasExperience) analysis.missingSections.push('Work Experience');
    if (!analysis.hasEducation) analysis.missingSections.push('Education');
    if (!analysis.hasProjects) analysis.missingSections.push('Projects');

    // Suggest template based on profile
    if (analysis.experienceCount >= 2) {
      analysis.suggestedTemplate = 'executive';
    } else if (analysis.experienceCount === 1) {
      analysis.suggestedTemplate = 'software-engineer';
    } else if (analysis.projectCount >= 3) {
      analysis.suggestedTemplate = 'startup';
    } else if (analysis.educationCount >= 1) {
      analysis.suggestedTemplate = 'fresher';
    } else {
      analysis.suggestedTemplate = 'modern-minimal';
    }

    return analysis;
  };

  const generateResume = () => {
    if (!user?.id) return;
    
    // Check if profile is complete enough
    if (completion < 30) {
      toast.error("Please complete your profile first (at least 30% completion)");
      return;
    }

    setLoading(true);
    setShowPrinterAnimation(true);
    
    // Analyze profile data first
    const analysis = analyzeProfileData(profile);
    setResumeAnalysis(analysis);
    
    // Use suggested template if user hasn't selected one
    if (!template || template === 'modern-minimal') {
      setTemplate(analysis.suggestedTemplate);
    }
    
    // Convert profile data to resume format with printer animation
    setTimeout(() => {
      try {
        const resumeData = convertProfileToResumeData(profile, analysis.suggestedTemplate);
        setResume(resumeData);
        setShowPrinterAnimation(false);
        setShowPreview(true);
        toast.success("Resume generated successfully");
      } catch (error: any) {
        setShowPrinterAnimation(false);
        toast.error(`Failed to generate resume: ${error.message || "Unknown error"}`);
        console.error("Resume generation error:", error);
      } finally {
        setLoading(false);
      }
    }, 4500); // Match printer animation duration
  };

  const convertProfileToResumeData = (p: any, templateType: TemplateType) => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Convert profile data to resume format
    return {
      id: crypto.randomUUID(),
      name: `${p.fullName}'s Resume`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        fullName: p.fullName || "",
        title: p.headline || "",
        contact: {
          email: p.email || "",
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
        id: proj.id,
        name: proj.name,
        description: proj.summary,
        technologies: proj.stack ? proj.stack.split(',').map((t: string) => t.trim()) : [],
        link: proj.link || "",
        startDate: '',
        endDate: '',
      })) : [],
      experience: p.experience ? p.experience.map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        position: exp.role,
        description: exp.summary,
        startDate: formatDate(exp.start),
        endDate: formatDate(exp.end),
        current: false,
      })) : [],
      education: p.education ? p.education.map((edu: any) => ({
        id: edu.id,
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
        title: 'Achievements',
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
      await exportResume(resume, format, template as TemplateType, currentTheme);
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





  return (
    <PageShell>
      <div className="relative overflow-hidden">
        {/* Animated Background matching site theme */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand/5 to-purple-500/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-blob delay-2000" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-blob delay-4000" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Resume Generator</h1>
            <p className="mt-2 text-muted-foreground">
              Analyze your profile data and generate professional resumes automatically
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Profile Completion:</span>
              <span className={`text-sm font-semibold ${completion >= 30 ? 'text-green-600' : 'text-orange-600'}`}>
                {completion}%
              </span>
              {completion < 30 && (
                <span className="text-xs text-muted-foreground">(Minimum 30% required)</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={template || 'modern-minimal'} onValueChange={(value: any) => setTemplate(value)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {RESUME_TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!showPreview && (
              <Button onClick={generateResume} disabled={loading || completion < 30} variant="outline">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Resume
                  </>
                )}
              </Button>
            )}
            {showPreview && (
              <>
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={handlePrint} variant="outline" disabled={isExporting}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => handleExport('pdf')} variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
                <Button onClick={() => handleExport('docx')} variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      DOCX
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Analysis Panel */}
        {completion >= 30 && !showPreview && !loading && (
          <Card className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 border-brand/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brand" />
              Profile Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-background">
                <User className="h-6 w-6 mx-auto text-brand mb-2" />
                <div className="text-2xl font-bold">{completion}%</div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <Briefcase className="h-6 w-6 mx-auto text-brand mb-2" />
                <div className="text-2xl font-bold">{profile.experience?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <GraduationCap className="h-6 w-6 mx-auto text-brand mb-2" />
                <div className="text-2xl font-bold">{profile.education?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Education</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <Code2 className="h-6 w-6 mx-auto text-brand mb-2" />
                <div className="text-2xl font-bold">{profile.projects?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Recommended Template:</span> {templateNames['software-engineer' as TemplateType] || 'Software Engineer'}
            </div>
          </Card>
        )}

        {completion < 30 && !showPreview && (
          <Card className="p-8 border-orange-200 bg-orange-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900">Complete Your Profile First</h3>
                <p className="mt-2 text-sm text-orange-700">
                  To generate a professional resume, please complete your profile with at least 30% completion. 
                  Add your education, experience, skills, and projects for the best results.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => window.location.href = '/profile'}
                >
                  Go to Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Printer Animation */}
        {showPrinterAnimation && (
          <ResumePrinter 
            active={showPrinterAnimation} 
            onDone={() => setShowPrinterAnimation(false)}
            duration={4500}
          />
        )}

        {!showPreview && !loading && completion >= 30 && (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Generate Your Resume</h3>
            <p className="mt-2 text-muted-foreground">
              Select a template and click "Generate Resume" to create your resume using your profile data
            </p>
          </Card>
        )}

        {showPreview && resume && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Preview */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Resume Preview</h3>
                <div className="flex gap-2">
                  <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-elegant" style={{ minHeight: '800px' }}>
                <TemplateComponent resume={resume} theme={currentTheme} />
              </div>
            </Card>

            {/* Options Panel */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export Options</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Template</h4>
                  <p className="text-sm text-muted-foreground">{templateNames[(template || 'modern-minimal') as TemplateType]}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile Completion</h4>
                  <p className="text-sm text-muted-foreground">{completion}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Sections Included</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Contact Information</li>
                    <li>✓ Professional Summary</li>
                    {resume.skills.length > 0 && <li>✓ Skills ({resume.skills.length})</li>}
                    {resume.experience.length > 0 && <li>✓ Experience ({resume.experience.length})</li>}
                    {resume.education.length > 0 && <li>✓ Education ({resume.education.length})</li>}
                    {resume.projects.length > 0 && <li>✓ Projects ({resume.projects.length})</li>}
                    {resume.achievements.length > 0 && <li>✓ Achievements</li>}
                  </ul>
                </div>
                {resumeAnalysis && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Profile Strength</h4>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-brand-gradient h-2 rounded-full transition-all" 
                        style={{ width: `${resumeAnalysis.profileStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{resumeAnalysis.profileStrength}% Complete</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = '/resume-builder'}
                    variant="outline"
                  >
                    Open Manual Builder for More Options
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        </div>
      </div>
    </PageShell>
  );
}
