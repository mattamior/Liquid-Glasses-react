// Copy to src/liquid-glass/strict-adapter.tsx beside the frozen kernel/ folder.
import "./kernel/v2-strict.css";
import { LiquidGlassV2Kernel, type V2StrictKernelConfig } from "./kernel/LiquidGlassV2Kernel";

export interface V2StrictAdapterConfig extends V2StrictKernelConfig {
  shellClassName?: string;
}

export function V2StrictAdapter({ shellClassName, ...config }: V2StrictAdapterConfig) {
  return <section className={shellClassName} data-liquid-glass-adapter="v2-default" data-liquid-glass-kernel="v2"><LiquidGlassV2Kernel config={config} /></section>;
}
