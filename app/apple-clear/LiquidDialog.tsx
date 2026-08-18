"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";
import "./liquid-overlays.css";

export interface LiquidDialogProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  trigger?: ReactNode;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

export function LiquidDialog({
  items,
  value,
  defaultValue,
  onValueChange,
  title = "菜单",
  trigger,
  theme,
  optics,
}: LiquidDialogProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? items?.[0]?.value ?? "");
  const selected = value ?? uncontrolled;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="liquid-overlay-trigger">
          {trigger ?? "打开对话框"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="liquid-dialog-overlay" />
        <Dialog.Content className="liquid-dialog-content" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <LiquidMenu
            title={title}
            items={items}
            value={selected}
            theme={theme}
            optics={optics}
            onValueChange={(next) => {
              if (value === undefined) setUncontrolled(next);
              onValueChange?.(next);
              setOpen(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
