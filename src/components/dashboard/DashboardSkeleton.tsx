/**
 * Dashboard Skeleton Loaders
 * Provides skeleton loading states for dashboard widgets
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WelcomeHeaderSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-16 w-24 rounded-lg" />
          <Skeleton className="h-16 w-24 rounded-lg" />
          <Skeleton className="h-16 w-24 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

export function QuickActionsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export function ConnectedPlatformsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export function ActivityFeedSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AIInsightsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export function WeeklyProgressSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export function SkillsIntelligenceSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ResumeStatusSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </Card>
  );
}

export function CareerGoalsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="mb-6 h-2 w-full" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export function NotificationsSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}
