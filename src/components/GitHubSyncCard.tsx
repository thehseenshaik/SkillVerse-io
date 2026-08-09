import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FaGithub } from "react-icons/fa";
import {
  RefreshCcw,
  Star,
  GitFork,
  Users,
  BookMarked,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useIdentityHub } from "@/lib/identity-hub-context";
import {
  fetchGithubStats,
  parseGithubUsername,
  langColor,
  type GitHubStats,
} from "@/lib/github";

export function GitHubSyncCard() {
  const { profile } = useProfile();
  const { github, githubData } = usePlatformStore();
  const { connections = [] } = useIdentityHub();

  const rawUsername =
    github?.username ||
    connections?.find((c) => c.platform === "github" && c.status === "connected")?.username ||
    profile?.links?.github ||
    "";

  const username = parseGithubUsername(rawUsername || "");
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const s = await fetchGithubStats(username, { force });
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (username) {
      void load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Empty state — no GitHub username set yet and not connected
  if (!username && !github?.connected) {
    return (
      <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2">
          <FaGithub className="h-4 w-4" />
          <h2 className="text-lg font-semibold">GitHub</h2>
          <span className="ml-auto rounded-full border border-border/70 bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Not connected
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your GitHub profile to pull repositories, top languages, and stars into your live Career Score.
        </p>
        <Link
          to="/connections"
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          Connect GitHub <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Display user stats (from local fetch or fallback to platformStore data)
  const avatar = stats?.avatar || githubData?.profile?.avatar;
  const displayName = stats?.name || githubData?.profile?.displayName || username || "Developer";
  const userBio = stats?.bio || githubData?.profile?.bio;
  const totalRepos = stats?.publicRepos ?? (Array.isArray(githubData?.repositories) ? githubData.repositories.length : githubData?.profile?.publicRepos ?? 0);
  const totalStars = stats?.totalStars ?? 0;
  const totalForks = stats?.totalForks ?? 0;
  const followersCount = stats?.followers ?? githubData?.profile?.followers ?? 0;
  
  const topRepos = Array.isArray(stats?.topRepos) && stats.topRepos.length > 0
    ? stats.topRepos
    : Array.isArray(githubData?.repositories)
    ? githubData.repositories
    : [];

  const topLanguages = Array.isArray(stats?.languages) && stats.languages.length > 0
    ? stats.languages
    : githubData?.languages && typeof githubData.languages === "object"
    ? Object.entries(githubData.languages).map(([name, bytes]) => ({ name, count: Number(bytes), pct: 0 }))
    : [];

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={`${username || "User"} avatar`}
              className="h-12 w-12 rounded-xl border border-border/70 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/70 bg-secondary">
              <FaGithub className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold">
              {displayName}
            </h2>
            {username && (
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand"
              >
                @{username}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Live Synced
            </span>
          </div>

          {userBio && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {userBio}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          aria-label="Refresh GitHub stats"
          className="grid h-8 w-8 place-items-center rounded-lg border border-border/70 bg-background/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BookMarked className="h-3.5 w-3.5" /> Repos
          </div>
          <div className="mt-1 text-xl font-bold">{totalRepos}</div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-amber-500" /> Stars
          </div>
          <div className="mt-1 text-xl font-bold">{totalStars}</div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <GitFork className="h-3.5 w-3.5" /> Forks
          </div>
          <div className="mt-1 text-xl font-bold">{totalForks}</div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Followers
          </div>
          <div className="mt-1 text-xl font-bold">{followersCount}</div>
        </div>
      </div>

      {/* Top Languages */}
      {topLanguages.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Top Languages
          </div>
          <div className="flex flex-wrap gap-2">
            {topLanguages.slice(0, 5).map((lang: any, i: number) => {
              const langName = typeof lang === "string" ? lang : lang?.name || "Code";
              return (
                <span
                  key={`${langName}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/40 px-2.5 py-1 text-xs font-medium"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: langColor(langName) }}
                  />
                  {langName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Repos */}
      {topRepos.length > 0 && (
        <div className="mt-5 border-t border-border/50 pt-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Featured Repositories
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {topRepos.slice(0, 4).map((repo: any, idx: number) => {
              const repoName = repo?.name || `Repository ${idx + 1}`;
              const repoUrl = repo?.url || (username ? `https://github.com/${username}/${repoName}` : undefined);
              const repoDesc = repo?.description || "Public repository";
              const repoLang = repo?.language;
              const repoStars = repo?.stars;

              return (
                <a
                  key={`${repoName}-${idx}`}
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group/repo rounded-xl border border-border/60 bg-background/30 p-3 transition-colors hover:border-brand/40 hover:bg-background/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold group-hover/repo:text-brand">
                      {repoName}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover/repo:text-brand" />
                  </div>
                  {repoDesc && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                      {repoDesc}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                    {repoLang && (
                      <span className="flex items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: langColor(repoLang) }}
                        />
                        {repoLang}
                      </span>
                    )}
                    {repoStars != null && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-500" /> {repoStars}
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
