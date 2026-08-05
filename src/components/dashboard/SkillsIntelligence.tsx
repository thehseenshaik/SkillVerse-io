/**
 * Skills Intelligence Widget
 * Automatically infers skills from available platform data
 */

import { Code, Database, Layout, Server, Cpu, Brain, Shield, Globe, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Skill {
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "ml" | "mobile" | "other";
  proficiency: number; // 0-100
  source?: string;
}

interface SkillsIntelligenceProps {
  skills: Skill[];
  className?: string;
  onSkillClick?: (skill: Skill) => void;
}

const categoryIcons = {
  frontend: Layout,
  backend: Server,
  database: Database,
  devops: Shield,
  ml: Brain,
  mobile: Smartphone,
  other: Code,
};

const categoryColors = {
  frontend: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  backend: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  database: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  devops: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ml: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  mobile: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const categoryNames = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  ml: "Machine Learning",
  mobile: "Mobile",
  other: "Other",
};

export function SkillsIntelligence({
  skills,
  className,
  onSkillClick,
}: SkillsIntelligenceProps) {
  if (skills.length === 0) {
    return null;
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Skills Intelligence</h3>
        <p className="text-sm text-muted-foreground">
          {skills.length} skill{skills.length !== 1 ? "s" : ""} detected from your activity
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Globe;
          const categoryClass = categoryColors[category as keyof typeof categoryColors];
          const categoryName = categoryNames[category as keyof typeof categoryNames];

          return (
            <div key={category}>
              <div className="mb-2 flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{categoryName}</span>
                <Badge variant="secondary" className="text-xs">
                  {categorySkills.length}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => onSkillClick?.(skill)}
                    className="group relative"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-3 py-1 text-sm transition-all hover:scale-105",
                        skill.proficiency >= 80 && "bg-brand/10 border-brand/30 text-brand",
                        skill.proficiency >= 60 && skill.proficiency < 80 && "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
                        skill.proficiency < 60 && "bg-muted"
                      )}
                    >
                      {skill.name}
                    </Badge>
                    {skill.source && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        via {skill.source}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
