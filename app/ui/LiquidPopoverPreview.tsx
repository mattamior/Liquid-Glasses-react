"use client";

import { useState } from "react";
import { LiquidPopover } from "../apple-clear/LiquidPopover";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidPopoverPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [connected, setConnected] = useState(true);
  const copy = PREVIEW_COPY.popover;

  return (
    <OverlayPreviewStage>
      <LiquidPopover
        key={`${theme}-${locale}`}
        theme={theme}
        trigger={previewText(locale, copy.trigger)}
        title={previewText(locale, copy.title)}
        scene={StageWash}
      >
        <p className="liquid-popover-demo__kicker">{previewText(locale, copy.kicker)}</p>
        <h3 className="liquid-popover-demo__title">{previewText(locale, copy.name)}</h3>
        <p className="liquid-popover-demo__copy">
          {previewText(locale, connected ? copy.connected : copy.disconnected)}
        </p>
        <button
          type="button"
          className="liquid-popover-demo__action"
          onClick={() => setConnected((on) => !on)}
        >
          {previewText(locale, connected ? copy.disconnect : copy.connect)}
        </button>
      </LiquidPopover>
      <p className="ui-studio__value">{previewText(locale, connected ? copy.stageOn : copy.stageOff)}</p>
    </OverlayPreviewStage>
  );
}
