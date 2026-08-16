import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, ExternalLink, Clock, ShieldCheck, Trophy, Terminal, Award } from "lucide-react";
import { SiCodeforces, SiCodechef, SiHackerrank, SiLeetcode } from "react-icons/si";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { toast } from "sonner";
import { GitHubProfileView } from "./GitHubProfileView";
import { LeetCodeProfileView } from "./LeetCodeProfileView";
import { GFGProfileView } from "./GFGProfileView";
import { LinkedInProfileView } from "./LinkedInProfileView";

export function GenericPlatformProfileView({ platform }: { platform: string }) {
  const normPlatform = (platform || "").toLowerCase();

  if (normPlatform === "github") return <GitHubProfileView />;
  if (normPlatform === "leetcode") return <LeetCodeProfileView />;
  if (normPlatform === "gfg" || normPlatform === "geeksforgeeks") return <GFGProfileView />;
  if (normPlatform === "linkedin") return <LinkedInProfileView />;

  const { user } = useAuth();
  const store = usePlatformStore();

  const platformMap: Record<string, { name: string; icon: any; color: string; connection: any; data: any; syncFn?: () => Promise<void> }> = {
    codeforces: {
      name: "Codeforces",
      icon: SiCodeforces,
      color: "#1F8ACB",
      connection: store.codeforces,
      data: store.codeforcesData,
      syncFn: async () => user?.id ? store.syncCodeforces(user.id) : undefined,
    },
    codechef: {
      name: "CodeChef",
      icon: SiCodechef,
      color: "#5B4638",
      connection: store.codechef,
      data: store.codechefData,
      syncFn: async () => user?.id ? store.syncCodeChef(user.id) : undefined,
    },
    hackerrank: {
      name: "HackerRank",
      icon: SiHackerrank,
      color: "#2EC866",
      connection: store.hackerrank,
      data: store.hackerrankData,
      syncFn: async () => user?.id ? store.syncHackerRank(user.id) : undefined,
    },
  };

  const config = platformMap[normPlatform] || {
    name: normPlatform.toUpperCase(),
    icon: ShieldCheck,
    color: "#6366F1",
    connection: { connected: false, username: null, lastSynced: null },
    data: null,
  };

  const Icon = config.icon;
  const isConnected = config.connection?.connected;

  const handleSync = async () => {
    if (!config.syncFn) return;
    try {
      toast.info(`Syncing ${config.name} profile...`);
      await config.syncFn();
      toast.success(`${config.name} profile synced successfully!`);
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-8">
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Career Identity
          </Link>

          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-elegant relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-background border border-border">
                  <Icon className="h-10 w-10" style={{ color: config.color }} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {config.name} Profile
                    </h1>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                        Not Connected
                      </span>
                    )}
                  </div>

                  {isConnected && (
                    <p className="text-sm font-semibold" style={{ color: config.color }}>
                      @{config.connection.username}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isConnected && config.syncFn && (
                  <button
                    onClick={handleSync}
                    disabled={store.isSyncing}
                    className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-extrabold text-white shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${store.isSyncing ? "animate-spin" : ""}`} />
                    <span>Sync Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
        {isConnected ? (
          <div className="glass rounded-3xl p-8 border border-border/60 text-center">
            <Trophy className="h-12 w-12 text-brand mx-auto mb-3" />
            <h3 className="text-lg font-bold">Verified {config.name} Identity</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Your {config.name} telemetry metrics are actively synchronized with your SkillVerse Career Identity.
            </p>
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center border border-border/60 max-w-xl mx-auto">
            <h3 className="text-lg font-bold">{config.name} Profile Not Connected</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Connect your {config.name} handle on the Career Identity overview page to bring live telemetry into SkillVerse.
            </p>
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Back to Career Identity
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
