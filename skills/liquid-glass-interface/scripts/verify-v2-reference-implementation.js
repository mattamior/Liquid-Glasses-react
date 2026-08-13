import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(skillRoot, "..", "..");
const assetRoot = path.join(skillRoot, "assets/v2-reference-implementation");
const pairs = [
  ["app/v2/layout.tsx", "layout.tsx"],
  ["app/v2/page.tsx", "page.tsx"],
  ["app/v2/lens-optics.ts", "lens-optics.ts"],
  ["app/v2/v2.css", "v2.css"],
];

for (const [source, asset] of pairs) {
  assert.equal(fs.readFileSync(path.join(repositoryRoot, source), "utf8"), fs.readFileSync(path.join(assetRoot, asset), "utf8"), `V2 asset must stay synchronized with ${source}.`);
}

const page = fs.readFileSync(path.join(assetRoot, "page.tsx"), "utf8");
const optics = fs.readFileSync(path.join(assetRoot, "lens-optics.ts"), "utf8");
const css = fs.readFileSync(path.join(assetRoot, "v2.css"), "utf8");
assert.match(page, /const V2_THEME_STORAGE_KEY = "liquid-lab:v2-theme"/);
assert.match(page, /function supportsEnhancedOptics\(\)/);
assert.match(page, /function LiquidCardSurface/);
assert.match(page, /<AmbientScene copy="replica"/);
assert.match(page, /aria-current=\{selectedItemId === item\.id \? "page"/);
assert.match(page, /event\.pointerType === "mouse" && event\.button !== 0/);
assert.match(page, /onPointerDown=.*startDrag/);
assert.match(optics, /V2_CAPSULE_LENS_OPTICS/);
assert.match(optics, /V2_CARD_LENS_OPTICS/);
assert.match(optics, /MAX_ROUNDED_CARD_FIELD_CACHE_ENTRIES = 8/);
assert.match(optics, /createRoundedCardLensField/);
assert.match(css, /@media \(forced-colors: active\)/);
console.log("v2-default assertions passed", { files: pairs.length, source: "app/v2" });
