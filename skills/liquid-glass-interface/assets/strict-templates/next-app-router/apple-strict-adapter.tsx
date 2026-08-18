"use client";

import "./kernel/apple-clear.css";
import { LiquidMenu, type LiquidMenuProps } from "./kernel/LiquidMenu";

export function AppleClearStrictAdapter(props: LiquidMenuProps) {
  return (
    <section data-liquid-glass-adapter="apple-liquid-glass" data-liquid-glass-kernel="apple">
      <LiquidMenu {...props} />
    </section>
  );
}
