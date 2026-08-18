"use client";

import { useState } from "react";
import { LiquidPopover } from "../apple-clear/LiquidPopover";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidPopoverPreview() {
  const [value, setValue] = useState("home");

  return (
    <div className="ui-studio__preview ui-studio__preview--dropdown">
      <LiquidPopover items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} trigger="打开 Popover" />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </div>
  );
}
