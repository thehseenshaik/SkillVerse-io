import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  SkipForward,
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface InterviewSession {
  currentQuestion: number;
  answers: string[];
  feedback: string[];
  isRecording: boolean;
  timer: number;
  isTimerRunning: boolean;
}

export const Route = createFileRoute("/ai-mock-interview")({
  head: () => ({
    meta: [
      { title: "AI Mock Interview — SkillVerse" },
      {
        name: "description",
        content: "Practice with an AI-powered mock interview.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <MockInterviewPage />
    </AuthGate>
  ),
});

function MockInterviewPage() {
  const { user } = useAuth();
  const { profile } = useIdentityHub();
  const [targetRole, setTargetRole] = useState<string>("Full Stack Developer");
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [session, setSession] = useState<InterviewSession>({
    currentQuestion: 0,
    answers: [],
    feedback: [],
    isRecording: false,
    timer: 0,
    isTimerRunning: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.isTimerRunning) {
      interval = setInterval(() => {
        setSession((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startInterview = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await aiCareerIntelligence.generateInterviewQuestions(user.id, targetRole);
      const allQuestions = [
        ...result.hr,
        ...result.technical,
        ...result.behavioral,
        ...result.project,
        ...result.coding,
        ...result.roleSpecific,
      ];
      setQuestions(result);
      setSession({
        currentQuestion: 0,
        answers: [],
        feedback: [],
        isRecording: false,
        timer: 0,
        isTimerRunning: true,
      });
      setIsStarted(true);
      setIsCompleted(false);
      toast.success("Interview started");
    } catch (error) {
      toast.error("Failed to start interview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    const allQuestions = questions ? [
      ...questions.hr,
      ...questions.technical,
      ...questions.behavioral,
      ...questions.project,
      ...questions.coding,
      ...questions.roleSpecific,
    ] : [];

    setSession((prev) => ({
      ...prev,
      answers: [...prev.answers, currentAnswer],
      currentQuestion: prev.currentQuestion + 1,
      timer: 0,
    }));

    setCurrentAnswer("");

    if (session.currentQuestion >= allQuestions.length - 1) {
      completeInterview();
    }
  };

  const skipQuestion = () => {
    const allQuestions = questions ? [
      ...questions.hr,
      ...questions.technical,
      ...questions.behavioral,
      ...questions.project,
      ...questions.coding,
      ...questions.roleSpecific,
    ] : [];

    setSession((prev) => ({
      ...prev,
      answers: [...prev.answers, "(Skipped)"],
      currentQuestion: prev.currentQuestion + 1,
      timer: 0,
    }));

    setCurrentAnswer("");

    if (session.currentQuestion >= allQuestions.length - 1) {
      completeInterview();
    }
  };

  const completeInterview = () => {
    setSession((prev) => ({ ...prev, isTimerRunning: false }));
    setIsCompleted(true);
    toast.success("Interview completed");
  };

  const getCurrentQuestion = () => {
    if (!questions) return null;
    const allQuestions = [
      ...questions.hr,
      ...questions.technical,
      ...questions.behavioral,
      ...questions.project,
      ...questions.coding,
      ...questions.roleSpecific,
    ];
    return allQuestions[session.currentQuestion];
  };

  const currentQ = getCurrentQuestion();

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Mock Interview</h1>
            <p className="mt-2 text-muted-foreground">
              Practice with an AI-powered interactive interview session
            </p>
          </div>
          {!isStarted && (
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
              <Button onClick={startInterview} disabled={loading} variant="outline">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {!isStarted && (
          <Card className="p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Practice?</h3>
            <p className="mt-2 text-muted-foreground">
              Select your target role and start a mock interview session with AI-generated questions
            </p>
          </Card>
        )}

        {isStarted && !isCompleted && currentQ && (
          <div className="space-y-6">
            {/* Timer and Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand" />
                  <span className="text-2xl font-mono font-bold">{formatTime(session.timer)}</span>
                </div>
                <Badge variant="secondary">
                  Question {session.currentQuestion + 1}
                </Badge>
              </div>
              <Progress value={(session.currentQuestion / 10) * 100} className="mt-4" />
            </Card>

            {/* Current Question */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />
              <div className="mt-4 flex justify-between">
                <Button onClick={skipQuestion} variant="outline">
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                <Button onClick={submitAnswer}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-secondary/20">
              <h4 className="font-semibold mb-2">Tips</h4>
              <p className="text-sm text-muted-foreground">{currentQ.tips}</p>
            </Card>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand/5 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-bold">Interview Completed!</h2>
              <p className="mt-2 text-muted-foreground">
                You answered {session.answers.filter((a) => a !== "(Skipped)").length} questions
              </p>
              <Button onClick={() => setIsStarted(false)} className="mt-4">
                Start New Interview
              </Button>
            </Card>

            {/* Answers Review */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Answers</h3>
              <div className="space-y-4">
                {session.answers.map((answer, index) => (
                  <div key={index} className="border-b border-border/60 pb-4">
                    <p className="text-sm text-muted-foreground mb-2">Question {index + 1}</p>
                    <p className="text-sm">{answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}
