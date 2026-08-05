/**
 * Lazy Widget Wrapper
 * Provides lazy loading and intersection observer-based loading for dashboard widgets
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LazyWidgetProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyWidget({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = "50px",
}: LazyWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, hasIntersected]);

  return (
    <div ref={ref} className={cn("min-h-[200px]", className)}>
      {isVisible ? (
        <Suspense fallback={fallback || <WidgetSkeleton />}>{children}</Suspense>
      ) : (
        fallback || <WidgetSkeleton />
      )}
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWidget fallback={fallback}>
        <Component {...props} />
      </LazyWidget>
    );
  };
}
