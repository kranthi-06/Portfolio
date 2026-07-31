"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ThemeId } from "@/lib/content";

const THEMES: ThemeId[] = ["pearl", "midnight", "aurora"];
const STORAGE_KEY = "kk-theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "pearl",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("pearl");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.includes(saved)) setThemeState(saved);
    setMounted(true);
  }, []);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="portfolio" data-theme={mounted ? theme : "pearl"}>
        <div className="aurora-bg" aria-hidden="true" />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
