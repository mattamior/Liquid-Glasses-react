"use client";

import { useState } from "react";
import { LiquidButton } from "../apple-clear/LiquidButton";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidButtonPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("idle");
  const copy = PREVIEW_COPY.button;

  return (
    <OverlayPreviewStage>
      <div className="liquid-control-stack">
        <div className="liquid-control-row">
          <LiquidButton theme={theme} onClick={() => setValue("create")}>
            {previewText(locale, copy.primary)}
          </LiquidButton>
          <LiquidButton theme={theme} variant="secondary" onClick={() => setValue("reset")}>
            {previewText(locale, copy.secondary)}
          </LiquidButton>
          <LiquidButton theme={theme} variant="destructive" onClick={() => setValue("delete")}>
            {previewText(locale, copy.destructive)}
          </LiquidButton>
        </div>
        <div className="liquid-control-row">
          <LiquidButton theme={theme} size="sm" onClick={() => setValue("sm")}>
            {previewText(locale, copy.small)}
          </LiquidButton>
          <LiquidButton theme={theme} variant="ghost" size="sm" onClick={() => setValue("ghost")}>
            {previewText(locale, copy.ghost)}
          </LiquidButton>
        </div>
      </div>
      <p className="ui-studio__value">onClick: {value}</p>
    </OverlayPreviewStage>
  );
}
