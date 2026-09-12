import { notFound } from "next/navigation";
import { UI_CATALOG, getUiCatalogEntry } from "../catalog";
import { LiquidAlertDialogPreview } from "../LiquidAlertDialogPreview";
import { LiquidButtonPreview } from "../LiquidButtonPreview";
import { LiquidCardPreview } from "../LiquidCardPreview";
import { LiquidCheckboxPreview } from "../LiquidCheckboxPreview";
import { LiquidContextMenuPreview } from "../LiquidContextMenuPreview";
import { LiquidDialogPreview } from "../LiquidDialogPreview";
import { LiquidDropdownPreview } from "../LiquidDropdownPreview";
import { LiquidInputPreview } from "../LiquidInputPreview";
import { LiquidMenuPreview } from "../LiquidMenuPreview";
import { LiquidMenubarPreview } from "../LiquidMenubarPreview";
import { LiquidNativeSelectPreview } from "../LiquidNativeSelectPreview";
import { LiquidPaginationPreview } from "../LiquidPaginationPreview";
import { LiquidPillPreview } from "../LiquidPillPreview";
import { LiquidPopoverPreview } from "../LiquidPopoverPreview";
import { LiquidRadioPreview } from "../LiquidRadioPreview";
import { LiquidSelectPreview } from "../LiquidSelectPreview";
import { LiquidSheetPreview } from "../LiquidSheetPreview";
import { LiquidTablePreview } from "../LiquidTablePreview";
import { LiquidTextareaPreview } from "../LiquidTextareaPreview";
import { LiquidToolbarPreview } from "../LiquidToolbarPreview";
import { LiquidTreePreview } from "../LiquidTreePreview";
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
  if (slug === "liquid-button") return <LiquidButtonPreview />;
  if (slug === "liquid-input") return <LiquidInputPreview />;
  if (slug === "liquid-textarea") return <LiquidTextareaPreview />;
  if (slug === "liquid-checkbox") return <LiquidCheckboxPreview />;
  if (slug === "liquid-radio") return <LiquidRadioPreview />;
  if (slug === "liquid-alert") return <LiquidAlertDialogPreview />;
  if (slug === "liquid-sheet") return <LiquidSheetPreview />;
  if (slug === "liquid-card") return <LiquidCardPreview />;
  if (slug === "liquid-table") return <LiquidTablePreview />;
  if (slug === "liquid-pagination") return <LiquidPaginationPreview />;
  if (slug === "liquid-pill") return <LiquidPillPreview />;
  if (slug === "liquid-tree") return <LiquidTreePreview />;
  if (slug === "liquid-toolbar") return <LiquidToolbarPreview />;
  if (slug === "liquid-native-select") return <LiquidNativeSelectPreview />;
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
