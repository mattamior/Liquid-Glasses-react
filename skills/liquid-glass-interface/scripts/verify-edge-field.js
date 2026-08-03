"use strict";

// Browser-free numerical equivalent of the reference page's edge-field assertions.
const neutral = 128;
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
const smoothstep = (edge0, edge1, value) => { const t = clamp((value - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); };
const distance = (x, y, halfWidth, halfHeight, radius) => { const ax = Math.abs(x) - halfWidth + radius; const ay = Math.abs(y) - halfHeight + radius; return Math.min(Math.max(ax, ay), 0) + Math.hypot(Math.max(ax, 0), Math.max(ay, 0)) - radius; };
const pixel = (x, y, width = 320, height = 220, radius = 54, edgeBand = 32, strength = 108) => {
  const hw = width / 2 - 1; const hh = height / 2 - 1; const lx = x - width / 2; const ly = y - height / 2; const r = Math.min(radius, hw, hh); const d = distance(lx, ly, hw, hh, r); const sample = .75;
  const gx = distance(lx + sample, ly, hw, hh, r) - distance(lx - sample, ly, hw, hh, r); const gy = distance(lx, ly + sample, hw, hh, r) - distance(lx, ly - sample, hw, hh, r); const length = Math.hypot(gx, gy) || 1; const amount = d <= 0 ? 1 - smoothstep(0, edgeBand, -d) : 0;
  return { red: Math.round(clamp(neutral + gx / length * amount * strength, 0, 255)), green: Math.round(clamp(neutral + gy / length * amount * strength, 0, 255)) };
};
const center = pixel(160, 110); const left = pixel(1, 110); const top = pixel(160, 1); const corner = pixel(22, 22);
if (center.red !== neutral || center.green !== neutral || left.red >= neutral || Math.abs(left.green - neutral) > 2 || top.green >= neutral || Math.abs(top.red - neutral) > 2 || corner.red >= neutral || corner.green >= neutral) throw new Error(JSON.stringify({ center, left, top, corner }));
console.log("edge field assertions passed", { center, left, top, corner });
