"use client";

import { LiquidPill } from "../apple-clear/LiquidPill";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidPillPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.pill;

  return (
    <OverlayPreviewStage>
      <div className="liquid-control-row">
        <LiquidPill theme={theme} tone="positive">
          ENABLED
        </LiquidPill>
        <LiquidPill theme={theme} tone="pending">
          PRE_ONLINE
        </LiquidPill>
        <LiquidPill theme={theme} tone="disabled">
          DISABLED
        </LiquidPill>
        <LiquidPill theme={theme} tone="muted">
          UNKNOWN
        </LiquidPill>
      </div>
      <p className="ui-studio__value">{previewText(locale, copy.stage)}</p>
    </OverlayPreviewStage>
  );
}
