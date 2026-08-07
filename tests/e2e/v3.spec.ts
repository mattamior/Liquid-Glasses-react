import { expect, test, type Page } from "@playwright/test";

const navigationName = "主导航";
const labels = {
  follow: "切换到关注",
  market: "切换到市场",
  activity: "切换到动态",
  open: "切换到开户",
} as const;

async function dragSelectedTabTo(page: Page, target: "follow" | "market" | "activity") {
  const navigation = page.getByRole("navigation", { name: navigationName });
  const selectedTab = page.getByRole("button", { name: labels.open });
  const targetTab = page.getByRole("button", { name: labels[target] });
  const sourceBox = await selectedTab.boundingBox();
  const targetBox = await targetTab.boundingBox();

  if (!sourceBox || !targetBox) throw new Error("V3 navigation tabs must have measurable boxes.");

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 8 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
}

async function openV3(page: Page, path = "/v3") {
  await page.setViewportSize({ width: 1264, height: 948 });
  await page.goto(path);
  await expect(page.getByRole("navigation", { name: navigationName }).locator(".v3-selection-slider")).toHaveAttribute("data-ready", "true");
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
  const [dockBox, navigationBox, sliderBox, lensBox] = await Promise.all([
    dock.boundingBox(),
    navigation.boundingBox(),
    slider.boundingBox(),
    lens.boundingBox(),
  ]);

  if (!dockBox || !navigationBox || !sliderBox || !lensBox) {
    throw new Error("The reference-calibrated V3 dock must have measurable geometry.");
  }

  expect(Math.round(dockBox.width)).toBe(1124);
  expect(Math.round(dockBox.height)).toBe(210);
  expect(Math.round(dockBox.y + dockBox.height)).toBe(901);
  expect(Math.round(navigationBox.width)).toBe(872);
  expect(Math.round(navigationBox.height)).toBe(210);
  expect(Math.round(sliderBox.width)).toBe(210);
  expect(Math.round(sliderBox.height)).toBe(182);
  expect(Math.round(lensBox.width)).toBe(296);
  expect(Math.round(lensBox.height)).toBe(242);

  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveAttribute("data-phase", "idle");
  await expect(lens).toHaveCSS("visibility", "hidden");
  await expect(baseVisual.locator('[data-suppressed="true"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page");
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

  await dragSelectedTabTo(page, "activity");
  await expect(slider).toHaveAttribute("data-visible", "false");
  await expect(lens).toHaveAttribute("data-phase", "dragging");
  await expect(opticsViewport).toHaveCSS("filter", /url\(/);
  await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page");

  const lensBox = await lens.boundingBox();
  if (!lensBox) throw new Error("The dragging lens must be visible.");
  expect(Math.round(lensBox.width)).toBe(296);
  expect(Math.round(lensBox.height)).toBe(242);
  expect(Math.abs(lensBox.x + lensBox.width / 2 - (targetBox.x + targetBox.width / 2))).toBeLessThan(4);
  await expect(lens).toHaveScreenshot("v3-baseline-drag.png", { animations: "disabled" });

  await page.mouse.up();
  await expect(navigation).toHaveAttribute("data-lens-phase", "drag-settling");
  await expect(page.getByRole("button", { name: labels.activity })).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
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

test("uses the stronger edge field with the same active-lens geometry", async ({ page }) => {
  await openV3(page, "/v3?optics=edge");

  const navigation = page.getByRole("navigation", { name: navigationName });
  const lens = navigation.locator(".v3-lens-position");
  const opticsViewport = lens.locator(".v3-lens-optics-viewport");
  const slider = navigation.locator(".v3-selection-slider");

  await expect(page.getByRole("button", { name: "Edge optics" })).toHaveClass(/is-active/);
  await dragSelectedTabTo(page, "market");
  await expect(slider).toHaveAttribute("data-visible", "false");
  await expect(opticsViewport).toHaveCSS("filter", /url\(/);
  const lensBox = await lens.boundingBox();
  if (!lensBox) throw new Error("The edge lens must be visible during drag.");
  expect(Math.round(lensBox.width)).toBe(296);
  expect(Math.round(lensBox.height)).toBe(242);
  await page.waitForTimeout(250);
  await expect(lens).toHaveScreenshot("v3-edge-drag.png", { animations: "disabled" });
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
