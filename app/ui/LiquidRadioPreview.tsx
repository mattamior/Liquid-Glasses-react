"use client";

import { useState } from "react";
import { LiquidRadioGroup } from "../apple-clear/LiquidRadioGroup";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidRadioPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [status, setStatus] = useState("ALL");
  const copy = PREVIEW_COPY.radio;

  return (
    <OverlayPreviewStage>
      <LiquidRadioGroup
        name="account-status"
        theme={theme}
        value={status}
        onValueChange={setStatus}
        options={[
          { value: "ALL", label: previewText(locale, copy.all) },
          { value: "ENABLED", label: previewText(locale, copy.enabled) },
          { value: "DISABLED", label: previewText(locale, copy.disabled) },
        ]}
      />
      <p className="ui-studio__value">{status}</p>
    </OverlayPreviewStage>
  );
}
