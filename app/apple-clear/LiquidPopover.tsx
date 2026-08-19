"use client";

import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";
import "./liquid-overlays.css";

export interface LiquidPopoverProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

export function LiquidPopover({
  items,
  value,
  defaultValue,
  onValueChange,
  title = "菜单",
  trigger,
  theme,
  optics,
}: LiquidPopoverProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? items?.[0]?.value ?? "");
  const selected = value ?? uncontrolled;
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
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          releasePress(0);
        } else {
          // Menu owns the morph. Trigger squash is press-only and must not stick.
          releasePress(120);
        }
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="liquid-overlay-trigger liquid-popover-trigger"
          data-press={pressing ? "" : undefined}
          aria-expanded={open}
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
            <LiquidMenu
              host="nested"
              density="compact"
              title={title}
              items={items}
              value={selected}
              theme={theme}
              optics={optics}
              onValueChange={(next) => {
                if (value === undefined) setUncontrolled(next);
                onValueChange?.(next);
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
