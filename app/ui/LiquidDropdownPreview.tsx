"use client";

import { useState } from "react";
import { LiquidDropdown } from "../apple-clear/LiquidDropdown";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

const ITEMS = [
  { value: "home", label: "主页" },
  { value: "photos", label: "照片" },
  { value: "messages", label: "信息" },
  { value: "settings", label: "设置" },
] as const;

export function LiquidDropdownPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("home");

  return (
    <OverlayPreviewStage>
      <LiquidDropdown key={theme} theme={theme} items={ITEMS} value={value} onValueChange={setValue} title="菜单" />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
