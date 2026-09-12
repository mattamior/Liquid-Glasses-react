"use client";

import { useState } from "react";
import { LiquidGlassCard } from "../apple-clear/LiquidGlassCard";
import { LiquidTree, type LiquidTreeNode } from "../apple-clear/LiquidTree";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

const TREE: LiquidTreeNode[] = [
  {
    id: "system",
    label: "System",
    children: [
      {
        id: "accounts",
        label: "Accounts",
        functions: [
          { id: "acc-read", label: "Read" },
          { id: "acc-write", label: "Write" },
        ],
      },
      { id: "regions", label: "Regions" },
    ],
  },
  {
    id: "project",
    label: "Project",
    children: [{ id: "games", label: "Games" }],
  },
];

const TREE_ZH: LiquidTreeNode[] = [
  {
    id: "system",
    label: "系统",
    children: [
      {
        id: "accounts",
        label: "账号",
        functions: [
          { id: "acc-read", label: "读取" },
          { id: "acc-write", label: "写入" },
        ],
      },
      { id: "regions", label: "区域" },
    ],
  },
  {
    id: "project",
    label: "项目",
    children: [{ id: "games", label: "游戏" }],
  },
];

export function LiquidTreePreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.tree;
  const [selected, setSelected] = useState("accounts");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<string[]>(["acc-read"]);
  const nodes = locale === "en" ? TREE : TREE_ZH;

  return (
    <OverlayPreviewStage>
      <LiquidGlassCard
        key={`${theme}-${locale}`}
        theme={theme}
        title={previewText(locale, copy.title)}
        scene={StageWash}
      >
        <LiquidTree
          nodes={nodes}
          selectedId={selected}
          collapsedIds={collapsed}
          theme={theme}
          checkedIds={checked}
          onSelect={setSelected}
          onToggle={(id) => {
            setCollapsed((current) => {
              const next = new Set(current);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          onToggleChecked={(id) => {
            setChecked((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
          }}
        />
      </LiquidGlassCard>
      <p className="ui-studio__value">
        {selected} · {checked.join(",") || previewText(locale, copy.empty)}
      </p>
    </OverlayPreviewStage>
  );
}
