"use client";

import { useState } from "react";
import { LiquidPopover } from "../apple-clear/LiquidPopover";
import { OverlayPreviewStage } from "./OverlayPreviewStage";

export function LiquidPopoverPreview() {
  const [connected, setConnected] = useState(true);

  return (
    <OverlayPreviewStage>
      <LiquidPopover trigger="网络" title="网络">
        <p className="liquid-popover-demo__kicker">状态</p>
        <h3 className="liquid-popover-demo__title">办公室 Wi-Fi</h3>
        <p className="liquid-popover-demo__copy">{connected ? "已连接 · 5 GHz" : "未连接"}</p>
        <button
          type="button"
          className="liquid-popover-demo__action"
          onClick={() => setConnected((on) => !on)}
        >
          {connected ? "断开" : "连接"}
        </button>
      </LiquidPopover>
      <p className="ui-studio__value">{connected ? "已连接" : "未连接"}</p>
    </OverlayPreviewStage>
  );
}
