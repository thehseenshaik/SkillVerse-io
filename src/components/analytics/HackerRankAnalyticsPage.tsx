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
  Award,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HackerRankAnalyticsPage() {
  const { user } = useAuth();
  const {
    hackerrank,
    hackerrankData,
    connectHackerRank,
    syncHackerRank,
    validateHackerRankUsername,
    fetchDashboardData,
  } = usePlatformStore();
  const { getCachedPlatformData } = usePlatformDataService();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectUsername, setConnectUsername] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [data, setData] = useState<any>(hackerrankData || null);

  useEffect(() => {
    if (hackerrankData) {
      setData(hackerrankData);
    } else if (user?.id) {
      loadData();
    }
  }, [user?.id, hackerrankData]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await fetchDashboardData(user.id);
      const cached = await getCachedPlatformData("hackerrank");
      if (cached) {
        setData(cached);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load HackerRank data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await syncHackerRank(user.id);
      await fetchDashboardData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync HackerRank data");
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
      await validateHackerRankUsername(connectUsername.trim());
      await connectHackerRank(user.id, connectUsername.trim());
      await fetchDashboardData(user.id);
      setConnectUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect HackerRank handle");
    } finally {
      setConnecting(false);
    }
  };

  const profile = data?.profile || hackerrankData?.profile;
  const badges = data?.badges || hackerrankData?.badges || [];
  const certificates = data?.certificates || hackerrankData?.certificates || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Analytics
        </Link>

        {hackerrank.connected && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="rounded-xl border-border text-xs gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync HackerRank"}
          </Button>
        )}
      </div>

      {!hackerrank.connected && !profile && (
        <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <Award className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Connect Your HackerRank Profile</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Enter your HackerRank username to sync your domain badges, problem solving stars, and skill certificates.
            </p>
          </div>

          <form onSubmit={handleConnect} className="flex max-w-xs mx-auto gap-2 mt-4">
            <Input
              placeholder="HackerRank Username"
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

      {loading && !profile && (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">Loading HackerRank analytics...</p>
        </div>
      )}

      {profile && (
        <>
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar || `https://hrcdn.net/fst/assets/brand/h_mark_sm.png`}
                alt={profile.displayName || hackerrank.username || "HackerRank Profile"}
                className="h-16 w-16 rounded-2xl border border-border object-cover bg-secondary p-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{profile.displayName || hackerrank.username}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    CONNECTED
                  </span>
                </div>
                <a
                  href={`https://www.hackerrank.com/profile/${hackerrank.username || profile.displayName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
                >
                  @{hackerrank.username || profile.displayName} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Domain Badges</span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">{badges.length}</div>
            </Card>

            <Card className="border border-border bg-card p-4 rounded-xl shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Skill Certificates</span>
              <div className="text-2xl font-bold text-foreground mt-1">{certificates.length}</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
