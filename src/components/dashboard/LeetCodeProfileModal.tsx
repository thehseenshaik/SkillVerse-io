import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  Trophy,
  Flame,
  Award,
  ExternalLink,
  MapPin,
  Building2,
  School,
  Globe,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Code,
} from "lucide-react";
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

interface LeetCodeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  uid: string;
}

export function LeetCodeProfileModal({
  isOpen,
  onClose,
  username,
  uid,
}: LeetCodeProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [contest, setContest] = useState<LeetCodeContest | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<LeetCodeSubmission[]>([]);
  const [badges, setBadges] = useState<LeetCodeBadge[]>([]);
  const [acceptanceRate, setAcceptanceRate] = useState<number>(0);

  useEffect(() => {
    if (isOpen && username && uid) {
      fetchLeetCodeData();
    }
  }, [isOpen, username, uid]);

  const fetchLeetCodeData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, trigger a sync to get fresh data
      const syncResponse = await fetch("http://localhost:3001/api/leetcode/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync LeetCode data");
      }

      // Then fetch the cached data from Firestore
      const userResponse = await fetch(`http://localhost:3001/api/user/${uid}`);
      
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      
      const cachedData = userData.cachedData?.leetcode;
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setStats(cachedData.stats);
        setContest(cachedData.contest);
        setRecentSubmissions(cachedData.recentSubmissions || []);
        setBadges(cachedData.badges || []);
        setAcceptanceRate(cachedData.acceptanceRate || 0);
      } else {
        throw new Error("No LeetCode data found. Please sync your account first.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load LeetCode data");
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    return status === "Accepted" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand" />
            LeetCode Profile
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="h-20 w-20 rounded-xl border border-border/70 object-cover"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{profile.displayName}</h2>
                <a
                  href={`https://leetcode.com/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
                >
                  @{username} <ExternalLink className="h-3 w-3" />
                </a>
                {profile.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Target className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">
                  {stats?.All || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Solved
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Trophy className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">
                  #{profile.ranking?.toLocaleString() || "N/A"}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Ranking
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Flame className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">
                  {contest?.attendedContestsCount || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Contests
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Award className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">
                  {badges.length}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Badges
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-2">
              {profile.country && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.country}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.school && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <School className="h-4 w-4" />
                  <span>{profile.school}</span>
                </div>
              )}
              {profile.websites && profile.websites.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.websites[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand"
                  >
                    {profile.websites[0]}
                  </a>
                </div>
              )}
            </div>

            {/* Difficulty Breakdown */}
            {stats && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Difficulty Breakdown</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", getDifficultyColor("Easy"))}>
                        Easy
                      </span>
                      <span className="text-lg font-bold">{stats.Easy}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", getDifficultyColor("Medium"))}>
                        Medium
                      </span>
                      <span className="text-lg font-bold">{stats.Medium}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", getDifficultyColor("Hard"))}>
                        Hard
                      </span>
                      <span className="text-lg font-bold">{stats.Hard}</span>
                    </div>
                  </div>
                </div>
                {acceptanceRate > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Acceptance Rate: <span className="font-semibold text-foreground">{acceptanceRate.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Contest Stats */}
            {contest && contest.attendedContestsCount > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Contest Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <div className="text-lg font-bold">{contest.rating}</div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <div className="text-xs text-muted-foreground">Global Ranking</div>
                    <div className="text-lg font-bold">#{contest.globalRanking?.toLocaleString()}</div>
                  </div>
                </div>
                {contest.topPercentage > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Top <span className="font-semibold text-foreground">{contest.topPercentage.toFixed(2)}%</span> globally
                  </div>
                )}
              </div>
            )}

            {/* Recent Submissions */}
            {recentSubmissions.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Recent Submissions ({recentSubmissions.length})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {recentSubmissions.map((submission, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                        {getStatusIcon(submission.status)}
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
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Badges ({badges.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
