import { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BarChart3,
  HelpCircle,
  Check,
  X,
  MinusCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AptitudeResult, ReviewQuestion } from "@/lib/aptitude-api";

interface AptitudeResultViewProps {
  result: AptitudeResult;
  onRetry: () => void;
  onBackToHub: () => void;
}

export function AptitudeResultView({
  result,
  onRetry,
  onBackToHub,
}: AptitudeResultViewProps) {
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct" | "skipped">("all");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const filteredQuestions = result.reviewQuestions.filter((q) => {
    if (filter === "incorrect") return !q.isCorrect && !q.isSkipped;
    if (filter === "correct") return q.isCorrect;
    if (filter === "skipped") return q.isSkipped;
    return true;
  });

  const categoryName =
    result.category === "quant"
      ? "Quantitative Aptitude"
      : result.category === "logical"
      ? "Logical Reasoning"
      : "Verbal Ability";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-8 animate-fade-up">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 1. TOP RESULT CARD */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block mb-1">
                ASSESSMENT COMPLETE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {categoryName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluated with difficulty-balanced placement scoring.
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-3 bg-secondary/50 border border-border/70 p-3 rounded-2xl shrink-0">
              <div className="h-12 w-12 rounded-xl bg-brand-gradient text-white grid place-items-center shadow-glow">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-foreground tabular-nums">
                  {result.correctCount} <span className="text-sm font-semibold text-muted-foreground">/ {result.totalQuestions}</span>
                </span>
                <span className="block text-xs font-extrabold text-brand">
                  {result.scorePercentage}% Score
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Accuracy
              </span>
              <span className="text-xl font-extrabold text-foreground mt-0.5 block tabular-nums">
                {result.accuracy}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Correct
              </span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
                {result.correctCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                Incorrect
              </span>
              <span className="text-xl font-extrabold text-rose-500 mt-0.5 block tabular-nums">
                {result.incorrectCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/60 bg-background/50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Time Spent
              </span>
              <span className="text-xl font-extrabold text-foreground mt-0.5 block tabular-nums">
                {formatTime(result.timeSpentSeconds)}
              </span>
            </div>
          </div>

          {/* Performance Breakdown by Topic & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/50">
            
            {/* Topic Accuracy */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Performance by Topic
              </h3>
              <div className="space-y-2.5">
                {Object.entries(result.topicStats || {}).map(([topic, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-foreground">{topic}</span>
                        <span className="text-muted-foreground font-semibold">
                          {stat.correct}/{stat.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Accuracy */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Difficulty Breakdown
              </h3>
              <div className="space-y-2.5">
                {Object.entries(result.difficultyStats || {}).map(([diff, stat]) => {
                  if (stat.total === 0) return null;
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={diff} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-foreground">{diff}</span>
                        <span className="text-muted-foreground font-semibold">
                          {stat.correct}/{stat.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-accent-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={onBackToHub}
              className="text-xs font-semibold h-9 rounded-xl border-border hover:bg-secondary cursor-pointer"
            >
              Back to Practice Hub
            </Button>

            <Button
              onClick={onRetry}
              className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-9 px-5 rounded-xl gap-2 shadow-sm cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Another Set
            </Button>
          </div>

        </Card>

        {/* 2. QUESTION REVIEW SECTION */}
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-bold text-foreground">Question-by-Question Review</h2>
              <p className="text-xs text-muted-foreground">
                Step-by-step solutions and mathematical explanations.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border text-xs font-semibold">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  filter === "all" ? "bg-card text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({result.reviewQuestions.length})
              </button>
              <button
                onClick={() => setFilter("incorrect")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  filter === "incorrect" ? "bg-card text-rose-500 font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Incorrect ({result.incorrectCount})
              </button>
              <button
                onClick={() => setFilter("correct")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  filter === "correct" ? "bg-card text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Correct ({result.correctCount})
              </button>
              {result.skippedCount > 0 && (
                <button
                  onClick={() => setFilter("skipped")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                    filter === "skipped" ? "bg-card text-muted-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Skipped ({result.skippedCount})
                </button>
              )}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card
                key={q.id}
                className={cn(
                  "p-5 sm:p-6 rounded-3xl border bg-card shadow-xs space-y-4 transition-colors",
                  q.isCorrect
                    ? "border-emerald-500/30"
                    : q.isSkipped
                    ? "border-border/80"
                    : "border-rose-500/30"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Question {q.index}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-brand">{q.topic}</span>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
                      q.isCorrect
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : q.isSkipped
                        ? "bg-secondary text-muted-foreground border-border"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    )}
                  >
                    {q.isCorrect ? <Check className="h-3 w-3" /> : q.isSkipped ? <MinusCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {q.isCorrect ? "Correct" : q.isSkipped ? "Skipped" : "Incorrect"}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm sm:text-base font-medium text-foreground whitespace-pre-line">
                  {q.question}
                </p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isUserPick = q.userAnswer === opt;
                    const isRealCorrect = q.correctAnswer === opt;

                    return (
                      <div
                        key={opt}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-2",
                          isRealCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold"
                            : isUserPick && !q.isCorrect
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 font-medium"
                            : "bg-background/40 border-border text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-[11px]">{letter}.</span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {isRealCorrect && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        {isUserPick && !q.isCorrect && <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                    <span>Detailed Solution</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </p>
                </div>

              </Card>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
