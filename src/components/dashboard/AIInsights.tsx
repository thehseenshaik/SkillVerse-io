/**
 * AI Insights Widget
 * Platform-aware AI insights based on connected platforms and available data
 */

import { Lightbulb, AlertTriangle, CheckCircle2, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import type { Platform } from "@/types/identity-hub";
import { getPlatformConfig } from "@/lib/connectors/platform-config";

interface AIInsight {
  id: string;
  type: "suggestion" | "warning" | "achievement" | "tip";
  title: string;
  description: string;
  platform?: Platform;
  priority?: "high" | "medium" | "low";
}

interface AIInsightsProps {
  insights: AIInsight[];
  className?: string;
  onInsightClick?: (insight: AIInsight) => void;
}

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

const typeIcons = {
  suggestion: Lightbulb,
  warning: AlertTriangle,
  achievement: CheckCircle2,
  tip: Sparkles,
};

const typeColors = {
  suggestion: "text-blue-500",
  warning: "text-amber-500",
  achievement: "text-emerald-500",
  tip: "text-purple-500",
};

const typeBadgeColors = {
  suggestion: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  achievement: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  tip: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const priorityColors = {
  high: "bg-rose-500/10 text-rose-500",
  medium: "bg-amber-500/10 text-amber-500",
  low: "bg-muted text-muted-foreground",
};

export function AIInsights({
  insights,
  className,
  onInsightClick,
}: AIInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Insights</h3>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations for you
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
          <Sparkles className="h-4 w-4 text-brand" />
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const TypeIcon = typeIcons[insight.type];
          const colorClass = typeColors[insight.type];
          const badgeClass = typeBadgeColors[insight.type];
          const priorityClass = insight.priority ? priorityColors[insight.priority] : null;
          const config = insight.platform ? getPlatformConfig(insight.platform) : null;
          const PlatformIcon = insight.platform ? platformIcons[insight.platform] : null;

          return (
            <button
              key={insight.id}
              onClick={() => onInsightClick?.(insight)}
              className="group flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4 text-left transition-all hover:border-brand/50 hover:bg-secondary/50"
            >
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary",
                  colorClass
                )}
              >
                <TypeIcon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold">{insight.title}</h4>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      badgeClass
                    )}
                  >
                    {insight.type}
                  </span>
                  {priorityClass && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                        priorityClass
                      )}
                    >
                      {insight.priority}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {insight.description}
                </p>

                {config && PlatformIcon && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <PlatformIcon
                      className="h-3 w-3"
                      style={{ color: config.color }}
                    />
                    <span className="font-medium" style={{ color: config.color }}>
                      {config.name}
                    </span>
                  </div>
                )}
              </div>

              <TrendingUp className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
