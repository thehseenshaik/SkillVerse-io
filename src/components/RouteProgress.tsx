import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Top-of-viewport progress bar that appears during route transitions.
 * Fires on any pending navigation and fades once idle. Purely presentational.
 */
export function RouteProgress() {
  const status = useRouterState({ select: (s) => s.status });
  const isPending = status === "pending";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isPending) {
      setVisible(true);
      return;
    }
    // Let the bar finish, then hide.
    const t = setTimeout(() => setVisible(false), 320);
    return () => clearTimeout(t);
  }, [isPending]);

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-200 " +
        (visible ? "opacity-100" : "opacity-0")
      }
    >
      <div
        className="h-full w-full bg-brand-gradient"
        style={{
          transformOrigin: "left",
          animation: isPending
            ? "route-progress 1.4s ease-out forwards"
            : "route-progress-finish 0.32s ease-out forwards",
        }}
      />
    </div>
  );
}
