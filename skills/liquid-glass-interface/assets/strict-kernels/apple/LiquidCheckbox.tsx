"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { type ReactNode } from "react";
import "./liquid-controls.css";

export interface LiquidCheckboxProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  theme?: "light" | "dark";
  children?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export function LiquidCheckbox({
  id,
  checked,
  defaultChecked,
  disabled,
  theme,
  children,
  onCheckedChange,
}: LiquidCheckboxProps) {
  return (
    <label className="liquid-choice" data-theme={theme} htmlFor={id}>
      <Checkbox.Root
        id={id}
        className="liquid-checkbox"
        data-theme={theme}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange?.(next === true)}
      >
        <Checkbox.Indicator>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2 6.2 4.6 9 10 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>
      {children}
    </label>
  );
}
