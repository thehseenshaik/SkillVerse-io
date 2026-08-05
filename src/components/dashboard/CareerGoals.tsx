/**
 * Career Goals Widget
 * Shows adaptive goals based on connected platforms
 */

import { Target, CheckCircle2, Circle, Plus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from "react-icons/si";
import type { Platform } from "@/types/identity-hub";
import { getPlatformConfig } from "@/lib/connectors/platform-config";

interface CareerGoal {
  id: string;
  title: string;
  completed: boolean;
  platform: Platform;
  deadline?: Date;
}

interface CareerGoalsProps {
  goals: CareerGoal[];
  className?: string;
  onToggleGoal?: (id: string) => void;
  onAddGoal?: () => void;
  onPlatformClick?: (platform: Platform) => void;
}

const platformIcons: Record<Platform, any> = {
  github: FaGithub,
  leetcode: SiLeetcode,
  codeforces: SiCodeforces,
  codechef: SiCodechef,
  hackerrank: SiHackerrank,
  gfg: SiCodeforces,
  kaggle: SiCodeforces,
  linkedin: FaGithub,
  medium: FaGithub,
  devto: FaGithub,
  portfolio: FaGithub,
};

export function CareerGoals({
  goals,
  className,
  onToggleGoal,
  onAddGoal,
  onPlatformClick,
}: CareerGoalsProps) {
  if (goals.length === 0) {
    return null;
  }

  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // Group goals by platform
  const goalsByPlatform = goals.reduce((acc, goal) => {
    if (!acc[goal.platform]) {
      acc[goal.platform] = [];
    }
    acc[goal.platform].push(goal);
    return acc;
  }, {} as Record<Platform, CareerGoal[]>);

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Career Goals</h3>
          <p className="text-sm text-muted-foreground">
            {completed} of {total} completed
          </p>
        </div>
        {onAddGoal && (
          <Button size="icon" variant="ghost" onClick={onAddGoal}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="space-y-4">
        {Object.entries(goalsByPlatform).map(([platform, platformGoals]) => {
          const config = getPlatformConfig(platform as Platform);
          const Icon = platformIcons[platform as Platform];
          const platformCompleted = platformGoals.filter((g) => g.completed).length;
          const platformTotal = platformGoals.length;

          return (
            <div
              key={platform}
              className="rounded-lg border border-border/50 bg-secondary/30 p-4"
            >
              <button
                onClick={() => onPlatformClick?.(platform as Platform)}
                className="mb-3 flex items-center gap-2 w-full text-left"
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: config.color }}
                />
                <span className="font-semibold">{config.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({platformCompleted}/{platformTotal})
                </span>
              </button>

              <ul className="space-y-2">
                {platformGoals.map((goal) => (
                  <li
                    key={goal.id}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
                  >
                    <button
                      onClick={() => onToggleGoal?.(goal.id)}
                      className="flex-shrink-0 mt-0.5"
                      aria-label={
                        goal.completed ? "Mark as incomplete" : "Mark as complete"
                      }
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-sm",
                          goal.completed && "text-muted-foreground line-through"
                        )}
                      >
                        {goal.title}
                      </span>
                      {goal.deadline && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {goal.deadline.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
