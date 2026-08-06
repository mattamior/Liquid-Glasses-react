"use strict";

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const constants = { zoomMinimum: 1.03, zoomMaximum: 1.12, edgeZone: 16, edgeExponent: 2.7, edgeRefraction: 5.4, fieldScale: 42, resolution: 2 };
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
const smoothstep = (edge0, edge1, value) => { const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1); return normalized * normalized * (3 - 2 * normalized); };
const zoomAtDistance = (distance) => constants.zoomMinimum + (constants.zoomMaximum - constants.zoomMinimum) * Math.pow(1 - smoothstep(0, constants.edgeZone, distance), constants.edgeExponent);
const refractionAtDistance = (distance) => smoothstep(0, 1.25, distance) * Math.pow(1 - smoothstep(0, constants.edgeZone, distance), constants.edgeExponent) * constants.edgeRefraction;
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markup = fs.readFileSync(path.join(skillRoot, "assets/v2-reference-implementation/index.html"), "utf8");
const source = fs.readFileSync(path.join(skillRoot, "assets/v2-reference-implementation/script.js"), "utf8");
const styles = fs.readFileSync(path.join(skillRoot, "assets/v2-reference-implementation/styles.css"), "utf8");

assert.equal(constants.resolution, 2, "Field resolution must be 2×.");
assert.equal(zoomAtDistance(16), constants.zoomMinimum, "The stable core must begin at 1.03.");
assert.equal(zoomAtDistance(0), constants.zoomMaximum, "The contour must reach 1.12.");
const zoomSamples = [16, 12, 8, 4, 0].map(zoomAtDistance);
for (let index = 1; index < zoomSamples.length; index += 1) assert.ok(zoomSamples[index] > zoomSamples[index - 1], "Zoom must increase continuously toward the contour.");
assert.equal(refractionAtDistance(0), 0, "Refraction must return to zero exactly at the outer contour.");
assert.equal(refractionAtDistance(16), 0, "Refraction must return to zero at the stable-core boundary.");
assert.ok(refractionAtDistance(4) > refractionAtDistance(12), "Refraction must peak inside the edge band rather than form a hard ring.");
assert.match(source, /canvas\.width = safeWidth \* LENS\.resolution[\s\S]*canvas\.height = safeHeight \* LENS\.resolution/);
assert.match(source, /zoomOffsetX \+ normalX \* refractionStrength[\s\S]*zoomOffsetY \+ normalY \* refractionStrength/);
assert.equal((markup.match(/<feDisplacementMap\b/g) ?? []).length, 1, "Use one displacement sample.");
assert.equal((source.match(/menu-world--lens/g) ?? []).length, 1, "Render one lens world.");
assert.doesNotMatch(source, /edge-optics|core-optics|stable.*edge/i, "Do not restore layered core or edge replicas.");
assert.match(styles, /body\[data-mode="baseline"\] \.lens-filter-window \{ filter: none; transform: scale\(1\.03\)/);
assert.match(source, /prefers-reduced-motion[\s\S]*forced-colors/);
console.log("v2 continuous lens assertions passed", { constants, zoomSamples, refractionAtFour: refractionAtDistance(4) });
