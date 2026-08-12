import type { Metadata } from "next";

const V3_05_FAILED_THEME_BOOTSTRAP = `try{var theme=localStorage.getItem("liquid-lab:v3-theme"),script=document.currentScript;if(script&&(theme==="dark"||theme==="light")){script.dataset.theme=theme}}catch(_){}`;

export const metadata: Metadata = {
  title: "Liquid Lab V3 — M05 Failed Release Archive",
  description: "Archived V3 M05 failed release for inspection only; it is not a production baseline.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function V3FailedReleaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>
    <script id="v3-05-failed-theme-bootstrap" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: V3_05_FAILED_THEME_BOOTSTRAP }} />
    {children}
  </>;
}
