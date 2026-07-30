"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface LensSettings {
  refraction: number;
  frost: number;
  elasticity: number;
}

const DEFAULT_SETTINGS: LensSettings = {
  refraction: 52,
  frost: 7,
  elasticity: 72,
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
            scale={refraction}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feGaussianBlur
            in="refracted"
            stdDeviation="0.22"
            result="softened"
          />
          <feColorMatrix
            in="softened"
            type="saturate"
            values="1.28"
          />
        </filter>
      </defs>
    </svg>
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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [displacementMap, setDisplacementMap] = useState("");
  const [lensPosition, setLensPosition] = useState({ x: 64, y: 44 });
  const [isPressed, setIsPressed] = useState(false);
  const [activeMode, setActiveMode] = useState("Lens");

  useEffect(() => {
    setDisplacementMap(createDisplacementMap());
  }, []);

  const stageStyle = useMemo(
    () =>
      ({
        "--lens-x": `${lensPosition.x}%`,
        "--lens-y": `${lensPosition.y}%`,
        "--lens-frost": `${settings.frost}px`,
        "--lens-elasticity": `${160 + settings.elasticity * 3}ms`,
      }) as CSSProperties,
    [lensPosition, settings],
  );

  const updateLensPosition = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    setLensPosition({
      x: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 15, 85),
      y: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 18, 82),
    });
  };

  const updateSetting = (key: keyof LensSettings, value: number) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  return (
    <main>
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
        <a className="nav-status" href="#playground">
          <span />
          LIVE DEMO
        </a>
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
            移动指针，直接观察折射层如何响应背景。
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
          className={`optical-stage ${isPressed ? "is-pressed" : ""}`}
          id="playground"
          ref={stageRef}
          style={stageStyle}
          onPointerMove={updateLensPosition}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsPressed(true);
            updateLensPosition(event);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            setIsPressed(false);
          }}
          onPointerCancel={() => setIsPressed(false)}
          aria-label="可交互液态玻璃实验区，移动指针可改变镜片位置"
        >
          <div className="stage-grid" />
          <div className="color-orb orb-cyan" />
          <div className="color-orb orb-violet" />
          <div className="color-orb orb-coral" />
          <p className="stage-label">DRAG / MOVE</p>

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

          <div className="lens" aria-hidden="true">
            <span className="glass-warp" />
            <span className="lens-shadow" />
            <span className="lens-rim lens-rim-primary" />
            <span className="lens-rim lens-rim-secondary" />
            <span className="lens-glow" />
            <span className="lens-crosshair">+</span>
          </div>

          <div className="mode-switcher glass-shell">
            <span className="glass-warp" />
            <div className="mode-content">
              {["Lens", "Clear", "Frost"].map((mode) => (
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
            参数会直接作用于上方实验区。高折射适合强调边缘，低霜化让背景保持鲜活。
          </p>
        </div>

        <div className="controls glass-shell">
          <span className="glass-warp" />
          <div className="controls-content">
            <RangeControl
              label="REFRACTION"
              value={settings.refraction}
              minimum={12}
              maximum={90}
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
