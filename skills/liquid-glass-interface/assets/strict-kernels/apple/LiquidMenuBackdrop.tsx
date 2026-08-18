import { memo } from "react";

/** Local underlay only. Parent supplies page chrome; this stays blur or solid. */
export const LiquidMenuBackdrop = memo(function LiquidMenuBackdrop({
  copy,
}: {
  copy: "visible" | "replica";
}) {
  return <div className="apple-liquid-menu-backdrop" data-copy={copy} aria-hidden="true" />;
});
