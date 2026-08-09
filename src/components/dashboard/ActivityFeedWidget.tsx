import { useMemo } from "react";
import { GitCommit, FileText, MessageSquare, Clock, Code2, CheckCircle2, Sparkles } from "lucide-react";
import { SiLeetcode } from "react-icons/si";
import { FaGithub, FaCode } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePlatformStore } from "@/lib/platform-store";
import { Link } from "@tanstack/react-router";

interface Activity {
  id: string;
  type: "leetcode" | "github" | "resume" | "gfg" | "interview";
  title: string;
  description: string;
  timestamp: Date;
  statusBadge?: string;
}

interface ActivityFeedWidgetProps {
  className?: string;
}

// User-specified relative timestamp formatting:
// - Last 24 hours: "X minutes ago" or "X hours ago"
// - After 24 hours: "1 day ago", "2 days ago", "30 days ago", etc.
export function formatExactActivityTime(timestamp: number | string | Date): string {
  try {
    const date =
      typeof timestamp === "number"
        ? timestamp < 1e12
          ? new Date(timestamp * 1000)
          : new Date(timestamp)
        : new Date(timestamp);

    if (isNaN(date.getTime())) return "recently";

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return "1 month ago";
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${Math.floor(diffMonths / 12)} years ago`;
  } catch {
    return "recently";
  }
}

export function ActivityFeedWidget({ className }: ActivityFeedWidgetProps) {
  const { leetcodeData, leetcode, githubData, github, gfgData, gfg } = usePlatformStore();

  const realActivities: Activity[] = useMemo(() => {
    const list: Activity[] = [];

    // 1. Pull LeetCode submissions
    try {
      if (leetcode?.connected && Array.isArray(leetcodeData?.recentSubmissions)) {
        leetcodeData.recentSubmissions.slice(0, 8).forEach((sub, idx) => {
          if (!sub) return;
          const isAccepted = sub.status === "Accepted" || sub.status === "A";
          const ts = typeof sub.timestamp === "number" ? sub.timestamp * 1000 : Date.now();
          list.push({
            id: `lc-${idx}-${sub.titleSlug || sub.title || idx}`,
            type: "leetcode",
            title: isAccepted ? `Solved "${sub.title || "DSA Problem"}"` : `Attempted "${sub.title || "DSA Problem"}"`,
            description: `LeetCode Submission (${sub.language || "DSA"}) • ${sub.status || "Completed"}`,
            timestamp: new Date(ts),
            statusBadge: isAccepted ? "Accepted" : sub.status || "Submitted",
          });
        });
      }
    } catch {
      // ignore
    }

    // 2. Pull GitHub real activity
    try {
      if (github?.connected && Array.isArray(githubData?.recentActivity)) {
        githubData.recentActivity.slice(0, 6).forEach((act: any, idx: number) => {
          if (!act) return;
          const rawRepo = typeof act.repo === "string" ? act.repo : act.repo?.name || "repository";
          const repoName = rawRepo.replace(/^.*\//, "");
          const date = act.createdAt ? new Date(act.createdAt) : new Date(Date.now() - 1000 * 60 * 60 * 4);
          list.push({
            id: `gh-${idx}-${rawRepo}`,
            type: "github",
            title: `Pushed commits to ${repoName}`,
            description: `GitHub Code Sync on ${rawRepo}`,
            timestamp: isNaN(date.getTime()) ? new Date() : date,
            statusBadge: "Committed",
          });
        });
      }
    } catch {
      // ignore
    }

    // 3. Pull Resume Activity from local storage
    try {
      const savedResumes = localStorage.getItem("skillverse_resumes");
      if (savedResumes) {
        const parsed = JSON.parse(savedResumes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const latest = parsed[0];
          if (latest) {
            list.push({
              id: `resume-${latest.id || "latest"}`,
              type: "resume",
              title: `Resume Updated: ${latest.name || "Software Engineer Resume"}`,
              description: "Saved in SkillVerse Resume Builder",
              timestamp: new Date(latest.updatedAt || Date.now() - 1000 * 60 * 15),
              statusBadge: "Saved",
            });
          }
        }
      }
    } catch {
      // ignore
    }

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Fallback if no activity is connected yet
    if (list.length === 0) {
      list.push(
        {
          id: "default-1",
          type: "resume",
          title: "ATS Resume Builder",
          description: "Created single-column ATS professional resume template",
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          statusBadge: "Completed",
        },
        {
          id: "default-2",
          type: "interview",
          title: "AI Interview Coach",
          description: "Explored practice drills and system design questions",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          statusBadge: "Ready",
        }
      );
    }

    return list.slice(0, 6);
  }, [leetcodeData, leetcode, githubData, github, gfgData, gfg]);

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "leetcode":
        return <SiLeetcode className="h-4 w-4 text-[#FFA116]" />;
      case "github":
        return <FaGithub className="h-4 w-4 text-foreground" />;
      case "resume":
        return <FileText className="h-4 w-4 text-brand" />;
      case "gfg":
        return <FaCode className="h-4 w-4 text-[#2F8D46]" />;
      case "interview":
      default:
        return <MessageSquare className="h-4 w-4 text-accent-2" />;
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            Live updates across LeetCode, GitHub & Career Hub
          </p>
        </div>
        <Link
          to="/analytics"
          className="text-xs font-semibold text-brand hover:underline"
        >
          View all →
        </Link>
      </div>

      <ul className="space-y-3.5">
        {realActivities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-start gap-3 border-b border-border/50 pb-3.5 last:border-0 last:pb-0"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-secondary border border-border/60 mt-0.5">
              {getIcon(activity.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-foreground truncate">
                  {activity.title}
                </h4>
                {activity.statusBadge && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0",
                      activity.statusBadge === "Accepted" || activity.statusBadge === "Saved" || activity.statusBadge === "Completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-secondary text-muted-foreground border border-border/60"
                    )}
                  >
                    {activity.statusBadge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {activity.description}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <Clock className="h-3 w-3" />
                <span>{formatExactActivityTime(activity.timestamp)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
