import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({
  viewport: { width: 1264, height: 948 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

const themeStorageKey = "liquid-lab:v2-theme";
const navigationName = "页面导航";
const labels = {
  home: "主页",
  products: "产品",
  activity: "动态",
  about: "关于",
} as const;

type MenuItem = keyof typeof labels;

async function openV2(page: Page) {
  await page.goto("/v2");
  const root = page.locator(".v2-demo");
  await expect(root).toHaveAttribute("data-theme", /light|dark/);
  await expect(page.getByRole("navigation", { name: navigationName })).toBeVisible();
  await page.waitForFunction(() => {
    const demo = document.querySelector<HTMLElement>(".v2-demo");
    return Boolean(demo) && demo?.dataset.theme === document.documentElement.dataset.v2Theme;
  });
}

function item(page: Page, id: MenuItem) {
  return page.getByRole("button", { name: labels[id], exact: true });
}

async function center(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("V2 menu controls must have measurable boxes.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function dispatchPointer(
  target: Locator,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel" | "lostpointercapture",
  pointerType: "mouse" | "touch" | "pen",
  pointerId: number,
  clientX: number,
  clientY: number,
  isPrimary = true,
  button = 0,
) {
  await target.evaluate((buttonElement, event) => {
    if (!buttonElement.dataset.testPointerCapture) {
      Object.defineProperties(buttonElement, {
        hasPointerCapture: { configurable: true, value: () => true },
        releasePointerCapture: { configurable: true, value: () => undefined },
        setPointerCapture: { configurable: true, value: () => undefined },
      });
      buttonElement.dataset.testPointerCapture = "true";
    }
    buttonElement.dispatchEvent(new PointerEvent(event.type, {
      bubbles: true,
      button: event.button,
      buttons: event.type === "pointerup" || event.type === "pointercancel" ? 0 : 1,
      clientX: event.clientX,
      clientY: event.clientY,
      isPrimary: event.isPrimary,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    }));
  }, { type, pointerType, pointerId, clientX, clientY, isPrimary, button });
}

async function expectSingleCurrent(page: Page, expected: MenuItem) {
  const current = page.locator('.v2-menu-item[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("data-menu-item", expected);
}

async function selectEnhanced(page: Page) {
  const enhanced = page.getByRole("button", { name: "增强折射" });
  await enhanced.click();
  await expect(enhanced).toHaveAttribute("aria-pressed", "true");
}

test("preserves the V2 admin layout, ARIA ownership, controls, and idle visual", async ({ page }) => {
  await openV2(page);
  const root = page.locator(".v2-demo");
  const navigation = page.getByRole("navigation", { name: navigationName });

  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(root).toHaveAttribute("data-sidebar", "expanded");
  await expect(root).toHaveAttribute("data-optics-tier", "baseline");
  await expect(page.getByRole("complementary", { name: "主菜单" })).toBeVisible();
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expect(page.getByRole("button", { name: "折叠菜单" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByLabel("液态玻璃渲染方式")).toBeVisible();
  await expectSingleCurrent(page, "home");
  await expect(page).toHaveScreenshot("v2-light-idle.png", { animations: "disabled" });
});

test("expands and collapses the sidebar without changing the selected page", async ({ page }) => {
  await openV2(page);
  const root = page.locator(".v2-demo");
  const toggle = page.getByRole("button", { name: "折叠菜单" });
  await toggle.click();
  await expect(root).toHaveAttribute("data-sidebar", "collapsed");
  await expect(page.getByRole("button", { name: "展开菜单" })).toHaveAttribute("aria-expanded", "false");
  await expectSingleCurrent(page, "home");
  await page.getByRole("button", { name: "展开菜单" }).click();
  await expect(root).toHaveAttribute("data-sidebar", "expanded");
});

test("uses a transient click lens and commits only after its travel completes", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  await item(page, "products").click();
  await expect(navigation).toHaveAttribute("data-glass-phase", "click");
  await expectSingleCurrent(page, "home");
  await expect(item(page, "products")).toHaveAttribute("aria-current", "page", { timeout: 1_500 });
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
});

test("keeps pointer movement within five pixels out of the drag path and batches a real drag", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  const home = item(page, "home");
  const activity = item(page, "activity");
  const start = await center(home);
  const end = await center(activity);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y + 5);
  await page.mouse.up();
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expect(navigation.locator(".v2-selection-plate")).toHaveCount(0);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, end.y, { steps: 12 });
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await expect(navigation.locator(".v2-selection-plate")).toHaveAttribute("data-phase", "dragging");
  await page.mouse.up();
  await expectSingleCurrent(page, "home");
  await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 1_500 });
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
});

test("shares drag semantics across touch and pen and cancels without a late commit", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  const home = item(page, "home");
  const products = item(page, "products");
  const activity = item(page, "activity");
  const start = await center(home);
  const productPoint = await center(products);
  const activityPoint = await center(activity);

  await dispatchPointer(home, "pointerdown", "touch", 11, start.x, start.y);
  await dispatchPointer(home, "pointermove", "touch", 11, productPoint.x, productPoint.y);
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await dispatchPointer(home, "pointercancel", "touch", 11, productPoint.x, productPoint.y);
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expectSingleCurrent(page, "home");

  await dispatchPointer(home, "pointerdown", "pen", 12, start.x, start.y);
  await dispatchPointer(home, "pointermove", "pen", 12, activityPoint.x, activityPoint.y);
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await dispatchPointer(home, "pointerup", "pen", 12, activityPoint.x, activityPoint.y);
  await expect(activity).toHaveAttribute("aria-current", "page", { timeout: 1_500 });
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
});

test("ignores right clicks and non-primary pointers, and cleans up lost capture", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  const home = item(page, "home");
  const activity = item(page, "activity");
  const start = await center(home);
  const end = await center(activity);

  await dispatchPointer(home, "pointerdown", "mouse", 21, start.x, start.y, true, 2);
  await dispatchPointer(home, "pointermove", "mouse", 21, end.x, end.y, true, 2);
  await dispatchPointer(home, "pointerup", "mouse", 21, end.x, end.y, true, 2);
  await dispatchPointer(home, "pointerdown", "touch", 22, start.x, start.y, false);
  await dispatchPointer(home, "pointermove", "touch", 22, end.x, end.y, false);
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expectSingleCurrent(page, "home");

  await dispatchPointer(home, "pointerdown", "pen", 23, start.x, start.y);
  await dispatchPointer(home, "pointermove", "pen", 23, end.x, end.y);
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await dispatchPointer(home, "lostpointercapture", "pen", 23, end.x, end.y);
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expectSingleCurrent(page, "home");
});

test("cancels an active lens when the viewport or motion preference changes", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  const home = item(page, "home");
  const activity = item(page, "activity");
  const start = await center(home);
  const end = await center(activity);

  await dispatchPointer(home, "pointerdown", "touch", 31, start.x, start.y);
  await dispatchPointer(home, "pointermove", "touch", 31, end.x, end.y);
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await page.setViewportSize({ width: 1220, height: 948 });
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expectSingleCurrent(page, "home");

  const refreshedStart = await center(home);
  const refreshedEnd = await center(activity);
  await dispatchPointer(home, "pointerdown", "pen", 32, refreshedStart.x, refreshedStart.y);
  await dispatchPointer(home, "pointermove", "pen", 32, refreshedEnd.x, refreshedEnd.y);
  await expect(navigation).toHaveAttribute("data-glass-phase", "dragging");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(navigation).toHaveAttribute("data-glass-active", "false");
  await expectSingleCurrent(page, "home");
});

test("keeps baseline and enhanced controls separate and snapshots the enhanced drag", async ({ page }) => {
  await openV2(page);
  const navigation = page.getByRole("navigation", { name: navigationName });
  await expect(page.getByRole("button", { name: "保底" })).toHaveAttribute("aria-pressed", "true");
  await selectEnhanced(page);
  await expect(page.locator(".v2-demo")).toHaveAttribute("data-optics-tier", "enhanced");
  const home = item(page, "home");
  const activity = item(page, "activity");
  const start = await center(home);
  const end = await center(activity);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await expect(navigation.locator(".v2-selection-plate")).toHaveAttribute("data-refraction", "candidate");
  await expect(page).toHaveScreenshot("v2-light-enhanced-drag.png", { animations: "disabled" });
  await page.mouse.up();
});

test("bypasses temporary glass under compact, reduced-motion, and forced-colors media", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openV2(page);
  await item(page, "products").click();
  await expectSingleCurrent(page, "products");
  await expect(page.locator(".v2-selection-plate")).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
  await page.reload();
  await item(page, "products").click();
  await expectSingleCurrent(page, "products");
  await expect(page.locator(".v2-selection-plate")).toHaveCount(0);

  await page.emulateMedia({ forcedColors: "none" });
  await page.setViewportSize({ width: 640, height: 820 });
  await page.reload();
  await item(page, "products").click();
  await expectSingleCurrent(page, "products");
  await expect(page.locator(".v2-selection-plate")).toHaveCount(0);
});

test("falls back to static navigation without Canvas 2D or SVG filter support", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function noCanvas2d(type, ...args) {
      return type === "2d" ? null : nativeGetContext.call(this, type, ...args);
    };
    Object.defineProperties(window, {
      SVGFEImageElement: { configurable: true, value: undefined },
      SVGFEDisplacementMapElement: { configurable: true, value: undefined },
    });
  });
  await openV2(page);
  await selectEnhanced(page);
  await item(page, "products").click();
  await expectSingleCurrent(page, "products");
  await expect(page.locator(".v2-selection-plate")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("persists valid theme choices, resets invalid storage to light, and synchronizes tabs", async ({ context }) => {
  const [source, mirror] = await Promise.all([context.newPage(), context.newPage()]);
  await Promise.all([openV2(source), openV2(mirror)]);
  await source.getByRole("button", { name: "切换到暗色模式" }).click();
  await expect.poll(() => source.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBe("dark");
  await expect(mirror.locator(".v2-demo")).toHaveAttribute("data-theme", "dark");

  await source.evaluate((key) => localStorage.setItem(key, "invalid"), themeStorageKey);
  await expect(mirror.locator(".v2-demo")).toHaveAttribute("data-theme", "light");
  await expect(mirror.locator("html")).toHaveAttribute("data-v2-theme", "light");
  await Promise.all([source.close(), mirror.close()]);
});

test("uses stored dark theme on the first client frame without hydration errors", async ({ page }) => {
  const hydrationMessages: string[] = [];
  page.on("console", (message) => { if (/hydration/i.test(message.text())) hydrationMessages.push(message.text()); });
  await page.addInitScript((key) => localStorage.setItem(key, "dark"), themeStorageKey);
  await openV2(page);
  await expect(page.locator("html")).toHaveAttribute("data-v2-theme", "dark");
  await expect(page.locator(".v2-demo")).toHaveAttribute("data-theme", "dark");
  expect(hydrationMessages).toEqual([]);
  await expect(page).toHaveScreenshot("v2-dark-idle.png", { animations: "disabled" });
});
