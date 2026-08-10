# V3 Intermediate Meniscus Calibration Record（中间弯月面校准记录）

Date: 2026-08-07

> **Historical intermediate record（历史中间记录）**
>
> This record preserves the reference-calibration iteration immediately before continuous world sampling（连续世界取样）. Its CSS `scale(1.45)` label replica（标签副本）, `24px` / `11px` meniscus（弯月面）, and double elliptical masks（双椭圆掩膜） are historical values, not the current implementation. They were not reverified in the continuous-world-sampling batch.
>
> See the earlier [reference calibration record（参考校准记录）](./v3-reference-calibration.en.md) and the current [continuous world sampling decision（连续世界取样决策）](./v3-continuous-world-sampling.en.md).

## Scope and Decision

This record covers the local `/v3` refinement against the complete Longbridge
reference set. It supplements, rather than rewrites, the earlier reference
calibration record.

- The `296 × 242` temporary lens, `872 × 210` rail, LensPhase state machine,
  Pointer Events, ARIA behavior, static-slider ownership, and reduced-motion
  path remained unchanged.
- Baseline and Edge sampled inward along the elliptical normal（椭圆法线） in a
  continuous `24px` meniscus band. Baseline reached `11px` at the contour;
  Edge retained the geometry with a 1.14 multiplier (`12.54px`). The central
  convex field overlapped the edge band smoothly to avoid a ring discontinuity（环形断层）.
- The historical material added neutral, masked meniscus highlights and an
  adjacent dark return band. It was direction-independent and used no colored
  glow, WebGL, runtime image, or new dependency.
- The nine Longbridge images remained visual-review material only; none entered
  the runtime bundle or a pixel-by-pixel automated baseline.

## Delivered Result and Changed Areas

- [`app/v3/page.tsx`](../../app/v3/page.tsx) replaced the earlier outward
  `20px` edge field with a `24px`, inward `11px` Baseline meniscus field. Edge
  changed only the field strength at 1.14; `36px` filter padding, the CSS
  `scale(1.45)` content replica, and reference geometry were retained.
- [`app/v3/v3.css`](../../app/v3/v3.css) added separate elliptical masks（椭圆掩膜）
  for the cool-gray gathering band and inner dark return. The rim, dark ring,
  top/bottom caustics, and sheen were reduced to read as one droplet surface.
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) recorded Baseline
  Open→Activity midpoint and target frames, Activity→Market start and midpoint
  frames, and the matching Edge midpoint. The two generic drag snapshots were
  replaced by these named transition snapshots.
- [`README.md`](../../README.md), [`README.en.md`](../../README.en.md), and
  [`README.zh.md`](../../README.zh.md) described this historical inward-meniscus
  behavior and its then-published demo.

## Verification Evidence

- `npx playwright test tests/e2e/v3.spec.ts --update-snapshots` historically
  passed: 8/8 headless Chromium tests wrote five named meniscus snapshots.
- `npm run test:all` historically passed: `vinext build`, 5/5 server-rendered
  HTML tests, full ESLint, and 8/8 headless Chromium E2E tests passed.
- `git diff --check` historically passed.
- The full nine-image Longbridge set was reviewed. Moving frames `144645`,
  `144654`, `144724`, and `144732` guided acceptance: labels and glyphs
  compressed and bent inside the contour instead of only sitting behind a
  brighter circular border.

## Deployment / Release Status

The historical verified build deployed to Cloudflare Worker
`liquid-lab-optics-demo` as version `98d48f5b-85be-4a21-9bba-f7c756a7a304`,
using generated `dist/server/wrangler.json` and `--keep-vars`. No binding,
variable, secret, or quota changed, and that batch was not pushed.

Historical public verification at
[`https://liquid.hkooii.com/v3?optics=edge`](https://liquid.hkooii.com/v3?optics=edge)
reported HTTPS 200. A headless mouse drag entered `dragging`, showed the lens,
hid the static slider, applied the local SVG filter, committed a destination on
release, and reported zero errors and warnings.

## Known Limits and Follow-Up

- Chromium-darwin snapshots guard the reviewed transition positions, not
  cross-browser pixels. Validate native Safari before release because SVG
  `feDisplacementMap` and CSS masks can differ in rendering and performance.
- The displacement field was created after hydration（客户端接管）, so server-rendered
  HTML intentionally contained no displacement image.
- The supplied images establish captured appearance, not exact timing, filter
  values, or shader behavior. Future work should review all nine frames and
  confirm real touch hardware.
