"use client";

import { useState } from "react";
import { LiquidLabel } from "../apple-clear/LiquidInput";
import { LiquidTextarea } from "../apple-clear/LiquidTextarea";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidTextareaPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("");
  const copy = PREVIEW_COPY.textarea;

  return (
    <OverlayPreviewStage>
      <div className="liquid-field">
        <LiquidLabel theme={theme} htmlFor="liquid-desc">
          {previewText(locale, copy.label)}
        </LiquidLabel>
        <LiquidTextarea
          id="liquid-desc"
          theme={theme}
          rows={3}
          placeholder={previewText(locale, copy.placeholder)}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <p className="ui-studio__value">{value || previewText(locale, copy.empty)}</p>
    </OverlayPreviewStage>
  );
}
