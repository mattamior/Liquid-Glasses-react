import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liquid Lab V3 — Horizontal navigation lens",
  description:
    "An independent horizontal navigation study with a moving Liquid Glass lens.",
};

export default function V3Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
