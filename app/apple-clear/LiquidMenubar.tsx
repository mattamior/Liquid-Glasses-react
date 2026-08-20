"use client";

import * as Menubar from "@radix-ui/react-menubar";
import { useEffect, useRef, useState } from "react";
import { LiquidMenu, type LiquidMenuItem } from "./LiquidMenu";
import "./liquid-overlays.css";

export interface LiquidMenubarGroup {
  value: string;
  label: string;
  items: readonly LiquidMenuItem[];
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

function initialSelection(groups: readonly LiquidMenubarGroup[]) {
  return Object.fromEntries(groups.map((group) => [group.value, group.items[0]?.value ?? ""]));
}

export function LiquidMenubar({
  groups = DEFAULT_GROUPS,
  onValueChange,
  theme,
  optics,
}: LiquidMenubarProps) {
  const [openMenu, setOpenMenu] = useState("");
  const [selectedByGroup, setSelectedByGroup] = useState(initialSelection(groups));
  const closeAfterCommit = useRef(false);
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

  const commitItem = (group: string, next: string) => {
    setSelectedByGroup((current) => ({ ...current, [group]: next }));
    onValueChange?.(group, next);
    if (closeAfterCommit.current) {
      closeAfterCommit.current = false;
      setOpenMenu("");
    }
  };

  return (
    <Menubar.Root
      className="liquid-menubar"
      value={openMenu}
      onValueChange={(next) => {
        if (!next) {
          closeAfterCommit.current = false;
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
              sideOffset={8}
              aria-label={group.label}
              onPointerDown={() => {
                closeAfterCommit.current = true;
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                closeAfterCommit.current = true;
                const phase = event.currentTarget
                  .querySelector("[data-glass-phase]")
                  ?.getAttribute("data-glass-phase");
                if (!phase || phase === "idle") setOpenMenu("");
              }}
            >
              <div className="liquid-menubar-pop">
                <LiquidMenu
                  host="nested"
                  density="compact"
                  title={group.label}
                  items={group.items}
                  value={selectedByGroup[group.value]}
                  theme={theme}
                  optics={optics}
                  onValueChange={(next) => commitItem(group.value, next)}
                />
              </div>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  );
}
