export type LensOpticsMode = "baseline" | "edge";

export interface LensPoint {
  x: number;
  y: number;
}

export interface LensCoordinateSpace {
  worldOrigin: LensPoint;
  worldSize: {
    width: number;
    height: number;
  };
  lensSize: {
    width: number;
    height: number;
  };
  lensCenter: LensPoint;
  opticScale: number;
  opticOffset: LensPoint;
}

export interface LensOpticsConfig {
  fieldScaleCssPx: number;
  maximumResolution: number;
  filterPaddingCssPx: number;
  coreZoom: number;
  coreFalloffStart: number;
  meniscusBandCssPx: number;
  baselineMeniscusRefractionCssPx: number;
  edgeMeniscusMultiplier: number;
  opticScale: number;
}

export const V3_LENS_OPTICS: Readonly<LensOpticsConfig> = {
  fieldScaleCssPx: 26,
  maximumResolution: 2,
  filterPaddingCssPx: 36,
  coreZoom: 0.12,
  coreFalloffStart: 0.7,
  meniscusBandCssPx: 24,
  baselineMeniscusRefractionCssPx: 11,
  edgeMeniscusMultiplier: 1.14,
  opticScale: 1,
};

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function calculateRasterScale(
  devicePixelRatio: number,
  config: LensOpticsConfig = V3_LENS_OPTICS,
) {
  return Math.min(Math.max(1, Math.ceil(devicePixelRatio)), config.maximumResolution);
}

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function encodeDisplacement(valueCssPx: number, fieldScaleCssPx: number) {
  return Math.round(clamp(127.5 + (valueCssPx / fieldScaleCssPx) * 255, 0, 255));
}

export function createLensCoordinateSpace(
  worldOrigin: LensPoint,
  worldSize: LensCoordinateSpace["worldSize"],
  lensSize: LensCoordinateSpace["lensSize"],
  lensCenter: LensPoint,
  config: LensOpticsConfig = V3_LENS_OPTICS,
): LensCoordinateSpace {
  return {
    worldOrigin,
    worldSize,
    lensSize,
    lensCenter,
    opticScale: config.opticScale,
    opticOffset: { x: 0, y: 0 },
  };
}

export function calculateWorldSampleTransform(space: LensCoordinateSpace) {
  return {
    x: space.lensSize.width / 2 - space.lensCenter.x * space.opticScale + space.opticOffset.x,
    y: space.lensSize.height / 2 - space.lensCenter.y * space.opticScale + space.opticOffset.y,
  };
}

export function createEllipticalField(
  widthCssPx: number,
  heightCssPx: number,
  optics: LensOpticsMode,
  devicePixelRatio: number,
  config: LensOpticsConfig = V3_LENS_OPTICS,
) {
  const width = Math.max(1, Math.round(widthCssPx));
  const height = Math.max(1, Math.round(heightCssPx));
  const resolution = calculateRasterScale(devicePixelRatio, config);
  const canvas = document.createElement("canvas");
  canvas.width = width * resolution;
  canvas.height = height * resolution;
  const context = canvas.getContext("2d");
  if (!context) return "";

  const pixels = context.createImageData(canvas.width, canvas.height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const meniscusRefraction = config.baselineMeniscusRefractionCssPx
    * (optics === "edge" ? config.edgeMeniscusMultiplier : 1);

  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const x = (pixelX + 0.5) / resolution - halfWidth;
      const y = (pixelY + 0.5) / resolution - halfHeight;
      const radius = Math.hypot(x / halfWidth, y / halfHeight);
      const edgeDistance = Math.max(0, (1 - radius) * Math.min(halfWidth, halfHeight));
      const meniscus = 1 - smoothstep(0, config.meniscusBandCssPx, edgeDistance);
      const normalGradientX = x / (halfWidth * halfWidth);
      const normalGradientY = y / (halfHeight * halfHeight);
      const normalLength = Math.hypot(normalGradientX, normalGradientY) || 1;
      const normalX = normalGradientX / normalLength;
      const normalY = normalGradientY / normalLength;
      const coreFalloff = 1 - smoothstep(config.coreFalloffStart, 1, radius);
      const offsetX = x * -config.coreZoom * coreFalloff - normalX * meniscus * meniscusRefraction;
      const offsetY = y * -config.coreZoom * coreFalloff - normalY * meniscus * meniscusRefraction;
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = encodeDisplacement(offsetX, config.fieldScaleCssPx);
      pixels.data[index + 1] = encodeDisplacement(offsetY, config.fieldScaleCssPx);
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
