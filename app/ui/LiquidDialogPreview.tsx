"use client";

import { useState } from "react";
import { LiquidDialog } from "../apple-clear/LiquidDialog";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidDialogPreview() {
  const [value, setValue] = useState("home");

  return (
    <div className="ui-studio__preview ui-studio__preview--dropdown">
      <LiquidDialog items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} trigger="打开对话框" />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </div>
  );
}
