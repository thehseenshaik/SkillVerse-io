import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe,
  Star,
  Layout,
  Navigation,
  FolderOpen,
  Briefcase,
  TrendingUp,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PortfolioReview } from "@/lib/services/ai-career-intelligence";

export const Route = createFileRoute("/ai-portfolio-review")({
  head: () => ({
    meta: [
      { title: "AI Portfolio Review — SkillVerse" },
      {
        name: "description",
        content: "Get AI-powered feedback on your portfolio.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <PortfolioReviewPage />
    </AuthGate>
  ),
});

function PortfolioReviewPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [portfolioUrl, setPortfolioUrl] = useState<string>("");
  const [review, setReview] = useState<PortfolioReview | null>(null);
  const [loading, setLoading] = useState(false);

  const reviewPortfolio = async () => {
    if (!user?.id || !portfolioUrl) {
      toast.error("Please enter your portfolio URL");
      return;
    }
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.reviewPortfolio(user.id, portfolioUrl);
      setReview(result);
      toast.success("Portfolio review completed");
    } catch (error) {
      toast.error("Failed to review portfolio");
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
          <h1 className="text-3xl font-bold">AI Portfolio Review</h1>
          <p className="mt-2 text-muted-foreground">
            Get AI-powered feedback on your portfolio for recruiter appeal
          </p>
        </div>

        {/* Portfolio URL Input */}
        <Card className="mb-6 p-6">
          <Label htmlFor="portfolio">Portfolio URL</Label>
          <Input
            id="portfolio"
            placeholder="https://yourportfolio.com"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="mt-2"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={reviewPortfolio} disabled={loading || !portfolioUrl}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Review Portfolio
                </>
              )}
            </Button>
          </div>
        </Card>

        {!review && !loading && (
          <Card className="p-12 text-center">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Review Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Enter your portfolio URL to get AI-powered feedback on design, content, and recruiter appeal
            </p>
          </Card>
        )}

        {review && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Portfolio Score</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on design, content, and recruiter appeal
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
                  title="Design"
                  score={review.design}
                  icon={Layout}
                  description="Visual design quality"
                />
                <ScoreCard
                  title="Content"
                  score={review.content}
                  icon={FolderOpen}
                  description="Content quality"
                />
                <ScoreCard
                  title="Navigation"
                  score={review.navigation}
                  icon={Navigation}
                  description="Navigation usability"
                />
                <ScoreCard
                  title="Projects"
                  score={review.projects}
                  icon={Briefcase}
                  description="Project presentation"
                />
                <ScoreCard
                  title="Professionalism"
                  score={review.professionalism}
                  icon={Star}
                  description="Professional appearance"
                />
                <ScoreCard
                  title="Recruiter Impression"
                  score={review.recruiterImpression}
                  icon={TrendingUp}
                  description="Recruiter appeal"
                />
              </div>
            </Card>

            {/* Feedback */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5 text-brand" />
                Feedback
              </h3>
              <ul className="space-y-3">
                {review.feedback.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>{item}</span>
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
