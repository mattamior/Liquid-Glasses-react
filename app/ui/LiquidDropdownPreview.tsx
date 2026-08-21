"use client";

import { useState } from "react";
import { LiquidDropdown } from "../apple-clear/LiquidDropdown";
import { PREVIEW_COPY, PREVIEW_MENU_ITEMS, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidDropdownPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("home");

  return (
    <OverlayPreviewStage>
      <LiquidDropdown
        key={`${theme}-${locale}`}
        theme={theme}
        items={PREVIEW_MENU_ITEMS[locale]}
        value={value}
        onValueChange={setValue}
        title={previewText(locale, PREVIEW_COPY.menuTitle)}
        scene={StageWash}
      />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
