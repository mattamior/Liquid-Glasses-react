"use strict";

const NEUTRAL = 128;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function smoothstep(edge0, edge1, value) {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function roundedRectangleDistance(x, y, halfWidth, halfHeight, radius) {
  const adjustedX = Math.abs(x) - halfWidth + radius;
  const adjustedY = Math.abs(y) - halfHeight + radius;
  return Math.min(Math.max(adjustedX, adjustedY), 0) + Math.hypot(Math.max(adjustedX, 0), Math.max(adjustedY, 0)) - radius;
}

/** Generates a neutral-center RG field; edge vectors point along rounded-rectangle normals. */
function createRoundedEdgeField(options) {
  const { width, height, radius, edgeBand, strength } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is required to create the displacement field.");
  const pixels = context.createImageData(width, height);
  const halfWidth = width / 2 - 1;
  const halfHeight = height / 2 - 1;
  const safeRadius = Math.min(radius, halfWidth, halfHeight);
  const sample = 0.75;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const localX = x - width / 2;
      const localY = y - height / 2;
      const distance = roundedRectangleDistance(localX, localY, halfWidth, halfHeight, safeRadius);
      const gradientX = roundedRectangleDistance(localX + sample, localY, halfWidth, halfHeight, safeRadius) - roundedRectangleDistance(localX - sample, localY, halfWidth, halfHeight, safeRadius);
      const gradientY = roundedRectangleDistance(localX, localY + sample, halfWidth, halfHeight, safeRadius) - roundedRectangleDistance(localX, localY - sample, halfWidth, halfHeight, safeRadius);
      const gradientLength = Math.hypot(gradientX, gradientY) || 1;
      const edgeStrength = distance <= 0 ? 1 - smoothstep(0, edgeBand, -distance) : 0;
      const index = (y * width + x) * 4;
      pixels.data[index] = Math.round(clamp(NEUTRAL + (gradientX / gradientLength) * edgeStrength * strength, 0, 255));
      pixels.data[index + 1] = Math.round(clamp(NEUTRAL + (gradientY / gradientLength) * edgeStrength * strength, 0, 255));
      pixels.data[index + 2] = NEUTRAL;
      pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return { canvas, pixels: pixels.data, width, height };
}

function readFieldPixel(field, x, y) {
  const index = (Math.round(y) * field.width + Math.round(x)) * 4;
  return { red: field.pixels[index], green: field.pixels[index + 1], blue: field.pixels[index + 2] };
}

function assertEdgeField(field) {
  const center = readFieldPixel(field, field.width / 2, field.height / 2);
  const leftEdge = readFieldPixel(field, 1, field.height / 2);
  const topEdge = readFieldPixel(field, field.width / 2, 1);
  const corner = readFieldPixel(field, 22, 22);
  console.assert(center.red === NEUTRAL && center.green === NEUTRAL, "Edge field center must be neutral RG 128", center);
  console.assert(leftEdge.red < NEUTRAL && Math.abs(leftEdge.green - NEUTRAL) <= 2, "Straight left edge must have a negative horizontal displacement", leftEdge);
  console.assert(topEdge.green < NEUTRAL && Math.abs(topEdge.red - NEUTRAL) <= 2, "Straight top edge must have a negative vertical displacement", topEdge);
  console.assert(corner.red < NEUTRAL && corner.green < NEUTRAL, "Rounded corner must carry both normal components", corner);
  return { center, leftEdge, topEdge, corner };
}

function createSceneMarkup() {
  return `<div class="scene__grid"></div><div class="scene__band scene__band--one"></div><div class="scene__band scene__band--two"></div><div class="scene__orb scene__orb--cyan"></div><div class="scene__orb scene__orb--violet"></div><div class="scene__word">REFRACT</div><div class="scene__card"><span>01 / EDGE VECTOR</span><strong>BEND<br>LIGHT</strong></div>`;
}

function mountSharedSceneModel() {
  document.querySelectorAll("[data-scene], [data-scene-replica]").forEach((scene) => { scene.innerHTML = createSceneMarkup(); });
}

function installWorldCoordinateAlignment() {
  const stage = document.querySelector("[data-scene-root]");
  const lens = document.querySelector("[data-lens]");
  const replica = document.querySelector("[data-scene-replica]");
  const overscan = 28; // >= max displacement (18) + blur radius (2), with margin.
  let animationFrame = 0;
  const update = () => {
    animationFrame = 0;
    const stageBounds = stage.getBoundingClientRect();
    const lensBounds = lens.getBoundingClientRect();
    replica.style.width = `${stageBounds.width}px`;
    replica.style.height = `${stageBounds.height}px`;
    replica.style.left = `${stageBounds.left - lensBounds.left - overscan}px`;
    replica.style.top = `${stageBounds.top - lensBounds.top - overscan}px`;
  };
  const schedule = () => { if (!animationFrame) animationFrame = requestAnimationFrame(update); };
  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(stage); resizeObserver.observe(lens);
  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(stage, { attributes: true, attributeFilter: ["class", "style"] });
  mutationObserver.observe(lens, { attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("transitionrun", schedule, true);
  window.addEventListener("transitionend", schedule, true);
  window.addEventListener("animationstart", schedule, true);
  window.addEventListener("animationend", schedule, true);
  schedule();
  return schedule;
}

function setupControls() {
  const body = document.body;
  const theme = document.querySelector('[data-action="theme"]');
  const mode = document.querySelector('[data-action="mode"]');
  const popoverButton = document.querySelector('[data-action="popover"]');
  const popover = document.querySelector("[data-popover]");
  theme.addEventListener("click", () => { const light = body.dataset.theme === "dark"; body.dataset.theme = light ? "light" : "dark"; theme.textContent = light ? "Light theme" : "Dark theme"; theme.setAttribute("aria-pressed", String(!light)); });
  mode.addEventListener("click", () => { const enhanced = body.dataset.mode !== "enhanced"; body.dataset.mode = enhanced ? "enhanced" : "baseline"; mode.textContent = enhanced ? "Enhanced refraction" : "Baseline glass"; mode.setAttribute("aria-pressed", String(enhanced)); });
  popoverButton.addEventListener("click", () => { const open = popover.hidden; popover.hidden = !open; popoverButton.setAttribute("aria-expanded", String(open)); });
}

const field = createRoundedEdgeField({ width: 320, height: 220, radius: 54, edgeBand: 32, strength: 108 });
assertEdgeField(field);
document.querySelector("#edge-field-image").setAttribute("href", field.canvas.toDataURL("image/png"));
mountSharedSceneModel();
window.refreshLiquidGlassOptics = installWorldCoordinateAlignment();
window.liquidGlassEdgeFieldSelfCheck = () => assertEdgeField(field);
setupControls();
