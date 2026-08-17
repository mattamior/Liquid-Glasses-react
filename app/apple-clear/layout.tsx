import type { Metadata } from "next";
import "./apple-clear.css";

export const metadata: Metadata = {
  title: "Liquid Lab — Apple Liquid Glass menu",
  description: "Apple Liquid Glass floating menu with whole-surface refraction and a traveling selection lens.",
};

export default function AppleClearLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
