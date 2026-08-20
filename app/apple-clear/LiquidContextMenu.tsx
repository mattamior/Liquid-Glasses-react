"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { useState, type ReactNode } from "react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import "./liquid-overlays.css";

export interface LiquidContextMenuAction {
  value: string;
  label: string;
}

export interface LiquidContextMenuProps {
  items?: readonly LiquidContextMenuAction[];
  onValueChange?: (value: string) => void;
  title?: string;
  children?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

const DEFAULT_ACTIONS: readonly LiquidContextMenuAction[] = [
  { value: "cut", label: "剪切" },
  { value: "copy", label: "复制" },
  { value: "paste", label: "粘贴" },
];

export function LiquidContextMenu({
  items = DEFAULT_ACTIONS,
  onValueChange,
  title = "操作",
  children,
  theme,
  optics,
}: LiquidContextMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <ContextMenu.Root open={open} onOpenChange={setOpen}>
      <ContextMenu.Trigger asChild>
        <div className="liquid-context-surface">{children ?? "在此区域右键"}</div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="liquid-overlay-content liquid-context-content"
          alignOffset={-4}
          aria-label={title}
        >
          <div className="liquid-context-pop">
            <LiquidGlassCard title={title} theme={theme} optics={optics}>
              {items.map((item) => (
                <ContextMenu.Item
                  key={item.value}
                  className="liquid-menubar-action"
                  onSelect={() => onValueChange?.(item.value)}
                >
                  {item.label}
                </ContextMenu.Item>
              ))}
            </LiquidGlassCard>
          </div>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
