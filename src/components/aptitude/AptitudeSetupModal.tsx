import { useState } from "react";
import { X, Sparkles, Timer, Shield, Brain, Layers, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AptitudeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: "quant" | "logical" | "verbal";
  onStart: (params: {
    category: "quant" | "logical" | "verbal";
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
    questionCount: number;
    mode: "assessment" | "practice";
    company?: string;
  }) => void;
  loading?: boolean;
}

export function AptitudeSetupModal({
  isOpen,
  onClose,
  initialCategory = "quant",
  onStart,
  loading = false,
}: AptitudeSetupModalProps) {
  const [category, setCategory] = useState<"quant" | "logical" | "verbal">(initialCategory);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Mixed");
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [mode, setMode] = useState<"assessment" | "practice">("assessment");
  const [company, setCompany] = useState<string>("All");

  if (!isOpen) return null;

  const estimatedMins = Math.round(questionCount * 1.25);

  const categoryNames: Record<string, string> = {
    quant: "Quantitative Aptitude",
    logical: "Logical Reasoning",
    verbal: "Verbal Ability",
  };

  const handleStart = () => {
    onStart({
      category,
      difficulty,
      questionCount,
      mode,
      company: company === "All" ? undefined : company,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl space-y-6 relative animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 h-8 w-8 rounded-full border border-border/60 bg-secondary/50 text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
            SPEED DRILL SETUP
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Configure Your Aptitude Set
          </h2>
          <p className="text-xs text-muted-foreground">
            Balanced topics, randomized question ordering, and timed evaluation.
          </p>
        </div>

        {/* 1. Category Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "quant", label: "Quantitative", icon: "📐" },
              { id: "logical", label: "Logical", icon: "🧩" },
              { id: "verbal", label: "Verbal", icon: "📖" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={cn(
                  "p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer",
                  category === cat.id
                    ? "bg-brand/10 border-brand text-brand font-bold shadow-2xs"
                    : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Difficulty
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["Easy", "Medium", "Hard", "Mixed"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={cn(
                  "py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center",
                  difficulty === diff
                    ? "bg-foreground text-background border-foreground font-bold shadow-2xs"
                    : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Question Count & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Questions
            </label>
            <div className="flex gap-1.5">
              {[10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    questionCount === count
                      ? "bg-brand/10 border-brand text-brand font-bold"
                      : "bg-background border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimated Time
            </label>
            <div className="h-8.5 rounded-xl border border-border/60 bg-secondary/40 px-3 flex items-center gap-2 text-xs font-semibold text-foreground">
              <Timer className="h-3.5 w-3.5 text-brand" />
              <span>{estimatedMins} minutes</span>
            </div>
          </div>
        </div>

        {/* 4. Mode Selection: Assessment vs Practice */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Practice Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("assessment")}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5",
                mode === "assessment"
                  ? "bg-brand/10 border-brand text-brand shadow-2xs"
                  : "bg-background border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Assessment Mode</span>
                {mode === "assessment" && <Check className="h-3.5 w-3.5 text-brand" />}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Timed test, score calculated at end.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("practice")}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5",
                mode === "practice"
                  ? "bg-brand/10 border-brand text-brand shadow-2xs"
                  : "bg-background border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Practice Mode</span>
                {mode === "practice" && <Check className="h-3.5 w-3.5 text-brand" />}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Instant answers & step-by-step explanations.
              </p>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-10 rounded-2xl gap-2 shadow-sm cursor-pointer"
        >
          {loading ? (
            <span>Generating Question Set...</span>
          ) : (
            <>
              <span>Start {mode === "assessment" ? "Assessment" : "Practice"} ({questionCount} Qs)</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

      </div>
    </div>
  );
}
