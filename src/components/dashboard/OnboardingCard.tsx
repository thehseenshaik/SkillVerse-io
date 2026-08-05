/**
 * Onboarding Card Widget
 * Compact onboarding card shown when no platforms are connected
 */

import { Plug, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface OnboardingCardProps {
  className?: string;
}

export function OnboardingCard({ className }: OnboardingCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Plug className="h-6 w-6 text-brand" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <h3 className="font-semibold">Get Started</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Connect your coding platforms to unlock personalized career insights, 
            track your progress, and build an impressive portfolio.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link to="/connections">
              <Button size="sm" className="gap-2">
                Connect Platforms
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/identity-hub">
              <Button size="sm" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
