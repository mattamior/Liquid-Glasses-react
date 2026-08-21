"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { uiChrome } from "./copy";
import { useUiLocale } from "./UiLocale";

const STORAGE_KEY = "liquid-glass:ui-stage-scene";

const SCENE_IDS = ["sky", "dusk", "meadow", "graphite"] as const;

function isScene(value: string): value is (typeof SCENE_IDS)[number] {
  return SCENE_IDS.some((id) => id === value);
}

interface PreviewStageProps {
  children: ReactNode;
  overlay?: boolean;
  probe?: boolean;
}

export function PreviewStage({ children, overlay = false, probe = false }: PreviewStageProps) {
  const { locale } = useUiLocale();
  const chrome = uiChrome(locale);
  const [scene, setScene] = useState<(typeof SCENE_IDS)[number]>("sky");
  const [showProbe, setShowProbe] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isScene(stored)) setScene(stored);
    } catch {
      // Session scene still applies.
    }
  }, []);

  const commitScene = (next: (typeof SCENE_IDS)[number]) => {
    setScene(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Session scene still applies.
    }
  };

  const className = [
    "ui-studio__preview",
    overlay ? "ui-studio__preview--dropdown" : "",
    probe && showProbe ? "is-probe" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} data-scene={scene}>
      <div className="ui-studio__stage-chrome">
        <div className="ui-studio__scene-picker" role="group" aria-label={chrome.sceneGroup}>
          {SCENE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="ui-studio__scene-swatch"
              data-scene={id}
              aria-label={chrome.scenes[id]}
              aria-pressed={scene === id}
              onClick={() => commitScene(id)}
            />
          ))}
        </div>
        {probe ? (
          <button
            type="button"
            className="ui-studio__probe-toggle"
            aria-pressed={showProbe}
            onClick={() => setShowProbe((on) => !on)}
          >
            {chrome.probe}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function OverlayPreviewStage({ children }: { children: ReactNode }) {
  return (
    <PreviewStage overlay probe>
      {children}
    </PreviewStage>
  );
}

/** Portaled overlays cannot sample the stage. Paint an aligned wash instead. */
export function StageWash({ copy }: { copy: "visible" | "replica" }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const align = () => {
      const preview = document.querySelector(".ui-studio__preview");
      const host = node.closest(".apple-clear");
      if (!(preview instanceof HTMLElement) || !(host instanceof HTMLElement)) return;
      const previewBox = preview.getBoundingClientRect();
      const hostBox = host.getBoundingClientRect();
      node.style.width = `${preview.offsetWidth}px`;
      node.style.height = `${preview.offsetHeight}px`;
      node.style.transform = `translate(${previewBox.left - hostBox.left}px, ${previewBox.top - hostBox.top}px)`;
      node.dataset.scene = preview.getAttribute("data-scene") ?? "sky";
    };

    align();
    const preview = document.querySelector(".ui-studio__preview");
    const resize = preview instanceof HTMLElement ? new ResizeObserver(align) : null;
    const mutation =
      preview instanceof HTMLElement
        ? new MutationObserver(align)
        : null;
    if (preview instanceof HTMLElement) {
      resize?.observe(preview);
      mutation?.observe(preview, { attributes: true, attributeFilter: ["data-scene"] });
    }
    window.addEventListener("resize", align);
    return () => {
      resize?.disconnect();
      mutation?.disconnect();
      window.removeEventListener("resize", align);
    };
  }, [copy]);

  return <div ref={ref} className="ui-studio__stage-wash" data-copy={copy} aria-hidden="true" />;
}
