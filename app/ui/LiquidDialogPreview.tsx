"use client";

import { useState } from "react";
import { LiquidDialog } from "../apple-clear/LiquidDialog";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidDialogPreview() {
  const [value, setValue] = useState("home");

  return (
    <OverlayPreviewStage>
      <LiquidDialog items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} trigger="打开对话框" />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
