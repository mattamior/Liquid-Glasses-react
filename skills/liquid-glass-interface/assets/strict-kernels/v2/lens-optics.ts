export interface CapsuleLensOpticsConfig {
  edgeRefractionCssPx: number;
  edgeZoneCssPx: number;
  fieldScaleCssPx: number;
  filterPaddingCssPx: number;
  maximumRasterScale: number;
  maximumZoom: number;
  minimumZoom: number;
  radiusCssPx: number;
}

export type RoundedCardLensOpticsConfig = CapsuleLensOpticsConfig;

export const V2_CAPSULE_LENS_OPTICS: Readonly<CapsuleLensOpticsConfig> = {
  edgeRefractionCssPx: 5.4, edgeZoneCssPx: 16, fieldScaleCssPx: 42,
  filterPaddingCssPx: 40, maximumRasterScale: 2, maximumZoom: 1.12,
  minimumZoom: 1.03, radiusCssPx: 22,
};

/** Cards deliberately use an independent rounded-rectangle optical field. */
export const V2_CARD_LENS_OPTICS: Readonly<RoundedCardLensOpticsConfig> = {
  edgeRefractionCssPx: 2.4, edgeZoneCssPx: 14, fieldScaleCssPx: 36,
  filterPaddingCssPx: 20, maximumRasterScale: 2, maximumZoom: 1.035,
  minimumZoom: 1, radiusCssPx: 24,
};

export const MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES = 8;
const roundedCardFieldCache = new Map<string, string>();

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function calculateRasterScale(devicePixelRatio: number, config: CapsuleLensOpticsConfig = V2_CAPSULE_LENS_OPTICS) {
  return clamp(Math.ceil(devicePixelRatio || 1), 1, config.maximumRasterScale);
}

export function getRoundedCardLensFieldCacheKey(widthCssPx: number, heightCssPx: number, devicePixelRatio: number, config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS) {
  return [Math.max(2, Math.round(widthCssPx)), Math.max(2, Math.round(heightCssPx)), config.radiusCssPx, config.edgeZoneCssPx, config.minimumZoom, config.maximumZoom, config.edgeRefractionCssPx, config.fieldScaleCssPx, calculateRasterScale(devicePixelRatio, config)].join(":");
}

export function clearRoundedCardLensFieldCache() { roundedCardFieldCache.clear(); }
export function getRoundedCardLensFieldCacheSize() { return roundedCardFieldCache.size; }

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}
function encodeDisplacement(valueCssPx: number, fieldScaleCssPx: number) {
  return Math.round(clamp(127.5 + (valueCssPx / fieldScaleCssPx) * 255, 0, 255));
}

export interface RoundedCardLensSample { blue: number; distanceFromEdgeCssPx: number; green: number; red: number; zoom: number; }

/** Pure signed-distance rounded-rectangle field shared by rasterisation and tests. */
export function sampleRoundedCardLensField(xCssPx: number, yCssPx: number, widthCssPx: number, heightCssPx: number, config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS): RoundedCardLensSample {
  const width = Math.max(2, Math.round(widthCssPx)); const height = Math.max(2, Math.round(heightCssPx));
  const halfWidth = width / 2; const halfHeight = height / 2; const x = xCssPx - halfWidth; const y = yCssPx - halfHeight;
  const radius = Math.min(config.radiusCssPx, halfWidth, halfHeight);
  const edgeX = Math.abs(x) - (halfWidth - radius); const edgeY = Math.abs(y) - (halfHeight - radius);
  const outsideX = Math.max(edgeX, 0); const outsideY = Math.max(edgeY, 0);
  const signedDistance = Math.hypot(outsideX, outsideY) + Math.min(Math.max(edgeX, edgeY), 0) - radius;
  const distanceFromEdge = Math.max(0, -signedDistance); const edgeProgress = 1 - smoothstep(0, config.edgeZoneCssPx, distanceFromEdge);
  const steepEdgeProgress = Math.pow(edgeProgress, 2.7); const zoom = config.minimumZoom + (config.maximumZoom - config.minimumZoom) * steepEdgeProgress;
  const zoomOffsetX = x * (1 / zoom - 1); const zoomOffsetY = y * (1 / zoom - 1); const rimFade = smoothstep(0, 1.25, distanceFromEdge);
  let normalX = 0; let normalY = 0;
  if (outsideX > 0 || outsideY > 0) { const cornerX = outsideX * Math.sign(x); const cornerY = outsideY * Math.sign(y); const length = Math.hypot(cornerX, cornerY) || 1; normalX = cornerX / length; normalY = cornerY / length; }
  else if (edgeX > edgeY) normalX = Math.sign(x) || 1; else normalY = Math.sign(y) || 1;
  const refraction = rimFade * steepEdgeProgress * config.edgeRefractionCssPx;
  return { blue: 128, distanceFromEdgeCssPx: distanceFromEdge, green: encodeDisplacement(zoomOffsetY + normalY * refraction, config.fieldScaleCssPx), red: encodeDisplacement(zoomOffsetX + normalX * refraction, config.fieldScaleCssPx), zoom };
}

function toRaster(width: number, height: number, scale: number, sample: (x: number, y: number) => RoundedCardLensSample) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas"); canvas.width = width * scale; canvas.height = height * scale;
  const context = canvas.getContext("2d", { willReadFrequently: true }); if (!context) return "";
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
    const color = sample((x + .5) / scale, (y + .5) / scale); const index = (y * canvas.width + x) * 4;
    pixels.data[index] = color.red; pixels.data[index + 1] = color.green; pixels.data[index + 2] = color.blue; pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0); try { return canvas.toDataURL("image/png"); } catch { return ""; }
}

export function createCapsuleLensField(widthCssPx: number, heightCssPx: number, devicePixelRatio: number, config: CapsuleLensOpticsConfig = V2_CAPSULE_LENS_OPTICS) {
  const width = Math.max(2, Math.round(widthCssPx)); const height = Math.max(2, Math.round(heightCssPx)); const scale = calculateRasterScale(devicePixelRatio, config);
  return toRaster(width, height, scale, (x, y) => sampleRoundedCardLensField(x, y, width, height, config));
}

export function createRoundedCardLensField(widthCssPx: number, heightCssPx: number, devicePixelRatio: number, config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS) {
  const width = Math.max(2, Math.round(widthCssPx)); const height = Math.max(2, Math.round(heightCssPx)); const key = getRoundedCardLensFieldCacheKey(width, height, devicePixelRatio, config); const cached = roundedCardFieldCache.get(key);
  if (cached) { roundedCardFieldCache.delete(key); roundedCardFieldCache.set(key, cached); return cached; }
  const field = toRaster(width, height, calculateRasterScale(devicePixelRatio, config), (x, y) => sampleRoundedCardLensField(x, y, width, height, config));
  if (field) { roundedCardFieldCache.set(key, field); if (roundedCardFieldCache.size > MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES) { const oldest = roundedCardFieldCache.keys().next().value; if (oldest) roundedCardFieldCache.delete(oldest); } }
  return field;
}
