"use client";

import { useState } from "react";
import { LiquidContextMenu } from "../apple-clear/LiquidContextMenu";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidContextMenuPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidContextMenu
        key={`${theme}-${locale}`}
        theme={theme}
        title={previewText(locale, PREVIEW_COPY.contextTitle)}
        items={PREVIEW_COPY.contextItems[locale]}
        onValueChange={setValue}
        scene={StageWash}
      >
        {previewText(locale, PREVIEW_COPY.contextSurface)}
      </LiquidContextMenu>
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
