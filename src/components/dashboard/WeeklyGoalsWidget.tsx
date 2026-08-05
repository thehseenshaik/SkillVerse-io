import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

interface WeeklyGoalsWidgetProps {
  goals?: Goal[];
  onAddGoal?: () => void;
  onToggleGoal?: (id: string) => void;
  className?: string;
}

export function WeeklyGoalsWidget({
  goals = [
    { id: "1", title: "Complete 5 DSA problems", completed: true },
    { id: "2", title: "Update resume with new project", completed: false },
    { id: "3", title: "Practice 2 mock interviews", completed: false },
    { id: "4", title: "Review system design concepts", completed: false },
  ],
  onAddGoal,
  onToggleGoal,
  className,
}: WeeklyGoalsWidgetProps) {
  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Weekly Goals</h3>
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

      <Progress value={progress} className="mb-4" />

      <ul className="space-y-2">
        {goals.map((goal) => (
          <li
            key={goal.id}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
          >
            <button
              onClick={() => onToggleGoal?.(goal.id)}
              className="flex-shrink-0"
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
            <span
              className={cn(
                "text-sm",
                goal.completed && "text-muted-foreground line-through",
              )}
            >
              {goal.title}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
