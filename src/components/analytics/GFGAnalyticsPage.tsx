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
import { RefreshCw, ExternalLink, Target, Flame, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GFGProfile {
  displayName: string;
  avatar: string | null;
  institute: string | null;
  instituteRank: string | null;
  currentStreak: string;
  maxStreak: string;
  codingScore: string;
  monthlyScore: string;
  totalProblemsSolved: string;
  languagesUsed: string | null;
}

interface GFGStats {
  school: number;
  basic: number;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

interface GFGSolvedQuestions {
  school: string[];
  basic: string[];
  easy: string[];
  medium: string[];
  hard: string[];
}

export function GFGAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GFGProfile | null>(null);
  const [stats, setStats] = useState<GFGStats | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<GFGSolvedQuestions | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadGFGData();
    }
  }, [user?.id]);

  const loadGFGData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('gfg');
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setStats(cachedData.stats);
        setSolvedQuestions(cachedData.solvedQuestions || null);
      } else {
        await handleSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GFG data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    
    setSyncing(true);
    setError(null);
    try {
      await syncPlatform('gfg');
      await loadGFGData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync GFG data");
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
          <Button onClick={loadGFGData} className="mt-4">
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
          <h3 className="text-lg font-semibold mb-2">GeeksforGeeks Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your GeeksforGeeks account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/identity-hub'}>
            Connect GFG
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
              href={`https://auth.geeksforgeeks.org/user/${profile.displayName}`}
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
              <Target className="h-4 w-4" />
              <span className="text-sm">Problems Solved</span>
            </div>
            <div className="text-2xl font-bold">{profile.totalProblemsSolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Coding Score</span>
            </div>
            <div className="text-2xl font-bold">{profile.codingScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Flame className="h-4 w-4" />
              <span className="text-sm">Current Streak</span>
            </div>
            <div className="text-2xl font-bold">{profile.currentStreak}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <span className="text-sm">Max Streak</span>
            </div>
            <div className="text-2xl font-bold">{profile.maxStreak}</div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
            <CardDescription>Your problem-solving progress by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">School</div>
                <div className="text-lg font-bold">{stats.school}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Basic</div>
                <div className="text-lg font-bold">{stats.basic}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Easy</div>
                <div className="text-lg font-bold">{stats.easy}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Medium</div>
                <div className="text-lg font-bold">{stats.medium}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Hard</div>
                <div className="text-lg font-bold">{stats.hard}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Institute Info */}
      {profile.institute && (
        <Card>
          <CardHeader>
            <CardTitle>Institute Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Institute</span>
                <span className="font-medium">{profile.institute}</span>
              </div>
              {profile.instituteRank && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Institute Rank</span>
                  <span className="font-medium">{profile.instituteRank}</span>
                </div>
              )}
              {profile.languagesUsed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Languages</span>
                  <span className="font-medium">{profile.languagesUsed}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Score */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{profile.monthlyScore}</div>
          <div className="text-sm text-muted-foreground">Monthly Coding Score</div>
        </CardContent>
      </Card>
    </div>
  );
}
