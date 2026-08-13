// V1 is frozen. New visual or interaction work belongs in a later version.
import type { Metadata } from "next";

import "./v1.css";

export const metadata: Metadata = {
  title: "Liquid Lab V1 — Archived Demo",
  description: "The frozen first-generation Liquid Glass demonstration.",
};

export default function V1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
