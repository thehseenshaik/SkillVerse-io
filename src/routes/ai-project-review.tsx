import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FolderOpen,
  Star,
  FileText,
  Code,
  Loader2,
  TrendingUp,
  AlertCircle,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ProjectReview } from "@/lib/services/ai-career-intelligence";

export const Route = createFileRoute("/ai-project-review")({
  head: () => ({
    meta: [
      { title: "AI Project Review — SkillVerse" },
      {
        name: "description",
        content: "Get AI-powered feedback on your projects.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ProjectReviewPage />
    </AuthGate>
  ),
});

function ProjectReviewPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [review, setReview] = useState<ProjectReview | null>(null);
  const [loading, setLoading] = useState(false);

  const projects = profile?.projects || [];

  const reviewProject = async () => {
    if (!user?.id || !selectedProject) {
      toast.error("Please select a project");
      return;
    }
    setLoading(true);
    try {
      const project = projects.find((p: any) => p.id === selectedProject);
      if (!project) {
        toast.error("Project not found");
        return;
      }
      const result = await aiCareerIntelligence.reviewProject(user.id, project);
      setReview(result);
      toast.success("Project review completed");
    } catch (error) {
      toast.error("Failed to review project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Project Review</h1>
          <p className="mt-2 text-muted-foreground">
            Get AI-powered feedback on your projects for portfolio improvement
          </p>
        </div>

        {/* Project Selection */}
        <Card className="mb-6 p-6">
          <Label htmlFor="project">Select Project</Label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Select a project...</option>
            {projects.map((project: any) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-end">
            <Button onClick={reviewProject} disabled={loading || !selectedProject}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Review Project
                </>
              )}
            </Button>
          </div>
        </Card>

        {!review && !loading && (
          <Card className="p-12 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Review Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a project from your Identity Hub to get AI-powered feedback
            </p>
          </Card>
        )}

        {review && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Project Score</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on complexity, documentation, and portfolio value
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(review.overallScore)}`}>
                    {review.overallScore}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {review.overallScore >= 80 ? "Excellent" : review.overallScore >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <Progress value={review.overallScore} className="mt-6" />
            </Card>

            {/* Detailed Scores */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Detailed Scores</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ScoreCard
                  title="Complexity"
                  score={review.complexity}
                  icon={Code}
                  description="Technical complexity"
                />
                <ScoreCard
                  title="Documentation"
                  score={review.documentation}
                  icon={FileText}
                  description="Documentation quality"
                />
                <ScoreCard
                  title="Technologies"
                  score={review.technologies}
                  icon={Code}
                  description="Technology stack"
                />
                <ScoreCard
                  title="Readability"
                  score={review.readability}
                  icon={FileText}
                  description="Code readability"
                />
                <ScoreCard
                  title="Portfolio Value"
                  score={review.portfolioValue}
                  icon={Star}
                  description="Portfolio impact"
                />
                <ScoreCard
                  title="Recruiter Appeal"
                  score={review.recruiterAppeal}
                  icon={TrendingUp}
                  description="Recruiter interest"
                />
              </div>
            </Card>

            {/* Improvements */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5 text-brand" />
                Suggested Improvements
              </h3>
              <ul className="space-y-3">
                {review.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
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
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
      <Progress value={score} className="mt-2" />
    </div>
  );
}
