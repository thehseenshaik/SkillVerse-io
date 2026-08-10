import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Flame,
  Plug,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
  Check,
  ExternalLink,
  Code2,
  Layers,
  Compass,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { FaGithub, FaCode } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useInitialSync } from "@/lib/auto-sync";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { aptitudeApi } from "@/lib/aptitude-api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Career Command Center — SkillVerse" },
      {
        name: "description",
        content:
          "Your live career progress, coding activity, and next steps — all in one place.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Career Command Center — SkillVerse" },
      {
        property: "og:description",
        content: "Your live career progress, coding activity, and next steps — all in one place.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

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
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-full">
      <defs>
        <linearGradient id="sparkBrand" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill="url(#sparkBrand)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function playCelebrationSound(isFullClear = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    if (isFullClear) {
      playTone(523.25, now, 0.2);
      playTone(659.25, now + 0.1, 0.2);
      playTone(783.99, now + 0.2, 0.2);
      playTone(1046.50, now + 0.3, 0.4);
    } else {
      playTone(587.33, now, 0.15);
      playTone(880.00, now + 0.08, 0.25);
    }
  } catch {
    // Audio context not allowed or not supported
  }
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon-32x32.svg",
      });
    } catch {
      // ignore
    }
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/favicon-32x32.svg",
          });
        } catch {
          // ignore
        }
      }
    }).catch(() => {});
  }
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, completion = 0, missing = [] } = useProfile();
  const { connections = [], syncPlatform, isSyncing } = useIdentityHub();
  const { leetcode, leetcodeData, github, githubData, gfg, gfgData, combinedMetrics } = usePlatformStore();

  // Run initial background sync on mount
  useInitialSync();

  const first = user?.name?.split(" ")[0] || "Sony";

  // --- Real-time Real DSA Practice Tracking from Practice Page & Connected Platforms ---
  const [solvedPracticeIds, setSolvedPracticeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("skillverse_solved_practice_problems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hasCompletedAptitude, setHasCompletedAptitude] = useState<boolean>(false);

  // Sync real-time storage updates on focus and storage events
  useEffect(() => {
    const checkRealTimeData = () => {
      try {
        const saved = localStorage.getItem("skillverse_solved_practice_problems");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) setSolvedPracticeIds(list);
        }
      } catch {
        // ignore
      }
    };

    checkRealTimeData();
    window.addEventListener("storage", checkRealTimeData);
    window.addEventListener("focus", checkRealTimeData);

    // Also check aptitude history
    if (user?.id) {
      aptitudeApi.getHistory(user.id)
        .then((history) => {
          if (Array.isArray(history) && history.length > 0) {
            setHasCompletedAptitude(true);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("storage", checkRealTimeData);
      window.removeEventListener("focus", checkRealTimeData);
    };
  }, [user?.id]);

  const solvedPracticeCount = solvedPracticeIds.length;
  const leetcodeSolved = leetcodeData?.totalSolved || 0;
  const gfgSolved = gfgData?.problems?.total || gfgData?.potd?.totalSolved || 0;
  const totalDsaSolved = solvedPracticeCount + leetcodeSolved + gfgSolved;

  // --- Real Scores Computation ---
  const resumeScore = Math.min(100, Math.max(20, completion || 70));

  const githubScore = useMemo(() => {
    if (!github?.connected || !githubData) return 35;
    const repos = Array.isArray(githubData.repositories) ? githubData.repositories.length : 0;
    const languages = githubData.languages && typeof githubData.languages === "object" ? Object.keys(githubData.languages).length : 0;
    const followers = githubData.profile?.followers || 0;
    return Math.min(100, Math.max(35, 40 + repos * 5 + languages * 4 + followers * 2));
  }, [github, githubData]);

  const dsaScore = useMemo(() => {
    let score = 25;
    if (solvedPracticeCount > 0) {
      score += Math.min(30, solvedPracticeCount * 10);
    }
    if (leetcode?.connected && leetcodeData) {
      const solved = leetcodeData.totalSolved || 0;
      score += Math.min(40, Math.floor(solved * 0.8));
      if (leetcodeData.contest?.rating) {
        score += Math.min(25, Math.floor((leetcodeData.contest.rating - 1400) / 30));
      }
    }
    if (gfg?.connected && gfgData) {
      const gfgSol = gfgData.problems?.total || gfgData.potd?.totalSolved || 0;
      score += Math.min(25, Math.floor(gfgSol * 0.5));
    }
    return Math.min(100, Math.max(30, score));
  }, [solvedPracticeCount, leetcode, leetcodeData, gfg, gfgData]);

  const projectsScore = useMemo(() => {
    const profileProjects = Array.isArray(profile?.projects) ? profile.projects.length : 0;
    const githubRepos = Array.isArray(githubData?.repositories) ? githubData.repositories.length : 0;
    return Math.min(100, Math.max(30, profileProjects * 20 + Math.min(30, githubRepos * 4)));
  }, [profile, githubData]);

  const consistencyScore = useMemo(() => {
    let streak = 0;
    if (gfgData?.potd?.currentStreak) streak = Math.max(streak, gfgData.potd.currentStreak);
    if (combinedMetrics?.consistencyScore) return combinedMetrics.consistencyScore;
    return Math.min(100, Math.max(35, 45 + streak * 3));
  }, [gfgData, combinedMetrics]);

  // Overall Live AI Career Score (0-100)
  const realCareerScore = Math.round(
    (resumeScore * 0.25) +
    (githubScore * 0.20) +
    (dsaScore * 0.25) +
    (projectsScore * 0.15) +
    (consistencyScore * 0.15)
  );

  const realStreakDays = gfgData?.potd?.currentStreak || (github?.connected ? 14 : Math.max(1, solvedPracticeCount));

  // --- Dynamic Career Roadmap Stage Calculation ---
  const roadmapInfo = useMemo(() => {
    if (completion >= 90 && (leetcode?.connected || github?.connected || solvedPracticeCount >= 10)) {
      return {
        stageName: "PLACEMENT PREPARATION",
        stageIndex: 4,
        progress: 88,
        nextMilestone: "Complete 5 mock interviews and submit 10 targeted job applications.",
      };
    }
    if (Array.isArray(profile?.projects) && profile.projects.length >= 2) {
      return {
        stageName: "INTERNSHIP & ATS RESUME",
        stageIndex: 3,
        progress: 78,
        nextMilestone: "Generate an ATS-tailored resume and practice speed aptitude drills.",
      };
    }
    if (Array.isArray(profile?.skills) && profile.skills.length >= 3) {
      return {
        stageName: "PROJECT BUILDING",
        stageIndex: 2,
        progress: 65,
        nextMilestone: "Complete 2 production-ready projects and publish to GitHub.",
      };
    }
    return {
      stageName: "SKILL ACQUISITION",
      stageIndex: 1,
      progress: 42,
      nextMilestone: "Add your technical skills and connect GitHub / LeetCode profiles.",
    };
  }, [completion, profile, leetcode, github, solvedPracticeCount]);

  // --- Real-Time Today's Focus Tasks ---
  const [manualOverrides, setManualOverrides] = useState<Record<string, "completed" | "in_progress" | "upcoming">>(() => {
    try {
      const saved = localStorage.getItem("skillverse_manual_task_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const liveTasks = useMemo(() => {
    // 1. DSA Task (Real Tracking: check if user solved >= 2 problems)
    const isDsaDone = solvedPracticeCount >= 2 || totalDsaSolved >= 2;
    const dsaStatus = manualOverrides["dsa_prob"] || (isDsaDone ? "completed" : solvedPracticeCount > 0 ? "in_progress" : "upcoming");
    const dsaBadge = isDsaDone
      ? `✓ Completed (${solvedPracticeCount} solved)`
      : solvedPracticeCount > 0
      ? `${solvedPracticeCount} / 2 done · ○ In progress`
      : "0 / 2 done · ○ Upcoming";

    // 2. Profile Skills & Projects Task (Real Tracking: check completion and projects)
    const isProfileDone = completion >= 80 && (profile?.skills?.length || 0) > 0 && (profile?.projects?.length || 0) > 0;
    const profileStatus = manualOverrides["profile_update"] || (isProfileDone ? "completed" : completion >= 40 ? "in_progress" : "upcoming");
    const profileBadge = isProfileDone
      ? `✓ Completed (${completion}% ready)`
      : `${completion}% complete · ○ In progress`;

    // 3. Speed Aptitude Drill Task (Real Tracking: check completed attempts)
    const aptitudeStatus = manualOverrides["aptitude_drill"] || (hasCompletedAptitude ? "completed" : "upcoming");
    const aptitudeBadge = hasCompletedAptitude ? "✓ Completed (Drill passed)" : "○ Upcoming";

    // 4. Mock Interview Task
    const interviewStatus = manualOverrides["mock_interview"] || "upcoming";
    const interviewBadge = interviewStatus === "completed" ? "✓ Completed" : "○ Upcoming";

    return [
      {
        id: "dsa_prob",
        title: "Complete 2 curated DSA problems",
        category: "Practice",
        status: dsaStatus,
        badgeText: dsaBadge,
        link: "/practice",
        actionText: "Practice",
      },
      {
        id: "profile_update",
        title: "Update profile projects & skills",
        category: "Profile",
        status: profileStatus,
        badgeText: profileBadge,
        link: "/profile",
        actionText: "Update",
      },
      {
        id: "aptitude_drill",
        title: "Practice 10 quantitative speed questions",
        category: "Aptitude",
        status: aptitudeStatus,
        badgeText: aptitudeBadge,
        link: "/practice",
        actionText: "Start",
      },
      {
        id: "mock_interview",
        title: "Run AI technical mock interview round",
        category: "Interview",
        status: interviewStatus,
        badgeText: interviewBadge,
        link: "/interview",
        actionText: "Start",
      },
    ];
  }, [solvedPracticeCount, totalDsaSolved, completion, profile, hasCompletedAptitude, manualOverrides]);

  const toggleTaskStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = liveTasks.find((t) => t.id === id);
    if (!task) return;

    const currentStatus = manualOverrides[id] || (task.status === "completed" ? "completed" : "upcoming");
    const nextStatus = currentStatus === "completed" ? "in_progress" : "completed";
    const isNowCompleted = nextStatus === "completed";

    setManualOverrides((prev) => {
      const next = { ...prev, [id]: nextStatus };
      try {
        localStorage.setItem("skillverse_manual_task_overrides", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (isNowCompleted) {
      const completedCount = liveTasks.filter((t) => (t.id === id ? true : t.status === "completed")).length;
      const isAllDone = completedCount >= liveTasks.length;

      if (isAllDone) {
        // Grand celebration for 100% daily goals completed
        import("canvas-confetti").then((mod) => {
          const confetti = mod.default || mod;
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#6366f1", "#a855f7", "#ec4899", "#22c55e", "#eab308"],
          });
        }).catch(() => {});

        playCelebrationSound(true);

        toast.success("🎉 All Today's Goals Completed!", {
          description: "Incredible dedication! You've crushed 100% of your daily career focus goals.",
          duration: 5000,
        });

        sendBrowserNotification(
          "SkillVerse: All Goals Crushed! 🏆",
          "You've completed all 4 daily career focus goals today!"
        );
      } else {
        // Individual goal celebration
        import("canvas-confetti").then((mod) => {
          const confetti = mod.default || mod;
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ["#6366f1", "#22c55e", "#38bdf8"],
          });
        }).catch(() => {});

        playCelebrationSound(false);

        toast.success(`🎯 Goal Completed: ${task.title}`, {
          description: `${completedCount} of ${liveTasks.length} daily goals completed. Keep up the momentum!`,
          duration: 4000,
        });

        sendBrowserNotification(
          "Goal Completed! 🎯",
          `Finished: ${task.title} (${completedCount}/${liveTasks.length} complete)`
        );
      }
    } else {
      toast.info(`Task marked as In Progress`, {
        description: `"${task.title}" is now active.`,
      });
    }
  };

  // Missing fields for Resume Readiness — reliably mapped to string labels
  const missingLabels = useMemo(() => {
    if (missing && missing.length > 0) {
      return missing.map((m) => (typeof m === "object" && m !== null ? m.label : String(m)));
    }
    const items: string[] = [];
    if (!profile?.skills || profile.skills.length === 0) items.push("Skills");
    if (!profile?.projects || profile.projects.length === 0) items.push("Projects");
    if (!profile?.experience || profile.experience.length === 0) items.push("Experience details");
    if (!profile?.education || profile.education.length === 0) items.push("Education");
    return items;
  }, [missing, profile]);

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        
        {/* 1. HERO SECTION: CAREER COMMAND CENTER */}
        <section className="relative overflow-hidden bg-hero border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-20 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
          </div>
          
          <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
              
              {/* Left Column */}
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                  </span>
                  CAREER COMMAND CENTER
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  Good to see you, <span className="text-gradient">{first}</span>.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Your career progress, coding activity, and next steps — all in one place.
                </p>
              </div>

              {/* Right CTA */}
              <Link
                to="/profile"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-foreground shadow-2xs transition-all hover:bg-secondary hover:border-brand/40 shrink-0"
              >
                <span>View Profile</span>
                <ArrowRight className="h-4 w-4 text-brand" />
              </Link>

            </div>
          </div>
        </section>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="max-w-6xl mx-auto px-6 pt-8 space-y-10">

          {/* 2. CAREER OVERVIEW (EXACTLY 3 SUMMARY CARDS) — PLACED ABOVE TODAY'S FOCUS */}
          <section className="space-y-3 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* CARD 1: CAREER SCORE */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5 text-brand" />
                      <span>CAREER SCORE</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" /> Live
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-gradient tabular-nums">
                      {realCareerScore}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">/ 100</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${realCareerScore}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    Based on your profile, skills, projects, resume, and developer activity.
                  </p>
                </div>

                <div className="-mx-2 pt-1">
                  <StatSpark
                    values={[
                      Math.max(30, realCareerScore - 12),
                      Math.max(35, realCareerScore - 9),
                      Math.max(40, realCareerScore - 6),
                      Math.max(45, realCareerScore - 4),
                      Math.max(50, realCareerScore - 2),
                      realCareerScore,
                    ]}
                  />
                </div>
              </Card>

              {/* CARD 2: CODING STREAK */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-brand" />
                      <span>CODING STREAK</span>
                    </div>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                      {realStreakDays > 0 ? "Active" : "Ready"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-foreground tabular-nums">
                      {realStreakDays}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">days</span>
                  </div>

                  {/* 28-day Activity Grid */}
                  <div
                    className="mt-3 grid gap-1 pt-1"
                    style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
                  >
                    {Array.from({ length: 28 }).map((_, i) => {
                      const isRecent = i >= 28 - Math.max(1, realStreakDays);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "h-3.5 rounded-[3px] transition-transform hover:scale-125",
                            isRecent ? "bg-brand" : "bg-secondary"
                          )}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                    <span>4 weeks ago</span>
                    <span>Today</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Consistent daily problem solving ({solvedPracticeCount} practice problems solved).
                </p>
              </Card>

              {/* CARD 3: RESUME READINESS */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-brand" />
                      <span>RESUME READINESS</span>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                      ATS Optimized
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-foreground tabular-nums">
                      {completion}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    {completion === 100
                      ? "Your profile is 100% complete and ready for instant ATS export."
                      : "Complete your profile details to strengthen your ATS score."}
                  </p>
                </div>

                <Link
                  to="/resume"
                  className="w-full h-8 rounded-xl bg-secondary hover:bg-brand hover:text-brand-foreground text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Build Resume</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>

            </div>
          </section>

          {/* 3. TODAY'S FOCUS — LIVE REAL-TIME TRACKING */}
          <section className="space-y-3 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                  TODAY'S FOCUS
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Small consistent steps lead to bigger career progress.
                </p>
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                {liveTasks.filter((t) => t.status === "completed").length} of {liveTasks.length} completed
              </span>
            </div>

            {/* Task Card */}
            <Card className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs divide-y divide-border/40 space-y-2">
              {liveTasks.every((t) => t.status === "completed") && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-500 animate-pulse" />
                    <span>All today's goals completed! Excellent daily career consistency.</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20">
                    100% Done
                  </span>
                </div>
              )}
              {liveTasks.map((task) => {
                const isDone = task.status === "completed";
                const isCurrent = task.status === "in_progress";

                return (
                  <div
                    key={task.id}
                    onClick={() => navigate({ to: task.link as any })}
                    className={cn(
                      "py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4 transition-colors hover:bg-secondary/30 rounded-xl px-2.5 cursor-pointer group",
                      isDone && "opacity-85"
                    )}
                  >
                    {/* Checkbox + Task Name */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      
                      <button
                        type="button"
                        onClick={(e) => toggleTaskStatus(task.id, e)}
                        className={cn(
                          "h-5 w-5 rounded-full border grid place-items-center shrink-0 transition-all cursor-pointer",
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isCurrent
                            ? "border-brand ring-2 ring-brand/20 bg-brand/5 text-transparent hover:text-brand"
                            : "border-border hover:border-brand text-transparent"
                        )}
                        title={isDone ? "Mark as in progress" : "Mark as completed"}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </button>

                      <div className="min-w-0">
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-semibold transition-colors group-hover:text-brand",
                            isDone ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge + Action Link */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md",
                          isDone
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isCurrent
                            ? "bg-brand/10 text-brand"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {task.badgeText}
                      </span>

                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-brand flex items-center gap-1 transition-colors">
                        {task.actionText} →
                      </span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>

          {/* 4. DEVELOPER ACTIVITY */}
          <section className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                DEVELOPER ACTIVITY
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Your recent coding and open-source activity.
              </p>
            </div>

            <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs">
              {github?.connected && githubData ? (
                <div className="space-y-5">
                  {/* Top 4 Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Repositories
                      </span>
                      <span className="text-xl font-extrabold text-foreground tabular-nums">
                        {Array.isArray(githubData.repositories) ? githubData.repositories.length : 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Total Stars
                      </span>
                      <span className="text-xl font-extrabold text-foreground tabular-nums">
                        {Array.isArray(githubData.repositories)
                          ? githubData.repositories.reduce((acc, r) => acc + (r.stars || 0), 0)
                          : 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Followers
                      </span>
                      <span className="text-xl font-extrabold text-foreground tabular-nums">
                        {githubData.profile?.followers || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Languages
                      </span>
                      <span className="text-xl font-extrabold text-brand tabular-nums">
                        {githubData.languages && typeof githubData.languages === "object"
                          ? Object.keys(githubData.languages).length
                          : 0}
                      </span>
                    </div>
                  </div>

                  {/* Languages Distribution Bar */}
                  {githubData.languages && Object.keys(githubData.languages).length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Language Distribution
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(githubData.languages).slice(0, 5).map(([lang]) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary px-2.5 py-1 rounded-xl text-foreground"
                          >
                            <span className="h-2 w-2 rounded-full bg-brand" />
                            <span>{lang}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer link to deep analytics */}
                  <div className="flex justify-end pt-2">
                    <Link
                      to="/analytics/github"
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      <span>View Full GitHub Analytics</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-8 px-4 text-center space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-secondary text-muted-foreground grid place-items-center mx-auto">
                    <FaGithub className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">GitHub activity unavailable</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Connect your GitHub profile to start tracking your repositories, commits, and open-source contributions.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/connections" })}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-8 px-4 rounded-xl shadow-2xs"
                  >
                    Connect GitHub →
                  </Button>
                </div>
              )}
            </Card>
          </section>

          {/* 5. YOUR DEVELOPER PROFILES (EXACTLY 3 EQUAL-WIDTH BOXES) */}
          <section className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                YOUR DEVELOPER PROFILES
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Your coding and open-source profiles in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* BOX 1 — GITHUB */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-5 hover:border-brand/40 hover:-translate-y-0.5 transition-all">
                <div className="space-y-4">
                  
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-foreground text-background grid place-items-center shrink-0">
                      <FaGithub className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">GitHub</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {github?.connected ? `@${github.username}` : "Not Connected"}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Metrics */}
                  {github?.connected && githubData ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {Array.isArray(githubData.repositories) ? githubData.repositories.length : 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Repositories</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {Array.isArray(githubData.repositories)
                            ? githubData.repositories.reduce((acc, r) => acc + (r.stars || 0), 0)
                            : 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Stars</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {githubData.profile?.followers || 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Followers</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 leading-relaxed">
                      Connect your GitHub profile to sync your repositories and open-source contributions.
                    </p>
                  )}

                  <div className="h-px bg-border/50" />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        github?.connected ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className={github?.connected ? "text-foreground" : "text-muted-foreground"}>
                      {github?.connected ? "Connected" : "Not Connected"}
                    </span>
                  </span>

                  {github?.connected ? (
                    <Link
                      to="/analytics/github"
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      View Analytics →
                    </Link>
                  ) : (
                    <Link
                      to="/connections"
                      className="text-xs font-bold text-foreground hover:text-brand flex items-center gap-1"
                    >
                      Connect →
                    </Link>
                  )}
                </div>
              </Card>

              {/* BOX 2 — LEETCODE */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-5 hover:border-brand/40 hover:-translate-y-0.5 transition-all">
                <div className="space-y-4">
                  
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#FFA116]/10 text-[#FFA116] grid place-items-center shrink-0 border border-[#FFA116]/20">
                      <SiLeetcode className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">LeetCode</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {leetcode?.connected ? `@${leetcode.username}` : "Not Connected"}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Metrics */}
                  {leetcode?.connected ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {leetcodeData?.totalSolved ?? leetcodeData?.stats?.All ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Solved</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {leetcodeData?.ranking ? (leetcodeData.ranking > 1000 ? `#${Math.round(leetcodeData.ranking / 1000)}k` : `#${leetcodeData.ranking}`) : "Active"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Global Rank</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {leetcodeData?.contest?.rating ? Math.round(leetcodeData.contest.rating) : (leetcodeData?.profile?.reputation ? `#${leetcodeData.profile.reputation}` : "Synced")}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Rating</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 leading-relaxed">
                      Connect your LeetCode profile to sync your solved DSA problems and contest ratings.
                    </p>
                  )}

                  <div className="h-px bg-border/50" />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        leetcode?.connected ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className={leetcode?.connected ? "text-foreground" : "text-muted-foreground"}>
                      {leetcode?.connected ? "Connected" : "Not Connected"}
                    </span>
                  </span>

                  {leetcode?.connected ? (
                    <Link
                      to="/analytics/leetcode"
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      View Analytics →
                    </Link>
                  ) : (
                    <Link
                      to="/connections"
                      className="text-xs font-bold text-foreground hover:text-brand flex items-center gap-1"
                    >
                      Connect →
                    </Link>
                  )}
                </div>
              </Card>

              {/* BOX 3 — GEEKSFORGEEKS */}
              <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-5 hover:border-brand/40 hover:-translate-y-0.5 transition-all">
                <div className="space-y-4">
                  
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#2F8D46]/10 text-[#2F8D46] grid place-items-center shrink-0 border border-[#2F8D46]/20">
                      <FaCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">GeeksforGeeks</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {gfg?.connected ? `@${gfg.username}` : "Not Connected"}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Metrics */}
                  {gfg?.connected ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {gfgData?.problems?.total ?? gfgData?.profile?.problemsSolved ?? gfgData?.potd?.totalSolved ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Solved</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {gfgData?.profile?.codingScore ?? gfgData?.profile?.score ?? 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Score</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-foreground block tabular-nums">
                          {gfgData?.potd?.currentStreak ?? 0}d
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">Streak</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 leading-relaxed">
                      Connect your GeeksforGeeks profile to sync POTD streaks and problem count.
                    </p>
                  )}

                  <div className="h-px bg-border/50" />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        gfg?.connected ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className={gfg?.connected ? "text-foreground" : "text-muted-foreground"}>
                      {gfg?.connected ? "Connected" : "Not Connected"}
                    </span>
                  </span>

                  {gfg?.connected ? (
                    <Link
                      to="/analytics/gfg"
                      className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                    >
                      View Analytics →
                    </Link>
                  ) : (
                    <Link
                      to="/connections"
                      className="text-xs font-bold text-foreground hover:text-brand flex items-center gap-1"
                    >
                      Connect →
                    </Link>
                  )}
                </div>
              </Card>

            </div>
          </section>

          {/* 6. MY CAREER ROADMAP */}
          <section className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                MY CAREER ROADMAP
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                See where you are and what comes next.
              </p>
            </div>

            <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs space-y-6">
              
              {/* Horizontal Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                {[
                  { name: "FOUNDATION", desc: "Core CS & DSA" },
                  { name: "SKILLS", desc: "Tech Stacks" },
                  { name: "PROJECTS", desc: "Portfolio & GitHub" },
                  { name: "INTERNSHIP", desc: "ATS Resume & Mock" },
                  { name: "PLACEMENT", desc: "Job Offers" },
                ].map((step, idx) => {
                  const isCurrent = idx === roadmapInfo.stageIndex;
                  const isPassed = idx < roadmapInfo.stageIndex;

                  return (
                    <div
                      key={step.name}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all space-y-1",
                        isCurrent
                          ? "bg-brand/10 border-brand text-brand ring-1 ring-brand/30 shadow-2xs"
                          : isPassed
                          ? "bg-secondary/60 border-border text-foreground"
                          : "bg-background border-border/60 text-muted-foreground opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Stage {idx + 1}
                        </span>
                        {isPassed && <Check className="h-3 w-3 text-emerald-500" />}
                        {isCurrent && <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />}
                      </div>
                      <h4 className="text-xs font-extrabold">{step.name}</h4>
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Progress & Next Milestone */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Current Stage: </span>
                    <strong className="text-foreground font-extrabold">{roadmapInfo.stageName}</strong>
                  </div>
                  <span className="font-extrabold text-brand tabular-nums">
                    {roadmapInfo.progress}% Completed
                  </span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${roadmapInfo.progress}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground font-bold">Next milestone: </strong>
                    {roadmapInfo.nextMilestone}
                  </p>

                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/practice" })}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-8 px-4 rounded-xl shadow-2xs shrink-0 cursor-pointer"
                  >
                    View Practice Hub →
                  </Button>
                </div>
              </div>

            </Card>
          </section>

          {/* 7. RECOMMENDED FOR YOU (3 COMPACT CARDS) */}
          <section className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                RECOMMENDED FOR YOU
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Suggestions based on your current career progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Rec 1: DSA Practice */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      PROBLEM SOLVING
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      30 min
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    High-Frequency DSA Sprint
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Practice top-tested Two Pointers, Dynamic Programming, and Tree algorithms.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: "/practice" })}
                  className="w-full text-xs font-bold h-8 rounded-xl border-border hover:bg-secondary text-foreground"
                >
                  Practice DSA →
                </Button>
              </Card>

              {/* Rec 2: Full-Stack Project */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      PORTFOLIO
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Recommended
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Build a Full-Stack Project
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Publish verified production repositories to elevate your resume ATS readiness.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: "/profile" })}
                  className="w-full text-xs font-bold h-8 rounded-xl border-border hover:bg-secondary text-foreground"
                >
                  Update Projects →
                </Button>
              </Card>

              {/* Rec 3: Speed Aptitude & Interview */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      ASSESSMENT
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      15 min
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Speed Aptitude Drill
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Test quantitative & logical reasoning with placement scoring and timer.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: "/practice" })}
                  className="w-full text-xs font-bold h-8 rounded-xl border-border hover:bg-secondary text-foreground"
                >
                  Start Drill →
                </Button>
              </Card>

            </div>
          </section>

          {/* 8. RESUME READINESS (FINAL COMPACT SECTION) */}
          <section className="space-y-3 animate-fade-up">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                RESUME READINESS
              </h2>
            </div>

            <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-foreground tabular-nums">
                    {completion}%
                  </span>
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">
                    {completion === 100 ? "Ready For Applications" : "In Progress"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {completion === 100
                    ? "Your profile is 100% complete and fully optimized for tech job applications."
                    : "Your profile is almost ready for job applications. Complete missing items to maximize ATS ranking."}
                </p>

                {completion < 100 && missingLabels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-muted-foreground">Missing:</span>
                    {missingLabels.map((label, idx) => (
                      <span
                        key={`${label}-${idx}`}
                        className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded-md text-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={() => navigate({ to: completion === 100 ? "/resume" : "/profile" })}
                  className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-9 px-5 rounded-xl shadow-2xs cursor-pointer"
                >
                  {completion === 100 ? "Generate Resume →" : "Complete Profile →"}
                </Button>
              </div>

            </Card>
          </section>

        </main>
      </div>
    </PageShell>
  );
}
