// Copy to src/liquid-glass/v3-conformance-route.tsx. The mounted
// v3-conformance-router-consumer.tsx template registers this route.
import { V3StrictAdapter } from "./strict-adapter";
import { LiquidGlassConformanceScene } from "./conformance-scene";

export function V3ConformanceRoute() {
  if (import.meta.env.PROD) return null;

  return <section data-liquid-glass-conformance="v3-horizontal" data-optics-required="edge" data-liquid-glass-role="v3-conformance-route"><V3StrictAdapter controlledScene={LiquidGlassConformanceScene} initialOptics="edge" navItems={[{ id: "follow", label: "Follow", route: "/follow" }, { id: "market", label: "Market", route: "/market" }]} /></section>;
}
