import { expect, test } from "@playwright/test";
import {
  V3_LENS_OPTICS,
  calculateRasterScale,
  calculateLensFieldDisplacement,
  calculateWorldSampleTransform,
  canonicalizeLensFieldState,
  createCoalescedLensFieldStateScheduler,
  createLensFieldProfileKey,
  createLensCoordinateSpace,
  getLensFieldCacheStats,
  getCachedEllipticalField,
  lensFieldStatesEqual,
  quantizeHorizontalDirection,
  quantizeVelocityTier,
  resetLensFieldCache,
  STATIC_LENS_FIELD_STATE,
} from "../../app/v3-05-failed/lens-optics";

interface CapturedField {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function withCanvasDocument<T>(run: (getLatestField: () => CapturedField) => T): T {
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  let latestField: CapturedField | null = null;
  let dataUrlSequence = 0;

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => {
        let width = 0;
        let height = 0;
        return {
          get width() { return width; },
          set width(value: number) { width = value; },
          get height() { return height; },
          set height(value: number) { height = value; },
          getContext: (kind: string) => kind === "2d" ? {
            createImageData: (imageWidth: number, imageHeight: number) => ({
              data: new Uint8ClampedArray(imageWidth * imageHeight * 4),
              height: imageHeight,
              width: imageWidth,
            }),
            putImageData: (image: CapturedField) => {
              latestField = {
                data: image.data.slice(),
                height: image.height,
                width: image.width,
              };
            },
          } : null,
          toDataURL: () => `data:image/png;base64,v3-test-field-${++dataUrlSequence}`,
        };
      },
    },
  });

  try {
    return run(() => {
      if (!latestField) throw new Error("The field renderer did not commit pixels.");
      return latestField;
    });
  } finally {
    if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor);
    else delete (globalThis as { document?: unknown }).document;
  }
}

function encodeDisplacement(displacementCssPx: number, fieldScaleCssPx = V3_LENS_OPTICS.fieldScaleCssPx) {
  const encoded = 127.5 + (displacementCssPx / fieldScaleCssPx) * 255;
  return Math.round(Math.min(Math.max(encoded, 0), 255));
}

function decodeDisplacement(channel: number, fieldScaleCssPx = V3_LENS_OPTICS.fieldScaleCssPx) {
  return ((channel - 127.5) / 255) * fieldScaleCssPx;
}

test("keeps the world point beneath the lens center within one CSS pixel", () => {
  const space = createLensCoordinateSpace(
    { x: 71, y: 692 },
    { width: 870, height: 208 },
    { width: 296, height: 242 },
    { x: 544, y: 104 },
  );
  const transform = calculateWorldSampleTransform(space);

  expect(544 * space.opticScale + transform.x).toBeCloseTo(148, 6);
  expect(104 * space.opticScale + transform.y).toBeCloseTo(121, 6);
});

test("keeps the CSS-space lens strength stable across DPR 1 and 2", () => {
  const lensHalfHeightCssPx = 121;
  const halfRadiusCssPx = lensHalfHeightCssPx * 0.5;
  const coreZoomAtHalfRadius = V3_LENS_OPTICS.coreZoom;
  const expectedScale = 1 + coreZoomAtHalfRadius;

  for (const devicePixelRatio of [1, 2]) {
    const fieldPixelDistance = halfRadiusCssPx * devicePixelRatio;
    const cssOffset = fieldPixelDistance / devicePixelRatio * coreZoomAtHalfRadius;
    expect(cssOffset).toBeCloseTo(halfRadiusCssPx * V3_LENS_OPTICS.coreZoom, 6);
  }

  expect(expectedScale).toBeCloseTo(1.12, 2);
  expect(V3_LENS_OPTICS.maximumResolution).toBeGreaterThanOrEqual(2);
});

test("caps the effective raster scale across supported DPR values", () => {
  expect(calculateRasterScale(0.75)).toBe(1);
  expect(calculateRasterScale(1)).toBe(1);
  expect(calculateRasterScale(1.01)).toBe(2);
  expect(calculateRasterScale(1.5)).toBe(2);
  expect(calculateRasterScale(2)).toBe(2);
  expect(calculateRasterScale(3)).toBe(2);
});

test("calibrates static core and meniscus displacement at the approved radial landmarks", () => {
  const lens = { width: 296, height: 242 };
  const atHalfRadius = calculateLensFieldDisplacement({ x: 74, y: 0 }, lens, "baseline");
  const atEightTenthsBaseline = calculateLensFieldDisplacement({ x: 118.4, y: 0 }, lens, "baseline");
  const atEightTenthsEdge = calculateLensFieldDisplacement({ x: 118.4, y: 0 }, lens, "edge");
  const rimOnlyConfig = { ...V3_LENS_OPTICS, coreZoom: 0 };
  const rimBaseline = calculateLensFieldDisplacement({ x: 140.6, y: 0 }, lens, "baseline", STATIC_LENS_FIELD_STATE, rimOnlyConfig);
  const rimEdge = calculateLensFieldDisplacement({ x: 140.6, y: 0 }, lens, "edge", STATIC_LENS_FIELD_STATE, rimOnlyConfig);

  // Negative is an inward SVG sample displacement, not the apparent outward glyph movement.
  expect(atHalfRadius.x).toBeCloseTo(-8.88, 2);
  expect(atHalfRadius.y).toBeCloseTo(0, 6);
  expect(atEightTenthsBaseline.x).toBeCloseTo(-13.06, 2);
  expect(atEightTenthsEdge.x).toBeCloseTo(-13.41, 2);
  expect(Math.abs(rimBaseline.x)).toBeCloseTo(9.29, 2);
  expect(Math.abs(rimEdge.x)).toBeCloseTo(10.595, 2);
});

test("keeps the field continuous, encodes CSS displacement, and reverses directional motion", () => {
  const lens = { width: 296, height: 242 };
  const justInsideCoreFalloff = calculateLensFieldDisplacement({ x: 103.45, y: 0 }, lens, "baseline");
  const justOutsideCoreFalloff = calculateLensFieldDisplacement({ x: 103.75, y: 0 }, lens, "baseline");
  const rightward = calculateLensFieldDisplacement(
    { x: 140.6, y: 0 },
    lens,
    "baseline",
    { horizontalDirection: "right", velocityTier: 3 },
  );
  const leftward = calculateLensFieldDisplacement(
    { x: 140.6, y: 0 },
    lens,
    "baseline",
    { horizontalDirection: "left", velocityTier: 3 },
  );

  expect(Math.abs(justInsideCoreFalloff.x - justOutsideCoreFalloff.x)).toBeLessThan(0.15);
  expect(rightward.x - leftward.x).toBeCloseTo(4.624, 2);
  expect(rightward.y - leftward.y).toBeCloseTo(6.473, 2);

  withCanvasDocument((getLatestField) => {
    resetLensFieldCache();
    const field = getCachedEllipticalField(296, 242, "baseline", 1, STATIC_LENS_FIELD_STATE);
    expect(field).toContain("v3-test-field-");
    const pixels = getLatestField();
    const pixelX = 222;
    const pixelY = 120;
    const point = { x: pixelX + 0.5 - 148, y: pixelY + 0.5 - 121 };
    const expected = calculateLensFieldDisplacement(point, lens, "baseline");
    const pixelOffset = (pixelY * pixels.width + pixelX) * 4;
    const quantizationErrorCssPx = V3_LENS_OPTICS.fieldScaleCssPx / (2 * 255) + Number.EPSILON;

    expect(pixels.width).toBe(296);
    expect(pixels.height).toBe(242);
    expect(Math.abs(decodeDisplacement(pixels.data[pixelOffset]) - expected.x))
      .toBeLessThanOrEqual(quantizationErrorCssPx);
    expect(Math.abs(decodeDisplacement(pixels.data[pixelOffset + 1]) - expected.y))
      .toBeLessThanOrEqual(quantizationErrorCssPx);
    expect(pixels.data[pixelOffset + 2]).toBe(128);
    expect(pixels.data[pixelOffset + 3]).toBe(255);
    resetLensFieldCache();
  });
});

test("preserves the approved moving Edge landmark through 64px RGBA encoding", () => {
  const lens = { width: 296, height: 242 };
  const tierZero = { horizontalDirection: "right" as const, velocityTier: 0 as const };
  const movingRight = { horizontalDirection: "right" as const, velocityTier: 3 as const };

  // This r=.8 back-facing sample is sensitive to directional motion while
  // remaining inside the field's symmetric ±32px encoding range.
  const contourLandmark = { x: -111.56, y: 32.43 };
  const staticBaseline = calculateLensFieldDisplacement(contourLandmark, lens, "baseline");
  const staticBaselineTierZero = calculateLensFieldDisplacement(contourLandmark, lens, "baseline", tierZero);
  const staticEdge = calculateLensFieldDisplacement(contourLandmark, lens, "edge");
  const staticEdgeTierZero = calculateLensFieldDisplacement(contourLandmark, lens, "edge", tierZero);
  const movingBaseline = calculateLensFieldDisplacement(contourLandmark, lens, "baseline", movingRight);
  const movingEdge = calculateLensFieldDisplacement(contourLandmark, lens, "edge", movingRight);
  const edgeContourDelta = Math.hypot(movingEdge.x - movingBaseline.x, movingEdge.y - movingBaseline.y);
  const quantizationErrorCssPx = V3_LENS_OPTICS.fieldScaleCssPx / (2 * 255) + Number.EPSILON;
  const decodedDeltaErrorCssPx = Math.SQRT2 * V3_LENS_OPTICS.fieldScaleCssPx / 255;
  const decodedBaseline = {
    x: decodeDisplacement(encodeDisplacement(movingBaseline.x)),
    y: decodeDisplacement(encodeDisplacement(movingBaseline.y)),
  };
  const decodedEdge = {
    x: decodeDisplacement(encodeDisplacement(movingEdge.x)),
    y: decodeDisplacement(encodeDisplacement(movingEdge.y)),
  };
  const decodedEdgeContourDelta = Math.hypot(
    decodedEdge.x - decodedBaseline.x,
    decodedEdge.y - decodedBaseline.y,
  );

  expect(V3_LENS_OPTICS.fieldScaleCssPx).toBe(64);
  expect(encodeDisplacement(0)).toBe(128);
  expect(decodeDisplacement(128)).toBeCloseTo(V3_LENS_OPTICS.fieldScaleCssPx / (2 * 255), 12);
  expect(staticBaselineTierZero).toEqual(staticBaseline);
  expect(staticEdgeTierZero).toEqual(staticEdge);
  expect(edgeContourDelta).toBeCloseTo(4.603, 3);
  expect(edgeContourDelta).toBeGreaterThanOrEqual(3);
  expect(edgeContourDelta).toBeLessThanOrEqual(6);
  expect(decodedEdgeContourDelta).toBeGreaterThanOrEqual(3);
  expect(decodedEdgeContourDelta).toBeLessThanOrEqual(6);
  expect(Math.abs(decodedEdgeContourDelta - edgeContourDelta)).toBeLessThanOrEqual(decodedDeltaErrorCssPx);
  for (const [decoded, formula] of [[decodedBaseline, movingBaseline], [decodedEdge, movingEdge]] as const) {
    expect(Math.abs(decoded.x - formula.x)).toBeLessThanOrEqual(quantizationErrorCssPx);
    expect(Math.abs(decoded.y - formula.y)).toBeLessThanOrEqual(quantizationErrorCssPx);
  }
});

test("keeps every DPR 1 and 2 field inside the ±32px encoding and filter padding", () => {
  const lens = { width: 296, height: 242 };
  const maximumEncodableAxisCssPx = V3_LENS_OPTICS.fieldScaleCssPx / 2;
  let maximumAxisCssPx = 0;
  let minimumEncodedChannel = 255;
  let maximumEncodedChannel = 0;

  withCanvasDocument((getLatestField) => {
    for (const devicePixelRatio of [1, 2]) {
      const rasterScale = calculateRasterScale(devicePixelRatio);
      for (const optics of ["baseline", "edge"] as const) {
        for (const horizontalDirection of ["none", "left", "right"] as const) {
          for (const velocityTier of [0, 1, 2, 3] as const) {
            const state = { horizontalDirection, velocityTier };
            resetLensFieldCache();
            getCachedEllipticalField(lens.width, lens.height, optics, devicePixelRatio, state);
            const pixels = getLatestField();

            expect(pixels.width).toBe(lens.width * rasterScale);
            expect(pixels.height).toBe(lens.height * rasterScale);
            for (let pixelY = 0; pixelY < pixels.height; pixelY += 1) {
              for (let pixelX = 0; pixelX < pixels.width; pixelX += 1) {
                const point = {
                  x: (pixelX + 0.5) / rasterScale - lens.width / 2,
                  y: (pixelY + 0.5) / rasterScale - lens.height / 2,
                };
                const displacement = calculateLensFieldDisplacement(point, lens, optics, state);
                const pixelOffset = (pixelY * pixels.width + pixelX) * 4;
                maximumAxisCssPx = Math.max(
                  maximumAxisCssPx,
                  Math.abs(displacement.x),
                  Math.abs(displacement.y),
                );
                minimumEncodedChannel = Math.min(
                  minimumEncodedChannel,
                  pixels.data[pixelOffset],
                  pixels.data[pixelOffset + 1],
                );
                maximumEncodedChannel = Math.max(
                  maximumEncodedChannel,
                  pixels.data[pixelOffset],
                  pixels.data[pixelOffset + 1],
                );
              }
            }
          }
        }
      }
    }
    resetLensFieldCache();
  });

  expect(maximumAxisCssPx).toBeLessThanOrEqual(maximumEncodableAxisCssPx);
  expect(V3_LENS_OPTICS.filterPaddingCssPx).toBeGreaterThanOrEqual(Math.ceil(maximumAxisCssPx) + 1);
  expect(minimumEncodedChannel).toBeGreaterThan(0);
  expect(maximumEncodedChannel).toBeLessThan(255);
});

test("canonicalizes tier zero and keys only discrete field-profile buckets", () => {
  const staticKey = createLensFieldProfileKey(296.4, 241.6, "baseline", 1, STATIC_LENS_FIELD_STATE);
  const tierZeroKey = createLensFieldProfileKey(296.49, 241.51, "baseline", 1, {
    horizontalDirection: "left",
    velocityTier: 0,
  });
  const roundedDprKey = createLensFieldProfileKey(296, 242, "baseline", 1.01, STATIC_LENS_FIELD_STATE);
  const rightTierOneKey = createLensFieldProfileKey(296, 242, "baseline", 2, {
    horizontalDirection: "right",
    velocityTier: 1,
  });
  const rightTierTwoKey = createLensFieldProfileKey(296, 242, "baseline", 2, {
    horizontalDirection: "right",
    velocityTier: 2,
  });

  expect(canonicalizeLensFieldState({ horizontalDirection: "left", velocityTier: 0 })).toEqual(STATIC_LENS_FIELD_STATE);
  expect(lensFieldStatesEqual(STATIC_LENS_FIELD_STATE, { horizontalDirection: "left", velocityTier: 0 })).toBe(true);
  expect(staticKey).toBe(tierZeroKey);
  expect(roundedDprKey).not.toBe(staticKey);
  expect(rightTierOneKey).not.toBe(rightTierTwoKey);
});

test("quantizes dynamic profiles and retains cache entries with LRU recency", () => {
  expect(quantizeHorizontalDirection(-0.5)).toBe("left");
  expect(quantizeHorizontalDirection(-0.49)).toBe("none");
  expect(quantizeHorizontalDirection(0.5)).toBe("right");
  expect(quantizeVelocityTier(0.149)).toBe(0);
  expect(quantizeVelocityTier(0.15)).toBe(1);
  expect(quantizeVelocityTier(0.6)).toBe(2);
  expect(quantizeVelocityTier(1.2)).toBe(3);
  expect(lensFieldStatesEqual(STATIC_LENS_FIELD_STATE, { horizontalDirection: "none", velocityTier: 0 })).toBe(true);

  withCanvasDocument(() => {
    resetLensFieldCache();
    const config = { ...V3_LENS_OPTICS, fieldCacheCapacity: 2 };
    const dimensions = [631, 307] as const;
    const staticField = getCachedEllipticalField(...dimensions, "baseline", 1, STATIC_LENS_FIELD_STATE, config);
    const edgeField = getCachedEllipticalField(...dimensions, "edge", 1, STATIC_LENS_FIELD_STATE, config);
    const refreshedStaticField = getCachedEllipticalField(...dimensions, "baseline", 1, STATIC_LENS_FIELD_STATE, config);
    const dynamicField = getCachedEllipticalField(
      ...dimensions,
      "baseline",
      1,
      { horizontalDirection: "right", velocityTier: 1 },
      config,
    );
    const reloadedEdgeField = getCachedEllipticalField(...dimensions, "edge", 1, STATIC_LENS_FIELD_STATE, config);

    expect(refreshedStaticField).toBe(staticField);
    expect(dynamicField).not.toBe(staticField);
    expect(reloadedEdgeField).not.toBe(edgeField);
    expect(getLensFieldCacheStats().size).toBe(2);
    resetLensFieldCache();
    expect(getLensFieldCacheStats().size).toBe(0);
  });
});

test("coalesces the latest field state within 125ms and supports deterministic cancellation", () => {
  let now = 1_000;
  let nextTimer = 0;
  const timers = new Map<number, { callback: () => void; delay: number }>();
  const applied: string[] = [];
  const scheduler = createCoalescedLensFieldStateScheduler(
    (state) => applied.push(`${state.horizontalDirection}:${state.velocityTier}`),
    {
      now: () => now,
      setTimer: (callback, delay) => {
        const timer = ++nextTimer;
        timers.set(timer, { callback, delay });
        return timer;
      },
      clearTimer: (timer) => { timers.delete(timer); },
    },
  );

  scheduler.schedule({ horizontalDirection: "right", velocityTier: 3 }, true);
  now = 1_020;
  scheduler.schedule({ horizontalDirection: "left", velocityTier: 3 });
  scheduler.schedule({ horizontalDirection: "right", velocityTier: 2 });
  expect([...timers.values()].map((timer) => timer.delay)).toEqual([105]);
  expect(scheduler.getPendingState()).toEqual({ horizontalDirection: "right", velocityTier: 2 });

  now = 1_125;
  const [pendingTimerId, pendingTimer] = [...timers.entries()][0] ?? [];
  if (!pendingTimer || pendingTimerId === undefined) throw new Error("The field scheduler must retain its coalesced update.");
  timers.delete(pendingTimerId);
  pendingTimer.callback();
  expect(applied).toEqual(["right:3", "right:2"]);
  expect(scheduler.getPendingState()).toBeNull();

  now = 1_140;
  scheduler.schedule({ horizontalDirection: "left", velocityTier: 1 });
  scheduler.clear();
  expect(timers.size).toBe(0);
  expect(scheduler.getPendingState()).toBeNull();
});
