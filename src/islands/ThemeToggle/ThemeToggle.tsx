/**
 * ThemeToggle: the one hydrated island. It exists because a theme choice is
 * a click that must persist across visits, which static HTML cannot do.
 *
 * Must stay true: the `data-theme` attribute on `<html>` is the only thing
 * this writes, and `localStorage["theme"]` is the only thing it remembers.
 * `Base.astro` reads the same key before first paint so the page never
 * flashes the wrong theme.
 */

import { useEffect, useState } from "react";
import { Button } from "../dsx.ts";

export type Theme = "light" | "dark";

export interface ThemeToggleProps {
  readonly label: string;
  readonly toLight: string;
  readonly toDark: string;
}

const storageKey = "theme";

function currentTheme(): Theme {
  const set = document.documentElement.dataset["theme"];
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ label, toLight, toDark }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset["theme"] = next;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Private mode or blocked storage: the choice lasts for this page only. */
    }
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={theme === null ? label : theme === "dark" ? toLight : toDark}
      aria-pressed={theme === "dark"}
      data-theme-toggle
    >
      {theme === "dark" ? "☾" : "☀"}
    </Button>
  );
}
