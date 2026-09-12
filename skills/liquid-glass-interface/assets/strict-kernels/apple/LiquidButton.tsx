"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import "./liquid-controls.css";

export type LiquidButtonVariant = "default" | "secondary" | "destructive" | "ghost";
export type LiquidButtonSize = "default" | "sm" | "icon";

export interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: LiquidButtonVariant;
  size?: LiquidButtonSize;
  theme?: "light" | "dark";
}

export function LiquidButton({
  children,
  variant = "default",
  size = "default",
  theme,
  type = "button",
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onBlur,
  ...props
}: LiquidButtonProps) {
  const pressTimer = useRef(0);
  const [pressing, setPressing] = useState(false);

  const armPress = () => {
    window.clearTimeout(pressTimer.current);
    setPressing(true);
  };

  const releasePress = (delay = 160) => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressing(false), delay);
  };

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  return (
    <button
      {...props}
      type={type}
      className={["liquid-button", props.className].filter(Boolean).join(" ")}
      data-theme={theme}
      data-variant={variant}
      data-size={size}
      data-press={pressing ? "" : undefined}
      onPointerDown={(event) => {
        armPress();
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        releasePress(180);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        releasePress(0);
        onPointerCancel?.(event);
      }}
      onBlur={(event) => {
        releasePress(0);
        onBlur?.(event);
      }}
    >
      {children}
    </button>
  );
}
