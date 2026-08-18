"use client";

import { usePathname, useRouter } from "next/navigation";
import { LiquidMenu } from "../apple-clear/LiquidMenu";
import { UI_CATALOG } from "./catalog";

export function CatalogNav() {
  const router = useRouter();
  const pathname = usePathname();
  const current =
    UI_CATALOG.find((entry) => pathname === `/ui/${entry.slug}` || pathname.endsWith(`/${entry.slug}`))
      ?.slug ?? UI_CATALOG[0].slug;

  return (
    <LiquidMenu
      title="Components"
      theme="dark"
      items={UI_CATALOG.map((entry) => ({ value: entry.slug, label: entry.title }))}
      value={current}
      onValueChange={(slug) => {
        if (slug !== current) router.push(`/ui/${slug}`);
      }}
    />
  );
}
