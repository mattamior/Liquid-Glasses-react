import type { Metadata } from "next";
import "./v2.css";

const V2_THEME_BOOTSTRAP = `try{var theme=localStorage.getItem("liquid-lab:v2-theme");if(theme==="light"||theme==="dark"){document.documentElement.dataset.v2Theme=theme}}catch(_){}`;

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
  return <>
    <script
      id="v2-theme-bootstrap"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: V2_THEME_BOOTSTRAP }}
    />
    {children}
  </>;
}
