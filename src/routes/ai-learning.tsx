import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Code,
  FileText,
  ExternalLink,
  Loader2,
  Clock,
  Badge as BadgeIcon,
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
import type { LearningRecommendation } from "@/lib/services/ai-career-intelligence";

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

const TYPE_ICONS: Record<string, any> = {
  course: BookOpen,
  documentation: FileText,
  practice: Code,
  opensource: Code,
  challenge: Code,
  book: BookOpen,
  video: BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
  course: "bg-blue-100 text-blue-800 border-blue-200",
  documentation: "bg-purple-100 text-purple-800 border-purple-200",
  practice: "bg-green-100 text-green-800 border-green-200",
  opensource: "bg-orange-100 text-orange-800 border-orange-200",
  challenge: "bg-red-100 text-red-800 border-red-200",
  book: "bg-yellow-100 text-yellow-800 border-yellow-200",
  video: "bg-pink-100 text-pink-800 border-pink-200",
};

export const Route = createFileRoute("/ai-learning")({
  head: () => ({
    meta: [
      { title: "AI Learning Recommendations — SkillVerse" },
      {
        name: "description",
        content: "Get personalized learning recommendations based on your skill gaps.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <LearningPage />
    </AuthGate>
  ),
});

function LearningPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateLearningRecommendations(user.id, targetRole);
      setRecommendations(result);
      toast.success("Learning recommendations generated successfully");
    } catch (error) {
      toast.error("Failed to generate recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
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
            <h1 className="text-3xl font-bold">AI Learning Recommendations</h1>
            <p className="mt-2 text-muted-foreground">
              Get personalized learning recommendations based on your skill gaps
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
            <Button onClick={generateRecommendations} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        </div>

        {!recommendations.length && !loading && (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Recommendations Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a target role and click "Get Recommendations" to receive personalized learning suggestions
            </p>
          </Card>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec, index) => {
                const Icon = TYPE_ICONS[rec.type] || BookOpen;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                          <Icon className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={TYPE_COLORS[rec.type]}>
                              {rec.type}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rec.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {rec.estimatedTime}
                      </div>
                      {rec.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={rec.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
