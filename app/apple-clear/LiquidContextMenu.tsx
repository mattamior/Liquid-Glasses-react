"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useRef, useState, type ReactNode } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";
import "./liquid-overlays.css";

export interface LiquidContextMenuProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  children?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

export function LiquidContextMenu({
  items,
  value,
  defaultValue,
  onValueChange,
  title = "菜单",
  children,
  theme,
  optics,
}: LiquidContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? items?.[0]?.value ?? "");
  const selected = value ?? uncontrolled;
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
    <ContextMenu.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAfterCommit.current = false;
        setOpen(next);
      }}
    >
      <ContextMenu.Trigger asChild>
        <div className="liquid-context-surface">{children ?? "Right-click here"}</div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="liquid-overlay-content"
          alignOffset={-4}
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
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
