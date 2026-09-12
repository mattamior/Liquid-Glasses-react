"use client";

import { LiquidCheckbox } from "./LiquidCheckbox";
import "./liquid-controls.css";

export interface LiquidTreeNode {
  id: string;
  label: string;
  children?: LiquidTreeNode[];
  functions?: { id: string; label: string }[];
}

export interface LiquidTreeProps {
  nodes: readonly LiquidTreeNode[];
  selectedId?: string;
  collapsedIds: ReadonlySet<string>;
  theme?: "light" | "dark";
  checkedIds?: readonly string[];
  onSelect?: (id: string) => void;
  onToggle?: (id: string) => void;
  onToggleChecked?: (id: string) => void;
}

export function LiquidTree({
  nodes,
  selectedId,
  collapsedIds,
  theme,
  checkedIds,
  onSelect,
  onToggle,
  onToggleChecked,
}: LiquidTreeProps) {
  return (
    <ul className="liquid-tree">
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const expanded = hasChildren && !collapsedIds.has(node.id);
        return (
          <li key={node.id}>
            <div className="liquid-tree-row">
              {hasChildren ? (
                <button
                  className="liquid-tree-toggle"
                  type="button"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "收起" : "展开"} ${node.label}`}
                  onClick={() => onToggle?.(node.id)}
                >
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d="M2.5 4.2 6 8.2 9.5 4.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ) : (
                <span className="liquid-tree-spacer" aria-hidden="true" />
              )}
              <button
                type="button"
                className="liquid-tree-select"
                data-selected={selectedId === node.id ? "" : undefined}
                onClick={() => onSelect?.(node.id)}
              >
                {node.label}
              </button>
            </div>
            {expanded && node.children ? (
              <LiquidTree
                nodes={node.children}
                selectedId={selectedId}
                collapsedIds={collapsedIds}
                theme={theme}
                checkedIds={checkedIds}
                onSelect={onSelect}
                onToggle={onToggle}
                onToggleChecked={onToggleChecked}
              />
            ) : null}
            {(!hasChildren || expanded) && node.functions?.length ? (
              <div className="liquid-control-stack" style={{ marginLeft: 28, marginBottom: 8 }}>
                {node.functions.map((item) => (
                  <LiquidCheckbox
                    key={item.id}
                    id={`tree-fn-${item.id}`}
                    theme={theme}
                    checked={checkedIds?.includes(item.id)}
                    onCheckedChange={() => onToggleChecked?.(item.id)}
                  >
                    {item.label}
                  </LiquidCheckbox>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
