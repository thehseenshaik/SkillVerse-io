import { useState, useEffect } from "react";
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
  Github, 
  CheckCircle2, 
  ArrowLeft,
  Clock,
  Activity,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#007396',
  'C++': '#00599C',
  Go: '#00ADD8',
  Rust: '#DEA584',
  HTML: '#E34F26',
  CSS: '#1572B6',
  PHP: '#777BB4',
  Ruby: '#CC342D',
  Swift: '#F05138',
};

const DEFAULT_COLOR = '#F97316';

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
  const [error, setError] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState('');
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
      const cached = await getCachedPlatformData('github');
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
    setError(null);
    try {
      await syncGitHub(user.id);
      await fetchDashboardData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync GitHub data");
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
      setConnectUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect GitHub account");
    } finally {
      setConnecting(false);
    }
  };

  const profile = data?.profile || githubData?.profile;
  const repos = data?.repositories || githubData?.repositories || [];
  const languages = data?.languages || githubData?.languages || {};
  const recentActivity = data?.recentActivity || githubData?.recentActivity || [];

  const languageList = Object.entries(languages).map(([name, bytes]) => ({
    name,
    bytes: Number(bytes),
  })).sort((a, b) => b.bytes - a.bytes).slice(0, 6);

  const totalBytes = languageList.reduce((acc, l) => acc + l.bytes, 0);

  const totalStars = repos.reduce((acc: number, r: any) => acc + (r.stars || 0), 0);
  const totalForks = repos.reduce((acc: number, r: any) => acc + (r.forks || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* 1. Header & Navigation */}
      <div className="space-y-4">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-brand uppercase block mb-1">
              GITHUB ANALYTICS
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              GitHub Profile & Activity
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Repository showcase, commit contribution metrics, and language telemetry.
            </p>
          </div>

          {github.connected && (
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="bg-brand text-brand-foreground hover:opacity-90 font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync GitHub"}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Disconnected State */}
      {!github.connected && !profile && (
        <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border">
            <Github className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Connect Your GitHub Profile</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Enter your GitHub username to automatically sync your public repositories, language statistics, star counts, and follower count.
            </p>
          </div>

          <form onSubmit={handleConnect} className="flex max-w-xs mx-auto gap-2 mt-4">
            <Input
              placeholder="GitHub Username"
              value={connectUsername}
              onChange={(e) => setConnectUsername(e.target.value)}
              className="bg-background border-border text-xs"
            />
            <Button type="submit" disabled={connecting || !connectUsername.trim()} className="bg-brand text-brand-foreground font-semibold text-xs shrink-0">
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-brand mx-auto" />
          <p className="text-xs text-muted-foreground">Loading GitHub telemetry...</p>
        </div>
      )}

      {/* 3. Connected Profile & Metrics View */}
      {profile && (
        <>
          {/* GitHub Profile Card */}
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar}
                  alt={profile.displayName || github.username || 'GitHub User'}
                  className="h-16 w-16 rounded-2xl border border-border object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{profile.displayName || github.username}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      CONNECTED
                    </span>
                  </div>
                  <a
                    href={profile.profileUrl || `https://github.com/${github.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
                  >
                    @{github.username} <ExternalLink className="h-3 w-3" />
                  </a>
                  {profile.bio && <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-1">{profile.bio}</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* GitHub Developer Snapshot Card */}
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">GitHub Developer Snapshot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Repositories</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">{profile.publicRepos || repos.length}</div>
                <span className="text-xs text-muted-foreground mt-1 block">Public projects</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Stars</span>
                <div className="text-3xl font-extrabold text-amber-500 mt-1">{totalStars}</div>
                <span className="text-xs text-muted-foreground mt-1 block">Across repositories</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Forks</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">{totalForks}</div>
                <span className="text-xs text-muted-foreground mt-1 block">Project forks</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Followers</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">{profile.followers || 0}</div>
                <span className="text-xs text-muted-foreground mt-1 block">Community followers</span>
              </div>
            </div>
          </Card>

          {/* Languages & Public Repositories Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Languages */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <Code className="h-4 w-4 text-brand" /> Language Breakdown
                </h3>

                {languageList.length > 0 ? (
                  <div className="space-y-3">
                    {languageList.map((lang) => {
                      const pct = totalBytes > 0 ? Math.round((lang.bytes / totalBytes) * 100) : 0;
                      return (
                        <div key={lang.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-2 text-foreground">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[lang.name] || DEFAULT_COLOR }} />
                              {lang.name}
                            </span>
                            <span className="text-muted-foreground font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: LANG_COLORS[lang.name] || DEFAULT_COLOR }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">No language data calculated yet.</p>
                )}
              </div>
            </Card>

            {/* Public Repositories */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-brand" /> Public Repositories ({repos.length})
                </h3>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {repos.slice(0, 6).map((repo: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center justify-between text-xs hover:border-brand/40 transition-all">
                      <div className="min-w-0 pr-2">
                        <a href={repo.url} target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-brand truncate block">
                          {repo.name}
                        </a>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{repo.description || 'Public repository'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {repo.stars || 0}</span>
                        <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks || 0}</span>
                      </div>
                    </div>
                  ))}
                  {repos.length === 0 && (
                    <p className="text-xs text-muted-foreground py-8 text-center">No public repositories synchronized.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
