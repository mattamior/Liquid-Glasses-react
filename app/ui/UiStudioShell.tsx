"use client";

import { type ReactNode } from "react";
import { CatalogNav } from "./CatalogNav";
import { UiThemeProvider, useUiTheme } from "./UiTheme";

function UiStudioFrame({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useUiTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <div className="ui-studio" data-theme={theme}>
      <aside className="ui-studio__nav">
        <div className="ui-studio__brand-row">
          <p className="ui-studio__brand">Liquid Glass</p>
          <button
            type="button"
            className="ui-studio__theme-toggle"
            aria-pressed={theme === "dark"}
            aria-label={next === "light" ? "切换亮色" : "切换暗色"}
            onClick={() => setTheme(next)}
          >
            {next === "light" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3.7" />
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 15.3A8.7 8.7 0 0 1 8.7 4a8.7 8.7 0 1 0 11.3 11.3Z" />
              </svg>
            )}
          </button>
        </div>
        <CatalogNav />
      </aside>
      {children}
    </div>
  );
}

export function UiStudioShell({ children }: { children: ReactNode }) {
  return (
    <UiThemeProvider>
      <UiStudioFrame>{children}</UiStudioFrame>
    </UiThemeProvider>
  );
}
