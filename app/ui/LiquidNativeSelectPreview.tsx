"use client";

import { useState } from "react";
import { LiquidLabel } from "../apple-clear/LiquidInput";
import { LiquidNativeSelect } from "../apple-clear/LiquidNativeSelect";
import { PREVIEW_COPY, previewText } from "./copy";
import { OverlayPreviewStage } from "./OverlayPreviewStage";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function LiquidNativeSelectPreview() {
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const copy = PREVIEW_COPY.nativeSelect;
  const [role, setRole] = useState("SYSTEM");
  const [admins, setAdmins] = useState<string[]>(["1"]);

  return (
    <OverlayPreviewStage>
      <div className="liquid-control-stack">
        <div className="liquid-field">
          <LiquidLabel theme={theme} htmlFor="role-type">
            {previewText(locale, copy.role)}
          </LiquidLabel>
          <LiquidNativeSelect
            id="role-type"
            theme={theme}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="SYSTEM">SYSTEM</option>
            <option value="NORMAL">NORMAL</option>
          </LiquidNativeSelect>
        </div>
        <div className="liquid-field">
          <LiquidLabel theme={theme} htmlFor="project-admins">
            {previewText(locale, copy.admins)}
          </LiquidLabel>
          <LiquidNativeSelect
            id="project-admins"
            theme={theme}
            multiple
            value={admins}
            onChange={(event) =>
              setAdmins(Array.from(event.target.selectedOptions, (option) => option.value))
            }
          >
            <option value="1">admin</option>
            <option value="2">ops</option>
            <option value="3">qa</option>
          </LiquidNativeSelect>
          <p className="liquid-field-hint">{previewText(locale, copy.hint)}</p>
        </div>
      </div>
      <p className="ui-studio__value">
        {role} · {admins.join(",")}
      </p>
    </OverlayPreviewStage>
  );
}
