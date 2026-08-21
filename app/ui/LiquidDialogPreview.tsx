"use client";

import { useState } from "react";
import { LiquidDialog } from "../apple-clear/LiquidDialog";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidDialogPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const copy = PREVIEW_COPY.dialog;

  return (
    <OverlayPreviewStage>
      <LiquidDialog
        key={`${theme}-${locale}`}
        theme={theme}
        scene={StageWash}
        trigger={previewText(locale, copy.trigger)}
        title={previewText(locale, copy.title)}
        open={open}
        onOpenChange={setOpen}
      >
        <p className="liquid-popover-demo__kicker">{previewText(locale, copy.kicker)}</p>
        <h3 className="liquid-popover-demo__title">{previewText(locale, copy.heading)}</h3>
        <p className="liquid-popover-demo__copy">{previewText(locale, copy.copy)}</p>
        <div className="liquid-dialog-demo__actions">
          <button type="button" className="liquid-popover-demo__action" onClick={() => setOpen(false)}>
            {previewText(locale, copy.cancel)}
          </button>
          <button
            type="button"
            className="liquid-popover-demo__action liquid-dialog-demo__danger"
            onClick={() => {
              setDeleted(true);
              setOpen(false);
            }}
          >
            {previewText(locale, copy.remove)}
          </button>
        </div>
      </LiquidDialog>
      <p className="ui-studio__value">{previewText(locale, deleted ? copy.deleted : copy.kept)}</p>
    </OverlayPreviewStage>
  );
}
