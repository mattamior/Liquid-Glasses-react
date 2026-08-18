import { notFound } from "next/navigation";
import { UI_CATALOG, getUiCatalogEntry } from "../catalog";
import { LiquidContextMenuPreview } from "../LiquidContextMenuPreview";
import { LiquidDialogPreview } from "../LiquidDialogPreview";
import { LiquidDropdownPreview } from "../LiquidDropdownPreview";
import { LiquidMenuPreview } from "../LiquidMenuPreview";
import { LiquidMenubarPreview } from "../LiquidMenubarPreview";
import { LiquidPopoverPreview } from "../LiquidPopoverPreview";
import { LiquidSelectPreview } from "../LiquidSelectPreview";

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

  return (
      <main className="ui-studio__main">
        <header className="ui-studio__header">
          <h1>{entry.title}</h1>
          <p>{entry.summary}</p>
        </header>
        <Preview slug={entry.slug} />
        <section className="ui-studio__panel">
          <h2>Usage</h2>
          <pre className="ui-studio__code">{entry.usage}</pre>
        </section>
        <section className="ui-studio__panel">
          <h2>Props</h2>
          <table className="ui-studio__props">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((prop) => (
                <tr key={prop.name}>
                  <td><code>{prop.name}</code></td>
                  <td><code>{prop.type}</code></td>
                  <td>{prop.defaultValue}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
  );
}
