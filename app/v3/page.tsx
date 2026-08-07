"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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
type LensPhase = "idle" | "primed" | "expanding" | "travelling" | "dragging" | "drag-settling";
type SliderPhase = "idle" | "dragging" | "settling";
type VisualLayer = "base" | "selection" | "lens";

interface TabDefinition {
  id: TabId;
  label: string;
  icon: "follow" | "market" | "activity" | "open";
}

interface LensPosition {
  x: number;
  y: number;
}

interface TabGeometry extends LensPosition {
  width: number;
  height: number;
}

interface NavigationGeometry {
  width: number;
  height: number;
  tabs: Record<TabId, TabGeometry>;
}

interface SliderPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragSession {
  pointerId: number;
  pointerTarget: HTMLButtonElement;
  startClientX: number;
  x: number;
  hasMoved: boolean;
}

const TABS: readonly TabDefinition[] = [
  { id: "follow", label: "关注", icon: "follow" },
  { id: "market", label: "市场", icon: "market" },
  { id: "activity", label: "动态", icon: "activity" },
  { id: "open", label: "开户", icon: "open" },
];

const REFERENCE_NAVIGATION_WIDTH = 872;
const REFERENCE_NAVIGATION_HEIGHT = 210;
const REFERENCE_LENS_WIDTH = 296;
const REFERENCE_LENS_HEIGHT = 242;
const FIELD_SCALE = 26;
const FIELD_RESOLUTION = 2;
const FILTER_PADDING = 36;
const EDGE_BAND_WIDTH = 20;
const BASELINE_BULGE = 0.18;
const BASELINE_EDGE_REFRACTION = 3.4;
const EDGE_REFRACTION_MULTIPLIER = 1.14;
const DRAG_THRESHOLD = 5;
const DRAG_SETTLE_DURATION = 260;
const LENS_TRAVEL_DURATION = 680;

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

function createLensDimensions(geometry: NavigationGeometry) {
  const ratio = clamp(
    Math.min(
      geometry.width / REFERENCE_NAVIGATION_WIDTH,
      geometry.height / REFERENCE_NAVIGATION_HEIGHT,
    ),
    0.52,
    1,
  );
  return {
    width: Math.round(REFERENCE_LENS_WIDTH * ratio),
    height: Math.round(REFERENCE_LENS_HEIGHT * ratio),
  };
}

function createEllipticalField(width: number, height: number, optics: OpticsMode) {
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
      const edgeDistance = Math.max(0, (1 - radius) * Math.min(halfWidth, halfHeight));
      const edge = 1 - smoothstep(0, EDGE_BAND_WIDTH, edgeDistance);
      const normalGradientX = x / (halfWidth * halfWidth);
      const normalGradientY = y / (halfHeight * halfHeight);
      const normalLength = Math.hypot(normalGradientX, normalGradientY) || 1;
      const normalX = normalGradientX / normalLength;
      const normalY = normalGradientY / normalLength;
      const interiorFalloff = 1 - smoothstep(0.7, 1, radius);
      const edgeRefraction = BASELINE_EDGE_REFRACTION * (optics === "edge" ? EDGE_REFRACTION_MULTIPLIER : 1);
      const offsetX = x * -BASELINE_BULGE * interiorFalloff + normalX * edge * edgeRefraction;
      const offsetY = y * -BASELINE_BULGE * interiorFalloff + normalY * edge * edgeRefraction;
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

function LensFilter({ id, field, width, height }: { id: string; field: string; width: number; height: number }) {
  return (
    <filter
      id={id}
      x={-FILTER_PADDING}
      y={-FILTER_PADDING}
      width={width + FILTER_PADDING * 2}
      height={height + FILTER_PADDING * 2}
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feImage href={field} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="field" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="field"
        scale={FIELD_SCALE}
        xChannelSelector="R"
        yChannelSelector="G"
        x={-FILTER_PADDING}
        y={-FILTER_PADDING}
        width={width + FILTER_PADDING * 2}
        height={height + FILTER_PADDING * 2}
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

function NavVisual({ layer, suppressedId }: { layer: VisualLayer; suppressedId?: TabId }) {
  return (
    <div className="v3-nav-visual" data-visual-layer={layer} aria-hidden="true">
      {TABS.map((tab) => (
        <div
          className="v3-tab-visual"
          data-suppressed={tab.id === suppressedId ? "true" : undefined}
          key={tab.id}
        >
          <Glyph name={tab.icon} />
          <span>{tab.label}</span>
        </div>
      ))}
    </div>
  );
}

function getSliderInsets(geometry: NavigationGeometry) {
  const ratio = clamp(geometry.height / REFERENCE_NAVIGATION_HEIGHT, 0.52, 1);
  return {
    horizontal: Math.max(2, Math.round(4 * ratio)),
    vertical: Math.max(8, Math.round(14 * ratio)),
  };
}

function positionForTab(id: TabId, geometry: NavigationGeometry): SliderPosition {
  const tab = geometry.tabs[id];
  const insets = getSliderInsets(geometry);
  return {
    x: tab.x - tab.width / 2,
    y: insets.vertical,
    width: Math.max(0, tab.width - insets.horizontal * 2),
    height: Math.max(0, geometry.height - insets.vertical * 2),
  };
}

export default function V3Page() {
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ follow: null, market: null, activity: null, open: null });
  const travelTimeoutRef = useRef<number | null>(null);
  const sliderTimeoutRef = useRef<number | null>(null);
  const animationFramesRef = useRef<number[]>([]);
  const dragAnimationFrameRef = useRef<number | null>(null);
  const pendingDragLensPositionRef = useRef<LensPosition | null>(null);
  const sessionRef = useRef(0);
  const dragSessionRef = useRef<DragSession | null>(null);
  const activeIdRef = useRef<TabId>("open");
  const lensPhaseRef = useRef<LensPhase>("idle");
  const sliderPhaseRef = useRef<SliderPhase>("idle");
  const targetIdRef = useRef<TabId | null>(null);
  const geometryRef = useRef<NavigationGeometry | null>(null);
  const suppressNextClickRef = useRef(false);
  const filterId = `v3-lens-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const [activeId, setActiveId] = useState<TabId>("open");
  const [previewId, setPreviewId] = useState<TabId>("open");
  const [geometry, setGeometry] = useState<NavigationGeometry | null>(null);
  const [sliderPosition, setSliderPosition] = useState<SliderPosition | null>(null);
  const [sliderPhase, setSliderPhase] = useState<SliderPhase>("idle");
  const [lensPosition, setLensPosition] = useState<LensPosition>({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<LensPosition>({ x: 0, y: 0 });
  const [lensPhase, setLensPhase] = useState<LensPhase>("idle");
  const [travelSession, setTravelSession] = useState(0);
  const [targetId, setTargetId] = useState<TabId | null>(null);
  const [optics, setOptics] = useState<OpticsMode>("baseline");
  const [field, setField] = useState("");
  const [lensDimensions, setLensDimensions] = useState({
    width: REFERENCE_LENS_WIDTH,
    height: REFERENCE_LENS_HEIGHT,
  });

  const updateSliderPhase = useCallback((nextPhase: SliderPhase) => {
    sliderPhaseRef.current = nextPhase;
    setSliderPhase(nextPhase);
  }, []);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    lensPhaseRef.current = lensPhase;
  }, [lensPhase]);

  useEffect(() => {
    targetIdRef.current = targetId;
  }, [targetId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedOptics = new URLSearchParams(window.location.search).get("optics") === "edge"
        ? "edge"
        : "baseline";
      setOptics(requestedOptics);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setField(createEllipticalField(lensDimensions.width, lensDimensions.height, optics));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [lensDimensions, optics]);

  const clearPendingTravel = useCallback(() => {
    if (travelTimeoutRef.current !== null) {
      window.clearTimeout(travelTimeoutRef.current);
      travelTimeoutRef.current = null;
    }
    animationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    animationFramesRef.current = [];
  }, []);

  const clearPendingSliderSettle = useCallback(() => {
    if (sliderTimeoutRef.current !== null) {
      window.clearTimeout(sliderTimeoutRef.current);
      sliderTimeoutRef.current = null;
    }
  }, []);

  const clearPendingDragLensPosition = useCallback(() => {
    if (dragAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAnimationFrameRef.current);
      dragAnimationFrameRef.current = null;
    }
    pendingDragLensPositionRef.current = null;
  }, []);

  const queueDragLensPosition = useCallback((nextPosition: LensPosition) => {
    pendingDragLensPositionRef.current = nextPosition;
    if (dragAnimationFrameRef.current !== null) return;
    dragAnimationFrameRef.current = window.requestAnimationFrame(() => {
      dragAnimationFrameRef.current = null;
      const position = pendingDragLensPositionRef.current;
      pendingDragLensPositionRef.current = null;
      if (position) setLensPosition(position);
    });
  }, []);

  const flushQueuedDragLensPosition = useCallback(() => {
    if (dragAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAnimationFrameRef.current);
      dragAnimationFrameRef.current = null;
    }
    const position = pendingDragLensPositionRef.current;
    pendingDragLensPositionRef.current = null;
    if (position) setLensPosition(position);
  }, []);

  const setCommittedTab = useCallback((nextId: TabId, nextGeometry = geometryRef.current) => {
    activeIdRef.current = nextId;
    setActiveId(nextId);
    setPreviewId(nextId);
    if (nextGeometry) {
      setSliderPosition(positionForTab(nextId, nextGeometry));
    }
  }, []);

  const finishTravel = useCallback((completedId: TabId, completedSession: number) => {
    if (completedSession !== sessionRef.current) return;
    clearPendingTravel();
    sessionRef.current += 1;
    setCommittedTab(completedId);
    targetIdRef.current = null;
    setTargetId(null);
    updateSliderPhase("idle");
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
  }, [clearPendingTravel, setCommittedTab, updateSliderPhase]);

  const readNavigationGeometry = useCallback((): NavigationGeometry | null => {
    const nav = navRef.current;
    if (!nav) return null;
    const navBox = nav.getBoundingClientRect();
    const tabs = {} as Record<TabId, TabGeometry>;
    for (const tab of TABS) {
      const button = tabRefs.current[tab.id];
      if (!button) return null;
      const buttonBox = button.getBoundingClientRect();
      tabs[tab.id] = {
        x: buttonBox.left - navBox.left + buttonBox.width / 2,
        y: buttonBox.top - navBox.top + buttonBox.height / 2,
        width: buttonBox.width,
        height: buttonBox.height,
      };
    }
    return { width: navBox.width, height: navBox.height, tabs };
  }, []);

  const releaseDragPointer = useCallback((dragSession: DragSession) => {
    if (dragSession.pointerTarget.hasPointerCapture(dragSession.pointerId)) {
      dragSession.pointerTarget.releasePointerCapture(dragSession.pointerId);
    }
  }, []);

  const cancelActiveDrag = useCallback(() => {
    const dragSession = dragSessionRef.current;
    if (dragSession) {
      dragSessionRef.current = null;
      releaseDragPointer(dragSession);
    }
    clearPendingSliderSettle();
    clearPendingDragLensPosition();
    if (lensPhaseRef.current !== "dragging" && lensPhaseRef.current !== "drag-settling") return;
    targetIdRef.current = null;
    setTargetId(null);
    setPreviewId(activeIdRef.current);
    if (geometryRef.current) setSliderPosition(positionForTab(activeIdRef.current, geometryRef.current));
    updateSliderPhase("idle");
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
    suppressNextClickRef.current = false;
  }, [clearPendingDragLensPosition, clearPendingSliderSettle, releaseDragPointer, updateSliderPhase]);

  const completeDragSettle = useCallback((nextId: TabId) => {
    clearPendingSliderSettle();
    setCommittedTab(nextId);
    targetIdRef.current = null;
    setTargetId(null);
    updateSliderPhase("idle");
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
    suppressNextClickRef.current = false;
  }, [clearPendingSliderSettle, setCommittedTab, updateSliderPhase]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const updateGeometry = () => {
      const nextGeometry = readNavigationGeometry();
      if (!nextGeometry) return;
      if (
        dragSessionRef.current ||
        lensPhaseRef.current === "dragging" ||
        lensPhaseRef.current === "drag-settling"
      ) cancelActiveDrag();
      geometryRef.current = nextGeometry;
      setGeometry(nextGeometry);
      setLensDimensions((currentDimensions) => {
        const nextDimensions = createLensDimensions(nextGeometry);
        return currentDimensions.width === nextDimensions.width && currentDimensions.height === nextDimensions.height
          ? currentDimensions
          : nextDimensions;
      });
      const currentTarget = targetIdRef.current;
      if (sliderPhaseRef.current !== "dragging") {
        const sliderTabId = lensPhaseRef.current !== "idle" && currentTarget
          ? currentTarget
          : activeIdRef.current;
        setSliderPosition(positionForTab(sliderTabId, nextGeometry));
      }

      if (lensPhaseRef.current !== "idle" && currentTarget) {
        const origin = nextGeometry.tabs[activeIdRef.current];
        const destination = nextGeometry.tabs[currentTarget];
        setTargetPosition(destination);
        if (lensPhaseRef.current === "travelling") {
          setLensPosition(destination);
          clearPendingTravel();
          const activeSession = sessionRef.current;
          travelTimeoutRef.current = window.setTimeout(
            () => finishTravel(currentTarget, activeSession),
            LENS_TRAVEL_DURATION,
          );
        } else {
          setLensPosition(origin);
        }
      }
    };
    const observer = "ResizeObserver" in window
      ? new ResizeObserver(updateGeometry)
      : null;
    observer?.observe(nav);
    window.addEventListener("resize", updateGeometry);
    updateGeometry();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateGeometry);
    };
  }, [cancelActiveDrag, clearPendingTravel, finishTravel, readNavigationGeometry]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (
        event.matches &&
        targetIdRef.current &&
        (lensPhaseRef.current === "primed" || lensPhaseRef.current === "expanding" || lensPhaseRef.current === "travelling")
      ) finishTravel(targetIdRef.current, sessionRef.current);
      if (event.matches) cancelActiveDrag();
    };
    motionQuery.addEventListener("change", handleMotionChange);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, [cancelActiveDrag, finishTravel]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        targetIdRef.current &&
        (lensPhaseRef.current === "primed" || lensPhaseRef.current === "expanding" || lensPhaseRef.current === "travelling")
      ) {
        finishTravel(targetIdRef.current, sessionRef.current);
      }
      if (document.visibilityState === "hidden") cancelActiveDrag();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cancelActiveDrag, finishTravel]);

  useEffect(() => () => {
    clearPendingTravel();
    clearPendingSliderSettle();
    clearPendingDragLensPosition();
    const dragSession = dragSessionRef.current;
    if (dragSession) releaseDragPointer(dragSession);
    dragSessionRef.current = null;
  }, [clearPendingDragLensPosition, clearPendingSliderSettle, clearPendingTravel, releaseDragPointer]);

  const selectTab = useCallback((nextId: TabId) => {
    if (
      nextId === activeIdRef.current ||
      lensPhaseRef.current !== "idle" ||
      sliderPhaseRef.current !== "idle" ||
      dragSessionRef.current
    ) return;
    const nextGeometry = geometryRef.current;
    const origin = nextGeometry?.tabs[activeIdRef.current];
    const destination = nextGeometry?.tabs[nextId];
    if (!origin || !destination || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCommittedTab(nextId, nextGeometry);
      return;
    }
    const nextSession = sessionRef.current + 1;
    sessionRef.current = nextSession;
    setLensPosition(origin);
    setTargetPosition(destination);
    setPreviewId(nextId);
    setSliderPosition(positionForTab(nextId, nextGeometry));
    updateSliderPhase("settling");
    targetIdRef.current = nextId;
    setTargetId(nextId);
    setTravelSession(nextSession);
    lensPhaseRef.current = "primed";
    setLensPhase("primed");
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        lensPhaseRef.current = "expanding";
        setLensPhase("expanding");
      });
      animationFramesRef.current.push(secondFrame);
    });
    animationFramesRef.current.push(firstFrame);
    travelTimeoutRef.current = window.setTimeout(() => finishTravel(nextId, nextSession), 1160);
  }, [finishTravel, setCommittedTab, updateSliderPhase]);

  const selectOptics = useCallback((nextMode: OpticsMode) => {
    setOptics(nextMode);
    setField(createEllipticalField(lensDimensions.width, lensDimensions.height, nextMode));
  }, [lensDimensions]);

  const handleLensExpansionEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform" || lensPhaseRef.current !== "expanding") return;
    setLensPosition(targetPosition);
    lensPhaseRef.current = "travelling";
    setLensPhase("travelling");
  }, [targetPosition]);

  const handleLensTravelEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    const completedId = targetIdRef.current;
    if (event.target !== event.currentTarget || event.propertyName !== "transform" || lensPhaseRef.current !== "travelling" || !completedId) return;
    finishTravel(completedId, travelSession);
  }, [finishTravel, travelSession]);

  const nearestTabForLensX = useCallback((x: number): TabId => {
    const nextGeometry = geometryRef.current;
    if (!nextGeometry) return activeIdRef.current;
    return TABS.reduce((closest, tab) => {
      const candidate = nextGeometry.tabs[tab.id];
      const current = nextGeometry.tabs[closest];
      return Math.abs(candidate.x - x) < Math.abs(current.x - x)
        ? tab.id
        : closest;
    }, TABS[0].id);
  }, []);

  const updateDrag = useCallback((dragSession: DragSession, clientX: number) => {
    const nextGeometry = geometryRef.current;
    const nav = navRef.current;
    if (!nextGeometry || !nav) return false;
    const navBox = nav.getBoundingClientRect();
    const minimumLensX = lensDimensions.width / 2;
    const maximumLensX = Math.max(minimumLensX, nextGeometry.width - lensDimensions.width / 2);
    const nextX = clamp(clientX - navBox.left, minimumLensX, maximumLensX);
    dragSession.hasMoved = dragSession.hasMoved || Math.abs(clientX - dragSession.startClientX) > DRAG_THRESHOLD;
    if (!dragSession.hasMoved) return true;
    dragSession.x = nextX;
    const nextPreviewId = nearestTabForLensX(nextX);
    setPreviewId(nextPreviewId);
    targetIdRef.current = nextPreviewId;
    setTargetId(nextPreviewId);
    queueDragLensPosition({ x: nextX, y: nextGeometry.height / 2 });
    if (lensPhaseRef.current !== "dragging") {
      lensPhaseRef.current = "dragging";
      setLensPhase("dragging");
      updateSliderPhase("dragging");
    }
    return true;
  }, [lensDimensions.width, nearestTabForLensX, queueDragLensPosition, updateSliderPhase]);

  const finishDrag = useCallback((pointerId: number, wasCancelled: boolean, clientX?: number) => {
    const dragSession = dragSessionRef.current;
    if (!dragSession || dragSession.pointerId !== pointerId) return;
    if (!wasCancelled && clientX !== undefined) updateDrag(dragSession, clientX);
    dragSessionRef.current = null;
    releaseDragPointer(dragSession);
    if (wasCancelled) {
      cancelActiveDrag();
      return;
    }
    if (!dragSession.hasMoved) {
      updateSliderPhase("idle");
      return;
    }
    suppressNextClickRef.current = true;
    flushQueuedDragLensPosition();
    const nextGeometry = geometryRef.current;
    if (!nextGeometry) {
      cancelActiveDrag();
      return;
    }
    const nextId = nearestTabForLensX(dragSession.x);
    const target = nextGeometry.tabs[nextId];
    targetIdRef.current = nextId;
    setTargetId(nextId);
    setPreviewId(nextId);
    setTargetPosition(target);
    setSliderPosition(positionForTab(nextId, nextGeometry));
    updateSliderPhase("settling");
    lensPhaseRef.current = "drag-settling";
    setLensPhase("drag-settling");
    dragAnimationFrameRef.current = window.requestAnimationFrame(() => {
      dragAnimationFrameRef.current = null;
      setLensPosition(target);
    });
    clearPendingSliderSettle();
    sliderTimeoutRef.current = window.setTimeout(() => {
      sliderTimeoutRef.current = null;
      completeDragSettle(nextId);
    }, DRAG_SETTLE_DURATION);
  }, [cancelActiveDrag, clearPendingSliderSettle, completeDragSettle, flushQueuedDragLensPosition, nearestTabForLensX, releaseDragPointer, updateDrag, updateSliderPhase]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>, tabId: TabId) => {
    if (
      tabId !== activeIdRef.current ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0) ||
      dragSessionRef.current ||
      lensPhaseRef.current !== "idle" ||
      sliderPhaseRef.current !== "idle" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    const nextGeometry = geometryRef.current;
    const nav = navRef.current;
    if (!nextGeometry || !nav) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      pointerTarget: event.currentTarget,
      startClientX: event.clientX,
      x: nextGeometry.tabs[tabId].x,
      hasMoved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragSession = dragSessionRef.current;
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    if (updateDrag(dragSession, event.clientX) && dragSession.hasMoved) event.preventDefault();
  }, [updateDrag]);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    finishDrag(event.pointerId, false, event.clientX);
  }, [finishDrag]);

  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    finishDrag(event.pointerId, true);
  }, [finishDrag]);

  const handleLostPointerCapture = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragSession = dragSessionRef.current;
    if (dragSession?.pointerId === event.pointerId) finishDrag(event.pointerId, true);
  }, [finishDrag]);

  useEffect(() => {
    const handleWindowPointerUp = (event: PointerEvent) => finishDrag(event.pointerId, false, event.clientX);
    const handleWindowPointerCancel = (event: PointerEvent) => finishDrag(event.pointerId, true);
    window.addEventListener("pointerup", handleWindowPointerUp, true);
    window.addEventListener("pointercancel", handleWindowPointerCancel, true);
    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp, true);
      window.removeEventListener("pointercancel", handleWindowPointerCancel, true);
    };
  }, [finishDrag]);

  const handleTabClick = useCallback((tabId: TabId) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    selectTab(tabId);
  }, [selectTab]);

  const sliderStyle = sliderPosition
    ? {
        "--v3-slider-x": `${sliderPosition.x}px`,
        "--v3-slider-y": `${sliderPosition.y}px`,
        "--v3-slider-width": `${sliderPosition.width}px`,
        "--v3-slider-height": `${sliderPosition.height}px`,
      } as CSSProperties
    : undefined;
  const navStyle = {
    "--v3-lens-x": `${lensPosition.x}px`,
    "--v3-lens-y": `${lensPosition.y}px`,
    "--v3-world-width": `${geometry?.width ?? 0}px`,
    "--v3-world-height": `${geometry?.height ?? 0}px`,
    "--v3-lens-width": `${lensDimensions.width}px`,
    "--v3-lens-height": `${lensDimensions.height}px`,
    "--v3-lens-half-width": `${lensDimensions.width / 2}px`,
    "--v3-lens-half-height": `${lensDimensions.height / 2}px`,
  } as CSSProperties;
  const lensOpticsStyle = {
    "--v3-lens-filter": field ? `url("#${filterId}")` : "none",
  } as CSSProperties;
  const selectionVisible = lensPhase === "idle";

  return (
    <main className="v3-demo" data-optics={optics}>
      <div className="v3-stage-glow" aria-hidden="true" />
      <section className="v3-copy" aria-label="V3 liquid glass study"><p>LIQUID GLASS / V3</p><h1>横向导航透镜</h1><span>点击任意标签；经过的标签不会改变激活状态。</span></section>
      <div className="v3-optics" aria-label="Optics mode"><button type="button" className={optics === "baseline" ? "is-active" : ""} onClick={() => selectOptics("baseline")}>Baseline</button><button type="button" className={optics === "edge" ? "is-active" : ""} onClick={() => selectOptics("edge")}>Edge optics</button></div>
      <div className="v3-dock">
        <nav ref={navRef} className="v3-nav" aria-label="主导航" data-lens-phase={lensPhase} data-slider-phase={sliderPhase} data-preview-id={previewId} style={navStyle}>
          <NavVisual layer="base" suppressedId={selectionVisible ? activeId : undefined} />
          <div
            className="v3-selection-slider"
            data-active-id={activeId}
            data-phase={sliderPhase}
            data-ready={sliderPosition ? "true" : "false"}
            data-visible={selectionVisible ? "true" : "false"}
            style={sliderStyle}
            aria-hidden="true"
          >
            <div className="v3-selection-optical-clip">
              <div className="v3-selection-world"><NavVisual layer="selection" /></div>
            </div>
          </div>
          <div className="v3-tab-actions">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[tab.id] = node; }}
                type="button"
                aria-current={tab.id === activeId ? "page" : undefined}
                aria-label={`切换到${tab.label}`}
                onClick={() => handleTabClick(tab.id)}
                onPointerDown={(event) => handlePointerDown(event, tab.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onLostPointerCapture={handleLostPointerCapture}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {field ? <svg className="v3-filter-definitions" aria-hidden="true"><defs><LensFilter id={filterId} field={field} width={lensDimensions.width} height={lensDimensions.height} /></defs></svg> : null}
          <div className="v3-lens-position" aria-hidden="true" data-phase={lensPhase} onTransitionEnd={handleLensTravelEnd}>
            <div className="v3-lens-shell" onTransitionEnd={handleLensExpansionEnd}>
              <div className="v3-lens-optics-viewport" style={lensOpticsStyle}>
                <div className="v3-lens-content"><NavVisual layer="lens" /></div>
              </div>
              <span className="v3-lens-inner" /><span className="v3-lens-pole v3-lens-pole--top" /><span className="v3-lens-pole v3-lens-pole--bottom" /><span className="v3-lens-sheen" />
            </div>
          </div>
        </nav>
        <button className="v3-sparkle" type="button" aria-label="打开快捷功能"><Glyph name="sparkle" /><i /></button>
      </div>
    </main>
  );
}
