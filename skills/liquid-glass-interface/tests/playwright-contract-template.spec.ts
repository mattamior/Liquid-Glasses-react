/** Copy into a target Playwright suite. This is an executable strict-contract
 * witness: keep LIQUID_GLASS_MANIFEST and its route URL in the target config. */
import { expect, test, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Role = { name: string; selector: string };
type Manifest = {
  mode: "v1-fidelity" | "v2-default" | "v3-horizontal";
  conformanceRoute?: { path: string };
  roles: Role[];
  visualApproval: { status: "pending" | "approved" | "rejected" };
};
const manifest = JSON.parse(fs.readFileSync(path.resolve(process.env.LIQUID_GLASS_MANIFEST ?? "liquid-glass.integration.json"), "utf8")) as Manifest;
const conformanceUrl = process.env.LIQUID_GLASS_CONFORMANCE_URL ?? "/__liquid-glass-conformance";

function role(name: string) {
  const selector = manifest.roles.find((entry) => entry.name === name)?.selector;
  if (!selector) throw new Error(`Manifest is missing required role: ${name}`);
  return selector;
}
function root(page: Page) { return page.locator(`[data-liquid-glass-mode="${manifest.mode}"]`); }
function phaseRoot(page: Page) { return root(page); }
function navItems(page: Page, mode: "v2" | "v3") { return page.locator(role(`${mode}-navigation-item`)); }
function currentItem(page: Page, mode: "v2" | "v3") { return page.locator(`${role(`${mode}-navigation-item`)}[aria-current="page"]`); }
async function expectPhase(page: Page, phase: string | RegExp) { await expect(phaseRoot(page)).toHaveAttribute("data-phase", phase); }
function isTransientRole(name: string) {
  return ["v2-selection-lens", "v2-selection-replica", "v3-selection-lens", "v3-selection-replica", "v3-selection-world"].includes(name);
}
async function expectDeterministicScene(page: Page, mode: "v2" | "v3") {
  const wrapper = page.locator(role(`${mode}-controlled-scene`));
  await expect(wrapper).toHaveCount(1);
  await expectDeterministicSceneCopy(wrapper, "visible");
}
async function expectDeterministicSceneCopy(scope: Locator, copy: "visible" | "replica") {
  const renderer = scope.locator(`[data-liquid-glass-controlled-scene="deterministic"][data-liquid-glass-scene-copy="${copy}"]`);
  await expect(renderer).toHaveCount(1);
  await expect(renderer).toBeVisible();
  for (const layer of ["grid", "type", "color-bands"]) await expect(renderer.locator(`[data-liquid-glass-scene-layer="${layer}"]`)).toBeVisible();
}
async function expectOpticalSceneCopy(page: Page, roleName: "v2-selection-replica" | "v3-selection-replica") {
  const replica = page.locator(role(roleName));
  await expect(replica).toHaveCount(1);
  await expect(replica).toBeVisible();
  await expectDeterministicSceneCopy(replica, "replica");
}
async function pointer(source: Locator, type: "mouse" | "touch" | "pen", delta: { x: number; y: number }, end: "up" | "cancel" = "up") {
  const box = await source.boundingBox();
  if (!box) throw new Error("Pointer source is invisible.");
  const pointerId = type === "mouse" ? 11 : type === "touch" ? 12 : 13;
  const clientX = box.x + box.width / 2;
  const clientY = box.y + box.height / 2;
  await source.dispatchEvent("pointerdown", { pointerId, pointerType: type, isPrimary: true, button: 0, clientX, clientY });
  await source.dispatchEvent("pointermove", { pointerId, pointerType: type, isPrimary: true, clientX: clientX + delta.x, clientY: clientY + delta.y });
  await source.dispatchEvent(end === "cancel" ? "pointercancel" : "pointerup", { pointerId, pointerType: type, isPrimary: true, clientX: clientX + delta.x, clientY: clientY + delta.y });
}
async function expectDelayedCommit(page: Page, mode: "v2" | "v3", target: Locator, expectTransientOptics: () => Promise<void>) {
  const before = await currentItem(page, mode).getAttribute("data-item-id");
  const next = await target.getAttribute("data-item-id");
  await target.click();
  await expectPhase(page, /^(click|primed|expanding|travelling|settling|fading)$/);
  await expectTransientOptics();
  await expect(currentItem(page, mode)).toHaveAttribute("data-item-id", before ?? "");
  if (mode === "v2") await expect(page.locator(`${role("v2-navigation-item")}[data-preview="true"]`)).toHaveAttribute("data-item-id", next ?? "");
  else await expect(phaseRoot(page)).toHaveAttribute("data-preview-id", next ?? "");
  await expectPhase(page, "idle");
  await expect(currentItem(page, mode)).toHaveAttribute("data-item-id", next ?? "");
  await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
}

test.beforeEach(async ({ page }) => {
  test.skip(manifest.mode !== "v1-fidelity" && !manifest.conformanceRoute, "Strict V2/V3 require a registered conformance route.");
  await page.goto(manifest.mode === "v1-fidelity" ? "/" : conformanceUrl);
});

test("renders every manifest role and leaves visual approval explicit", async ({ page }) => {
  for (const item of manifest.roles) {
    if (!isTransientRole(item.name)) await expect(page.locator(item.selector).first()).toBeVisible();
  }
  expect(["pending", "approved", "rejected"]).toContain(manifest.visualApproval.status);
});

test.describe("V1 frozen fidelity", () => {
  test.skip(manifest.mode !== "v1-fidelity", "V1-only strict contract");
  test("keeps scene replica aligned through desktop, narrow layout, scroll, drag, theme, and reload cleanup", async ({ page }) => {
    const stage = page.locator(role("fidelity-stage"));
    const visible = page.locator(role("fidelity-scene-visible"));
    const replica = page.locator(role("fidelity-scene-replica"));
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await expect(stage).toBeVisible();
      for (const scrollY of [0, 300, 900]) { await page.evaluate((value) => scrollTo(0, value), scrollY); await expect(replica).toBeVisible(); }
    }
    expect((await visible.boundingBox())?.width).toBeGreaterThan(0);
    expect((await replica.boundingBox())?.width).toBeGreaterThan(0);
    await pointer(page.locator(role("fidelity-menu")), "mouse", { x: 18, y: 18 });
    await page.locator(role("fidelity-theme-toggle")).focus();
    await page.keyboard.press("Enter");
    await page.reload();
    await expect(stage).toBeVisible();
  });
});

test.describe("V2 strict selection lens", () => {
  test.skip(manifest.mode !== "v2-default", "V2-only strict contract");
  test("proves Enhanced controlled optics and delayed aria-current commit", async ({ page }) => {
    await expect(root(page)).toHaveAttribute("data-optics-tier", "enhanced");
    await expectDeterministicScene(page, "v2");
    await expect(page.locator(role("v2-selection-lens"))).toHaveCount(0);
    await expect(page.locator(`${role("v2-optical-card")}[data-card-optical-layers="replica fill edge"]`)).toHaveCount(await page.locator(role("v2-optical-card")).count());
    const items = navItems(page, "v2");
    expect(await items.count()).toBeGreaterThanOrEqual(2);
    await expectDelayedCommit(page, "v2", items.nth(1), async () => {
      await expect(page.locator(role("v2-selection-lens"))).toHaveCount(1);
      await expect(page.locator(role("v2-selection-lens"))).toBeVisible();
      await expectOpticalSceneCopy(page, "v2-selection-replica");
    });
    await expect(page.locator(role("v2-selection-lens"))).toHaveCount(0);
  });
  test("enforces >5px primary pointer release and cancel semantics", async ({ page }) => {
    for (const type of ["mouse", "touch", "pen"] as const) {
      await page.goto(conformanceUrl);
      const source = currentItem(page, "v2");
      const selected = await source.getAttribute("data-item-id");
      const firstId = await navItems(page, "v2").first().getAttribute("data-item-id");
      const target = selected === firstId ? navItems(page, "v2").nth(1) : navItems(page, "v2").first();
      const targetId = await target.getAttribute("data-item-id");
      const direction = selected === firstId ? 100 : -100;
      await pointer(source, type, { x: 0, y: 5 });
      await expectPhase(page, "idle");
      await pointer(source, type, { x: 0, y: direction });
      await expectPhase(page, "settling");
      await expect(currentItem(page, "v2")).toHaveAttribute("data-item-id", selected ?? "");
      await expectPhase(page, "idle");
      await expect(currentItem(page, "v2")).toHaveAttribute("data-item-id", targetId ?? "");
    }
    const selected = await currentItem(page, "v2").getAttribute("data-item-id");
    await pointer(currentItem(page, "v2"), "mouse", { x: 0, y: 100 }, "cancel");
    await expectPhase(page, "idle");
    await expect(currentItem(page, "v2")).toHaveAttribute("data-item-id", selected ?? "");
  });
  test("keeps reduced-motion and forced-colors baseline navigation usable without transient optics", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
    await page.goto(conformanceUrl);
    await expect(page.locator(role("v2-navigation"))).toBeVisible();
    await expect(page.locator(role("v2-selection-lens"))).toHaveCount(0);
    const items = navItems(page, "v2");
    const next = await items.nth(1).getAttribute("data-item-id");
    await items.nth(1).click();
    await expectPhase(page, "idle");
    await expect(currentItem(page, "v2")).toHaveAttribute("data-item-id", next ?? "");
  });
});

test.describe("V3 strict travelling lens", () => {
  test.skip(manifest.mode !== "v3-horizontal", "V3-only strict contract");
  test("proves Edge world/replica optics and delayed preview-to-commit", async ({ page }) => {
    await expect(root(page)).toHaveAttribute("data-optics-tier", "edge");
    await expectDeterministicScene(page, "v3");
    await expect(page.locator(role("v3-selection-slider"))).toHaveCount(1);
    await expect(page.locator(role("v3-selection-lens"))).toHaveCount(1);
    const tabs = navItems(page, "v3");
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
    await expectDelayedCommit(page, "v3", tabs.nth(1), async () => {
      await expect(page.locator(role("v3-selection-lens"))).toHaveCount(1);
      await expect(page.locator(role("v3-selection-lens"))).toBeVisible();
      await expectOpticalSceneCopy(page, "v3-selection-replica");
      await expect(page.locator(role("v3-selection-world"))).toBeVisible();
    });
  });
  test("rejects non-current/5px drags, settles >5px for 260ms, and rolls back cancellation", async ({ page }) => {
    const tabs = navItems(page, "v3");
    const current = currentItem(page, "v3");
    const selected = await current.getAttribute("data-item-id");
    await pointer(tabs.nth(1), "mouse", { x: 20, y: 0 });
    await expectPhase(page, "idle");
    await pointer(current, "mouse", { x: 5, y: 0 });
    await expectPhase(page, "idle");
    await pointer(current, "touch", { x: 20, y: 0 }, "cancel");
    await expectPhase(page, "idle");
    await expect(currentItem(page, "v3")).toHaveAttribute("data-item-id", selected ?? "");
    await page.clock.install();
    const box = await currentItem(page, "v3").boundingBox();
    if (!box) throw new Error("Current V3 tab is invisible.");
    await pointer(currentItem(page, "v3"), "pen", { x: box.width, y: 0 });
    await expectPhase(page, "drag-settling");
    await expect(page.locator(role("v3-selection-slider"))).toHaveCount(1);
    await expect(page.locator(role("v3-selection-lens"))).toHaveCount(1);
    await page.clock.fastForward(259);
    await expect(currentItem(page, "v3")).toHaveAttribute("data-item-id", selected ?? "");
    await expectPhase(page, "drag-settling");
    await page.clock.fastForward(1);
    await expectPhase(page, "idle");
    await expect(currentItem(page, "v3")).not.toHaveAttribute("data-item-id", selected ?? "");
  });
  test("keeps reduced-motion and forced-colors fallback navigation usable without asserting lens optics", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
    await page.goto(conformanceUrl);
    await expect(page.locator(role("v3-navigation"))).toBeVisible();
    const tabs = navItems(page, "v3");
    const next = await tabs.nth(1).getAttribute("data-item-id");
    await tabs.nth(1).click();
    await expectPhase(page, "idle");
    await expect(currentItem(page, "v3")).toHaveAttribute("data-item-id", next ?? "");
  });
});
