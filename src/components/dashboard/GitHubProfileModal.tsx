import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaGithub } from "react-icons/fa";
import {
  Star,
  GitFork,
  Users,
  BookMarked,
  ExternalLink,
  Clock,
  MapPin,
  Building2,
  Globe,
  Mail,
  Calendar,
  Code,
  Activity,
  X,
} from "lucide-react";
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

interface GitHubProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  uid: string;
}

export function GitHubProfileModal({
  isOpen,
  onClose,
  username,
  uid,
}: GitHubProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [recentActivity, setRecentActivity] = useState<GitHubActivity[]>([]);

  useEffect(() => {
    if (isOpen && username && uid) {
      fetchGitHubData();
    }
  }, [isOpen, username, uid]);

  const fetchGitHubData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
      // First, trigger a sync to get fresh data
      const syncResponse = await fetch(`${API_BASE}/api/github/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync GitHub data");
      }

      // Then fetch the cached data from backend
      const userResponse = await fetch(`${API_BASE}/api/user/${uid}`);
      
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      
      const cachedData = userData?.cachedData?.github;
      
      if (cachedData) {
        setProfile(cachedData.profile);
        setRepositories(cachedData.repositories || []);
        setLanguages(cachedData.languages || {});
        setRecentActivity(cachedData.recentActivity || []);
      } else {
        throw new Error("No GitHub data found. Please sync your account first.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub data");
    } finally {
      setLoading(false);
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
        return <Code className="h-4 w-4" />;
      case "CreateEvent":
        return <BookMarked className="h-4 w-4" />;
      case "DeleteEvent":
        return <X className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaGithub className="h-5 w-5" />
            GitHub Profile
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
                  href={profile.profileUrl}
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
                <BookMarked className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">{profile.publicRepos}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Repos
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">{profile.followers}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Followers
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">{profile.following}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Following
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-center">
                <Calendar className="mx-auto h-4 w-4 text-muted-foreground" />
                <div className="mt-1 text-lg font-bold">
                  {new Date(profile.joinedDate).getFullYear()}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Joined
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-2">
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="hover:text-brand"
                  >
                    {profile.email}
                  </a>
                </div>
              )}
            </div>

            {/* Languages */}
            {Object.keys(languages).length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Languages</h3>
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
            )}

            {/* Repositories */}
            {repositories.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Repositories ({repositories.length})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {repositories.map((repo) => (
                    <div
                      key={repo.name}
                      className="rounded-lg border border-border/60 bg-background/40 p-3 hover:border-brand/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-sm hover:text-brand"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {repo.language && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                                {repo.language}
                              </span>
                            )}
                            {repo.topics.length > 0 &&
                              repo.topics.slice(0, 3).map((topic) => (
                                <span
                                  key={topic}
                                  className="text-[10px] text-muted-foreground"
                                >
                                  #{topic}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3 w-3" /> {repo.stars}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <GitFork className="h-3 w-3" /> {repo.forks}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Recent Activity</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
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
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
