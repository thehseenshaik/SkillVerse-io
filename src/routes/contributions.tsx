import { createFileRoute } from "@tanstack/react-router";
import { GitCommit, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const Route = createFileRoute("/contributions")({
  head: () => ({
    meta: [
      { title: "Contributions — SkillVerse" },
      {
        name: "description",
        content: "View your contribution activity from all platforms.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ContributionsPage />
    </AuthGate>
  ),
});

function ContributionsPage() {
  const { profile, connections, syncAll } = useIdentityHub();

  const contributions = profile?.contributions || [];

  // Group contributions by date
  const contributionsByDate = contributions.reduce(
    (acc, contribution) => {
      const dateKey = format(contribution.date, "yyyy-MM-dd");
      if (!acc[dateKey])
        acc[dateKey] = {
          date: contribution.date,
          count: 0,
          platforms: new Set(),
        };
      acc[dateKey].count += contribution.count;
      acc[dateKey].platforms.add(contribution.platform);
      return acc;
    },
    {} as Record<string, { date: Date; count: number; platforms: Set<string> }>,
  );

  const sortedContributions = Object.values(contributionsByDate)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 30); // Last 30 days

  // Calculate total contributions
  const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);

  // Contributions by platform
  const contributionsByPlatform = contributions.reduce(
    (acc, contribution) => {
      if (!acc[contribution.platform]) acc[contribution.platform] = 0;
      acc[contribution.platform] += contribution.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleSync = async () => {
    await syncAll();
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contribution Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              {totalContributions} total contributions from{" "}
              {connections.filter((c) => c.status === "connected").length}{" "}
              platforms
            </p>
          </div>
          <Button onClick={handleSync} variant="outline">
            Sync All Platforms
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Contributions
                </p>
                <p className="mt-2 text-3xl font-bold">{totalContributions}</p>
              </div>
              <GitCommit className="h-8 w-8 text-brand" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="mt-2 text-3xl font-bold">
                  {sortedContributions.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Day</p>
                <p className="mt-2 text-3xl font-bold">
                  {sortedContributions.length > 0
                    ? Math.round(
                        totalContributions / sortedContributions.length,
                      )
                    : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Contributions by Platform */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            Contributions by Platform
          </h2>
          <Card className="p-6">
            <div className="space-y-4">
              {Object.entries(contributionsByPlatform).map(
                ([platform, count]) => {
                  const connection = connections.find(
                    (c) => c.platform === platform,
                  );
                  const maxCount = Math.max(
                    ...Object.values(contributionsByPlatform),
                  );
                  const percentage = (count / maxCount) * 100;

                  return (
                    <div key={platform}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize">
                            {platform}
                          </span>
                          {connection && (
                            <span className="text-sm text-muted-foreground">
                              @{connection.username}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-brand transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <Card className="p-6">
            {sortedContributions.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">
                  No Contributions Yet
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Connect platforms and sync to load your contribution data
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedContributions.map((item) => (
                  <div
                    key={format(item.date, "yyyy-MM-dd")}
                    className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
                        <GitCommit className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {format(item.date, "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Array.from(item.platforms)
                            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {item.count} contributions
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
