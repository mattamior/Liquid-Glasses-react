"use client";

import { useState } from "react";
import { LiquidContextMenu } from "../apple-clear/LiquidContextMenu";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

export function LiquidContextMenuPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidContextMenu key={theme} theme={theme} onValueChange={setValue}>
        在此区域右键
      </LiquidContextMenu>
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
