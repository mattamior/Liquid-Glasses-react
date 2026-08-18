"use client";

import { useState } from "react";
import { LiquidSelect } from "../apple-clear/LiquidSelect";
import { PREVIEW_MENU_ITEMS } from "./preview-items";

export function LiquidSelectPreview() {
  const [value, setValue] = useState("");

  return (
    <div className="ui-studio__preview ui-studio__preview--dropdown">
      <LiquidSelect items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} />
      <p className="ui-studio__value">onValueChange: {value || "—"}</p>
    </div>
  );
}
