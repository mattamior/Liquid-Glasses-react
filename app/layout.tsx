import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liquid Lab — Light, in motion",
  description:
    "An interactive React study of refraction, adaptive highlights, and fluid glass motion.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
