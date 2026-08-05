/**
 * Quick Actions Widget
 * Provides quick access to common dashboard actions
 */

import { RefreshCw, FileText, Brain, Edit, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface QuickActionsProps {
  onSyncAll?: () => void;
  isSyncing?: boolean;
  showAIResume?: boolean;
  className?: string;
}

export function QuickActions({
  onSyncAll,
  isSyncing = false,
  showAIResume = true,
  className,
}: QuickActionsProps) {
  const actions = [
    {
      icon: RefreshCw,
      label: "Sync All",
      description: "Update all platforms",
      onClick: onSyncAll,
      loading: isSyncing,
      variant: "default" as const,
    },
    {
      icon: FileText,
      label: "Generate Resume",
      description: "Create your resume",
      to: "/resume",
      variant: "outline" as const,
    },
    ...(showAIResume
      ? [
          {
            icon: Brain,
            label: "AI Resume",
            description: "AI-powered optimization",
            to: "/resume?ai=true",
            variant: "outline" as const,
          },
        ]
      : []),
    {
      icon: Edit,
      label: "Edit Profile",
      description: "Update your profile",
      to: "/profile",
      variant: "outline" as const,
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      description: "Detailed insights",
      to: "/analytics",
      variant: "outline" as const,
    },
  ];

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="font-semibold">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">
          Common tasks at your fingertips
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const button = (
            <Button
              variant={action.variant}
              className="h-auto flex-col gap-2 p-4 text-left"
              onClick={action.onClick}
              disabled={action.loading}
              asChild={!action.onClick}
            >
              {action.to ? (
                <Link to={action.to} className="flex flex-col gap-2">
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Link>
              ) : (
                <>
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </>
              )}
            </Button>
          );

          return (
            <div key={action.label} className="flex">
              {button}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
