import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MapPin,
  Globe,
  GitFork,
  Star,
  BookOpen,
  Users,
  Code2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { toast } from "sonner";

export function GitHubProfileView() {
  const { user } = useAuth();
  const { github, githubData, syncGitHub, isSyncing } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<"overview" | "repos" | "languages" | "activity">("overview");
  const [avatarError, setAvatarError] = useState(false);

  const formatLastSynced = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const handleSync = async () => {
    if (!user?.id) return;
    try {
      toast.info("Syncing GitHub profile data...");
      await syncGitHub(user.id);
      toast.success("GitHub profile synced successfully!");
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  if (!github.connected || !githubData) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Career Identity
          </Link>
          <div className="glass rounded-3xl p-12 text-center border border-border/60 max-w-xl mx-auto">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-background border border-border shadow-md mb-4">
              <FaGithub className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="text-xl font-bold">GitHub Account Not Connected</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Connect your GitHub account to bring open-source repositories, commit telemetry, and activity into SkillVerse.
            </p>
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-strong px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Connect GitHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = githubData.profile;
  const repos = githubData.repositories || [];
  const languages = githubData.languages || {};
  const totalStars = repos.reduce((sum, r) => sum + (r.stars || 0), 0);
  const topLang = Object.keys(languages)[0] || (repos[0]?.language) || "TypeScript";
  const cleanBio = profile?.bio
    ? profile.bio.replace(/^-\s*/, "").replace(/\s*-\s*/g, " • ").trim()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Hero Banner */}
      <section className="relative overflow-hidden bg-hero border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-8 pb-8">
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Career Identity
          </Link>

          {/* Profile Header Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-elegant relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {!avatarError && profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName || github.username || "GitHub Avatar"}
                    onError={() => setAvatarError(true)}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-border shadow-md object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand/20 via-brand/10 to-transparent border-2 border-brand/30 text-3xl font-black text-brand shadow-inner">
                    {(profile.displayName || github.username || "M").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {profile.displayName || github.username}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-brand">@{github.username}</p>

                  {cleanBio && (
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                      {cleanBio}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> {profile.website}
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                      <Clock className="h-3.5 w-3.5" /> Last synced: {formatLastSynced(github.lastSynced)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                {profile.profileUrl && (
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    View on GitHub <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand via-brand-strong to-brand px-4 py-2 text-xs font-extrabold text-white shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Content */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{profile.publicRepos || repos.length || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Repositories</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 mb-2">
              <Star className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{totalStars}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Total Stars</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-2">
              <Code2 className="h-5 w-5" />
            </div>
            <p className="text-lg font-extrabold text-foreground truncate px-1">{topLang}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Top Tech Stack</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Active</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Account Status</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 mb-6 gap-2">
          {(["overview", "repos", "languages", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors relative ${
                activeTab === tab ? "text-brand border-b-2 border-brand" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-border/60">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" /> Top Public Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.slice(0, 4).map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-border/70 p-4 hover:border-brand/50 hover:bg-card/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground group-hover:text-brand transition-colors">
                        {repo.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                    </div>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          <span className="h-2 w-2 rounded-full bg-brand" />
                          {repo.language}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" /> {repo.stars || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="h-3 w-3 text-muted-foreground" /> {repo.forks || 0}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "repos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-border/70 p-5 glass hover:border-brand/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors">{repo.name}</h4>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{repo.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" /> {repo.stars || 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" /> {repo.forks || 0}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {activeTab === "languages" && (
          <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Code2 className="h-4 w-4 text-brand" /> Primary Programming Languages
            </h3>
            <div className="space-y-3">
              {Object.entries(languages).map(([lang, count]) => {
                const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={lang} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{lang}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-brand transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand" /> Recent GitHub Contributions
            </h3>
            {githubData.recentActivity && githubData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {githubData.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/40">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold capitalize text-brand">{act.type}</span>
                      <span className="text-muted-foreground">on</span>
                      <span className="font-medium text-foreground">{act.repo}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No recent activity logs available.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
