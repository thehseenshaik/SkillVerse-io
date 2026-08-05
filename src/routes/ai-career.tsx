import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  Award,
  FileText,
  MessageSquare,
  Building2,
  BookOpen,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useAuth } from "@/lib/auth-context";
import { aiCareerIntelligence } from "@/lib/services/ai-career-intelligence";
import { aiDataLayer } from "@/lib/services/ai-data-layer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-career")({
  head: () => ({
    meta: [
      { title: "AI Career Intelligence — SkillVerse" },
      {
        name: "description",
        content: "AI-powered career analysis, recommendations, and guidance.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AICareerPage />
    </AuthGate>
  ),
});

function AICareerPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [careerScore, setCareerScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "resume" | "ats" | "skills" | "roadmap" | "interview" | "company">("dashboard");

  useEffect(() => {
    if (profile) {
      aiDataLayer.setProfile(profile);
    }
  }, [profile]);

  const calculateCareerScore = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const score = await aiCareerIntelligence.calculateCareerScore(user.id);
      setCareerScore(score);
      toast.success("Career score calculated successfully");
    } catch (error) {
      toast.error("Failed to calculate career score");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && user?.id) {
      calculateCareerScore();
    }
  }, [profile, user]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Career Intelligence</h1>
            <p className="mt-2 text-muted-foreground">
              AI-powered career analysis and personalized recommendations
            </p>
          </div>
          <Button onClick={calculateCareerScore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-border/60 pb-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "resume", label: "Resume Analysis", icon: FileText },
            { id: "ats", label: "ATS Score", icon: Target },
            { id: "skills", label: "Skill Gaps", icon: Award },
            { id: "roadmap", label: "Career Roadmap", icon: TrendingUp },
            { id: "interview", label: "Interview Prep", icon: MessageSquare },
            { id: "company", label: "Company Match", icon: Building2 },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className="gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && careerScore && (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Career Score</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on comprehensive analysis of your profile
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(careerScore.overall)}`}>
                    {careerScore.overall}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {getScoreLabel(careerScore.overall)}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Score Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ScoreCard
                title="ATS Score"
                score={careerScore.atsScore}
                icon={Target}
                description="Resume ATS compatibility"
              />
              <ScoreCard
                title="Skill Score"
                score={careerScore.skillScore}
                icon={Award}
                description="Technical skills assessment"
              />
              <ScoreCard
                title="Resume Readiness"
                score={careerScore.resumeReadiness}
                icon={FileText}
                description="Resume completeness"
              />
              <ScoreCard
                title="Interview Readiness"
                score={careerScore.interviewReadiness}
                icon={MessageSquare}
                description="Interview preparation"
              />
              <ScoreCard
                title="Project Quality"
                score={careerScore.projectQuality}
                icon={BookOpen}
                description="Portfolio project quality"
              />
              <ScoreCard
                title="GitHub Strength"
                score={careerScore.githubStrength}
                icon={Brain}
                description="GitHub profile strength"
              />
              <ScoreCard
                title="Coding Progress"
                score={careerScore.codingProgress}
                icon={TrendingUp}
                description="Coding platform progress"
              />
              <ScoreCard
                title="Learning Progress"
                score={careerScore.learningProgress}
                icon={BookOpen}
                description="Continuous learning"
              />
              <ScoreCard
                title="Employability"
                score={careerScore.employability}
                icon={Building2}
                description="Overall job readiness"
              />
            </div>
          </div>
        )}

        {/* Resume Analysis Tab */}
        {activeTab === "resume" && (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Resume Analysis</h3>
            <p className="mt-2 text-muted-foreground">
              Get AI-powered feedback on your resume
            </p>
            <Button className="mt-4">Analyze Resume</Button>
          </Card>
        )}

        {/* ATS Score Tab */}
        {activeTab === "ats" && (
          <Card className="p-8 text-center">
            <Target className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">ATS Score</h3>
            <p className="mt-2 text-muted-foreground">
              Check your resume's ATS compatibility
            </p>
            <Button className="mt-4">Generate ATS Report</Button>
          </Card>
        )}

        {/* Skill Gaps Tab */}
        {activeTab === "skills" && (
          <Card className="p-8 text-center">
            <Award className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Skill Gap Analysis</h3>
            <p className="mt-2 text-muted-foreground">
              Identify missing skills for your target role
            </p>
            <Button className="mt-4">Analyze Skill Gaps</Button>
          </Card>
        )}

        {/* Career Roadmap Tab */}
        {activeTab === "roadmap" && (
          <Card className="p-8 text-center">
            <TrendingUp className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Career Roadmap</h3>
            <p className="mt-2 text-muted-foreground">
              Get a personalized learning roadmap
            </p>
            <Button className="mt-4">Generate Roadmap</Button>
          </Card>
        )}

        {/* Interview Prep Tab */}
        {activeTab === "interview" && (
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Interview Preparation</h3>
            <p className="mt-2 text-muted-foreground">
              Get AI-generated interview questions and answers
            </p>
            <Button className="mt-4">Start Interview Prep</Button>
          </Card>
        )}

        {/* Company Match Tab */}
        {activeTab === "company" && (
          <Card className="p-8 text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Company Match Analysis</h3>
            <p className="mt-2 text-muted-foreground">
              See how well you match with top companies
            </p>
            <Button className="mt-4">Analyze Company Match</Button>
          </Card>
        )}
      </div>
    </PageShell>
  );
}

function ScoreCard({
  title,
  score,
  icon: Icon,
  description,
}: {
  title: string;
  score: number;
  icon: any;
  description: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
      </div>
      <Progress value={score} className="mt-4" />
    </Card>
  );
}
