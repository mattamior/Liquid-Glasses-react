"use client";

import { useState } from "react";
import { LiquidSelect } from "../apple-clear/LiquidSelect";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { PREVIEW_MENU_ITEMS } from "./preview-items";
import { useUiTheme } from "./UiTheme";

export function LiquidSelectPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("");

  return (
    <OverlayPreviewStage>
      <LiquidSelect key={theme} theme={theme} items={PREVIEW_MENU_ITEMS} value={value} onValueChange={setValue} />
      <p className="ui-studio__value">onValueChange: {value || "—"}</p>
    </OverlayPreviewStage>
  );
}
