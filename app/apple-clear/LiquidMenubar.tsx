"use client";

import * as Menubar from "@radix-ui/react-menubar";
import { useEffect, useRef, useState } from "react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import "./liquid-overlays.css";

export interface LiquidMenubarAction {
  value: string;
  label: string;
}

export interface LiquidMenubarGroup {
  value: string;
  label: string;
  items: readonly LiquidMenubarAction[];
}

export interface LiquidMenubarProps {
  groups?: readonly LiquidMenubarGroup[];
  onValueChange?: (group: string, value: string) => void;
  theme?: "light" | "dark";
  optics?: "enhanced" | "baseline";
}

const DEFAULT_GROUPS: readonly LiquidMenubarGroup[] = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "cut", label: "剪切" },
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴" },
    ],
  },
];

export function LiquidMenubar({
  groups = DEFAULT_GROUPS,
  onValueChange,
  theme,
  optics,
}: LiquidMenubarProps) {
  const [openMenu, setOpenMenu] = useState("");
  const pressTimer = useRef<number>(0);
  const [pressing, setPressing] = useState("");

  const armPress = (group: string) => {
    window.clearTimeout(pressTimer.current);
    setPressing(group);
  };

  const releasePress = (delay = 160) => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressing(""), delay);
  };

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  return (
    <Menubar.Root
      className="liquid-menubar"
      value={openMenu}
      onValueChange={(next) => {
        if (!next) {
          releasePress(0);
        } else {
          releasePress(120);
        }
        setOpenMenu(next);
      }}
    >
      {groups.map((group) => (
        <Menubar.Menu key={group.value} value={group.value}>
          <Menubar.Trigger
            className="liquid-menubar-trigger"
            data-press={pressing === group.value ? "" : undefined}
            onPointerDown={() => armPress(group.value)}
            onPointerUp={() => releasePress(180)}
            onPointerCancel={() => releasePress(0)}
            onBlur={() => releasePress(0)}
          >
            {group.label}
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="liquid-overlay-content liquid-menubar-content"
              align="start"
              sideOffset={6}
              aria-label={group.label}
            >
              <div className="liquid-menubar-pop">
                <LiquidGlassCard title={group.label} theme={theme} optics={optics}>
                  {group.items.map((item) => (
                    <Menubar.Item
                      key={item.value}
                      className="liquid-menubar-action"
                      onSelect={() => onValueChange?.(group.value, item.value)}
                    >
                      {item.label}
                    </Menubar.Item>
                  ))}
                </LiquidGlassCard>
              </div>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  );
}
