"use client";

import { useState, type ReactNode } from "react";

export function OverlayPreviewStage({ children }: { children: ReactNode }) {
  const [probe, setProbe] = useState(false);

  return (
    <div className={`ui-studio__preview ui-studio__preview--dropdown${probe ? " is-probe" : ""}`}>
      <button
        type="button"
        className="ui-studio__probe-toggle"
        aria-pressed={probe}
        onClick={() => setProbe((on) => !on)}
      >
        文字底
      </button>
      {children}
    </div>
  );
}
