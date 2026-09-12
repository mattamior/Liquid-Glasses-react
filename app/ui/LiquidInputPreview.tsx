"use client";

import { useState } from "react";
import { LiquidInput, LiquidLabel } from "../apple-clear/LiquidInput";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidInputPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [account, setAccount] = useState("admin");
  const copy = PREVIEW_COPY.input;

  return (
    <OverlayPreviewStage>
      <div className="liquid-control-stack">
        <div className="liquid-field">
          <LiquidLabel theme={theme} htmlFor="liquid-account">
            {previewText(locale, copy.account)}
          </LiquidLabel>
          <LiquidInput
            id="liquid-account"
            theme={theme}
            value={account}
            onChange={(event) => setAccount(event.target.value)}
          />
        </div>
        <div className="liquid-field">
          <LiquidLabel theme={theme} htmlFor="liquid-email">
            {previewText(locale, copy.email)}
          </LiquidLabel>
          <LiquidInput
            id="liquid-email"
            theme={theme}
            type="email"
            placeholder={previewText(locale, copy.placeholder)}
          />
          <p className="liquid-field-hint">{previewText(locale, copy.hint)}</p>
        </div>
        <div className="liquid-field">
          <LiquidLabel theme={theme} htmlFor="liquid-code">
            {previewText(locale, copy.code)}
          </LiquidLabel>
          <LiquidInput id="liquid-code" theme={theme} value="APAC" disabled readOnly />
          <p className="liquid-field-error">{previewText(locale, copy.error)}</p>
        </div>
      </div>
      <p className="ui-studio__value">{account}</p>
    </OverlayPreviewStage>
  );
}
