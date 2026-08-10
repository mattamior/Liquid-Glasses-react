import { expect, test, type Page } from "@playwright/test";

test.use({
  viewport: { width: 1264, height: 948 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
});

const navigationName = "主导航";
const labels = {
  follow: "切换到关注",
  market: "切换到市场",
  activity: "切换到动态",
  open: "切换到开户",
} as const;

type DraggableTab = "follow" | "market" | "activity" | "open";

interface DragCoordinates {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

async function beginTabDrag(page: Page, source: DraggableTab, target: DraggableTab): Promise<DragCoordinates> {
  const selectedTab = page.getByRole("button", { name: labels[source] });
  const targetTab = page.getByRole("button", { name: labels[target] });
  const sourceBox = await selectedTab.boundingBox();
  const targetBox = await targetTab.boundingBox();

  if (!sourceBox || !targetBox) throw new Error("V3 navigation tabs must have measurable boxes.");

  const sourceX = sourceBox.x + sourceBox.width / 2;
  const sourceY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const targetY = targetBox.y + targetBox.height / 2;
  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  return { sourceX, sourceY, targetX, targetY };
}

async function moveDragToFraction(page: Page, coordinates: DragCoordinates, fraction: number) {
  await page.mouse.move(
    coordinates.sourceX + (coordinates.targetX - coordinates.sourceX) * fraction,
    coordinates.sourceY + (coordinates.targetY - coordinates.sourceY) * fraction,
    { steps: 8 },
  );
  const navigation = page.getByRole("navigation", { name: navigationName });
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
}

async function openV3(page: Page, path = "/v3") {
  await page.goto(path);
  const slider = page.getByRole("navigation", { name: navigationName }).locator(".v3-selection-slider");
  await expect(slider).toHaveAttribute("data-ready", "true");
  await page.waitForTimeout(300);
}

function expectCenterErrorsWithinTolerance(errors: readonly number[]) {
  expect(errors).toHaveLength(2);
  expect(Math.max(...errors)).toBeLessThanOrEqual(2);
  expect(errors.reduce((total, error) => total + error, 0) / errors.length).toBeLessThanOrEqual(1.5);
}

async function lensCenterError(lens: ReturnType<Page["getByRole"]>, expectedX: number, expectedY: number) {
  const box = await lens.boundingBox();
  if (!box) throw new Error("The V3 lens must be visible before measuring its center.");
  return Math.hypot(box.x + box.width / 2 - expectedX, box.y + box.height / 2 - expectedY);
}

async function dispatchSyntheticPrimaryPointer(
  tab: ReturnType<Page["getByRole"]>,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  pointerType: "touch" | "pen",
  pointerId: number,
  clientX: number,
  clientY: number,
) {
  await tab.evaluate((button, event) => {
    if (!button.dataset.syntheticPointerReady) {
      Object.defineProperties(button, {
        hasPointerCapture: { configurable: true, value: () => true },
        releasePointerCapture: { configurable: true, value: () => undefined },
        setPointerCapture: { configurable: true, value: () => undefined },
      });
      button.dataset.syntheticPointerReady = "true";
    }
    button.dispatchEvent(new PointerEvent(event.type, {
      bubbles: true,
      button: 0,
      buttons: event.type === "pointerup" || event.type === "pointercancel" ? 0 : 1,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      isPrimary: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    }));
  }, { type, pointerType, pointerId, clientX, clientY });
}

test("keeps the initial selection in one visual layer", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const baseVisual = navigation.locator('[data-visual-layer="base"]');
  const dock = navigation.locator("xpath=..");
  const initialTab = page.getByRole("button", { name: labels.open });
  const [dockBox, navigationBox, sliderBox, lensBox, initialTabBox] = await Promise.all([
    dock.boundingBox(),
    navigation.boundingBox(),
    slider.boundingBox(),
    lens.boundingBox(),
    initialTab.boundingBox(),
  ]);

  if (!dockBox || !navigationBox || !sliderBox || !lensBox || !initialTabBox) {
    throw new Error("The reference-calibrated V3 dock must have measurable geometry.");
  }

  expect(Math.round(dockBox.width)).toBe(1124);
  expect(Math.round(dockBox.height)).toBe(210);
  expect(Math.round(dockBox.y + dockBox.height)).toBe(901);
  expect(Math.round(navigationBox.width)).toBe(872);
  expect(Math.round(navigationBox.height)).toBe(210);
  expect(Math.round(sliderBox.width)).toBe(210);
  expect(Math.round(sliderBox.height)).toBe(182);
  expect(Math.abs(sliderBox.x - initialTabBox.x - 4)).toBeLessThanOrEqual(1);
  expect(Math.abs(initialTabBox.x + initialTabBox.width - (sliderBox.x + sliderBox.width) - 4)).toBeLessThanOrEqual(1);
  expect(Math.abs(sliderBox.y - initialTabBox.y - 13)).toBeLessThanOrEqual(1);
  expect(Math.round(lensBox.width)).toBe(296);
  expect(Math.round(lensBox.height)).toBe(242);

  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveAttribute("data-phase", "idle");
  await expect(lens).toHaveCSS("visibility", "hidden");
  await expect(baseVisual.locator('[data-suppressed="true"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveScreenshot("v3-open-idle.png", { animations: "disabled" });
});

test("keeps reference chrome out of the visual, accessibility, and tab order", async ({ page }) => {
  await openV3(page);

  const copy = page.locator(".v3-copy");
  const optics = page.locator(".v3-optics");
  await expect(copy).toBeHidden();
  await expect(optics).toBeHidden();
  await expect(page.getByRole("region", { name: "V3 liquid glass study" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Baseline" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edge optics" })).toHaveCount(0);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: labels.follow })).toBeFocused();
});

test("shows the explanatory chrome only when explicitly requested", async ({ page }) => {
  await openV3(page, "/v3?chrome=demo");

  await expect(page.getByRole("region", { name: "V3 liquid glass study" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Baseline" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edge optics" })).toBeVisible();
});

test("hides the static slider while a click lens owns the transition", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const market = page.getByRole("button", { name: labels.market });

  await market.click();
  await expect(navigation).toHaveAttribute("data-lens-phase", /primed|expanding|travelling/);
  await expect(slider).toHaveAttribute("data-visible", "false");
  await expect(lens).not.toHaveCSS("visibility", "hidden");
  await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: labels.market })).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
});

test("shows a pointer-following lens during drag and commits only after it settles", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const opticsViewport = lens.locator(".v3-lens-optics-viewport");
  const activity = page.getByRole("button", { name: labels.activity });
  const targetBox = await activity.boundingBox();

  if (!targetBox) throw new Error("The V3 activity tab must have a measurable box.");

  const dragCoordinates = await beginTabDrag(page, "open", "activity");
  await moveDragToFraction(page, dragCoordinates, 1);
  await expect(slider).toHaveAttribute("data-visible", "false");
  await expect(lens).toHaveAttribute("data-phase", "dragging");
  await expect(opticsViewport).toHaveCSS("filter", /url\(/);
  await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page");

  const lensBox = await lens.boundingBox();
  if (!lensBox) throw new Error("The dragging lens must be visible.");
  expect(Math.round(lensBox.width)).toBe(296);
  expect(Math.round(lensBox.height)).toBe(242);
  expect(await lensCenterError(lens, targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2)).toBeLessThanOrEqual(2);
  await page.mouse.up();
  await expect(navigation).toHaveAttribute("data-lens-phase", "drag-settling");
  await expect(page.getByRole("button", { name: labels.activity })).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
});

test("captures Baseline meniscus positions across both reference travel directions", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const lens = navigation.locator(".v3-lens-position");
  const activity = page.getByRole("button", { name: labels.activity });

  const openToActivity = await beginTabDrag(page, "open", "activity");
  await moveDragToFraction(page, openToActivity, 0.5);
  const openToActivityMidError = await lensCenterError(
    lens,
    openToActivity.sourceX + (openToActivity.targetX - openToActivity.sourceX) * 0.5,
    openToActivity.sourceY + (openToActivity.targetY - openToActivity.sourceY) * 0.5,
  );
  await expect(page).toHaveScreenshot("v3-open-to-activity-mid-drag-full.png", { animations: "disabled" });
  await expect(lens).toHaveScreenshot("v3-open-to-activity-mid-drag.png", { animations: "disabled" });
  await moveDragToFraction(page, openToActivity, 1);
  const openToActivityTargetError = await lensCenterError(lens, openToActivity.targetX, openToActivity.targetY);
  expectCenterErrorsWithinTolerance([openToActivityMidError, openToActivityTargetError]);
  await expect(navigation).toHaveAttribute("data-preview-id", "activity");
  await expect(page.getByRole("button", { name: labels.activity })).not.toHaveAttribute("aria-current", "page");
  await expect(lens.locator('[data-highlighted="true"]')).toHaveCount(1);
  await expect(lens.locator('[data-highlighted="true"]')).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page).toHaveScreenshot("v3-open-to-activity-target-drag-full.png", { animations: "disabled" });
  await expect(lens).toHaveScreenshot("v3-open-to-activity-target-drag.png", { animations: "disabled" });
  await page.mouse.up();
  await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");

  const activityToMarket = await beginTabDrag(page, "activity", "market");
  await moveDragToFraction(page, activityToMarket, 0.04);
  await expect(lens).toHaveScreenshot("v3-activity-to-market-start-drag.png", { animations: "disabled" });
  await moveDragToFraction(page, activityToMarket, 0.5);
  const activityToMarketMidError = await lensCenterError(
    lens,
    activityToMarket.sourceX + (activityToMarket.targetX - activityToMarket.sourceX) * 0.5,
    activityToMarket.sourceY + (activityToMarket.targetY - activityToMarket.sourceY) * 0.5,
  );
  await expect(page).toHaveScreenshot("v3-activity-to-market-mid-drag-full.png", { animations: "disabled" });
  await expect(lens).toHaveScreenshot("v3-activity-to-market-mid-drag.png", { animations: "disabled" });
  await moveDragToFraction(page, activityToMarket, 1);
  const activityToMarketTargetError = await lensCenterError(lens, activityToMarket.targetX, activityToMarket.targetY);
  expectCenterErrorsWithinTolerance([activityToMarketMidError, activityToMarketTargetError]);
  await expect(page).toHaveScreenshot("v3-activity-to-market-target-drag-full.png", { animations: "disabled" });
  await page.mouse.up();
});

test("keeps small movements and right clicks out of the drag path", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const selectedTab = page.getByRole("button", { name: labels.open });
  const sourceBox = await selectedTab.boundingBox();

  if (!sourceBox) throw new Error("The selected V3 tab must have a measurable box.");

  const x = sourceBox.x + sourceBox.width / 2;
  const y = sourceBox.y + sourceBox.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 2, y);
  await page.mouse.up();
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");

  await page.mouse.move(x, y);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(x - 80, y);
  await page.mouse.up({ button: "right" });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(selectedTab).toHaveAttribute("aria-current", "page");
});

test("recovers from touch cancellation and commits a pen drag", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const selectedTab = page.getByRole("button", { name: labels.open });
  const marketTab = page.getByRole("button", { name: labels.market });
  const sourceBox = await selectedTab.boundingBox();
  const targetBox = await marketTab.boundingBox();

  if (!sourceBox || !targetBox) throw new Error("The V3 pointer targets must have measurable boxes.");

  const sourceX = sourceBox.x + sourceBox.width / 2;
  const sourceY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const targetY = targetBox.y + targetBox.height / 2;
  await dispatchSyntheticPrimaryPointer(selectedTab, "pointerdown", "touch", 41, sourceX, sourceY);
  await dispatchSyntheticPrimaryPointer(selectedTab, "pointermove", "touch", 41, targetX, targetY);
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
  await dispatchSyntheticPrimaryPointer(selectedTab, "pointercancel", "touch", 41, targetX, targetY);
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(selectedTab).toHaveAttribute("aria-current", "page");

  await dispatchSyntheticPrimaryPointer(selectedTab, "pointerdown", "pen", 42, sourceX, sourceY);
  await dispatchSyntheticPrimaryPointer(selectedTab, "pointermove", "pen", 42, targetX, targetY);
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
  await dispatchSyntheticPrimaryPointer(selectedTab, "pointerup", "pen", 42, targetX, targetY);
  await expect(marketTab).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
});

test("uses a distinct edge field with the same active-lens geometry", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const lens = navigation.locator(".v3-lens-position");
  const opticsViewport = lens.locator(".v3-lens-optics-viewport");
  const slider = navigation.locator(".v3-selection-slider");
  const activity = page.getByRole("button", { name: labels.activity });

  await activity.click();
  await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  const baselineCoordinates = await beginTabDrag(page, "activity", "market");
  await moveDragToFraction(page, baselineCoordinates, 0.5);
  const baselineLensBox = await lens.boundingBox();
  const baselineWorldTransform = await lens.locator(".v3-navigation-world--lens").evaluate((element) => getComputedStyle(element).transform);
  const baselineField = await navigation.locator("feImage").getAttribute("href");
  await page.mouse.up();

  await openV3(page, "/v3?optics=edge");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  const edgeActivity = page.getByRole("button", { name: labels.activity });
  await edgeActivity.click();
  await expect(edgeActivity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  const edgeCoordinates = await beginTabDrag(page, "activity", "market");
  await moveDragToFraction(page, edgeCoordinates, 0.5);
  await expect(slider).toHaveAttribute("data-visible", "false");
  await expect(opticsViewport).toHaveCSS("filter", /url\(/);
  const lensBox = await lens.boundingBox();
  if (!lensBox || !baselineLensBox) throw new Error("The edge and baseline lenses must be visible during drag.");
  expect(lensBox).toEqual(baselineLensBox);
  const edgeWorldTransform = await lens.locator(".v3-navigation-world--lens").evaluate((element) => getComputedStyle(element).transform);
  expect(edgeWorldTransform).toBe(baselineWorldTransform);
  const edgeField = await navigation.locator("feImage").getAttribute("href");
  expect(edgeField).not.toBe(baselineField);
  await expect(page).toHaveScreenshot("v3-edge-activity-to-market-mid-drag-full.png", { animations: "disabled" });
  await expect(lens).toHaveScreenshot("v3-edge-activity-to-market-mid-drag.png", { animations: "disabled" });
  await page.mouse.up();
});

test("commits reduced-motion selection without exposing a temporary lens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");

  await page.getByRole("button", { name: labels.market }).click();
  await expect(page.getByRole("button", { name: labels.market })).toHaveAttribute("aria-current", "page");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveCSS("visibility", "hidden");
});

test("commits forced-colors selection without exposing a transient lens", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const market = page.getByRole("button", { name: labels.market });

  await market.click();
  await expect(market).toHaveAttribute("aria-current", "page");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveCSS("visibility", "hidden");
});

test("falls back to static selection when the Canvas 2D field is unavailable", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContextWithout2d(contextId, ...arguments_) {
      return contextId === "2d" ? null : nativeGetContext.call(this, contextId, ...arguments_);
    };
  });

  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const market = page.getByRole("button", { name: labels.market });

  await expect(navigation.locator("feImage")).toHaveCount(0);
  await expect(lens.locator(".v3-lens-optics-viewport")).toHaveCSS("filter", "none");
  await market.click();
  await expect(market).toHaveAttribute("aria-current", "page");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveCSS("visibility", "hidden");
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("falls back to static selection when SVG filter constructors are unavailable", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperties(window, {
      SVGFEImageElement: { configurable: true, value: undefined },
      SVGFEDisplacementMapElement: { configurable: true, value: undefined },
    });
  });

  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const slider = navigation.locator(".v3-selection-slider");
  const lens = navigation.locator(".v3-lens-position");
  const market = page.getByRole("button", { name: labels.market });

  await expect(navigation.locator("feImage")).toHaveCount(0);
  await expect(lens.locator(".v3-lens-optics-viewport")).toHaveCSS("filter", "none");
  await market.click();
  await expect(market).toHaveAttribute("aria-current", "page");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveCSS("visibility", "hidden");
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
