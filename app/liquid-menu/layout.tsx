import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LiquidMenu tryout",
  description: "Redirects to the Liquid Glass UI catalog.",
};

export default function LiquidMenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
