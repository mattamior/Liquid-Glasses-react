"use client";

import { useState } from "react";
import { LiquidSelect } from "../apple-clear/LiquidSelect";
import { PREVIEW_COPY, PREVIEW_MENU_ITEMS, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidSelectPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("");

  return (
    <OverlayPreviewStage>
      <LiquidSelect
        key={`${theme}-${locale}`}
        theme={theme}
        items={PREVIEW_MENU_ITEMS[locale]}
        value={value}
        onValueChange={setValue}
        title={previewText(locale, PREVIEW_COPY.selectTitle)}
        placeholder={previewText(locale, PREVIEW_COPY.selectPlaceholder)}
        scene={StageWash}
      />
      <p className="ui-studio__value">onValueChange: {value || "—"}</p>
    </OverlayPreviewStage>
  );
}
