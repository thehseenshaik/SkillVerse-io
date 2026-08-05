import { useEffect } from "react";

export function useKeyboardNav(
  keyMap: Record<string, () => void>,
  isActive = true,
) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = keyMap[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyMap, isActive]);
}
