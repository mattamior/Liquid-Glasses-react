"use client";

import { type SelectHTMLAttributes } from "react";
import "./liquid-controls.css";

export interface LiquidNativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  theme?: "light" | "dark";
}

export function LiquidNativeSelect({ theme, children, ...props }: LiquidNativeSelectProps) {
  return (
    <select
      {...props}
      className={["liquid-native-select", props.className].filter(Boolean).join(" ")}
      data-theme={theme}
    >
      {children}
    </select>
  );
}
