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
} from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import {
  fetchGithubStats,
  parseGithubUsername,
  langColor,
  type GitHubStats,
} from "@/lib/github";

function timeAgo(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

export function GitHubSyncCard() {
  const { profile } = useProfile();
  const username = parseGithubUsername(profile.links.github ?? "");
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
    setStats(null);
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Empty state — no GitHub username set yet
  if (!username) {
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
          Add your GitHub username on your profile to pull repos, languages, and
          stars into your Career Score.
        </p>
        <Link
          to="/profile"
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          Connect GitHub <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-elegant">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative">
          {stats?.avatar ? (
            <img
              src={stats.avatar}
              alt={`${stats.username} avatar`}
              className="h-12 w-12 rounded-xl border border-border/70 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-border/70 bg-secondary">
              <FaGithub className="h-5 w-5" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-background bg-foreground">
            <FaGithub className="h-2.5 w-2.5 text-background" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">
              {stats?.name ?? stats?.username ?? username}
            </h2>
            {stats && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />{" "}
                Live
              </span>
            )}
          </div>
          <a
            href={stats?.htmlUrl ?? `https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            @{stats?.username ?? username} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
          aria-label="Resync GitHub"
        >
          <RefreshCcw
            className={"h-3.5 w-3.5 " + (loading ? "animate-spin" : "")}
          />
          {loading ? "Syncing" : "Resync"}
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat grid */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { Icon: BookMarked, label: "Repos", v: stats?.publicRepos },
          { Icon: Star, label: "Stars", v: stats?.totalStars },
          { Icon: GitFork, label: "Forks", v: stats?.totalForks },
          { Icon: Users, label: "Followers", v: stats?.followers },
        ].map(({ Icon, label, v }) => (
          <div
            key={label}
            className="rounded-xl border border-border/60 bg-background/40 p-2.5 text-center"
          >
            <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {loading && v == null ? "—" : (v ?? "—")}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      {stats && stats.languages.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>Top languages</span>
            <span>{stats.languages.length} detected</span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
            {stats.languages.map((l) => (
              <div
                key={l.name}
                style={{ width: `${l.pct}%`, background: langColor(l.name) }}
                title={`${l.name} · ${l.pct}%`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stats.languages.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: langColor(l.name) }}
                />
                {l.name} <span className="text-muted-foreground">{l.pct}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top repos */}
      {stats && stats.topRepos.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Pinned by activity
          </div>
          <ul className="space-y-1.5">
            {stats.topRepos.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2 transition-all hover:border-brand/40 hover:bg-background/70"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold">
                        {r.name}
                      </span>
                      {r.language && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                          title={r.language}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: langColor(r.language) }}
                          />
                          {r.language}
                        </span>
                      )}
                    </span>
                    {r.description && (
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {r.description}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Star className="h-3 w-3" /> {r.stars}
                    </span>
                    <span className="tabular-nums">{timeAgo(r.updatedAt)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats && (
        <p className="mt-4 text-[10px] text-muted-foreground">
          Synced {timeAgo(new Date(stats.fetchedAt).toISOString())} · cached for
          6 hours
        </p>
      )}
    </div>
  );
}
