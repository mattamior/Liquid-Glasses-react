// Copy to src/liquid-glass/v2-conformance-route.tsx. The mounted
// v2-conformance-router-consumer.tsx template registers this route.
import { V2StrictAdapter } from "./strict-adapter";
import { LiquidGlassConformanceScene } from "./conformance-scene";

/** Requires Vite's standard `vite/client` type declaration in tsconfig. */
export function V2ConformanceRoute() {
  if (import.meta.env.PROD) return null;

  return <main data-liquid-glass-conformance="v2-default" data-optics-required="enhanced"><V2StrictAdapter controlledScene={LiquidGlassConformanceScene} initialItemId="overview" initialOptics="enhanced" navItems={[{ id: "overview", label: "Overview", eyebrow: "CONFORMANCE / 01", description: "Controlled Enhanced refraction evidence.", route: "/overview", cards: [{ label: "Signal", value: "98", detail: "Optical card evidence" }] }, { id: "activity", label: "Activity", eyebrow: "CONFORMANCE / 02", description: "Delayed semantic commit evidence.", route: "/activity", cards: [{ label: "Flow", value: "24", detail: "Pointer contract evidence" }] }]} /></main>;
}
