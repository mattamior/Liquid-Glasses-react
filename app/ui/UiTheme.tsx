"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UiTheme = "light" | "dark";

const STORAGE_KEY = "liquid-glass:ui-theme";

interface UiThemeContextValue {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
}

const UiThemeContext = createContext<UiThemeContextValue | null>(null);

export function UiThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>("dark");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") setThemeState(stored);
    } catch {
      // Session theme still applies.
    }
  }, []);

  const setTheme = (next: UiTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Session theme still applies.
    }
  };

  return <UiThemeContext.Provider value={{ theme, setTheme }}>{children}</UiThemeContext.Provider>;
}

export function useUiTheme() {
  const value = useContext(UiThemeContext);
  if (!value) {
    throw new Error("useUiTheme requires UiThemeProvider");
  }
  return value;
}
