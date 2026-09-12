"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LiquidGlassCard, type LiquidGlassCardProps } from "./LiquidGlassCard";
import "./liquid-overlays.css";
import "./liquid-controls.css";

export interface LiquidAlertDialogProps {
  children?: ReactNode;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
  scene?: LiquidGlassCardProps["scene"];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LiquidAlertDialog({
  children,
  title = "确认",
  trigger,
  theme,
  optics,
  scene,
  open,
  defaultOpen = false,
  onOpenChange,
}: LiquidAlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
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
    <AlertDialog.Root
      open={resolvedOpen}
      onOpenChange={(next) => {
        if (!next) releasePress(0);
        else releasePress(120);
        if (open === undefined) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="liquid-overlay-trigger liquid-dialog-trigger"
          data-theme={theme}
          data-press={pressing ? "" : undefined}
          onPointerDown={armPress}
          onPointerUp={() => releasePress(180)}
          onPointerCancel={() => releasePress(0)}
          onBlur={() => releasePress(0)}
        >
          {trigger ?? "打开确认"}
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="liquid-dialog-overlay" data-theme={theme} />
        <AlertDialog.Content className="liquid-dialog-content liquid-alert-content" aria-describedby={undefined}>
          <AlertDialog.Title className="sr-only">{title}</AlertDialog.Title>
          <div className="liquid-dialog-pop">
            <LiquidGlassCard title={title} theme={theme} optics={optics} scene={scene}>
              {children}
            </LiquidGlassCard>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export const LiquidAlertAction = AlertDialog.Action;
export const LiquidAlertCancel = AlertDialog.Cancel;
