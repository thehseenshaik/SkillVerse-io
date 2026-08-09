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
import { RefreshCw, ExternalLink, Target, Trophy, Flame, Award, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  status: string;
  language: string;
  timestamp: number;
}

interface LeetCodeBadge {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
}

interface LeetCodeContest {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
}

interface LeetCodeProfile {
  displayName: string;
  avatar: string;
  bio: string | null;
  country: string | null;
  company: string | null;
  school: string | null;
  websites: string[] | null;
  ranking: number;
  reputation: number;
}

interface LeetCodeStats {
  Easy: number;
  Medium: number;
  Hard: number;
  All: number;
}

export function LeetCodeAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [contest, setContest] = useState<LeetCodeContest | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<LeetCodeSubmission[]>([]);
  const [badges, setBadges] = useState<LeetCodeBadge[]>([]);
  const [acceptanceRate, setAcceptanceRate] = useState<number>(0);

  useEffect(() => {
    if (user?.id) {
      loadLeetCodeData();
    }
  }, [user?.id]);

  const loadLeetCodeData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('leetcode');
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setStats(cachedData.stats);
        setContest(cachedData.contest);
        setRecentSubmissions(cachedData.recentSubmissions || []);
        setBadges(cachedData.badges || []);
        setAcceptanceRate(cachedData.acceptanceRate || 0);
      } else {
        await handleSync();
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
      await syncPlatform('leetcode');
      await loadLeetCodeData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync LeetCode data");
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-600";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-muted-foreground";
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
          <Button onClick={loadLeetCodeData} className="mt-4">
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
          <h3 className="text-lg font-semibold mb-2">LeetCode Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your LeetCode account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/connections'}>
            Connect LeetCode
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
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="h-16 w-16 rounded-xl border border-border/70 object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <a
              href={`https://leetcode.com/${profile.displayName}`}
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
            <div className="text-2xl font-bold">{stats?.All || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Global Ranking</span>
            </div>
            <div className="text-2xl font-bold">#{profile.ranking?.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Flame className="h-4 w-4" />
              <span className="text-sm">Contests</span>
            </div>
            <div className="text-2xl font-bold">{contest?.attendedContestsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <span className="text-sm">Badges</span>
            </div>
            <div className="text-2xl font-bold">{badges.length}</div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", getDifficultyColor("Easy"))}>
                    Easy
                  </span>
                  <span className="text-lg font-bold">{stats.Easy}</span>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", getDifficultyColor("Medium"))}>
                    Medium
                  </span>
                  <span className="text-lg font-bold">{stats.Medium}</span>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", getDifficultyColor("Hard"))}>
                    Hard
                  </span>
                  <span className="text-lg font-bold">{stats.Hard}</span>
                </div>
              </div>
            </div>
            {acceptanceRate > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Acceptance Rate: <span className="font-semibold text-foreground">{acceptanceRate.toFixed(2)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contest Performance */}
      {contest && contest.attendedContestsCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contest Performance</CardTitle>
            <CardDescription>Your competitive programming statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Rating</div>
                <div className="text-lg font-bold">{contest.rating}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="text-xs text-muted-foreground">Global Ranking</div>
                <div className="text-lg font-bold">#{contest.globalRanking?.toLocaleString()}</div>
              </div>
            </div>
            {contest.topPercentage > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Top <span className="font-semibold text-foreground">{contest.topPercentage.toFixed(2)}%</span> globally
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions ({recentSubmissions.length})</CardTitle>
            <CardDescription>Your latest problem submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {recentSubmissions.map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    {submission.status === "Accepted" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://leetcode.com/problems/${submission.titleSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sm hover:text-brand"
                    >
                      {submission.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {submission.language}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(submission.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges ({badges.length})</CardTitle>
            <CardDescription>Your earned achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3"
                >
                  <img
                    src={badge.icon}
                    alt={badge.displayName}
                    className="h-10 w-10 rounded"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {badge.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(new Date(badge.creationDate).getTime())}
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
