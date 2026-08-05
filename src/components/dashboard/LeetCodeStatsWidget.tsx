import { Trophy, Target, Flame, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useNavigate } from "@tanstack/react-router";

interface LeetCodeStatsWidgetProps {
  className?: string;
}

export function LeetCodeStatsWidget({ className }: LeetCodeStatsWidgetProps) {
  const { profile, connections } = useIdentityHub();
  const navigate = useNavigate();

  const leetcodeConnection = connections.find((c) => c.platform === "leetcode");
  const leetcodeStats = profile?.codingStats.find(
    (s) => s.platform === "leetcode",
  );

  if (!leetcodeConnection || leetcodeConnection.status !== "connected") {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 font-semibold">LeetCode Not Connected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your LeetCode account to see your stats
          </p>
        </div>
      </Card>
    );
  }

  const problemsSolved = leetcodeStats?.problemsSolved || 0;
  const ranking = leetcodeStats?.ranking || 0;
  const difficultyBreakdown = leetcodeStats?.difficultyBreakdown || {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  return (
    <Card 
      className={cn("p-6 cursor-pointer hover:border-brand/50 transition-colors", className)}
      onClick={() => navigate({ to: "/analytics/leetcode" })}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">LeetCode Stats</h3>
          <p className="text-sm text-muted-foreground">
            @{leetcodeConnection.username}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs">Problems Solved</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{problemsSolved}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Global Ranking</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            #{ranking.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-semibold">Difficulty Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600">Easy</span>
            <span className="font-semibold">{difficultyBreakdown.easy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-600">Medium</span>
            <span className="font-semibold">{difficultyBreakdown.medium}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-600">Hard</span>
            <span className="font-semibold">{difficultyBreakdown.hard}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
