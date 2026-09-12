"use client";

import { type ReactNode } from "react";
import "./liquid-controls.css";

export interface LiquidTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

export interface LiquidTableProps<T> {
  columns: readonly LiquidTableColumn<T>[];
  rows: readonly T[];
  theme?: "light" | "dark";
  empty?: ReactNode;
  getRowKey: (row: T) => string;
}

export function LiquidTable<T>({ columns, rows, theme, empty, getRowKey }: LiquidTableProps<T>) {
  if (rows.length === 0) {
    return <div className="liquid-empty">{empty ?? "没有匹配的记录。"}</div>;
  }

  return (
    <div className="liquid-table-scroll">
      <table className="liquid-table" data-theme={theme}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
