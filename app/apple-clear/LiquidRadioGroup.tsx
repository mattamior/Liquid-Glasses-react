"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { type ReactNode } from "react";
import "./liquid-controls.css";

export interface LiquidRadioOption {
  value: string;
  label: ReactNode;
}

export interface LiquidRadioGroupProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  theme?: "light" | "dark";
  options: readonly LiquidRadioOption[];
  onValueChange?: (value: string) => void;
}

export function LiquidRadioGroup({
  name,
  value,
  defaultValue,
  theme,
  options,
  onValueChange,
}: LiquidRadioGroupProps) {
  return (
    <RadioGroup.Root
      className="liquid-radio-group"
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      {options.map((option) => {
        const id = `${name ?? "liquid-radio"}-${option.value}`;
        return (
          <label className="liquid-choice" data-theme={theme} htmlFor={id} key={option.value}>
            <RadioGroup.Item id={id} className="liquid-radio" data-theme={theme} value={option.value}>
              <RadioGroup.Indicator>
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <circle cx="6" cy="6" r="3.2" fill="currentColor" />
                </svg>
              </RadioGroup.Indicator>
            </RadioGroup.Item>
            {option.label}
          </label>
        );
      })}
    </RadioGroup.Root>
  );
}
