"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState, type ReactNode } from "react";
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

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="liquid-overlay-trigger" aria-expanded={open}>
          {trigger ?? "打开"}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="liquid-overlay-content"
          sideOffset={10}
          align="start"
          aria-label={title}
        >
          <LiquidMenu
            host="nested"
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
