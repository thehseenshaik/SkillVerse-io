/**
 * Weekly Progress Widget
 * Displays progress cards only for connected platforms
 */

import { TrendingUp, ArrowUp, ArrowDown, Minus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from "react-icons/si";
import type { Platform } from "@/types/identity-hub";
import { getPlatformConfig } from "@/lib/connectors/platform-config";

interface PlatformProgress {
  platform: Platform;
  metric: string;
  value: string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  period: string;
}

interface WeeklyProgressProps {
  progressData: PlatformProgress[];
  className?: string;
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

const changeIcons = {
  increase: ArrowUp,
  decrease: ArrowDown,
  neutral: Minus,
};

const changeColors = {
  increase: "text-emerald-500",
  decrease: "text-rose-500",
  neutral: "text-muted-foreground",
};

export function WeeklyProgress({
  progressData,
  className,
  onPlatformClick,
}: WeeklyProgressProps) {
  if (progressData.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Weekly Progress</h3>
        <p className="text-sm text-muted-foreground">
          Your performance this week
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4",
          progressData.length === 1 && "grid-cols-1",
          progressData.length === 2 && "grid-cols-1 sm:grid-cols-2",
          progressData.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {progressData.map((progress) => {
          const config = getPlatformConfig(progress.platform);
          const Icon = platformIcons[progress.platform];
          const ChangeIcon = changeIcons[progress.changeType];
          const colorClass = changeColors[progress.changeType];

          return (
            <button
              key={progress.platform}
              onClick={() => onPlatformClick?.(progress.platform)}
              className="group flex items-start gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4 text-left transition-all hover:border-brand/50 hover:bg-secondary/50"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: config.color }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{config.name}</h4>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      colorClass
                    )}
                  >
                    <ChangeIcon className="h-3 w-3" />
                    {progress.change > 0 ? "+" : ""}
                    {progress.change}%
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-2xl font-bold">{progress.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {progress.metric}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {progress.period}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
