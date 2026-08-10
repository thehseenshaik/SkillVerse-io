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
  Award,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { SiLeetcode } from "react-icons/si";
import { cn } from "@/lib/utils";

function SafeAvatar({ src, name, className = "h-16 w-16" }: { src?: string | null; name: string; className?: string }) {
  const [error, setError] = useState(false);
  const initial = (name || 'L').charAt(0).toUpperCase();

  if (!src || error) {
    return (
      <div className={cn("rounded-2xl bg-[#FFA116] flex items-center justify-center font-black text-slate-950 shrink-0 shadow-sm", className)}>
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

export function LeetCodeAnalyticsPage() {
  const { user } = useAuth();
  const {
    leetcode,
    leetcodeData,
    connectLeetCode,
    syncLeetCode,
    validateLeetCodeUsername,
    fetchDashboardData,
  } = usePlatformStore();
  const { getCachedPlatformData } = usePlatformDataService();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [data, setData] = useState<any>(leetcodeData || null);

  useEffect(() => {
    if (leetcodeData) {
      setData(leetcodeData);
    } else if (user?.id) {
      loadData();
    }
  }, [user?.id, leetcodeData]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await fetchDashboardData(user.id);
      const cached = await getCachedPlatformData("leetcode", user.id);
      if (cached) {
        setData(cached);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load LeetCode data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await syncLeetCode(user.id);
      await fetchDashboardData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync LeetCode data");
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
      await validateLeetCodeUsername(connectUsername.trim());
      await connectLeetCode(user.id, connectUsername.trim());
      await fetchDashboardData(user.id);
      setConnectUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect LeetCode profile");
    } finally {
      setConnecting(false);
    }
  };

  const profile = data?.profile || leetcodeData?.profile;
  const stats = data?.stats || leetcodeData?.stats || { Easy: 0, Medium: 0, Hard: 0, All: 0 };
  const contest = data?.contest || leetcodeData?.contest;
  const badges = data?.badges || leetcodeData?.badges || [];

  const easyCount = stats.Easy || 0;
  const mediumCount = stats.Medium || 0;
  const hardCount = stats.Hard || 0;
  const totalSolved = leetcodeData?.totalSolved || stats.All || (easyCount + mediumCount + hardCount);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>

        {leetcode.connected && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="rounded-xl border-border text-xs gap-1.5 font-bold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync LeetCode"}
          </Button>
        )}
      </div>

      {/* Disconnected State */}
      {!leetcode.connected && !profile && (
        <Card className="border border-border/70 bg-card p-8 text-center rounded-3xl shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#FFA116]/10 rounded-2xl grid place-items-center mx-auto border border-[#FFA116]/20">
            <SiLeetcode className="h-6 w-6 text-[#FFA116]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Connect Your LeetCode Profile</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Enter your LeetCode username to sync your solved problems, difficulty breakdown (Easy, Medium, Hard), and contest rating.
            </p>
          </div>

          <form onSubmit={handleConnect} className="flex max-w-xs mx-auto gap-2 mt-4">
            <Input
              placeholder="LeetCode Username"
              value={connectUsername}
              onChange={(e) => setConnectUsername(e.target.value)}
              className="bg-background border-border text-xs rounded-xl"
            />
            <Button type="submit" disabled={connecting || !connectUsername.trim()} className="bg-[#FFA116] hover:bg-[#FFA116]/90 text-slate-950 font-bold text-xs rounded-xl shrink-0">
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-[#FFA116] mx-auto" />
          <p className="text-xs text-muted-foreground">Loading LeetCode analytics...</p>
        </div>
      )}

      {/* Connected View */}
      {(leetcode.connected || profile) && (
        <>
          {/* Header Card */}
          <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SafeAvatar
                  src={profile?.avatar}
                  name={leetcode.username || profile?.displayName || "LeetCode"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{profile?.displayName || leetcode.username}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      ● LIVE SYNCED
                    </span>
                  </div>
                  <a
                    href={`https://leetcode.com/${leetcode.username || profile?.displayName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#FFA116] hover:underline inline-flex items-center gap-1 mt-0.5 font-bold"
                  >
                    @{leetcode.username || profile?.displayName} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground">
                  Level 1 • Algorithmic Solver
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Metrics Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Problems Solved</span>
              <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">{totalSolved}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">DSA challenges</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Contest Rating</span>
              <div className="text-2xl font-extrabold text-[#FFA116] mt-1 tabular-nums">{contest?.rating ? Math.round(contest.rating) : "Active"}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Contest ranking</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Global Ranking</span>
              <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">
                {leetcodeData?.ranking ? (leetcodeData.ranking > 1000 ? `#${Math.round(leetcodeData.ranking / 1000)}k` : `#${leetcodeData.ranking}`) : "Top 15%"}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Worldwide standings</span>
            </Card>

            <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Badges</span>
              <div className="text-2xl font-extrabold text-foreground mt-1 tabular-nums">{badges.length || 1}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Earned achievements</span>
            </Card>
          </div>

          {/* Difficulty Breakdown & Curated Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-foreground">Difficulty Breakdown</h3>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-emerald-500">Easy ({easyCount})</span>
                    <span className="text-muted-foreground">Target: 50</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, (easyCount / 50) * 100))}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-amber-500">Medium ({mediumCount})</span>
                    <span className="text-muted-foreground">Target: 75</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(6, (mediumCount / 75) * 100))}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-rose-500">Hard ({hardCount})</span>
                    <span className="text-muted-foreground">Target: 25</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, (hardCount / 25) * 100))}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-foreground">Curated Interview Problems</h3>
                <span className="text-[10px] font-bold bg-[#FFA116]/10 text-[#FFA116] px-2 py-0.5 rounded-full">Top 75 DSA</span>
              </div>

              <div className="space-y-2">
                {[
                  { title: "Two Sum", diff: "Easy", color: "text-emerald-500", url: "https://leetcode.com/problems/two-sum/" },
                  { title: "Valid Anagram", diff: "Easy", color: "text-emerald-500", url: "https://leetcode.com/problems/valid-anagram/" },
                  { title: "3Sum", diff: "Medium", color: "text-amber-500", url: "https://leetcode.com/problems/3sum/" },
                  { title: "LRU Cache", diff: "Medium", color: "text-amber-500", url: "https://leetcode.com/problems/lru-cache/" },
                ].map((prob, i) => (
                  <a
                    key={i}
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl border border-border/50 bg-secondary/30 flex items-center justify-between text-xs hover:border-[#FFA116]/40 transition-colors group block"
                  >
                    <span className="font-bold text-foreground group-hover:text-[#FFA116] transition-colors">{prob.title}</span>
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
