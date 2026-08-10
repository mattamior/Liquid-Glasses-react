import type { Metadata } from "next";

const V3_THEME_BOOTSTRAP = `try{var theme=localStorage.getItem("liquid-lab:v3-theme"),script=document.currentScript;if(script&&(theme==="dark"||theme==="light")){script.dataset.theme=theme}}catch(_){}`;

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
  return <>
    <script id="v3-theme-bootstrap" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: V3_THEME_BOOTSTRAP }} />
    {children}
  </>;
}
