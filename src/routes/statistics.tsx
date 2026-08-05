import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Code2,
  GitFork,
  Star,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics — SkillVerse" },
      {
        name: "description",
        content: "View your aggregated coding statistics from all platforms.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <StatisticsPage />
    </AuthGate>
  ),
});

function StatisticsPage() {
  const { profile, connections, syncAll } = useIdentityHub();

  const codingStats = profile?.codingStats || [];
  const totalProblems = codingStats.reduce(
    (sum, stat) => sum + (stat.problemsSolved || 0),
    0,
  );
  const totalStars = codingStats.reduce(
    (sum, stat) => sum + (stat.rating || 0),
    0,
  ); // Using rating as proxy for stars
  const avgRating =
    codingStats.length > 0
      ? Math.round(
          codingStats.reduce((sum, stat) => sum + (stat.rating || 0), 0) /
            codingStats.length,
        )
      : 0;

  const handleSync = async () => {
    await syncAll();
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Aggregated metrics from{" "}
              {connections.filter((c) => c.status === "connected").length}{" "}
              platforms
            </p>
          </div>
          <Button onClick={handleSync} variant="outline">
            Sync All Platforms
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Problems Solved
                </p>
                <p className="mt-2 text-3xl font-bold">{totalProblems}</p>
              </div>
              <Target className="h-8 w-8 text-brand" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Rating Points
                </p>
                <p className="mt-2 text-3xl font-bold">{totalStars}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Connected Platforms
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {connections.filter((c) => c.status === "connected").length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="mt-2 text-3xl font-bold">{avgRating}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Platform Stats */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Platform Statistics</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {codingStats.map((stat) => {
              const connection = connections.find(
                (c) => c.platform === stat.platform,
              );
              if (!connection || connection.status !== "connected") return null;

              return (
                <Card key={stat.platform} className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                      <Code2 className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {stat.platform}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{connection.username}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stat.problemsSolved !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Problems Solved
                        </span>
                        <span className="font-semibold">
                          {stat.problemsSolved}
                        </span>
                      </div>
                    )}
                    {stat.rating !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Rating
                        </span>
                        <span className="font-semibold">{stat.rating}</span>
                      </div>
                    )}
                    {stat.ranking !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Ranking
                        </span>
                        <span className="font-semibold">
                          #{stat.ranking.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {stat.languages && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Languages
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stat.languages)
                            .sort(
                              ([, a], [, b]) => (b as number) - (a as number),
                            )
                            .slice(0, 3)
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
                    {stat.difficultyBreakdown && (
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Difficulty
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-emerald-600">Easy</span>
                            <span className="font-semibold">
                              {stat.difficultyBreakdown.easy}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-600">Medium</span>
                            <span className="font-semibold">
                              {stat.difficultyBreakdown.medium}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-600">Hard</span>
                            <span className="font-semibold">
                              {stat.difficultyBreakdown.hard}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Profile Completion */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Award className="h-6 w-6 text-brand" />
            <h2 className="text-xl font-semibold">Profile Completion</h2>
          </div>
          <Progress value={profile?.profileCompletion || 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {profile?.profileCompletion || 0}% complete - Connect more platforms
            to improve your profile
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
