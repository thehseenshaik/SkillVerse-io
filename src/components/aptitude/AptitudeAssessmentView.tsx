import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Timer,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Check,
  X,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AptitudeSession, AptitudeQuestion, aptitudeApi } from "@/lib/aptitude-api";
import { toast } from "sonner";

interface AptitudeAssessmentViewProps {
  session: AptitudeSession;
  uid: string;
  onFinish: (result: any) => void;
  onExit: () => void;
}

export function AptitudeAssessmentView({
  session,
  uid,
  onFinish,
  onExit,
}: AptitudeAssessmentViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [practiceFeedback, setPracticeFeedback] = useState<Record<string, { isCorrect: boolean; correctAnswer: string; explanation: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Expiry & Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const expiresMs = new Date(session.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
  });

  const questions = session.questions;
  const currentQ: AptitudeQuestion | undefined = questions[currentIndex];

  // Auto-countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Select Option
  const handleSelectOption = async (option: string) => {
    if (!currentQ) return;
    const qId = currentQ.id;

    // Optimistically update
    setAnswers((prev) => ({ ...prev, [qId]: option }));

    try {
      const res = await aptitudeApi.submitAnswer({
        sessionId: session.sessionId,
        uid,
        questionId: qId,
        selectedOption: option,
      });

      if (session.mode === "practice" && res.isCorrect !== undefined) {
        setPracticeFeedback((prev) => ({
          ...prev,
          [qId]: {
            isCorrect: res.isCorrect!,
            correctAnswer: res.correctAnswer!,
            explanation: res.explanation!,
          },
        }));
      }
    } catch {
      // ignore network glitch
    }
  };

  // Toggle Flag
  const toggleFlag = (qId: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Final Submit Action
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const totalTimeSpent = Math.max(1, Math.round(session.durationMins * 60 - secondsRemaining));
      const result = await aptitudeApi.submitAssessment({
        sessionId: session.sessionId,
        uid,
        answers,
        timeSpentSeconds: totalTimeSpent,
      });
      toast.success("Assessment evaluated successfully!");
      onFinish(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit assessment");
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.info("Time limit reached. Submitting assessment...");
    void handleSubmit();
  };

  // Keyboard navigation & option shortcuts (1,2,3,4 or A,B,C,D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmModal) return;

      if (e.key === "ArrowRight") {
        if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (["1", "2", "3", "4"].includes(e.key) && currentQ) {
        const idx = parseInt(e.key) - 1;
        if (currentQ.options[idx]) handleSelectOption(currentQ.options[idx]);
      } else if (["a", "b", "c", "d"].includes(e.key.toLowerCase()) && currentQ) {
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const idx = map[e.key.toLowerCase()];
        if (currentQ.options[idx]) handleSelectOption(currentQ.options[idx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions, currentQ, showConfirmModal]);

  // Statistics for summary
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flags.size;
  const unansweredCount = questions.length - answeredCount;

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  if (!currentQ) return null;

  const currentFeedback = practiceFeedback[currentQ.id];

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      
      {/* 1. DISTRACTION-FREE ASSESSMENT TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Category & Mode */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              {session.category === "quant" ? "Quantitative" : session.category === "logical" ? "Logical Reasoning" : "Verbal Ability"}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
              {session.mode === "practice" ? "Practice Mode" : "Assessment Mode"}
            </span>
          </div>

          {/* Center: Live Timer Countdown */}
          <div className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-tight shadow-2xs",
            secondsRemaining < 120
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"
              : "bg-secondary/60 border-border text-foreground"
          )}>
            <Timer className="h-4 w-4 text-brand" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onExit}
              className="text-xs h-8 rounded-xl font-semibold border-border hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Exit
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-8 px-4 rounded-xl shadow-sm cursor-pointer"
            >
              Submit Test →
            </Button>
          </div>

        </div>

        {/* Thin Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* 2. MAIN ASSESSMENT WORKSPACE */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Current Question Workspace (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            <Card className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card shadow-xs space-y-6">
              
              {/* Question Meta Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs font-semibold text-brand">
                    {currentQ.topic}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      currentQ.difficulty === "Easy"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : currentQ.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {currentQ.difficulty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer",
                    flags.has(currentQ.id)
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>{flags.has(currentQ.id) ? "Flagged" : "Flag"}</span>
                </button>
              </div>

              {/* Question Body */}
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed whitespace-pre-line">
                  {currentQ.question}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[currentQ.id] === opt;

                  // Practice mode coloring
                  let practiceStyle = "";
                  if (currentFeedback) {
                    if (opt === currentFeedback.correctAnswer) {
                      practiceStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold";
                    } else if (isSelected && !currentFeedback.isCorrect) {
                      practiceStyle = "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer group",
                        isSelected && !practiceStyle
                          ? "bg-brand/10 border-brand text-foreground font-semibold shadow-2xs"
                          : practiceStyle || "bg-background/60 border-border text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className={cn(
                          "h-7 w-7 rounded-xl border grid place-items-center text-xs font-bold shrink-0 transition-colors",
                          isSelected
                            ? "bg-brand text-brand-foreground border-brand"
                            : "border-border bg-secondary text-muted-foreground group-hover:text-foreground"
                        )}>
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{opt}</span>
                      </div>

                      {isSelected && !currentFeedback && (
                        <Check className="h-4 w-4 text-brand shrink-0" />
                      )}
                      {currentFeedback && opt === currentFeedback.correctAnswer && (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      {currentFeedback && isSelected && !currentFeedback.isCorrect && (
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation (Practice Mode Only) */}
              {session.mode === "practice" && currentFeedback && (
                <div className="p-4 rounded-2xl border border-brand/20 bg-brand/5 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand">
                    <Sparkles className="h-4 w-4" />
                    <span>Explanation & Solution</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                    {currentFeedback.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  className="text-xs h-9 rounded-xl font-semibold gap-1.5 border-border hover:bg-secondary cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm cursor-pointer"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 rounded-xl gap-1.5 shadow-sm cursor-pointer"
                  >
                    Finish Assessment ✓
                  </Button>
                )}
              </div>

            </Card>

          </div>

          {/* Right Column: Question Navigator & Summary Grid (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <Card className="p-5 rounded-3xl border border-border/80 bg-card shadow-xs space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Question Navigator
                </h3>
                <span className="text-xs font-bold text-foreground">
                  {answeredCount} / {questions.length} Answered
                </span>
              </div>

              {/* Numbered Grid (1..N) */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlagged = flags.has(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "h-9 rounded-xl border text-xs font-bold relative transition-all cursor-pointer",
                        isCurrent
                          ? "ring-2 ring-brand bg-brand/10 text-brand border-brand font-black scale-105 shadow-2xs"
                          : isAnswered
                          ? "bg-foreground text-background border-foreground font-semibold"
                          : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-card" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-foreground" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-border bg-background" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded ring-1 ring-brand bg-brand/10" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-500" />
                  <span>Flagged ({flaggedCount})</span>
                </div>
              </div>

            </Card>

            {/* Quick Keyboard Shortcuts Hint */}
            <div className="p-3.5 rounded-2xl border border-border/60 bg-secondary/30 text-[11px] text-muted-foreground space-y-1">
              <span className="font-bold text-foreground block">Pro-Tip:</span>
              <p>Press <kbd className="px-1.5 py-0.5 rounded bg-card border text-[10px] font-mono">1-4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-card border text-[10px] font-mono">A-D</kbd> to select an option, and arrow keys to navigate.</p>
            </div>

          </div>

        </div>
      </main>

      {/* 3. CONFIRMATION SUBMIT DIALOG */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-5 animate-scale-in">
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Submit Assessment?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {unansweredCount > 0 ? (
                  <>You have <strong className="text-rose-500 font-bold">{unansweredCount} unanswered</strong> and <strong className="text-amber-500 font-bold">{flaggedCount} flagged</strong> question{unansweredCount > 1 ? "s" : ""}. Are you sure you want to finalize your evaluation?</>
                ) : (
                  <>All {questions.length} questions have been answered. Ready to generate your performance score?</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-secondary/40 border border-border/60 text-center text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Answered</span>
                <span className="text-base font-extrabold text-foreground">{answeredCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Unanswered</span>
                <span className="text-base font-extrabold text-rose-500">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Flagged</span>
                <span className="text-base font-extrabold text-amber-500">{flaggedCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="text-xs font-semibold h-9 rounded-xl border-border"
              >
                Go Back & Review
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-9 px-4 rounded-xl shadow-sm"
              >
                {submitting ? "Evaluating Score..." : "Confirm & Submit →"}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
