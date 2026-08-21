"use client";

import { useState } from "react";
import { LiquidMenubar } from "../apple-clear/LiquidMenubar";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

export function LiquidMenubarPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidMenubar key={theme} theme={theme} onValueChange={(group, item) => setValue(`${group}/${item}`)} scene={StageWash} />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
