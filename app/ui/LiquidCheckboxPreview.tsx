"use client";

import { useState } from "react";
import { LiquidCheckbox } from "../apple-clear/LiquidCheckbox";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

const GAMES = ["10001", "10002", "10003"] as const;

export function LiquidCheckboxPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [selected, setSelected] = useState<string[]>(["10001"]);
  const copy = PREVIEW_COPY.checkbox;

  return (
    <OverlayPreviewStage>
      <div className="liquid-control-stack">
        {GAMES.map((id) => (
          <LiquidCheckbox
            key={id}
            id={`game-${id}`}
            theme={theme}
            checked={selected.includes(id)}
            onCheckedChange={(checked) => {
              setSelected((current) => (checked ? [...current, id] : current.filter((value) => value !== id)));
            }}
          >
            {previewText(locale, copy.game)} {id}
          </LiquidCheckbox>
        ))}
      </div>
      <p className="ui-studio__value">{selected.join(", ") || previewText(locale, copy.empty)}</p>
    </OverlayPreviewStage>
  );
}
