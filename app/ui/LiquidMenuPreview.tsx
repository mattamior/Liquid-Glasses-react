"use client";

import { useState } from "react";
import { LiquidMenu } from "../apple-clear/LiquidMenu";
import { PREVIEW_COPY, PREVIEW_MENU_ITEMS, previewText } from "./copy";
import { PreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidMenuPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("home");
  const items = PREVIEW_MENU_ITEMS[locale];

  return (
    <PreviewStage overlay probe>
      <LiquidMenu
        key={`${theme}-${locale}`}
        theme={theme}
        title={previewText(locale, PREVIEW_COPY.menuTitle)}
        items={items}
        value={value}
        onValueChange={setValue}
      />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </PreviewStage>
  );
}
