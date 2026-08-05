/**
 * Unified Activity Feed Widget
 * Merges activity from all connected platforms into a single timeline
 */

import { GitCommit, Code, Trophy, FileText, MessageSquare, Star, Flame, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import type { Platform } from "@/types/identity-hub";
import { getPlatformConfig } from "@/lib/connectors/platform-config";

interface UnifiedActivity {
  id: string;
  type: "commit" | "problem_solved" | "contest" | "badge" | "article" | "repository" | "streak" | "other";
  title: string;
  description: string;
  timestamp: Date;
  platform: Platform;
  url?: string;
}

interface UnifiedActivityFeedProps {
  activities: UnifiedActivity[];
  className?: string;
  onActivityClick?: (activity: UnifiedActivity) => void;
}

const activityIcons: Record<string, any> = {
  commit: GitCommit,
  problem_solved: Code,
  contest: Trophy,
  badge: Star,
  article: FileText,
  repository: FaGithub,
  streak: Flame,
  other: MessageSquare,
};

const platformIcons: Record<Platform, any> = {
  github: FaGithub,
  leetcode: SiLeetcode,
  codeforces: SiCodeforces,
  gfg: SiCodeforces,
  hackerrank: SiCodeforces,
  codechef: SiCodeforces,
  kaggle: SiCodeforces,
  linkedin: FaGithub,
  medium: FaGithub,
  devto: FaGithub,
  portfolio: FaGithub,
};

const typeColors: Record<string, string> = {
  commit: "text-emerald-500",
  problem_solved: "text-brand",
  contest: "text-accent-2",
  badge: "text-amber-500",
  article: "text-blue-500",
  repository: "text-purple-500",
  streak: "text-rose-500",
  other: "text-muted-foreground",
};

export function UnifiedActivityFeed({
  activities,
  className,
  onActivityClick,
}: UnifiedActivityFeedProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          Your latest updates across all platforms
        </p>
      </div>

      <ul className="space-y-4">
        {activities.slice(0, 10).map((activity) => {
          const Icon = activityIcons[activity.type] || activityIcons.other;
          const PlatformIcon = platformIcons[activity.platform];
          const colorClass = typeColors[activity.type];
          const config = getPlatformConfig(activity.platform);

          return (
            <li
              key={activity.id}
              className="group flex gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0"
            >
              <div
                className={cn(
                  "relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary",
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background">
                  <PlatformIcon
                    className="h-2.5 w-2.5"
                    style={{ color: config.color }}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <button
                  onClick={() => onActivityClick?.(activity)}
                  className="w-full text-left transition-colors hover:text-brand"
                >
                  <h4 className="text-sm font-semibold">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </button>

                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  <span className="text-muted-foreground/50">•</span>
                  <span className="font-medium" style={{ color: config.color }}>
                    {config.name}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
