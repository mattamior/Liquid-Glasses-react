"use client";

import "./kernel/apple-clear.css";
import {
  LiquidGlassAppleClearKernel,
  type AppleClearKernelConfig,
} from "./kernel/LiquidGlassAppleClearKernel";

export function AppleClearStrictAdapter(config: AppleClearKernelConfig) {
  return (
    <section data-liquid-glass-adapter="apple-liquid-glass" data-liquid-glass-kernel="apple">
      <LiquidGlassAppleClearKernel config={config} />
    </section>
  );
}
