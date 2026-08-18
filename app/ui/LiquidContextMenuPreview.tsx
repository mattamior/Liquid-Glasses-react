"use client";

import { useState } from "react";
import { LiquidContextMenu } from "../apple-clear/LiquidContextMenu";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidContextMenuPreview() {
  const [value, setValue] = useState("home");

  return (
    <div className="ui-studio__preview ui-studio__preview--dropdown">
      <LiquidContextMenu items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue}>
        在此区域右键
      </LiquidContextMenu>
      <p className="ui-studio__value">onValueChange: {value}</p>
    </div>
  );
}
