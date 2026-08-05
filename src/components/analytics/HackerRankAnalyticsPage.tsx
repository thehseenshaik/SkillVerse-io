import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePlatformDataService } from "@/lib/services/platform-data-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface HackerRankProfile {
  displayName: string;
  avatar: string | null;
}

interface HackerRankStats {
  // HackerRank stats structure varies based on API response
  [key: string]: any;
}

export function HackerRankAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<HackerRankProfile | null>(null);
  const [stats, setStats] = useState<HackerRankStats | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadHackerRankData();
    }
  }, [user?.id]);

  const loadHackerRankData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('hackerrank');
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setStats(cachedData.stats || null);
      } else {
        await handleSync();
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
      await syncPlatform('hackerrank');
      await loadHackerRankData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync HackerRank data");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadHackerRankData} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Target className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">HackerRank Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your HackerRank account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/identity-hub'}>
            Connect HackerRank
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border border-border/70 bg-secondary flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <a
              href={`https://hackerrank.com/${profile.displayName}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
            >
              @{profile.displayName} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Syncing..." : "Sync Data"}
        </Button>
      </div>

      {/* Stats Display */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>HackerRank Statistics</CardTitle>
            <CardDescription>Your coding challenge performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats).map(([key, value]) => {
                if (typeof value === 'object' || value === null) return null;
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About HackerRank Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            HackerRank provides coding challenges across various domains. 
            Connect your account to track your problem-solving progress, badges, and certifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
