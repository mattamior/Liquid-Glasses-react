import { redirect } from "next/navigation";
import { UI_CATALOG } from "./catalog";

export default function UiCatalogIndexPage() {
  redirect(`/ui/${UI_CATALOG[0].slug}`);
}
