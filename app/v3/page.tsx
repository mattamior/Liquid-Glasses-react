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
  useSyncExternalStore,
} from "react";
import {
  calculateRasterScale,
  calculateWorldSampleTransform,
  clamp,
  createCoalescedLensFieldStateScheduler,
  createLensCoordinateSpace,
  getCachedEllipticalField,
  quantizeHorizontalDirection,
  quantizeVelocityTier,
  type LensCoordinateSpace,
  type LensFieldState,
  type LensHorizontalDirection,
  type LensOpticsMode,
  type LensVelocityTier,
  STATIC_LENS_FIELD_STATE,
  V3_LENS_OPTICS,
} from "./lens-optics";
import "./v3.css";

type TabId = "follow" | "market" | "activity" | "open";
type OpticsMode = LensOpticsMode;
type LensPhase = "idle" | "primed" | "expanding" | "travelling" | "dragging" | "drag-settling";
type SliderPhase = "idle" | "dragging" | "settling";
type VisualLayer = "base" | "selection" | "lens";
type V3Theme = "dark" | "light";
type ThemePreference = "system" | V3Theme;

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
  worldOrigin: LensPosition;
  width: number;
  height: number;
  tabs: Record<TabId, TabGeometry>;
}

interface SliderPosition {
  x: number;
  width: number;
  height: number;
}

interface DragSession {
  pointerId: number;
  pointerTarget: HTMLButtonElement;
  startClientX: number;
  lastClientX: number;
  lastTimestamp: number;
  horizontalDirection: LensHorizontalDirection;
  velocityTier: LensVelocityTier;
  x: number;
  hasMoved: boolean;
}

const TABS: readonly TabDefinition[] = [
  { id: "follow", label: "关注", icon: "follow" },
  { id: "market", label: "市场", icon: "market" },
  { id: "activity", label: "动态", icon: "activity" },
  { id: "open", label: "开户", icon: "open" },
];

const REFERENCE_NAVIGATION_CONTENT_WIDTH = 870;
const REFERENCE_NAVIGATION_CONTENT_HEIGHT = 208;
const REFERENCE_LENS_WIDTH = 296;
const REFERENCE_LENS_HEIGHT = 242;
const DRAG_THRESHOLD = 5;
const DRAG_SETTLE_DURATION = 260;
const LENS_TRAVEL_DURATION = 680;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const LIGHT_COLOR_SCHEME_QUERY = "(prefers-color-scheme: light)";
const FORCED_COLORS_QUERY = "(forced-colors: active)";
const V3_THEME_STORAGE_KEY = "liquid-lab:v3-theme";

function parseStoredTheme(value: string | null): V3Theme | null {
  return value === "dark" || value === "light" ? value : null;
}

function readStoredTheme(): V3Theme | null {
  try {
    return parseStoredTheme(window.localStorage.getItem(V3_THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persistTheme(theme: V3Theme) {
  try {
    window.localStorage.setItem(V3_THEME_STORAGE_KEY, theme);
  } catch {
    // The session state still applies when storage is unavailable.
  }
}

function subscribeToMediaQuery(query: string, callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mediaQuery = window.matchMedia(query);
  const handleChange = () => callback();
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }
  mediaQuery.addListener(handleChange);
  return () => mediaQuery.removeListener(handleChange);
}

function subscribeToSystemTheme(callback: () => void) {
  return subscribeToMediaQuery(LIGHT_COLOR_SCHEME_QUERY, callback);
}

function subscribeToForcedColors(callback: () => void) {
  return subscribeToMediaQuery(FORCED_COLORS_QUERY, callback);
}

function getSystemTheme(): V3Theme {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(LIGHT_COLOR_SCHEME_QUERY).matches
    ? "light"
    : "dark";
}

function getForcedColors() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(FORCED_COLORS_QUERY).matches;
}

function getServerTheme(): V3Theme {
  return "dark";
}

function getServerForcedColors() {
  return false;
}

function supportsLensFilter() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const { SVGFEImageElement, SVGFEDisplacementMapElement } = window;
  if (!SVGFEImageElement || !SVGFEDisplacementMapElement) return false;

  const image = document.createElementNS(SVG_NAMESPACE, "feImage");
  const displacementMap = document.createElementNS(SVG_NAMESPACE, "feDisplacementMap");
  return image instanceof SVGFEImageElement && displacementMap instanceof SVGFEDisplacementMapElement;
}

function createLensDimensions(geometry: NavigationGeometry) {
  const ratio = clamp(
    Math.min(
      geometry.width / REFERENCE_NAVIGATION_CONTENT_WIDTH,
      geometry.height / REFERENCE_NAVIGATION_CONTENT_HEIGHT,
    ),
    0.52,
    1,
  );
  return {
    width: Math.round(REFERENCE_LENS_WIDTH * ratio),
    height: Math.round(REFERENCE_LENS_HEIGHT * ratio),
  };
}

function LensFilter({ id, field, width, height }: { id: string; field: string; width: number; height: number }) {
  return (
    <filter
      id={id}
      x={-V3_LENS_OPTICS.filterPaddingCssPx}
      y={-V3_LENS_OPTICS.filterPaddingCssPx}
      width={width + V3_LENS_OPTICS.filterPaddingCssPx * 2}
      height={height + V3_LENS_OPTICS.filterPaddingCssPx * 2}
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feImage href={field} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="field" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="field"
        scale={V3_LENS_OPTICS.fieldScaleCssPx}
        xChannelSelector="R"
        yChannelSelector="G"
        x={-V3_LENS_OPTICS.filterPaddingCssPx}
        y={-V3_LENS_OPTICS.filterPaddingCssPx}
        width={width + V3_LENS_OPTICS.filterPaddingCssPx * 2}
        height={height + V3_LENS_OPTICS.filterPaddingCssPx * 2}
      />
    </filter>
  );
}

function Glyph({ name, className }: { name: "sparkle" | "sun" | "moon"; className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "sun") return <svg {...props} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
  if (name === "moon") return <svg {...props} className={className}><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" /></svg>;
  return <svg {...props} className={className}><path d="m12 2 1.8 7.1L21 12l-7.2 2.9L12 22l-2.8-7.1L2 12l7.2-2.9Z" /></svg>;
}

function NavigationGlyph({ name }: { name: TabDefinition["icon"] }) {
  const props = {
    className: `v3-nav-glyph v3-nav-glyph--${name}`,
    viewBox: "0 0 100 100",
    "aria-hidden": true,
  };
  if (name === "follow") {
    return <svg {...props} fill="none" stroke="currentColor" strokeLinejoin="miter"><rect x="4" y="4" width="92" height="92" strokeWidth="12" /><path fill="currentColor" stroke="none" d="M25 76 47 28h31L62 45H48L39 61h24L55 76Z" /></svg>;
  }
  if (name === "market") {
    return <svg {...props} fill="none" stroke="currentColor"><circle cx="50" cy="50" r="42" strokeWidth="11" /><path fill="currentColor" stroke="none" fillRule="evenodd" d="M33 30c18 1 32 13 37 30-7 11-19 17-31 14-11-3-17-13-14-25 2-8 4-15 8-19Zm18 14c8 4 12 10 10 17-2 6-8 9-14 7-3-1-5-4-5-7 0-5 3-11 9-17Z" /></svg>;
  }
  if (name === "activity") {
    return <svg {...props} fill="currentColor" fillRule="evenodd"><path d="M0 0h100v100H0ZM12 12v28h30V12Zm46 0v28h30V12ZM12 58v30h76V58Z" /></svg>;
  }
  return <svg {...props} fill="currentColor"><path d="M50 0a50 50 0 1 0 50 50H50Z" /></svg>;
}

function NavigationWorld({
  layer,
  suppressedId,
  includeRail = false,
  highlightedId,
}: {
  layer: VisualLayer;
  suppressedId?: TabId;
  includeRail?: boolean;
  highlightedId?: TabId;
}) {
  return (
    <div className={`v3-navigation-world v3-navigation-world--${layer}`} aria-hidden="true">
      {includeRail ? <span className="v3-navigation-world__rail" /> : null}
      <div className="v3-nav-visual" data-visual-layer={layer}>
        {TABS.map((tab) => (
          <div
            className="v3-tab-visual"
            data-highlighted={tab.id === highlightedId ? "true" : undefined}
            data-suppressed={tab.id === suppressedId ? "true" : undefined}
            key={tab.id}
          >
            <span className="v3-tab-icon"><NavigationGlyph name={tab.icon} /></span>
            <span className="v3-tab-label">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSliderInsets(geometry: NavigationGeometry) {
  const ratio = clamp(geometry.height / REFERENCE_NAVIGATION_CONTENT_HEIGHT, 0.52, 1);
  return {
    horizontal: Math.max(2, Math.round(4 * ratio)),
    vertical: Math.max(8, Math.round(13 * ratio)),
  };
}

function positionForTab(id: TabId, geometry: NavigationGeometry): SliderPosition {
  const tab = geometry.tabs[id];
  const insets = getSliderInsets(geometry);
  return {
    x: tab.x - tab.width / 2,
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
  const lensFieldSchedulerRef = useRef<ReturnType<typeof createCoalescedLensFieldStateScheduler> | null>(null);
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
  const [demoChrome, setDemoChrome] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [themeOverride, setThemeOverride] = useState<V3Theme | null>(null);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerTheme);
  const forcedColors = useSyncExternalStore(subscribeToForcedColors, getForcedColors, getServerForcedColors);
  const resolvedTheme = themeOverride ?? systemTheme;
  const themePreference: ThemePreference = themeOverride ?? "system";
  const [rasterScale, setRasterScale] = useState(1);
  const [isLensFilterSupported, setLensFilterSupported] = useState(false);
  const [field, setField] = useState("");
  const [lensFieldState, setLensFieldState] = useState<LensFieldState>(STATIC_LENS_FIELD_STATE);
  const [lensDimensions, setLensDimensions] = useState({
    width: REFERENCE_LENS_WIDTH,
    height: REFERENCE_LENS_HEIGHT,
  });

  const updateSliderPhase = useCallback((nextPhase: SliderPhase) => {
    sliderPhaseRef.current = nextPhase;
    setSliderPhase(nextPhase);
  }, []);

  const clearPendingLensFieldState = useCallback(() => {
    lensFieldSchedulerRef.current?.clear();
  }, []);

  const queueLensFieldState = useCallback((nextState: LensFieldState, immediate = false) => {
    if (!lensFieldSchedulerRef.current) {
      lensFieldSchedulerRef.current = createCoalescedLensFieldStateScheduler(
        setLensFieldState,
        {
          now: () => performance.now(),
          setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
          clearTimer: (timer) => window.clearTimeout(timer),
        },
      );
    }
    lensFieldSchedulerRef.current.schedule(nextState, immediate);
  }, []);

  useEffect(() => {
    let hydratedFrame: number | null = null;
    const storageFrame = window.requestAnimationFrame(() => {
      setThemeOverride(readStoredTheme());
      hydratedFrame = window.requestAnimationFrame(() => setHydrated(true));
    });
    return () => {
      window.cancelAnimationFrame(storageFrame);
      if (hydratedFrame !== null) window.cancelAnimationFrame(hydratedFrame);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.getElementById("v3-theme-bootstrap")?.removeAttribute("data-theme");
  }, [hydrated]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== V3_THEME_STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
      } catch {
        return;
      }
      const storedTheme = parseStoredTheme(event.newValue);
      setThemeOverride(storedTheme);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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
      setDemoChrome(new URLSearchParams(window.location.search).get("chrome") === "demo");
      setRasterScale(calculateRasterScale(window.devicePixelRatio || 1));
      setLensFilterSupported(supportsLensFilter());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setField(getCachedEllipticalField(
        lensDimensions.width,
        lensDimensions.height,
        optics,
        rasterScale,
        lensFieldState,
      ));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [lensDimensions, lensFieldState, optics, rasterScale]);

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
    queueLensFieldState(STATIC_LENS_FIELD_STATE, true);
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
  }, [clearPendingTravel, queueLensFieldState, setCommittedTab, updateSliderPhase]);

  const readNavigationGeometry = useCallback((): NavigationGeometry | null => {
    const nav = navRef.current;
    if (!nav) return null;
    const navBox = nav.getBoundingClientRect();
    const worldOrigin = {
      x: navBox.left + nav.clientLeft,
      y: navBox.top + nav.clientTop,
    };
    const tabs = {} as Record<TabId, TabGeometry>;
    for (const tab of TABS) {
      const button = tabRefs.current[tab.id];
      if (!button) return null;
      const buttonBox = button.getBoundingClientRect();
      tabs[tab.id] = {
        x: buttonBox.left - worldOrigin.x + buttonBox.width / 2,
        y: buttonBox.top - worldOrigin.y + buttonBox.height / 2,
        width: buttonBox.width,
        height: buttonBox.height,
      };
    }
    return { worldOrigin, width: nav.clientWidth, height: nav.clientHeight, tabs };
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
    queueLensFieldState(STATIC_LENS_FIELD_STATE, true);
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
    suppressNextClickRef.current = false;
  }, [clearPendingDragLensPosition, clearPendingSliderSettle, queueLensFieldState, releaseDragPointer, updateSliderPhase]);

  const completeDragSettle = useCallback((nextId: TabId) => {
    clearPendingSliderSettle();
    setCommittedTab(nextId);
    targetIdRef.current = null;
    setTargetId(null);
    updateSliderPhase("idle");
    queueLensFieldState(STATIC_LENS_FIELD_STATE, true);
    lensPhaseRef.current = "idle";
    setLensPhase("idle");
    suppressNextClickRef.current = false;
  }, [clearPendingSliderSettle, queueLensFieldState, setCommittedTab, updateSliderPhase]);

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
      setRasterScale((currentRasterScale) => {
        const nextRasterScale = calculateRasterScale(window.devicePixelRatio || 1);
        return currentRasterScale === nextRasterScale ? currentRasterScale : nextRasterScale;
      });
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
    if (typeof window.matchMedia !== "function") return;

    let removeResolutionListener: (() => void) | undefined;
    const refreshRasterScale = () => {
      setRasterScale((currentRasterScale) => {
        const nextRasterScale = calculateRasterScale(window.devicePixelRatio || 1);
        return currentRasterScale === nextRasterScale ? currentRasterScale : nextRasterScale;
      });
    };
    const subscribeToResolution = () => {
      removeResolutionListener?.();
      const resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      const handleResolutionChange = () => {
        refreshRasterScale();
        subscribeToResolution();
      };

      if (typeof resolutionQuery.addEventListener === "function") {
        resolutionQuery.addEventListener("change", handleResolutionChange);
        removeResolutionListener = () => resolutionQuery.removeEventListener("change", handleResolutionChange);
      } else if (typeof resolutionQuery.addListener === "function") {
        resolutionQuery.addListener(handleResolutionChange);
        removeResolutionListener = () => resolutionQuery.removeListener(handleResolutionChange);
      } else {
        removeResolutionListener = undefined;
      }
    };

    refreshRasterScale();
    subscribeToResolution();
    return () => removeResolutionListener?.();
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = window.matchMedia("(forced-colors: active)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (
        event.matches &&
        targetIdRef.current &&
        (lensPhaseRef.current === "primed" || lensPhaseRef.current === "expanding" || lensPhaseRef.current === "travelling")
      ) finishTravel(targetIdRef.current, sessionRef.current);
      if (event.matches) cancelActiveDrag();
    };
    const handleForcedColorsChange = (event: MediaQueryListEvent) => {
      if (event.matches && targetIdRef.current) finishTravel(targetIdRef.current, sessionRef.current);
      if (event.matches) cancelActiveDrag();
    };
    motionQuery.addEventListener("change", handleMotionChange);
    forcedColorsQuery.addEventListener("change", handleForcedColorsChange);
    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      forcedColorsQuery.removeEventListener("change", handleForcedColorsChange);
    };
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
    clearPendingLensFieldState();
    const dragSession = dragSessionRef.current;
    if (dragSession) releaseDragPointer(dragSession);
    dragSessionRef.current = null;
  }, [clearPendingDragLensPosition, clearPendingLensFieldState, clearPendingSliderSettle, clearPendingTravel, releaseDragPointer]);

  const canUseLens = useCallback(() => (
    Boolean(field)
    && isLensFilterSupported
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && !window.matchMedia("(forced-colors: active)").matches
  ), [field, isLensFilterSupported]);

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
    if (!origin || !destination || !canUseLens()) {
      queueLensFieldState(STATIC_LENS_FIELD_STATE, true);
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
    queueLensFieldState({
      horizontalDirection: quantizeHorizontalDirection(destination.x - origin.x),
      velocityTier: 2,
    }, true);
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
  }, [canUseLens, finishTravel, queueLensFieldState, setCommittedTab, updateSliderPhase]);

  const selectOptics = useCallback((nextMode: OpticsMode) => {
    setOptics(nextMode);
  }, []);

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

  const updateDrag = useCallback((dragSession: DragSession, clientX: number, timestamp = performance.now()) => {
    const nextGeometry = geometryRef.current;
    if (!nextGeometry) return false;
    const minimumLensX = lensDimensions.width / 2;
    const maximumLensX = Math.max(minimumLensX, nextGeometry.width - lensDimensions.width / 2);
    const nextX = clamp(clientX - nextGeometry.worldOrigin.x, minimumLensX, maximumLensX);
    const deltaX = clientX - dragSession.lastClientX;
    const elapsed = Math.max(1, timestamp - dragSession.lastTimestamp);
    dragSession.lastClientX = clientX;
    dragSession.lastTimestamp = timestamp;
    dragSession.hasMoved = dragSession.hasMoved || Math.abs(clientX - dragSession.startClientX) > DRAG_THRESHOLD;
    if (!dragSession.hasMoved) return true;
    const direction = quantizeHorizontalDirection(deltaX);
    if (direction !== "none") {
      dragSession.horizontalDirection = direction;
      dragSession.velocityTier = quantizeVelocityTier(Math.abs(deltaX) / elapsed);
    }
    dragSession.x = nextX;
    const nextPreviewId = nearestTabForLensX(nextX);
    setPreviewId(nextPreviewId);
    targetIdRef.current = nextPreviewId;
    setTargetId(nextPreviewId);
    queueDragLensPosition({ x: nextX, y: nextGeometry.height / 2 });
    queueLensFieldState({
      horizontalDirection: dragSession.horizontalDirection,
      velocityTier: dragSession.velocityTier,
    });
    if (lensPhaseRef.current !== "dragging") {
      lensPhaseRef.current = "dragging";
      setLensPhase("dragging");
      updateSliderPhase("dragging");
    }
    return true;
  }, [lensDimensions.width, nearestTabForLensX, queueDragLensPosition, queueLensFieldState, updateSliderPhase]);

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
    const settleDirection = quantizeHorizontalDirection(target.x - dragSession.x);
    queueLensFieldState({
      horizontalDirection: settleDirection === "none" ? dragSession.horizontalDirection : settleDirection,
      velocityTier: Math.max(1, dragSession.velocityTier) as LensVelocityTier,
    }, true);
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
  }, [cancelActiveDrag, clearPendingSliderSettle, completeDragSettle, flushQueuedDragLensPosition, nearestTabForLensX, queueLensFieldState, releaseDragPointer, updateDrag, updateSliderPhase]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>, tabId: TabId) => {
    if (
      tabId !== activeIdRef.current ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0) ||
      dragSessionRef.current ||
      lensPhaseRef.current !== "idle" ||
      sliderPhaseRef.current !== "idle" ||
      !canUseLens()
    ) return;
    const nextGeometry = geometryRef.current;
    if (!nextGeometry) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      pointerTarget: event.currentTarget,
      startClientX: event.clientX,
      lastClientX: event.clientX,
      lastTimestamp: performance.now(),
      horizontalDirection: "none",
      velocityTier: 0,
      x: nextGeometry.tabs[tabId].x,
      hasMoved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [canUseLens]);

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
        "--v3-slider-width": `${sliderPosition.width}px`,
        "--v3-slider-height": `${sliderPosition.height}px`,
      } as CSSProperties
    : undefined;
  const lensCoordinateSpace: LensCoordinateSpace | null = geometry
    ? createLensCoordinateSpace(
      geometry.worldOrigin,
      { width: geometry.width, height: geometry.height },
      lensDimensions,
      lensPosition,
    )
    : null;
  const worldSampleTransform = lensCoordinateSpace
    ? calculateWorldSampleTransform(lensCoordinateSpace)
    : { x: 0, y: 0 };
  const selectionInsets = geometry
    ? getSliderInsets(geometry)
    : { horizontal: 4, vertical: 13 };
  const navStyle = {
    "--v3-lens-x": `${lensPosition.x}px`,
    "--v3-lens-y": `${lensPosition.y}px`,
    "--v3-world-width": `${geometry?.width ?? 0}px`,
    "--v3-world-height": `${geometry?.height ?? 0}px`,
    "--v3-lens-width": `${lensDimensions.width}px`,
    "--v3-lens-height": `${lensDimensions.height}px`,
    "--v3-lens-half-width": `${lensDimensions.width / 2}px`,
    "--v3-lens-half-height": `${lensDimensions.height / 2}px`,
    "--v3-selection-inset-x": `${selectionInsets.horizontal}px`,
    "--v3-selection-inset-y": `${selectionInsets.vertical}px`,
    "--v3-world-sample-x": `${worldSampleTransform.x}px`,
    "--v3-world-sample-y": `${worldSampleTransform.y}px`,
    "--v3-optic-scale": `${lensCoordinateSpace?.opticScale ?? 1}`,
  } as CSSProperties;
  const lensOpticsStyle = {
    "--v3-lens-filter": field && isLensFilterSupported ? `url("#${filterId}")` : "none",
  } as CSSProperties;
  const selectionVisible = lensPhase === "idle";
  const setPersistedTheme = useCallback((nextTheme: V3Theme) => {
    setThemeOverride(nextTheme);
    persistTheme(nextTheme);
  }, []);
  const nextTheme: V3Theme = resolvedTheme === "light" ? "dark" : "light";
  const themeToggleLabel = !hydrated
    ? "切换颜色主题"
    : forcedColors
      ? "系统颜色模式下不可切换主题"
      : `切换到${nextTheme === "light" ? "亮色" : "深色"}主题`;

  return (
    <main
      className="v3-demo"
      data-chrome={demoChrome ? "demo" : "reference"}
      data-optics={optics}
      data-theme={themeOverride ?? undefined}
      data-theme-preference={themePreference}
      data-resolved-theme={hydrated ? resolvedTheme : undefined}
      data-theme-hydrated={hydrated ? "true" : "false"}
    >
      <div className="v3-stage-glow" aria-hidden="true" hidden={!demoChrome} />
      <section className="v3-copy" aria-label="V3 liquid glass study" hidden={!demoChrome}><p>LIQUID GLASS / V3</p><h1>横向导航透镜</h1><span>点击任意标签；经过的标签不会改变激活状态。</span></section>
      <div className="v3-optics" aria-label="Optics mode" hidden={!demoChrome}><button type="button" className={optics === "baseline" ? "is-active" : ""} onClick={() => selectOptics("baseline")}>Baseline</button><button type="button" className={optics === "edge" ? "is-active" : ""} onClick={() => selectOptics("edge")}>Edge optics</button></div>
      <div className="v3-dock">
        <nav ref={navRef} className="v3-nav" aria-label="主导航" data-lens-phase={lensPhase} data-slider-phase={sliderPhase} data-preview-id={previewId} style={navStyle}>
          <NavigationWorld layer="base" suppressedId={selectionVisible ? activeId : undefined} />
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
              <div className="v3-selection-world"><NavigationWorld layer="selection" /></div>
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
          {field && isLensFilterSupported ? <svg className="v3-filter-definitions" aria-hidden="true"><defs><LensFilter id={filterId} field={field} width={lensDimensions.width} height={lensDimensions.height} /></defs></svg> : null}
          <div className="v3-lens-position" aria-hidden="true" data-phase={lensPhase} onTransitionEnd={handleLensTravelEnd}>
            <div className="v3-lens-shell" onTransitionEnd={handleLensExpansionEnd}>
              <div className="v3-lens-optics-viewport" style={lensOpticsStyle}>
                <div className="v3-lens-world-sample">
                  <NavigationWorld layer="lens" includeRail highlightedId={previewId} />
                </div>
              </div>
              <span className="v3-lens-inner" /><span className="v3-lens-pole v3-lens-pole--top" /><span className="v3-lens-pole v3-lens-pole--bottom" /><span className="v3-lens-sheen" />
            </div>
          </div>
        </nav>
        <button
          className="v3-sparkle v3-theme-toggle"
          type="button"
          aria-label={themeToggleLabel}
          aria-pressed={hydrated ? resolvedTheme === "light" : undefined}
          title={themeToggleLabel}
          disabled={forcedColors}
          onClick={() => setPersistedTheme(nextTheme)}
        >
          <Glyph name="sun" className="v3-theme-toggle__icon--sun" />
          <Glyph name="moon" className="v3-theme-toggle__icon--moon" />
          <i className="v3-sparkle__badge" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
