"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { HomeScreenScene } from "./HomeScreenScene";
import { LiquidMenuBackdrop } from "./LiquidMenuBackdrop";
import {
  APPLE_CLEAR_PANEL_OPTICS,
  APPLE_SELECTION_LENS_OPTICS,
  clamp,
  createClearPanelLensField,
} from "./lens-optics";

export type AppleClearTheme = "light" | "dark";
export type AppleClearOptics = "baseline" | "enhanced";

export interface AppleClearNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface AppleClearItem {
  label: string;
  tone: string;
  glyph?: string;
}

export type AppleClearVariant = "lab" | "embedded";
export type AppleClearHost = "standalone" | "nested";

export interface AppleClearKernelConfig {
  title?: string;
  variant?: AppleClearVariant;
  host?: AppleClearHost;
  navItems?: readonly AppleClearNavItem[];
  items?: readonly AppleClearItem[];
  value?: string;
  initialItemId?: string;
  initialTheme?: AppleClearTheme;
  initialOptics?: AppleClearOptics;
  brandTokens?: Readonly<Record<`--${string}`, string>>;
  controlledScene?: (props: { copy: "visible" | "replica" }) => ReactNode;
  onThemeChange?: (theme: AppleClearTheme) => void;
  onRouteCommit?: (item: AppleClearNavItem) => void;
}

type GlassPhase = "click" | "dragging" | "settling" | "fading";
type LensSpring = "rest" | "pressed" | "stretch";
interface Interaction {
  phase: GlassPhase;
  targetIndex: number;
  y: number;
  visible: boolean;
}
interface DragSession {
  pointerId: number;
  pointerTarget: HTMLButtonElement;
  grabOffset: number;
  originY: number;
  y: number;
  moved: boolean;
}

interface SelectionSweep {
  id: number;
  dx: number;
  dy: number;
}

const DEFAULT_NAV: readonly AppleClearNavItem[] = [
  { id: "home", label: "主页" },
  { id: "photos", label: "照片" },
  { id: "messages", label: "信息" },
  { id: "settings", label: "设置" },
];

const ITEM_HEIGHT = 58;
const TRAVEL_HEIGHT = 74;
const TRAVEL_Y_NUDGE = (ITEM_HEIGHT - TRAVEL_HEIGHT) / 2;
const ITEM_GAP = 8;
const MENU_TOP = 12;
const PLATE_INSET = -6;
const SHELL_OVERSCAN = APPLE_CLEAR_PANEL_OPTICS.filterPaddingCssPx;
const LENS_OVERSCAN = APPLE_SELECTION_LENS_OPTICS.filterPaddingCssPx;
const NAV_DURATION = 680;
const SETTLE_DURATION = 260;
const FADE_DURATION = 160;
const DRAG_THRESHOLD = 5;
const THEME_KEY = "liquid-glass:apple-clear-theme";

function toSafeId(value: string) {
  return `apple-clear-${Array.from(value, (char) =>
    /[A-Za-z0-9_-]/.test(char) ? char : `x${char.codePointAt(0)?.toString(16)}x`,
  ).join("")}`;
}

function itemY(index: number) {
  return index * (ITEM_HEIGHT + ITEM_GAP);
}

function nearestItem(y: number, length: number) {
  return clamp(Math.round(y / (ITEM_HEIGHT + ITEM_GAP)), 0, length - 1);
}

function isTravelPhase(phase: GlassPhase | undefined) {
  return phase === "click" || phase === "dragging" || phase === "settling";
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

export function LiquidGlassAppleClearKernel({ config }: { config: AppleClearKernelConfig }) {
  const variant = config.variant ?? "embedded";
  const host = config.host ?? "standalone";
  const navItems =
    config.navItems && config.navItems.length >= 1
      ? config.navItems
      : DEFAULT_NAV;
  const initialIndex = Math.max(0, navItems.findIndex((item) => item.id === (config.value ?? config.initialItemId)));
  const stageRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const finishDragRef = useRef<
    (pointerId: number, cancelled: boolean, finalY?: number) => void
  >(() => undefined);
  const sweepIdRef = useRef(0);
  const instanceId = toSafeId(useId());
  const shellFilterId = `${instanceId}-shell`;
  const lensFilterId = `${instanceId}-lens`;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(initialIndex);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const controlledIndex = config.value
    ? navItems.findIndex((item) => item.id === config.value)
    : -1;
  const selectedIndex =
    pendingIndex !== null
      ? pendingIndex
      : controlledIndex >= 0
        ? controlledIndex
        : uncontrolledIndex;
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [lensSpring, setLensSpring] = useState<LensSpring>("rest");
  const pressKind = useRef<"same" | "other" | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const [theme, setTheme] = useState<AppleClearTheme>(() => {
    if (config.initialTheme) return config.initialTheme;
    if (typeof window === "undefined") return "light";
    try {
      return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [optics, setOptics] = useState<AppleClearOptics>(config.initialOptics ?? "enhanced");
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
  const [lensGeometry, setLensGeometry] = useState({
    stageWidth: 0,
    stageHeight: 0,
    width: 0,
    height: 0,
    worldX: 0,
    worldY: 0,
    ready: false,
  });
  const [sweep, setSweep] = useState<SelectionSweep | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const timers = useRef<number[]>([]);
  const frame = useRef<number | null>(null);
  const suppressedClick = useRef<{ target: HTMLButtonElement; timer: number } | null>(null);

  const selected = navItems[selectedIndex] ?? navItems[0];
  const activeIndex = interaction?.targetIndex ?? selectedIndex;
  const enhanced = optics === "enhanced" && supported && !fallback;
  const traveling = isTravelPhase(interaction?.phase);
  const plateHeight = traveling ? TRAVEL_HEIGHT : ITEM_HEIGHT;
  const plateNudge = traveling ? TRAVEL_Y_NUDGE : 0;
  const plateY = interaction ? interaction.y : itemY(selectedIndex);

  const setTransient = useCallback((next: Interaction | null) => {
    interactionRef.current = next;
    setInteraction(next);
  }, []);

  useEffect(() => {
    if (pendingIndex === null || controlledIndex !== pendingIndex) return;
    setPendingIndex(null);
  }, [controlledIndex, pendingIndex]);

  const commitIndex = useCallback(
    (index: number) => {
      if (config.value === undefined) setUncontrolledIndex(index);
      else setPendingIndex(index);
      config.onRouteCommit?.(navItems[index]);
    },
    [config, navItems],
  );

  const clearWork = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.appleClearTheme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Session theme still applies.
    }
    config.onThemeChange?.(theme);
  }, [config, theme]);

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
      const menu = menuRef.current;
      if (!stage) return;
      const stageBox = stage.getBoundingClientRect();
      if (shell) {
        const shellBox = shell.getBoundingClientRect();
        setShellGeometry({
          stageWidth: stageBox.width,
          stageHeight: stageBox.height,
          width: shellBox.width,
          height: shellBox.height,
          worldX: stageBox.left - shellBox.left,
          worldY: stageBox.top - shellBox.top,
          ready: shellBox.width > 0 && shellBox.height > 0,
        });
      }
      if (menu) {
        const menuBox = menu.getBoundingClientRect();
        const plateWidth = Math.max(2, menuBox.width - PLATE_INSET * 2);
        // Rest plate (y=0, height=58). Travel only CSS-offsets Y; never live plate Y.
        const restPlateLeft = menuBox.left + PLATE_INSET;
        setLensGeometry({
          stageWidth: stageBox.width,
          stageHeight: stageBox.height,
          width: plateWidth,
          // Pre-build at travel size so the first click/drag frame has url(#lens).
          height: TRAVEL_HEIGHT,
          worldX: stageBox.left - restPlateLeft,
          worldY: stageBox.top - (menuBox.top + MENU_TOP),
          ready: plateWidth > 0,
        });
      }
    };
    const schedule = () => {
      if (!scheduled) scheduled = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (stageRef.current) observer.observe(stageRef.current);
    if (shellRef.current) observer.observe(shellRef.current);
    if (menuRef.current) observer.observe(menuRef.current);
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

  const bypass = useCallback(
    () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(forced-colors: active)").matches,
    [],
  );

  const playSweepBetween = useCallback((origin?: DOMRect, target?: DOMRect) => {
    if (!origin || !target) {
      setSweep(null);
      return;
    }
    const dx = target.left + target.width / 2 - (origin.left + origin.width / 2);
    const dy = target.top + target.height / 2 - (origin.top + origin.height / 2);
    if (Math.hypot(dx, dy) < 1) {
      setSweep(null);
      return;
    }
    sweepIdRef.current += 1;
    setSweep({ id: sweepIdRef.current, dx, dy });
  }, []);

  const commitAfterFade = useCallback(
    (targetIndex: number, duration: number, commit: boolean) => {
      const motion = window.setTimeout(() => {
        const current = interactionRef.current;
        if (!current) return;
        setLensSpring("rest");
        setTransient({ ...current, phase: "fading", y: itemY(targetIndex) });
        const fade = window.setTimeout(() => {
          if (commit) commitIndex(targetIndex);
          setSweep(null);
          setTransient(null);
        }, FADE_DURATION);
        timers.current.push(fade);
      }, duration);
      timers.current.push(motion);
    },
    [commitIndex, setTransient],
  );

  const startClick = useCallback(
    (index: number) => {
      if (interactionRef.current) return;
      if (index === selectedIndex) {
        if (host === "nested") config.onRouteCommit?.(navItems[index]);
        return;
      }
      if (bypass()) {
        setLensSpring("rest");
        commitIndex(index);
        return;
      }
      clearWork();
      setLensSpring("stretch");
      playSweepBetween(
        itemRefs.current[selectedIndex]?.getBoundingClientRect(),
        itemRefs.current[index]?.getBoundingClientRect(),
      );
      setTransient({ phase: "click", targetIndex: index, y: itemY(selectedIndex), visible: true });
      frame.current = requestAnimationFrame(() => {
        const current = interactionRef.current;
        if (!current) return;
        setTransient({ ...current, y: itemY(index) });
        commitAfterFade(index, NAV_DURATION, true);
      });
    },
    [bypass, clearWork, commitAfterFade, commitIndex, config, host, navItems, playSweepBetween, selectedIndex, setTransient],
  );

  const onNavKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (host !== "nested") return;
      const last = navItems.length - 1;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!interactionRef.current) config.onRouteCommit?.(navItems[selectedIndex]);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (interactionRef.current) return;
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? last
            : event.key === "ArrowDown"
              ? selectedIndex === last
                ? 0
                : selectedIndex + 1
              : selectedIndex === 0
                ? last
                : selectedIndex - 1;
      startClick(nextIndex);
    },
    [config, host, navItems, selectedIndex, startClick],
  );

  useEffect(() => {
    if (host !== "nested") return;
    itemRefs.current[activeIndex]?.focus({ preventScroll: true });
  }, [activeIndex, host]);

  const finishDrag = useCallback(
    (pointerId: number, cancelled: boolean, finalY?: number) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId) return;
      dragRef.current = null;
      if (drag.pointerTarget.hasPointerCapture(pointerId)) {
        drag.pointerTarget.releasePointerCapture(pointerId);
      }
      if (cancelled) {
        clearWork();
        setSweep(null);
        setLensSpring("rest");
        setTransient(null);
        return;
      }
      if (!drag.moved) return;
      const bounds = menuRef.current?.getBoundingClientRect();
      const y = bounds
        ? clamp((finalY ?? drag.y + MENU_TOP) - bounds.top - MENU_TOP - drag.grabOffset, 0, itemY(navItems.length - 1))
        : drag.y;
      const target = nearestItem(y, navItems.length);
      playSweepBetween(
        plateRef.current?.getBoundingClientRect(),
        itemRefs.current[target]?.getBoundingClientRect(),
      );
      setLensSpring("stretch");
      setTransient({ phase: "settling", targetIndex: target, y: itemY(target), visible: true });
      commitAfterFade(target, SETTLE_DURATION, target !== selectedIndex);
      const timer = window.setTimeout(() => {
        suppressedClick.current = null;
      }, 450);
      suppressedClick.current = { target: drag.pointerTarget, timer };
    },
    [clearWork, commitAfterFade, navItems.length, playSweepBetween, selectedIndex, setTransient],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0) ||
      interactionRef.current
    ) {
      return;
    }
    if (!bypass()) {
      pressKind.current = index === selectedIndex ? "same" : "other";
      setLensSpring("pressed");
    }
    if (index !== selectedIndex || bypass()) return;
    const bounds = menuRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const origin = itemY(index);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      pointerTarget: event.currentTarget,
      grabOffset: event.clientY - (bounds.top + MENU_TOP + origin),
      originY: origin,
      y: origin,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = menuRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const y = clamp(event.clientY - bounds.top - MENU_TOP - drag.grabOffset, 0, itemY(navItems.length - 1));
    drag.y = y;
    drag.moved ||= Math.abs(y - drag.originY) > DRAG_THRESHOLD;
    if (!drag.moved) return;
    setLensSpring("stretch");
    setTransient({ phase: "dragging", targetIndex: nearestItem(y, navItems.length), y, visible: true });
    event.preventDefault();
  };

  useEffect(() => {
    finishDragRef.current = finishDrag;
  }, [finishDrag]);

  useEffect(() => {
    const settleDragFromWindow = (event: PointerEvent) => {
      finishDragRef.current(event.pointerId, false, event.clientY);
    };
    const cancelDragFromWindow = (event: PointerEvent) => {
      finishDragRef.current(event.pointerId, true);
    };
    window.addEventListener("pointerup", settleDragFromWindow, true);
    window.addEventListener("pointercancel", cancelDragFromWindow, true);
    return () => {
      window.removeEventListener("pointerup", settleDragFromWindow, true);
      window.removeEventListener("pointercancel", cancelDragFromWindow, true);
    };
  }, []);

  useEffect(() => {
    const node = sweepRef.current;
    if (!sweep || !node || !interaction || interaction.phase === "dragging") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const distance = Math.hypot(sweep.dx, sweep.dy);
    if (distance < 1) return;
    const unitX = sweep.dx / distance;
    const unitY = sweep.dy / distance;
    const travel = Math.max(120, distance * 1.35);
    node.getAnimations().forEach((animation) => animation.cancel());
    node.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${-unitX * travel}px, ${-unitY * travel}px, 0) scale(.82)`,
        },
        { opacity: 0.5, offset: 0.45 },
        {
          opacity: 0,
          transform: `translate3d(${unitX * travel}px, ${unitY * travel}px, 0) scale(1.08)`,
        },
      ],
      { duration: 640, easing: "cubic-bezier(.2, .76, .24, 1)" },
    );
  }, [interaction, sweep]);

  useEffect(
    () => () => {
      clearWork();
      const drag = dragRef.current;
      if (drag?.pointerTarget.hasPointerCapture(drag.pointerId)) {
        drag.pointerTarget.releasePointerCapture(drag.pointerId);
      }
      if (suppressedClick.current) window.clearTimeout(suppressedClick.current.timer);
    },
    [clearWork],
  );

  const shellField = useMemo(
    () =>
      enhanced && shellGeometry.ready
        ? createClearPanelLensField(shellGeometry.width, shellGeometry.height, dpr, APPLE_CLEAR_PANEL_OPTICS)
        : "",
    [dpr, enhanced, shellGeometry],
  );
  // Pre-build 74 × (menuWidth-16) before click so the first travel frame has url(#lens).
  const lensField = useMemo(
    () =>
      enhanced && lensGeometry.ready
        ? createClearPanelLensField(lensGeometry.width, lensGeometry.height, dpr, APPLE_SELECTION_LENS_OPTICS)
        : "",
    [dpr, enhanced, lensGeometry],
  );

  const scene = (copy: "visible" | "replica") => {
    if (config.controlledScene) return config.controlledScene({ copy });
    if (variant === "lab") return <HomeScreenScene copy={copy} />;
    return <LiquidMenuBackdrop copy={copy} />;
  };

  const shellWorld = {
    width: shellGeometry.stageWidth,
    height: shellGeometry.stageHeight,
    transform: `translate3d(${shellGeometry.worldX}px, ${shellGeometry.worldY}px, 0)`,
  } as CSSProperties;
  const lensWorld = {
    top: 0,
    left: 0,
    width: lensGeometry.stageWidth,
    height: lensGeometry.stageHeight,
    "--apple-world-x": `${lensGeometry.worldX}px`,
    "--apple-world-y": `${lensGeometry.worldY}px`,
    // Rest origin is baked into worldX/worldY. Travel only subtracts selection-y + nudge.
    transform: `translate3d(${lensGeometry.worldX}px, calc(var(--apple-world-y, 0px) - var(--apple-selection-y, 0px) - var(--apple-travel-y-nudge, 0px)), 0)`,
  } as CSSProperties;
  const shellReplicaStyle = {
    inset: SHELL_OVERSCAN,
    filter: shellField ? `url("#${shellFilterId}")` : "none",
  } as CSSProperties;
  const lensReplicaStyle = {
    inset: LENS_OVERSCAN,
    filter: lensField ? `url("#${lensFilterId}")` : "none",
  } as CSSProperties;

  const itemButtons = navItems.map((item, index) => {
    const button = (
      <button
        ref={(node) => {
          itemRefs.current[index] = node;
        }}
        className="apple-menu-item"
        type="button"
        data-liquid-glass-role="apple-navigation-item"
        data-selected={selectedIndex === index ? "true" : "false"}
        aria-current={selectedIndex === index ? "page" : undefined}
        aria-label={item.label}
        onPointerDown={(event) => onPointerDown(event, index)}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => {
          finishDrag(event.pointerId, false, event.clientY);
          if (pressKind.current === "same" && !interactionRef.current) {
            setLensSpring("rest");
          }
          pressKind.current = null;
        }}
        onPointerCancel={(event) => {
          finishDrag(event.pointerId, true);
          if (!interactionRef.current) setLensSpring("rest");
          pressKind.current = null;
        }}
        onLostPointerCapture={(event) => finishDrag(event.pointerId, true)}
        onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
          if (suppressedClick.current?.target === event.currentTarget && event.detail !== 0) return;
          startClick(index);
        }}
      />
    );
    if (host === "nested") {
      return (
        <div key={item.id} className="apple-menu-radix-item">
          {button}
        </div>
      );
    }
    return (
      <NavigationMenu.Item key={item.id} className="apple-menu-radix-item">
        <NavigationMenu.Link asChild active={selectedIndex === index}>
          {button}
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    );
  });

  const menuNav = (
    <nav
      ref={menuRef}
      className="apple-clear-menu"
      data-liquid-glass-role="apple-clear-panel"
      data-glass-active={interaction ? "true" : "false"}
      data-glass-phase={interaction?.phase ?? "idle"}
      data-lens-spring={lensSpring}
      data-host={host}
      aria-label={config.title ?? "菜单"}
      onKeyDown={onNavKeyDown}
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
                {scene("replica")}
              </span>
            </span>
          </span>
          <span className="apple-clear-shell__fill" />
          <span className="apple-clear-shell__edge" />
        </span>
      </article>

      {interaction ? (
        <>
          <span className="apple-menu-visual apple-menu-visual--above" aria-hidden="true">
            {navItems.map((item, index) => (
              <span key={`above-${item.id}`} className="apple-menu-visual__item" data-selected={index === activeIndex ? "true" : undefined}>
                <span className="apple-menu-visual__label">{item.label}</span>
              </span>
            ))}
          </span>
          <span className="apple-menu-visual apple-menu-visual--below" aria-hidden="true">
            {navItems.map((item, index) => (
              <span key={`below-${item.id}`} className="apple-menu-visual__item" data-selected={index === activeIndex ? "true" : undefined}>
                <span className="apple-menu-visual__label">{item.label}</span>
              </span>
            ))}
          </span>
        </>
      ) : (
        <span className="apple-menu-visual apple-menu-visual--idle" aria-hidden="true">
          {navItems.map((item, index) => (
            <span key={`idle-${item.id}`} className="apple-menu-visual__item" data-selected={index === selectedIndex ? "true" : undefined}>
              <span className="apple-menu-visual__label">{item.label}</span>
            </span>
          ))}
        </span>
      )}

      <span
        ref={plateRef}
        className="apple-selection-plate is-ready"
        data-liquid-glass-role="apple-selection-lens"
        data-phase={interaction?.phase ?? "idle"}
        data-entered={interaction ? (interaction.visible ? "true" : "false") : "true"}
        data-refraction={lensField ? "candidate" : "baseline"}
        aria-hidden="true"
      >
        {lensField ? (
          <svg className="apple-clear-filter" aria-hidden="true">
            <defs>
              <LensFilter
                id={lensFilterId}
                field={lensField}
                width={lensGeometry.width}
                height={lensGeometry.height}
                overscan={LENS_OVERSCAN}
                scale={APPLE_SELECTION_LENS_OPTICS.fieldScaleCssPx}
              />
            </defs>
          </svg>
        ) : null}
        <span className="apple-selection-plate__optical">
          <span className="apple-selection-plate__overscan" data-ready={lensGeometry.ready ? "true" : "false"} style={{ inset: -LENS_OVERSCAN }}>
            <span className="apple-selection-plate__replica" style={lensReplicaStyle}>
              <span className="apple-selection-plate__world" style={lensWorld}>
                {scene("replica")}
              </span>
            </span>
          </span>
          <span className="apple-selection-plate__fill" />
          <span className="apple-selection-plate__edge" />
          <span ref={sweepRef} className="apple-selection-plate__sweep" />
          {interaction ? (
            <span className="apple-menu-visual apple-menu-visual--lens">
              {navItems.map((item) => (
                <span key={`lens-${item.id}`} className="apple-menu-visual__item">
                  <span className="apple-menu-visual__label">{item.label}</span>
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </span>

      {host === "nested" ? (
        <div className="apple-menu-radix-list">{itemButtons}</div>
      ) : (
        <NavigationMenu.List className="apple-menu-radix-list">{itemButtons}</NavigationMenu.List>
      )}
    </nav>
  );

  return (
    <main
      ref={stageRef}
      className="apple-clear"
      style={{
        ...config.brandTokens,
        "--apple-selection-y": `${plateY}px`,
        "--apple-selection-height": `${plateHeight}px`,
        "--apple-travel-y-nudge": `${plateNudge}px`,
      } as CSSProperties}
      data-liquid-glass-mode="apple-liquid-glass"
      data-liquid-glass-role="apple-clear-stage"
      data-variant={variant}
      data-theme={theme}
      data-optics-tier={enhanced && shellField ? "enhanced" : "baseline"}
      data-phase={interaction?.phase ?? "idle"}
    >
      <div className="apple-clear-scene" data-liquid-glass-role="apple-controlled-scene">
        {scene("visible")}
      </div>

      <div className="apple-clear-toolbar" role="toolbar" aria-label="Liquid Glass controls">
        <button type="button" className={theme === "light" ? "is-active" : undefined} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
        <button type="button" className={theme === "dark" ? "is-active" : undefined} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
        <button type="button" className={optics === "enhanced" ? "is-active" : undefined} aria-pressed={optics === "enhanced"} onClick={() => setOptics("enhanced")}>Enhanced</button>
        <button type="button" className={optics === "baseline" ? "is-active" : undefined} aria-pressed={optics === "baseline"} onClick={() => setOptics("baseline")}>Baseline</button>
      </div>

      <div className="apple-clear-cluster">
        <p className="apple-clear-heading">{config.title ?? "菜单"}</p>
        <div className="apple-clear-menu-frame">
        {host === "standalone" ? (
          <NavigationMenu.Root asChild orientation="vertical" delayDuration={0}>
            {menuNav}
          </NavigationMenu.Root>
        ) : (
          menuNav
        )}
        </div>
        <p className="apple-clear-status" aria-live="polite">{selected.label}</p>
      </div>
    </main>
  );
}
