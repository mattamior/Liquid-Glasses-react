"use client";

import * as Popover from "@radix-ui/react-popover";
import { useRef, useState } from "react";
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

/** Form-like trigger. Popover, not Radix Select, so the travel lens can finish. */
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
  const closeAfterCommit = useRef(false);

  const commitValue = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
    if (closeAfterCommit.current) {
      closeAfterCommit.current = false;
      setOpen(false);
    }
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAfterCommit.current = false;
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="liquid-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selectedItem?.label ?? placeholder}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="liquid-overlay-content"
          sideOffset={10}
          align="start"
          aria-label={title}
          onPointerDown={() => {
            closeAfterCommit.current = true;
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            closeAfterCommit.current = true;
            const phase = event.currentTarget
              .querySelector("[data-glass-phase]")
              ?.getAttribute("data-glass-phase");
            if (!phase || phase === "idle") setOpen(false);
          }}
        >
          <LiquidMenu
            host="nested"
            title={title}
            items={items}
            value={selected || undefined}
            theme={theme}
            optics={optics}
            onValueChange={commitValue}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
