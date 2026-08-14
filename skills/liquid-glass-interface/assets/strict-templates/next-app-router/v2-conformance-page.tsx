"use client";

// Copy to app/__liquid-glass-conformance/page.tsx. This filesystem route is the
// Next App Router registration; production resolves it as not found.
import { notFound } from "next/navigation";
import { V2StrictAdapter } from "../liquid-glass/strict-adapter";
import { LiquidGlassConformanceScene } from "./conformance-scene";

export default function V2ConformancePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main data-liquid-glass-conformance="v2-default" data-optics-required="enhanced">
      <V2StrictAdapter controlledScene={LiquidGlassConformanceScene} initialItemId="overview" initialOptics="enhanced" navItems={[
        { id: "overview", label: "Overview", eyebrow: "CONFORMANCE / 01", description: "Controlled Enhanced refraction evidence.", route: "/overview", cards: [{ label: "Signal", value: "98", detail: "Optical card evidence" }] },
        { id: "activity", label: "Activity", eyebrow: "CONFORMANCE / 02", description: "Delayed semantic commit evidence.", route: "/activity", cards: [{ label: "Flow", value: "24", detail: "Pointer contract evidence" }] },
      ]} />
    </main>
  );
}
