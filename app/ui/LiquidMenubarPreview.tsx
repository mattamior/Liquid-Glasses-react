"use client";

import { useState } from "react";
import { LiquidMenubar } from "../apple-clear/LiquidMenubar";
import { OverlayPreviewStage } from "./OverlayPreviewStage";

export function LiquidMenubarPreview() {
  const [value, setValue] = useState("—");

  return (
    <OverlayPreviewStage>
      <LiquidMenubar onValueChange={(group, item) => setValue(`${group}/${item}`)} />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </OverlayPreviewStage>
  );
}
