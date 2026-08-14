export interface LiquidGlassConformanceSceneProps {
  copy: "visible" | "replica";
  role?: string;
}

/**
 * Pass this renderer as `controlledScene` to the strict adapter. The frozen
 * kernel calls it for the visible world and each replica; do not mount a
 * sibling scene in the route.
 */
export function LiquidGlassConformanceScene({ copy, role }: LiquidGlassConformanceSceneProps) {
  return (
    <div aria-hidden="true" data-liquid-glass-controlled-scene="deterministic" data-liquid-glass-scene-copy={copy} data-liquid-glass-role={role} data-liquid-glass-scene-source="conformance" style={{ inset: 0, overflow: "hidden", pointerEvents: "none", position: "absolute" }}>
      <div data-liquid-glass-scene-layer="grid" style={{ backgroundImage: "linear-gradient(rgb(255 255 255 / 28%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 28%) 1px, transparent 1px)", backgroundSize: "36px 36px", inset: 0, position: "absolute" }} />
      <p data-liquid-glass-scene-layer="type" style={{ color: "white", font: "700 clamp(32px, 8vw, 120px)/1 system-ui", left: "8vw", margin: 0, position: "absolute", top: "43vh" }}>REFRACTION EVIDENCE</p>
      <div data-liquid-glass-scene-layer="color-bands" style={{ background: "linear-gradient(90deg, #ff5f6d 0 25%, #ffc371 25% 50%, #42e695 50% 75%, #3bb2b8 75%)", bottom: "12vh", height: "14vh", left: 0, position: "absolute", right: 0 }} />
    </div>
  );
}
