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
  Code2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      const cached = await getCachedPlatformData("leetcode");
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
  const recentSubmissions = data?.recentSubmissions || leetcodeData?.recentSubmissions || [];
  const badges = data?.badges || leetcodeData?.badges || [];

  const easyCount = stats.Easy || 0;
  const mediumCount = stats.Medium || 0;
  const hardCount = stats.Hard || 0;
  const totalSolved = stats.All || (easyCount + mediumCount + hardCount);

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

        {leetcode.connected && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="rounded-xl border-border text-xs gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync LeetCode"}
          </Button>
        )}
      </div>

      {/* Disconnected State */}
      {!leetcode.connected && !profile && (
        <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Code2 className="h-6 w-6 text-amber-500" />
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
              className="bg-background border-border text-xs"
            />
            <Button type="submit" disabled={connecting || !connectUsername.trim()} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shrink-0">
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Connect"}
            </Button>
          </form>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs text-muted-foreground">Loading LeetCode analytics...</p>
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
                  src={profile.avatar || "https://assets.leetcode.com/users/avatars/avatar_1.png"}
                  alt={profile.displayName || leetcode.username || "LeetCode Profile"}
                  className="h-16 w-16 rounded-2xl border border-border object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{profile.displayName || leetcode.username}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      CONNECTED
                    </span>
                  </div>
                  <a
                    href={`https://leetcode.com/${leetcode.username || profile.displayName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-500 hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
                  >
                    @{leetcode.username || profile.displayName} <ExternalLink className="h-3 w-3" />
                  </a>
                  {profile.ranking > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Global Rank: <span className="font-semibold text-foreground">#{profile.ranking.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Metrics Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Problems Solved</span>
              <div className="text-2xl font-bold text-foreground mt-1">{totalSolved}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Contest Rating</span>
              <div className="text-2xl font-bold text-amber-500 mt-1">{contest?.rating ? Math.round(contest.rating) : "N/A"}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Contests</span>
              <div className="text-2xl font-bold text-foreground mt-1">{contest?.attendedContestsCount || 0}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Badges</span>
              <div className="text-2xl font-bold text-foreground mt-1">{badges.length}</div>
            </Card>
          </div>

          {/* Difficulty Breakdown & Recent Submissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem Difficulty Breakdown */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">Difficulty Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-500 font-medium">Easy</span>
                    <span className="text-foreground font-semibold">{easyCount}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (easyCount / 400) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-500 font-medium">Medium</span>
                    <span className="text-foreground font-semibold">{mediumCount}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (mediumCount / 400) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-500 font-medium">Hard</span>
                    <span className="text-foreground font-semibold">{hardCount}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (hardCount / 200) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Submissions */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-base text-foreground mb-4">Recent Submissions</h3>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {recentSubmissions.slice(0, 6).map((sub: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/50 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {sub.status === "Accepted" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <a href={`https://leetcode.com/problems/${sub.titleSlug}/`} target="_blank" rel="noreferrer" className="font-medium text-foreground hover:text-amber-500 truncate">
                          {sub.title}
                        </a>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground shrink-0 ml-2">
                        {sub.language}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-6 text-center">No recent submissions synchronized.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
