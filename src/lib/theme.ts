// Unified theme switcher with a circular View Transition reveal
// centred on the click origin. Falls back to a plain toggle when the
// browser lacks the View Transitions API or the user prefers reduced motion.

export type ThemeMode = "light" | "dark" | "system";

type Origin = { x: number; y: number } | null;

type StartViewTransition = (cb: () => void) => { finished?: Promise<void> };

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyClass(mode: ThemeMode) {
  const effectiveMode = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.classList.toggle("dark", effectiveMode === "dark");
  try {
    localStorage.setItem("sv-theme", mode);
  } catch {
    /* ignore */
  }
}

export function applyTheme(mode: ThemeMode, origin?: Origin) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const effectiveMode = mode === "system" ? getSystemTheme() : mode;
  const current: ThemeMode = root.classList.contains("dark") ? "dark" : "light";
  if (current === effectiveMode) return;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const start = (
    document as unknown as { startViewTransition?: StartViewTransition }
  ).startViewTransition;

  if (reduced || typeof start !== "function") {
    applyClass(mode);
    return;
  }

  // Compute reveal geometry from the click origin (or viewport centre).
  const cx = origin?.x ?? window.innerWidth / 2;
  const cy = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy),
  );

  root.style.setProperty("--vt-x", `${cx}px`);
  root.style.setProperty("--vt-y", `${cy}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  // Direction lets CSS pick the right animation (dark reveals over light, etc.)
  root.dataset.vtDir = mode === "dark" ? "to-dark" : "to-light";

  const transition = start.call(document, () => applyClass(mode));
  transition.finished?.finally(() => {
    delete root.dataset.vtDir;
  });
}

export function getStoredTheme(): ThemeMode {
  if (typeof document === "undefined") return "system";
  const stored =
    (typeof window !== "undefined" &&
      (localStorage.getItem("sv-theme") as ThemeMode | null)) ||
    null;
  if (stored === "dark" || stored === "light" || stored === "system")
    return stored;
  return "system";
}

export function getEffectiveTheme(): "light" | "dark" {
  const stored = getStoredTheme();
  return stored === "system" ? getSystemTheme() : stored;
}

export function initializeTheme() {
  if (typeof document === "undefined") return;
  const stored = getStoredTheme();
  applyTheme(stored);

  if (stored === "system") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }
}
