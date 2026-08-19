"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import "./liquid-overlays.css";

export interface LiquidDialogProps {
  children?: ReactNode;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LiquidDialog({
  children,
  title = "对话框",
  trigger,
  theme,
  optics,
  open,
  defaultOpen = false,
  onOpenChange,
}: LiquidDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
  const pressTimer = useRef<number>(0);
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
    <Dialog.Root
      open={resolvedOpen}
      onOpenChange={(next) => {
        if (!next) {
          releasePress(0);
        } else {
          releasePress(120);
        }
        if (open === undefined) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="liquid-overlay-trigger liquid-dialog-trigger"
          data-press={pressing ? "" : undefined}
          aria-expanded={resolvedOpen}
          onPointerDown={armPress}
          onPointerUp={() => releasePress(180)}
          onPointerCancel={() => releasePress(0)}
          onBlur={() => releasePress(0)}
        >
          {trigger ?? "打开对话框"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="liquid-dialog-overlay" />
        <Dialog.Content
          className="liquid-dialog-content"
          aria-describedby={undefined}
          aria-label={title}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="liquid-dialog-pop">
            <LiquidGlassCard title={title} theme={theme} optics={optics}>
              {children}
            </LiquidGlassCard>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
