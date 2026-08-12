import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({
  viewport: { width: 1264, height: 948 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
});

const navigationName = "主导航";
const themeStorageKey = "liquid-lab:v3-theme";
const labels = {
  follow: "切换到关注",
  market: "切换到市场",
  activity: "切换到动态",
  open: "切换到开户",
} as const;

type DraggableTab = "follow" | "market" | "activity" | "open";
type ThemeName = "dark" | "light";
type ThemePreference = ThemeName | "system";

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
  await page.evaluate(() => {
    (window as Window & { __setV3TestTime?: (time: number) => void }).__setV3TestTime?.(1_000);
  });
  await page.mouse.down();
  return { sourceX, sourceY, targetX, targetY };
}

async function moveDragToFraction(page: Page, coordinates: DragCoordinates, fraction: number) {
  await page.evaluate(() => {
    (window as Window & { __advanceV3TestTime?: (milliseconds: number) => void }).__advanceV3TestTime?.(16);
  });
  await page.mouse.move(
    coordinates.sourceX + (coordinates.targetX - coordinates.sourceX) * fraction,
    coordinates.sourceY + (coordinates.targetY - coordinates.sourceY) * fraction,
    { steps: 8 },
  );
  const navigation = page.getByRole("navigation", { name: navigationName });
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
}

async function openV3(page: Page, path = "/v3") {
  await page.addInitScript(() => {
    if ("__setV3TestTime" in window) return;
    let now = 1_000;
    Object.defineProperty(performance, "now", { configurable: true, value: () => now });
    Object.assign(window, {
      __setV3TestTime: (nextTime: number) => { now = nextTime; },
      __advanceV3TestTime: (milliseconds: number) => { now += milliseconds; },
    });
  });
  await page.goto(path);
  const slider = page.getByRole("navigation", { name: navigationName }).locator(".v3-selection-slider");
  await expect(slider).toHaveAttribute("data-ready", "true");
  await expect(page.locator(".v3-demo")).toHaveAttribute("data-theme-hydrated", "true");
  await page.waitForTimeout(300);
}

function themeToggleName(theme: ThemeName) {
  return theme === "light" ? "切换到深色主题" : "切换到亮色主题";
}

async function expectThemePresentation(page: Page, preference: ThemePreference, resolvedTheme: ThemeName) {
  const root = page.locator(".v3-demo");
  const toggle = page.getByRole("button", { name: themeToggleName(resolvedTheme) });
  const isLight = resolvedTheme === "light";

  await expect(root).toHaveAttribute("data-theme-preference", preference);
  await expect(root).toHaveAttribute("data-resolved-theme", resolvedTheme);
  if (preference === "system") {
    await expect(root).not.toHaveAttribute("data-theme");
  } else {
    await expect(root).toHaveAttribute("data-theme", preference);
  }
  await expect(toggle).toHaveAttribute("aria-pressed", String(isLight));
  await expect(toggle).toHaveAttribute("aria-label", themeToggleName(resolvedTheme));
  await expect(toggle).toHaveAttribute("title", themeToggleName(resolvedTheme));
  await expect(toggle.locator(".v3-theme-toggle__icon--sun")).toHaveCSS("display", isLight ? "none" : "block");
  await expect(toggle.locator(".v3-theme-toggle__icon--moon")).toHaveCSS("display", isLight ? "block" : "none");
  await expect(page.locator("body")).toHaveCSS("background-color", isLight ? "rgb(244, 247, 248)" : "rgb(5, 15, 19)");
}

async function expectStoredTheme(page: Page, theme: ThemeName | null) {
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), themeStorageKey)).toBe(theme);
}

async function tabToThemeToggle(page: Page) {
  for (let index = 0; index < 5; index += 1) await page.keyboard.press("Tab");
  const toggle = page.getByRole("button", { name: /切换到.*主题/ });
  await expect(toggle).toBeFocused();
  return toggle;
}

async function readBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The V3 theme invariant requires measurable geometry.");
  return {
    x: Math.round(box.x * 100) / 100,
    y: Math.round(box.y * 100) / 100,
    width: Math.round(box.width * 100) / 100,
    height: Math.round(box.height * 100) / 100,
  };
}

function expectBoxesWithinTolerance(actual: Awaited<ReturnType<typeof readBox>>, expected: Awaited<ReturnType<typeof readBox>>) {
  for (const coordinate of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(actual[coordinate] - expected[coordinate])).toBeLessThanOrEqual(0.1);
  }
}

function relativeLuminance([red, green, blue]: readonly number[]) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrastRatio(foreground: readonly number[], background: readonly number[]) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function composite(foreground: readonly number[], alpha: number, background: readonly number[]) {
  return foreground.map((channel, index) => Math.round(channel * alpha + background[index] * (1 - alpha)));
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
  await expect(lens.locator('[data-highlighted="true"] .v3-tab-icon')).toHaveCSS("color", "rgb(255, 255, 255)");
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

test("keeps navigation glyph assets, geometry, and colors shared across the base, selection, and lens worlds", async ({ page }) => {
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const baseGlyphs = navigation.locator('.v3-navigation-world--base .v3-nav-glyph');
  const selectionGlyphs = navigation.locator('.v3-navigation-world--selection .v3-nav-glyph');
  const lensGlyphs = navigation.locator('.v3-navigation-world--lens .v3-nav-glyph');
  const baseIcons = navigation.locator('.v3-navigation-world--base .v3-tab-icon');
  const baseLabels = navigation.locator('.v3-navigation-world--base .v3-tab-label');
  const selectionIcons = navigation.locator('.v3-navigation-world--selection .v3-tab-icon');

  await expect(baseGlyphs).toHaveCount(4);
  await expect(selectionGlyphs).toHaveCount(4);
  await expect(lensGlyphs).toHaveCount(4);
  const glyphContract = await navigation.evaluate((element) => (
    ["base", "selection", "lens"].map((layer) => Array.from(
      element.querySelectorAll(`.v3-navigation-world--${layer} .v3-nav-glyph`),
      (glyph) => ({
        className: glyph.getAttribute("class"),
        path: glyph.innerHTML,
        viewBox: glyph.getAttribute("viewBox"),
      }),
    ))
  ));

  expect(glyphContract[1]).toEqual(glyphContract[0]);
  expect(glyphContract[2]).toEqual(glyphContract[0]);
  for (const glyph of glyphContract[0]) {
    expect(glyph.className).toMatch(/^v3-nav-glyph v3-nav-glyph--(follow|market|activity|open)$/);
    expect(glyph.viewBox).toBe("0 0 100 100");
  }

  const targetGlyphSizes = [70, 88, 79, 70];
  for (let index = 0; index < 4; index += 1) {
    const [baseBox, selectionBox] = await Promise.all([
      readBox(baseGlyphs.nth(index)),
      readBox(selectionGlyphs.nth(index)),
    ]);
    expect(baseBox.width).toBe(targetGlyphSizes[index]);
    expect(baseBox.height).toBe(targetGlyphSizes[index]);
    expect(selectionBox.width).toBe(baseBox.width);
    expect(selectionBox.height).toBe(baseBox.height);
  }
  await expect(baseIcons.nth(0)).toHaveCSS("color", "rgb(245, 245, 246)");
  await expect(baseLabels.nth(0)).toHaveCSS("color", "rgba(245, 245, 246, 0.58)");
  await expect(selectionIcons.nth(3)).toHaveCSS("color", "rgb(255, 255, 255)");

  const activity = page.getByRole("button", { name: labels.activity });
  const activityBox = await activity.boundingBox();
  if (!activityBox) throw new Error("The activity tab must have a measurable box.");
  const drag = await beginTabDrag(page, "open", "activity");
  await moveDragToFraction(page, drag, 1);
  const activityIndex = 2;
  const [baseActivityBox, lensActivityBox] = await Promise.all([
    readBox(baseGlyphs.nth(activityIndex)),
    readBox(lensGlyphs.nth(activityIndex)),
  ]);
  expect(Math.abs(lensActivityBox.width - baseActivityBox.width)).toBeLessThanOrEqual(0.75);
  expect(Math.abs(lensActivityBox.height - baseActivityBox.height)).toBeLessThanOrEqual(0.75);
  await expect(lensGlyphs.nth(activityIndex).locator("xpath=.."))
    .toHaveCSS("color", "rgb(255, 255, 255)");
  await page.mouse.up();
});

test("coalesces field updates to the latest velocity bucket while retaining same-bucket fields", async ({ page }) => {
  await page.addInitScript(() => {
    let now = 1_000;
    Object.defineProperty(performance, "now", { configurable: true, value: () => now });
    Object.assign(window, { __setV3TestTime: (nextTime: number) => { now = nextTime; } });
  });
  await openV3(page);

  const navigation = page.getByRole("navigation", { name: navigationName });
  const field = navigation.locator("feImage");
  const open = page.getByRole("button", { name: labels.open });
  const openBox = await open.boundingBox();
  if (!openBox) throw new Error("The active V3 tab must have a measurable box.");
  const sourceX = openBox.x + openBox.width / 2;
  const sourceY = openBox.y + openBox.height / 2;
  const staticField = await field.getAttribute("href");
  const setTime = (value: number) => page.evaluate((nextTime) => {
    (window as Window & { __setV3TestTime: (time: number) => void }).__setV3TestTime(nextTime);
  }, value);

  await dispatchSyntheticPrimaryPointer(open, "pointerdown", "pen", 91, sourceX, sourceY);
  await setTime(1_001);
  await dispatchSyntheticPrimaryPointer(open, "pointermove", "pen", 91, sourceX + 10, sourceY);
  await expect(navigation).toHaveAttribute("data-lens-phase", "dragging");
  await expect.poll(() => field.getAttribute("href")).not.toBe(staticField);
  const rightTierThreeField = await field.getAttribute("href");

  await page.evaluate(() => {
    const image = document.querySelector(".v3-nav feImage");
    const state = window as Window & { __v3FieldHrefMutations?: string[]; __v3FieldHrefObserver?: MutationObserver };
    state.__v3FieldHrefMutations = [];
    state.__v3FieldHrefObserver = new MutationObserver(() => {
      state.__v3FieldHrefMutations?.push(image?.getAttribute("href") ?? "");
    });
    state.__v3FieldHrefObserver.observe(image!, { attributeFilter: ["href"], attributes: true });
  });
  await setTime(1_020);
  await dispatchSyntheticPrimaryPointer(open, "pointermove", "pen", 91, sourceX + 20, sourceY);
  await setTime(1_021);
  await dispatchSyntheticPrimaryPointer(open, "pointermove", "pen", 91, sourceX + 10, sourceY);
  await setTime(1_022);
  await dispatchSyntheticPrimaryPointer(open, "pointermove", "pen", 91, sourceX + 11, sourceY);
  await page.waitForTimeout(180);

  const finalField = await field.getAttribute("href");
  const mutations = await page.evaluate(() => {
    const state = window as Window & { __v3FieldHrefMutations?: string[]; __v3FieldHrefObserver?: MutationObserver };
    state.__v3FieldHrefObserver?.disconnect();
    return state.__v3FieldHrefMutations ?? [];
  });
  expect(finalField).not.toBe(rightTierThreeField);
  expect(mutations).toHaveLength(1);
  await setTime(1_147);
  await dispatchSyntheticPrimaryPointer(open, "pointermove", "pen", 91, sourceX + 111, sourceY);
  await page.waitForTimeout(30);
  await expect(field).toHaveAttribute("href", finalField ?? "");
  await dispatchSyntheticPrimaryPointer(open, "pointerup", "pen", 91, sourceX + 11, sourceY);
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
  const themeToggle = page.getByRole("button", { name: "系统颜色模式下不可切换主题" });

  await expect(themeToggle).toBeDisabled();
  await expect(themeToggle).toHaveAttribute("aria-pressed", /true|false/);
  await expect(themeToggle).toHaveCSS("border-style", "dashed");
  await expectStoredTheme(page, null);
  await market.click();
  await expect(market).toHaveAttribute("aria-current", "page");
  await expect(navigation).toHaveAttribute("data-lens-phase", "idle");
  await expect(slider).toHaveAttribute("data-visible", "true");
  await expect(lens).toHaveCSS("visibility", "hidden");
  await expectStoredTheme(page, null);
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

test("keeps storage-free pages synchronized with system dark and light", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.removeItem(key), themeStorageKey);
  await page.emulateMedia({ colorScheme: "dark" });
  await openV3(page);

  await expectThemePresentation(page, "system", "dark");
  await expect(page.locator("#v3-theme-bootstrap")).not.toHaveAttribute("data-theme");
  await page.emulateMedia({ colorScheme: "light" });
  await expectThemePresentation(page, "system", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectThemePresentation(page, "system", "dark");
  await expectStoredTheme(page, null);
});

test("applies stored themes before hydration and removes the bootstrap marker afterwards", async ({ context }) => {
  for (const theme of ["light", "dark"] as const) {
    const page = await context.newPage();
    const hydrationMessages: string[] = [];
    page.on("console", (message) => {
      if (/hydration/i.test(message.text())) hydrationMessages.push(message.text());
    });
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" });
    await page.addInitScript(({ key, storedTheme }) => {
      const state = window as Window & { __v3PersistedThemeFirstFrame?: string };
      window.localStorage.setItem(key, storedTheme);
      const captureFirstFrame = () => {
        const root = document.querySelector<HTMLElement>(".v3-demo");
        const marker = document.querySelector<HTMLScriptElement>("#v3-theme-bootstrap");
        if (!root || root.dataset.themeHydrated !== "false" || state.__v3PersistedThemeFirstFrame) return;
        state.__v3PersistedThemeFirstFrame = JSON.stringify({
          markerTheme: marker?.dataset.theme ?? null,
          pageSolid: getComputedStyle(root).getPropertyValue("--v3-page-solid").trim(),
          preference: root.dataset.themePreference,
          resolved: root.dataset.resolvedTheme ?? null,
        });
      };
      new MutationObserver(captureFirstFrame).observe(document, { attributes: true, childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", captureFirstFrame, { once: true });
    }, { key: themeStorageKey, storedTheme: theme });

    await openV3(page);

    const firstFrame = JSON.parse(await page.evaluate(() => {
      const state = window as Window & { __v3PersistedThemeFirstFrame?: string };
      return state.__v3PersistedThemeFirstFrame ?? "null";
    })) as { markerTheme: ThemeName | null; pageSolid: string; preference: ThemePreference; resolved: ThemeName | null } | null;
    expect(firstFrame).toEqual({
      markerTheme: theme,
      pageSolid: theme === "light" ? "#f4f7f8" : "#050f13",
      preference: "system",
      resolved: null,
    });
    await expectThemePresentation(page, theme, theme);
    await expect(page.locator("#v3-theme-bootstrap")).not.toHaveAttribute("data-theme");
    await expectStoredTheme(page, theme);
    expect(hydrationMessages).toEqual([]);
    await page.close();
  }
});

test("synchronizes persisted theme changes and storage resets across pages", async ({ context }) => {
  const [source, mirror] = await Promise.all([context.newPage(), context.newPage()]);
  await Promise.all([
    source.emulateMedia({ colorScheme: "dark" }),
    mirror.emulateMedia({ colorScheme: "dark" }),
  ]);
  await Promise.all([openV3(source), openV3(mirror)]);
  await expectThemePresentation(mirror, "system", "dark");

  await source.getByRole("button", { name: "切换到亮色主题" }).click();
  await expectStoredTheme(source, "light");
  await expectThemePresentation(mirror, "light", "light");

  await source.evaluate((key) => window.localStorage.removeItem(key), themeStorageKey);
  await expectThemePresentation(mirror, "system", "dark");

  await source.evaluate((key) => window.localStorage.setItem(key, "dark"), themeStorageKey);
  await expectThemePresentation(mirror, "dark", "dark");
  await source.evaluate(() => window.localStorage.clear());
  await expectThemePresentation(mirror, "system", "dark");

  await source.evaluate((key) => window.localStorage.setItem(key, "light"), themeStorageKey);
  await expectThemePresentation(mirror, "light", "light");
  await source.evaluate((key) => window.localStorage.setItem(key, "invalid"), themeStorageKey);
  await expectThemePresentation(mirror, "system", "dark");
});

test("keeps an in-session theme when storage writes fail and returns to system on reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript((key) => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItemWithThemeFailure(storageKey, value) {
      if (storageKey === key) throw new Error("Theme storage intentionally unavailable for this test.");
      return nativeSetItem.call(this, storageKey, value);
    };
  }, themeStorageKey);
  await openV3(page);

  await expectThemePresentation(page, "system", "dark");
  await page.getByRole("button", { name: "切换到亮色主题" }).click();
  await expectThemePresentation(page, "light", "light");
  await expectStoredTheme(page, null);
  await page.reload();
  await expect(page.locator(".v3-demo")).toHaveAttribute("data-theme-hydrated", "true");
  await expectThemePresentation(page, "system", "dark");
  await expectStoredTheme(page, null);
});

test.describe("light theme", () => {
  test.use({ colorScheme: "light" });

  test("keeps the measurable system-light first frame neutral until hydration", async ({ page }) => {
    await page.addInitScript(() => {
      const captureFirstThemeFrame = () => {
        const root = document.querySelector<HTMLElement>(".v3-demo");
        const state = window as Window & { __v3ThemeFirstFrame?: string };
        if (!root || root.dataset.themeHydrated !== "false" || state.__v3ThemeFirstFrame) return;
        state.__v3ThemeFirstFrame = JSON.stringify({
          hydrated: root.dataset.themeHydrated,
          resolved: root.dataset.resolvedTheme ?? null,
          theme: root.dataset.theme ?? null,
          preference: root.dataset.themePreference,
        });
      };
      new MutationObserver(captureFirstThemeFrame).observe(document, { attributes: true, childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", captureFirstThemeFrame, { once: true });
    });

    await openV3(page);

    const firstFrame = JSON.parse(await page.evaluate(() => {
      const state = window as Window & { __v3ThemeFirstFrame?: string };
      return state.__v3ThemeFirstFrame ?? "null";
    })) as {
      hydrated: string;
      resolved: string | null;
      theme: string | null;
      preference: string;
    } | null;
    const root = page.locator(".v3-demo");
    const toggle = page.getByRole("button", { name: "切换到深色主题" });

    expect(firstFrame).toEqual({ hydrated: "false", resolved: null, theme: null, preference: "system" });
    await expect(root).toHaveAttribute("data-resolved-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAttribute("title", "切换到深色主题");
    await expect(toggle.locator(".v3-theme-toggle__icon--sun")).toHaveCSS("display", "none");
    await expect(toggle.locator(".v3-theme-toggle__icon--moon")).toHaveCSS("display", "block");
    await expect(page).toHaveScreenshot("v3-light-system-idle-full.png", { animations: "disabled" });
  });

  test("keeps light tokens and contrast above the visual accessibility floor", async ({ page }) => {
    await openV3(page);

    const tokens = await page.locator(".v3-demo").evaluate((element) => {
      const style = getComputedStyle(element);
      return Object.fromEntries([
        "--v3-page-solid",
        "--v3-rail-surface",
        "--v3-selection-surface",
        "--v3-tab-icon-muted",
        "--v3-tab-label-muted",
        "--v3-tab-active",
        "--v3-accent",
        "--v3-badge",
      ].map((name) => [name, style.getPropertyValue(name).trim()]));
    });

    expect(tokens).toEqual({
      "--v3-page-solid": "#f4f7f8",
      "--v3-rail-surface": "rgb(244 247 250 / 88%)",
      "--v3-selection-surface": "rgb(255 255 255 / 78%)",
      "--v3-tab-icon-muted": "rgb(38 48 58)",
      "--v3-tab-label-muted": "rgb(38 48 58 / 74%)",
      "--v3-tab-active": "#101820",
      "--v3-accent": "#008d7c",
      "--v3-badge": "#008d7c",
    });

    const rail = [244, 247, 250] as const;
    const pageSurface = [244, 247, 248] as const;
    const mutedText = composite([38, 48, 58], 0.74, rail);
    expect(contrastRatio(mutedText, rail)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio([16, 24, 32], [255, 255, 255])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio([0, 141, 124], pageSurface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio([0, 141, 124], rail)).toBeGreaterThanOrEqual(3);
  });

  test("keeps system and manual theme state, icons, and keyboard semantics distinct", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openV3(page);

    const root = page.locator(".v3-demo");
    const toggle = page.getByRole("button", { name: "切换到亮色主题" });
    await expect(root).toHaveAttribute("data-theme-preference", "system");
    await expect(root).not.toHaveAttribute("data-theme");
    await expect(root).toHaveAttribute("data-resolved-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle.locator(".v3-theme-toggle__icon--sun")).toHaveCSS("display", "block");
    await expect(toggle.locator(".v3-theme-toggle__icon--moon")).toHaveCSS("display", "none");

    await page.emulateMedia({ colorScheme: "light" });
    await expect(root).toHaveAttribute("data-resolved-theme", "light");
    const keyboardToggle = await tabToThemeToggle(page);
    await page.keyboard.press("Enter");
    await expect(root).toHaveAttribute("data-theme", "dark");
    await expect(root).toHaveAttribute("data-theme-preference", "dark");
    await expect(root).toHaveAttribute("data-resolved-theme", "dark");
    await expect(keyboardToggle).toHaveAttribute("aria-label", "切换到亮色主题");
    await expect(keyboardToggle).toHaveAttribute("title", "切换到亮色主题");
    await expect(keyboardToggle).toHaveAttribute("aria-pressed", "false");
    await expect(keyboardToggle.locator(".v3-theme-toggle__icon--sun")).toHaveCSS("display", "block");
    await expect(keyboardToggle.locator(".v3-theme-toggle__icon--moon")).toHaveCSS("display", "none");
    await expectStoredTheme(page, "dark");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(root).toHaveAttribute("data-resolved-theme", "dark");
    await page.keyboard.press("Space");
    await expect(root).toHaveAttribute("data-theme", "light");
    await expect(root).toHaveAttribute("data-theme-preference", "light");
    await expect(root).toHaveAttribute("data-resolved-theme", "light");
    await expect(keyboardToggle).toHaveAttribute("aria-label", "切换到深色主题");
    await expect(keyboardToggle).toHaveAttribute("title", "切换到深色主题");
    await expect(keyboardToggle).toHaveAttribute("aria-pressed", "true");
    await expect(keyboardToggle.locator(".v3-theme-toggle__icon--sun")).toHaveCSS("display", "none");
    await expect(keyboardToggle.locator(".v3-theme-toggle__icon--moon")).toHaveCSS("display", "block");
    await expectStoredTheme(page, "light");

    await keyboardToggle.click();
    await expect(root).toHaveAttribute("data-theme", "dark");
    await expectStoredTheme(page, "dark");
    await page.reload();
    await expect(root).toHaveAttribute("data-theme-hydrated", "true");
    await expectThemePresentation(page, "dark", "dark");
    await expectStoredTheme(page, "dark");
  });

  test("keeps theme changes out of the field, coordinate space, and static geometry", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openV3(page);

    const navigation = page.getByRole("navigation", { name: navigationName });
    const lens = navigation.locator(".v3-lens-position");
    const slider = navigation.locator(".v3-selection-slider");
    const rail = navigation;
    const field = navigation.locator("feImage");
    const activity = page.getByRole("button", { name: labels.activity });
    const baselineCoordinates = await beginTabDrag(page, "open", "activity");
    await moveDragToFraction(page, baselineCoordinates, 0.5);
    const baselineTravel = {
      lens: await readBox(lens),
      rail: await readBox(rail),
      slider: await readBox(slider),
      world: await lens.locator(".v3-navigation-world--lens").evaluate((element) => getComputedStyle(element).transform),
    };
    await page.mouse.up();
    await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
    const staticBeforeTheme = {
      lens: await readBox(lens),
      rail: await readBox(rail),
      slider: await readBox(slider),
      field: await field.getAttribute("href"),
    };

    await page.getByRole("button", { name: "切换到亮色主题" }).click();
    await expect(page.locator(".v3-demo")).toHaveAttribute("data-theme", "light");
    expectBoxesWithinTolerance(await readBox(lens), staticBeforeTheme.lens);
    expectBoxesWithinTolerance(await readBox(rail), staticBeforeTheme.rail);
    expectBoxesWithinTolerance(await readBox(slider), staticBeforeTheme.slider);
    expect(await field.getAttribute("href")).toBe(staticBeforeTheme.field);

    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await expectThemePresentation(page, "light", "light");
    expectBoxesWithinTolerance(await readBox(lens), staticBeforeTheme.lens);
    expectBoxesWithinTolerance(await readBox(rail), staticBeforeTheme.rail);
    expectBoxesWithinTolerance(await readBox(slider), staticBeforeTheme.slider);
    expect(await field.getAttribute("href")).toBe(staticBeforeTheme.field);

    await page.getByRole("button", { name: labels.open }).click();
    await expect(page.getByRole("button", { name: labels.open })).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
    const lightCoordinates = await beginTabDrag(page, "open", "activity");
    await moveDragToFraction(page, lightCoordinates, 0.5);
    expectBoxesWithinTolerance(await readBox(lens), baselineTravel.lens);
    expectBoxesWithinTolerance(await readBox(rail), baselineTravel.rail);
    expectBoxesWithinTolerance(await readBox(slider), baselineTravel.slider);
    await expect(field).toHaveAttribute("href", /data:image\/png;base64,/);
    await expect(lens.locator(".v3-navigation-world--lens")).toHaveCSS("transform", baselineTravel.world);
    await page.mouse.up();
  });

  test("captures light Baseline idle, travel, and market static states", async ({ page }) => {
    await openV3(page);

    const navigation = page.getByRole("navigation", { name: navigationName });
    const lens = navigation.locator(".v3-lens-position");
    const activity = page.getByRole("button", { name: labels.activity });
    const market = page.getByRole("button", { name: labels.market });
    const openToActivity = await beginTabDrag(page, "open", "activity");
    await moveDragToFraction(page, openToActivity, 0.5);
    await expect(page).toHaveScreenshot("v3-light-open-to-activity-mid-drag-full.png", { animations: "disabled" });
    await expect(lens).toHaveScreenshot("v3-light-open-to-activity-mid-drag.png", { animations: "disabled" });
    await moveDragToFraction(page, openToActivity, 1);
    await expect(navigation).toHaveAttribute("data-preview-id", "activity");
    await expect(lens.locator('[data-highlighted="true"] .v3-tab-icon')).toHaveCSS("color", "rgb(16, 24, 32)");
    await expect(page).toHaveScreenshot("v3-light-open-to-activity-target-drag-full.png", { animations: "disabled" });
    await expect(lens).toHaveScreenshot("v3-light-open-to-activity-target-drag.png", { animations: "disabled" });
    await page.mouse.up();
    await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });

    const activityToMarket = await beginTabDrag(page, "activity", "market");
    await moveDragToFraction(page, activityToMarket, 0.5);
    await expect(page).toHaveScreenshot("v3-light-activity-to-market-mid-drag-full.png", { animations: "disabled" });
    await expect(lens).toHaveScreenshot("v3-light-activity-to-market-mid-drag.png", { animations: "disabled" });
    await page.mouse.up();
    await expect(market).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
    await expect(page).toHaveScreenshot("v3-light-market-static-full.png", { animations: "disabled" });
  });

  test("captures the light Edge field with Baseline geometry", async ({ page }) => {
    await openV3(page, "/v3?optics=edge");

    const navigation = page.getByRole("navigation", { name: navigationName });
    const lens = navigation.locator(".v3-lens-position");
    const opticsViewport = lens.locator(".v3-lens-optics-viewport");
    const activity = page.getByRole("button", { name: labels.activity });
    await activity.click();
    await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 2_000 });
    const activityToMarket = await beginTabDrag(page, "activity", "market");
    await moveDragToFraction(page, activityToMarket, 0.5);
    await expect(opticsViewport).toHaveCSS("filter", /url\(/);
    await expect(page).toHaveScreenshot("v3-light-edge-activity-to-market-mid-drag-full.png", { animations: "disabled" });
    await expect(lens).toHaveScreenshot("v3-light-edge-activity-to-market-mid-drag.png", { animations: "disabled" });
    await page.mouse.up();
  });
});
