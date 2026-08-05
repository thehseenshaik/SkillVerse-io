import { GitCommit, FileText, MessageSquare, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "commit" | "resume" | "interview" | "message";
  title: string;
  description: string;
  timestamp: Date;
}

interface ActivityFeedWidgetProps {
  activities?: Activity[];
  className?: string;
}

const iconMap = {
  commit: GitCommit,
  resume: FileText,
  interview: MessageSquare,
  message: MessageSquare,
};

const typeColors = {
  commit: "text-emerald-500",
  resume: "text-brand",
  interview: "text-accent-2",
  message: "text-blue-500",
};

export function ActivityFeedWidget({
  activities = [
    {
      id: "1",
      type: "commit",
      title: "GitHub Sync",
      description: "Pushed 3 commits to skillverse-portfolio",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      type: "resume",
      title: "Resume Updated",
      description: "Added new project experience",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "3",
      type: "interview",
      title: "Mock Interview",
      description: "Completed technical interview round",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: "4",
      type: "message",
      title: "AI Assistant",
      description: "Asked for cover letter help",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ],
  className,
}: ActivityFeedWidgetProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          Your latest career updates
        </p>
      </div>

      <ul className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          const colorClass = typeColors[activity.type];
          return (
            <li
              key={activity.id}
              className="flex gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0"
            >
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary",
                  colorClass,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold">{activity.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
