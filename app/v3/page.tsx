"use client";

import {
  type CSSProperties,
  type TransitionEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import "./v3.css";

type TabId = "follow" | "market" | "activity" | "open";
type OpticsMode = "baseline" | "edge";
type LensPhase = "idle" | "primed" | "expanding" | "travelling";

interface TabDefinition {
  id: TabId;
  label: string;
  icon: "follow" | "market" | "activity" | "open";
}

interface LensPosition {
  x: number;
  y: number;
}

const TABS: readonly TabDefinition[] = [
  { id: "follow", label: "关注", icon: "follow" },
  { id: "market", label: "市场", icon: "market" },
  { id: "activity", label: "动态", icon: "activity" },
  { id: "open", label: "开户", icon: "open" },
];

const LENS_WIDTH = 224;
const LENS_HEIGHT = 184;
const FIELD_SCALE = 42;
const FIELD_RESOLUTION = 2;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function encodeDisplacement(value: number) {
  return Math.round(clamp(127.5 + (value / FIELD_SCALE) * 255, 0, 255));
}

function createEllipticalField(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width * FIELD_RESOLUTION;
  canvas.height = height * FIELD_RESOLUTION;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";

  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const x = (pixelX + 0.5) / FIELD_RESOLUTION - halfWidth;
      const y = (pixelY + 0.5) / FIELD_RESOLUTION - halfHeight;
      const normalizedX = x / halfWidth;
      const normalizedY = y / halfHeight;
      const radius = Math.hypot(normalizedX, normalizedY);
      const edge = Math.pow(smoothstep(0.52, 1, radius), 2.15);
      const centerZoom = 0.14 + edge * 0.19;
      const normalLength = Math.hypot(normalizedX, normalizedY) || 1;
      const normalX = normalizedX / normalLength;
      const normalY = normalizedY / normalLength;
      const offsetX = x * -centerZoom + normalX * edge * 22;
      const offsetY = y * -centerZoom + normalY * edge * 17;
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = encodeDisplacement(offsetX);
      pixels.data[index + 1] = encodeDisplacement(offsetY);
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}

function LensFilter({ id, field }: { id: string; field: string }) {
  return (
    <filter
      id={id}
      x="-24"
      y="-24"
      width={LENS_WIDTH + 48}
      height={LENS_HEIGHT + 48}
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feImage href={field} width={LENS_WIDTH} height={LENS_HEIGHT} result="field" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="field"
        scale={FIELD_SCALE}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

function Glyph({ name }: { name: TabDefinition["icon"] | "sparkle" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "follow") return <svg {...props}><path d="M4 4h16v16H4z" /><path d="m8 15 3-5h5l-3 5H8Z" /></svg>;
  if (name === "market") return <svg {...props}><circle cx="12" cy="12" r="8" /><path d="m8.4 8.5 7.2 3.1-3.1 4.2Z" /></svg>;
  if (name === "activity") return <svg {...props}><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v6" /></svg>;
  if (name === "open") return <svg {...props}><path fill="currentColor" stroke="none" d="M12 2a10 10 0 1 0 10 10H12Z" /></svg>;
  return <svg {...props}><path d="m12 2 1.8 7.1L21 12l-7.2 2.9L12 22l-2.8-7.1L2 12l7.2-2.9Z" /></svg>;
}

function NavVisual({ activeId }: { activeId: TabId }) {
  return <div className="v3-nav-visual" aria-hidden="true">{TABS.map((tab) => <div className="v3-tab-visual" data-active={tab.id === activeId ? "true" : undefined} key={tab.id}><Glyph name={tab.icon} /><span>{tab.label}</span></div>)}</div>;
}

export default function V3Page() {
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ follow: null, market: null, activity: null, open: null });
  const travelTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const animationFramesRef = useRef<number[]>([]);
  const sessionRef = useRef(0);
  const filterId = `v3-lens-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const [activeId, setActiveId] = useState<TabId>("open");
  const [lensPosition, setLensPosition] = useState<LensPosition>({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<LensPosition>({ x: 0, y: 0 });
  const [lensPhase, setLensPhase] = useState<LensPhase>("idle");
  const [travelSession, setTravelSession] = useState(0);
  const [targetId, setTargetId] = useState<TabId | null>(null);
  const [optics, setOptics] = useState<OpticsMode>("baseline");
  const [field, setField] = useState("");
  const [navSize, setNavSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("optics") !== "edge") return;
    const frame = window.requestAnimationFrame(() => {
      setOptics("edge");
      setField(createEllipticalField(LENS_WIDTH, LENS_HEIGHT));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const clearPendingTravel = useCallback(() => {
    if (travelTimeoutRef.current !== null) {
      window.clearTimeout(travelTimeoutRef.current);
      travelTimeoutRef.current = null;
    }
    animationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    animationFramesRef.current = [];
  }, []);

  const finishTravel = useCallback((completedId: TabId, completedSession: number) => {
    if (completedSession !== sessionRef.current) return;
    clearPendingTravel();
    sessionRef.current += 1;
    setActiveId(completedId);
    setTargetId(null);
    setLensPhase("idle");
  }, [clearPendingTravel]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const updateSize = () => setNavSize({ width: nav.clientWidth, height: nav.clientHeight });
    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(updateSize);
      observer.observe(nav);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const positionFor = useCallback((id: TabId): LensPosition | null => {
    const nav = navRef.current;
    const tab = tabRefs.current[id];
    if (!nav || !tab) return null;
    const navBox = nav.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    return { x: tabBox.left - navBox.left + tabBox.width / 2, y: tabBox.top - navBox.top + tabBox.height / 2 };
  }, []);

  useEffect(() => {
    const reposition = () => {
      if (lensPhase === "idle") return;
      const origin = positionFor(activeId);
      const destination = targetId ? positionFor(targetId) : null;
      if (!origin || !destination) return;
      setTargetPosition(destination);
      setLensPosition(lensPhase === "travelling" ? destination : origin);
    };
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [activeId, lensPhase, positionFor, targetId]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches && targetId) finishTravel(targetId, travelSession);
    };
    motionQuery.addEventListener("change", handleMotionChange);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, [finishTravel, targetId, travelSession]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && targetId) finishTravel(targetId, travelSession);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [finishTravel, targetId, travelSession]);

  useEffect(() => () => clearPendingTravel(), [clearPendingTravel]);

  const selectTab = useCallback((nextId: TabId) => {
    if (nextId === activeId || lensPhase !== "idle") return;
    const origin = positionFor(activeId);
    const destination = positionFor(nextId);
    if (!origin || !destination) {
      setActiveId(nextId);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveId(nextId);
      return;
    }
    const nextSession = sessionRef.current + 1;
    sessionRef.current = nextSession;
    setLensPosition(origin);
    setTargetPosition(destination);
    setTargetId(nextId);
    setTravelSession(nextSession);
    setLensPhase("primed");
    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => setLensPhase("expanding"));
      animationFramesRef.current.push(secondFrame);
    });
    animationFramesRef.current.push(firstFrame);
    travelTimeoutRef.current = window.setTimeout(() => finishTravel(nextId, nextSession), 1160);
  }, [activeId, finishTravel, lensPhase, positionFor]);

  const selectOptics = useCallback((nextMode: OpticsMode) => {
    setOptics(nextMode);
    setField(nextMode === "edge" ? createEllipticalField(LENS_WIDTH, LENS_HEIGHT) : "");
  }, []);

  const handleLensExpansionEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      lensPhase !== "expanding"
    ) return;
    setLensPosition(targetPosition);
    setLensPhase("travelling");
  }, [lensPhase, targetPosition]);

  const handleLensTravelEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "transform" ||
      lensPhase !== "travelling" ||
      !targetId
    ) return;
    finishTravel(targetId, travelSession);
  }, [finishTravel, lensPhase, targetId, travelSession]);

  const style = {
    "--v3-lens-x": `${lensPosition.x}px`,
    "--v3-lens-y": `${lensPosition.y}px`,
    "--v3-world-width": `${navSize.width}px`,
    "--v3-world-height": `${navSize.height}px`,
  } as CSSProperties;

  return (
    <main className="v3-demo" data-optics={optics}>
      <div className="v3-stage-glow" aria-hidden="true" />
      <section className="v3-copy" aria-label="V3 liquid glass study"><p>LIQUID GLASS / V3</p><h1>横向导航透镜</h1><span>点击任意标签；经过的标签不会改变激活状态。</span></section>
      <div className="v3-optics" aria-label="Optics mode"><button type="button" className={optics === "baseline" ? "is-active" : ""} onClick={() => selectOptics("baseline")}>Baseline</button><button type="button" className={optics === "edge" ? "is-active" : ""} onClick={() => selectOptics("edge")}>Edge optics</button></div>
      <div className="v3-dock">
        <nav ref={navRef} className="v3-nav" aria-label="主导航" style={style}>
          <NavVisual activeId={activeId} />
          <div className="v3-tab-actions">{TABS.map((tab) => <button key={tab.id} ref={(node) => { tabRefs.current[tab.id] = node; }} type="button" aria-current={tab.id === activeId ? "page" : undefined} aria-label={`切换到${tab.label}`} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}</div>
          {field ? <svg className="v3-filter-definitions" aria-hidden="true"><defs><LensFilter id={filterId} field={field} /></defs></svg> : null}
          <div className="v3-lens-position" aria-hidden="true" data-phase={lensPhase} onTransitionEnd={handleLensTravelEnd}>
            <div className="v3-lens-shell" onTransitionEnd={handleLensExpansionEnd}>
              <div className="v3-lens-content" style={field ? { filter: `url("#${filterId}")` } : undefined}><NavVisual activeId={targetId ?? activeId} /></div>
              <span className="v3-lens-inner" /><span className="v3-lens-pole v3-lens-pole--top" /><span className="v3-lens-pole v3-lens-pole--bottom" /><span className="v3-lens-sheen" />
            </div>
          </div>
        </nav>
        <button className="v3-sparkle" type="button" aria-label="打开快捷功能"><Glyph name="sparkle" /><i /></button>
      </div>
    </main>
  );
}
