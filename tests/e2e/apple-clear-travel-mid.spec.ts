import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputPath = path.join(process.cwd(), "output/playwright/apple-clear-travel-mid.png");

test.use({
  viewport: { width: 1264, height: 948 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

test("writes an apple-clear mid-flight travel capsule PNG", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/apple-clear");
  const stage = page.locator(".apple-clear");
  const plate = page.locator(".apple-selection-plate");
  const messagesItem = page.locator('[data-liquid-glass-role="apple-navigation-item"]').nth(2);
  await expect(stage).toBeVisible();
  await expect(page.getByRole("navigation", { name: "菜单" })).toBeVisible();
  await expect(stage).toHaveAttribute("data-optics-tier", "enhanced");
  await page.waitForFunction(() => document.documentElement.dataset.appleClearTheme === "light");
  await expect(plate).toHaveAttribute("data-phase", "idle");
  await expect(messagesItem).toHaveAttribute("aria-label", "信息");

  await messagesItem.click();
  await expect(stage).toHaveAttribute("data-phase", /^(click|dragging|settling)$/);
  await page.waitForTimeout(340);

  const box = await plate.boundingBox();
  if (!box) throw new Error("The traveling selection plate must be measurable.");
  expect(box.height).toBeGreaterThanOrEqual(65);
  expect(box.height).toBeLessThanOrEqual(85);
  expect(box.width).toBeGreaterThan(box.height);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: true });
});
