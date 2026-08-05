import { Trophy, Award, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { formatDistanceToNow } from "date-fns";

interface IdentityHubAchievementsWidgetProps {
  className?: string;
}

const iconMap = {
  badge: Award,
  certification: Trophy,
  milestone: Star,
  medal: Zap,
  recognition: Trophy,
};

export function IdentityHubAchievementsWidget({
  className,
}: IdentityHubAchievementsWidgetProps) {
  const { profile, connections } = useIdentityHub();

  const connectedPlatforms = connections.filter(
    (c) => c.status === "connected",
  );
  const achievements = profile?.achievements.filter((a) => !a.isHidden) || [];
  const recentAchievements = achievements.slice(0, 4);

  if (connectedPlatforms.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 font-semibold">No Platforms Connected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect platforms to see your achievements
          </p>
        </div>
      </Card>
    );
  }

  if (recentAchievements.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 font-semibold">No Achievements Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sync your platforms to load achievements
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Recent Achievements</h3>
        <p className="text-sm text-muted-foreground">
          {achievements.length} total achievements
        </p>
      </div>

      <div className="space-y-3">
        {recentAchievements.map((achievement) => {
          const Icon = iconMap[achievement.type] || Trophy;
          return (
            <div
              key={achievement.id}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {achievement.source.charAt(0).toUpperCase() +
                    achievement.source.slice(1)}{" "}
                  • {formatDistanceToNow(achievement.date, { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
