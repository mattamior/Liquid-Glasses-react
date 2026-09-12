"use client";

import { useState } from "react";
import { LiquidAlertAction, LiquidAlertCancel, LiquidAlertDialog } from "../apple-clear/LiquidAlertDialog";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidAlertDialogPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const copy = PREVIEW_COPY.alert;

  return (
    <OverlayPreviewStage>
      <LiquidAlertDialog
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
          <LiquidAlertCancel asChild>
            <button type="button" className="liquid-popover-demo__action">
              {previewText(locale, copy.cancel)}
            </button>
          </LiquidAlertCancel>
          <LiquidAlertAction asChild>
            <button
              type="button"
              className="liquid-popover-demo__action liquid-dialog-demo__danger"
              onClick={() => setDeleted(true)}
            >
              {previewText(locale, copy.remove)}
            </button>
          </LiquidAlertAction>
        </div>
      </LiquidAlertDialog>
      <p className="ui-studio__value">{previewText(locale, deleted ? copy.deleted : copy.kept)}</p>
    </OverlayPreviewStage>
  );
}
