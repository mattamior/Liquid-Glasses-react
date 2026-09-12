"use client";

import { type FormEvent, type ReactNode } from "react";
import { LiquidButton } from "./LiquidButton";
import "./liquid-controls.css";

export interface LiquidToolbarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  placeholder?: string;
  theme?: "light" | "dark";
  searchLabel?: string;
  resetLabel?: string;
  children?: ReactNode;
}

export function LiquidToolbar({
  query,
  setQuery,
  onSearch,
  onReset,
  placeholder,
  theme,
  searchLabel = "查询",
  resetLabel = "重置",
  children,
}: LiquidToolbarProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="liquid-toolbar" onSubmit={submit}>
      <div className="liquid-search" data-theme={theme}>
        <input
          className="liquid-search__input"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="liquid-search__actions">
          <LiquidButton theme={theme} size="sm" type="submit">
            {searchLabel}
          </LiquidButton>
          <LiquidButton theme={theme} size="sm" variant="ghost" type="button" onClick={onReset}>
            {resetLabel}
          </LiquidButton>
        </div>
      </div>
      {children}
    </form>
  );
}
