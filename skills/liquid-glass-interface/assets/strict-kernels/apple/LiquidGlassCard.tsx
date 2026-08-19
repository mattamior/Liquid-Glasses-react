"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LiquidMenuBackdrop } from "./LiquidMenuBackdrop";
import {
  APPLE_CLEAR_PANEL_OPTICS,
  createClearPanelLensField,
} from "./lens-optics";

export type LiquidGlassCardTheme = "light" | "dark";
export type LiquidGlassCardOptics = "enhanced" | "baseline";

export interface LiquidGlassCardProps {
  children?: ReactNode;
  title?: string;
  theme?: LiquidGlassCardTheme;
  optics?: LiquidGlassCardOptics;
  scene?: (props: { copy: "visible" | "replica" }) => ReactNode;
}

const SHELL_OVERSCAN = APPLE_CLEAR_PANEL_OPTICS.filterPaddingCssPx;
const THEME_KEY = "liquid-glass:apple-clear-theme";

function toSafeId(value: string) {
  return `apple-card-${Array.from(value, (char) =>
    /[A-Za-z0-9_-]/.test(char) ? char : `x${char.codePointAt(0)?.toString(16)}x`,
  ).join("")}`;
}

function cssAncestorScale(el: HTMLElement) {
  let scaleX = 1;
  let scaleY = 1;
  let node: HTMLElement | null = el;
  while (node) {
    const transform = getComputedStyle(node).transform;
    if (transform && transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      scaleX *= Math.hypot(matrix.a, matrix.b);
      scaleY *= Math.hypot(matrix.c, matrix.d);
    }
    node = node.parentElement;
  }
  return { scaleX: scaleX || 1, scaleY: scaleY || 1 };
}

function supportsEnhancedOptics() {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  return (
    Boolean(canvas.getContext("2d")) &&
    CSS.supports("filter", "url(#apple-clear-probe)") &&
    "SVGFEImageElement" in window &&
    "SVGFEDisplacementMapElement" in window
  );
}

function LensFilter({
  id,
  field,
  width,
  height,
  overscan,
  scale,
}: {
  id: string;
  field: string;
  width: number;
  height: number;
  overscan: number;
  scale: number;
}) {
  return (
    <filter
      id={id}
      filterUnits="userSpaceOnUse"
      x={-overscan}
      y={-overscan}
      width={width + overscan * 2}
      height={height + overscan * 2}
      colorInterpolationFilters="sRGB"
    >
      <feImage href={field} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="field" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="field"
        scale={scale}
        x="0"
        y="0"
        width={width}
        height={height}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

/** Glass bubble only. No traveling lens, no menu items. */
export function LiquidGlassCard({
  children,
  title,
  theme: initialTheme,
  optics: initialOptics,
  scene,
}: LiquidGlassCardProps) {
  const stageRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const instanceId = toSafeId(useId());
  const shellFilterId = `${instanceId}-shell`;
  const [theme] = useState<LiquidGlassCardTheme>(() => {
    if (initialTheme) return initialTheme;
    if (typeof window === "undefined") return "light";
    try {
      return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [optics] = useState<LiquidGlassCardOptics>(initialOptics ?? "enhanced");
  const [supported, setSupported] = useState(() => supportsEnhancedOptics());
  const [fallback, setFallback] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [shellGeometry, setShellGeometry] = useState({
    stageWidth: 0,
    stageHeight: 0,
    width: 0,
    height: 0,
    worldX: 0,
    worldY: 0,
    ready: false,
  });

  const enhanced = optics === "enhanced" && supported && !fallback;

  useEffect(() => {
    const forced = window.matchMedia("(forced-colors: active)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setSupported(supportsEnhancedOptics());
      setFallback(forced.matches || motion.matches);
      setDpr(window.devicePixelRatio || 1);
    };
    update();
    forced.addEventListener("change", update);
    motion.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      forced.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    let scheduled = 0;
    const update = () => {
      scheduled = 0;
      const stage = stageRef.current;
      const shell = shellRef.current;
      if (!stage || !shell) return;
      const stageBox = stage.getBoundingClientRect();
      const shellBox = shell.getBoundingClientRect();
      const { scaleX, scaleY } = cssAncestorScale(stage);
      setShellGeometry({
        stageWidth: stage.offsetWidth,
        stageHeight: stage.offsetHeight,
        width: shell.offsetWidth,
        height: shell.offsetHeight,
        worldX: (stageBox.left - shellBox.left) / scaleX,
        worldY: (stageBox.top - shellBox.top) / scaleY,
        ready: shell.offsetWidth > 0 && shell.offsetHeight > 0,
      });
    };
    const schedule = () => {
      if (!scheduled) scheduled = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (stageRef.current) observer.observe(stageRef.current);
    if (shellRef.current) observer.observe(shellRef.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      if (scheduled) cancelAnimationFrame(scheduled);
    };
  }, [theme]);

  const shellField = useMemo(
    () =>
      enhanced && shellGeometry.ready
        ? createClearPanelLensField(shellGeometry.width, shellGeometry.height, dpr, APPLE_CLEAR_PANEL_OPTICS)
        : "",
    [dpr, enhanced, shellGeometry],
  );

  const renderScene = (copy: "visible" | "replica") =>
    scene ? scene({ copy }) : <LiquidMenuBackdrop copy={copy} />;

  const shellWorld = {
    width: shellGeometry.stageWidth,
    height: shellGeometry.stageHeight,
    transform: `translate3d(${shellGeometry.worldX}px, ${shellGeometry.worldY}px, 0)`,
  } as CSSProperties;
  const shellReplicaStyle = {
    inset: SHELL_OVERSCAN,
    filter: shellField ? `url("#${shellFilterId}")` : "none",
  } as CSSProperties;

  return (
    <main
      ref={stageRef}
      className="apple-clear"
      style={
        {
          "--apple-menu-radius": "20px",
          "--apple-menu-width": "260px",
          "--apple-menu-pad": "16px",
        } as CSSProperties
      }
      data-liquid-glass-mode="apple-liquid-glass"
      data-liquid-glass-role="apple-clear-stage"
      data-density="compact"
      data-host="nested"
      data-variant="embedded"
      data-theme={theme}
      data-optics-tier={enhanced && shellField ? "enhanced" : "baseline"}
    >
      <div className="apple-clear-scene" data-liquid-glass-role="apple-controlled-scene">
        {renderScene("visible")}
      </div>
      <div className="apple-clear-cluster">
        <div className="apple-clear-menu-frame">
          <section
            className="liquid-glass-card"
            aria-label={title}
          >
            <article ref={shellRef} className="apple-clear-shell" data-refraction={shellField ? "enhanced" : "baseline"}>
              {shellField ? (
                <svg className="apple-clear-filter" aria-hidden="true">
                  <defs>
                    <LensFilter
                      id={shellFilterId}
                      field={shellField}
                      width={shellGeometry.width}
                      height={shellGeometry.height}
                      overscan={SHELL_OVERSCAN}
                      scale={APPLE_CLEAR_PANEL_OPTICS.fieldScaleCssPx}
                    />
                  </defs>
                </svg>
              ) : null}
              <span className="apple-clear-shell__optical" aria-hidden="true">
                <span className="apple-clear-shell__overscan" style={{ inset: -SHELL_OVERSCAN }}>
                  <span className="apple-clear-shell__replica" data-ready={shellGeometry.ready ? "true" : "false"} style={shellReplicaStyle}>
                    <span className="apple-clear-shell__world" style={shellWorld}>
                      {renderScene("replica")}
                    </span>
                  </span>
                </span>
                <span className="apple-clear-shell__fill" />
                <span className="apple-clear-shell__edge" />
              </span>
            </article>
            <div className="liquid-glass-card__body">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
