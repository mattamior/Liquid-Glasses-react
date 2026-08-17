export interface ClearPanelOpticsConfig {
  edgeRefractionCssPx: number;
  edgeZoneCssPx: number;
  fieldScaleCssPx: number;
  filterPaddingCssPx: number;
  maximumRasterScale: number;
  maximumZoom: number;
  minimumZoom: number;
  radiusCssPx: number;
}

/** Resting menu shell: whole-surface lensing. Blur must not replace this. */
export const APPLE_CLEAR_PANEL_OPTICS: Readonly<ClearPanelOpticsConfig> = {
  edgeRefractionCssPx: 6.2,
  edgeZoneCssPx: 22,
  fieldScaleCssPx: 56,
  filterPaddingCssPx: 40,
  maximumRasterScale: 2,
  maximumZoom: 1.18,
  minimumZoom: 1.12,
  radiusCssPx: 28,
};

/**
 * Transient selection lens. Milder than V2_CAPSULE_LENS_OPTICS so the
 * plate center stays the wallpaper behind it; bend stays on the rim.
 */
export const APPLE_SELECTION_LENS_OPTICS: Readonly<ClearPanelOpticsConfig> = {
  edgeRefractionCssPx: 4,
  edgeZoneCssPx: 20,
  fieldScaleCssPx: 42,
  filterPaddingCssPx: 40,
  maximumRasterScale: 2,
  maximumZoom: 1.09,
  minimumZoom: 1.05,
  radiusCssPx: 28,
};

const fieldCache = new Map<string, string>();
const MAX_FIELD_CACHE_ENTRIES = 8;

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function calculateRasterScale(
  devicePixelRatio: number,
  config: ClearPanelOpticsConfig = APPLE_CLEAR_PANEL_OPTICS,
) {
  return clamp(Math.ceil(devicePixelRatio || 1), 1, config.maximumRasterScale);
}

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function encodeDisplacement(valueCssPx: number, fieldScaleCssPx: number) {
  return Math.round(clamp(127.5 + (valueCssPx / fieldScaleCssPx) * 255, 0, 255));
}

export interface ClearPanelLensSample {
  blue: number;
  distanceFromEdgeCssPx: number;
  green: number;
  red: number;
  zoom: number;
}

export function sampleClearPanelLensField(
  xCssPx: number,
  yCssPx: number,
  widthCssPx: number,
  heightCssPx: number,
  config: ClearPanelOpticsConfig = APPLE_CLEAR_PANEL_OPTICS,
): ClearPanelLensSample {
  const width = Math.max(2, Math.round(widthCssPx));
  const height = Math.max(2, Math.round(heightCssPx));
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const x = xCssPx - halfWidth;
  const y = yCssPx - halfHeight;
  const radius = Math.min(config.radiusCssPx, halfWidth, halfHeight);
  const edgeX = Math.abs(x) - (halfWidth - radius);
  const edgeY = Math.abs(y) - (halfHeight - radius);
  const outsideX = Math.max(edgeX, 0);
  const outsideY = Math.max(edgeY, 0);
  const signedDistance =
    Math.hypot(outsideX, outsideY) + Math.min(Math.max(edgeX, edgeY), 0) - radius;
  const distanceFromEdge = Math.max(0, -signedDistance);
  const edgeProgress = 1 - smoothstep(0, config.edgeZoneCssPx, distanceFromEdge);
  const steepEdgeProgress = Math.pow(edgeProgress, 2.7);
  const zoom =
    config.minimumZoom + (config.maximumZoom - config.minimumZoom) * steepEdgeProgress;
  const zoomOffsetX = x * (1 / zoom - 1);
  const zoomOffsetY = y * (1 / zoom - 1);
  const rimFade = smoothstep(0, 1.25, distanceFromEdge);
  let normalX = 0;
  let normalY = 0;
  if (outsideX > 0 || outsideY > 0) {
    const cornerX = outsideX * Math.sign(x);
    const cornerY = outsideY * Math.sign(y);
    const length = Math.hypot(cornerX, cornerY) || 1;
    normalX = cornerX / length;
    normalY = cornerY / length;
  } else if (edgeX > edgeY) {
    normalX = Math.sign(x) || 1;
  } else {
    normalY = Math.sign(y) || 1;
  }
  const refraction = rimFade * steepEdgeProgress * config.edgeRefractionCssPx;
  return {
    blue: 128,
    distanceFromEdgeCssPx: distanceFromEdge,
    green: encodeDisplacement(zoomOffsetY + normalY * refraction, config.fieldScaleCssPx),
    red: encodeDisplacement(zoomOffsetX + normalX * refraction, config.fieldScaleCssPx),
    zoom,
  };
}

export function getClearPanelFieldCacheKey(
  widthCssPx: number,
  heightCssPx: number,
  devicePixelRatio: number,
  config: ClearPanelOpticsConfig = APPLE_CLEAR_PANEL_OPTICS,
) {
  return [
    Math.max(2, Math.round(widthCssPx)),
    Math.max(2, Math.round(heightCssPx)),
    config.radiusCssPx,
    config.edgeZoneCssPx,
    config.minimumZoom,
    config.maximumZoom,
    config.edgeRefractionCssPx,
    config.fieldScaleCssPx,
    calculateRasterScale(devicePixelRatio, config),
  ].join(":");
}

export function createClearPanelLensField(
  widthCssPx: number,
  heightCssPx: number,
  devicePixelRatio: number,
  config: ClearPanelOpticsConfig = APPLE_CLEAR_PANEL_OPTICS,
) {
  if (typeof document === "undefined") return "";
  const width = Math.max(2, Math.round(widthCssPx));
  const height = Math.max(2, Math.round(heightCssPx));
  const key = getClearPanelFieldCacheKey(width, height, devicePixelRatio, config);
  const cached = fieldCache.get(key);
  if (cached) {
    fieldCache.delete(key);
    fieldCache.set(key, cached);
    return cached;
  }
  const scale = calculateRasterScale(devicePixelRatio, config);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const sample = sampleClearPanelLensField((x + 0.5) / scale, (y + 0.5) / scale, width, height, config);
      const index = (y * canvas.width + x) * 4;
      pixels.data[index] = sample.red;
      pixels.data[index + 1] = sample.green;
      pixels.data[index + 2] = sample.blue;
      pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  let field = "";
  try {
    field = canvas.toDataURL("image/png");
  } catch {
    field = "";
  }
  if (field) {
    fieldCache.set(key, field);
    if (fieldCache.size > MAX_FIELD_CACHE_ENTRIES) {
      const oldest = fieldCache.keys().next().value;
      if (oldest) fieldCache.delete(oldest);
    }
  }
  return field;
}
