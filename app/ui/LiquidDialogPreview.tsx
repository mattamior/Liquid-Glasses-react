"use client";

import { useState } from "react";
import { LiquidDialog } from "../apple-clear/LiquidDialog";
import { OverlayPreviewStage, StageWash } from "./OverlayPreviewStage";
import { useUiTheme } from "./UiTheme";

export function LiquidDialogPreview() {
  const { theme } = useUiTheme();
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <OverlayPreviewStage>
      <LiquidDialog
        key={theme}
        theme={theme}
        scene={StageWash}
        trigger="删除相册"
        title="删除相册"
        open={open}
        onOpenChange={setOpen}
      >
        <p className="liquid-popover-demo__kicker">确认</p>
        <h3 className="liquid-popover-demo__title">删除「旅行」？</h3>
        <p className="liquid-popover-demo__copy">照片会移到最近删除，30 天后清除。</p>
        <div className="liquid-dialog-demo__actions">
          <button type="button" className="liquid-popover-demo__action" onClick={() => setOpen(false)}>
            取消
          </button>
          <button
            type="button"
            className="liquid-popover-demo__action liquid-dialog-demo__danger"
            onClick={() => {
              setDeleted(true);
              setOpen(false);
            }}
          >
            删除
          </button>
        </div>
      </LiquidDialog>
      <p className="ui-studio__value">{deleted ? "已删除" : "未删除"}</p>
    </OverlayPreviewStage>
  );
}
