/**
 * Resume Status Widget
 * Displays ATS Score, Missing Skills, Missing Projects, and Resume Completion
 */

import { FileText, AlertCircle, CheckCircle2, Plus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface ResumeStatusProps {
  atsScore?: number;
  missingSkills?: string[];
  missingProjects?: string[];
  resumeCompletion?: number;
  className?: string;
}

export function ResumeStatus({
  atsScore,
  missingSkills = [],
  missingProjects = [],
  resumeCompletion,
  className,
}: ResumeStatusProps) {
  if (resumeCompletion === undefined) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Critical";
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Resume Status</h3>
          <p className="text-sm text-muted-foreground">
            ATS optimization and completion
          </p>
        </div>
        <Link to="/resume">
          <Button size="sm" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Resume
          </Button>
        </Link>
      </div>

      {/* ATS Score */}
      {atsScore !== undefined && (
        <div className="mb-6 rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">ATS Score</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn("text-3xl font-bold", getScoreColor(atsScore))}>
                  {atsScore}
                </span>
                <span className="text-sm">/ 100</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-2",
                    atsScore >= 80 && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
                    atsScore >= 60 && atsScore < 80 && "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
                    atsScore < 60 && "border-red-500/30 bg-red-500/10 text-red-500"
                  )}
                >
                  {getScoreLabel(atsScore)}
                </Badge>
              </div>
            </div>
            <TrendingUp className={cn("h-8 w-8", getScoreColor(atsScore))} />
          </div>
        </div>
      )}

      {/* Completion Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Completion</span>
          <span className="text-sm text-muted-foreground">{resumeCompletion}%</span>
        </div>
        <Progress value={resumeCompletion} className="h-2" />
      </div>

      {/* Missing Items */}
      {(missingSkills.length > 0 || missingProjects.length > 0) && (
        <div className="space-y-3">
          {missingSkills.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {missingSkills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{missingSkills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {missingProjects.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Missing Projects
              </div>
              <div className="space-y-1">
                {missingProjects.slice(0, 3).map((project) => (
                  <div
                    key={project}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    {project}
                  </div>
                ))}
                {missingProjects.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{missingProjects.length - 3} more projects
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Status */}
      {missingSkills.length === 0 && missingProjects.length === 0 && resumeCompletion === 100 && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Your resume is complete!</span>
        </div>
      )}
    </Card>
  );
}
