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
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand uppercase block mb-1">
            ANALYTICS
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Developer Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            A clear view of your coding progress, activity, and developer growth.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <Button
            onClick={handleSyncAll}
            disabled={activeSyncing}
            className="bg-brand text-brand-foreground hover:opacity-90 font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", activeSyncing && "animate-spin")} />
            {activeSyncing ? "Syncing..." : "Sync Data"}
          </Button>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last synced {formatRelativeTime(latestTimestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
