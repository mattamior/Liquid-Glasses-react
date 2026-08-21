import { UI_CATALOG_SLUGS } from "./copy";

export const UI_CATALOG = UI_CATALOG_SLUGS.map((slug) => ({ slug }));

export function getUiCatalogEntry(slug: string) {
  return UI_CATALOG.find((entry) => entry.slug === slug);
}
