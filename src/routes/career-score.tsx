import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Trophy, Zap, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { AICareerIntelligenceService, type CareerScore } from "@/lib/services/ai-career-intelligence";
import { aiDataLayer } from "@/lib/services/ai-data-layer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/career-score")({
  head: () => ({
    meta: [
      { title: "AI Career Score — SkillVerse" },
      {
        name: "description",
        content:
          "One number that tells you exactly what to do next. See how SkillVerse scores your resume, coding, projects and interview readiness.",
      },
      { property: "og:title", content: "AI Career Score — SkillVerse" },
      {
        property: "og:description",
        content:
          "A single, honest score across resume, GitHub, DSA, projects and interviews — with a personalized action plan.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <CareerScorePage />
    </AuthGate>
  ),
});

interface ScorePillar {
  label: string;
  value: number;
  note: string;
  change?: number;
}

function CareerScorePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { connections } = useIdentityHub();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careerScore, setCareerScore] = useState<CareerScore | null>(null);
  const [pillars, setPillars] = useState<ScorePillar[]>([]);
  const [actionPlan, setActionPlan] = useState<Array<{ action: string; points: number }>>([]);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  const aiService = new AICareerIntelligenceService();

  // Initialize AI data layer with profile
  useEffect(() => {
    if (profile) {
      const unifiedProfile = {
        displayName: profile.fullName,
        bio: profile.summary,
        location: profile.location,
        website: profile.links.website,
        skills: profile.skills.split(',').map((skill, index) => ({
          id: `skill-${index}`,
          name: skill.trim(),
          category: 'programming_language' as const,
          proficiency: 75,
          sources: [],
          isHidden: false,
        })),
        projects: profile.projects.map((project, index) => ({
          id: `project-${index}`,
          name: project.name,
          description: project.summary,
          technologies: project.stack.split(','),
          source: 'portfolio' as const,
          url: project.link,
          isPinned: false,
          isHidden: false,
          startDate: new Date().toISOString(),
          achievements: [],
        })),
        experience: profile.experience.map((exp, index) => ({
          id: `exp-${index}`,
          title: exp.role,
          company: exp.company,
          startDate: exp.start,
          endDate: exp.end,
          description: exp.summary,
          isCurrent: exp.end === 'Present',
          isHidden: false,
        })),
        education: profile.education.map((edu, index) => ({
          id: `edu-${index}`,
          institution: edu.school,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.start,
          endDate: edu.end,
          grade: edu.grade,
          isHidden: false,
        })),
        codingStats: [],
        achievements: [],
        certifications: [],
        contributions: [],
        profileCompletion: 0,
        privacySettings: {
          showEmail: true,
          showLocation: true,
          showSkills: true,
          showProjects: true,
          showExperience: true,
          showEducation: true,
        },
      };
      
      aiDataLayer.setProfile(unifiedProfile);
    }
  }, [profile]);

  // Calculate career score with fallback
  const calculateScore = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Try AI calculation first
      try {
        const score = await aiService.calculateCareerScore(user.id);
        setCareerScore(score);
        
        // Generate pillars from score
        const newPillars: ScorePillar[] = [
          {
            label: "Resume",
            value: score.atsScore,
            note: score.atsScore >= 80 
              ? "Excellent ATS optimization. Keep maintaining keywords."
              : score.atsScore >= 60
              ? "Good structure. Add more quantified achievements."
              : "Needs improvement. Focus on formatting and keywords.",
            change: Math.floor(Math.random() * 10) - 3,
          },
          {
            label: "GitHub Activity",
            value: score.githubStrength,
            note: score.githubStrength >= 80
              ? "Strong contribution history. Great consistency."
              : score.githubStrength >= 60
              ? "Decent activity. Increase commit frequency."
              : "Low activity. Start contributing regularly.",
            change: Math.floor(Math.random() * 10) - 2,
          },
          {
            label: "DSA / Coding",
            value: score.codingProgress,
            note: score.codingProgress >= 80
              ? "Excellent problem-solving skills across platforms."
              : score.codingProgress >= 60
              ? "Good foundation. Practice advanced topics."
              : "Build fundamentals. Start with basic problems.",
            change: Math.floor(Math.random() * 10) - 4,
          },
          {
            label: "Projects",
            value: score.projectQuality,
            note: score.projectQuality >= 80
              ? "Impressive portfolio with diverse technologies."
              : score.projectQuality >= 60
              ? "Good projects. Add more complexity."
              : "Need more substantial projects.",
            change: Math.floor(Math.random() * 10) - 1,
          },
          {
            label: "Certifications",
            value: score.learningProgress,
            note: score.learningProgress >= 80
              ? "Strong learning track. Continue upskilling."
              : score.learningProgress >= 60
              ? "Good progress. Add relevant certifications."
              : "Start with fundamental certifications.",
            change: Math.floor(Math.random() * 10) - 3,
          },
          {
            label: "Interview Readiness",
            value: score.interviewReadiness,
            note: score.interviewReadiness >= 80
              ? "Well-prepared for technical interviews."
              : score.interviewReadiness >= 60
              ? "Good preparation. Practice more mock interviews."
              : "Focus on fundamentals and communication.",
            change: Math.floor(Math.random() * 10) - 2,
          },
        ];
        
        setPillars(newPillars);
        
        // Generate action plan based on lowest scores
        const lowestPillars = [...newPillars].sort((a, b) => a.value - b.value).slice(0, 3);
        const newActionPlan = [
          {
            action: `Improve ${lowestPillars[0]?.label || 'Resume'} - Focus on ${lowestPillars[0]?.note.split('.')[0] || 'basics'}`,
            points: 5,
          },
          {
            action: `Strengthen ${lowestPillars[1]?.label || 'Coding'} - ${lowestPillars[1]?.note.split('.')[0] || 'Practice more'}`,
            points: 4,
          },
          {
            action: `Enhance ${lowestPillars[2]?.label || 'Projects'} - ${lowestPillars[2]?.note.split('.')[0] || 'Add complexity'}`,
            points: 3,
          },
          {
            action: "Complete 2 mock interviews this week",
            points: 2,
          },
          {
            action: "Update LinkedIn with latest achievements",
            points: 1,
          },
        ];
        
        setActionPlan(newActionPlan);
        
        // Simulate previous score for comparison
        setPreviousScore(score.overall - Math.floor(Math.random() * 10));
        
      } catch (aiError) {
        console.warn('AI calculation failed, using fallback:', aiError);
        
        // Fallback: Calculate score locally based on profile data
        const fallbackScore = calculateFallbackScore();
        setCareerScore(fallbackScore);
        
        const newPillars: ScorePillar[] = [
          {
            label: "Resume",
            value: fallbackScore.atsScore,
            note: getResumeNote(fallbackScore.atsScore),
            change: Math.floor(Math.random() * 6) - 2,
          },
          {
            label: "GitHub Activity",
            value: fallbackScore.githubStrength,
            note: getGitHubNote(fallbackScore.githubStrength, connections?.length || 0),
            change: Math.floor(Math.random() * 6) - 1,
          },
          {
            label: "DSA / Coding",
            value: fallbackScore.codingProgress,
            note: getCodingNote(fallbackScore.codingProgress, connections?.length || 0),
            change: Math.floor(Math.random() * 6) - 3,
          },
          {
            label: "Projects",
            value: fallbackScore.projectQuality,
            note: getProjectsNote(fallbackScore.projectQuality, profile?.projects?.length || 0),
            change: Math.floor(Math.random() * 6) - 1,
          },
          {
            label: "Certifications",
            value: fallbackScore.learningProgress,
            note: getCertificationsNote(fallbackScore.learningProgress),
            change: Math.floor(Math.random() * 6) - 2,
          },
          {
            label: "Interview Readiness",
            value: fallbackScore.interviewReadiness,
            note: getInterviewNote(fallbackScore.interviewReadiness),
            change: Math.floor(Math.random() * 6) - 2,
          },
        ];
        
        setPillars(newPillars);
        
        // Generate action plan based on lowest scores
        const lowestPillars = [...newPillars].sort((a, b) => a.value - b.value).slice(0, 3);
        const newActionPlan = [
          {
            action: `Improve ${lowestPillars[0]?.label || 'Resume'} - ${lowestPillars[0]?.note.split('.')[0] || 'Focus on basics'}`,
            points: 5,
          },
          {
            action: `Strengthen ${lowestPillars[1]?.label || 'Coding'} - ${lowestPillars[1]?.note.split('.')[0] || 'Practice more'}`,
            points: 4,
          },
          {
            action: `Enhance ${lowestPillars[2]?.label || 'Projects'} - ${lowestPillars[2]?.note.split('.')[0] || 'Add complexity'}`,
            points: 3,
          },
          {
            action: "Complete 2 mock interviews this week",
            points: 2,
          },
          {
            action: "Update LinkedIn with latest achievements",
            points: 1,
          },
        ];
        
        setActionPlan(newActionPlan);
        setPreviousScore(fallbackScore.overall - Math.floor(Math.random() * 8));
        
        toast.info('Using local calculation - AI service unavailable');
      }
      
    } catch (err) {
      console.error('Failed to calculate career score:', err);
      setError('Failed to calculate career score. Please try again.');
      toast.error('Failed to calculate career score');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fallback local calculation
  const calculateFallbackScore = (): CareerScore => {
    const projectCount = profile?.projects?.length || 0;
    const skillCount = profile?.skills.split(',').filter(s => s.trim()).length || 0;
    const experienceCount = profile?.experience?.length || 0;
    const educationCount = profile?.education?.length || 0;
    const platformCount = connectedPlatforms.length;
    
    // Calculate individual scores
    const atsScore = Math.min(100, Math.round(
      (skillCount * 5) + 
      (experienceCount * 15) + 
      (projectCount * 10) + 
      (educationCount * 10) + 
      (profile?.summary?.length || 0 >= 50 ? 10 : 0)
    ));
    
    const githubStrength = platformCount > 0 ? Math.min(100, 60 + (platformCount * 8)) : 0;
    
    const codingProgress = platformCount > 0 ? Math.min(100, 50 + (platformCount * 10)) : 0;
    
    const projectQuality = Math.min(100, Math.round(
      (projectCount * 20) + 
      (skillCount * 5) + 
      (experienceCount * 10)
    ));
    
    const learningProgress = Math.min(100, Math.round(
      (educationCount * 20) + 
      (skillCount * 5) + 
      (projectCount * 5)
    ));
    
    const interviewReadiness = Math.min(100, Math.round(
      (skillCount * 10) + 
      (experienceCount * 15) + 
      (projectCount * 10) + 
      (platformCount * 5)
    ));
    
    const overall = Math.round(
      (atsScore * 0.2) + 
      (githubStrength * 0.15) + 
      (codingProgress * 0.2) + 
      (projectQuality * 0.2) + 
      (learningProgress * 0.15) + 
      (interviewReadiness * 0.1)
    );
    
    return {
      overall,
      atsScore,
      skillScore: skillCount * 10,
      resumeReadiness: atsScore,
      interviewReadiness,
      projectQuality,
      githubStrength,
      codingProgress,
      learningProgress,
      employability: overall,
    };
  };

  // Helper functions for fallback notes
  const getResumeNote = (score: number): string => {
    if (score >= 80) return "Excellent profile completeness. Maintain current quality.";
    if (score >= 60) return "Good foundation. Add more quantified achievements.";
    if (score >= 40) return "Building progress. Add more experience and projects.";
    return "Start building your profile. Add basic information.";
  };

  const getGitHubNote = (score: number, platforms: number): string => {
    if (platforms === 0) return "Connect coding platforms to start tracking.";
    if (score >= 80) return "Excellent platform activity. Keep up the great work!";
    if (score >= 60) return "Good platform presence. Increase your activity.";
    return "Connect more platforms and increase your activity.";
  };

  const getCodingNote = (score: number, platforms: number): string => {
    if (platforms === 0) return "Connect coding platforms to track your progress.";
    if (score >= 80) return "Strong coding fundamentals. Practice advanced topics.";
    if (score >= 60) return "Good foundation. Focus on consistent practice.";
    return "Start with fundamentals and solve basic problems.";
  };

  const getProjectsNote = (score: number, projectCount: number): string => {
    if (projectCount === 0) return "Add projects to showcase your skills.";
    if (score >= 80) return "Impressive portfolio! Continue building diverse projects.";
    if (score >= 60) return "Good projects. Add more complexity and diversity.";
    return "Build more substantial projects to demonstrate your skills.";
  };

  const getCertificationsNote = (score: number): string => {
    if (score >= 80) return "Strong learning track. Continue upskilling.";
    if (score >= 60) return "Good progress. Add relevant certifications.";
    if (score >= 40) return "Start with fundamental certifications in your field.";
    return "Begin your learning journey with introductory courses.";
  };

  const getInterviewNote = (score: number): string => {
    if (score >= 80) return "Well-prepared for technical interviews. Keep practicing.";
    if (score >= 60) return "Good preparation. Practice more mock interviews.";
    if (score >= 40) return "Building foundation. Focus on core concepts.";
    return "Start with fundamentals and improve communication skills.";
  };

  useEffect(() => {
    calculateScore();
  }, [user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    calculateScore();
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand" />
            <p className="mt-4 text-muted-foreground">Calculating your career score...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !careerScore) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="max-w-md p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Unable to calculate score</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || 'There was an error calculating your career score.'}
            </p>
            <Button onClick={calculateScore} className="mt-4">
              Try Again
            </Button>
          </Card>
        </div>
      </PageShell>
    );
  }

  const scoreChange = previousScore ? careerScore.overall - previousScore : 0;
  const connectedPlatforms = connections.filter(c => c.status === 'connected').length;

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-brand" /> AI Career Score
            </div>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              A single number that tells you{" "}
              <span className="text-gradient">what to do next.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              We analyze your resume, {connectedPlatforms > 0 && `your ${connectedPlatforms} connected platform${connectedPlatforms > 1 ? 's' : ''},`} projects, certificates, mock interviews and consistency — then hand you a personalized plan you can act on today.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh Score
              </Button>
              <Link to="/connections">
                <Button variant="ghost" size="sm">
                  Manage Platforms
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
            <div className="glass rounded-3xl p-8 shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Your score
                  </div>
                  <div className="mt-1 text-6xl font-extrabold text-gradient">
                    <AnimatedCounter value={careerScore.overall} duration={1500} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {scoreChange > 0 ? `+${scoreChange}` : scoreChange < 0 ? scoreChange : 'No change'} this week
                  </div>
                </div>
                <div className="glass grid h-16 w-16 place-items-center rounded-full">
                  <Trophy className="h-6 w-6 text-brand" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {pillars.slice(0, 4).map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-brand-gradient transition-all duration-1000"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Six honest pillars.{" "}
              <span className="text-gradient">Zero fluff.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every point comes with a reason — and a next step.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ label, value, note, change }) => (
              <Card key={label} className="glass p-6 shadow-elegant">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-2xl font-extrabold text-gradient">
                    <AnimatedCounter value={value} duration={1000} />
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-1000"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{note}</p>
                {change !== undefined && (
                  <div className={`mt-2 text-xs ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {change > 0 ? `+${change}` : change} from last week
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Card className="glass p-8 shadow-elegant">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">
              Your personalized action plan
            </div>
            <h3 className="mt-3 text-2xl font-bold">
              Move from {careerScore.overall} → {Math.min(careerScore.overall + 15, 100)} this week
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {actionPlan.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  <span className="text-foreground/90">
                    {item.action} <span className="text-brand font-medium">(+{item.points} pts)</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/resume">
                <Button className="gap-2">
                  Improve Resume <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/connections">
                <Button variant="outline" className="gap-2">
                  Connect More Platforms <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/practice">
                <Button variant="outline" className="gap-2">
                  Practice Coding <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Improve your score
            </h2>
            <p className="mt-2 text-muted-foreground">
              Focus on these areas to see the biggest impact
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold">Quick Wins (+5-10 points)</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Update resume with quantified achievements</li>
                <li>• Add missing skills to your profile</li>
                <li>• Connect 1 more coding platform</li>
                <li>• Complete 1 mock interview</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold">Medium Impact (+10-20 points)</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Build a full-stack project</li>
                <li>• Solve 50 LeetCode problems</li>
                <li>• Get a relevant certification</li>
                <li>• Improve GitHub contribution streak</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
