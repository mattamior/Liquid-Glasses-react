"use client";

import { usePathname, useRouter } from "next/navigation";
import { LiquidMenu } from "../apple-clear/LiquidMenu";
import { UI_CATALOG } from "./catalog";
import { getNavItems } from "./copy";
import { useUiLocale } from "./UiLocale";
import { useUiTheme } from "./UiTheme";

export function CatalogNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useUiTheme();
  const { locale } = useUiLocale();
  const current =
    UI_CATALOG.find((entry) => pathname === `/ui/${entry.slug}` || pathname.endsWith(`/${entry.slug}`))
      ?.slug ?? UI_CATALOG[0].slug;

  return (
    <LiquidMenu
      key={`${theme}-${locale}`}
      title="Components"
      theme={theme}
      items={getNavItems(locale)}
      value={current}
      onValueChange={(slug) => {
        if (slug !== current) router.push(`/ui/${slug}`);
      }}
    />
  );
}
