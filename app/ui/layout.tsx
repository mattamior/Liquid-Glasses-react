import type { Metadata } from "next";
import "../apple-clear/apple-clear.css";
import "./ui-catalog.css";
import { CatalogNav } from "./CatalogNav";

export const metadata: Metadata = {
  title: "Liquid Glass UI",
  description: "Preview catalog for portable Liquid Glass components.",
};

export default function UiCatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="ui-studio">
      <aside className="ui-studio__nav">
        <p className="ui-studio__brand">Liquid Glass</p>
        <CatalogNav />
      </aside>
      {children}
    </div>
  );
}
