import { GitFork, Star, Code2, GitCommit, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useNavigate } from "@tanstack/react-router";
import type { CodingStats } from "@/types/identity-hub";

interface GitHubStatsWidgetProps {
  className?: string;
}

export function GitHubStatsWidget({ className }: GitHubStatsWidgetProps) {
  const { profile, connections } = useIdentityHub();
  const navigate = useNavigate();

  const githubConnection = connections.find((c) => c.platform === "github");
  const githubStats = profile?.codingStats.find((s) => s.platform === "github");

  if (!githubConnection || githubConnection.status !== "connected") {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Code2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 font-semibold">GitHub Not Connected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your GitHub account to see your stats
          </p>
        </div>
      </Card>
    );
  }

  const repoCount = githubStats?.languages
    ? Object.keys(githubStats.languages).length
    : 0;
  const totalStars = githubStats?.languages
    ? Object.values(githubStats.languages).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Card 
      className={cn("p-6 cursor-pointer hover:border-brand/50 transition-colors", className)}
      onClick={() => navigate({ to: "/analytics/github" })}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">GitHub Stats</h3>
          <p className="text-sm text-muted-foreground">
            @{githubConnection.username}
          </p>
        </div>
        <a
          href={`https://github.com/${githubConnection.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code2 className="h-4 w-4" />
            <span className="text-xs">Repositories</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{repoCount}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-xs">Stars</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{totalStars}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitFork className="h-4 w-4" />
            <span className="text-xs">Forks</span>
          </div>
          <div className="mt-2 text-2xl font-bold">0</div>
        </div>
      </div>

      {githubStats?.languages &&
        Object.keys(githubStats.languages).length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold">Top Languages</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(githubStats.languages)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([lang, count]) => (
                  <span
                    key={lang}
                    className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
                  >
                    {lang}
                  </span>
                ))}
            </div>
          </div>
        )}
    </Card>
  );
}
