/** Copy into a target Playwright suite after registering LIQUID_GLASS_MANIFEST.
 * This witness deliberately observes stable V1 roles instead of assuming a
 * transient menu animation is visible at an exact instant. */
import { expect, test, type Locator } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Role = { name: string; selector: string };
type Manifest = {
  mode: "v1-fidelity";
  roles: Role[];
  visualApproval: { status: "pending" | "approved" | "rejected" };
};

const manifest = JSON.parse(
  fs.readFileSync(path.resolve(process.env.LIQUID_GLASS_MANIFEST ?? "liquid-glass.integration.json"), "utf8"),
) as Manifest;

function role(name: string) {
  const selector = manifest.roles.find((entry) => entry.name === name)?.selector;
  if (!selector) throw new Error(`Manifest is missing required role: ${name}`);
  return selector;
}

async function dragAndCancel(source: Locator) {
  const box = await source.boundingBox();
  if (!box) throw new Error("Frozen V1 menu is not visible.");
  const clientX = box.x + box.width / 2;
  const clientY = box.y + box.height / 2;
  await source.dispatchEvent("pointerdown", { pointerId: 31, pointerType: "mouse", isPrimary: true, button: 0, clientX, clientY });
  await source.dispatchEvent("pointermove", { pointerId: 31, pointerType: "mouse", isPrimary: true, clientX: clientX + 24, clientY: clientY + 18 });
  await source.dispatchEvent("pointercancel", { pointerId: 31, pointerType: "mouse", isPrimary: true, clientX: clientX + 24, clientY: clientY + 18 });
}

test.beforeEach(async ({ page }) => {
  test.skip(manifest.mode !== "v1-fidelity", "V1-only strict contract");
  await page.goto(process.env.LIQUID_GLASS_V1_URL ?? "/");
});

test("keeps the frozen scene, replica, responsive geometry, and menu cleanup observable", async ({ page }) => {
  await expect(page.locator('[data-liquid-glass-mode="v1-fidelity"]')).toHaveCount(1);
  for (const name of ["fidelity-stage", "fidelity-scene-visible", "fidelity-scene-replica", "fidelity-menu", "fidelity-theme-toggle"]) {
    await expect(page.locator(role(name)).first()).toBeVisible();
  }

  const stage = page.locator(role("fidelity-stage"));
  const visibleScene = page.locator(role("fidelity-scene-visible"));
  const replicaScenes = page.locator(role("fidelity-scene-replica"));
  const replicaScene = replicaScenes.first();
  await expect(replicaScenes).toHaveCount(2);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const scrollY of [0, 300, 900]) {
      await page.evaluate((offset) => window.scrollTo(0, offset), scrollY);
      await expect(stage).toBeVisible();
      await expect(replicaScene).toBeVisible();
    }
  }
  expect((await visibleScene.boundingBox())?.width).toBeGreaterThan(0);
  expect((await replicaScene.boundingBox())?.width).toBeGreaterThan(0);

  await dragAndCancel(page.locator(role("fidelity-menu")));
  await expect(page.locator(role("fidelity-menu"))).toBeVisible();
  await page.locator(role("fidelity-theme-toggle")).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(role("fidelity-theme-toggle"))).toBeFocused();
  expect(["pending", "approved", "rejected"]).toContain(manifest.visualApproval.status);
});
