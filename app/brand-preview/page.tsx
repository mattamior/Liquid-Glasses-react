import type { Metadata } from "next";
import "./brand-preview.css";

export const metadata: Metadata = {
  title: "Liquid Lab — Brand preview",
  description: "Local review page for the Liquid Lab logo concept.",
};

interface PreviewSurface {
  id: "dark" | "light";
  label: string;
  description: string;
}

const PREVIEW_SURFACES: readonly PreviewSurface[] = [
  {
    id: "dark",
    label: "暗色模式",
    description: "Black surface · cool glass mark",
  },
  {
    id: "light",
    label: "亮色模式",
    description: "White surface · soft glass mark",
  },
];

const MARK_SIZES = [48, 32, 24] as const;

export default function BrandPreviewPage() {
  return (
    <main className="brand-preview">
      <header className="brand-preview__header">
        <a className="brand-preview__back" href="/v2">
          返回 V2 演示
        </a>
        <p>LIQUID LAB / MARK REVIEW</p>
        <h1>液态玻璃标志</h1>
        <span>冰蓝、青绿与淡紫的折射层。</span>
      </header>

      <section className="brand-preview__surfaces" aria-label="标志深浅色预览">
        {PREVIEW_SURFACES.map((surface) => (
          <article
            className={`brand-preview__surface brand-preview__surface--${surface.id}`}
            key={surface.id}
          >
            <div className="brand-preview__surface-label">
              <h2>{surface.label}</h2>
              <p>{surface.description}</p>
            </div>

            <span className="brand-preview__mark brand-preview__mark--hero" aria-hidden="true" />

            <div className="brand-preview__sizes" aria-label={`${surface.label}小尺寸预览`}>
              {MARK_SIZES.map((size) => (
                <div className="brand-preview__size" key={size}>
                  <span
                    className="brand-preview__mark"
                    style={{ width: size, height: size }}
                    aria-hidden="true"
                  />
                  <span>{size}px</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
