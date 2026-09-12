"use client";

import { LiquidGlassCard } from "../apple-clear/LiquidGlassCard";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidCardPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.card;

  return (
    <OverlayPreviewStage>
      <LiquidGlassCard key={`${theme}-${locale}`} theme={theme} title={previewText(locale, copy.title)} scene={StageWash}>
        <p className="liquid-popover-demo__kicker">{previewText(locale, copy.kicker)}</p>
        <h3 className="liquid-popover-demo__title">{previewText(locale, copy.heading)}</h3>
        <p className="liquid-popover-demo__copy">{previewText(locale, copy.copy)}</p>
      </LiquidGlassCard>
      <p className="ui-studio__value">{previewText(locale, copy.stage)}</p>
    </OverlayPreviewStage>
  );
}
