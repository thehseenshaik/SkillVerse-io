import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  getEffectiveTheme,
  type ThemeMode,
} from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());

    const obs = new MutationObserver(() => setTheme(getStoredTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  const cycleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const themes: ThemeMode[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);
    applyTheme(nextTheme, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const effectiveTheme = getEffectiveTheme();

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="glass group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-foreground transition-transform hover:scale-105"
      />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      className="glass group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-foreground transition-transform hover:scale-105"
    >
      <Sun
        className={
          "absolute h-4 w-4 transition-all duration-500 " +
          (theme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-50 opacity-0")
        }
      />
      <Moon
        className={
          "absolute h-4 w-4 transition-all duration-500 " +
          (theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-50 opacity-0")
        }
      />
      <Monitor
        className={
          "absolute h-4 w-4 transition-all duration-500 " +
          (theme === "system"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-50 opacity-0")
        }
      />
    </button>
  );
}
