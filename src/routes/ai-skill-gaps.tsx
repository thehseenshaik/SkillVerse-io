import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  TrendingUp,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { SkillGapAnalysis } from "@/lib/services/ai-career-intelligence";

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Engineer",
  "Mobile Developer",
  "Embedded Engineer",
];

export const Route = createFileRoute("/ai-skill-gaps")({
  head: () => ({
    meta: [
      { title: "AI Skill Gap Analysis — SkillVerse" },
      {
        name: "description",
        content: "Identify missing skills for your target role.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <SkillGapPage />
    </AuthGate>
  ),
});

function SkillGapPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSkillGaps = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.analyzeSkillGaps(user.id, targetRole);
      setAnalysis(result);
      toast.success("Skill gap analysis completed");
    } catch (error) {
      toast.error("Failed to analyze skill gaps");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "important":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Skill Gap Analysis</h1>
            <p className="mt-2 text-muted-foreground">
              Identify missing skills for your target role
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={analyzeSkillGaps} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  Analyze Gaps
                </>
              )}
            </Button>
          </div>
        </div>

        {!analysis && !loading && (
          <Card className="p-12 text-center">
            <Award className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Analysis Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a target role and click "Analyze Gaps" to identify missing skills
            </p>
          </Card>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Target Role Header */}
            <Card className="p-6 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Target Role: {analysis.targetRole}</h2>
                  <p className="mt-1 text-muted-foreground">
                    Based on your current skills and experience
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {analysis.existingSkills.length} Existing Skills
                </Badge>
              </div>
            </Card>

            {/* Existing Skills */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Award className="h-5 w-5 text-emerald-600" />
                Existing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.existingSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Missing Skills */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Missing Skills
              </h3>
              <div className="space-y-3">
                {analysis.missingSkills.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(item.importance)}>
                        {item.importance}
                      </Badge>
                      <span className="font-medium">{item.skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Order */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-brand" />
                Recommended Learning Order
              </h3>
              <div className="space-y-3">
                {analysis.learningOrder.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold">
                        {item.order}
                      </div>
                      <div>
                        <p className="font-medium">{item.skill}</p>
                        <p className="text-sm text-muted-foreground">{item.estimatedTime}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-brand" />
                Recommendations
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>{recommendation}</span>
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
