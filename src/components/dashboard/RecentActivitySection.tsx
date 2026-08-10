import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  RefreshCw,
  Clock,
  Activity,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useActivityStore, type ActivityItem } from "@/lib/activity-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RecentActivitySection() {
  const { user } = useAuth();
  const {
    isSyncing: storeIsSyncing,
    isAnySyncing,
    github,
    githubData,
    leetcode,
    leetcodeData,
    gfg,
    gfgData,
    codeforces,
    codechef,
    hackerrank,
  } = usePlatformStore();

  const {
    activities,
    summary,
    connectedPlatformsCount,
    isLoading,
    error,
    fetchActivities,
  } = useActivityStore();

  useEffect(() => {
    if (user?.id) {
      void fetchActivities(user.id, 6);
    }
  }, [user?.id, fetchActivities]);

  // Re-fetch activities when any platform sync completes
  useEffect(() => {
    if (!storeIsSyncing && user?.id) {
      void fetchActivities(user.id, 6, true);
    }
  }, [storeIsSyncing, user?.id, fetchActivities]);

  // Synthesize client-side activity fallback from usePlatformStore & localStorage
  const localActivities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    // 1. GitHub Activity / Repositories
    try {
      if (github?.connected) {
        if (Array.isArray(githubData?.recentActivity) && githubData.recentActivity.length > 0) {
          githubData.recentActivity.slice(0, 5).forEach((act: any, idx: number) => {
            const rawRepo = typeof act.repo === "string" ? act.repo : act.repo?.name || "repository";
            const repoName = rawRepo.replace(/^.*\//, "");
            const date = act.createdAt ? new Date(act.createdAt).toISOString() : new Date().toISOString();
            list.push({
              id: `local-gh-${idx}-${rawRepo}`,
              userId: user?.id || "local",
              platform: "github",
              activityType: "push",
              title: `Pushed commits to ${repoName}`,
              description: `GitHub Code Contribution on ${rawRepo}`,
              url: `https://github.com/${rawRepo}`,
              timestamp: date,
            });
          });
        } else if (Array.isArray(githubData?.repositories) && githubData.repositories.length > 0) {
          githubData.repositories.slice(0, 5).forEach((repo: any, idx: number) => {
            list.push({
              id: `local-gh-repo-${idx}-${repo.name}`,
              userId: user?.id || "local",
              platform: "github",
              activityType: "repo_create",
              title: `Repository: ${repo.name}`,
              description: repo.description || `${repo.language || "Code"} repo • ${repo.stars || 0} stars`,
              url: repo.url || `https://github.com/${github.username}/${repo.name}`,
              timestamp: repo.updatedAt || repo.createdAt || new Date().toISOString(),
            });
          });
        }
      }
    } catch {
      // ignore
    }

    // 2. LeetCode Recent Submissions
    try {
      if (leetcode?.connected && Array.isArray(leetcodeData?.recentSubmissions)) {
        leetcodeData.recentSubmissions.slice(0, 5).forEach((sub: any, idx: number) => {
          if (!sub) return;
          const isAccepted = sub.status === "Accepted" || sub.status === "A";
          const ts = typeof sub.timestamp === "number"
            ? (sub.timestamp < 1e12 ? sub.timestamp * 1000 : sub.timestamp)
            : Date.now();
          list.push({
            id: `local-lc-${idx}-${sub.titleSlug || sub.title || idx}`,
            userId: user?.id || "local",
            platform: "leetcode",
            activityType: "submission",
            title: isAccepted ? `Solved "${sub.title || "DSA Problem"}"` : `Attempted "${sub.title || "DSA Problem"}"`,
            description: `LeetCode Submission (${sub.language || "DSA"}) • ${sub.status || "Completed"}`,
            url: sub.titleSlug ? `https://leetcode.com/problems/${sub.titleSlug}/` : `https://leetcode.com/${leetcode.username}/`,
            timestamp: new Date(ts).toISOString(),
          });
        });
      }
    } catch {
      // ignore
    }

    // 3. GeeksforGeeks Activity
    try {
      if (gfg?.connected && gfgData) {
        const solvedCount = gfgData.problems?.total ?? gfgData.profile?.problemsSolved ?? gfgData.potd?.totalSolved ?? 0;
        if (solvedCount > 0) {
          list.push({
            id: `local-gfg-summary`,
            userId: user?.id || "local",
            platform: "gfg",
            activityType: "problem_solved",
            title: `GeeksforGeeks Problem Solver`,
            description: `${solvedCount} problems solved • Coding Score: ${gfgData.profile?.codingScore || gfgData.profile?.score || 0}`,
            url: `https://www.geeksforgeeks.org/user/${gfg.username}/`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // ignore
    }

    // 4. Local DSA Practice Problems
    try {
      const savedPractice = localStorage.getItem("skillverse_solved_practice_problems");
      if (savedPractice) {
        const ids = JSON.parse(savedPractice);
        if (Array.isArray(ids) && ids.length > 0) {
          list.push({
            id: `local-skillverse-dsa`,
            userId: user?.id || "local",
            platform: "leetcode",
            activityType: "problem_solved",
            title: `Completed ${ids.length} SkillVerse Practice Problem${ids.length > 1 ? "s" : ""}`,
            description: "Solved in SkillVerse DSA Arena",
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // ignore
    }

    // 5. Resume Builder Activity
    try {
      const savedResumes = localStorage.getItem("skillverse_resumes");
      if (savedResumes) {
        const parsed = JSON.parse(savedResumes);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          const latest = parsed[0];
          list.push({
            id: `local-resume-${latest.id || "1"}`,
            userId: user?.id || "local",
            platform: "github",
            activityType: "streak_milestone",
            title: `ATS Resume: ${latest.name || "Software Engineer Resume"}`,
            description: "Saved in SkillVerse ATS Resume Builder",
            timestamp: new Date(latest.updatedAt || Date.now()).toISOString(),
          });
        }
      }
    } catch {
      // ignore
    }

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [user?.id, github, githubData, leetcode, leetcodeData, gfg, gfgData]);

  const displayActivities = activities.length > 0 ? activities : localActivities;

  const connectedCountInStore = (github?.connected ? 1 : 0) +
    (leetcode?.connected ? 1 : 0) +
    (gfg?.connected ? 1 : 0) +
    (codeforces?.connected ? 1 : 0) +
    (codechef?.connected ? 1 : 0) +
    (hackerrank?.connected ? 1 : 0);

  const displayConnectedCount = Math.max(connectedPlatformsCount, connectedCountInStore);

  const handleSyncAllNow = async () => {
    if (!user?.id) return;
    try {
      toast.info("Syncing connected platform activities...");
      await usePlatformStore.getState().fetchDashboardData(user.id);
      await fetchActivities(user.id, 6, true);
      toast.success("Activity feed refreshed!");
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  const formatRelativeTime = (timestampString: string) => {
    if (!timestampString) return "Recently";
    const date = new Date(timestampString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <FaGithub className="h-4 w-4 text-foreground" />;
      case "leetcode":
        return <SiLeetcode className="h-4 w-4 text-amber-500" />;
      case "gfg":
        return <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">GFG</span>;
      case "codeforces":
        return <span className="font-bold text-xs text-blue-500">CF</span>;
      case "codechef":
        return <span className="font-bold text-xs text-amber-700 dark:text-amber-500">CC</span>;
      case "hackerrank":
        return <span className="font-bold text-xs text-emerald-500">HR</span>;
      default:
        return <Activity className="h-4 w-4 text-brand" />;
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border-neutral-500/20";
      case "leetcode":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "gfg":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "codeforces":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "codechef":
        return "bg-amber-700/10 text-amber-700 dark:text-amber-500 border-amber-700/20";
      case "hackerrank":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-brand/10 text-brand border-brand/20";
    }
  };

  const isSyncing = storeIsSyncing || isAnySyncing;

  return (
    <Card className="glass relative overflow-hidden rounded-3xl border border-border/60 p-6 shadow-elegant transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Recent Activity
            </h2>
            {isSyncing && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> Syncing...
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your latest progress across connected platforms
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary.lastSyncedAt && (
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground/70" />
              Synced {formatRelativeTime(summary.lastSyncedAt)}
            </span>
          )}

          <Link to="/activity">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-brand hover:text-brand/80 gap-1 h-8 rounded-xl"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Bar (Displayed if platforms connected and activities exist) */}
      {!isLoading && displayConnectedCount > 0 && displayActivities.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs border-b border-border/40 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 border border-border/50 text-foreground font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>{Math.max(summary.totalCount, displayActivities.length)} total activities</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{summary.todayCount || displayActivities.length} active</span>
          </div>

          <span className="text-[11px] text-muted-foreground ml-auto">
            {displayConnectedCount} platform{displayConnectedCount > 1 ? "s" : ""} connected
          </span>
        </div>
      )}

      {/* Main Content Body */}
      <div className="mt-4 space-y-2.5">
        {/* Error Banner */}
        {error && displayActivities.length === 0 && (
          <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => user?.id && fetchActivities(user.id, 6, true)}
              className="h-7 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        )}

        {/* 1. Loading Skeletons */}
        {isLoading && displayActivities.length === 0 && (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-secondary/30 animate-pulse"
              >
                <div className="h-9 w-9 rounded-xl bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 bg-secondary rounded-md" />
                  <div className="h-2.5 w-2/3 bg-secondary/60 rounded-md" />
                </div>
                <div className="h-3 w-12 bg-secondary rounded-md shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* 2. Empty State: No connected platforms */}
        {!isLoading && displayConnectedCount === 0 && displayActivities.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 space-y-3 my-2">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Connect your coding platforms</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Link GitHub, LeetCode, GeeksforGeeks, and more to automatically aggregate your latest coding activity here.
              </p>
            </div>
            <Link to="/connections">
              <Button size="sm" className="bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs rounded-xl gap-1.5 shadow-sm mt-2">
                Connect platforms <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* 3. Empty State: Connected platforms exist, but no recent activity yet */}
        {!isLoading && displayConnectedCount > 0 && displayActivities.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 space-y-3 my-2">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">You're connected, but we don't have any recent activity yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Sync your accounts to fetch the latest commits, solved problems, and contest performance.
              </p>
            </div>
            <Button
              onClick={handleSyncAllNow}
              disabled={isSyncing}
              size="sm"
              className="bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs rounded-xl gap-1.5 shadow-sm mt-2"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync now"}
            </Button>
          </div>
        )}

        {/* 4. Real Data-Driven Activity Feed Timeline */}
        {displayActivities.length > 0 && (
          <div className="space-y-2">
            {displayActivities.map((act) => (
              <div
                key={act.id}
                className="group relative flex items-center gap-3.5 p-3 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-brand/40 transition-all shadow-2xs"
              >
                {/* Platform Icon Container */}
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-background shadow-2xs shrink-0">
                  {getPlatformIcon(act.platform)}
                </div>

                {/* Main Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border shrink-0",
                          getPlatformBadgeColor(act.platform)
                        )}
                      >
                        {act.platform}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand transition-colors">
                        {act.title}
                      </h4>
                    </div>

                    <span className="text-[10.5px] font-medium text-muted-foreground shrink-0 tabular-nums">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>

                  {act.description && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {act.description}
                    </p>
                  )}
                </div>

                {/* External Link if URL available */}
                {act.url && (
                  <a
                    href={act.url}
                    target="_blank"
                    rel="noreferrer"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-brand transition-opacity shrink-0 p-1"
                    title="View on platform"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
