"use client";

import { useState } from "react";
import { LiquidSheet } from "../apple-clear/LiquidSheet";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash, useOverlayPortal } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidSheetPreview() {
  return (
    <OverlayPreviewStage>
      <LiquidSheetPreviewBody />
    </OverlayPreviewStage>
  );
}

function LiquidSheetPreviewBody() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const portal = useOverlayPortal();
  const [open, setOpen] = useState(false);
  const copy = PREVIEW_COPY.sheet;
  const title = previewText(locale, copy.title);

  return (
    <>
      <LiquidSheet
        key={`${theme}-${locale}`}
        theme={theme}
        scene={StageWash}
        container={portal}
        trigger={previewText(locale, copy.trigger)}
        title={title}
        open={open}
        onOpenChange={setOpen}
      >
        <h3 className="liquid-sheet-heading">{title}</h3>
        <dl className="liquid-detail-list">
          <div>
            <dt>{previewText(locale, copy.account)}</dt>
            <dd>admin</dd>
          </div>
          <div>
            <dt>{previewText(locale, copy.name)}</dt>
            <dd>{previewText(locale, copy.person)}</dd>
          </div>
          <div>
            <dt>{previewText(locale, copy.email)}</dt>
            <dd>admin@bb.game</dd>
          </div>
          <div>
            <dt>{previewText(locale, copy.status)}</dt>
            <dd>{previewText(locale, copy.enabled)}</dd>
          </div>
        </dl>
      </LiquidSheet>
      <p className="ui-studio__value">{previewText(locale, open ? copy.open : copy.closed)}</p>
    </>
  );
}
