import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useIdentityHub } from "@/lib/identity-hub-context";
import {
  RefreshCw,
  X,
  Clock,
  Plus,
  BookOpen,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from "react-icons/si";
import { toast } from "sonner";

export const Route = createFileRoute("/connections/")({
  head: () => ({
    meta: [
      { title: "Career Identity — SkillVerse" },
      {
        name: "description",
        content: "Your professional presence across the platforms that define your skills.",
      },
    ],
  }),
  component: CareerIdentityOverviewPage,
});

function CareerIdentityOverviewPage() {
  const { user } = useAuth();
  const store = usePlatformStore();
  const { refreshConnections } = useIdentityHub();

  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      store.fetchDashboardData(user.id);
      refreshConnections();
    }
  }, [user?.id]);

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

  const platforms = [
    {
      id: "github",
      name: "GitHub",
      route: "/connections/github",
      icon: <FaGithub className="h-6 w-6 text-foreground" />,
      desc: "Connect your GitHub profile to bring your development activity into SkillVerse.",
      connection: store.github,
      data: store.githubData,
      getAvatar: () => store.githubData?.profile?.avatar || null,
      getDisplayName: () => store.githubData?.profile?.displayName || store.github?.username || "GitHub User",
      getMetricsText: () =>
        store.githubData
          ? `${store.githubData.profile?.publicRepos || store.githubData.repositories?.length || 0} Repos • ${store.githubData.profile?.followers || 0} Followers`
          : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateGitHubUsername(un);
        await store.connectGitHub(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing GitHub...");
        await store.syncGitHub(user.id);
        toast.success("GitHub profile synced!");
      },
    },
    {
      id: "leetcode",
      name: "LeetCode",
      route: "/connections/leetcode",
      icon: <SiLeetcode className="h-6 w-6 text-[#FFA116]" />,
      desc: "Connect your LeetCode profile to bring problem solving & DSA progress into SkillVerse.",
      connection: store.leetcode,
      data: store.leetcodeData,
      getAvatar: () => store.leetcodeData?.profile?.avatar || null,
      getDisplayName: () => store.leetcodeData?.profile?.displayName || store.leetcode?.username || "LeetCode User",
      getMetricsText: () =>
        store.leetcodeData
          ? `${store.leetcodeData.stats?.All || 0} Solved • Rating: ${store.leetcodeData.contest?.rating || "N/A"}`
          : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateLeetCodeUsername(un);
        await store.connectLeetCode(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing LeetCode...");
        await store.syncLeetCode(user.id);
        toast.success("LeetCode profile synced!");
      },
    },
    {
      id: "gfg",
      name: "GeeksforGeeks",
      route: "/connections/gfg",
      icon: <BookOpen className="h-6 w-6 text-[#2F8D46]" />,
      desc: "Connect your GeeksforGeeks profile to aggregate coding score, streak & POTD stats.",
      connection: store.gfg,
      data: store.gfgData,
      getAvatar: () => store.gfgData?.profile?.avatar || null,
      getDisplayName: () => store.gfgData?.profile?.displayName || store.gfg?.username || "GFG User",
      getMetricsText: () =>
        store.gfgData
          ? `Score: ${store.gfgData.profile?.codingScore || 0} • ${store.gfgData.problems?.total || 0} Solved`
          : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateGFGUsername(un);
        await store.connectGFG(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing GeeksforGeeks...");
        await store.syncGFG(user.id);
        toast.success("GeeksforGeeks profile synced!");
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      route: "/connections/linkedin",
      icon: <FaLinkedin className="h-6 w-6 text-[#0A66C2]" />,
      desc: "Connect your LinkedIn profile to bring verified professional experience into SkillVerse.",
      connection: store.linkedin,
      data: store.linkedinData,
      getAvatar: () => store.linkedinData?.profile?.avatar || null,
      getDisplayName: () => store.linkedinData?.profile?.name || store.linkedin?.username || "LinkedIn User",
      getMetricsText: () =>
        store.linkedinData ? `${store.linkedinData.connections || 500}+ Connections` : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.connectLinkedIn(user.id, un);
      },
      onSync: undefined,
    },
    {
      id: "codeforces",
      name: "Codeforces",
      route: "/connections/codeforces",
      icon: <SiCodeforces className="h-6 w-6 text-[#1F8ACB]" />,
      desc: "Connect Codeforces handle to sync competitive rating and contest activity.",
      connection: store.codeforces,
      data: store.codeforcesData,
      getAvatar: () => null,
      getDisplayName: () => store.codeforces?.username || "Codeforces User",
      getMetricsText: () =>
        store.codeforcesData ? `Rating: ${store.codeforcesData.rating || 0}` : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateCodeforcesUsername(un);
        await store.connectCodeforces(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing Codeforces...");
        await store.syncCodeforces(user.id);
        toast.success("Codeforces profile synced!");
      },
    },
    {
      id: "codechef",
      name: "CodeChef",
      route: "/connections/codechef",
      icon: <SiCodechef className="h-6 w-6 text-[#5B4638]" />,
      desc: "Connect CodeChef handle to sync rating, stars, and problem stats.",
      connection: store.codechef,
      data: store.codechefData,
      getAvatar: () => null,
      getDisplayName: () => store.codechef?.username || "CodeChef User",
      getMetricsText: () =>
        store.codechefData ? `Stars: ${store.codechefData.stars || "1★"}` : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateCodeChefUsername(un);
        await store.connectCodeChef(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing CodeChef...");
        await store.syncCodeChef(user.id);
        toast.success("CodeChef profile synced!");
      },
    },
    {
      id: "hackerrank",
      name: "HackerRank",
      route: "/connections/hackerrank",
      icon: <SiHackerrank className="h-6 w-6 text-[#2EC866]" />,
      desc: "Connect HackerRank handle to sync domain badges and verified skills.",
      connection: store.hackerrank,
      data: store.hackerrankData,
      getAvatar: () => null,
      getDisplayName: () => store.hackerrank?.username || "HackerRank User",
      getMetricsText: () =>
        store.hackerrankData ? `${store.hackerrankData.badgesCount || 0} Badges` : null,
      onConnect: async (un: string) => {
        if (!user?.id) return;
        await store.validateHackerRankUsername(un);
        await store.connectHackerRank(user.id, un);
      },
      onSync: async () => {
        if (!user?.id) return;
        toast.info("Syncing HackerRank...");
        await store.syncHackerRank(user.id);
        toast.success("HackerRank profile synced!");
      },
    },
  ];

  const connectedCount = platforms.filter((p) => p.connection?.connected).length;

  const handleConnectSubmit = async (pObj: (typeof platforms)[0]) => {
    if (!usernameInput.trim()) return;
    setIsValidating(true);
    try {
      await pObj.onConnect(usernameInput.trim());
      await refreshConnections();
      toast.success(`${pObj.name} connected successfully!`);
      setConnectModalPlatform(null);
      setUsernameInput("");
    } catch (err: any) {
      toast.error(`Connection failed: ${err?.message || "Invalid username"}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-hero border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                CAREER IDENTITY HUB
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Career <span className="text-gradient">Identity</span>.
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Your professional presence across the platforms that define your skills.
              </p>
            </div>

            {/* Connected Progress Badge */}
            <div className="flex items-center gap-4 shrink-0 bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-4 shadow-2xs">
              <div className="text-right">
                <p className="text-sm font-extrabold text-foreground">
                  {connectedCount}/{platforms.length} Connected
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">Platforms linked</p>
              </div>
              <div className="w-28 h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-1000 ease-out"
                  style={{ width: `${Math.round((connectedCount / platforms.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="mx-auto max-w-6xl px-6 pt-8 space-y-10">
        <div>
          <h2 className="text-lg font-bold mb-1">Connected Platforms</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Click any connected platform to view its dedicated SkillVerse Career Profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((p) => {
              const isConnected = p.connection?.connected;
              const avatar = p.getAvatar();
              const displayName = p.getDisplayName();
              const metrics = p.getMetricsText();

              return (
                <div
                  key={p.id}
                  className="glass rounded-3xl p-6 border border-border/60 shadow-elegant transition-all duration-300 hover:border-brand/40 hover:shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border/60 bg-background shadow-2xs">
                          {p.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-foreground">{p.name}</h3>
                            {isConnected ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Connected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                Not Connected
                              </span>
                            )}
                          </div>
                          {isConnected && (
                            <p className="text-xs font-semibold text-brand mt-0.5">@{p.connection?.username}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {isConnected ? (
                      <div className="p-4 rounded-2xl bg-card/50 border border-border/60 space-y-2">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img src={avatar} alt={displayName} className="h-10 w-10 rounded-xl object-cover border border-border" />
                          ) : (
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background border border-border text-xs font-bold text-foreground">
                              {(p.connection?.username || "P").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-foreground">{displayName}</p>
                            {metrics && <p className="text-[11px] text-muted-foreground">{metrics}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 pt-1 border-t border-border/50">
                          <Clock className="h-3 w-3" />
                          <span>Last synced: {formatLastSynced(p.connection?.lastSynced || null)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed min-h-[40px]">
                        {p.desc}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-6 shrink-0">
                    {isConnected ? (
                      <>
                        <Link
                          to={p.route}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                        >
                          View Profile <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {p.onSync && (
                          <button
                            type="button"
                            onClick={p.onSync}
                            disabled={store.isSyncing}
                            className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl border border-brand/40 bg-background/80 hover:bg-brand/10 px-3.5 py-2 text-xs font-bold text-foreground hover:text-brand hover:border-brand transition-all duration-300 shadow-2xs hover:shadow-md hover:shadow-brand/20 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 text-brand ${store.isSyncing ? "animate-spin" : ""}`} />
                            <span>Sync</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalPlatform(p.id);
                          setUsernameInput("");
                        }}
                        className="relative group overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand via-brand-strong to-brand px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-brand/25 hover:shadow-lg hover:shadow-brand/40 hover:scale-[1.02] active:scale-[0.98] transition-all w-full cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Connect {p.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified SkillVerse Career Identity Summary */}
        {connectedCount > 0 && (
          <section className="glass rounded-3xl p-8 border border-border/60 shadow-elegant space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand" /> Your SkillVerse Identity Summary
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregated telemetry derived from your connected platform profiles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">DSA & Problem Solving</p>
                <p className="text-xl font-extrabold text-foreground">
                  {(store.leetcodeData?.stats?.All || 0) + (store.gfgData?.problems?.total || 0)} Solved
                </p>
                <p className="text-[11px] text-brand font-semibold">LeetCode + GeeksforGeeks</p>
              </div>

              <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Open Source Repositories</p>
                <p className="text-xl font-extrabold text-foreground">
                  {store.githubData?.profile?.publicRepos || store.githubData?.repositories?.length || 0} Repos
                </p>
                <p className="text-[11px] text-brand font-semibold">GitHub Telemetry</p>
              </div>

              <div className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Industry Network</p>
                <p className="text-xl font-extrabold text-foreground">
                  {store.linkedinData?.connections || (store.linkedin?.connected ? 500 : 0)}+ Connections
                </p>
                <p className="text-[11px] text-brand font-semibold">LinkedIn Verified</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Connect Platform Input Modal */}
      {connectModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border/80 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Connect {platforms.find((p) => p.id === connectModalPlatform)?.name}
              </h3>
              <button
                onClick={() => setConnectModalPlatform(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Enter your exact handle or username to verify and link your account:
              </p>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={`Enter ${connectModalPlatform} username`}
                className="w-full rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const targetPlatformObj = platforms.find((p) => p.id === connectModalPlatform);
                    if (targetPlatformObj) handleConnectSubmit(targetPlatformObj);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConnectModalPlatform(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isValidating || !usernameInput.trim()}
                onClick={() => {
                  const targetPlatformObj = platforms.find((p) => p.id === connectModalPlatform);
                  if (targetPlatformObj) handleConnectSubmit(targetPlatformObj);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-strong px-5 py-2 text-xs font-extrabold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isValidating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Connect Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
