"use client";

import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState } from "react";
import { LiquidMenu, type LiquidMenuItem, type LiquidMenuProps } from "./LiquidMenu";
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
  scene?: LiquidMenuProps["scene"];
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
  scene,
}: LiquidSelectProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolled;
  const selectedItem = items?.find((item) => item.value === selected);
  const closeAfterCommit = useRef(false);
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
        if (!next) {
          closeAfterCommit.current = false;
          releasePress(0);
        } else {
          releasePress(120);
        }
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="liquid-select-trigger"
          data-theme={theme}
          data-press={pressing ? "" : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          onPointerDown={armPress}
          onPointerUp={() => releasePress(180)}
          onPointerCancel={() => releasePress(0)}
          onBlur={() => releasePress(0)}
        >
          {selectedItem?.label ?? placeholder}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="liquid-overlay-content liquid-select-content"
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
          <div className="liquid-select-pop">
            <LiquidMenu
              host="nested"
              density="compact"
              title={title}
              items={items}
              value={selected || undefined}
              theme={theme}
              optics={optics}
              scene={scene}
              onValueChange={commitValue}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
