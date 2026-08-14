"use client";

// Copy to app/__liquid-glass-conformance/page.tsx. This filesystem route is the
// Next App Router registration; production resolves it as not found.
import { notFound } from "next/navigation";
import { V3StrictAdapter } from "../liquid-glass/strict-adapter";
import { LiquidGlassConformanceScene } from "./conformance-scene";

export default function V3ConformancePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <section data-liquid-glass-conformance="v3-horizontal" data-optics-required="edge" data-liquid-glass-role="v3-conformance-route">
      <V3StrictAdapter controlledScene={LiquidGlassConformanceScene} initialOptics="edge" navItems={[
        { id: "follow", label: "Follow", route: "/follow" },
        { id: "market", label: "Market", route: "/market" },
      ]} />
    </section>
  );
}
