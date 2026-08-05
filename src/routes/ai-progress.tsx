import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  LineChart,
  Award,
  FileText,
  MessageSquare,
  Building2,
  Loader2,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { aiCareerIntelligence } from "@/lib/services/ai-career-intelligence";
import { aiDataLayer } from "@/lib/services/ai-data-layer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-progress")({
  head: () => ({
    meta: [
      { title: "AI Progress Tracking — SkillVerse" },
      {
        name: "description",
        content: "Track your AI-powered career progress over time.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ProgressPage />
    </AuthGate>
  ),
});

function ProgressPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [loading, setLoading] = useState(false);

  const history = aiCareerIntelligence.getHistory();
  const usage = aiCareerIntelligence.getUsage();

  // Calculate progress metrics
  const careerScores = history
    .filter((item) => item.type === "career_score")
    .map((item) => item.data.overall);

  const atsScores = history
    .filter((item) => item.type === "ats_report")
    .map((item) => item.data.overallScore);

  const latestCareerScore = careerScores.length > 0 ? careerScores[careerScores.length - 1] : 0;
  const previousCareerScore = careerScores.length > 1 ? careerScores[careerScores.length - 2] : 0;
  const careerScoreChange = latestCareerScore - previousCareerScore;

  const latestATSScore = atsScores.length > 0 ? atsScores[atsScores.length - 1] : 0;
  const previousATSScore = atsScores.length > 1 ? atsScores[atsScores.length - 2] : 0;
  const atsScoreChange = latestATSScore - previousATSScore;

  const totalAnalyses = history.length;
  const skillGapAnalyses = history.filter((item) => item.type === "skill_gap_analysis").length;
  const resumeAnalyses = history.filter((item) => item.type === "resume_analysis").length;
  const interviewSessions = history.filter((item) => item.type === "interview_questions").length;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Progress Tracking</h1>
            <p className="mt-2 text-muted-foreground">
              Track your career progress and AI-powered improvements over time
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
                <p className="mt-2 text-3xl font-bold">{totalAnalyses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-brand" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Career Score</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-3xl font-bold">{latestCareerScore}</p>
                  {careerScoreChange !== 0 && (
                    <Badge variant={careerScoreChange > 0 ? "default" : "destructive"}>
                      {careerScoreChange > 0 ? "+" : ""}{careerScoreChange}
                    </Badge>
                  )}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ATS Score</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-3xl font-bold">{latestATSScore}</p>
                  {atsScoreChange !== 0 && (
                    <Badge variant={atsScoreChange > 0 ? "default" : "destructive"}>
                      {atsScoreChange > 0 ? "+" : ""}{atsScoreChange}
                    </Badge>
                  )}
                </div>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interview Sessions</p>
                <p className="mt-2 text-3xl font-bold">{interviewSessions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Activity Breakdown */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Skill Gap Analyses</h3>
            </div>
            <p className="text-3xl font-bold">{skillGapAnalyses}</p>
            <Progress value={(skillGapAnalyses / totalAnalyses) * 100 || 0} className="mt-2" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Resume Analyses</h3>
            </div>
            <p className="text-3xl font-bold">{resumeAnalyses}</p>
            <Progress value={(resumeAnalyses / totalAnalyses) * 100 || 0} className="mt-2" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-brand" />
              <h3 className="font-semibold">Company Matches</h3>
            </div>
            <p className="text-3xl font-bold">{history.filter((item) => item.type === "company_match").length}</p>
            <Progress value={(history.filter((item) => item.type === "company_match").length / totalAnalyses) * 100 || 0} className="mt-2" />
          </Card>
        </div>

        {/* Usage Statistics */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <LineChart className="h-5 w-5 text-brand" />
            AI Usage Statistics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="mt-2 text-2xl font-bold">{usage.totalRequests}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens Consumed</p>
              <p className="mt-2 text-2xl font-bold">{usage.tokensConsumed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="mt-2 text-2xl font-bold">${usage.estimatedCost.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Usage</p>
              <p className="mt-2 text-2xl font-bold">{usage.monthlyUsage}</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-brand" />
            Recent Activity
          </h3>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {history.slice(-10).reverse().map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
