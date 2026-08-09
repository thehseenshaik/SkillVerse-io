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
import { RefreshCw, ExternalLink, Target, Trophy, Award, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeChefProfile {
  displayName: string;
  avatar: string | null;
  currentRating: number;
  highestRating: number;
  countryFlag: string | null;
  countryName: string | null;
  globalRank: number;
  countryRank: number;
  stars: string | null;
}

export function CodeChefAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CodeChefProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadCodeChefData();
    }
  }, [user?.id]);

  const loadCodeChefData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('codechef');
      
      if (cachedData) {
        setProfile(cachedData.profile);
      } else {
        await handleSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CodeChef data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    
    setSyncing(true);
    setError(null);
    try {
      await syncPlatform('codechef');
      await loadCodeChefData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync CodeChef data");
    } finally {
      setSyncing(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return "text-red-600";
    if (rating >= 2000) return "text-orange-600";
    if (rating >= 1800) return "text-yellow-600";
    if (rating >= 1600) return "text-purple-600";
    if (rating >= 1400) return "text-blue-600";
    return "text-gray-600";
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
          <Button onClick={loadCodeChefData} className="mt-4">
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
          <h3 className="text-lg font-semibold mb-2">CodeChef Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your CodeChef account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/connections'}>
            Connect CodeChef
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
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName}
              className="h-16 w-16 rounded-xl border border-border/70 object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl border border-border/70 bg-secondary flex items-center justify-center">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <a
              href={`https://www.codechef.com/users/${profile.displayName}`}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Current Rating</span>
            </div>
            <div className={cn("text-2xl font-bold", getRatingColor(profile.currentRating))}>
              {profile.currentRating}
            </div>
            {profile.stars && (
              <div className="text-xs text-muted-foreground">{profile.stars}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <span className="text-sm">Highest Rating</span>
            </div>
            <div className={cn("text-2xl font-bold", getRatingColor(profile.highestRating))}>
              {profile.highestRating}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Global Rank</span>
            </div>
            <div className="text-2xl font-bold">#{profile.globalRank.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Country Rank</span>
            </div>
            <div className="text-2xl font-bold">#{profile.countryRank.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Country Info */}
      {profile.countryName && (
        <Card>
          <CardHeader>
            <CardTitle>Country Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {profile.countryFlag && (
                <span className="text-2xl">{profile.countryFlag}</span>
              )}
              <span className="font-medium">{profile.countryName}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
