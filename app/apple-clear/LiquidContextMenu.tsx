"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useState, type ReactNode } from "react";
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

  return (
    <ContextMenu.Root open={open} onOpenChange={setOpen}>
      <ContextMenu.Trigger asChild>
        <div className="liquid-context-surface">{children ?? "Right-click here"}</div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="liquid-overlay-content" alignOffset={-4}>
          {open ? (
            <LiquidMenu
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
          ) : null}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
