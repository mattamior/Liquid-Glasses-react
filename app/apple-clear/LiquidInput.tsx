"use client";

import { type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import "./liquid-controls.css";

export interface LiquidLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  theme?: "light" | "dark";
}

export function LiquidLabel({ children, theme, ...props }: LiquidLabelProps) {
  return (
    <label {...props} className={["liquid-label", props.className].filter(Boolean).join(" ")} data-theme={theme}>
      {children}
    </label>
  );
}

export interface LiquidInputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: "light" | "dark";
}

export function LiquidInput({ theme, ...props }: LiquidInputProps) {
  return <input {...props} className={["liquid-input", props.className].filter(Boolean).join(" ")} data-theme={theme} />;
}
