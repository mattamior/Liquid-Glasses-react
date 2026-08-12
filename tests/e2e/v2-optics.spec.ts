import { expect, test } from "@playwright/test";
import {
  V2_CAPSULE_LENS_OPTICS,
  calculateRasterScale,
  clamp,
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
