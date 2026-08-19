"use client";

import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import "./liquid-overlays.css";

export interface LiquidPopoverProps {
  children?: ReactNode;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LiquidPopover({
  children,
  title = "卡片",
  trigger,
  theme,
  optics,
  open,
  defaultOpen = false,
  onOpenChange,
}: LiquidPopoverProps) {
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
    <Popover.Root
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
      <Popover.Trigger asChild>
        <button
          type="button"
          className="liquid-overlay-trigger liquid-popover-trigger"
          data-press={pressing ? "" : undefined}
          aria-expanded={resolvedOpen}
          onPointerDown={armPress}
          onPointerUp={() => releasePress(180)}
          onPointerCancel={() => releasePress(0)}
          onBlur={() => releasePress(0)}
        >
          {trigger ?? "打开"}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="liquid-overlay-content liquid-popover-content"
          sideOffset={10}
          align="start"
          aria-label={title}
        >
          <div className="liquid-popover-pop">
            <LiquidGlassCard title={title} theme={theme} optics={optics}>
              {children}
            </LiquidGlassCard>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
