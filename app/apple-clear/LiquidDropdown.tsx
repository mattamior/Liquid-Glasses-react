"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import "./liquid-dropdown.css";
import { useRef, useState, type ReactNode } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";

export interface LiquidDropdownProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

export function LiquidDropdown({
  items,
  value,
  defaultValue,
  onValueChange,
  title = "菜单",
  trigger,
  theme,
  optics,
}: LiquidDropdownProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? items?.[0]?.value ?? "");
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
    <DropdownMenu.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAfterCommit.current = false;
        setOpen(next);
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button type="button" className="liquid-dropdown__trigger">
          {trigger ?? selectedItem?.label ?? title}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="liquid-dropdown__content"
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
            value={selected}
            theme={theme}
            optics={optics}
            onValueChange={commitValue}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
