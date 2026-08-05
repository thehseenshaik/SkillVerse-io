import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  FileText,
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
import type { ATSReport } from "@/lib/services/ai-career-intelligence";

export const Route = createFileRoute("/ai-ats-score")({
  head: () => ({
    meta: [
      { title: "AI ATS Score — SkillVerse" },
      {
        name: "description",
        content: "Check your resume's ATS compatibility.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ATSScorePage />
    </AuthGate>
  ),
});

function ATSScorePage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [report, setReport] = useState<ATSReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateATSReport(user.id);
      setReport(result);
      toast.success("ATS report generated successfully");
    } catch (error) {
      toast.error("Failed to generate ATS report");
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
            <h1 className="text-3xl font-bold">AI ATS Score</h1>
            <p className="mt-2 text-muted-foreground">
              Check your resume's ATS compatibility and optimization
            </p>
          </div>
          <Button onClick={generateReport} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Generate ATS Report
              </>
            )}
          </Button>
        </div>

        {!report && !loading && (
          <Card className="p-12 text-center">
            <Target className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No ATS Report Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Click "Generate ATS Report" to analyze your resume's ATS compatibility
            </p>
          </Card>
        )}

        {report && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall ATS Score</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on ATS compatibility analysis
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(report.overallScore)}`}>
                    {report.overallScore}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {report.overallScore >= 80 ? "Excellent" : report.overallScore >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <Progress value={report.overallScore} className="mt-6" />
            </Card>

            {/* Section Scores */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Section Scores</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SectionScore
                  label="Structure"
                  score={report.sectionScores.structure}
                />
                <SectionScore
                  label="Formatting"
                  score={report.sectionScores.formatting}
                />
                <SectionScore
                  label="Readability"
                  score={report.sectionScores.readability}
                />
                <SectionScore
                  label="Skills"
                  score={report.sectionScores.skills}
                />
                <SectionScore
                  label="Projects"
                  score={report.sectionScores.projects}
                />
                <SectionScore
                  label="Experience"
                  score={report.sectionScores.experience}
                />
                <SectionScore
                  label="Education"
                  score={report.sectionScores.education}
                />
                <SectionScore
                  label="Contact"
                  score={report.sectionScores.contact}
                />
              </div>
            </Card>

            {/* Missing Keywords */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Optimization Suggestions */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Optimization Suggestions
              </h3>
              <ul className="space-y-3">
                {report.optimizationSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>{suggestion}</span>
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

function SectionScore({ label, score }: { label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
      <Progress value={score} className="mt-2" />
    </div>
  );
}
