// Copy to src/liquid-glass/strict-adapter.tsx beside the frozen kernel/ folder.
import "./kernel/v3-strict.css";
import { LiquidGlassV3Kernel, type V3StrictKernelConfig } from "./kernel/LiquidGlassV3Kernel";

export interface V3StrictAdapterConfig extends V3StrictKernelConfig {
  shellClassName?: string;
}

export function V3StrictAdapter({ shellClassName, ...config }: V3StrictAdapterConfig) {
  return <section className={shellClassName} data-liquid-glass-adapter="v3-horizontal" data-liquid-glass-kernel="v3"><LiquidGlassV3Kernel config={config} /></section>;
}
