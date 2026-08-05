import { useState, useEffect } from "react";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isBreakpoint = (bp: Breakpoint) => windowSize.width >= breakpoints[bp];
  const isBelowBreakpoint = (bp: Breakpoint) =>
    windowSize.width < breakpoints[bp];

  return {
    windowSize,
    isMobile: windowSize.width < breakpoints.md,
    isTablet:
      windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isSm: isBreakpoint("sm"),
    isMd: isBreakpoint("md"),
    isLg: isBreakpoint("lg"),
    isXl: isBreakpoint("xl"),
    is2xl: isBreakpoint("2xl"),
    isBelowSm: isBelowBreakpoint("sm"),
    isBelowMd: isBelowBreakpoint("md"),
    isBelowLg: isBelowBreakpoint("lg"),
    isBelowXl: isBelowBreakpoint("xl"),
  };
}
