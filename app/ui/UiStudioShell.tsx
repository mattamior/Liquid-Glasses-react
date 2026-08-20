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
            {next === "light" ? "亮色" : "暗色"}
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
