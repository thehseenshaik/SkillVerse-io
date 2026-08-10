import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Activity,
  RefreshCw,
  Search,
  Clock,
  Filter,
  ExternalLink,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useActivityStore, type ActivityItem } from "@/lib/activity-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity History — SkillVerse" },
      {
        name: "description",
        content: "View all your coding activity across your connected platforms in one place.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ActivityHistoryPage />
    </AuthGate>
  ),
});

const PLATFORM_TABS = [
  { id: "all", label: "All Platforms" },
  { id: "github", label: "GitHub" },
  { id: "leetcode", label: "LeetCode" },
  { id: "gfg", label: "GeeksforGeeks" },
  { id: "codeforces", label: "Codeforces" },
  { id: "codechef", label: "CodeChef" },
  { id: "hackerrank", label: "HackerRank" },
];

const TYPE_TABS = [
  { id: "all", label: "All Types" },
  { id: "problem_solved", label: "Problems Solved" },
  { id: "push", label: "Commits & Repos" },
  { id: "contest", label: "Contests & Ratings" },
  { id: "streak_milestone", label: "Streak Milestones" },
];

function ActivityHistoryPage() {
  const { user } = useAuth();
  const {
    isSyncing: storeIsSyncing,
    github,
    githubData,
    leetcode,
    leetcodeData,
    gfg,
    gfgData,
  } = usePlatformStore();
  const {
    activities,
    summary,
    connectedPlatformsCount,
    isLoading,
    activePlatformFilter,
    activeTypeFilter,
    fetchActivities,
    setPlatformFilter,
    setTypeFilter,
  } = useActivityStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(25);

  useEffect(() => {
    if (user?.id) {
      void fetchActivities(user.id, 50);
    }
  }, [user?.id, fetchActivities]);

  const handleSyncAll = async () => {
    if (!user?.id) return;
    try {
      toast.info("Syncing platform data...");
      await usePlatformStore.getState().fetchDashboardData(user.id);
      await fetchActivities(user.id, 50, true);
      toast.success("Activity history updated!");
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  // Synthesize client-side activity fallback from usePlatformStore & localStorage
  const localActivities = useMemo<ActivityItem[]>(() => {
    const list: ActivityItem[] = [];

    // 1. GitHub Activity / Repositories
    try {
      if (github?.connected) {
        if (Array.isArray(githubData?.recentActivity) && githubData.recentActivity.length > 0) {
          githubData.recentActivity.forEach((act: any, idx: number) => {
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
          githubData.repositories.forEach((repo: any, idx: number) => {
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

    // 2. LeetCode Submissions
    try {
      if (leetcode?.connected && Array.isArray(leetcodeData?.recentSubmissions)) {
        leetcodeData.recentSubmissions.forEach((sub: any, idx: number) => {
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
            description: `LeetCode Submission (${sub.language || "DSA"}) • Status: ${sub.status || "Completed"}`,
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
            description: `${solvedCount} problems solved • Coding Score: ${gfgData.profile?.codingScore || (gfgData.profile as any)?.score || 0}`,
            url: `https://www.geeksforgeeks.org/user/${gfg.username}/`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch {
      // ignore
    }

    // 4. Local DSA Practice
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

    // Sort descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [user?.id, github, githubData, leetcode, leetcodeData, gfg, gfgData]);

  const sourceActivities = activities.length > 0 ? activities : localActivities;

  // Filter activities locally by platform, type, and search query
  const filteredActivities = useMemo(() => {
    return sourceActivities.filter((act) => {
      // Platform filter
      if (
        activePlatformFilter !== "all" &&
        act.platform.toLowerCase() !== activePlatformFilter.toLowerCase()
      ) {
        return false;
      }

      // Type filter
      if (activeTypeFilter !== "all") {
        if (activeTypeFilter === "push" && !["push", "repo_create", "commit", "pull_request", "issue"].includes(act.activityType)) {
          return false;
        }
        if (activeTypeFilter === "contest" && !["contest", "rating_change"].includes(act.activityType)) {
          return false;
        }
        if (activeTypeFilter === "problem_solved" && !["problem_solved", "submission"].includes(act.activityType)) {
          return false;
        }
        if (activeTypeFilter === "streak_milestone" && !["streak_milestone", "badge_earned"].includes(act.activityType)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchDesc = act.description ? act.description.toLowerCase().includes(q) : false;
        const matchPlatform = act.platform.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchPlatform;
      }

      return true;
    });
  }, [sourceActivities, activePlatformFilter, activeTypeFilter, searchQuery]);

  const formatFullDate = (timestampString: string) => {
    if (!timestampString) return "";
    const date = new Date(timestampString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        
        {/* Header Section */}
        <section className="relative border-b border-border/60 bg-hero/50 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
              <div className="space-y-1.5">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors mb-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                    <Activity className="h-3.5 w-3.5" />
                    ACTIVITY HISTORY
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">• Real-time Feed</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Unified <span className="text-gradient">Activity Feed</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  All your coding contributions, problem-solving progress, and contest achievements aggregated across your connected platform accounts.
                </p>
              </div>

              {/* Header Action CTAs */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleSyncAll}
                  disabled={storeIsSyncing}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 h-9 border-border hover:bg-secondary text-foreground"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 text-brand", storeIsSyncing && "animate-spin")} />
                  {storeIsSyncing ? "Syncing..." : "Sync All Platforms"}
                </Button>

                <Link to="/connections">
                  <Button
                    size="sm"
                    className="bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs h-9 rounded-xl shadow-2xs"
                  >
                    Connect Platforms →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Feed Workspace */}
        <main className="max-w-6xl mx-auto px-6 pt-8 space-y-6">

          {/* Controls Bar: Platform Tabs, Type Filter, Search */}
          <Card className="p-4 rounded-3xl border border-border/60 bg-card/60 shadow-xs space-y-4">
            {/* Search and Quick Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search activities, repositories, or problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl border-border/70 bg-background"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border/50 font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  {filteredActivities.length} item{filteredActivities.length === 1 ? "" : "s"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {summary.todayCount} today
                </span>
              </div>
            </div>

            {/* Platform Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Platforms:
              </span>
              {PLATFORM_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPlatformFilter(tab.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    activePlatformFilter === tab.id
                      ? "bg-brand text-brand-foreground shadow-2xs scale-[1.02]"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Activity Type Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Activity Types:
              </span>
              {TYPE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer",
                    activeTypeFilter === tab.id
                      ? "bg-foreground text-background shadow-2xs font-bold"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border/40"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Activity List Timeline */}
          <div className="space-y-3">
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-4 rounded-2xl border border-border/40 bg-card/40 animate-pulse flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-secondary rounded" />
                      <div className="h-3 w-1/2 bg-secondary/60 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredActivities.length === 0 && (
              <Card className="p-12 text-center rounded-3xl border border-dashed border-border/70 bg-card/40 space-y-3">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">No matching activity items found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || activePlatformFilter !== "all" || activeTypeFilter !== "all"
                    ? "Try adjusting your search queries or category filters."
                    : "Connect platform accounts or click sync to populate your activity timeline."}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Button
                    onClick={handleSyncAll}
                    disabled={storeIsSyncing}
                    size="sm"
                    className="bg-brand text-brand-foreground font-semibold text-xs rounded-xl"
                  >
                    Sync Accounts
                  </Button>
                </div>
              </Card>
            )}

            {!isLoading && filteredActivities.length > 0 && (
              <div className="space-y-2.5">
                {filteredActivities.slice(0, displayLimit).map((act) => (
                  <Card
                    key={act.id}
                    className="group p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-brand/40 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-background shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                        {getPlatformIcon(act.platform)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-border bg-secondary/50 text-foreground shrink-0">
                            {act.platform}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-brand transition-colors">
                            {act.title}
                          </h3>
                        </div>

                        {act.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        {formatFullDate(act.timestamp)}
                      </span>

                      {act.url && (
                        <a
                          href={act.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline p-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}

                {filteredActivities.length > displayLimit && (
                  <div className="pt-4 text-center">
                    <Button
                      onClick={() => setDisplayLimit((prev) => prev + 25)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold border-border hover:bg-secondary"
                    >
                      Load More Activities ({filteredActivities.length - displayLimit} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

        </main>
      </div>
    </PageShell>
  );
}
