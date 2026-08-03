"use client";

/*
 * Copy this kit as a unit for "match the original Demo" work. It is extracted
 * from app/page.tsx: StageArtwork, SDF field, RGB lens filter, world-aligned
 * replica and measured menu selection behavior deliberately share one model.
 */
import {
  type CSSProperties,
  type RefObject,
  type ReactNode,
  memo,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./fidelity.css";

export type FidelityTheme = "dark" | "light";
export type MaterialMode = "baseline" | "enhanced";

export const FIDELITY_TUNING = {
  dark: { refraction: 112, scale: 1, red: 1.08, blue: 0.9, saturation: 1.42 },
  light: { refraction: 112, scale: 0.58, red: 1, blue: 1, saturation: 0.9 },
  frost: 2,
  elasticity: 640,
  overscan: 28,
} as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function roundedRectangleDistance(x: number, y: number, halfWidth: number, halfHeight: number, radius: number) {
  const ax = Math.abs(x) - halfWidth + radius;
  const ay = Math.abs(y) - halfHeight + radius;
  return Math.min(Math.max(ax, ay), 0) + Math.hypot(Math.max(ax, 0), Math.max(ay, 0)) - radius;
}

/** Generate one RG field for the actual rounded surface geometry; never share a fixed texture. */
export function createRoundedEdgeField(width: number, height: number, radius: number, edgeBand = 34, strength = 126) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(width));
  canvas.height = Math.max(2, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) return "";
  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = canvas.width / 2 - 2;
  const halfHeight = canvas.height / 2 - 2;
  const safeRadius = Math.min(radius, halfWidth, halfHeight);
  for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
    const localX = x - canvas.width / 2;
    const localY = y - canvas.height / 2;
    const distance = roundedRectangleDistance(localX, localY, halfWidth, halfHeight, safeRadius);
    const sample = 0.75;
    const gx = roundedRectangleDistance(localX + sample, localY, halfWidth, halfHeight, safeRadius) - roundedRectangleDistance(localX - sample, localY, halfWidth, halfHeight, safeRadius);
    const gy = roundedRectangleDistance(localX, localY + sample, halfWidth, halfHeight, safeRadius) - roundedRectangleDistance(localX, localY - sample, halfWidth, halfHeight, safeRadius);
    const length = Math.hypot(gx, gy) || 1;
    const amount = distance <= 0 ? 1 - smoothstep(0, edgeBand, -distance) : 0;
    const fade = smoothstep(0, 3, x) * smoothstep(0, 3, y) * smoothstep(0, 3, canvas.width - 1 - x) * smoothstep(0, 3, canvas.height - 1 - y);
    const index = (y * canvas.width + x) * 4;
    pixels.data[index] = Math.round(128 + (gx / length) * amount * fade * strength);
    pixels.data[index + 1] = Math.round(128 + (gy / length) * amount * fade * strength);
    pixels.data[index + 2] = 128; pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}

function safeSvgId(value: string) {
  return `liquid-${Array.from(value, (character) => /[A-Za-z0-9_-]/.test(character) ? character : `x${character.codePointAt(0)?.toString(16)}x`).join("")}`;
}

function LensFilter({ id, image, theme }: { id: string; image: string; theme: FidelityTheme }) {
  const tuning = FIDELITY_TUNING[theme];
  const scale = tuning.refraction * tuning.scale;
  return <filter id={id} x="-28%" y="-28%" width="156%" height="156%" colorInterpolationFilters="sRGB">
    <feImage href={image} preserveAspectRatio="none" result="map" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * tuning.red} xChannelSelector="R" yChannelSelector="G" result="red-source" />
    <feColorMatrix in="red-source" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="green-source" />
    <feColorMatrix in="green-source" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * tuning.blue} xChannelSelector="R" yChannelSelector="G" result="blue-source" />
    <feColorMatrix in="blue-source" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
    <feBlend in="red" in2="green" mode="screen" result="red-green" /><feBlend in="red-green" in2="blue" mode="screen" result="rgb" />
    <feColorMatrix in="rgb" type="saturate" values={tuning.saturation} />
  </filter>;
}

/** The only scene model: render it visibly and inside every replica. */
export const SceneArtwork = memo(function SceneArtwork({ copy }: { copy: "visible" | "replica" }) {
  return <div className="fidelity-scene" data-fidelity-scene={copy} aria-hidden="true"><div className="fidelity-grid" data-fidelity-anchor="grid" /><div className="fidelity-band fidelity-band-one" /><div className="fidelity-band fidelity-band-two" /><div className="fidelity-orb fidelity-orb-cyan" /><div className="fidelity-orb fidelity-orb-violet" /><div className="fidelity-orb fidelity-orb-coral" /><div className="fidelity-word" data-fidelity-anchor="word">REFRACT</div><div className="fidelity-poster fidelity-poster-primary"><span>01</span><p>BENDING</p><strong>LIGHT</strong><small>REALTIME OPTICS</small></div><div className="fidelity-poster fidelity-poster-secondary"><span>FLUID</span><strong>FORM</strong></div></div>;
});

/** Render this once visibly; give its ref to every RefractedSurface child. */
export function FidelityStage({ children }: { children: (stageRef: RefObject<HTMLElement | null>) => ReactNode }) {
  const stageRef = useRef<HTMLElement>(null);
  return <section ref={stageRef} className="fidelity-stage"><SceneArtwork copy="visible" />{children(stageRef)}</section>;
}

function useSurfaceGeometry(stage: RefObject<HTMLElement | null>, surface: RefObject<HTMLElement | null>, geometryKey: string | number | boolean, updateWorld: (x: number, y: number) => void) {
  const [geometry, setGeometry] = useState({ stageWidth: 0, stageHeight: 0, width: 0, height: 0, ready: false });
  useLayoutEffect(() => {
    let layoutFrame = 0; let worldFrame = 0;
    const surfaceNode = surface.current;
    const readRects = () => { const root = stage.current; if (!root || !surfaceNode) return null; const stageRect = root.getBoundingClientRect(); const surfaceRect = surfaceNode.getBoundingClientRect(); return { stageRect, surfaceRect }; };
    const updateWorldPosition = () => { worldFrame = 0; const rects = readRects(); if (rects) updateWorld(rects.surfaceRect.left - rects.stageRect.left, rects.surfaceRect.top - rects.stageRect.top); };
    const updateLayout = () => { layoutFrame = 0; const rects = readRects(); if (!rects) return; const { stageRect, surfaceRect } = rects; updateWorld(surfaceRect.left - stageRect.left, surfaceRect.top - stageRect.top); setGeometry((current) => current.ready && current.stageWidth === stageRect.width && current.stageHeight === stageRect.height && current.width === surfaceRect.width && current.height === surfaceRect.height ? current : { stageWidth: stageRect.width, stageHeight: stageRect.height, width: surfaceRect.width, height: surfaceRect.height, ready: true }); };
    const scheduleLayout = () => { if (!layoutFrame) layoutFrame = requestAnimationFrame(updateLayout); };
    const scheduleWorld = () => { if (!worldFrame) worldFrame = requestAnimationFrame(updateWorldPosition); };
    const observer = new ResizeObserver(scheduleLayout); if (stage.current) observer.observe(stage.current); if (surfaceNode) observer.observe(surfaceNode);
    const scheduleAfterSurfaceMotion = (event: TransitionEvent | AnimationEvent) => { if (event.target === surfaceNode) scheduleLayout(); };
    window.addEventListener("resize", scheduleLayout); window.addEventListener("scroll", scheduleWorld, true); surfaceNode?.addEventListener("transitionend", scheduleAfterSurfaceMotion); surfaceNode?.addEventListener("animationend", scheduleAfterSurfaceMotion); scheduleLayout();
    return () => { observer.disconnect(); window.removeEventListener("resize", scheduleLayout); window.removeEventListener("scroll", scheduleWorld, true); surfaceNode?.removeEventListener("transitionend", scheduleAfterSurfaceMotion); surfaceNode?.removeEventListener("animationend", scheduleAfterSurfaceMotion); if (layoutFrame) cancelAnimationFrame(layoutFrame); if (worldFrame) cancelAnimationFrame(worldFrame); };
  }, [stage, surface, geometryKey, updateWorld]);
  return geometry;
}

export function RefractedSurface({ stageRef, theme, radius, children, className = "", geometryKey = 0, mode = "enhanced", onTransitionEnd }: { stageRef: RefObject<HTMLElement | null>; theme: FidelityTheme; radius: number; children: ReactNode; className?: string; geometryKey?: string | number | boolean; mode?: MaterialMode; onTransitionEnd?: () => void }) {
  const surfaceRef = useRef<HTMLDivElement>(null); const worldRef = useRef<HTMLDivElement>(null);
  const worldPosition = useRef({ x: 0, y: 0 });
  const updateWorld = useCallback((x: number, y: number) => { worldPosition.current = { x: -x, y: -y }; worldRef.current?.style.setProperty("--fidelity-world-x", `${-x}px`); worldRef.current?.style.setProperty("--fidelity-world-y", `${-y}px`); }, []);
  const setWorldNode = useCallback((node: HTMLDivElement | null) => { worldRef.current = node; if (node) { node.style.setProperty("--fidelity-world-x", `${worldPosition.current.x}px`); node.style.setProperty("--fidelity-world-y", `${worldPosition.current.y}px`); } }, []);
  const geometry = useSurfaceGeometry(stageRef, surfaceRef, geometryKey, updateWorld);
  const enhancedReady = mode === "enhanced" && geometry.ready;
  const field = useMemo(() => enhancedReady ? createRoundedEdgeField(geometry.width, geometry.height, radius) : "", [enhancedReady, geometry.width, geometry.height, radius]);
  const id = safeSvgId(useId()); const filterId = `${id}-filter`; const overscan = FIDELITY_TUNING.overscan;
  const replicaFilterStyle = { inset: `${overscan}px`, filter: `url("#${filterId}") blur(1px) saturate(1.7)` } as CSSProperties;
  const replicaWorldStyle = { width: `${geometry.stageWidth}px`, height: `${geometry.stageHeight}px` } as CSSProperties;
  return <div ref={surfaceRef} data-material-mode={mode} className={`fidelity-surface fidelity-theme-${theme} ${className}`} style={{ borderRadius: radius }} onTransitionEnd={(event) => { if (event.target === event.currentTarget) onTransitionEnd?.(); }}>
    {enhancedReady ? <svg className="fidelity-defs" aria-hidden="true"><defs><LensFilter id={filterId} image={field} theme={theme} /></defs></svg> : null}
    <div className="fidelity-optical-clip" style={{ borderRadius: radius }} aria-hidden="true">{enhancedReady ? <div className="fidelity-replica-overscan" style={{ inset: -overscan }}><div className="fidelity-replica-filter" style={replicaFilterStyle}><div ref={setWorldNode} className="fidelity-replica-world" style={replicaWorldStyle}><SceneArtwork copy="replica" /></div></div></div> : null}<div className="fidelity-fill" /><div className="fidelity-edge" /></div>
    <div className="fidelity-content">{children}</div>
  </div>;
}

function usePlate(container: RefObject<HTMLElement | null>, selected: string) {
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  useLayoutEffect(() => { const update = () => { const root = container.current; const item = root?.querySelector<HTMLElement>(`[data-fidelity-item="${selected}"]`); if (!root || !item) return; const a = root.getBoundingClientRect(); const b = item.getBoundingClientRect(); setRect({ x: b.left - a.left, y: b.top - a.top, width: b.width, height: b.height }); }; const observer = new ResizeObserver(update); if (container.current) observer.observe(container.current); window.addEventListener("resize", update); window.addEventListener("scroll", update, true); document.fonts?.ready.then(update).catch(() => undefined); update(); return () => { observer.disconnect(); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); }; }, [container, selected]);
  return rect;
}

/** Toolbar/popover share one open state; the plate is measured, persistent, and never filtered. */
export function CoupledMenu({ stageRef, theme, viewportCentered = false, mode = "enhanced" }: { stageRef: RefObject<HTMLElement | null>; theme: FidelityTheme; viewportCentered?: boolean; mode?: MaterialMode }) {
  const [open, setOpen] = useState(false); const [exiting, setExiting] = useState(false); const [selected, setSelected] = useState("view"); const items = ["view", "select", "map", "sort"];
  const contentRef = useRef<HTMLDivElement>(null); const plate = usePlate(contentRef, selected);
  const popoverMounted = open || exiting;
  const toggle = () => { if (open) { setOpen(false); setExiting(true); } else { setExiting(false); setOpen(true); } };
  return <div className={`fidelity-menu-cluster ${viewportCentered ? "fidelity-menu-cluster--viewport-centered" : ""} ${open ? "is-open" : ""}`}><RefractedSurface stageRef={stageRef} theme={theme} mode={mode} geometryKey={open} radius={999} className="fidelity-toolbar"><button type="button" aria-label="Back">‹</button><span>Photos<small>8 ITEMS</small></span><button type="button" aria-expanded={open} onClick={toggle}>•••</button></RefractedSurface><span className="fidelity-coupling" aria-hidden="true" />
    {popoverMounted ? <RefractedSurface stageRef={stageRef} theme={theme} mode={mode} geometryKey={`${open}-${exiting}`} radius={32} className="fidelity-popover" onTransitionEnd={() => { if (!open) setExiting(false); }}><div ref={contentRef} className="fidelity-menu-content"><span className="fidelity-selection" style={{ transform: `translate3d(${plate.x}px,${plate.y}px,0)`, width: plate.width, height: plate.height }} aria-hidden="true" />{items.map((item) => <button key={item} data-fidelity-item={item} className={item === selected ? "is-selected" : ""} type="button" aria-pressed={item === selected} onClick={() => setSelected(item)}>{item === "view" ? "View Options" : item === "select" ? "Select" : item === "map" ? "Show Map" : "Sort By"}</button>)}</div></RefractedSurface> : null}</div>;
}
