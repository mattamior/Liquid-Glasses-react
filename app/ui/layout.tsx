import type { Metadata } from "next";
import "../apple-clear/apple-clear.css";
import "./ui-catalog.css";
import { UiStudioShell } from "./UiStudioShell";

export const metadata: Metadata = {
  title: "Liquid Glass UI",
  description: "Preview catalog for portable Liquid Glass components.",
};

export default function UiCatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UiStudioShell>{children}</UiStudioShell>;
}
