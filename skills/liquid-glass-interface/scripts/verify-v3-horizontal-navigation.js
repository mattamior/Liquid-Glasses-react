import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(skillRoot, "..", "..");
const assetRoot = path.join(skillRoot, "assets/v3-horizontal-navigation");
const pairs = [
  ["app/v3/layout.tsx", "layout.tsx"],
  ["app/v3/page.tsx", "page.tsx"],
  ["app/v3/lens-optics.ts", "lens-optics.ts"],
  ["app/v3/v3.css", "v3.css"],
];

for (const [source, asset] of pairs) {
  assert.equal(fs.readFileSync(path.join(repositoryRoot, source), "utf8"), fs.readFileSync(path.join(assetRoot, asset), "utf8"), `V3 asset must stay synchronized with ${source}.`);
}

const page = fs.readFileSync(path.join(assetRoot, "page.tsx"), "utf8");
const optics = fs.readFileSync(path.join(assetRoot, "lens-optics.ts"), "utf8");
const css = fs.readFileSync(path.join(assetRoot, "v3.css"), "utf8");
assert.match(page, /const V3_THEME_STORAGE_KEY = "liquid-lab:v3-theme"/);
assert.match(page, /function supportsLensFilter\(\)/);
assert.match(page, /function NavigationWorld/);
assert.match(page, /className="v3-selection-slider"/);
assert.match(page, /className="v3-lens-optics-viewport"/);
assert.match(page, /tabId !== activeIdRef\.current/);
assert.match(page, /const DRAG_THRESHOLD = 5/);
assert.match(page, /const DRAG_SETTLE_DURATION = 260/);
assert.match(page, /prefers-reduced-motion[\s\S]*forced-colors/);
assert.match(page, /aria-current=\{tab\.id === activeId \? "page"/);
assert.match(optics, /export const V3_LENS_OPTICS/);
assert.match(optics, /createEllipticalField/);
assert.match(css, /@media \(forced-colors: active\)/);
assert.doesNotMatch(page + optics + css, /v3-05-failed|M05|dynamicProfile|velocityBucket/);
console.log("v3-horizontal source-to-asset synchronization assertions passed", { files: pairs.length, source: "app/v3 M04", scope: "skill-published-assets-only" });
