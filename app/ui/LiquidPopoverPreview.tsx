"use client";

import { useState } from "react";
import { LiquidPopover } from "../apple-clear/LiquidPopover";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidPopoverPreview() {
  const [value, setValue] = useState("home");

  return (
    <OverlayPreviewStage>
      <LiquidPopover items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} trigger="打开 Popover" />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
