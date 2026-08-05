import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Calendar,
  Filter,
  Award,
  Medal,
  Star,
  Zap,
  ExternalLink,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — SkillVerse" },
      {
        name: "description",
        content:
          "View all your achievements from connected platforms in one place.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AchievementsPage />
    </AuthGate>
  ),
});

const iconMap = {
  badge: Award,
  certification: Trophy,
  milestone: Star,
  medal: Medal,
  recognition: Zap,
};

const typeColors = {
  badge: "bg-blue-500",
  certification: "bg-purple-500",
  milestone: "bg-yellow-500",
  medal: "bg-orange-500",
  recognition: "bg-green-500",
};

function AchievementsPage() {
  const { profile, connections, syncAll } = useIdentityHub();
  const [filter, setFilter] = useState<
    "all" | "badge" | "certification" | "milestone"
  >("all");

  const achievements = profile?.achievements.filter((a) => !a.isHidden) || [];
  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.type === filter);

  const groupedByYear = filteredAchievements.reduce(
    (acc, achievement) => {
      const year = achievement.date.getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(achievement);
      return acc;
    },
    {} as Record<number, typeof achievements>,
  );

  const sortedYears = Object.keys(groupedByYear).sort(
    (a, b) => Number(b) - Number(a),
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
            <h1 className="text-3xl font-bold">Achievement Center</h1>
            <p className="mt-2 text-muted-foreground">
              {achievements.length} achievements from{" "}
              {connections.filter((c) => c.status === "connected").length}{" "}
              platforms
            </p>
          </div>
          <Button onClick={handleSync} variant="outline">
            Sync All Platforms
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({achievements.length})
          </Button>
          <Button
            variant={filter === "badge" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("badge")}
          >
            Badges ({achievements.filter((a) => a.type === "badge").length})
          </Button>
          <Button
            variant={filter === "certification" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("certification")}
          >
            Certifications (
            {achievements.filter((a) => a.type === "certification").length})
          </Button>
          <Button
            variant={filter === "milestone" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("milestone")}
          >
            Milestones (
            {achievements.filter((a) => a.type === "milestone").length})
          </Button>
        </div>

        {/* Timeline */}
        {sortedYears.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Achievements Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Connect platforms and sync to load your achievements
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="mb-4 text-2xl font-bold">{year}</h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

                  {/* Achievement items */}
                  <div className="space-y-6 pl-12">
                    {groupedByYear[Number(year)]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((achievement) => {
                        const Icon = iconMap[achievement.type] || Trophy;
                        return (
                          <div key={achievement.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                              <div
                                className={`h-3 w-3 rounded-full ${typeColors[achievement.type]}`}
                              />
                            </div>

                            {/* Achievement card */}
                            <Card className="p-4 hover:bg-secondary/50 transition-colors">
                              <div className="flex items-start gap-4">
                                <div
                                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${typeColors[achievement.type]} text-white`}
                                >
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-semibold">
                                        {achievement.title}
                                      </h3>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {achievement.description}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="capitalize"
                                    >
                                      {achievement.source}
                                    </Badge>
                                  </div>
                                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {achievement.date.toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3" />
                                      {formatDistanceToNow(achievement.date, {
                                        addSuffix: true,
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
