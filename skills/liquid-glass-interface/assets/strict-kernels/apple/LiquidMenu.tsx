"use client";

import { LiquidGlassAppleClearKernel, type AppleClearKernelConfig, type AppleClearNavItem } from "./LiquidGlassAppleClearKernel";

export interface LiquidMenuItem {
  value: string;
  label: string;
}

export interface LiquidMenuProps {
  items?: readonly LiquidMenuItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  title?: string;
  theme?: AppleClearKernelConfig["initialTheme"];
  optics?: AppleClearKernelConfig["initialOptics"];
  scene?: AppleClearKernelConfig["controlledScene"];
  host?: AppleClearKernelConfig["host"];
  density?: AppleClearKernelConfig["density"];
}

function toNavItems(items: readonly LiquidMenuItem[] | undefined): AppleClearNavItem[] | undefined {
  if (!items || items.length < 1) return undefined;
  return items.map((item) => ({ id: item.value, label: item.label }));
}

/** Portable menu. Copy the kernel; do not regenerate optics. */
export function LiquidMenu({
  items,
  value,
  defaultValue,
  onValueChange,
  title,
  theme,
  optics,
  scene,
  host,
  density,
}: LiquidMenuProps) {
  return (
    <LiquidGlassAppleClearKernel
      config={{
        variant: "embedded",
        host,
        density,
        title,
        navItems: toNavItems(items),
        value,
        initialItemId: defaultValue,
        initialTheme: theme,
        initialOptics: optics,
        controlledScene: scene,
        onRouteCommit: (item) => onValueChange?.(item.id),
      }}
    />
  );
}
