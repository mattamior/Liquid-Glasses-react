"use client";

import { useState } from "react";
import { LiquidContextMenu } from "../apple-clear/LiquidContextMenu";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidContextMenuPreview() {
  const [value, setValue] = useState("home");

  return (
    <OverlayPreviewStage>
      <LiquidContextMenu items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue}>
        在此区域右键
      </LiquidContextMenu>
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
