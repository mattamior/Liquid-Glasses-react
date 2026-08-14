"use client";

// Copy to app/liquid-glass/strict-adapter.tsx beside the frozen kernel/ folder.
import "./kernel/v1-strict.css";
import {
  LiquidGlassV1Kernel,
  type V1StrictKernelConfig,
} from "./kernel/LiquidGlassV1Kernel";

export interface V1StrictAdapterConfig {
  /** Configure only the frozen V1 brand and destinations. */
  config?: V1StrictKernelConfig;
  /** Mount the frozen route without changing its interaction or optics. */
  shellClassName?: string;
}

export function V1StrictAdapter({ config, shellClassName }: V1StrictAdapterConfig) {
  return (
    <section className={shellClassName} data-liquid-glass-adapter="v1-fidelity" data-liquid-glass-kernel="v1">
      <LiquidGlassV1Kernel config={config} />
    </section>
  );
}

export default V1StrictAdapter;
