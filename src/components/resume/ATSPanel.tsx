import { useState } from "react";
import type { ATSAnalysis, ResumeHealthScore, ResumeData } from "@/lib/resume/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Plus,
  X,
  Check,
  ShieldCheck,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ATSPanelProps {
  atsAnalysis: ATSAnalysis;
  healthScore: ResumeHealthScore;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onAddSkill?: (skillName: string) => void;
  onClose?: () => void;
  resume?: ResumeData;
  className?: string;
}

export function ATSPanel({
  atsAnalysis,
  healthScore,
  jobDescription,
  onJobDescriptionChange,
  onAddSkill,
  onClose,
  resume,
  className,
}: ATSPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "matcher" | "checklist">("overview");
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const score = atsAnalysis.score;
  const scoreBg =
    score >= 80
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      : score >= 60
      ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";

  const scoreLabel =
    score >= 85
      ? "ATS Ready — High Recruiter Pass Rate"
      : score >= 70
      ? "Good Candidate Match — Minor tweaks recommended"
      : score >= 50
      ? "Needs Optimization — Missing key sections or keywords"
      : "High Risk — Major ATS compatibility gaps";

  const handleAddSkill = (skill: string) => {
    if (onAddSkill) {
      onAddSkill(skill);
      setAddedSkills((prev) => new Set([...prev, skill]));
      toast.success(`Added "${skill}" to skills!`);
    }
  };

  return (
    <div className={cn("w-full h-full flex flex-col bg-background/50 overflow-hidden", className)}>
      {/* Scrollable Container with max width for optimal readability */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* 1. Executive Score Hero Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ATS Compatibility Score
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">{scoreLabel}</h2>
              </div>

              <div className={cn("px-4 py-2 rounded-2xl border text-2xl font-black shrink-0 self-start sm:self-auto", scoreBg)}>
                {score}<span className="text-sm font-normal opacity-70">/100</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* 2. Sub-tabs Navigation */}
          <div className="flex items-center border-b border-border/70 gap-2 pb-px">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-2.5 px-4 text-xs font-bold transition-all border-b-2",
                activeTab === "overview"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Overview & Suggestions
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("matcher")}
              className={cn(
                "pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
                activeTab === "matcher"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Job Description Matcher</span>
              {atsAnalysis.missingKeywords.length > 0 && (
                <Badge variant="outline" className="h-4 px-1 text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  {atsAnalysis.missingKeywords.length}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("checklist")}
              className={cn(
                "pb-2.5 px-4 text-xs font-bold transition-all border-b-2",
                activeTab === "checklist"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Compliance Checklist
            </button>
          </div>

          {/* 3. Tab Content */}
          <div className="space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* 4 Health Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Profile", value: healthScore.professionalism },
                    { label: "Readability", value: healthScore.readability },
                    { label: "Keywords", value: healthScore.keywordMatch },
                    { label: "Projects", value: healthScore.projectQuality },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs flex flex-col justify-between"
                    >
                      <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                      <span
                        className={cn(
                          "text-lg font-bold mt-1",
                          item.value >= 80
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.value >= 60
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actionable Suggestions */}
                {atsAnalysis.suggestions.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Actionable Recommendations
                    </h3>
                    <div className="space-y-2">
                      {atsAnalysis.suggestions.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-border/70 bg-card text-foreground/90 leading-relaxed flex items-start gap-2.5 text-xs shadow-xs"
                        >
                          <span className="text-amber-500 font-bold shrink-0 mt-0.5">💡</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Readability Metrics */}
                <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium block">Writing & Readability Style</span>
                    <span className="font-bold text-foreground text-sm">{atsAnalysis.readability.level}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-muted-foreground font-medium block">Average Sentence Length</span>
                    <span className="font-bold text-foreground text-sm">{atsAnalysis.readability.avgSentenceLength} words / sentence</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: JOB MATCHER */}
            {activeTab === "matcher" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-xs">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                    Target Job Description (JD)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => onJobDescriptionChange(e.target.value)}
                    placeholder="Paste the Job Description from LinkedIn, Naukri, or careers portal to match required tech skills..."
                    className="w-full p-3 text-xs border border-border rounded-xl bg-background resize-y min-h-[110px] focus:outline-none focus:ring-1 focus:ring-brand/30"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The ATS scanner extracts technical skills from the JD and highlights gaps in your resume.
                  </p>
                </div>

                {/* Missing Skills */}
                {atsAnalysis.missingKeywords.length > 0 ? (
                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Missing Target Skills ({atsAnalysis.missingKeywords.length})
                      </h4>
                      <span className="text-[11px] text-muted-foreground">Click "+ Add" to inject directly</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {atsAnalysis.missingKeywords.map((kw) => {
                        const isAdded = addedSkills.has(kw);
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => !isAdded && handleAddSkill(kw)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-xs",
                              isAdded
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default"
                                : "bg-card border-border hover:border-brand/40 text-foreground hover:bg-secondary/60 cursor-pointer"
                            )}
                          >
                            {isAdded ? <Check className="h-3 w-3 text-emerald-500" /> : <Plus className="h-3 w-3 text-brand" />}
                            <span className="capitalize">{kw}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : jobDescription.trim().length > 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-semibold">Outstanding match! All required technical skills were detected in your resume.</span>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border/60 text-muted-foreground text-center text-xs">
                    Paste a Job Description above to scan for missing keywords.
                  </div>
                )}

                {/* Detected Keywords in Resume */}
                {Object.keys(atsAnalysis.keywordDensity).length > 0 && (
                  <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Detected Technical Stack in Resume ({Object.keys(atsAnalysis.keywordDensity).length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(atsAnalysis.keywordDensity).map(([kw, count]) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-lg bg-secondary border border-border/70 text-[11px] font-medium text-foreground capitalize"
                        >
                          {kw} {count > 1 ? `(${count}x)` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CHECKLIST */}
            {activeTab === "checklist" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recruiter & ATS Compliance Checklist
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      title: "Full Name & Professional Title",
                      pass: Boolean(resume?.profile.fullName && resume?.profile.title),
                    },
                    {
                      title: "Contact Info (Email & Phone)",
                      pass: Boolean(resume?.profile.contact.email && resume?.profile.contact.phone),
                    },
                    {
                      title: "Location (City, Country)",
                      pass: Boolean(resume?.profile.contact.location),
                    },
                    {
                      title: "GitHub / LinkedIn Profile Links",
                      pass: Boolean(resume?.profile.contact.linkedin || resume?.profile.contact.github),
                    },
                    {
                      title: "Professional Summary (50+ chars)",
                      pass: Boolean(resume?.profile.summary && resume.profile.summary.length >= 50),
                    },
                    {
                      title: "Education Entry",
                      pass: Boolean(resume && resume.education.length > 0),
                    },
                    {
                      title: "Core Technical Skills (5+ skills)",
                      pass: Boolean(resume && resume.skills.length >= 5),
                    },
                    {
                      title: "Projects or Experience Listed",
                      pass: Boolean(resume && (resume.projects.length > 0 || resume.experience.length > 0)),
                    },
                  ].map((check, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between text-xs transition-colors shadow-xs",
                        check.pass
                          ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                          : "bg-rose-500/5 border-rose-500/20 text-muted-foreground"
                      )}
                    >
                      <span className="font-medium text-xs">{check.title}</span>
                      {check.pass ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs">
                          <Check className="h-3.5 w-3.5" /> Pass
                        </span>
                      ) : (
                        <span className="text-rose-500 font-semibold flex items-center gap-1 text-xs">
                          <X className="h-3.5 w-3.5" /> Missing
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
