/**
 * PageLoader — full-viewport brand loader.
 * Used while auth hydrates or a protected page prepares. Respects
 * prefers-reduced-motion (animations are neutralized globally in styles.css).
 */
export function PageLoader({
  label = "Loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-background pt-14 text-foreground"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
      </div>

      {/* Orbit mark */}
      <div className="relative grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 rounded-full border border-border/70" />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--brand)",
            borderRightColor:
              "color-mix(in oklch, var(--brand) 55%, transparent)",
            animation: "loader-orbit 1.1s linear infinite",
          }}
        />
        <span
          className="h-2.5 w-2.5 rounded-full bg-brand"
          style={{ animation: "pulse-glow 1.6s ease-in-out infinite" }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium tracking-tight text-foreground">
          {label}
        </span>
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          SkillVerse
        </span>
      </div>
    </div>
  );
}
