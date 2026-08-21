import { notFound } from "next/navigation";
import { UI_CATALOG, getUiCatalogEntry } from "../catalog";
import { LiquidContextMenuPreview } from "../LiquidContextMenuPreview";
import { LiquidDialogPreview } from "../LiquidDialogPreview";
import { LiquidDropdownPreview } from "../LiquidDropdownPreview";
import { LiquidMenuPreview } from "../LiquidMenuPreview";
import { LiquidMenubarPreview } from "../LiquidMenubarPreview";
import { LiquidPopoverPreview } from "../LiquidPopoverPreview";
import { LiquidSelectPreview } from "../LiquidSelectPreview";
import { UiCatalogFrame } from "../UiChrome";

export function generateStaticParams() {
  return UI_CATALOG.map((entry) => ({ slug: entry.slug }));
}

function Preview({ slug }: { slug: string }) {
  if (slug === "liquid-menu") return <LiquidMenuPreview />;
  if (slug === "liquid-dropdown") return <LiquidDropdownPreview />;
  if (slug === "liquid-context-menu") return <LiquidContextMenuPreview />;
  if (slug === "liquid-select") return <LiquidSelectPreview />;
  if (slug === "liquid-popover") return <LiquidPopoverPreview />;
  if (slug === "liquid-dialog") return <LiquidDialogPreview />;
  if (slug === "liquid-menubar") return <LiquidMenubarPreview />;
  return null;
}

export default async function UiCatalogEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getUiCatalogEntry(slug);
  if (!entry) notFound();

  return <UiCatalogFrame slug={entry.slug} preview={<Preview slug={entry.slug} />} />;
}
