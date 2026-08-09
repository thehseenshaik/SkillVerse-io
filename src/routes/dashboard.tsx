import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  FileText,
  Flame,
  Plug,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin, FaCode, FaGlobe } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { GitHubSyncCard } from "@/components/GitHubSyncCard";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { parseGithubUsername } from "@/lib/github";
import { WeeklyGoalsWidget } from "@/components/dashboard/WeeklyGoalsWidget";
import { AchievementsWidget } from "@/components/dashboard/AchievementsWidget";
import { ActivityFeedWidget } from "@/components/dashboard/ActivityFeedWidget";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useInitialSync } from "@/lib/auto-sync";
// Temporarily disabled complex widgets to isolate dashboard rendering issue
// import { GitHubStatsWidget } from "@/components/dashboard/GitHubStatsWidget";
// import { LeetCodeStatsWidget } from "@/components/dashboard/LeetCodeStatsWidget";
// import { IdentityHubAchievementsWidget } from "@/components/dashboard/IdentityHubAchievementsWidget";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillVerse" },
      {
        name: "description",
        content:
          "Your Career Command Center — AI Career Score, streaks, focus for today and personalized insights.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — SkillVerse" },
      {
        property: "og:description",
        content: "Your daily career operating system.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

/** Ambient animated backdrop — works in both light & dark themes. */
function AmbientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] animate-grid-pan"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 90% 60% at 50% 20%, black 40%, transparent 85%)",
        }}
      />
      {/* Aurora blobs */}
      <div
        className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-60 dark:opacity-40 animate-aurora"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--brand) 55%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute top-24 -right-24 h-[560px] w-[560px] rounded-full blur-3xl opacity-50 dark:opacity-35 animate-aurora-2"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-160px] left-1/3 h-[440px] w-[440px] rounded-full blur-3xl opacity-45 dark:opacity-30 animate-aurora"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--brand-glow) 60%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}

function StatSpark({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-12 w-full"
    >
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,100 ${points} 100,100`}
        fill="url(#spark)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, completion, missing } = useProfile();
  const { connections, syncPlatform, isSyncing } = useIdentityHub();
  const first = user?.name?.split(" ")[0] ?? "there";
  const resumeReady = completion === 100;

  // Initialize sync on mount
  useInitialSync();

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px] animate-pulse-glow" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                Career Command Center
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                Good to see you, <span className="text-gradient">{first}</span>.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Here's your career snapshot for today. Small consistent steps
                &gt; big rare pushes.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background/60 px-4 text-sm font-medium backdrop-blur transition-colors hover:bg-secondary"
            >
              View profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Build Resume banner */}
          <Link
            to="/resume"
            className="glass group relative mt-8 flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl p-6 shadow-elegant transition-all hover:-translate-y-0.5 hover:shadow-glow animate-fade-up"
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl opacity-60 transition-opacity group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--brand) 45%, transparent), transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-brand">
                  Build Resume
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {resumeReady
                    ? "Your profile is ready — generate your resume."
                    : `Complete ${missing.length} more field${missing.length === 1 ? "" : "s"} to unlock resume generation.`}
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-4">
              <div>
                <div className="text-right text-xs font-medium text-muted-foreground">
                  Profile
                </div>
                <div className="text-right text-2xl font-extrabold text-gradient">
                  {completion}%
                </div>
              </div>
              <div className="relative h-10 w-40 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient transition-all"
                  style={{ width: `${completion}%` }}
                />
                <div className="absolute inset-0 animate-shimmer opacity-70" />
              </div>
              <span className="inline-flex h-10 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-opacity group-hover:opacity-90">
                {resumeReady ? "Generate" : "Continue"}{" "}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          {/* Top stat row */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {/* AI Career Score */}
            <div className="glass group relative overflow-hidden rounded-3xl p-6 shadow-elegant transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-brand" /> AI Career Score
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" /> Live
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gradient">
                  78
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-brand-gradient transition-all"
                  style={{ width: "78%" }}
                />
                <div className="absolute inset-0 animate-shimmer opacity-70" />
              </div>
              <div className="-mx-2 mt-3">
                <StatSpark
                  values={[62, 65, 63, 70, 72, 74, 78]}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-brand" /> Streak
                </div>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                  On fire
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">42</span>
                <span className="text-base font-semibold text-muted-foreground">
                  days
                </span>
              </div>
              <div
                className="mt-4 grid gap-1"
                style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
              >
                {Array.from({ length: 28 }).map((_, i) => {
                  const intensity = (Math.sin(i * 1.3) + 1) / 2;
                  return (
                    <div
                      key={i}
                      className="h-4 rounded-[3px] transition-transform hover:scale-125"
                      style={{
                        background:
                          intensity > 0.7
                            ? "var(--brand)"
                            : intensity > 0.4
                              ? "color-mix(in oklab, var(--brand) 55%, transparent)"
                              : "color-mix(in oklab, var(--brand) 18%, transparent)",
                      }}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                <span>4 weeks ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Today's focus */}
            <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-brand" /> Today's focus
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  1 / 3
                </span>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2 DSA
                    problems
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    done
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-brand" />{" "}
                    Resume ATS review
                  </span>
                  <span className="text-[10px] font-semibold text-brand">
                    now
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border" /> Mock HR
                    interview
                  </span>
                  <span className="text-[10px]">later</span>
                </li>
              </ul>
            </div>
          </div>

          {/* GitHub live sync */}
          <div className="mt-6">
            <GitHubSyncCard />
          </div>

          {/* Dashboard widgets row */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <WeeklyGoalsWidget />
            <ActivityFeedWidget />
          </div>

          {/* Platform stats row - Temporarily disabled to isolate dashboard rendering issue */}
          {/* <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <GitHubStatsWidget />
            <LeetCodeStatsWidget />
          </div> */}

          {/* Middle grid */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Score pillars */}
            <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Score breakdown</h2>
                <Link
                  to="/career-score"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Deep dive →
                </Link>
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  { label: "Resume", v: 78, tone: "var(--brand)" },
                  { label: "GitHub activity", v: 88, tone: "var(--accent-2)" },
                  { label: "DSA / Coding", v: 82, tone: "var(--brand-glow)" },
                  { label: "Projects", v: 70, tone: "var(--brand)" },
                  {
                    label: "Interview readiness",
                    v: 74,
                    tone: "var(--accent-2)",
                  },
                  { label: "Consistency", v: 91, tone: "var(--brand-glow)" },
                ].map(({ label, v, tone }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold tabular-nums">{v}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${v}%`,
                          background: `linear-gradient(90deg, ${tone}, color-mix(in oklab, ${tone} 60%, white))`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect profiles */}
            <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Plug className="h-4 w-4 text-brand" />
                    <h2 className="text-lg font-semibold">Connect profiles</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signals that power your Career Score.
                  </p>
                </div>
                <Link
                  to="/connections"
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Connect <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {(() => {
                const platformConfig = [
                  {
                    platform: 'github',
                    Icon: FaGithub,
                    name: "GitHub",
                    blurb: "Repos, commits, streaks",
                    iconClass: "text-foreground",
                  },
                  {
                    platform: 'leetcode',
                    Icon: SiLeetcode,
                    name: "LeetCode",
                    blurb: "DSA rating & problems",
                    iconClass: "text-[#FFA116]",
                  },
                  {
                    platform: 'gfg',
                    Icon: FaCode,
                    name: "GeeksforGeeks",
                    blurb: "DSA practice & contests",
                    iconClass: "text-[#2F8D46]",
                  },
                  {
                    platform: 'codeforces',
                    Icon: FaCode,
                    name: "Codeforces",
                    blurb: "Competitive programming",
                    iconClass: "text-[#B91C1C]",
                  },
                  {
                    platform: 'codechef',
                    Icon: FaCode,
                    name: "CodeChef",
                    blurb: "Coding challenges",
                    iconClass: "text-[#8B5CF6]",
                  },
                  {
                    platform: 'hackerrank',
                    Icon: FaCode,
                    name: "HackerRank",
                    blurb: "Certifications & badges",
                    iconClass: "text-[#00EA64]",
                  },
                ];

                const total = platformConfig.length;
                const done = platformConfig.filter(p => connections.find(c => c.platform === p.platform)?.status === 'connected').length;
                const overall = Math.round((done / total) * 100);

                return (
                  <>
                    <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/40 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Tracking progress
                        </span>
                        <span className="font-semibold">
                          {done} / {total}
                        </span>
                      </div>
                      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-brand-gradient transition-all"
                          style={{ width: `${overall}%` }}
                        />
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-sm">
                      {platformConfig.map(
                        ({ platform, Icon, name, blurb, iconClass }) => {
                          const connection = connections.find(c => c.platform === platform);
                          const isConnected = connection?.status === 'connected';
                          return (
                            <li
                              key={name}
                              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-all hover:border-brand/40 hover:bg-background/70 cursor-pointer"
                              onClick={() => isConnected ? navigate({ to: `/analytics/${platform}` }) : navigate({ to: '/connections' })}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-background">
                                  <Icon className={"h-4 w-4 " + iconClass} />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-[13px] font-semibold leading-tight">
                                    {name}
                                  </span>
                                  <span className="block truncate text-[11px] text-muted-foreground">
                                    {isConnected ? `@${connection.username} · Click to view` : blurb}
                                  </span>
                                </span>
                              </span>
                              {isConnected ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    syncPlatform(platform as any);
                                  }}
                                  disabled={isSyncing}
                                  className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand hover:bg-brand/20 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                                  Sync
                                </button>
                              ) : (
                                <Link
                                  to="/connections"
                                  className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Sparkles className="h-3 w-3" /> Connect
                                </Link>
                              )}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </>
                );
              })()}
            </div>
          </div>

        </div>
      </section>
    </PageShell>
  );
}
