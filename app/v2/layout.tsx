import type { Metadata } from "next";
import "./v2.css";

export const metadata: Metadata = {
  title: "Liquid Lab V2 — Navigation lens",
  description:
    "A vertical navigation study with one moving Liquid Glass selection lens.",
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
