import { useState, useEffect } from "react";
import { History, Trophy, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AptitudeHistoryItem, aptitudeApi, AptitudeResult } from "@/lib/aptitude-api";

interface AptitudeHistorySectionProps {
  uid: string;
  onViewPastResult: (result: AptitudeResult) => void;
}

export function AptitudeHistorySection({ uid, onViewPastResult }: AptitudeHistorySectionProps) {
  const [history, setHistory] = useState<AptitudeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    aptitudeApi.getHistory(uid)
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleOpenResult = async (sessionId: string) => {
    const res = await aptitudeApi.getResult(sessionId);
    if (res) onViewPastResult(res);
  };

  const formatHistoryDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
            RECENT ATTEMPTS
          </span>
          <h3 className="text-base font-bold text-foreground">
            Aptitude Practice History
          </h3>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden divide-y divide-border/50 shadow-xs">
          {history.slice(0, 5).map((item) => (
            <div
              key={item.sessionId}
              className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand grid place-items-center font-bold text-xs shrink-0">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {item.category === "quant" ? "Quantitative Aptitude" : item.category === "logical" ? "Logical Reasoning" : "Verbal Ability"}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span>{item.difficulty}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">{item.score} Correct</span>
                    <span>·</span>
                    <span>{formatHistoryDate(item.completedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-extrabold text-brand tabular-nums">
                  {item.scorePercentage}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenResult(item.sessionId)}
                  className="text-xs font-semibold h-7 px-2.5 rounded-lg border-border hover:bg-secondary text-foreground cursor-pointer"
                >
                  View Result →
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-secondary/20 text-center space-y-1">
          <p className="text-xs font-bold text-foreground">No recent aptitude attempts</p>
          <p className="text-[11px] text-muted-foreground">
            Complete your first speed drill above to track your topic mastery and accuracy score.
          </p>
        </div>
      )}
    </div>
  );
}
