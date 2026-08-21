"use client";

import { type ReactNode } from "react";
import { getUiCatalogCopy, uiChrome } from "./copy";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

function ThemeIcon({ next }: { next: "light" | "dark" }) {
  if (next === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.3A8.7 8.7 0 0 1 8.7 4a8.7 8.7 0 1 0 11.3 11.3Z" />
    </svg>
  );
}

export function UiHeaderTools() {
  const { theme, setTheme } = useUiTheme();
  const { locale, setLocale } = useUiLocale();
  const copy = uiChrome(locale);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLocale = locale === "zh" ? "en" : "zh";

  return (
    <div className="ui-studio__header-tools">
      <button
        type="button"
        className="ui-studio__locale-toggle"
        aria-label={copy.localeLabel}
        onClick={() => setLocale(nextLocale)}
      >
        {nextLocale === "en" ? copy.localeToEn : copy.localeToZh}
      </button>
      <button
        type="button"
        className="ui-studio__theme-toggle"
        aria-pressed={theme === "dark"}
        aria-label={nextTheme === "light" ? copy.themeToLight : copy.themeToDark}
        onClick={() => setTheme(nextTheme)}
      >
        <ThemeIcon next={nextTheme} />
      </button>
    </div>
  );
}

export function UiCatalogFrame({
  slug,
  preview,
}: {
  slug: string;
  preview: ReactNode;
}) {
  const { locale } = useUiLocale();
  const chrome = uiChrome(locale);
  const entry = getUiCatalogCopy(slug, locale);

  if (!entry) return null;

  return (
    <main className="ui-studio__main">
      <header className="ui-studio__header">
        <div className="ui-studio__header-row">
          <h1>{entry.title}</h1>
          <UiHeaderTools />
        </div>
        <p>{entry.summary}</p>
      </header>
      {preview}
      <section className="ui-studio__panel">
        <h2>{chrome.usage}</h2>
        <pre className="ui-studio__code">{entry.usage}</pre>
      </section>
      <section className="ui-studio__panel">
        <h2>{chrome.props}</h2>
        <table className="ui-studio__props">
          <thead>
            <tr>
              <th>{chrome.name}</th>
              <th>{chrome.type}</th>
              <th>{chrome.defaultValue}</th>
              <th>{chrome.description}</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code>{prop.name}</code>
                </td>
                <td>
                  <code>{prop.type}</code>
                </td>
                <td>{prop.defaultValue}</td>
                <td>{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
