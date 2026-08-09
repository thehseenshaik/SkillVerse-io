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
import { RefreshCw, ExternalLink, Target, Trophy, TrendingUp, Users, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeforcesProfile {
  displayName: string;
  avatar: string | null;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  country: string | null;
  city: string | null;
  organization: string | null;
  contribution: number;
  friendOfCount: number;
}

interface CodeforcesRatingChange {
  contestId: number;
  contestName: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export function CodeforcesAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CodeforcesProfile | null>(null);
  const [ratingHistory, setRatingHistory] = useState<CodeforcesRatingChange[]>([]);
  const [totalContests, setTotalContests] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadCodeforcesData();
    }
  }, [user?.id]);

  const loadCodeforcesData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('codeforces');
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setRatingHistory(cachedData.ratingHistory || []);
        setTotalContests(cachedData.totalContests || 0);
      } else {
        await handleSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Codeforces data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    
    setSyncing(true);
    setError(null);
    try {
      await syncPlatform('codeforces');
      await loadCodeforcesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync Codeforces data");
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return "text-red-600";
    if (rating >= 2100) return "text-orange-600";
    if (rating >= 1900) return "text-purple-600";
    if (rating >= 1600) return "text-blue-600";
    if (rating >= 1400) return "text-cyan-600";
    if (rating >= 1200) return "text-green-600";
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
          <Button onClick={loadCodeforcesData} className="mt-4">
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
          <h3 className="text-lg font-semibold mb-2">Codeforces Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your Codeforces account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/connections'}>
            Connect Codeforces
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
              href={`https://codeforces.com/profile/${profile.displayName}`}
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
            <div className={cn("text-2xl font-bold", getRatingColor(profile.rating))}>
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">{profile.rank}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <span className="text-sm">Max Rating</span>
            </div>
            <div className={cn("text-2xl font-bold", getRatingColor(profile.maxRating))}>
              {profile.maxRating}
            </div>
            <div className="text-xs text-muted-foreground">{profile.maxRank}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Contests</span>
            </div>
            <div className="text-2xl font-bold">{totalContests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Friends</span>
            </div>
            <div className="text-2xl font-bold">{profile.friendOfCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profile.organization && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-medium">{profile.organization}</span>
              </div>
            )}
            {profile.country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium">{profile.country}</span>
              </div>
            )}
            {profile.city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium">{profile.city}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contribution</span>
              <span className="font-medium">{profile.contribution}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating History */}
      {ratingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating History</CardTitle>
            <CardDescription>Your recent contest performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {ratingHistory.slice().reverse().map((change, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{change.contestName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(change.ratingUpdateTimeSeconds)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-muted-foreground">
                      {change.oldRating}
                    </div>
                    <div className={cn(
                      "font-semibold",
                      change.newRating > change.oldRating ? "text-emerald-600" : "text-red-600"
                    )}>
                      {change.newRating > change.oldRating ? "+" : ""}
                      {change.newRating - change.oldRating}
                    </div>
                    <div className={cn("font-semibold", getRatingColor(change.newRating))}>
                      {change.newRating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
