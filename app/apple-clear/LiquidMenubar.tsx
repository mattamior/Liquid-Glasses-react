"use client";

import * as Menubar from "@radix-ui/react-menubar";
import { useState } from "react";
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

export function LiquidMenubar({
  groups = DEFAULT_GROUPS,
  onValueChange,
  theme,
  optics,
}: LiquidMenubarProps) {
  const [epoch, setEpoch] = useState(0);

  return (
    <Menubar.Root key={epoch} className="liquid-menubar">
      {groups.map((group) => (
        <Menubar.Menu key={group.value}>
          <Menubar.Trigger className="liquid-menubar-trigger">{group.label}</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className="liquid-overlay-content" align="start" sideOffset={8}>
              <LiquidMenu
                title={group.label}
                items={group.items}
                theme={theme}
                optics={optics}
                onValueChange={(next) => {
                  onValueChange?.(group.value, next);
                  setEpoch((value) => value + 1);
                }}
              />
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  );
}
