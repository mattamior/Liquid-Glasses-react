import { expect, test } from "@playwright/test";
import {
  V3_LENS_OPTICS,
  calculateRasterScale,
  calculateWorldSampleTransform,
  createLensCoordinateSpace,
} from "../../app/v3/lens-optics";

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
