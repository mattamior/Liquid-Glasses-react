"use client";

import { type ReactNode } from "react";
import "./liquid-controls.css";

export type LiquidPillTone = "positive" | "pending" | "disabled" | "muted";

export interface LiquidPillProps {
  tone?: LiquidPillTone;
  theme?: "light" | "dark";
  children?: ReactNode;
}

export function LiquidPill({ tone = "muted", theme, children }: LiquidPillProps) {
  return (
    <span className="liquid-pill" data-tone={tone} data-theme={theme}>
      {children}
    </span>
  );
}

export function statusTone(status?: string): LiquidPillTone {
  if (status === "ENABLED" || status === "ONLINE") return "positive";
  if (status === "PRE_ONLINE") return "pending";
  if (status === "DISABLED" || status === "OFFLINE") return "disabled";
  return "muted";
}
