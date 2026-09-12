"use client";

import { useState } from "react";
import { LiquidRadioGroup } from "../apple-clear/LiquidRadioGroup";
import { LiquidToolbar } from "../apple-clear/LiquidToolbar";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidToolbarPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.toolbar;
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [status, setStatus] = useState("ALL");

  return (
    <OverlayPreviewStage>
      <LiquidToolbar
        theme={theme}
        query={query}
        setQuery={setQuery}
        placeholder={previewText(locale, copy.search)}
        searchLabel={previewText(locale, copy.query)}
        resetLabel={previewText(locale, copy.reset)}
        onSearch={() => setApplied(query.trim())}
        onReset={() => {
          setQuery("");
          setApplied("");
          setStatus("ALL");
        }}
      >
        <LiquidRadioGroup
          name="toolbar-status"
          theme={theme}
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "ALL", label: previewText(locale, PREVIEW_COPY.radio.all) },
            { value: "ENABLED", label: previewText(locale, PREVIEW_COPY.radio.enabled) },
            { value: "DISABLED", label: previewText(locale, PREVIEW_COPY.radio.disabled) },
          ]}
        />
      </LiquidToolbar>
      <p className="ui-studio__value">
        {applied || previewText(locale, copy.empty)} · {status}
      </p>
    </OverlayPreviewStage>
  );
}
