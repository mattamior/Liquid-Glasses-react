"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UiLocale = "zh" | "en";

const STORAGE_KEY = "liquid-glass:ui-locale";

interface UiLocaleContextValue {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

const UiLocaleContext = createContext<UiLocaleContextValue | null>(null);

export function UiLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>("zh");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") setLocaleState(stored);
    } catch {
      // Session locale still applies.
    }
  }, []);

  const setLocale = (next: UiLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Session locale still applies.
    }
  };

  return <UiLocaleContext.Provider value={{ locale, setLocale }}>{children}</UiLocaleContext.Provider>;
}

export function useUiLocale() {
  const value = useContext(UiLocaleContext);
  if (!value) {
    throw new Error("useUiLocale requires UiLocaleProvider");
  }
  return value;
}
