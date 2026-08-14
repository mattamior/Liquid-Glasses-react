// Copy to src/liquid-glass/strict-adapter.tsx beside the frozen kernel/ folder.
import "./kernel/v1-strict.css";
import {
  LiquidGlassV1Kernel,
  type V1StrictKernelConfig,
} from "./kernel/LiquidGlassV1Kernel";

export interface V1StrictAdapterConfig {
  config?: V1StrictKernelConfig;
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
