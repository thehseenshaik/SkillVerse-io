import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { usePlatformDataService } from "@/lib/services/platform-data-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  ExternalLink, 
  Star, 
  GitFork, 
  Users, 
  BookMarked, 
  CheckCircle2, 
  ArrowLeft,
  Clock,
  Activity,
  Code,
  MapPin,
  Sparkles,
  Layers,
  Flame,
  Calendar,
  Check,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { langColor, LANG_COLOR } from "@/lib/github";

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "recently";
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
  } catch {
    return "recently";
  }
}

// Stack category classifier
function categorizeStack(languages: string[]) {
  const frontendSet = new Set(["TypeScript", "JavaScript", "HTML", "CSS", "SCSS", "Sass", "Vue", "Svelte"]);
  const backendSet = new Set(["Java", "Python", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart"]);
  const toolsSet = new Set(["Shell", "Dockerfile", "Makefile", "Jupyter", "SQL"]);

  const frontend: string[] = [];
  const backend: string[] = [];
  const tools: string[] = [];

  languages.forEach((lang) => {
    if (frontendSet.has(lang)) frontend.push(lang);
    else if (backendSet.has(lang)) backend.push(lang);
    else if (toolsSet.has(lang)) tools.push(lang);
    else backend.push(lang);
  });

  return { frontend, backend, tools };
}

export function GitHubAnalyticsPage() {
  const { user } = useAuth();
  const { 
    github, 
    githubData, 
    connectGitHub, 
    syncGitHub, 
    validateGitHubUsername, 
    fetchDashboardData 
  } = usePlatformStore();
  const { getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [data, setData] = useState<any>(githubData || null);

  useEffect(() => {
    if (githubData) {
      setData(githubData);
    } else if (user?.id) {
      loadData();
    }
  }, [user?.id, githubData]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await fetchDashboardData(user.id);
      const cached = await getCachedPlatformData("github");
      if (cached) {
        setData(cached);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setSyncSuccess(false);
    setError(null);
    try {
      await syncGitHub(user.id);
      await fetchDashboardData(user.id);
      setSyncSuccess(true);
      toast.success("GitHub activity synchronized!");
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sync GitHub data";
      setError(msg);
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUsername.trim() || !user?.id) return;
    setConnecting(true);
    setError(null);
    try {
      await validateGitHubUsername(connectUsername.trim());
      await connectGitHub(user.id, connectUsername.trim());
      await fetchDashboardData(user.id);
      setConnectUsername("");
      toast.success("GitHub profile connected successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect GitHub account";
      setError(msg);
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  // Safe data extraction
  const profile = data?.profile || githubData?.profile;
  const repos = Array.isArray(data?.repositories) ? data.repositories : (Array.isArray(githubData?.repositories) ? githubData.repositories : []);
  const rawLanguages = data?.languages || githubData?.languages || {};
  const recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : (Array.isArray(githubData?.recentActivity) ? githubData.recentActivity : []);

  // Language Breakdown
  const languageList = useMemo(() => {
    if (!rawLanguages || typeof rawLanguages !== "object") return [];
    const entries = Object.entries(rawLanguages).map(([name, bytes]) => ({
      name,
      bytes: Number(bytes),
    }));
    const total = entries.reduce((acc, l) => acc + l.bytes, 0);
    return entries
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 6)
      .map((l) => ({
        ...l,
        pct: total > 0 ? Math.round((l.bytes / total) * 100) : 0,
      }));
  }, [rawLanguages]);

  const totalBytes = useMemo(() => languageList.reduce((acc, l) => acc + l.bytes, 0), [languageList]);

  // Aggregate Metrics
  const totalStars = useMemo(() => repos.reduce((acc: number, r: any) => acc + (r.stars || 0), 0), [repos]);
  const totalForks = useMemo(() => repos.reduce((acc: number, r: any) => acc + (r.forks || 0), 0), [repos]);
  const totalRepos = profile?.publicRepos ?? repos.length;
  const totalFollowers = profile?.followers || 0;

  // Intelligent Featured Repositories Ranking:
  // 1. Stars > 0
  // 2. Meaningful description
  // 3. Recently updated
  const featuredRepos = useMemo(() => {
    if (!repos.length) return [];
    const scored = [...repos].map((r: any) => {
      let score = 0;
      if (r.stars) score += r.stars * 10;
      if (r.forks) score += r.forks * 5;
      if (r.description && r.description.length > 15) score += 8;
      if (r.language) score += 3;
      if (r.updatedAt) {
        const daysAgo = (Date.now() - new Date(r.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysAgo < 30) score += 10;
        else if (daysAgo < 90) score += 5;
      }
      return { repo: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.repo);
  }, [repos]);

  // Stack Categorization
  const detectedStack = useMemo(() => {
    const names = languageList.map((l) => l.name);
    return categorizeStack(names);
  }, [languageList]);

  // Real Contribution Activity Heatmap Matrix
  const heatmapData = useMemo(() => {
    // Generate dates for the past 24 weeks (approx 168 days)
    const today = new Date();
    const days: { dateStr: string; count: number; level: number; dayOfWeek: number }[] = [];
    const activityMap: Record<string, number> = {};

    // Populate from real recentActivity if available
    recentActivity.forEach((act: any) => {
      if (act.createdAt) {
        const dStr = new Date(act.createdAt).toISOString().split("T")[0];
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
      }
    });

    // Populate from repo update timestamps
    repos.forEach((r: any) => {
      if (r.updatedAt) {
        const dStr = new Date(r.updatedAt).toISOString().split("T")[0];
        activityMap[dStr] = (activityMap[dStr] || 0) + 1;
      }
    });

    // Generate 26 weeks of daily grid data
    const totalDays = 26 * 7;
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = activityMap[dateStr] || 0;
      let level = 0;
      if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      days.push({
        dateStr,
        count,
        level,
        dayOfWeek: d.getDay(),
      });
    }

    return days;
  }, [recentActivity, repos]);

  // Activity stats
  const totalRecordedEvents = recentActivity.length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* 1. TOP NAVIGATION / BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Analytics
        </Link>
      </div>

      {/* 2. DISCONNECTED ZERO-DATA STATE */}
      {!github.connected && !profile && (
        <div className="max-w-xl mx-auto px-4 py-12">
          <Card className="border border-border/70 bg-card p-8 rounded-3xl shadow-xs text-center space-y-5">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border">
              <FaGithub className="h-7 w-7 text-foreground" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block mb-1">
                GITHUB DEVELOPER IDENTITY
              </span>
              <h2 className="text-2xl font-extrabold text-foreground">
                Connect your GitHub profile
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
                Unlock developer telemetry, repository showcase, language distributions, and automated AI Career Score signals.
              </p>
            </div>

            <form onSubmit={handleConnect} className="flex max-w-sm mx-auto gap-2 pt-2">
              <Input
                placeholder="Enter GitHub username (e.g. torvalds)"
                value={connectUsername}
                onChange={(e) => setConnectUsername(e.target.value)}
                className="bg-background border-border text-xs rounded-xl h-10"
              />
              <Button
                type="submit"
                disabled={connecting || !connectUsername.trim()}
                className="bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs rounded-xl h-10 px-4 shrink-0 shadow-sm"
              >
                {connecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Connect"}
              </Button>
            </form>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Loading state */}
      {loading && !profile && (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin text-brand mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground">Synchronizing GitHub telemetry...</p>
        </div>
      )}

      {/* 3. CONNECTED DEVELOPER IDENTITY */}
      {profile && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-up">

          {/* DEVELOPER PROFILE HEADER */}
          <div className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Avatar + Identity info */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName || github.username || "GitHub Avatar"}
                      className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl border border-border/80 object-cover shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl border border-border/80 bg-secondary grid place-items-center">
                      <FaGithub className="h-8 w-8 text-foreground" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" title="Live Synced" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                      {profile.displayName || github.username}
                    </h1>
                    <a
                      href={profile.profileUrl || `https://github.com/${github.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-brand font-mono inline-flex items-center gap-1 transition-colors"
                    >
                      @{github.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground/70" />
                        {profile.location}
                      </span>
                    )}
                    {profile.company && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-foreground/80">{profile.company}</span>
                      </span>
                    )}
                    {profile.joinedDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        Joined {new Date(profile.joinedDate).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync Controls & External Action */}
              <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {syncSuccess ? "Synced just now" : `Synced ${formatRelativeTime(github.lastSynced)}`}
                  </span>

                  <Button
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                    className="h-8 px-3 rounded-xl bg-secondary hover:bg-brand hover:text-brand-foreground text-foreground text-xs font-semibold gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
                    {syncing ? "Syncing..." : "Sync ↻"}
                  </Button>
                </div>

                <a
                  href={profile.profileUrl || `https://github.com/${github.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
                >
                  View GitHub profile <ExternalLink className="h-3 w-3" />
                </a>
              </div>

            </div>
          </div>

          {/* COMPACT METRICS STRIP (Connected single card) */}
          <div className="rounded-3xl border border-border/70 bg-card p-2 shadow-xs grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
            
            {/* Repos */}
            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center group hover:bg-secondary/30 rounded-2xl transition-colors">
              <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {totalRepos}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                <BookMarked className="h-3.5 w-3.5 text-brand" /> Repositories
              </div>
            </div>

            {/* Stars */}
            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center group hover:bg-secondary/30 rounded-2xl transition-colors">
              <span className="text-3xl font-extrabold text-amber-500 tracking-tight tabular-nums">
                {totalStars}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                <Star className="h-3.5 w-3.5 text-amber-500" /> Total Stars
              </div>
            </div>

            {/* Forks */}
            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center group hover:bg-secondary/30 rounded-2xl transition-colors">
              <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {totalForks}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                <GitFork className="h-3.5 w-3.5 text-muted-foreground" /> Project Forks
              </div>
            </div>

            {/* Followers */}
            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center group hover:bg-secondary/30 rounded-2xl transition-colors">
              <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                {totalFollowers}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                <Users className="h-3.5 w-3.5 text-accent-2" /> Followers
              </div>
            </div>

          </div>

          {/* CONTRIBUTION ACTIVITY & ACTIVITY SUMMARY */}
          <div className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  CONTRIBUTION ACTIVITY
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Your coding activity across the year.
                </h2>
              </div>

              {/* Activity Summary Pills */}
              <div className="flex items-center gap-3 text-xs">
                {totalRecordedEvents > 0 && (
                  <span className="font-semibold text-foreground">
                    <strong className="text-brand font-bold">{totalRecordedEvents}</strong> events logged
                  </span>
                )}
                <span className="text-muted-foreground font-mono text-[11px]">
                  {repos.length} active projects
                </span>
              </div>
            </div>

            {/* GitHub Style Heatmap Grid */}
            <div className="overflow-x-auto pb-2 custom-editor-scrollbar">
              <div className="min-w-[640px] space-y-2">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.ceil(heatmapData.length / 7)}, minmax(0, 1fr))`,
                    gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                    gridAutoFlow: "column",
                  }}
                >
                  {heatmapData.map((day, idx) => (
                    <div
                      key={`${day.dateStr}-${idx}`}
                      title={`${day.dateStr}: ${day.count} activities`}
                      className={cn(
                        "h-3 w-3 rounded-[3px] transition-transform hover:scale-125 cursor-pointer",
                        day.level === 0 && "bg-secondary/60 hover:bg-secondary",
                        day.level === 1 && "bg-brand/30 hover:bg-brand/50",
                        day.level === 2 && "bg-brand/65 hover:bg-brand/80",
                        day.level >= 3 && "bg-brand hover:opacity-90"
                      )}
                    />
                  ))}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Past 6 months</span>
                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-[2px] bg-secondary/60" />
                      <span className="h-2.5 w-2.5 rounded-[2px] bg-brand/30" />
                      <span className="h-2.5 w-2.5 rounded-[2px] bg-brand/65" />
                      <span className="h-2.5 w-2.5 rounded-[2px] bg-brand" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN: TOP LANGUAGES & DEVELOPER STACK */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Languages Visualization */}
            <div className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  TOP LANGUAGES
                </span>
                <h2 className="text-lg font-bold text-foreground">Language Distribution</h2>
                <p className="text-xs text-muted-foreground">
                  Proportion of detected code across all public repositories.
                </p>
              </div>

              {languageList.length > 0 ? (
                <div className="space-y-4">
                  {/* Multi-Segment Horizontal Distribution Bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-secondary">
                    {languageList.map((lang) => (
                      <div
                        key={lang.name}
                        style={{
                          width: `${lang.pct}%`,
                          backgroundColor: langColor(lang.name),
                        }}
                        title={`${lang.name}: ${lang.pct}%`}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                      />
                    ))}
                  </div>

                  {/* Language Grid with Percentages */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {languageList.map((lang) => (
                      <div
                        key={lang.name}
                        className="p-2.5 rounded-xl border border-border/60 bg-background/50 flex flex-col justify-between space-y-1 group hover:border-brand/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: langColor(lang.name) }}
                          />
                          <span className="text-xs font-semibold text-foreground truncate">{lang.name}</span>
                        </div>
                        <span className="text-sm font-extrabold text-foreground tabular-nums">
                          {lang.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Language insights will appear after repository analysis.
                </p>
              )}
            </div>

            {/* Developer Stack & Developer Signals */}
            <div className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  DEVELOPER STACK
                </span>
                <h2 className="text-lg font-bold text-foreground">Verified Technology Stack</h2>
                <p className="text-xs text-muted-foreground">
                  Classified competencies detected from repository codebases.
                </p>
              </div>

              <div className="space-y-3">
                {/* Frontend */}
                {detectedStack.frontend.length > 0 && (
                  <div className="p-3 rounded-2xl border border-border/60 bg-background/40 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      Frontend
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {detectedStack.frontend.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded-lg bg-secondary text-foreground font-semibold text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Backend */}
                {detectedStack.backend.length > 0 && (
                  <div className="p-3 rounded-2xl border border-border/60 bg-background/40 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      Backend & Core
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {detectedStack.backend.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded-lg bg-secondary text-foreground font-semibold text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {detectedStack.tools.length > 0 && (
                  <div className="p-3 rounded-2xl border border-border/60 bg-background/40 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      Tools & Config
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {detectedStack.tools.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded-lg bg-secondary text-foreground font-semibold text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developer Signal Footer */}
                <div className="p-3 rounded-2xl border border-brand/20 bg-brand/5 flex items-center gap-2.5 text-xs text-foreground">
                  <Sparkles className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium text-[11px]">
                    <strong className="font-bold text-foreground">Strong Signal:</strong> Regular commits & {repos.length} public projects contributing to AI Career Score.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* FEATURED WORK (EDITORIAL 2-COLUMN REPOSITORY SHOWCASE) */}
          <div className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  FEATURED WORK
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Projects that represent your development activity.
                </h2>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {repos.length} total repositories
              </span>
            </div>

            {featuredRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredRepos.map((repo: any) => {
                  const repoLang = repo.language || "Code";
                  return (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-5 rounded-2xl border border-border/60 bg-background/50 hover:border-brand/40 hover:bg-background/80 transition-all flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors truncate">
                            {repo.name}
                          </h3>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {repo.description || "Public repository and source implementation."}
                        </p>
                      </div>

                      {/* Repo Metadata Footer */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-medium">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: langColor(repoLang) }}
                              />
                              <span className="font-semibold text-foreground/80">{repoLang}</span>
                            </span>
                          )}

                          {repo.stars > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="h-3 w-3" /> {repo.stars}
                            </span>
                          )}

                          {repo.forks > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <GitFork className="h-3 w-3" /> {repo.forks}
                            </span>
                          )}
                        </div>

                        <span>
                          {repo.updatedAt ? `Updated ${formatRelativeTime(repo.updatedAt)}` : "Active"}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center">
                No public repositories synchronized yet.
              </p>
            )}
          </div>

        </main>
      )}

    </div>
  );
}
