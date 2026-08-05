import { Trophy, Award, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "award" | "star" | "zap";
  unlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementsWidgetProps {
  achievements?: Achievement[];
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  award: Award,
  star: Star,
  zap: Zap,
};

export function AchievementsWidget({
  achievements = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your profile setup",
      icon: "star",
      unlocked: true,
    },
    {
      id: "2",
      title: "Code Warrior",
      description: "Solve 50 DSA problems",
      icon: "zap",
      unlocked: true,
    },
    {
      id: "3",
      title: "Resume Ready",
      description: "Generate your first resume",
      icon: "award",
      unlocked: false,
    },
    {
      id: "4",
      title: "Interview Master",
      description: "Complete 10 mock interviews",
      icon: "trophy",
      unlocked: false,
    },
  ],
  className,
}: AchievementsWidgetProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Achievements</h3>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon];
          return (
            <div
              key={achievement.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                achievement.unlocked
                  ? "border-brand/20 bg-brand/5"
                  : "border-border bg-muted/30 opacity-60",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  achievement.unlocked
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
