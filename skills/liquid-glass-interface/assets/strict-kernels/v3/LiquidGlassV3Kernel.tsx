"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export type V3OpticsTier = "baseline" | "edge";
export type V3Theme = "dark" | "light";

export interface V3StrictNavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: ReactNode;
}

export interface V3StrictKernelConfig {
  navItems: readonly V3StrictNavigationItem[];
  initialItemId?: string;
  initialOptics?: V3OpticsTier;
  initialTheme?: V3Theme;
  /** Called only after the frozen transition commits the selected item. */
  onRouteCommit?: (item: V3StrictNavigationItem) => void;
  onThemeChange?: (theme: V3Theme) => void;
  brandTokens?: Readonly<Record<`--${string}`, string>>;
  controlledScene?: (props: { copy: "visible" | "replica"; role?: string }) => ReactNode;
}

type LensPhase = "idle" | "primed" | "expanding" | "travelling" | "dragging" | "drag-settling";
type Geometry = { width: number; height: number; centers: number[] };
type Point = { x: number; y: number };
type DragSession = { pointerId: number; target: HTMLButtonElement; startX: number; x: number; moved: boolean };

const DRAG_THRESHOLD_PX = 5;
const DRAG_SETTLE_MS = 260;
const LENS_EXPAND_MS = 190;
const LENS_TRAVEL_MS = 680;
const FILTER_PADDING_PX = 36;
const FIELD_SCALE_PX = 26;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createEllipticalField(widthCssPx: number, heightCssPx: number) {
  const resolution = Math.min(Math.max(1, Math.ceil(window.devicePixelRatio || 1)), 2);
  const width = Math.max(1, Math.round(widthCssPx));
  const height = Math.max(1, Math.round(heightCssPx));
  const canvas = document.createElement("canvas");
  canvas.width = width * resolution;
  canvas.height = height * resolution;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const x = (pixelX + 0.5) / resolution - halfWidth;
      const y = (pixelY + 0.5) / resolution - halfHeight;
      const radius = Math.hypot(x / halfWidth, y / halfHeight);
      const edge = Math.max(0, 1 - radius);
      const meniscus = Math.max(0, 1 - Math.min(1, edge * Math.min(halfWidth, halfHeight) / 24)) ** 2;
      const normalLength = Math.hypot(x / halfWidth, y / halfHeight) || 1;
      const offsetX = -x * 0.12 * Math.max(0, 1 - radius / 0.7) - (x / halfWidth / normalLength) * meniscus * 12.5;
      const offsetY = -y * 0.12 * Math.max(0, 1 - radius / 0.7) - (y / halfHeight / normalLength) * meniscus * 12.5;
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = Math.round(clamp(127.5 + offsetX / FIELD_SCALE_PX * 255, 0, 255));
      pixels.data[index + 1] = Math.round(clamp(127.5 + offsetY / FIELD_SCALE_PX * 255, 0, 255));
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  try { return canvas.toDataURL("image/png"); } catch { return ""; }
}

function supportsEdgeOptics() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const image = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
  const displacement = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
  return "SVGFEImageElement" in window && "SVGFEDisplacementMapElement" in window
    && image instanceof window.SVGFEImageElement && displacement instanceof window.SVGFEDisplacementMapElement;
}

function isFallbackEnvironment() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || window.matchMedia("(forced-colors: active)").matches;
}

function AmbientScene() {
  return <div className="lg-v3-scene" aria-hidden="true"><i /><b>EDGE REFRACTION</b><em /></div>;
}

function ControlledScene({ renderer, copy, role }: { renderer?: V3StrictKernelConfig["controlledScene"]; copy: "visible" | "replica"; role: string }) {
  return <div className={`v3-controlled-scene-layer v3-controlled-scene-layer--${copy}`} data-liquid-glass-role={role} data-liquid-glass-scene-copy={copy} aria-hidden="true">{renderer ? renderer({ copy, role }) : <AmbientScene />}</div>;
}

function NavigationWorld({ items, layer, suppressedIndex, highlightedIndex }: {
  items: readonly V3StrictNavigationItem[];
  layer: "base" | "selection" | "lens";
  suppressedIndex?: number;
  highlightedIndex?: number;
}) {
  return (
    <div className={`v3-navigation-world v3-navigation-world--${layer}`} data-liquid-glass-role={`v3-navigation-world-${layer}`} aria-hidden="true">
      {layer === "lens" ? <span className="v3-navigation-world__rail" /> : null}
      <div className="v3-nav-visual" data-visual-layer={layer}>
        {items.map((item, index) => (
          <div className="v3-tab-visual" key={item.id} data-suppressed={index === suppressedIndex || undefined} data-highlighted={index === highlightedIndex || undefined}>
            {item.icon ? <span className="v3-tab-icon">{item.icon}</span> : null}<span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiquidGlassV3Kernel({ config }: { config: V3StrictKernelConfig }) {
  if (config.navItems.length < 2) throw new Error("V3 strict kernel requires at least two navigation items.");
  const initialIndex = Math.max(0, config.navItems.findIndex((item) => item.id === config.initialItemId));
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragRef = useRef<DragSession | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const callbackRef = useRef(config.onRouteCommit);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [previewIndex, setPreviewIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<LensPhase>("idle");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [lensCenter, setLensCenter] = useState<Point>({ x: 0, y: 0 });
  const [field, setField] = useState("");
  const [edgeSupported] = useState(() => supportsEdgeOptics());
  const [fallback, setFallback] = useState(() => typeof window !== "undefined" && isFallbackEnvironment());
  const [optics, setOptics] = useState<V3OpticsTier>(config.initialOptics ?? "baseline");
  const [theme, setTheme] = useState<V3Theme>(config.initialTheme ?? "dark");
  const filterId = `v3-strict-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const lensWidth = clamp(Math.round((geometry?.height ?? 184) * 1.22), 104, 296);
  const lensHeight = clamp(Math.round((geometry?.height ?? 184) * 1.1), 92, 242);
  const edge = optics === "edge" && edgeSupported && Boolean(field) && !fallback;
  const animate = edge && !fallback;
  const visibleSelection = phase === "idle";
  const selected = config.navItems[selectedIndex] ?? config.navItems[0];

  const clearPending = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    timerRef.current = null;
    animationFrameRef.current = null;
  }, []);

  const readGeometry = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return null;
    const navBox = nav.getBoundingClientRect();
    const centers = buttonRefs.current.map((button) => {
      const box = button?.getBoundingClientRect();
      return box ? box.left - navBox.left + box.width / 2 : 0;
    });
    if (centers.some((center) => center === 0)) return null;
    return { width: nav.clientWidth, height: nav.clientHeight, centers };
  }, []);

  const commit = useCallback((index: number) => {
    const item = config.navItems[index];
    if (!item) return;
    clearPending();
    setSelectedIndex(index);
    setPreviewIndex(index);
    setPhase("idle");
    callbackRef.current?.(item);
  }, [clearPending, config.navItems]);

  const resetDrag = useCallback(() => {
    const session = dragRef.current;
    if (session?.target.hasPointerCapture(session.pointerId)) session.target.releasePointerCapture(session.pointerId);
    dragRef.current = null;
    clearPending();
    setPreviewIndex(selectedIndex);
    setLensCenter((current) => geometry ? { x: geometry.centers[selectedIndex], y: geometry.height / 2 } : current);
    setPhase("idle");
  }, [clearPending, geometry, selectedIndex]);

  useEffect(() => { callbackRef.current = config.onRouteCommit; }, [config.onRouteCommit]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    const update = () => { setFallback(isFallbackEnvironment()); if (isFallbackEnvironment()) resetDrag(); };
    reduced.addEventListener("change", update); forced.addEventListener("change", update);
    return () => { reduced.removeEventListener("change", update); forced.removeEventListener("change", update); };
  }, [resetDrag]);
  useEffect(() => {
    if (!geometry || !edgeSupported) return;
    const frame = window.requestAnimationFrame(() => setField(createEllipticalField(lensWidth, lensHeight)));
    return () => window.cancelAnimationFrame(frame);
  }, [edgeSupported, geometry, lensHeight, lensWidth]);
  useEffect(() => {
    const update = () => {
      const next = readGeometry();
      if (!next) return;
      setGeometry(next);
      setLensCenter((current) => phase === "idle" ? { x: next.centers[selectedIndex], y: next.height / 2 } : current);
    };
    update();
    const observer = "ResizeObserver" in window ? new ResizeObserver(update) : null;
    if (navRef.current) observer?.observe(navRef.current);
    window.addEventListener("resize", update);
    return () => { observer?.disconnect(); window.removeEventListener("resize", update); };
  }, [phase, readGeometry, selectedIndex]);
  useEffect(() => () => {
    clearPending();
    const session = dragRef.current;
    if (session?.target.hasPointerCapture(session.pointerId)) session.target.releasePointerCapture(session.pointerId);
    dragRef.current = null;
  }, [clearPending]);

  const nearestIndex = useCallback((clientX: number) => {
    const nav = navRef.current;
    if (!geometry || !nav) return selectedIndex;
    const localX = clamp(clientX - nav.getBoundingClientRect().left, lensWidth / 2, Math.max(lensWidth / 2, geometry.width - lensWidth / 2));
    return geometry.centers.reduce((closest, center, index) => Math.abs(center - localX) < Math.abs(geometry.centers[closest] - localX) ? index : closest, 0);
  }, [geometry, lensWidth, selectedIndex]);

  const select = useCallback((index: number) => {
    if (index === selectedIndex || phase !== "idle") return;
    if (!animate || !geometry) { commit(index); return; }
    clearPending();
    setPreviewIndex(index);
    setLensCenter({ x: geometry.centers[selectedIndex], y: geometry.height / 2 });
    setPhase("primed");
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = window.requestAnimationFrame(() => setPhase("expanding"));
    });
    timerRef.current = window.setTimeout(() => {
      setLensCenter({ x: geometry.centers[index], y: geometry.height / 2 });
      setPhase("travelling");
      timerRef.current = window.setTimeout(() => commit(index), LENS_TRAVEL_MS);
    }, LENS_EXPAND_MS);
  }, [animate, clearPending, commit, geometry, phase, selectedIndex]);

  const finishDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (session.target.hasPointerCapture(session.pointerId)) session.target.releasePointerCapture(session.pointerId);
    dragRef.current = null;
    if (cancelled || !session.moved) { resetDrag(); return; }
    const index = nearestIndex(event.clientX);
    const targetX = geometry?.centers[index] ?? session.x;
    setPreviewIndex(index);
    setLensCenter({ x: targetX, y: (geometry?.height ?? lensHeight) / 2 });
    setPhase("drag-settling");
    clearPending();
    timerRef.current = window.setTimeout(() => commit(index), DRAG_SETTLE_MS);
  }, [clearPending, commit, geometry, lensHeight, nearestIndex, resetDrag]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (!animate || index !== selectedIndex || phase !== "idle" || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, target: event.currentTarget, startX: event.clientX, x: geometry?.centers[index] ?? 0, moved: false };
  }, [animate, geometry?.centers, phase, selectedIndex]);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = dragRef.current;
    const nav = navRef.current;
    if (!session || session.pointerId !== event.pointerId || !geometry || !nav) return;
    if (Math.abs(event.clientX - session.startX) <= DRAG_THRESHOLD_PX) return;
    const x = clamp(event.clientX - nav.getBoundingClientRect().left, lensWidth / 2, Math.max(lensWidth / 2, geometry.width - lensWidth / 2));
    session.moved = true; session.x = x;
    setLensCenter({ x, y: geometry.height / 2 });
    setPreviewIndex(nearestIndex(event.clientX));
    setPhase("dragging");
    event.preventDefault();
  }, [geometry, lensWidth, nearestIndex]);

  const sliderStyle = geometry ? { "--v3-slider-x": `${selectedIndex * (100 / config.navItems.length)}%`, "--v3-slider-width": `${100 / config.navItems.length}%` } as CSSProperties : undefined;
  const navStyle = {
    "--v3-nav-count": String(config.navItems.length),
    "--v3-lens-x": `${lensCenter.x}px`, "--v3-lens-y": `${lensCenter.y}px`,
    "--v3-lens-width": `${lensWidth}px`, "--v3-lens-height": `${lensHeight}px`,
    "--v3-world-width": `${geometry?.width ?? 0}px`, "--v3-world-height": `${geometry?.height ?? 0}px`,
    "--v3-world-sample-x": `${lensWidth / 2 - lensCenter.x}px`, "--v3-world-sample-y": `${lensHeight / 2 - lensCenter.y}px`,
  } as CSSProperties;

  return <main className="lg-v3" style={config.brandTokens as CSSProperties | undefined} data-liquid-glass-mode="v3-horizontal" data-optics-tier={edge ? "edge" : "baseline"} data-theme={theme} data-phase={phase} data-lens-phase={phase} data-liquid-glass-phase={phase} data-selected-id={config.navItems[selectedIndex]?.id} data-preview-id={config.navItems[previewIndex]?.id} data-liquid-glass-preview-id={config.navItems[previewIndex]?.id}>
    <ControlledScene renderer={config.controlledScene} copy="visible" role="v3-controlled-scene" />
    {field ? <svg className="v3-filter-definitions" aria-hidden="true"><defs><filter id={filterId} x={-FILTER_PADDING_PX} y={-FILTER_PADDING_PX} width={lensWidth + FILTER_PADDING_PX * 2} height={lensHeight + FILTER_PADDING_PX * 2} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feImage href={field} width={lensWidth} height={lensHeight} preserveAspectRatio="none" result="field" /><feDisplacementMap in="SourceGraphic" in2="field" scale={FIELD_SCALE_PX} xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg> : null}
    <nav ref={navRef} className="v3-nav" style={navStyle} data-liquid-glass-role="v3-navigation" data-lens-phase={phase} data-preview-index={previewIndex} aria-label="Liquid Glass navigation">
      <NavigationWorld items={config.navItems} layer="base" suppressedIndex={visibleSelection ? selectedIndex : undefined} />
      <div className="v3-selection-slider" data-liquid-glass-role="v3-selection-slider" data-visible={visibleSelection} style={sliderStyle} aria-hidden="true"><div className="v3-selection-optical-clip"><div className="v3-selection-world"><NavigationWorld items={config.navItems} layer="selection" /></div></div></div>
      <div className="v3-tab-actions">{config.navItems.map((item, index) => <button key={item.id} ref={(node) => { buttonRefs.current[index] = node; }} type="button" data-liquid-glass-role="v3-navigation-item" data-item-id={item.id} data-liquid-glass-item-id={item.id} data-preview={index === previewIndex ? "true" : "false"} data-selected={index === selectedIndex ? "true" : "false"} aria-current={index === selectedIndex ? "page" : undefined} aria-label={item.label} onClick={() => select(index)} onPointerDown={(event) => onPointerDown(event, index)} onPointerMove={onPointerMove} onPointerUp={(event) => finishDrag(event, false)} onPointerCancel={(event) => finishDrag(event, true)} onLostPointerCapture={(event) => finishDrag(event, true)}>{item.label}</button>)}</div>
      <div className="v3-lens-position" data-liquid-glass-role="v3-selection-lens" data-liquid-glass-travelling-lens="true" data-phase={phase} aria-hidden="true"><div className="v3-lens-shell"><div className="v3-lens-optics-viewport" data-liquid-glass-role="v3-selection-replica" data-liquid-glass-optics-layer="replica" style={edge ? { filter: `url(#${filterId})` } : undefined}><div className="v3-lens-world-sample" data-liquid-glass-role="v3-selection-world" data-liquid-glass-optics-layer="world"><ControlledScene renderer={config.controlledScene} copy="replica" role="v3-controlled-scene-replica" /><NavigationWorld items={config.navItems} layer="lens" highlightedIndex={previewIndex} /></div></div><span className="v3-lens-inner" /><span className="v3-lens-sheen" /></div></div>
    </nav>
    <section className="lg-v3-content" aria-live="polite"><button type="button" onClick={() => setOptics((value) => value === "edge" ? "baseline" : "edge")}>Optics: {edge ? "Edge" : "Baseline"}</button><button type="button" onClick={() => setTheme((value) => { const next = value === "dark" ? "light" : "dark"; config.onThemeChange?.(next); return next; })}>Theme: {theme}</button><h1>{selected.label}</h1><p>{selected.route}</p></section>
  </main>;
}
