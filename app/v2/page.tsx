"use client";

import {
  type CSSProperties,
  type RefObject,
  memo,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type ThemeMode = "light" | "dark";
type MenuItemId = "home" | "products" | "activity" | "about";
type IconName = MenuItemId | "collapse" | "expand" | "sun" | "moon";
type OpticsTier = "baseline" | "enhanced";

interface MenuItem {
  id: MenuItemId;
  label: string;
  eyebrow: string;
  description: string;
  cards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
}

interface PlatePosition {
  y: number;
  height: number;
  ready: boolean;
}

interface SurfaceGeometry {
  stageWidth: number;
  stageHeight: number;
  width: number;
  height: number;
  ready: boolean;
}

interface SelectionSweep {
  id: number;
  dx: number;
  dy: number;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "home",
    label: "主页",
    eyebrow: "OVERVIEW / 01",
    description: "从一个安静的入口，查看产品、动态与界面状态。",
    cards: [
      { label: "今日访问", value: "2,480", detail: "较昨日 +12.8%" },
      { label: "进行中", value: "18", detail: "6 项等待确认" },
      { label: "完成率", value: "86%", detail: "本周保持稳定" },
    ],
  },
  {
    id: "products",
    label: "产品",
    eyebrow: "PRODUCTS / 02",
    description: "聚合正在设计、验证和交付的产品条目。",
    cards: [
      { label: "全部产品", value: "24", detail: "覆盖 4 个产品线" },
      { label: "正在开发", value: "8", detail: "3 项进入测试" },
      { label: "本月发布", value: "5", detail: "按计划持续交付" },
    ],
  },
  {
    id: "activity",
    label: "动态",
    eyebrow: "ACTIVITY / 03",
    description: "跟踪最近发生的变更、反馈与协作进度。",
    cards: [
      { label: "新动态", value: "32", detail: "过去 24 小时" },
      { label: "待回复", value: "7", detail: "优先处理 2 项" },
      { label: "参与成员", value: "14", detail: "今日保持活跃" },
    ],
  },
  {
    id: "about",
    label: "关于",
    eyebrow: "ABOUT / 04",
    description: "一个研究导航层级、折射与语义动效的 Web 实验。",
    cards: [
      { label: "材料语义", value: "Regular", detail: "功能层优先" },
      { label: "渲染层级", value: "Candidate", detail: "待人工视觉验收" },
      { label: "当前版本", value: "V2", detail: "垂直导航实验" },
    ],
  },
];

const OVERSCAN = 40;
const LENS_FIELD_STRENGTH = 62;
const MENU_ITEM_HEIGHT = 58;
const MENU_ITEM_GAP = 8;
const MENU_TOP_PADDING = 10;
const NAVIGATION_LENS_DURATION = 680;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function createCapsuleLensField(width: number, height: number) {
  const safeWidth = Math.max(2, Math.round(width));
  const safeHeight = Math.max(2, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = safeWidth;
  canvas.height = safeHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return "";
  }

  const imageData = context.createImageData(safeWidth, safeHeight);
  const halfWidth = safeWidth / 2;
  const halfHeight = safeHeight / 2;

  for (let y = 0; y < safeHeight; y += 1) {
    for (let x = 0; x < safeWidth; x += 1) {
      const normalizedX = (x - halfWidth) / halfWidth;
      const normalizedY = (y - halfHeight) / halfHeight;
      const normalizedRadius = Math.hypot(normalizedX, normalizedY);
      const directionLength = normalizedRadius || 1;
      const lensBand =
        smoothstep(0.12, 0.5, normalizedRadius) *
        (1 - smoothstep(0.72, 1, normalizedRadius));
      const edgeFade = 1 - smoothstep(0.9, 1.08, normalizedRadius);
      const displacementStrength =
        lensBand * edgeFade * LENS_FIELD_STRENGTH;
      const index = (y * safeWidth + x) * 4;

      imageData.data[index] = Math.round(
        clamp(
          128 +
            (normalizedX / directionLength) * displacementStrength,
          0,
          255,
        ),
      );
      imageData.data[index + 1] = Math.round(
        clamp(
          128 +
            (normalizedY / directionLength) * displacementStrength,
          0,
          255,
        ),
      );
      imageData.data[index + 2] = 128;
      imageData.data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function makeSvgSafeId(value: string) {
  return `v2-liquid-${Array.from(value, (character) =>
    /[A-Za-z0-9_-]/.test(character)
      ? character
      : `x${character.codePointAt(0)?.toString(16)}x`,
  ).join("")}`;
}

function SelectionLensFilter({
  id,
  displacementField,
  width,
  height,
  theme,
}: {
  id: string;
  displacementField: string;
  width: number;
  height: number;
  theme: ThemeMode;
}) {
  const scale = theme === "dark" ? 16 : 14;

  return (
    <filter
      id={id}
      filterUnits="userSpaceOnUse"
      x={-OVERSCAN}
      y={-OVERSCAN}
      width={width + OVERSCAN * 2}
      height={height + OVERSCAN * 2}
      colorInterpolationFilters="sRGB"
    >
      <feImage
        href={displacementField}
        x="0"
        y="0"
        width={width}
        height={height}
        preserveAspectRatio="none"
        result="edge-field"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="edge-field"
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

function Icon({ name }: { name: IconName }) {
  const sharedProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...sharedProps}>
        <path d="m3.5 10.5 8.5-7 8.5 7" />
        <path d="M5.5 9.5V20h13V9.5" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg {...sharedProps}>
        <path d="m12 2.8 8 4.4v9.6l-8 4.4-8-4.4V7.2Z" />
        <path d="m4.3 7.4 7.7 4.3 7.7-4.3M12 11.7v9.1" />
      </svg>
    );
  }

  if (name === "activity") {
    return (
      <svg {...sharedProps}>
        <path d="M2.5 12h4l2.1-7.2 4.2 14.4 2.4-7.2h6.3" />
      </svg>
    );
  }

  if (name === "about") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10.5v6M12 7.2h.01" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </svg>
    );
  }

  if (name === "moon") {
    return (
      <svg {...sharedProps}>
        <path d="M20 15.3A8.7 8.7 0 0 1 8.7 4a8.7 8.7 0 1 0 11.3 11.3Z" />
      </svg>
    );
  }

  const pointsLeft = name === "collapse";
  return (
    <svg {...sharedProps}>
      <path d={pointsLeft ? "m9 6-5 6 5 6" : "m15 6 5 6-5 6"} />
      <path d={pointsLeft ? "m16 6-5 6 5 6" : "m8 6 5 6-5 6"} />
    </svg>
  );
}

const AmbientScene = memo(function AmbientScene({
  copy,
}: {
  copy: "visible" | "replica";
}) {
  return (
    <div
      className="v2-ambient-scene"
      data-v2-scene={copy}
      aria-hidden="true"
    >
      <span className="v2-ambient-orb v2-ambient-orb--one" />
      <span className="v2-ambient-orb v2-ambient-orb--two" />
      <span className="v2-ambient-orb v2-ambient-orb--three" />
      <span className="v2-ambient-ribbon" />
      <span className="v2-ambient-vignette" />
    </div>
  );
});

const MenuMaterialScene = memo(function MenuMaterialScene({
  copy,
}: {
  copy: "visible" | "replica";
}) {
  return (
    <span
      className="v2-menu-material-scene"
      data-v2-menu-scene={copy}
      aria-hidden="true"
    >
      <span className="v2-menu-material-band" />
      <span className="v2-menu-material-line v2-menu-material-line--one" />
      <span className="v2-menu-material-line v2-menu-material-line--two" />
    </span>
  );
});

const MenuVisualWorld = memo(function MenuVisualWorld({
  className,
  copy,
}: {
  className: string;
  copy: "visible" | "replica";
}) {
  return (
    <span className={className} aria-hidden="true">
      <MenuMaterialScene copy={copy} />
      {MENU_ITEMS.map((item) => (
        <span key={item.id} className="v2-menu-visual-item">
          <span className="v2-menu-visual-item-content">
            <span className="v2-menu-icon">
              <Icon name={item.id} />
            </span>
            <span className="v2-menu-label">{item.label}</span>
          </span>
        </span>
      ))}
    </span>
  );
});

function useSurfaceGeometry(
  stageRef: RefObject<HTMLElement | null>,
  surfaceRef: RefObject<HTMLElement | null>,
  geometryKey: string,
) {
  const [geometry, setGeometry] = useState<SurfaceGeometry>({
    stageWidth: 0,
    stageHeight: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  useEffect(() => {
    let layoutFrame = 0;
    let observer: ResizeObserver | null = null;
    let isObserving = false;
    let transitionSurface: HTMLElement | null = null;
    const updateLayout = () => {
      layoutFrame = 0;
      const stage = stageRef.current;
      const surface = surfaceRef.current;
      if (!stage || !surface) {
        scheduleLayout();
        return;
      }

      if (!isObserving) {
        observer = new ResizeObserver(scheduleLayout);
        observer.observe(stage);
        observer.observe(surface);
        isObserving = true;
      }

      if (transitionSurface !== surface) {
        transitionSurface?.removeEventListener("transitionend", scheduleLayout);
        surface.addEventListener("transitionend", scheduleLayout);
        transitionSurface = surface;
      }

      const stageBounds = stage.getBoundingClientRect();
      const surfaceBounds = surface.getBoundingClientRect();
      const nextGeometry: SurfaceGeometry = {
        stageWidth: stageBounds.width,
        stageHeight: stageBounds.height,
        width: surfaceBounds.width,
        height: surfaceBounds.height,
        ready: surfaceBounds.width > 0 && surfaceBounds.height > 0,
      };
      setGeometry((current) =>
        current.stageWidth === nextGeometry.stageWidth &&
        current.stageHeight === nextGeometry.stageHeight &&
        current.width === nextGeometry.width &&
        current.height === nextGeometry.height &&
        current.ready === nextGeometry.ready
          ? current
          : nextGeometry,
      );
    };
    const scheduleLayout = () => {
      if (!layoutFrame) {
        layoutFrame = requestAnimationFrame(updateLayout);
      }
    };
    window.addEventListener("resize", scheduleLayout);
    scheduleLayout();

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", scheduleLayout);
      transitionSurface?.removeEventListener("transitionend", scheduleLayout);
      if (layoutFrame) cancelAnimationFrame(layoutFrame);
    };
  }, [geometryKey, stageRef, surfaceRef]);

  return geometry;
}

function LiquidSelectionPlate({
  sceneRef,
  plateRef,
  position,
  theme,
  collapsed,
  enhancedOptics,
  sweep,
}: {
  sceneRef: RefObject<HTMLElement | null>;
  plateRef: RefObject<HTMLSpanElement | null>;
  position: PlatePosition;
  theme: ThemeMode;
  collapsed: boolean;
  enhancedOptics: boolean;
  sweep: SelectionSweep | null;
}) {
  const sweepRef = useRef<HTMLSpanElement>(null);
  const instanceId = makeSvgSafeId(useId());
  const filterId = `${instanceId}-filter`;
  const geometry = useSurfaceGeometry(
    sceneRef,
    plateRef,
    `${collapsed}`,
  );
  const shouldRefract = enhancedOptics && sweep !== null;
  const displacementField = useMemo(
    () =>
      geometry.ready && shouldRefract
        ? createCapsuleLensField(geometry.width, geometry.height)
        : "",
    [
      geometry.height,
      geometry.ready,
      geometry.width,
      shouldRefract,
    ],
  );
  const plateStyle = {
    "--v2-selection-y": `${position.y}px`,
    "--v2-selection-height": `${position.height}px`,
  } as CSSProperties;
  const worldStyle = {
    width: `${geometry.stageWidth}px`,
    height: `${geometry.stageHeight}px`,
    "--v2-world-x": "0px",
    "--v2-world-y": `${-(MENU_TOP_PADDING + position.y)}px`,
  } as CSSProperties;
  const filterStyle = {
    inset: `${OVERSCAN}px`,
    filter:
      geometry.ready && displacementField
        ? `url("#${filterId}")`
        : "none",
  } as CSSProperties;

  useEffect(() => {
    const sweepElement = sweepRef.current;
    if (!sweep || !sweepElement) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const distance = Math.hypot(sweep.dx, sweep.dy);
    if (distance < 1) {
      return;
    }
    const unitX = sweep.dx / distance;
    const unitY = sweep.dy / distance;
    const travel = Math.max(120, distance * 1.35);
    const angle = Math.atan2(unitY, unitX) * (180 / Math.PI) + 90;
    const compactViewport = window.matchMedia("(max-width: 680px)").matches;
    if (compactViewport) {
      return;
    }
    sweepElement.style.setProperty("--v2-sweep-angle", `${angle}deg`);
    sweepElement.getAnimations().forEach((animation) => animation.cancel());
    sweepElement.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${-unitX * travel}px, ${-unitY * travel}px, 0) scale(.82)`,
        },
        { opacity: 0.62, offset: 0.45 },
        {
          opacity: 0,
          transform: `translate3d(${unitX * travel}px, ${unitY * travel}px, 0) scale(1.08)`,
        },
      ],
      {
        duration: compactViewport ? 420 : 640,
        easing: "cubic-bezier(.2,.76,.24,1)",
      },
    );
  }, [sweep]);

  return (
    <span
      ref={plateRef}
      className={`v2-selection-plate${position.ready ? " is-ready" : ""}`}
      style={plateStyle}
      data-moving={sweep ? "true" : "false"}
      data-refraction={
        geometry.ready && displacementField ? "candidate" : "baseline"
      }
      aria-hidden="true"
    >
      {geometry.ready && displacementField ? (
        <svg className="v2-filter-definitions" aria-hidden="true">
          <defs>
            <SelectionLensFilter
              id={filterId}
              displacementField={displacementField}
              width={geometry.width}
              height={geometry.height}
              theme={theme}
            />
          </defs>
        </svg>
      ) : null}
      <span className="v2-selection-optical-clip">
        <span
          className="v2-selection-replica-overscan"
          data-ready={geometry.ready ? "true" : "false"}
          style={{ inset: -OVERSCAN }}
        >
          <span className="v2-selection-replica-filter" style={filterStyle}>
            <span
              className="v2-selection-world"
              style={worldStyle}
            >
              <MenuVisualWorld
                className="v2-menu-visual-world v2-menu-visual-world--lens"
                copy="replica"
              />
            </span>
          </span>
        </span>
        <span className="v2-selection-fill" />
        <span className="v2-selection-edge" />
        <span ref={sweepRef} className="v2-selection-sweep" />
      </span>
    </span>
  );
}

export default function V2Page() {
  const stageRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Record<MenuItemId, HTMLButtonElement | null>>({
    home: null,
    products: null,
    activity: null,
    about: null,
  });
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<MenuItemId>("home");
  const [sweep, setSweep] = useState<SelectionSweep | null>(null);
  const [opticsTier, setOpticsTier] = useState<OpticsTier>("baseline");
  const deferredContentItemId = useDeferredValue(selectedItemId);
  const selectedItemIndex = MENU_ITEMS.findIndex(
    (item) => item.id === selectedItemId,
  );
  const platePosition: PlatePosition = {
    y: Math.max(0, selectedItemIndex) * (MENU_ITEM_HEIGHT + MENU_ITEM_GAP),
    height: MENU_ITEM_HEIGHT,
    ready: true,
  };
  const menuStyle = {
    "--v2-selection-y": `${platePosition.y}px`,
    "--v2-selection-height": `${platePosition.height}px`,
  } as CSSProperties;
  const activeItem =
    MENU_ITEMS.find((item) => item.id === deferredContentItemId) ??
    MENU_ITEMS[0];

  useEffect(() => {
    if (!sweep) {
      return;
    }

    const settleTimer = window.setTimeout(
      () => setSweep(null),
      NAVIGATION_LENS_DURATION,
    );

    return () => window.clearTimeout(settleTimer);
  }, [sweep]);

  const selectItem = (itemId: MenuItemId, target: HTMLButtonElement) => {
    if (itemId === selectedItemId) {
      return;
    }

    if (
      window.matchMedia("(max-width: 680px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSelectedItemId(itemId);
      setSweep(null);
      return;
    }

    const plateBounds = plateRef.current?.getBoundingClientRect();
    const previousBounds = itemRefs.current[selectedItemId]?.getBoundingClientRect();
    const origin =
      plateBounds && plateBounds.width > 0 && plateBounds.height > 0
        ? plateBounds
        : previousBounds;
    const targetBounds = target.getBoundingClientRect();
    setSelectedItemId(itemId);

    if (!origin) {
      setSweep(null);
      return;
    }

    setSweep((current) => ({
      id: (current?.id ?? 0) + 1,
      dx:
        targetBounds.left +
        targetBounds.width / 2 -
        (origin.left + origin.width / 2),
      dy:
        targetBounds.top +
        targetBounds.height / 2 -
        (origin.top + origin.height / 2),
    }));
  };

  return (
    <main
      ref={stageRef}
      className="v2-demo"
      data-theme={theme}
      data-sidebar={collapsed ? "collapsed" : "expanded"}
      data-optics-tier={opticsTier}
    >
      <AmbientScene copy="visible" />

      <button
        type="button"
        className="v2-theme-toggle"
        aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
        aria-pressed={theme === "dark"}
        onClick={() =>
          setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light",
          )
        }
      >
        <Icon name={theme === "light" ? "moon" : "sun"} />
        <span>{theme === "light" ? "暗色" : "亮色"}</span>
      </button>

      <div className="v2-optics-toggle" aria-label="液态玻璃渲染方式">
        <button
          type="button"
          aria-pressed={opticsTier === "enhanced"}
          className={
            opticsTier === "enhanced"
              ? "v2-optics-toggle__button is-active"
              : "v2-optics-toggle__button"
          }
          title="启用需要更高性能开销的真实背景折射"
          onClick={() => setOpticsTier("enhanced")}
        >
          增强折射
        </button>
        <button
          type="button"
          aria-pressed={opticsTier === "baseline"}
          className={
            opticsTier === "baseline"
              ? "v2-optics-toggle__button is-active"
              : "v2-optics-toggle__button"
          }
          title="保留可读性与层级，不启用背景位移"
          onClick={() => setOpticsTier("baseline")}
        >
          保底
        </button>
      </div>

      <aside className="v2-sidebar" aria-label="主菜单">
        <div className="v2-sidebar-header">
          <button
            type="button"
            className="v2-collapse-button"
            aria-label={collapsed ? "展开菜单" : "折叠菜单"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((current) => !current)}
          >
            <Icon name={collapsed ? "expand" : "collapse"} />
          </button>
          <span className="v2-sidebar-title" aria-hidden={collapsed}>
            导航
          </span>
        </div>

        <nav
          ref={navRef}
          className="v2-menu"
          style={menuStyle}
          aria-label="页面导航"
        >
          <MenuVisualWorld
            className="v2-menu-visual-world v2-menu-visual-world--base v2-menu-visual-world--above"
            copy="visible"
          />
          <MenuVisualWorld
            className="v2-menu-visual-world v2-menu-visual-world--base v2-menu-visual-world--below"
            copy="visible"
          />
          <LiquidSelectionPlate
            sceneRef={navRef}
            plateRef={plateRef}
            position={platePosition}
            theme={theme}
            collapsed={collapsed}
            enhancedOptics={opticsTier === "enhanced"}
            sweep={sweep}
          />
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[item.id] = element;
              }}
              type="button"
              className="v2-menu-item"
              data-menu-item={item.id}
              aria-current={selectedItemId === item.id ? "page" : undefined}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
              onClick={(event) => selectItem(item.id, event.currentTarget)}
            />
          ))}
        </nav>
      </aside>

      <section className="v2-content-shell" aria-live="polite">
        <div key={activeItem.id} className="v2-content-state">
          <p className="v2-eyebrow">{activeItem.eyebrow}</p>
          <h1>{activeItem.label}</h1>
          <p className="v2-intro">{activeItem.description}</p>
          <div className="v2-card-grid">
            {activeItem.cards.map((card) => (
              <article key={card.label} className="v2-card">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
