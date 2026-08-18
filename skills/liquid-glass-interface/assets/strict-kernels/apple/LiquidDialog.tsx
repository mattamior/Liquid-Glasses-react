"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRef, useState, type ReactNode } from "react";
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
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAfterCommit.current = false;
        setOpen(next);
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className="liquid-overlay-trigger" aria-expanded={open}>
          {trigger ?? "打开对话框"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="liquid-dialog-overlay" />
        <Dialog.Content
          className="liquid-dialog-content"
          aria-describedby={undefined}
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
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <LiquidMenu
            host="nested"
            title={title}
            items={items}
            value={selected}
            theme={theme}
            optics={optics}
            onValueChange={commitValue}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
