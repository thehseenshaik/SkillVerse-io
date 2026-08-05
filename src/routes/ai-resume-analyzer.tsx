import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Loader2,
  Download,
  Copy,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { ResumeAnalysis } from "@/lib/services/ai-career-intelligence";

export const Route = createFileRoute("/ai-resume-analyzer")({
  head: () => ({
    meta: [
      { title: "AI Resume Analyzer — SkillVerse" },
      {
        name: "description",
        content: "Get AI-powered feedback on your resume.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ResumeAnalyzerPage />
    </AuthGate>
  ),
});

function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.analyzeResume(user.id);
      setAnalysis(result);
      toast.success("Resume analysis completed");
    } catch (error) {
      toast.error("Failed to analyze resume");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Resume Analyzer</h1>
            <p className="mt-2 text-muted-foreground">
              Get comprehensive AI-powered feedback on your resume
            </p>
          </div>
          <Button onClick={analyzeResume} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {!analysis && !loading && (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Analysis Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Click "Analyze Resume" to get AI-powered feedback on your resume
            </p>
          </Card>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Resume Score</h2>
                  <p className="mt-1 text-muted-foreground">{analysis.explanation}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-brand">{analysis.score}</div>
                  <Badge variant="secondary" className="mt-2">
                    {analysis.score >= 80 ? "Excellent" : analysis.score >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
              <Progress value={analysis.score} className="mt-6" />
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="strengths" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="actions">Action Items</TabsTrigger>
              </TabsList>

              <TabsContent value="strengths" className="mt-6">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="weaknesses" className="mt-6">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-3">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Lightbulb className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-600" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <FileText className="h-5 w-5 text-brand" />
                    Prioritized Action Items
                  </h3>
                  <div className="space-y-3">
                    {analysis.actionItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-4"
                      >
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                        <span>{item.action}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </PageShell>
  );
}
