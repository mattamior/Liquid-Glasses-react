"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";
import "./liquid-overlays.css";

export interface LiquidSelectProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  placeholder?: string;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

/** Form-like trigger. Uses Popover so the glass lens can finish before close. */
export function LiquidSelect({
  items,
  value,
  defaultValue,
  onValueChange,
  title = "选择",
  placeholder = "选择…",
  theme,
  optics,
}: LiquidSelectProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolled;
  const selectedItem = items?.find((item) => item.value === selected);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="liquid-select-trigger">
          {selectedItem?.label ?? placeholder}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="liquid-overlay-content" sideOffset={10} align="start">
          <LiquidMenu
            title={title}
            items={items}
            value={selected || undefined}
            theme={theme}
            optics={optics}
            onValueChange={(next) => {
              if (value === undefined) setUncontrolled(next);
              onValueChange?.(next);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
