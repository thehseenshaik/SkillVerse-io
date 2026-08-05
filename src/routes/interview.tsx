import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Lightbulb,
  Loader2,
  Mic,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  evaluateInterviewAnswer,
  generateInterviewQuestions,
  type InterviewFeedback,
  type InterviewQuestion,
} from "@/lib/interview.client";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "AI Mock Interview — SkillVerse" },
      {
        name: "description",
        content:
          "Practice role-specific interviews with an AI interviewer. Get instant, honest feedback on every answer — correctness, clarity, depth and structure.",
      },
      { property: "og:title", content: "AI Mock Interview — SkillVerse" },
      {
        property: "og:description",
        content:
          "Role-specific questions and per-answer AI feedback. Practice like it's placement day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGate>
      <InterviewPage />
    </AuthGate>
  ),
});

type Level = "intern" | "junior" | "mid" | "senior";
type Focus = "technical" | "behavioral" | "system-design" | "mixed";

type FeedbackMap = Record<string, InterviewFeedback | undefined>;
type AnswerMap = Record<string, string>;
type LoadingMap = Record<string, boolean>;

function InterviewPage() {
  const [role, setRole] = useState("Frontend Engineer");
  const [level, setLevel] = useState<Level>("junior");
  const [focus, setFocus] = useState<Focus>("mixed");
  const [count, setCount] = useState(5);
  const [timed, setTimed] = useState(true);
  const [perQuestion, setPerQuestion] = useState(90); // seconds

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [revealHint, setRevealHint] = useState<Record<string, boolean>>({});
  const [evaluating, setEvaluating] = useState<LoadingMap>({});
  const [generating, setGenerating] = useState(false);

  // Timed round state
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const answersRef = useRef<AnswerMap>({});
  const evaluatingRef = useRef<LoadingMap>({});
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    evaluatingRef.current = evaluating;
  }, [evaluating]);

  const activeQuestion = activeIdx != null ? questions[activeIdx] : null;

  const startSession = async () => {
    if (!role.trim()) return toast.error("Enter a role first");
    setGenerating(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/interview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.trim(), level, focus, count }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers({});
      setFeedback({});
      setRevealHint({});
      if (timed && data.questions.length) {
        setActiveIdx(0);
        setRemaining(perQuestion);
        setPaused(false);
      } else {
        setActiveIdx(null);
      }
      toast.success(
        timed
          ? `Timed round started · ${data.questions.length} questions`
          : `Loaded ${data.questions.length} questions`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to generate questions",
      );
    } finally {
      setGenerating(false);
    }
  };

  const advance = (fromIdx: number) => {
    const next = fromIdx + 1;
    if (next >= questions.length) {
      setActiveIdx(null);
      toast.success("Timed round complete");
      return;
    }
    setActiveIdx(next);
    setRemaining(perQuestion);
    const nextId = questions[next]?.id;
    if (nextId) {
      requestAnimationFrame(() => {
        cardRefs.current[nextId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  };

  const submitAnswer = async (
    q: InterviewQuestion,
    opts?: { autoAdvance?: boolean },
  ) => {
    const answer = answersRef.current[q.id]?.trim() ?? "";
    if (!answer || answer.length < 4) {
      if (!opts?.autoAdvance) toast.error("Write your answer first");
      return;
    }
    setEvaluating((s) => ({ ...s, [q.id]: true }));
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.trim(), level, question: q.question, answer }),
      });
      const fb = await res.json();
      setFeedback((s) => ({ ...s, [q.id]: fb }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setEvaluating((s) => ({ ...s, [q.id]: false }));
    }
  };

  const skipActive = () => {
    if (activeIdx == null) return;
    advance(activeIdx);
  };

  // Countdown effect
  useEffect(() => {
    if (!timed || activeIdx == null || paused) return;
    if (feedback[questions[activeIdx]?.id ?? ""]) return; // already scored, don't tick
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [timed, activeIdx, paused, remaining, questions, feedback]);

  // Time up handler
  useEffect(() => {
    if (!timed || activeIdx == null || paused) return;
    if (remaining > 0) return;
    const q = questions[activeIdx];
    if (!q) return;
    const hasAnswer = (answersRef.current[q.id]?.trim().length ?? 0) >= 4;
    if (hasAnswer && !evaluatingRef.current[q.id] && !feedback[q.id]) {
      // Fire-and-forget grade, then move on immediately
      void submitAnswer(q, { autoAdvance: true });
      toast.info(`Time's up — auto-submitted Q${activeIdx + 1}`);
    } else if (!hasAnswer) {
      toast.warning(`Time's up — skipped Q${activeIdx + 1}`);
    }
    advance(activeIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, timed, activeIdx, paused]);

  const answeredCount = Object.values(feedback).filter(Boolean).length;
  const avgScore =
    answeredCount === 0
      ? 0
      : Math.round(
          Object.values(feedback).reduce(
            (sum, f) => sum + (f?.overall ?? 0),
            0,
          ) / answeredCount,
        );

  return (
    <PageShell>
      {/* Hero / setup */}
      <section className="relative overflow-hidden bg-hero pt-20 pb-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-4 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                <Bot className="h-3.5 w-3.5 text-brand" /> AI Mock Interview
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Interview practice,{" "}
                <span className="text-gradient">tuned to your role.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Pick a role and level — SkillVerse generates realistic questions
                and grades every answer on correctness, clarity, depth and
                structure.
              </p>
            </div>
            <Link
              to="/practice"
              className="hidden shrink-0 text-xs font-semibold text-muted-foreground hover:text-brand md:inline-flex"
            >
              ← Back to Practice
            </Link>
          </div>

          {/* Setup card */}
          <div className="glass mt-8 rounded-3xl p-6 shadow-elegant">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
              <div className="space-y-1.5">
                <Label className="text-xs">Target role</Label>
                <Input
                  className="h-10"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Engineer, ML Engineer, Product Analyst"
                />
              </div>
              <SelectField
                label="Level"
                value={level}
                onChange={(v) => setLevel(v as Level)}
                options={[
                  { v: "intern", l: "Intern" },
                  { v: "junior", l: "Junior" },
                  { v: "mid", l: "Mid" },
                  { v: "senior", l: "Senior" },
                ]}
              />
              <SelectField
                label="Round"
                value={focus}
                onChange={(v) => setFocus(v as Focus)}
                options={[
                  { v: "mixed", l: "Mixed" },
                  { v: "technical", l: "Technical" },
                  { v: "behavioral", l: "Behavioral" },
                  { v: "system-design", l: "System design" },
                ]}
              />
              <SelectField
                label="Questions"
                value={String(count)}
                onChange={(v) => setCount(Number(v))}
                options={[3, 5, 7].map((n) => ({ v: String(n), l: `${n}` }))}
              />
              <div className="flex items-end">
                <Button
                  onClick={startSession}
                  disabled={generating}
                  className="h-10 w-full bg-brand-gradient text-white shadow-glow hover:opacity-95 md:w-auto"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Preparing…
                    </>
                  ) : questions.length ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" /> New session
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Start
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Timed round controls */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={timed}
                  onChange={(e) => setTimed(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-[hsl(var(--brand))]"
                />
                <Timer className="h-3.5 w-3.5 text-brand" />
                Timed round — auto-advance when the clock hits zero
              </label>
              {timed && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Per question
                  </span>
                  <select
                    value={perQuestion}
                    onChange={(e) => setPerQuestion(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    {[45, 60, 90, 120, 180, 300].map((s) => (
                      <option key={s} value={s}>
                        {s < 60 ? `${s}s` : `${Math.round(s / 60)} min`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeIdx != null && (
                <div className="ml-auto flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Q{activeIdx + 1}/{questions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 font-medium hover:border-brand hover:text-brand"
                  >
                    {paused ? (
                      <Play className="h-3 w-3" />
                    ) : (
                      <Pause className="h-3 w-3" />
                    )}
                    {paused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={skipActive}
                    className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 font-medium hover:border-brand hover:text-brand"
                  >
                    <SkipForward className="h-3 w-3" /> Skip
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Session score */}
          {answeredCount > 0 && (
            <div className="glass mt-4 flex items-center justify-between rounded-2xl px-5 py-3">
              <div className="flex items-center gap-3 text-sm">
                <Trophy className="h-4 w-4 text-brand" />
                <span className="text-muted-foreground">Session score</span>
                <span className="text-lg font-bold text-gradient">
                  {avgScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {answeredCount}/{questions.length} answered
                </span>
              </div>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Questions list */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl space-y-5 px-6">
          {questions.length === 0 && !generating && <EmptyState />}

          {generating && questions.length === 0 && (
            <div className="glass grid place-items-center rounded-3xl py-16 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <p className="mt-3 text-sm text-muted-foreground">
                Designing your interview…
              </p>
            </div>
          )}

          {questions.map((q, idx) => {
            const fb = feedback[q.id];
            const isEval = evaluating[q.id];
            const isActive = timed && activeIdx === idx;
            const isLocked = timed && activeIdx != null && idx !== activeIdx;
            return (
              <article
                key={q.id}
                ref={(el) => {
                  cardRefs.current[q.id] = el;
                }}
                className={
                  "glass rounded-3xl p-6 shadow-elegant transition-all " +
                  (isActive
                    ? "ring-2 ring-brand/60 shadow-glow"
                    : isLocked
                      ? "opacity-60"
                      : "hover:shadow-glow")
                }
              >
                <header className="flex flex-wrap items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <Chip>{q.category}</Chip>
                  <DifficultyBadge d={q.difficulty} />
                  {isActive && (
                    <TimerPill
                      remaining={remaining}
                      total={perQuestion}
                      paused={paused}
                    />
                  )}
                  {fb && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      <Check className="h-3 w-3" /> Scored {fb.overall}
                    </span>
                  )}
                </header>

                <h3 className="mt-3 text-lg font-semibold leading-snug">
                  {q.question}
                </h3>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setRevealHint((s) => ({ ...s, [q.id]: !s[q.id] }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {revealHint[q.id] ? "Hide hint" : "Peek at a hint"}
                  </button>
                  {revealHint[q.id] && q.hint && (
                    <p className="mt-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
                      {q.hint}
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Your answer</Label>
                  <Textarea
                    rows={5}
                    placeholder="Speak out loud, then type the gist of your answer here. Structure it: context → approach → tradeoffs → result."
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((s) => ({ ...s, [q.id]: e.target.value }))
                    }
                    disabled={isLocked}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {
                        (answers[q.id] ?? "")
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean).length
                      }{" "}
                      words
                    </span>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await submitAnswer(q);
                        if (timed && activeIdx === idx) advance(idx);
                      }}
                      disabled={isEval || isLocked}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isEval ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />{" "}
                          Grading…
                        </>
                      ) : fb ? (
                        <>
                          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Re-grade
                        </>
                      ) : timed && isActive ? (
                        <>
                          <Mic className="mr-2 h-3.5 w-3.5" /> Submit &amp; next
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-3.5 w-3.5" /> Get feedback
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {fb && <FeedbackPanel fb={fb} />}
              </article>
            );
          })}

          {questions.length > 0 && (
            <div className="pt-6 text-center">
              <Button
                variant="outline"
                onClick={startSession}
                disabled={generating}
                className="rounded-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Fresh set of questions
              </Button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function FeedbackPanel({ fb }: { fb: InterviewFeedback }) {
  const bars: Array<[string, number]> = [
    ["Correctness", fb.scores.correctness],
    ["Clarity", fb.scores.clarity],
    ["Depth", fb.scores.depth],
    ["Structure", fb.scores.structure],
  ];
  return (
    <div className="mt-5 grid gap-5 rounded-2xl border border-border/60 bg-gradient-to-b from-secondary/40 to-transparent p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-brand">
          AI verdict
        </div>
        <div className="mt-1 text-4xl font-extrabold text-gradient">
          {fb.overall}
          <span className="text-base font-semibold text-muted-foreground">
            /100
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{fb.verdict}</p>
        <div className="mt-4 space-y-2.5">
          {bars.map(([label, v]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{v}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <FeedbackList title="What worked" items={fb.strengths} tone="pos" />
        <FeedbackList
          title="What to improve"
          items={fb.improvements}
          tone="neg"
        />
        {fb.modelAnswer && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Model answer
            </div>
            <p className="mt-1.5 rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed">
              {fb.modelAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimerPill({
  remaining,
  total,
  paused,
}: {
  remaining: number;
  total: number;
  paused: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const low = remaining <= 10;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const label = `${mm}:${ss.toString().padStart(2, "0")}`;
  return (
    <span
      className={
        "ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums " +
        (paused
          ? "border-border/70 bg-secondary/60 text-muted-foreground"
          : low
            ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
            : "border-brand/40 bg-brand/10 text-brand")
      }
      aria-live="polite"
      aria-label={`Time remaining ${label}`}
    >
      <Timer className="h-3.5 w-3.5" />
      {paused ? "Paused" : label}
      <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-background/70">
        <span
          className={
            "absolute inset-y-0 left-0 " +
            (low ? "bg-rose-500" : "bg-brand-gradient")
          }
          style={{ width: `${pct}%` }}
        />
      </span>
    </span>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "pos" | "neg";
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                (tone === "pos" ? "bg-emerald-500" : "bg-brand")
              }
            />
            <span className="text-foreground/85">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ v: string; l: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand/40"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function DifficultyBadge({ d }: { d: "easy" | "medium" | "hard" }) {
  const map = {
    easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  } as const;
  return (
    <span
      className={
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " +
        map[d]
      }
    >
      {d}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
        <Target className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl font-bold">Ready when you are.</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Set your target role and level above, then hit Start. SkillVerse will
        draft a fresh set of interview questions and grade every answer
        instantly.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <Chip>Role-specific</Chip>
        <ChevronRight className="h-3 w-3" />
        <Chip>Instant feedback</Chip>
        <ChevronRight className="h-3 w-3" />
        <Chip>Model answers</Chip>
      </div>
      <Link
        to="/practice"
        className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
      >
        Or browse other practice tracks <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
