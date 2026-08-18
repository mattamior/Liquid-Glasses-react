import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(skillRoot, "..", "..");
const assetRoot = path.join(skillRoot, "assets/strict-kernels/apple");
const pairs = [
  ["app/apple-clear/lens-optics.ts", "lens-optics.ts"],
  ["app/apple-clear/HomeScreenScene.tsx", "HomeScreenScene.tsx"],
  ["app/apple-clear/LiquidMenuBackdrop.tsx", "LiquidMenuBackdrop.tsx"],
  ["app/apple-clear/LiquidMenu.tsx", "LiquidMenu.tsx"],
  ["app/apple-clear/LiquidDropdown.tsx", "LiquidDropdown.tsx"],
  ["app/apple-clear/liquid-dropdown.css", "liquid-dropdown.css"],
  ["app/apple-clear/LiquidContextMenu.tsx", "LiquidContextMenu.tsx"],
  ["app/apple-clear/LiquidSelect.tsx", "LiquidSelect.tsx"],
  ["app/apple-clear/LiquidPopover.tsx", "LiquidPopover.tsx"],
  ["app/apple-clear/LiquidDialog.tsx", "LiquidDialog.tsx"],
  ["app/apple-clear/LiquidMenubar.tsx", "LiquidMenubar.tsx"],
  ["app/apple-clear/liquid-overlays.css", "liquid-overlays.css"],
  ["app/apple-clear/LiquidGlassAppleClearKernel.tsx", "LiquidGlassAppleClearKernel.tsx"],
  ["app/apple-clear/apple-clear.css", "apple-clear.css"],
];

for (const [source, asset] of pairs) {
  assert.equal(
    fs.readFileSync(path.join(repositoryRoot, source), "utf8"),
    fs.readFileSync(path.join(assetRoot, asset), "utf8"),
    `Apple Clear kernel must stay extracted from ${source}.`,
  );
}

assert.equal(fs.existsSync(path.join(assetRoot, "layout.tsx")), false, "Apple kernel extract must not include Next layout.tsx.");
assert.equal(fs.existsSync(path.join(assetRoot, "page.tsx")), false, "Apple kernel extract must not include Next page.tsx.");

const page = fs.readFileSync(path.join(assetRoot, "LiquidGlassAppleClearKernel.tsx"), "utf8");
const css = fs.readFileSync(path.join(assetRoot, "apple-clear.css"), "utf8");
const optics = fs.readFileSync(path.join(assetRoot, "lens-optics.ts"), "utf8");
const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
assert.match(page, /data-liquid-glass-mode="apple-liquid-glass"/);
assert.match(page, /@radix-ui\/react-navigation-menu/);
assert.match(page, /NavigationMenu\.Root/);
assert.match(page, /NavigationMenu\.Link/);
const dropdown = fs.readFileSync(path.join(assetRoot, "LiquidDropdown.tsx"), "utf8");
assert.match(dropdown, /@radix-ui\/react-dropdown-menu/);
assert.match(dropdown, /LiquidMenu/);
assert.match(dropdown, /host="nested"/);
assert.match(page, /config\.host \?\? "standalone"/);
assert.match(page, /host === "nested"/);
assert.match(page, /HomeScreenScene/);
assert.match(page, /LiquidMenuBackdrop/);
assert.match(page, /variant === "lab"/);
assert.match(page, /createClearPanelLensField/);
assert.match(page, /APPLE_SELECTION_LENS_OPTICS/);
assert.match(page, /phase: "click"/);
assert.match(page, /setSupported\(supportsEnhancedOptics\(\)\)/);
assert.doesNotMatch(page, /from ["']next["']/);
assert.match(optics, /APPLE_SELECTION_LENS_OPTICS/);
assert.match(optics, /minimumZoom: 1\.12/);
assert.match(css, /apple-selection-plate/);
assert.match(css, /--apple-clear-blur: 10px/);
assert.match(css, /--apple-menu-size-idle: 14px/);
assert.match(css, /--apple-menu-size-active: 20px/);
assert.match(css, /--apple-menu-radius: 28px/);
assert.match(css, /--apple-plate-radius: 20px/);
assert.match(css, /--apple-spring: cubic-bezier\(\.22, 1\.48, \.28, 1\)/);
assert.match(page, /data-lens-spring=\{lensSpring\}/);
assert.match(page, /setLensSpring\("pressed"\)/);
assert.match(page, /setLensSpring\("stretch"\)/);
assert.match(optics, /radiusCssPx: 28/);
assert.doesNotMatch(
  css.match(/apple-selection-plate\[data-phase="click"\][\s\S]*?apple-selection-plate\[data-phase="idle"\]/)?.[0] ?? "",
  /border-radius:\s*32px/,
);
assert.match(css, /--apple-plate-inset: 8px/);
assert.match(css, /--apple-plate-inset: -6px/);
assert.match(css, /overflow: visible/);
assert.match(css, /\.apple-menu-visual--lens \.apple-menu-visual__label/);
assert.match(css, /\.apple-menu-visual__label/);
assert.match(css, /transform-origin: center/);
assert.match(page, /apple-menu-visual__label/);
assert.match(
  css,
  /apple-menu-visual--lens[\s\S]*?--apple-travel-y-nudge/,
  "Lens labels must subtract travel Y nudge so the active word stays on the item rail.",
);
assert.doesNotMatch(css, /v2-ambient-orb/);
assert.match(skill, /`apple-liquid-glass`/);

const replicaUntilFill = page.match(
  /apple-selection-plate__replica[\s\S]*?apple-selection-plate__fill/,
);
assert.ok(replicaUntilFill, "Selection replica must precede the plate fill.");
assert.doesNotMatch(
  replicaUntilFill[0],
  /apple-menu-visual--lens/,
  "Traveling-lens labels must sit outside the feDisplacementMap replica.",
);
assert.match(page, /apple-menu-visual apple-menu-visual--lens/);
console.log("apple-liquid-glass source-to-kernel extraction assertions passed", {
  files: pairs.length,
  source: "app/apple-clear",
});
