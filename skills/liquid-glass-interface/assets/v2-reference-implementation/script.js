"use strict";

const MENU_ITEMS = [
  { id: "overview", icon: "⌂", label: "Overview", eyebrow: "OVERVIEW / 01", copy: "Committed state stays flat. The lens exists only while the navigation is moving." },
  { id: "products", icon: "◇", label: "Products", eyebrow: "PRODUCTS / 02", copy: "The scene replica remains one continuous sample, with no core or edge copy to seam together." },
  { id: "activity", icon: "⌁", label: "Activity", eyebrow: "ACTIVITY / 03", copy: "Pointer release uses its final position, then snaps to the nearest menu row before fading." },
  { id: "about", icon: "i", label: "About", eyebrow: "ABOUT / 04", copy: "Enhanced optics are optional. Every compact, touch, reduced-motion, and forced-color path remains direct." },
];

const LENS = { zoomMinimum: 1.03, zoomMaximum: 1.12, edgeZone: 16, edgeRefraction: 5.4, fieldScale: 42, resolution: 2, overscan: 40, itemHeight: 58, itemGap: 8, topPadding: 10, clickDuration: 680, settleDuration: 260, fadeDuration: 160, dragThreshold: 5 };
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
const smoothstep = (edge0, edge1, value) => { const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1); return normalized * normalized * (3 - 2 * normalized); };
const menu = document.querySelector("[data-menu]");
const plate = document.querySelector(".glass-plate");
const fieldImage = document.querySelector("#v2-lens-field");
const lensFilter = document.querySelector("#v2-reference-lens");
const lensWorld = document.querySelector(".menu-world--lens");
const title = document.querySelector("[data-content-title]");
const eyebrow = document.querySelector("[data-content-eyebrow]");
const copy = document.querySelector("[data-content-copy]");
const buttons = [...document.querySelectorAll("[data-menu-item]")];
let selectedId = "overview";
let interaction = null;
let dragSession = null;
let motionTimer = null;
let fadeTimer = null;
let motionFrame = null;

function menuItemMarkup(item, selected) {
  return `<span class="menu-visual-item" data-menu-visual-item="${item.id}" data-selected="${selected}"><span class="menu-visual-icon">${item.icon}</span><span>${item.label}</span></span>`;
}

function renderWorlds() {
  document.querySelectorAll("[data-menu-world]").forEach((world) => {
    world.innerHTML = MENU_ITEMS.map((item) => menuItemMarkup(item, item.id === selectedId)).join("");
  });
}

function getItemY(itemId) { return MENU_ITEMS.findIndex((item) => item.id === itemId) * (LENS.itemHeight + LENS.itemGap); }
function getNearestItemId(y) { return MENU_ITEMS.reduce((closest, item) => Math.abs(getItemY(item.id) - y) < Math.abs(getItemY(closest) - y) ? item.id : closest, MENU_ITEMS[0].id); }
function getItem(id) { return MENU_ITEMS.find((item) => item.id === id); }

function updateCommittedState(nextId) {
  selectedId = nextId;
  buttons.forEach((button) => {
    const selected = button.dataset.menuItem === selectedId;
    button.toggleAttribute("aria-current", selected);
  });
  const item = getItem(selectedId);
  title.textContent = item.label;
  eyebrow.textContent = item.eyebrow;
  copy.textContent = item.copy;
  renderWorlds();
}

function encodeDisplacement(value) { return Math.round(clamp(127.5 + (value / LENS.fieldScale) * 255, 0, 255)); }

function createCapsuleLensField(width, height) {
  const safeWidth = Math.max(2, Math.round(width));
  const safeHeight = Math.max(2, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = safeWidth * LENS.resolution;
  canvas.height = safeHeight * LENS.resolution;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = safeWidth / 2;
  const halfHeight = safeHeight / 2;
  const radius = Math.min(22, halfWidth, halfHeight);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const relativeX = (x + .5) / LENS.resolution - halfWidth;
      const relativeY = (y + .5) / LENS.resolution - halfHeight;
      const edgeX = Math.abs(relativeX) - (halfWidth - radius);
      const edgeY = Math.abs(relativeY) - (halfHeight - radius);
      const outsideX = Math.max(edgeX, 0);
      const outsideY = Math.max(edgeY, 0);
      const signedDistance = Math.hypot(outsideX, outsideY) + Math.min(Math.max(edgeX, edgeY), 0) - radius;
      const distanceFromEdge = Math.max(0, -signedDistance);
      const edgeProgress = 1 - smoothstep(0, LENS.edgeZone, distanceFromEdge);
      const steepEdgeProgress = Math.pow(edgeProgress, 2.7);
      const zoom = LENS.zoomMinimum + (LENS.zoomMaximum - LENS.zoomMinimum) * steepEdgeProgress;
      const zoomOffsetX = relativeX * (1 / zoom - 1);
      const zoomOffsetY = relativeY * (1 / zoom - 1);
      const rimFade = smoothstep(0, 1.25, distanceFromEdge);
      const refractionProgress = rimFade * steepEdgeProgress;
      let normalX = 0; let normalY = 0;
      if (outsideX > 0 || outsideY > 0) {
        const cornerX = outsideX * Math.sign(relativeX); const cornerY = outsideY * Math.sign(relativeY); const length = Math.hypot(cornerX, cornerY) || 1;
        normalX = cornerX / length; normalY = cornerY / length;
      } else if (edgeX > edgeY) normalX = Math.sign(relativeX) || 1;
      else normalY = Math.sign(relativeY) || 1;
      const refractionStrength = refractionProgress * LENS.edgeRefraction;
      const index = (y * canvas.width + x) * 4;
      pixels.data[index] = encodeDisplacement(zoomOffsetX + normalX * refractionStrength);
      pixels.data[index + 1] = encodeDisplacement(zoomOffsetY + normalY * refractionStrength);
      pixels.data[index + 2] = 128; pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}

function updateLensGeometry() {
  const bounds = menu.getBoundingClientRect();
  const field = createCapsuleLensField(bounds.width, LENS.itemHeight);
  if (!field) return;
  fieldImage.setAttribute("href", field);
  fieldImage.setAttribute("width", `${bounds.width}`);
  fieldImage.setAttribute("height", `${LENS.itemHeight}`);
  lensFilter.setAttribute("x", `${-LENS.overscan}`);
  lensFilter.setAttribute("y", `${-LENS.overscan}`);
  lensFilter.setAttribute("width", `${bounds.width + LENS.overscan * 2}`);
  lensFilter.setAttribute("height", `${LENS.itemHeight + LENS.overscan * 2}`);
  lensWorld.style.setProperty("--menu-width", `${bounds.width}px`);
  lensWorld.style.setProperty("--menu-height", `${bounds.height}px`);
}

function setPlatePosition(y) {
  plate.style.setProperty("--plate-y", `${y}px`);
  lensWorld.style.setProperty("--lens-world-y", `${-y}px`);
}

function clearPendingWork() {
  if (motionTimer !== null) window.clearTimeout(motionTimer);
  if (fadeTimer !== null) window.clearTimeout(fadeTimer);
  if (motionFrame !== null) window.cancelAnimationFrame(motionFrame);
  motionTimer = null; fadeTimer = null; motionFrame = null;
}

function setInteraction(nextInteraction) {
  interaction = nextInteraction;
  menu.dataset.glassActive = nextInteraction ? "true" : "false";
  menu.dataset.glassPhase = nextInteraction?.phase ?? "idle";
  if (!nextInteraction) return;
  plate.dataset.glassPhase = nextInteraction.phase;
  setPlatePosition(nextInteraction.y);
}

function teardownGlass(shouldCommit, targetId) {
  if (shouldCommit) updateCommittedState(targetId);
  plate.dataset.entered = "false";
  setInteraction(null);
  clearPendingWork();
}

function finishGlassInteraction(targetId, targetY, duration, shouldCommit) {
  clearPendingWork();
  motionTimer = window.setTimeout(() => {
    if (!interaction) return;
    setInteraction({ ...interaction, phase: "fading", targetId, y: targetY });
    fadeTimer = window.setTimeout(() => teardownGlass(shouldCommit, targetId), LENS.fadeDuration);
  }, duration);
}

function showGlass(phase, targetId, y) {
  clearPendingWork();
  setInteraction({ phase, targetId, y });
  plate.dataset.entered = "false";
  motionFrame = window.requestAnimationFrame(() => { if (interaction && interaction.phase !== "fading") plate.dataset.entered = "true"; });
}

function shouldBypassGlass() { return window.matchMedia("(max-width: 680px), (prefers-reduced-motion: reduce), (forced-colors: active)").matches; }

function startClickInteraction(targetId) {
  if (targetId === selectedId || interaction) return;
  if (shouldBypassGlass()) { updateCommittedState(targetId); return; }
  const originY = getItemY(selectedId);
  const targetY = getItemY(targetId);
  showGlass("click", targetId, originY);
  motionFrame = window.requestAnimationFrame(() => {
    if (!interaction || interaction.phase !== "click") return;
    plate.dataset.entered = "true";
    motionFrame = window.requestAnimationFrame(() => {
      if (!interaction || interaction.phase !== "click") return;
      setInteraction({ ...interaction, y: targetY });
      finishGlassInteraction(targetId, targetY, LENS.clickDuration, true);
    });
  });
}

function updateDragPosition(session, clientY) {
  const bounds = menu.getBoundingClientRect();
  const maximumY = getItemY(MENU_ITEMS.at(-1).id);
  const y = clamp(clientY - bounds.top - LENS.topPadding - session.grabOffset, 0, maximumY);
  session.y = y;
  session.moved = session.moved || Math.abs(y - session.originY) > LENS.dragThreshold;
  return y;
}

function startDrag(event) {
  const id = event.currentTarget.dataset.menuItem;
  if (event.pointerType !== "mouse" || !event.isPrimary || id !== selectedId || interaction || shouldBypassGlass()) return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  dragSession = { pointerId: event.pointerId, originY: getItemY(id), y: getItemY(id), grabOffset: event.clientY - bounds.top, moved: false };
  showGlass("dragging", id, dragSession.y);
}

function continueDrag(event) {
  if (!dragSession || dragSession.pointerId !== event.pointerId) return;
  event.preventDefault();
  const y = updateDragPosition(dragSession, event.clientY);
  setInteraction({ phase: "dragging", targetId: getNearestItemId(y), y });
}

function finishDrag(pointerId, wasCancelled, finalClientY, target) {
  if (!dragSession || dragSession.pointerId !== pointerId) return;
  if (!wasCancelled && finalClientY !== undefined) updateDragPosition(dragSession, finalClientY);
  const session = dragSession;
  dragSession = null;
  if (target?.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
  const targetId = wasCancelled || !session.moved ? selectedId : getNearestItemId(session.y);
  const targetY = getItemY(targetId);
  setInteraction({ phase: "settling", targetId, y: targetY });
  finishGlassInteraction(targetId, targetY, LENS.settleDuration, !wasCancelled && targetId !== selectedId);
}

buttons.forEach((button) => {
  button.addEventListener("pointerdown", startDrag);
  button.addEventListener("pointermove", continueDrag);
  button.addEventListener("pointerup", (event) => finishDrag(event.pointerId, false, event.clientY, event.currentTarget));
  button.addEventListener("pointercancel", (event) => finishDrag(event.pointerId, true, undefined, event.currentTarget));
  button.addEventListener("lostpointercapture", (event) => finishDrag(event.pointerId, true));
  button.addEventListener("click", () => startClickInteraction(button.dataset.menuItem));
});
window.addEventListener("pointerup", (event) => finishDrag(event.pointerId, false, event.clientY), true);
window.addEventListener("pointercancel", (event) => finishDrag(event.pointerId, true), true);
new ResizeObserver(updateLensGeometry).observe(menu);
window.addEventListener("resize", updateLensGeometry);
document.querySelector("[data-action='mode']").addEventListener("click", (event) => { const enhanced = document.body.dataset.mode !== "enhanced"; document.body.dataset.mode = enhanced ? "enhanced" : "baseline"; event.currentTarget.setAttribute("aria-pressed", String(enhanced)); event.currentTarget.textContent = enhanced ? "Baseline glass" : "Enhanced refraction"; });
document.querySelector("[data-action='theme']").addEventListener("click", (event) => { const dark = document.body.dataset.theme !== "dark"; document.body.dataset.theme = dark ? "dark" : "light"; event.currentTarget.setAttribute("aria-pressed", String(dark)); event.currentTarget.textContent = dark ? "Light theme" : "Dark theme"; });

renderWorlds();
updateCommittedState(selectedId);
updateLensGeometry();
window.v2NavigationLensReference = { createCapsuleLensField, updateLensGeometry };
