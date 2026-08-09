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
import { RefreshCw, ExternalLink, Calendar, Star, GitFork, Users, BookMarked, Activity, TrendingUp } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface GitHubRepository {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  url: string;
  homepage: string | null;
  createdAt: string;
  updatedAt: string;
  topics: string[];
}

interface GitHubActivity {
  type: string;
  repo: string;
  createdAt: string;
}

interface GitHubProfile {
  displayName: string;
  avatar: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  website: string | null;
  email: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  profileUrl: string;
  joinedDate: string;
}

export function GitHubAnalyticsPage() {
  const { user } = useAuth();
  const { syncPlatform, getCachedPlatformData } = usePlatformDataService();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<GitHubActivity[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadGitHubData();
    }
  }, [user?.id]);

  const loadGitHubData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const cachedData = await getCachedPlatformData('github');
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setRepositories(cachedData.repositories || []);
        setLanguages(cachedData.languages || {});
        setRecentActivity(cachedData.recentActivity || []);
      } else {
        // Sync if no cached data
        await handleSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id) return;
    
    setSyncing(true);
    setError(null);
    try {
      await syncPlatform('github');
      await loadGitHubData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync GitHub data");
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PushEvent":
        return <Activity className="h-4 w-4" />;
      case "CreateEvent":
        return <BookMarked className="h-4 w-4" />;
      case "DeleteEvent":
        return <Users className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "PushEvent":
        return "Pushed to";
      case "CreateEvent":
        return "Created";
      case "DeleteEvent":
        return "Deleted";
      case "WatchEvent":
        return "Starred";
      case "ForkEvent":
        return "Forked";
      default:
        return type.replace("Event", "");
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
          <Button onClick={loadGitHubData} className="mt-4">
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
          <FaGithub className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">GitHub Not Connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your GitHub account to view detailed analytics
          </p>
          <Button onClick={() => window.location.href = '/connections'}>
            Connect GitHub
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
              href={profile.profileUrl}
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
              <BookMarked className="h-4 w-4" />
              <span className="text-sm">Repositories</span>
            </div>
            <div className="text-2xl font-bold">{profile.publicRepos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Followers</span>
            </div>
            <div className="text-2xl font-bold">{profile.followers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Following</span>
            </div>
            <div className="text-2xl font-bold">{profile.following}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Joined</span>
            </div>
            <div className="text-2xl font-bold">
              {new Date(profile.joinedDate).getFullYear()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Languages */}
      {Object.keys(languages).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Your most used programming languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary">
                {Object.entries(languages)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([lang, count]) => {
                    const total = Object.values(languages).reduce((a, b) => a + b, 0);
                    const pct = ((count as number) / total) * 100;
                    return (
                      <div
                        key={lang}
                        style={{ width: `${pct}%` }}
                        className="bg-brand"
                        title={`${lang}: ${pct.toFixed(1)}%`}
                      />
                    );
                  })}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(languages)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([lang, count]) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium"
                    >
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      {lang} <span className="text-muted-foreground">({count})</span>
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repositories */}
      {repositories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Repositories ({repositories.length})</CardTitle>
            <CardDescription>Your public repositories sorted by recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {repositories.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-4 hover:border-brand/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold hover:text-brand"
                    >
                      {repo.name}
                    </a>
                    {repo.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {repo.language && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                          {repo.language}
                        </span>
                      )}
                      {repo.topics.length > 0 &&
                        repo.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="text-xs text-muted-foreground"
                          >
                            #{topic}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3" /> {repo.stars}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="h-3 w-3" /> {repo.forks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest contributions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {getActivityLabel(activity.type)}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {activity.repo}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </p>
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
