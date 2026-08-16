import { useState } from 'react';
import { usePlatformStore } from '@/lib/platform-store';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AnalyticsHeader({ 
  onSyncAll 
}: { 
  onSyncAll?: () => Promise<void>;
}) {
  const { user } = useAuth();
  const { 
    github, leetcode, gfg, codeforces, codechef, hackerrank,
    syncGitHub, syncLeetCode, syncGFG, syncCodeforces, syncCodeChef, syncHackerRank,
    fetchDashboardData, isSyncing 
  } = usePlatformStore();

  const [localSyncing, setLocalSyncing] = useState(false);

  // Compute overall last synced time
  const timestamps = [
    github.lastSynced,
    leetcode.lastSynced,
    gfg.lastSynced,
    codeforces.lastSynced,
    codechef.lastSynced,
    hackerrank.lastSynced,
  ].filter(Boolean) as string[];

  const latestTimestamp = timestamps.length > 0
    ? new Date(Math.max(...timestamps.map(t => new Date(t).getTime())))
    : null;

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'Not synced yet';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${Math.floor(diffHr / 24)} days ago`;
  };

  const handleSyncAll = async () => {
    if (!user?.id || localSyncing) return;
    setLocalSyncing(true);
    try {
      if (onSyncAll) {
        await onSyncAll();
      } else {
        const promises = [];
        if (github.connected) promises.push(syncGitHub(user.id));
        if (leetcode.connected) promises.push(syncLeetCode(user.id));
        if (gfg.connected) promises.push(syncGFG(user.id));
        if (codeforces.connected) promises.push(syncCodeforces(user.id));
        if (codechef.connected) promises.push(syncCodeChef(user.id));
        if (hackerrank.connected) promises.push(syncHackerRank(user.id));
        
        await Promise.allSettled(promises);
        await fetchDashboardData(user.id);
      }
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setLocalSyncing(false);
    }
  };

  const activeSyncing = isSyncing || localSyncing;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            DEVELOPER TELEMETRY
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Developer <span className="text-gradient">Analytics</span>.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Understand your progress, activity and career growth over time.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <Button
            onClick={handleSyncAll}
            disabled={activeSyncing}
            className="bg-brand text-brand-foreground hover:opacity-90 font-semibold px-4 py-2 h-10 rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", activeSyncing && "animate-spin")} />
            {activeSyncing ? "Syncing..." : "Sync Platforms"}
          </Button>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Last synced {formatRelativeTime(latestTimestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
