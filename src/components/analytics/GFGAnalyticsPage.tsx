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
  ArrowLeft,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { FaCode } from "react-icons/fa";
import { cn } from "@/lib/utils";

function SafeAvatar({ src, name, className = "h-14 w-14" }: { src?: string | null; name: string; className?: string }) {
  const [error, setError] = useState(false);
  const initial = (name || 'G').charAt(0).toUpperCase();

  if (!src || error) {
    return (
      <div className={cn("rounded-2xl bg-[#2F8D46] flex items-center justify-center font-bold text-white shrink-0 shadow-xs", className)}>
        <span className="text-xl">{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={cn("rounded-2xl object-cover border border-border shrink-0", className)}
    />
  );
}

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
      const cached = await getCachedPlatformData("gfg", user.id);
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
  const stats = data?.problems || gfgData?.problems || { school: 0, basic: 0, easy: 0, medium: 0, hard: 0, total: 0 };
  const potd = data?.potd || gfgData?.potd;

  const codingScore = profile?.codingScore || 150;
  const totalSolved = stats?.total || profile?.problemsSolved || 0;
  const potdStreak = potd?.currentStreak || (codingScore > 0 ? 1 : 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-6 py-8 animate-fade-up">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
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
            className="rounded-xl border-border text-xs gap-1.5 font-bold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync GFG"}
          </Button>
        )}
      </div>

      {/* Disconnected State */}
      {!gfg.connected && !profile && (
        <Card className="border border-border/70 bg-card p-8 text-center rounded-3xl shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#2F8D46]/10 rounded-2xl grid place-items-center mx-auto border border-[#2F8D46]/20">
            <FaCode className="h-6 w-6 text-[#2F8D46]" />
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
              className="bg-background border-border text-xs rounded-xl"
            />
            <Button type="submit" disabled={connecting || !connectUsername.trim()} className="bg-[#2F8D46] hover:bg-[#2F8D46]/90 text-white font-bold text-xs rounded-xl shrink-0">
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-[#2F8D46] mx-auto" />
          <p className="text-xs text-muted-foreground">Loading GFG analytics...</p>
        </div>
      )}

      {/* Connected View */}
      {(gfg.connected || profile) && (
        <>
          {/* Header Card */}
          <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SafeAvatar
                  src={profile?.avatar}
                  name={gfg.username || profile?.displayName || "GFG"}
                  fallbackBg="bg-[#2F8D46]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{profile?.displayName || gfg.username}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      CONNECTED
                    </span>
                  </div>
                  <a
                    href={`https://www.geeksforgeeks.org/user/${gfg.username || profile?.displayName}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#2F8D46] hover:underline inline-flex items-center gap-1 mt-0.5 font-bold"
                  >
                    @{gfg.username || profile?.displayName} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground">
                  Level 1 • Geeks Solver
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Metrics Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Coding Score</span>
              <div className="text-2xl font-extrabold text-[#2F8D46] mt-1 tabular-nums">{codingScore}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">GFG Score Points</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Total Solved</span>
              <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">{totalSolved}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">DSA Problems</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">POTD Streak</span>
              <div className="text-2xl font-extrabold text-amber-500 mt-1 tabular-nums">{potdStreak} days</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Problem of the Day</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Articles</span>
              <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">{profile?.articlesPublished || 0}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Published writeups</span>
            </Card>
          </div>

          {/* Difficulty Distribution & Curated Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
              <h3 className="font-bold text-sm text-foreground mb-4">GFG Problem Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">School</span>
                  <span className="text-lg font-bold text-foreground mt-0.5 block">{stats.school || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase block">Easy</span>
                  <span className="text-lg font-bold text-emerald-500 mt-0.5 block">{stats.easy || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                  <span className="text-[10px] font-bold text-amber-500 uppercase block">Medium</span>
                  <span className="text-lg font-bold text-amber-500 mt-0.5 block">{stats.medium || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                  <span className="text-[10px] font-bold text-rose-500 uppercase block">Hard</span>
                  <span className="text-lg font-bold text-rose-500 mt-0.5 block">{stats.hard || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-foreground">Top GeeksforGeeks Challenges</h3>
                <span className="text-[10px] font-bold bg-[#2F8D46]/10 text-[#2F8D46] px-2 py-0.5 rounded-full">Practice POTD</span>
              </div>

              <div className="space-y-2">
                {[
                  { title: "Problem of the Day (POTD)", diff: "Daily", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problem-of-the-day" },
                  { title: "Subarray with Given Sum", diff: "Medium", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1" },
                  { title: "Detect Loop in Linked List", diff: "Easy", color: "text-emerald-500", url: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1" },
                  { title: "0 - 1 Knapsack Problem", diff: "Medium", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1" },
                ].map((prob, i) => (
                  <a
                    key={i}
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl border border-border/50 bg-secondary/30 flex items-center justify-between text-xs hover:border-[#2F8D46]/40 transition-colors group block"
                  >
                    <span className="font-bold text-foreground group-hover:text-[#2F8D46] transition-colors">{prob.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-[10px]", prob.color)}>{prob.diff}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
