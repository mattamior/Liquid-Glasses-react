"use client";

import { type ReactNode } from "react";
import { CatalogNav } from "./CatalogNav";
import { uiChrome } from "./copy";
import { UiLocaleProvider, useUiLocale } from "./UiLocale";
import { UiThemeProvider, useUiTheme } from "./UiTheme";

function UiStudioFrame({ children }: { children: ReactNode }) {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();

  return (
    <div className="ui-studio" data-theme={theme} data-locale={locale}>
      <aside className="ui-studio__nav">
        <div className="ui-studio__brand-row">
          <p className="ui-studio__brand">{uiChrome(locale).brand}</p>
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
      <UiLocaleProvider>
        <UiStudioFrame>{children}</UiStudioFrame>
      </UiLocaleProvider>
    </UiThemeProvider>
  );
}
