import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Props = {
  active: boolean;
  onDone?: () => void;
  /** total duration ms; default 4200 */
  duration?: number;
};

const STEPS = [
  "Parsing your SkillVerse profile…",
  "Fetching GitHub & LeetCode signals…",
  "Ranking experience and projects…",
  "Formatting ATS-safe sections…",
  "Polishing typography & spacing…",
  "Resume ready.",
];

/**
 * A printer-style loading animation used while a resume is being generated.
 * Works in light & dark themes via semantic tokens and respects reduced motion.
 */
export function ResumePrinter({ active, onDone, duration = 4200 }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const stepDur = useMemo(() => duration / STEPS.length, [duration]);

  useEffect(() => {
    if (!active) {
      setStepIdx(0);
      setProgress(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      setStepIdx(Math.min(STEPS.length - 1, Math.floor(elapsed / stepDur)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, stepDur, onDone]);

  if (!active) return null;

  const printedLines = Math.min(9, Math.floor(progress * 11));

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-secondary/40 via-background to-background shadow-elegant">
      <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:p-10">
        {/* --- Printer illustration --- */}
        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
          {/* Emerging paper */}
          <div className="relative h-56 w-56 overflow-hidden rounded-t-md">
            <div
              className="absolute inset-x-0 top-0 mx-auto h-full w-[86%] rounded-t-md border border-b-0 border-border/70 bg-white shadow-sm dark:bg-neutral-100"
              style={{
                animation: `paper-feed ${duration}ms cubic-bezier(.22,1,.36,1) forwards`,
              }}
            >
              {/* Printed lines */}
              <div className="flex flex-col gap-2.5 p-4">
                <div className="h-2.5 w-2/3 rounded-sm bg-neutral-900/85" />
                <div className="h-1.5 w-1/2 rounded-sm bg-neutral-500/70" />
                <div className="mt-2 h-px w-full bg-neutral-300" />
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 origin-left rounded-sm bg-neutral-800/70"
                    style={{
                      width: `${65 + ((i * 13) % 30)}%`,
                      transform: i < printedLines ? "scaleX(1)" : "scaleX(0)",
                      opacity: i < printedLines ? 1 : 0,
                      transition:
                        "transform 260ms ease-out, opacity 200ms ease-out",
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Paper glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-brand/10 via-transparent to-transparent" />
          </div>

          {/* Printer body */}
          <div
            className="relative -mt-2 w-full"
            style={{ animation: "printer-shake 320ms ease-in-out infinite" }}
          >
            {/* Top slot */}
            <div className="mx-auto h-3 w-[92%] rounded-t-md bg-gradient-to-b from-foreground/85 to-foreground/70" />
            <div className="mx-auto h-1 w-[80%] bg-foreground/40 shadow-[inset_0_2px_3px_rgba(0,0,0,0.35)]" />

            {/* Chassis */}
            <div className="relative mx-auto h-24 w-full overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-secondary to-background shadow-elegant">
              {/* Ink-head rail */}
              <div className="absolute inset-x-6 top-3 h-1 rounded-full bg-border/80" />
              <div
                className="absolute top-1.5 left-1/2 h-4 w-10 -translate-x-1/2 rounded-md bg-brand-gradient shadow-glow"
                style={{ animation: "print-head 900ms ease-in-out infinite" }}
              />

              {/* Status LEDs */}
              <div className="absolute right-4 top-10 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  style={{ animation: "led-blink 1.2s ease-in-out infinite" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-brand"
                  style={{
                    animation: "led-blink 1.6s ease-in-out infinite 0.2s",
                  }}
                />
              </div>

              {/* Grille */}
              <div className="absolute inset-x-6 bottom-4 flex items-center gap-1.5">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full bg-border/70"
                  />
                ))}
              </div>

              {/* Brand label */}
              <div className="absolute bottom-1.5 left-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                SkillVerse · Resume Press
              </div>
            </div>

            {/* Feet */}
            <div className="mx-auto mt-1 flex w-[86%] justify-between">
              <span className="h-1.5 w-6 rounded-b-md bg-foreground/60" />
              <span className="h-1.5 w-6 rounded-b-md bg-foreground/60" />
            </div>
          </div>
        </div>

        {/* --- Status panel --- */}
        <div className="flex flex-col justify-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Generating
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Printing your resume…
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            We're compiling your profile, activity and connected platforms into
            a recruiter-ready page.
          </p>

          {/* Steps checklist */}
          <ul className="mt-6 space-y-2.5">
            {STEPS.map((s, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              return (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span
                    className={
                      "grid h-6 w-6 place-items-center rounded-full border transition-colors " +
                      (done
                        ? "border-brand bg-brand text-white"
                        : active
                          ? "border-brand/50 bg-brand/10 text-brand"
                          : "border-border bg-secondary text-muted-foreground")
                    }
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : active ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    )}
                  </span>
                  <span
                    className={
                      done
                        ? "text-foreground/80 line-through decoration-brand/40"
                        : active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                    }
                  >
                    {s}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Progress</span>
              <span className="text-gradient">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand-gradient transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
              <div className="animate-shimmer pointer-events-none absolute inset-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
