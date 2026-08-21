"use client";

import { useState } from "react";
import { LiquidMenu } from "../apple-clear/LiquidMenu";
import { PreviewStage } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

const ITEMS = [
  { value: "home", label: "主页" },
  { value: "photos", label: "照片" },
  { value: "messages", label: "信息" },
  { value: "settings", label: "设置" },
] as const;

export function LiquidMenuPreview() {
  const { theme } = useUiTheme();
  const [value, setValue] = useState("home");

  return (
    <PreviewStage overlay probe>
      <LiquidMenu key={theme} theme={theme} title="菜单" items={ITEMS} value={value} onValueChange={setValue} />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </PreviewStage>
  );
}
