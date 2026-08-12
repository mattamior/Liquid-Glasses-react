export type LensOpticsMode = "baseline" | "edge";
export type LensHorizontalDirection = "none" | "left" | "right";
export type LensVelocityTier = 0 | 1 | 2 | 3;

export interface LensPoint {
  x: number;
  y: number;
}

export interface LensFieldState {
  horizontalDirection: LensHorizontalDirection;
  velocityTier: LensVelocityTier;
}

export interface LensFieldStateSchedulerClock {
  now: () => number;
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (timer: number) => void;
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
  tangentialRefractionCssPx: number;
  directionalRefractionCssPx: number;
  edgeDirectionalBoostCssPx: number;
  rimMotionMultiplier: number;
  edgeMotionMultiplier: number;
  fieldCacheCapacity: number;
  opticScale: 1;
}

export const V3_LENS_OPTICS: Readonly<LensOpticsConfig> = {
  fieldScaleCssPx: 64,
  maximumResolution: 2,
  filterPaddingCssPx: 36,
  coreZoom: 0.12,
  coreFalloffStart: 0.7,
  meniscusBandCssPx: 36,
  baselineMeniscusRefractionCssPx: 10.05,
  edgeMeniscusMultiplier: 1.14,
  tangentialRefractionCssPx: 3.5,
  directionalRefractionCssPx: 2.5,
  edgeDirectionalBoostCssPx: 2,
  rimMotionMultiplier: 0.22,
  edgeMotionMultiplier: 3.2,
  fieldCacheCapacity: 16,
  opticScale: 1,
};

export const STATIC_LENS_FIELD_STATE: Readonly<LensFieldState> = {
  horizontalDirection: "none",
  velocityTier: 0,
};

const DYNAMIC_FIELD_PROFILE_CAPACITY = 14;

interface CachedLensField {
  dataUrl: string;
  isStatic: boolean;
}

const fieldCache = new Map<string, CachedLensField>();

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
  // SVG samples SourceGraphic at output + displacement, so negative core values sample inward.
  return Math.round(clamp(127.5 + (valueCssPx / fieldScaleCssPx) * 255, 0, 255));
}

function getMotionStrength(velocityTier: LensVelocityTier) {
  return [0, 0.34, 0.67, 1][velocityTier];
}

function getDirectionX(direction: LensHorizontalDirection) {
  if (direction === "left") return -1;
  if (direction === "right") return 1;
  return 0;
}

function isStaticFieldState(state: LensFieldState) {
  return state.horizontalDirection === "none" || state.velocityTier === 0;
}

export function canonicalizeLensFieldState(state: LensFieldState): LensFieldState {
  if (state.horizontalDirection === "none" || state.velocityTier === 0) {
    return STATIC_LENS_FIELD_STATE;
  }
  return state;
}

export function lensFieldStatesEqual(left: LensFieldState, right: LensFieldState) {
  const canonicalLeft = canonicalizeLensFieldState(left);
  const canonicalRight = canonicalizeLensFieldState(right);
  return canonicalLeft.horizontalDirection === canonicalRight.horizontalDirection
    && canonicalLeft.velocityTier === canonicalRight.velocityTier;
}

export function quantizeHorizontalDirection(deltaX: number): LensHorizontalDirection {
  if (Math.abs(deltaX) < 0.5) return "none";
  return deltaX < 0 ? "left" : "right";
}

export function quantizeVelocityTier(pixelsPerMillisecond: number): LensVelocityTier {
  if (pixelsPerMillisecond < 0.15) return 0;
  if (pixelsPerMillisecond < 0.6) return 1;
  if (pixelsPerMillisecond < 1.2) return 2;
  return 3;
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

export function calculateLensFieldDisplacement(
  pointCssPx: LensPoint,
  lensSizeCssPx: LensCoordinateSpace["lensSize"],
  optics: LensOpticsMode,
  state: LensFieldState = STATIC_LENS_FIELD_STATE,
  config: LensOpticsConfig = V3_LENS_OPTICS,
): LensPoint {
  const canonicalState = canonicalizeLensFieldState(state);
  const halfWidth = Math.max(0.5, lensSizeCssPx.width / 2);
  const halfHeight = Math.max(0.5, lensSizeCssPx.height / 2);
  const radius = Math.hypot(pointCssPx.x / halfWidth, pointCssPx.y / halfHeight);
  const edgeDistance = Math.max(0, (1 - radius) * Math.min(halfWidth, halfHeight));
  const rimWeight = 1 - smoothstep(0, config.meniscusBandCssPx, edgeDistance);
  const midMotionWeight = smoothstep(0.45, 0.58, radius) * (1 - smoothstep(0.92, 1, radius));
  const normalizedMidMotionWeight = midMotionWeight * 0.28;
  const edgeMotionWeight = Math.max(rimWeight, normalizedMidMotionWeight);
  const coreWeight = 1 - smoothstep(config.coreFalloffStart, 1, radius);
  const normalGradientX = pointCssPx.x / (halfWidth * halfWidth);
  const normalGradientY = pointCssPx.y / (halfHeight * halfHeight);
  const normalLength = Math.hypot(normalGradientX, normalGradientY) || 1;
  const normalX = normalGradientX / normalLength;
  const normalY = normalGradientY / normalLength;
  const tangentX = -normalY;
  const tangentY = normalX;
  const directionX = getDirectionX(canonicalState.horizontalDirection);
  const motionStrength = getMotionStrength(canonicalState.velocityTier);
  const staticEdgeMultiplier = optics === "edge" ? config.edgeMeniscusMultiplier : 1;
  const edgeMotionIncrement = optics === "edge" ? config.edgeMotionMultiplier - 1 : 0;
  const incidence = normalX * directionX;
  const coreX = pointCssPx.x * -config.coreZoom * coreWeight;
  const coreY = pointCssPx.y * -config.coreZoom * coreWeight;
  const radialRimStrength = config.baselineMeniscusRefractionCssPx
    * rimWeight
    * (staticEdgeMultiplier + config.rimMotionMultiplier * motionStrength)
    + config.baselineMeniscusRefractionCssPx
      * config.rimMotionMultiplier
      * edgeMotionIncrement
      * edgeMotionWeight
      * motionStrength;
  const tangentialStrength = config.tangentialRefractionCssPx
    * incidence
    * motionStrength
    * (rimWeight + edgeMotionIncrement * edgeMotionWeight);
  const directionalStrength = config.directionalRefractionCssPx
    * motionStrength
    * (rimWeight + edgeMotionIncrement * edgeMotionWeight)
    + (optics === "edge" ? config.edgeDirectionalBoostCssPx * edgeMotionWeight * motionStrength : 0);

  return {
    x: coreX - normalX * radialRimStrength + tangentX * tangentialStrength + directionX * directionalStrength,
    y: coreY - normalY * radialRimStrength + tangentY * tangentialStrength,
  };
}

function createFieldProfileKey(
  widthCssPx: number,
  heightCssPx: number,
  optics: LensOpticsMode,
  rasterScale: number,
  state: LensFieldState,
  config: LensOpticsConfig,
) {
  const canonicalState = canonicalizeLensFieldState(state);
  return [
    "v3-05-failed-continuous-field-4",
    widthCssPx,
    heightCssPx,
    optics,
    rasterScale,
    canonicalState.horizontalDirection,
    canonicalState.velocityTier,
    config.fieldScaleCssPx,
    config.coreZoom,
    config.coreFalloffStart,
    config.meniscusBandCssPx,
    config.baselineMeniscusRefractionCssPx,
    config.edgeMeniscusMultiplier,
    config.tangentialRefractionCssPx,
    config.directionalRefractionCssPx,
    config.edgeDirectionalBoostCssPx,
    config.rimMotionMultiplier,
    config.edgeMotionMultiplier,
  ].join(":");
}

export function createLensFieldProfileKey(
  widthCssPx: number,
  heightCssPx: number,
  optics: LensOpticsMode,
  devicePixelRatio: number,
  state: LensFieldState = STATIC_LENS_FIELD_STATE,
  config: LensOpticsConfig = V3_LENS_OPTICS,
) {
  return createFieldProfileKey(
    Math.max(1, Math.round(widthCssPx)),
    Math.max(1, Math.round(heightCssPx)),
    optics,
    calculateRasterScale(devicePixelRatio, config),
    state,
    config,
  );
}

function trimFieldCache(config: LensOpticsConfig) {
  const capacity = Math.max(1, Math.min(config.fieldCacheCapacity, DYNAMIC_FIELD_PROFILE_CAPACITY + 2));
  while ([...fieldCache.values()].filter((entry) => !entry.isStatic).length > DYNAMIC_FIELD_PROFILE_CAPACITY) {
    const oldestDynamicKey = [...fieldCache.entries()].find(([, entry]) => !entry.isStatic)?.[0];
    if (!oldestDynamicKey) break;
    fieldCache.delete(oldestDynamicKey);
  }
  while (fieldCache.size > capacity) {
    const oldestKey = fieldCache.keys().next().value;
    if (oldestKey === undefined) return;
    fieldCache.delete(oldestKey);
  }
}

export function createEllipticalField(
  widthCssPx: number,
  heightCssPx: number,
  optics: LensOpticsMode,
  devicePixelRatio: number,
  state: LensFieldState = STATIC_LENS_FIELD_STATE,
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

  const canonicalState = canonicalizeLensFieldState(state);
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let pixelY = 0; pixelY < canvas.height; pixelY += 1) {
    for (let pixelX = 0; pixelX < canvas.width; pixelX += 1) {
      const displacement = calculateLensFieldDisplacement(
        {
          x: (pixelX + 0.5) / resolution - width / 2,
          y: (pixelY + 0.5) / resolution - height / 2,
        },
        { width, height },
        optics,
        canonicalState,
        config,
      );
      const index = (pixelY * canvas.width + pixelX) * 4;
      pixels.data[index] = encodeDisplacement(displacement.x, config.fieldScaleCssPx);
      pixels.data[index + 1] = encodeDisplacement(displacement.y, config.fieldScaleCssPx);
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

export function getCachedEllipticalField(
  widthCssPx: number,
  heightCssPx: number,
  optics: LensOpticsMode,
  devicePixelRatio: number,
  state: LensFieldState = STATIC_LENS_FIELD_STATE,
  config: LensOpticsConfig = V3_LENS_OPTICS,
) {
  const width = Math.max(1, Math.round(widthCssPx));
  const height = Math.max(1, Math.round(heightCssPx));
  const rasterScale = calculateRasterScale(devicePixelRatio, config);
  const canonicalState = canonicalizeLensFieldState(state);
  const key = createFieldProfileKey(width, height, optics, rasterScale, canonicalState, config);
  const cachedField = fieldCache.get(key);
  if (cachedField !== undefined) {
    fieldCache.delete(key);
    fieldCache.set(key, cachedField);
    return cachedField.dataUrl;
  }

  const field = createEllipticalField(width, height, optics, devicePixelRatio, canonicalState, config);
  if (!field) return "";
  fieldCache.set(key, { dataUrl: field, isStatic: isStaticFieldState(canonicalState) });
  trimFieldCache(config);
  return field;
}

export function getLensFieldCacheStats() {
  return {
    size: fieldCache.size,
    dynamicProfileCount: [...fieldCache.values()].filter((entry) => !entry.isStatic).length,
    capacity: V3_LENS_OPTICS.fieldCacheCapacity,
    dynamicProfileCapacity: DYNAMIC_FIELD_PROFILE_CAPACITY,
  };
}

export function resetLensFieldCache() {
  fieldCache.clear();
}

export function createCoalescedLensFieldStateScheduler(
  apply: (state: LensFieldState) => void,
  clock: LensFieldStateSchedulerClock,
  coalesceWindowMs = 125,
) {
  let pendingState: LensFieldState | null = null;
  let timer: number | null = null;
  let lastAppliedAt = 0;
  let appliedState: LensFieldState = STATIC_LENS_FIELD_STATE;

  const applyState = (state: LensFieldState) => {
    const canonicalState = canonicalizeLensFieldState(state);
    if (lensFieldStatesEqual(appliedState, canonicalState)) return;
    appliedState = canonicalState;
    lastAppliedAt = clock.now();
    apply(canonicalState);
  };

  const flush = () => {
    timer = null;
    const nextState = pendingState;
    pendingState = null;
    if (nextState) applyState(nextState);
  };

  return {
    schedule(nextState: LensFieldState, immediate = false) {
      if (immediate) {
        if (timer !== null) clock.clearTimer(timer);
        timer = null;
        pendingState = null;
        applyState(nextState);
        return;
      }
      pendingState = canonicalizeLensFieldState(nextState);
      if (timer !== null) return;
      const delay = Math.max(0, coalesceWindowMs - (clock.now() - lastAppliedAt));
      timer = clock.setTimer(flush, delay);
    },
    clear() {
      if (timer !== null) clock.clearTimer(timer);
      timer = null;
      pendingState = null;
    },
    getPendingState() {
      return pendingState;
    },
  };
}
