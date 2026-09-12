"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LiquidGlassCard, type LiquidGlassCardProps } from "./LiquidGlassCard";
import "./liquid-overlays.css";
import "./liquid-controls.css";

export interface LiquidSheetProps {
  children?: ReactNode;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
  scene?: LiquidGlassCardProps["scene"];
  /** Portal target. Omit to mount on `document.body`. */
  container?: HTMLElement | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LiquidSheet({
  children,
  title = "详情",
  trigger,
  theme,
  optics,
  scene,
  container,
  open,
  defaultOpen = false,
  onOpenChange,
}: LiquidSheetProps) {
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
    <Dialog.Root
      open={resolvedOpen}
      onOpenChange={(next) => {
        if (!next) releasePress(0);
        else releasePress(120);
        if (open === undefined) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {trigger === null ? null : (
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="liquid-overlay-trigger liquid-dialog-trigger"
            data-theme={theme}
            data-press={pressing ? "" : undefined}
            aria-expanded={resolvedOpen}
            onPointerDown={armPress}
            onPointerUp={() => releasePress(180)}
            onPointerCancel={() => releasePress(0)}
            onBlur={() => releasePress(0)}
          >
            {trigger ?? "打开详情"}
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay
          className="liquid-dialog-overlay liquid-sheet-overlay"
          data-theme={theme}
          data-contained={container ? "" : undefined}
        />
        <Dialog.Content
          className="liquid-sheet-content"
          aria-describedby={undefined}
          aria-label={title}
          data-contained={container ? "" : undefined}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="liquid-sheet-pop">
            <LiquidGlassCard title={title} theme={theme} optics={optics} scene={scene}>
              {children}
            </LiquidGlassCard>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
