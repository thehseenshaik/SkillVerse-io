/**
 * Animated Counter Component
 * Smooth number counter animation for dashboard metrics
 */

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();
    startValueRef.current = displayValue;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === undefined) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out quart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValueRef.current + (value - startValueRef.current) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
