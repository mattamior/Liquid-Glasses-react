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

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function calculateRasterScale(
  devicePixelRatio: number,
  config: CapsuleLensOpticsConfig = V2_CAPSULE_LENS_OPTICS,
) {
  return clamp(Math.ceil(devicePixelRatio || 1), 1, config.maximumRasterScale);
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
