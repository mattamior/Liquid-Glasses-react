"use client";

import { useState } from "react";
import { LiquidMenubar } from "../apple-clear/LiquidMenubar";
import { PREVIEW_COPY } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidMenubarPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidMenubar
        key={`${theme}-${locale}`}
        theme={theme}
        groups={PREVIEW_COPY.menubarGroups[locale]}
        onValueChange={(group, item) => setValue(`${group}/${item}`)}
        scene={StageWash}
      />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
