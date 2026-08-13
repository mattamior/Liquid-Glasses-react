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

export interface RoundedCardLensOpticsConfig {
  edgeRefractionCssPx: number;
  edgeZoneCssPx: number;
  fieldScaleCssPx: number;
  filterPaddingCssPx: number;
  maximumRasterScale: number;
  maximumZoom: number;
  minimumZoom: number;
  radiusCssPx: number;
}

export const V2_CAPSULE_LENS_OPTICS: Readonly<CapsuleLensOpticsConfig> = {
  edgeRefractionCssPx: 5.4,
  edgeZoneCssPx: 16,
  fieldScaleCssPx: 42,
  filterPaddingCssPx: 40,
  maximumRasterScale: 2,
  maximumZoom: 1.12,
  minimumZoom: 1.03,
  radiusCssPx: 22,
};

/**
 * Card optics intentionally use their own geometry. Navigation's capsule is a
 * separate interaction surface and must retain its established field values.
 */
export const V2_CARD_LENS_OPTICS: Readonly<RoundedCardLensOpticsConfig> = {
  edgeRefractionCssPx: 2.4,
  edgeZoneCssPx: 14,
  fieldScaleCssPx: 36,
  filterPaddingCssPx: 20,
  maximumRasterScale: 2,
  maximumZoom: 1.035,
  minimumZoom: 1,
  radiusCssPx: 24,
};

export const MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES = 8;

const roundedCardFieldCache = new Map<string, string>();

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function calculateRasterScale(
  devicePixelRatio: number,
  config:
    | CapsuleLensOpticsConfig
    | RoundedCardLensOpticsConfig = V2_CAPSULE_LENS_OPTICS,
) {
  return clamp(Math.ceil(devicePixelRatio || 1), 1, config.maximumRasterScale);
}

export function getRoundedCardLensFieldCacheKey(
  widthCssPx: number,
  heightCssPx: number,
  devicePixelRatio: number,
  config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS,
) {
  const width = Math.max(2, Math.round(widthCssPx));
  const height = Math.max(2, Math.round(heightCssPx));
  const rasterScale = calculateRasterScale(devicePixelRatio, config);
  return [
    width,
    height,
    config.radiusCssPx,
    config.edgeZoneCssPx,
    config.minimumZoom,
    config.maximumZoom,
    config.edgeRefractionCssPx,
    config.fieldScaleCssPx,
    rasterScale,
  ].join(":");
}

export function clearRoundedCardLensFieldCache() {
  roundedCardFieldCache.clear();
}

export function getRoundedCardLensFieldCacheSize() {
  return roundedCardFieldCache.size;
}

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function encodeDisplacement(valueCssPx: number, fieldScaleCssPx: number) {
  return Math.round(
    clamp(127.5 + (valueCssPx / fieldScaleCssPx) * 255, 0, 255),
  );
}

export interface RoundedCardLensSample {
  blue: number;
  distanceFromEdgeCssPx: number;
  green: number;
  red: number;
  zoom: number;
}

/**
 * Samples the card's rounded-rectangle field without a canvas. Keeping this
 * geometry pure lets the raster field and its tests share one optical model.
 */
export function sampleRoundedCardLensField(
  xCssPx: number,
  yCssPx: number,
  widthCssPx: number,
  heightCssPx: number,
  config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS,
): RoundedCardLensSample {
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
  const signedDistance = Math.hypot(outsideX, outsideY)
    + Math.min(Math.max(edgeX, edgeY), 0) - radius;
  const distanceFromEdge = Math.max(0, -signedDistance);
  const edgeProgress = 1 - smoothstep(0, config.edgeZoneCssPx, distanceFromEdge);
  const steepEdgeProgress = Math.pow(edgeProgress, 2.7);
  const zoom = config.minimumZoom
    + (config.maximumZoom - config.minimumZoom) * steepEdgeProgress;
  const zoomOffsetX = x * (1 / zoom - 1);
  const zoomOffsetY = y * (1 / zoom - 1);
  const rimFade = smoothstep(0, 1.25, distanceFromEdge);
  const refractionProgress = rimFade * steepEdgeProgress;
  let normalX = 0;
  let normalY = 0;

  if (outsideX > 0 || outsideY > 0) {
    const cornerX = outsideX * Math.sign(x);
    const cornerY = outsideY * Math.sign(y);
    const cornerLength = Math.hypot(cornerX, cornerY) || 1;
    normalX = cornerX / cornerLength;
    normalY = cornerY / cornerLength;
  } else if (edgeX > edgeY) {
    normalX = Math.sign(x) || 1;
  } else {
    normalY = Math.sign(y) || 1;
  }

  const refraction = refractionProgress * config.edgeRefractionCssPx;
  return {
    blue: 128,
    distanceFromEdgeCssPx: distanceFromEdge,
    green: encodeDisplacement(
      zoomOffsetY + normalY * refraction,
      config.fieldScaleCssPx,
    ),
    red: encodeDisplacement(
      zoomOffsetX + normalX * refraction,
      config.fieldScaleCssPx,
    ),
    zoom,
  };
}

export function createCapsuleLensField(
  widthCssPx: number,
  heightCssPx: number,
  devicePixelRatio: number,
  config: CapsuleLensOpticsConfig = V2_CAPSULE_LENS_OPTICS,
) {
  const width = Math.max(2, Math.round(widthCssPx));
  const height = Math.max(2, Math.round(heightCssPx));
  const rasterScale = calculateRasterScale(devicePixelRatio, config);
  const canvas = document.createElement("canvas");
  canvas.width = width * rasterScale;
  canvas.height = height * rasterScale;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";

  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = Math.min(config.radiusCssPx, halfWidth, halfHeight);

  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const x = (pixelX + 0.5) / rasterScale - halfWidth;
      const y = (pixelY + 0.5) / rasterScale - halfHeight;
      const edgeX = Math.abs(x) - (halfWidth - radius);
      const edgeY = Math.abs(y) - (halfHeight - radius);
      const outsideX = Math.max(edgeX, 0);
      const outsideY = Math.max(edgeY, 0);
      const signedDistance = Math.hypot(outsideX, outsideY)
        + Math.min(Math.max(edgeX, edgeY), 0) - radius;
      const distanceFromEdge = Math.max(0, -signedDistance);
      const edgeProgress = 1 - smoothstep(0, config.edgeZoneCssPx, distanceFromEdge);
      const steepEdgeProgress = Math.pow(edgeProgress, 2.7);
      const zoom = config.minimumZoom
        + (config.maximumZoom - config.minimumZoom) * steepEdgeProgress;
      const zoomOffsetX = x * (1 / zoom - 1);
      const zoomOffsetY = y * (1 / zoom - 1);
      const rimFade = smoothstep(0, 1.25, distanceFromEdge);
      const refractionProgress = rimFade * steepEdgeProgress;
      let normalX = 0;
      let normalY = 0;

      if (outsideX > 0 || outsideY > 0) {
        const cornerX = outsideX * Math.sign(x);
        const cornerY = outsideY * Math.sign(y);
        const cornerLength = Math.hypot(cornerX, cornerY) || 1;
        normalX = cornerX / cornerLength;
        normalY = cornerY / cornerLength;
      } else if (edgeX > edgeY) {
        normalX = Math.sign(x) || 1;
      } else {
        normalY = Math.sign(y) || 1;
      }

      const refraction = refractionProgress * config.edgeRefractionCssPx;
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = encodeDisplacement(
        zoomOffsetX + normalX * refraction,
        config.fieldScaleCssPx,
      );
      pixels.data[index + 1] = encodeDisplacement(
        zoomOffsetY + normalY * refraction,
        config.fieldScaleCssPx,
      );
      pixels.data[index + 2] = 128;
      pixels.data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

/**
 * Returns a geometry-specific rounded-rectangle displacement texture. The
 * low-gradient interior stays close to neutral while the signed-distance
 * normal produces continuous refraction near the curved edge.
 */
export function createRoundedCardLensField(
  widthCssPx: number,
  heightCssPx: number,
  devicePixelRatio: number,
  config: RoundedCardLensOpticsConfig = V2_CARD_LENS_OPTICS,
) {
  if (typeof document === "undefined") return "";

  const width = Math.max(2, Math.round(widthCssPx));
  const height = Math.max(2, Math.round(heightCssPx));
  const cacheKey = getRoundedCardLensFieldCacheKey(
    width,
    height,
    devicePixelRatio,
    config,
  );
  const cachedField = roundedCardFieldCache.get(cacheKey);
  if (cachedField) {
    roundedCardFieldCache.delete(cacheKey);
    roundedCardFieldCache.set(cacheKey, cachedField);
    return cachedField;
  }

  const rasterScale = calculateRasterScale(devicePixelRatio, config);
  const canvas = document.createElement("canvas");
  canvas.width = width * rasterScale;
  canvas.height = height * rasterScale;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "";

  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const sample = sampleRoundedCardLensField(
        (pixelX + 0.5) / rasterScale,
        (pixelY + 0.5) / rasterScale,
        width,
        height,
        config,
      );
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = sample.red;
      pixels.data[index + 1] = sample.green;
      pixels.data[index + 2] = sample.blue;
      pixels.data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
  try {
    const field = canvas.toDataURL("image/png");
    roundedCardFieldCache.set(cacheKey, field);
    if (roundedCardFieldCache.size > MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES) {
      const oldestCacheKey = roundedCardFieldCache.keys().next().value;
      if (oldestCacheKey) roundedCardFieldCache.delete(oldestCacheKey);
    }
    return field;
  } catch {
    return "";
  }
}
