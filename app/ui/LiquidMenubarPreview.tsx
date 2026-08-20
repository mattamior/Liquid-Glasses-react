"use client";

import { useState } from "react";
import { LiquidMenubar } from "../apple-clear/LiquidMenubar";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

export function LiquidMenubarPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidMenubar key={theme} theme={theme} onValueChange={(group, item) => setValue(`${group}/${item}`)} />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
