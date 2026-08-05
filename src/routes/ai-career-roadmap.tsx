import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp,
  MapPin,
  Calendar,
  BookOpen,
  Award,
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
import type { CareerRoadmap } from "@/lib/services/ai-career-intelligence";

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

export const Route = createFileRoute("/ai-career-roadmap")({
  head: () => ({
    meta: [
      { title: "AI Career Roadmap — SkillVerse" },
      {
        name: "description",
        content: "Get a personalized learning roadmap for your career goals.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <CareerRoadmapPage />
    </AuthGate>
  ),
});

function CareerRoadmapPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRoadmap = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateCareerRoadmap(user.id, targetRole);
      setRoadmap(result);
      toast.success("Career roadmap generated successfully");
    } catch (error) {
      toast.error("Failed to generate roadmap");
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
            <h1 className="text-3xl font-bold">AI Career Roadmap</h1>
            <p className="mt-2 text-muted-foreground">
              Get a personalized learning roadmap for your career goals
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
            <Button onClick={generateRoadmap} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </div>

        {!roadmap && !loading && (
          <Card className="p-12 text-center">
            <TrendingUp className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Roadmap Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a target role and click "Generate Roadmap" to get your personalized learning path
            </p>
          </Card>
        )}

        {roadmap && (
          <div className="space-y-6">
            {/* Roadmap Header */}
            <Card className="p-6 bg-gradient-to-br from-brand/10 to-brand/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{roadmap.title}</h2>
                  <p className="mt-1 text-muted-foreground">
                    Estimated duration: {roadmap.duration}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {roadmap.milestones.length} Milestones
                </Badge>
              </div>
            </Card>

            {/* Milestones */}
            <div className="space-y-6">
              {roadmap.milestones.map((milestone, index) => (
                <Card key={index} className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{milestone.phase}</h3>
                        <p className="mt-1 text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {milestone.timeframe}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {/* Goals */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <MapPin className="h-4 w-4 text-brand" />
                        Goals
                      </h4>
                      <ul className="space-y-2">
                        {milestone.goals.map((goal, goalIndex) => (
                          <li key={goalIndex} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-brand" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <BookOpen className="h-4 w-4 text-brand" />
                        Resources
                      </h4>
                      <ul className="space-y-2">
                        {milestone.resources.map((resource, resourceIndex) => (
                          <li key={resourceIndex} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-brand" />
                            <span>{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Projects */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <TrendingUp className="h-4 w-4 text-brand" />
                        Projects
                      </h4>
                      <ul className="space-y-2">
                        {milestone.projects.map((project, projectIndex) => (
                          <li key={projectIndex} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-brand" />
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <Award className="h-4 w-4 text-brand" />
                        Certifications
                      </h4>
                      <ul className="space-y-2">
                        {milestone.certifications.map((cert, certIndex) => (
                          <li key={certIndex} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-brand" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
