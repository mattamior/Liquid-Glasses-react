"use client";

import { useState } from "react";
import { LiquidContextMenu } from "../apple-clear/LiquidContextMenu";
import { OverlayPreviewStage } from "./OverlayPreviewStage";

export function LiquidContextMenuPreview() {
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidContextMenu onValueChange={setValue}>在此区域右键</LiquidContextMenu>
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
