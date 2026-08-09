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
  Terminal,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GFGAnalyticsPage() {
  const { user } = useAuth();
  const {
    gfg,
    gfgData,
    connectGFG,
    syncGFG,
    validateGFGUsername,
    fetchDashboardData,
  } = usePlatformStore();
  const { getCachedPlatformData } = usePlatformDataService();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [data, setData] = useState<any>(gfgData || null);

  useEffect(() => {
    if (gfgData) {
      setData(gfgData);
    } else if (user?.id) {
      loadData();
    }
  }, [user?.id, gfgData]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await fetchDashboardData(user.id);
      const cached = await getCachedPlatformData("gfg");
      if (cached) {
        setData(cached);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GeeksforGeeks data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await syncGFG(user.id);
      await fetchDashboardData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync GFG data");
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
      await validateGFGUsername(connectUsername.trim());
      await connectGFG(user.id, connectUsername.trim());
      await fetchDashboardData(user.id);
      setConnectUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect GFG handle");
    } finally {
      setConnecting(false);
    }
  };

  const profile = data?.profile || gfgData?.profile;
  const stats = data?.stats || gfgData?.stats || { school: 0, basic: 0, easy: 0, medium: 0, hard: 0, total: 0 };
  const potd = data?.potd || gfgData?.potd;

  const codingScore = profile?.codingScore || stats?.codingScore || 0;
  const totalSolved = stats?.total || profile?.totalProblemsSolved || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>

        {gfg.connected && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="rounded-xl border-border text-xs gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync GFG"}
          </Button>
        )}
      </div>

      {/* Disconnected State */}
      {!gfg.connected && !profile && (
        <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Terminal className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Connect Your GeeksforGeeks Profile</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Enter your GeeksforGeeks handle to sync your coding score, POTD streaks, problem breakdown, and institute rank.
            </p>
          </div>

          <form onSubmit={handleConnect} className="flex max-w-xs mx-auto gap-2 mt-4">
            <Input
              placeholder="GFG Handle"
              value={connectUsername}
              onChange={(e) => setConnectUsername(e.target.value)}
              className="bg-background border-border text-xs"
            />
            <Button type="submit" disabled={connecting || !connectUsername.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0">
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">Loading GFG analytics...</p>
        </div>
      )}

      {/* Connected View */}
      {profile && (
        <>
          {/* Header Card */}
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar || `https://media.geeksforgeeks.org/gfg-gg-logo.svg`}
                  alt={profile.displayName || gfg.username || "GFG Profile"}
                  className="h-16 w-16 rounded-2xl border border-border object-cover bg-secondary p-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{profile.displayName || gfg.username}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      CONNECTED
                    </span>
                  </div>
                  <a
                    href={`https://www.geeksforgeeks.org/user/${gfg.username || profile.displayName}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
                  >
                    @{gfg.username || profile.displayName} <ExternalLink className="h-3 w-3" />
                  </a>
                  {profile.institute && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Institute: <span className="font-semibold text-foreground">{profile.institute}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Metrics Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Coding Score</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">{codingScore}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Solved</span>
              <div className="text-2xl font-bold text-foreground mt-1">{totalSolved}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">POTD Streak</span>
              <div className="text-2xl font-bold text-amber-500 mt-1">{potd?.currentStreak || profile?.currentStreak || 0} days</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Monthly Score</span>
              <div className="text-2xl font-bold text-foreground mt-1">{profile?.monthlyScore || 0}</div>
            </Card>
          </div>

          {/* Difficulty Distribution Card */}
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-base text-foreground mb-4">Problem Difficulty Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground block">School</span>
                <span className="text-lg font-bold text-foreground mt-1 block">{stats.school || 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center">
                <span className="text-[11px] font-semibold text-cyan-500 block">Basic</span>
                <span className="text-lg font-bold text-cyan-500 mt-1 block">{stats.basic || 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center">
                <span className="text-[11px] font-semibold text-emerald-500 block">Easy</span>
                <span className="text-lg font-bold text-emerald-500 mt-1 block">{stats.easy || 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center">
                <span className="text-[11px] font-semibold text-amber-500 block">Medium</span>
                <span className="text-lg font-bold text-amber-500 mt-1 block">{stats.medium || 0}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-rose-500 block">Hard</span>
                <span className="text-lg font-bold text-rose-500 mt-1 block">{stats.hard || 0}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
