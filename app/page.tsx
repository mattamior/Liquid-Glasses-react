"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface LensSettings {
  refraction: number;
  frost: number;
  elasticity: number;
}

interface StageSize {
  width: number;
  height: number;
}

interface SurfaceMetrics {
  x: number;
  y: number;
}

interface MenuOffset {
  x: number;
  y: number;
}

interface MenuDragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originOffset: MenuOffset;
  minimumX: number;
  maximumX: number;
  minimumY: number;
  maximumY: number;
  toolbarMetrics: SurfaceMetrics;
  popoverMetrics: SurfaceMetrics;
}

type MenuMotion = "idle" | "opening" | "closing";
type ThemeMode = "dark" | "light";

const DEFAULT_SETTINGS: LensSettings = {
  refraction: 112,
  frost: 2,
  elasticity: 64,
};

const FEATURES = [
  {
    number: "01",
    title: "Refraction",
    detail: "边缘重新采样背景像素，模拟光线穿过曲面。",
  },
  {
    number: "02",
    title: "Adaptivity",
    detail: "高光、阴影与色调随背景和指针位置实时变化。",
  },
  {
    number: "03",
    title: "Fluid motion",
    detail: "形状用弹性曲线响应输入，而非简单缩放。",
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function roundedRectangleDistance(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
) {
  const adjustedX = Math.abs(x) - halfWidth + radius;
  const adjustedY = Math.abs(y) - halfHeight + radius;
  return (
    Math.min(Math.max(adjustedX, adjustedY), 0) +
    Math.hypot(Math.max(adjustedX, 0), Math.max(adjustedY, 0)) -
    radius
  );
}

function createDisplacementMap() {
  const width = 320;
  const height = 200;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const imageData = context.createImageData(width, height);
  const pixels = imageData.data;
  const halfWidth = width / 2 - 2;
  const halfHeight = height / 2 - 2;
  const radius = 78;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const localX = x - width / 2;
      const localY = y - height / 2;
      const distance = roundedRectangleDistance(
        localX,
        localY,
        halfWidth,
        halfHeight,
        radius,
      );

      const sampleOffset = 0.75;
      const gradientX =
        roundedRectangleDistance(
          localX + sampleOffset,
          localY,
          halfWidth,
          halfHeight,
          radius,
        ) -
        roundedRectangleDistance(
          localX - sampleOffset,
          localY,
          halfWidth,
          halfHeight,
          radius,
        );
      const gradientY =
        roundedRectangleDistance(
          localX,
          localY + sampleOffset,
          halfWidth,
          halfHeight,
          radius,
        ) -
        roundedRectangleDistance(
          localX,
          localY - sampleOffset,
          halfWidth,
          halfHeight,
          radius,
        );

      const gradientLength = Math.hypot(gradientX, gradientY) || 1;
      const edgeStrength =
        distance <= 0 ? 1 - smoothstep(0, 34, -distance) : 0;
      const fadeAtBounds =
        smoothstep(0, 3, x) *
        smoothstep(0, 3, y) *
        smoothstep(0, 3, width - 1 - x) *
        smoothstep(0, 3, height - 1 - y);
      const displacement = edgeStrength * fadeAtBounds;
      const pixelIndex = (y * width + x) * 4;

      pixels[pixelIndex] = Math.round(
        128 + (gradientX / gradientLength) * displacement * 126,
      );
      pixels[pixelIndex + 1] = Math.round(
        128 + (gradientY / gradientLength) * displacement * 126,
      );
      pixels[pixelIndex + 2] = 128;
      pixels[pixelIndex + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function GlassFilter({
  displacementMap,
  refraction,
}: {
  displacementMap: string;
  refraction: number;
}) {
  return (
    <svg className="filter-definitions" aria-hidden="true">
      <defs>
        <filter
          id="liquid-lens-filter"
          x="-28%"
          y="-28%"
          width="156%"
          height="156%"
          colorInterpolationFilters="sRGB"
        >
          {displacementMap ? (
            <feImage
              href={displacementMap}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="displacement-map"
            />
          ) : null}
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacement-map"
            scale={refraction * 1.08}
            xChannelSelector="R"
            yChannelSelector="G"
            result="red-source"
          />
          <feColorMatrix
            in="red-source"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red-channel"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacement-map"
            scale={refraction}
            xChannelSelector="R"
            yChannelSelector="G"
            result="green-source"
          />
          <feColorMatrix
            in="green-source"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="green-channel"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacement-map"
            scale={refraction * 0.9}
            xChannelSelector="R"
            yChannelSelector="G"
            result="blue-source"
          />
          <feColorMatrix
            in="blue-source"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blue-channel"
          />
          <feBlend
            in="red-channel"
            in2="green-channel"
            mode="screen"
            result="red-green"
          />
          <feBlend
            in="red-green"
            in2="blue-channel"
            mode="screen"
            result="refracted-rgb"
          />
          <feColorMatrix
            in="refracted-rgb"
            type="saturate"
            values="1.42"
          />
        </filter>
      </defs>
    </svg>
  );
}

function StageArtwork() {
  return (
    <div className="scene-artwork" aria-hidden="true">
      <div className="stage-grid" />
      <div className="spectrum-band spectrum-band-one" />
      <div className="spectrum-band spectrum-band-two" />
      <div className="color-orb orb-cyan" />
      <div className="color-orb orb-violet" />
      <div className="color-orb orb-coral" />
      <div className="backdrop-word">REFRACT</div>

      <div className="poster poster-primary">
        <span>01</span>
        <p>BENDING</p>
        <strong>LIGHT</strong>
        <small>REALTIME OPTICS</small>
      </div>
      <div className="poster poster-secondary">
        <span>FLUID</span>
        <strong>FORM</strong>
      </div>
    </div>
  );
}

function RefractedStageSurface({
  stageSize,
  surfaceMetrics,
}: {
  stageSize: StageSize;
  surfaceMetrics: SurfaceMetrics;
}) {
  const surfaceStyle = {
    "--surface-offset-x": `${-surfaceMetrics.x}px`,
    "--surface-offset-y": `${-surfaceMetrics.y}px`,
    "--surface-stage-width": `${stageSize.width}px`,
    "--surface-stage-height": `${stageSize.height}px`,
  } as CSSProperties;

  return (
    <div className="menu-scene-copy" style={surfaceStyle} aria-hidden="true">
      <StageArtwork />
    </div>
  );
}

function RangeControl({
  label,
  value,
  minimum,
  maximum,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const progress = ((value - minimum) / (maximum - minimum)) * 100;

  return (
    <label className="range-control">
      <span className="range-label">
        <span>{label}</span>
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        value={value}
        style={{ "--range-progress": `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function Home() {
  const stageRef = useRef<HTMLDivElement>(null);
  const menuClusterRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const menuDragSessionRef = useRef<MenuDragSession | null>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [displacementMap, setDisplacementMap] = useState("");
  const [stageSize, setStageSize] = useState<StageSize>({
    width: 760,
    height: 760,
  });
  const [surfaceMetrics, setSurfaceMetrics] = useState({
    toolbar: { x: 440, y: 58 },
    popover: { x: 440, y: 140 },
  });
  const [activeMode, setActiveMode] = useState("Liquid");
  const [activeMenuItem, setActiveMenuItem] = useState("view");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [menuMotion, setMenuMotion] = useState<MenuMotion>("idle");
  const [isMapEnabled, setIsMapEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [menuOffset, setMenuOffset] = useState<MenuOffset>({ x: 0, y: 0 });
  const [isMenuDragging, setIsMenuDragging] = useState(false);

  useEffect(() => {
    setDisplacementMap(createDisplacementMap());
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    if (menuMotion === "idle") {
      return;
    }

    const motionTimer = window.setTimeout(() => setMenuMotion("idle"), 520);
    return () => window.clearTimeout(motionTimer);
  }, [menuMotion]);

  useEffect(() => {
    const stage = stageRef.current;
    const menuCluster = menuClusterRef.current;
    const toolbar = toolbarRef.current;
    const popover = popoverRef.current;
    if (!stage || !menuCluster || !toolbar || !popover) {
      return;
    }

    const updateSurfaceMetrics = () => {
      const stageBounds = stage.getBoundingClientRect();
      const toolbarBounds = toolbar.getBoundingClientRect();
      const popoverBounds = popover.getBoundingClientRect();

      setStageSize({
        width: stageBounds.width,
        height: stageBounds.height,
      });
      setSurfaceMetrics({
        toolbar: {
          x: toolbarBounds.left - stageBounds.left,
          y: toolbarBounds.top - stageBounds.top,
        },
        popover: {
          x: popoverBounds.left - stageBounds.left,
          y: popoverBounds.top - stageBounds.top,
        },
      });
    };

    updateSurfaceMetrics();
    const resizeObserver = new ResizeObserver(updateSurfaceMetrics);
    resizeObserver.observe(stage);
    resizeObserver.observe(menuCluster);
    resizeObserver.observe(toolbar);
    resizeObserver.observe(popover);
    window.addEventListener("resize", updateSurfaceMetrics);
    const settleTimer = window.setTimeout(updateSurfaceMetrics, 500);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", updateSurfaceMetrics);
      resizeObserver.disconnect();
    };
  }, [isMenuOpen]);

  const stageStyle = {
    "--surface-frost": `${
      activeMode === "Clear"
        ? 0
        : activeMode === "Frost"
          ? Math.max(settings.frost, 12)
          : settings.frost
    }px`,
    "--surface-elasticity": `${160 + settings.elasticity * 3}ms`,
  } as CSSProperties;

  const menuStyle = {
    "--menu-drag-x": `${menuOffset.x}px`,
    "--menu-drag-y": `${menuOffset.y}px`,
  } as CSSProperties;

  const updateSetting = (key: keyof LensSettings, value: number) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  const toggleMenu = () => {
    setMenuMotion(isMenuOpen ? "closing" : "opening");
    setIsMenuOpen((currentValue) => !currentValue);
  };

  const startMenuDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      menuMotion !== "idle" ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const eventTarget = event.target;
    if (eventTarget instanceof Element && eventTarget.closest("button")) {
      return;
    }

    const stage = stageRef.current;
    const menuCluster = menuClusterRef.current;
    const popover = popoverRef.current;
    if (!stage || !menuCluster || !popover) {
      return;
    }

    const stageBounds = stage.getBoundingClientRect();
    const clusterBounds = menuCluster.getBoundingClientRect();
    const popoverBounds = popover.getBoundingClientRect();
    const expandedClusterBottom =
      clusterBounds.bottom +
      Math.max(0, popover.scrollHeight - popoverBounds.height);

    menuDragSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originOffset: menuOffset,
      minimumX: menuOffset.x + stageBounds.left - clusterBounds.left,
      maximumX: menuOffset.x + stageBounds.right - clusterBounds.right,
      minimumY: menuOffset.y + stageBounds.top - clusterBounds.top,
      maximumY: menuOffset.y + stageBounds.bottom - expandedClusterBottom,
      toolbarMetrics: surfaceMetrics.toolbar,
      popoverMetrics: surfaceMetrics.popover,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setIsMenuDragging(true);
  };

  const dragMenu = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragSession = menuDragSessionRef.current;
    if (!dragSession || dragSession.pointerId !== event.pointerId) {
      return;
    }

    const nextOffset = {
      x: clamp(
        dragSession.originOffset.x +
          event.clientX -
          dragSession.startClientX,
        dragSession.minimumX,
        dragSession.maximumX,
      ),
      y: clamp(
        dragSession.originOffset.y +
          event.clientY -
          dragSession.startClientY,
        dragSession.minimumY,
        dragSession.maximumY,
      ),
    };
    const offsetDelta = {
      x: nextOffset.x - dragSession.originOffset.x,
      y: nextOffset.y - dragSession.originOffset.y,
    };

    setMenuOffset(nextOffset);
    setSurfaceMetrics({
      toolbar: {
        x: dragSession.toolbarMetrics.x + offsetDelta.x,
        y: dragSession.toolbarMetrics.y + offsetDelta.y,
      },
      popover: {
        x: dragSession.popoverMetrics.x + offsetDelta.x,
        y: dragSession.popoverMetrics.y + offsetDelta.y,
      },
    });
    event.preventDefault();
  };

  const finishMenuDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragSession = menuDragSessionRef.current;
    if (!dragSession || dragSession.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    menuDragSessionRef.current = null;
    setIsMenuDragging(false);
    window.requestAnimationFrame(() =>
      window.dispatchEvent(new Event("resize")),
    );
  };

  return (
    <main className={`demo-shell theme-${themeMode}`}>
      <GlassFilter
        displacementMap={displacementMap}
        refraction={settings.refraction}
      />

      <nav className="site-nav" aria-label="主要导航">
        <a className="brand" href="#top" aria-label="Liquid Lab 首页">
          <span className="brand-mark" />
          <span>LIQUID LAB</span>
        </a>
        <div className="nav-links">
          <a href="#principles">PRINCIPLES</a>
          <a href="#playground">PLAYGROUND</a>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className="theme-toggle"
            aria-label={`切换到${themeMode === "dark" ? "亮色" : "暗色"}模式`}
            aria-pressed={themeMode === "light"}
            onClick={() =>
              setThemeMode((currentMode) =>
                currentMode === "dark" ? "light" : "dark",
              )
            }
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span>{themeMode === "dark" ? "☾" : "☀"}</span>
            </span>
            <span className="theme-toggle-label">
              {themeMode === "dark" ? "DARK" : "LIGHT"}
            </span>
          </button>
          <a className="nav-status" href="#playground">
            <span />
            LIVE DEMO
          </a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">OPTICAL INTERFACE STUDY — 2026</p>
          <h1>
            LIGHT,
            <br />
            <span>IN MOTION.</span>
          </h1>
          <p className="hero-intro">
            一个研究光线如何被界面弯曲、聚焦并赋予触感的交互实验。
            打开菜单并操作选项，观察功能层如何折射环境并随交互流动。
          </p>
          <div className="hero-actions">
            <a className="primary-action glass-shell" href="#playground">
              <span className="glass-warp" />
              <span className="action-content">
                ENTER PLAYGROUND
                <span aria-hidden="true">↘</span>
              </span>
            </a>
            <p>
              BUILT WITH
              <strong>REACT · SVG · CSS</strong>
            </p>
          </div>
        </div>

        <div
          className={`optical-stage mode-${activeMode.toLowerCase()}`}
          id="playground"
          ref={stageRef}
          style={stageStyle}
          aria-label="苹果风格液态玻璃菜单交互实验区"
        >
          <StageArtwork />
          <p className="stage-label">DRAG THE BAR / INTERACT WITH THE MENU</p>

          <div
            className={`apple-menu-cluster ${
              isMenuOpen ? "is-open" : ""
            } motion-${menuMotion} ${isMenuDragging ? "is-dragging" : ""}`}
            ref={menuClusterRef}
            style={menuStyle}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <p className="system-menu-label">PRIMARY MATERIAL / FUNCTION LAYER</p>

            <div
              ref={toolbarRef}
              className="apple-toolbar system-glass"
              onPointerDown={startMenuDrag}
              onPointerMove={dragMenu}
              onPointerUp={finishMenuDrag}
              onPointerCancel={finishMenuDrag}
              onTransitionEnd={() => window.dispatchEvent(new Event("resize"))}
            >
              <RefractedStageSurface
                stageSize={stageSize}
                surfaceMetrics={surfaceMetrics.toolbar}
              />
              <span className="glass-optics" aria-hidden="true" />
              <button type="button" aria-label="返回" className="toolbar-button">
                <span className="toolbar-symbol toolbar-back">‹</span>
              </button>
              <div className="toolbar-title">
                <span>Photos</span>
                <small>8 ITEMS</small>
              </div>
              <button
                type="button"
                aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
                aria-expanded={isMenuOpen}
                className="toolbar-button"
                onClick={toggleMenu}
              >
                <span className="toolbar-symbol toolbar-more">•••</span>
              </button>
            </div>

            <span className="menu-coupling-field" aria-hidden="true">
              <span />
            </span>

            <div
              ref={popoverRef}
              className="apple-popover system-glass"
              aria-hidden={!isMenuOpen}
              onTransitionEnd={() => window.dispatchEvent(new Event("resize"))}
            >
              <RefractedStageSurface
                stageSize={stageSize}
                surfaceMetrics={surfaceMetrics.popover}
              />
              <span className="glass-optics" aria-hidden="true" />
              <div
                className="popover-content"
                data-active-item={activeMenuItem}
              >
                <span className="menu-selection-plate" aria-hidden="true">
                  <span key={activeMenuItem} />
                </span>
                <button
                  type="button"
                  className={activeMenuItem === "view" ? "is-active" : ""}
                  onClick={() => setActiveMenuItem("view")}
                >
                  <span className="item-optic" aria-hidden="true" />
                  <span className="menu-icon">▦</span>
                  <span>View Options</span>
                </button>
                <button
                  type="button"
                  className={activeMenuItem === "select" ? "is-active" : ""}
                  onClick={() => setActiveMenuItem("select")}
                >
                  <span className="item-optic" aria-hidden="true" />
                  <span className="menu-icon">✓</span>
                  <span>Select</span>
                </button>
                <div className="menu-divider" />
                <button
                  type="button"
                  className={`toggle-row ${
                    activeMenuItem === "map" ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setActiveMenuItem("map");
                    setIsMapEnabled((currentValue) => !currentValue);
                  }}
                >
                  <span className="item-optic" aria-hidden="true" />
                  <span className="menu-icon">⌖</span>
                  <span>Show Map</span>
                  <span className={`mini-toggle ${isMapEnabled ? "is-on" : ""}`}>
                    <i />
                  </span>
                </button>
                <button
                  type="button"
                  className={activeMenuItem === "sort" ? "is-active" : ""}
                  onClick={() => setActiveMenuItem("sort")}
                >
                  <span className="item-optic" aria-hidden="true" />
                  <span className="menu-icon">↕</span>
                  <span>Sort By</span>
                  <span className="menu-chevron">›</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mode-switcher glass-shell">
            <span className="glass-warp" />
            <div
              className="mode-content"
              data-active-mode={activeMode}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span className="mode-selection-plate" aria-hidden="true">
                <span key={activeMode} />
              </span>
              {["Liquid", "Clear", "Frost"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={activeMode === mode ? "is-active" : ""}
                  onClick={() => setActiveMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="principles" id="principles">
        <div className="section-heading">
          <p className="eyebrow">THREE MATERIAL BEHAVIORS</p>
          <h2>不是模糊，是一个会响应环境的光学层。</h2>
        </div>
        <div className="feature-list">
          {FEATURES.map((feature) => (
            <article key={feature.number}>
              <span>{feature.number}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </div>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="control-deck">
        <div>
          <p className="eyebrow">MATERIAL CONTROLS</p>
          <h2>调校镜片</h2>
          <p>
            参数会直接作用于上方菜单。高折射强调菜单边缘，弹性决定展开和按压时的流动感。
          </p>
        </div>

        <div className="controls glass-shell">
          <span className="glass-warp" />
          <div className="controls-content">
            <RangeControl
              label="REFRACTION"
              value={settings.refraction}
              minimum={40}
              maximum={180}
              unit=""
              onChange={(value) => updateSetting("refraction", value)}
            />
            <RangeControl
              label="FROST"
              value={settings.frost}
              minimum={0}
              maximum={20}
              unit="px"
              onChange={(value) => updateSetting("frost", value)}
            />
            <RangeControl
              label="ELASTICITY"
              value={settings.elasticity}
              minimum={0}
              maximum={100}
              unit="%"
              onChange={(value) => updateSetting("elasticity", value)}
            />
            <button
              className="reset-button"
              type="button"
              onClick={() => setSettings(DEFAULT_SETTINGS)}
            >
              RESET MATERIAL
            </button>
          </div>
        </div>
      </section>

      <footer>
        <p>LIQUID LAB / INTERACTIVE MATERIAL STUDY</p>
        <p>MOVE · PRESS · REFRACT</p>
      </footer>
    </main>
  );
}
