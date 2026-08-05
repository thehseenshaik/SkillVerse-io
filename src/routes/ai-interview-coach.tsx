import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageSquare,
  Briefcase,
  Code,
  Users,
  Target,
  Loader2,
  ChevronRight,
  Lightbulb,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { InterviewQuestions } from "@/lib/services/ai-career-intelligence";

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

export const Route = createFileRoute("/ai-interview-coach")({
  head: () => ({
    meta: [
      { title: "AI Interview Coach — SkillVerse" },
      {
        name: "description",
        content: "Get AI-generated interview questions and answers.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <InterviewCoachPage />
    </AuthGate>
  ),
});

function InterviewCoachPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateInterviewQuestions(user.id, targetRole);
      setQuestions(result);
      toast.success("Interview questions generated successfully");
    } catch (error) {
      toast.error("Failed to generate questions");
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
            <h1 className="text-3xl font-bold">AI Interview Coach</h1>
            <p className="mt-2 text-muted-foreground">
              Get AI-generated interview questions and suggested answers
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
            <Button onClick={generateQuestions} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </div>

        {!questions && !loading && (
          <Card className="p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Questions Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Select a target role and click "Generate Questions" to get interview preparation
            </p>
          </Card>
        )}

        {questions && (
          <Tabs defaultValue="hr" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="hr">HR</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="coding">Coding</TabsTrigger>
              <TabsTrigger value="role">Role-Specific</TabsTrigger>
            </TabsList>

            <TabsContent value="hr" className="mt-6">
              <QuestionCard
                questions={questions.hr}
                icon={Users}
                title="HR Questions"
                description="General HR and cultural fit questions"
              />
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <QuestionCard
                questions={questions.technical}
                icon={Code}
                title="Technical Questions"
                description="Technical knowledge and problem-solving questions"
              />
            </TabsContent>

            <TabsContent value="behavioral" className="mt-6">
              <QuestionCard
                questions={questions.behavioral}
                icon={Briefcase}
                title="Behavioral Questions"
                description="Behavioral and situational questions"
              />
            </TabsContent>

            <TabsContent value="project" className="mt-6">
              <QuestionCard
                questions={questions.project}
                icon={Target}
                title="Project Questions"
                description="Questions about your projects and experience"
              />
            </TabsContent>

            <TabsContent value="coding" className="mt-6">
              <QuestionCard
                questions={questions.coding}
                icon={Code}
                title="Coding Questions"
                description="Coding challenges and algorithm questions"
              />
            </TabsContent>

            <TabsContent value="role" className="mt-6">
              <QuestionCard
                questions={questions.roleSpecific}
                icon={Briefcase}
                title="Role-Specific Questions"
                description="Questions specific to your target role"
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageShell>
  );
}

function QuestionCard({
  questions,
  icon: Icon,
  title,
  description,
}: {
  questions: Array<{ question: string; suggestedAnswer: string; tips: string }>;
  icon: any;
  title: string;
  description: string;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Icon className="h-6 w-6 text-brand" />
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((item, index) => (
          <Card
            key={index}
            className="overflow-hidden border border-border/60"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-4 text-left hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">{item.question}</p>
                <ChevronRight
                  className={`h-5 w-5 flex-shrink-0 transition-transform ${
                    expandedIndex === index ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {expandedIndex === index && (
              <div className="border-t border-border/60 p-4 space-y-4 bg-secondary/20">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                    <Lightbulb className="h-4 w-4 text-brand" />
                    Suggested Answer
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.suggestedAnswer}</p>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                    <Target className="h-4 w-4 text-brand" />
                    Tips
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.tips}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
}
