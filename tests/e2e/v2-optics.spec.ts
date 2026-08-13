import { expect, test } from "@playwright/test";
import {
  MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES,
  V2_CARD_LENS_OPTICS,
  V2_CAPSULE_LENS_OPTICS,
  calculateRasterScale,
  clamp,
  clearRoundedCardLensFieldCache,
  createRoundedCardLensField,
  getRoundedCardLensFieldCacheKey,
  sampleRoundedCardLensField,
} from "../../app/v2/lens-optics";

test("caps the V2 capsule field raster scale at two device pixels", () => {
  expect(calculateRasterScale(0.75)).toBe(1);
  expect(calculateRasterScale(1)).toBe(1);
  expect(calculateRasterScale(1.01)).toBe(2);
  expect(calculateRasterScale(2)).toBe(2);
  expect(calculateRasterScale(3)).toBe(2);
  expect(V2_CAPSULE_LENS_OPTICS.maximumRasterScale).toBe(2);
});

test("keeps the encoded V2 field within its SVG displacement range", () => {
  const { fieldScaleCssPx, filterPaddingCssPx, maximumZoom } = V2_CAPSULE_LENS_OPTICS;
  expect(clamp(127.5 + (filterPaddingCssPx / fieldScaleCssPx) * 255, 0, 255)).toBe(255);
  expect(maximumZoom).toBeCloseTo(1.12, 2);
  expect(filterPaddingCssPx).toBeGreaterThanOrEqual(32);
});

test("keeps rounded-card optics separate from the established navigation capsule", () => {
  expect(V2_CAPSULE_LENS_OPTICS).toEqual({
    edgeRefractionCssPx: 5.4,
    edgeZoneCssPx: 16,
    fieldScaleCssPx: 42,
    filterPaddingCssPx: 40,
    maximumRasterScale: 2,
    maximumZoom: 1.12,
    minimumZoom: 1.03,
    radiusCssPx: 22,
  });
  expect(V2_CARD_LENS_OPTICS).toMatchObject({
    radiusCssPx: 24,
    edgeZoneCssPx: 14,
    filterPaddingCssPx: 20,
    edgeRefractionCssPx: 2.4,
    minimumZoom: 1,
    maximumZoom: 1.035,
    maximumRasterScale: 2,
  });
  expect(calculateRasterScale(3, V2_CARD_LENS_OPTICS)).toBe(2);
});

test("normalizes rounded-card field cache keys by geometry and capped raster scale", () => {
  const canonical = getRoundedCardLensFieldCacheKey(300.2, 184.4, 1.1);
  expect(canonical).toBe(getRoundedCardLensFieldCacheKey(300.49, 184.49, 2));
  expect(canonical).not.toBe(getRoundedCardLensFieldCacheKey(301, 184, 2));
  expect(canonical).not.toBe(getRoundedCardLensFieldCacheKey(300, 185, 2));
  expect(canonical).not.toBe(getRoundedCardLensFieldCacheKey(300, 184, 1));
});

test("keeps the rounded-card field neutral at its center and continuous through the edge", () => {
  const center = sampleRoundedCardLensField(150, 92, 300, 184);
  expect(center).toMatchObject({ blue: 128, green: 128, red: 128, zoom: 1 });

  const nearEdge = sampleRoundedCardLensField(2, 92, 300, 184);
  const furtherInside = sampleRoundedCardLensField(3, 92, 300, 184);
  expect(nearEdge.distanceFromEdgeCssPx).toBeLessThan(furtherInside.distanceFromEdgeCssPx);
  expect(Math.abs(nearEdge.red - furtherInside.red)).toBeLessThanOrEqual(18);
  expect(Math.abs(nearEdge.green - furtherInside.green)).toBeLessThanOrEqual(2);
  expect(nearEdge.zoom).toBeGreaterThan(furtherInside.zoom);
});

test("curves the field around rounded corners while retaining valid displacement channels", () => {
  const corner = sampleRoundedCardLensField(10, 10, 300, 184);
  const horizontalEdge = sampleRoundedCardLensField(2, 92, 300, 184);

  expect(corner.red).not.toBe(128);
  expect(corner.green).not.toBe(128);
  expect(Math.abs(corner.red - 128)).toBeGreaterThan(0);
  expect(Math.abs(corner.green - 128)).toBeGreaterThan(0);
  expect(horizontalEdge.red).not.toBe(128);
  expect(horizontalEdge.green).toBe(128);

  for (let y = 0; y <= 184; y += 8) {
    for (let x = 0; x <= 300; x += 8) {
      const sample = sampleRoundedCardLensField(x, y, 300, 184);
      expect(sample.red).toBeGreaterThanOrEqual(0);
      expect(sample.red).toBeLessThanOrEqual(255);
      expect(sample.green).toBeGreaterThanOrEqual(0);
      expect(sample.green).toBeLessThanOrEqual(255);
      expect(sample.blue).toBe(128);
    }
  }
});

test("caps rounded-card raster work at DPR two and evicts only the least-recent field", () => {
  expect(MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES).toBe(8);
  expect(calculateRasterScale(0.7, V2_CARD_LENS_OPTICS)).toBe(1);
  expect(calculateRasterScale(1.1, V2_CARD_LENS_OPTICS)).toBe(2);
  expect(calculateRasterScale(4, V2_CARD_LENS_OPTICS)).toBe(2);

  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  let dataUrlCalls = 0;
  const context = {
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    putImageData: () => undefined,
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => ({
        getContext: () => context,
        toDataURL: () => `field-${++dataUrlCalls}`,
      }),
    },
  });

  try {
    clearRoundedCardLensFieldCache();
    for (let width = 20; width < 28; width += 1) {
      createRoundedCardLensField(width, 20, 1.1);
    }
    expect(dataUrlCalls).toBe(8);

    createRoundedCardLensField(20, 20, 2);
    expect(dataUrlCalls).toBe(8);

    createRoundedCardLensField(28, 20, 2);
    expect(dataUrlCalls).toBe(9);
    createRoundedCardLensField(20, 20, 1.1);
    expect(dataUrlCalls).toBe(9);
    createRoundedCardLensField(21, 20, 1.1);
    expect(dataUrlCalls).toBe(10);
  } finally {
    clearRoundedCardLensFieldCache();
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      delete (globalThis as { document?: Document }).document;
    }
  }
});
