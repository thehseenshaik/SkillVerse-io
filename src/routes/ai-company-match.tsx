import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { CompanyMatch } from "@/lib/services/ai-career-intelligence";

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "NVIDIA",
  "TCS",
  "Infosys",
  "Accenture",
  "Deloitte",
];

export const Route = createFileRoute("/ai-company-match")({
  head: () => ({
    meta: [
      { title: "AI Company Match — SkillVerse" },
      {
        name: "description",
        content: "See how well you match with top companies.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <CompanyMatchPage />
    </AuthGate>
  ),
});

function CompanyMatchPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [selectedCompany, setSelectedCompany] = useState<string>("Google");
  const [match, setMatch] = useState<CompanyMatch | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMatch = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.analyzeCompanyMatch(user.id, selectedCompany);
      setMatch(result);
      toast.success("Company match analysis completed");
    } catch (error) {
      toast.error("Failed to analyze company match");
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Company Match Analysis</h1>
            <p className="mt-2 text-muted-foreground">
              See how well you match with top companies
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {COMPANIES.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={analyzeMatch} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Analyze Match
                </>
              )}
            </Button>
          </div>
        </div>

        {!match && !loading && (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Analysis Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a company and click "Analyze Match" to see your compatibility
            </p>
          </Card>
        )}

        {match && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{match.companyName} Match</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on your skills, experience, and projects
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(match.overallScore)}`}>
                    {match.overallScore}%
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {match.overallScore >= 80 ? "Excellent Match" : match.overallScore >= 60 ? "Good Match" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <Progress value={match.overallScore} className="mt-6" />
            </Card>

            {/* Match Scores */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-brand" />
                Match Breakdown
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MatchScore label="Skill Match" score={match.skillMatch} />
                <MatchScore label="Resume Match" score={match.resumeMatch} />
                <MatchScore label="Experience Match" score={match.experienceMatch} />
                <MatchScore label="Project Match" score={match.projectMatch} />
              </div>
            </Card>

            {/* Missing Requirements */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Missing Requirements
              </h3>
              <div className="space-y-3">
                {match.missingRequirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-4"
                  >
                    <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Improvement Plan */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-brand" />
                Improvement Plan
              </h3>
              <ul className="space-y-3">
                {match.improvementPlan.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
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

function MatchScore({ label, score }: { label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${getScoreColor(score)}`}>{score}%</p>
      <Progress value={score} className="mt-2" />
    </div>
  );
}
