import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(skillRoot, "..", "..");
const assetRoot = path.join(skillRoot, "assets/v1-fidelity-kit");
const pairs = [
  ["app/v1/layout.tsx", "layout.tsx"],
  ["app/v1/page.tsx", "page.tsx"],
  ["app/v1/v1.css", "v1.css"],
];

for (const [source, asset] of pairs) {
  assert.equal(
    fs.readFileSync(path.join(repositoryRoot, source), "utf8"),
    fs.readFileSync(path.join(assetRoot, asset), "utf8"),
    `V1 asset must stay synchronized with ${source}.`,
  );
}

const page = fs.readFileSync(path.join(assetRoot, "page.tsx"), "utf8");
const css = fs.readFileSync(path.join(assetRoot, "v1.css"), "utf8");
const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
assert.match(page, /function createDisplacementMap\(/);
assert.match(page, /<feDisplacementMap/);
assert.match(page, /function StageArtwork\(/);
assert.match(page, /<RefractedStageSurface/);
assert.match(page, /function GlassFilterDefinition/);
assert.match(page, /setPointerCapture\(event\.pointerId\)/);
assert.match(page, /toolbarMetrics[\s\S]*popoverMetrics/);
assert.match(page, /className="menu-coupling-field"/);
assert.match(page, /new ResizeObserver\(updateSurfaceMetrics\)/);
assert.match(page, /resizeObserver\.disconnect\(\)/);
assert.match(page, /window\.clearTimeout\(motionTimer\)/);
assert.match(page, /themeMode/);
assert.match(css, /\.apple-menu-cluster/);
assert.match(css, /clip-path: inset\(0 round 999px\)/);
assert.match(css, /@media \(max-width: 640px\)/);
assert.match(skill, /`v1-fidelity`/);
console.log("v1-fidelity-kit source-to-asset synchronization assertions passed", { files: pairs.length, source: "app/v1", scope: "skill-published-assets-only" });
