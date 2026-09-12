"use client";

import { type TextareaHTMLAttributes } from "react";
import "./liquid-controls.css";

export interface LiquidTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme?: "light" | "dark";
}

export function LiquidTextarea({ theme, ...props }: LiquidTextareaProps) {
  return (
    <textarea {...props} className={["liquid-textarea", props.className].filter(Boolean).join(" ")} data-theme={theme} />
  );
}
