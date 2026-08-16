import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Award,
  Zap,
  CheckCircle,
  Clock,
  Building,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { toast } from "sonner";

export function GFGProfileView() {
  const { user } = useAuth();
  const { gfg, gfgData, syncGFG, isSyncing } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<"overview" | "potd">("overview");

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
      toast.info("Syncing GeeksforGeeks profile data...");
      await syncGFG(user.id);
      toast.success("GeeksforGeeks profile synced successfully!");
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  if (!gfg.connected || !gfgData) {
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
              <BookOpen className="h-8 w-8 text-[#2F8D46]" />
            </div>
            <h2 className="text-xl font-bold">GeeksforGeeks Account Not Connected</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Connect your GeeksforGeeks profile to bring coding scores, POTD streak, and institute rankings into SkillVerse.
            </p>
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2F8D46] to-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Connect GeeksforGeeks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = gfgData.profile || {};
  const potd = gfgData.potd || {};
  const problems = gfgData.problems || { total: 0, easy: 0, medium: 0, hard: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-hero border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" />
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
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName || gfg.username || "GFG Avatar"}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-border shadow-md object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-background border border-border text-2xl font-black text-[#2F8D46]">
                    <BookOpen className="h-10 w-10 text-[#2F8D46]" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {profile.displayName || gfg.username}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#2F8D46]">@{gfg.username}</p>

                  {profile.instituteName && (
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" /> {profile.instituteName}
                      {profile.instituteRank && ` (Rank #${profile.instituteRank})`}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                      <Clock className="h-3.5 w-3.5" /> Last synced: {formatLastSynced(gfg.lastSynced)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <a
                  href={`https://auth.geeksforgeeks.org/user/${gfg.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  View on GFG <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2F8D46] to-emerald-700 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50"
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

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-[#2F8D46] mb-2">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{profile.codingScore || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Coding Score</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500 mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{problems.total || profile.problemsSolved || 0}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Problems Solved</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{potd.currentStreak || 0} Days</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">POTD Streak</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500 mb-2">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{profile.instituteRank ? `#${profile.instituteRank}` : "N/A"}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Institute Rank</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 mb-6 gap-2">
          {(["overview", "potd"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors relative ${
                activeTab === tab ? "text-[#2F8D46] border-b-2 border-[#2F8D46]" : "text-muted-foreground hover:text-foreground"
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
                <BookOpen className="h-4 w-4 text-[#2F8D46]" /> Problem Solving Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
                    <span className="text-sm font-extrabold text-foreground">{problems.easy || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((problems.easy || 0) / 200) * 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Medium</span>
                    <span className="text-sm font-extrabold text-foreground">{problems.medium || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-amber-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, ((problems.medium || 0) / 150) * 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Hard</span>
                    <span className="text-sm font-extrabold text-foreground">{problems.hard || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-rose-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, ((problems.hard || 0) / 50) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "potd" && (
          <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#2F8D46]" /> Problem of the Day Activity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-border/60 glass text-center">
                <p className="text-xl font-extrabold text-foreground">{potd.currentStreak || 0} Days</p>
                <p className="text-xs text-muted-foreground mt-0.5">Current Streak</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/60 glass text-center">
                <p className="text-xl font-extrabold text-foreground">{potd.longestStreak || 0} Days</p>
                <p className="text-xs text-muted-foreground mt-0.5">Longest Streak</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/60 glass text-center">
                <p className="text-xl font-extrabold text-foreground">{potd.totalSolved || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total POTD Solved</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
