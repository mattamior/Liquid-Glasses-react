"use client";

import { useState } from "react";
import { LiquidMenubar } from "../apple-clear/LiquidMenubar";

export function LiquidMenubarPreview() {
  const [value, setValue] = useState("—");

  return (
    <div className="ui-studio__preview ui-studio__preview--dropdown">
      <LiquidMenubar onValueChange={(group, item) => setValue(`${group}/${item}`)} />
      <p className="ui-studio__value">onValueChange: {value}</p>
    </div>
  );
}
