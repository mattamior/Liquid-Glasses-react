# V3 Reference-Calibrated Liquid Glass Lens

Date: 2026-08-07

## Scope and Decision

This record calibrates the source implementation of `/v3` against the complete
`v3-reference-baseline` frame. It does not rewrite the historical
[`v3-horizontal-navigation-lens`](./v3-horizontal-navigation-lens.en.md)
record.

- `/v3` defaults to the calibrated Baseline mode. Server-rendered HTML remains
  `data-optics="baseline"`; the Canvas-generated displacement field is created
  only after hydration（客户端接管）.
- The temporary lens remains visible only through click travel and pointer drag.
  Idle returns to the static selection slider. The LensPhase state machine,
  Pointer Events, keyboard/ARIA behavior, reduced-motion path, and
  `aria-hidden` lens visual layer are retained.
- Baseline now applies a complete, restrained elliptical convex field while the
  lens is active. This follows the user decision even though an earlier
  reference-only interpretation suggested a filter-free Baseline. Edge keeps
  the same frame geometry and raises only edge refraction by 14% for comparison.
- The reviewed reference frames remain review material only and are not added to
  the runtime bundle. No dependency was added.

## Delivered Result and Changed Areas

- [`app/v3/page.tsx`](../../app/v3/page.tsx) defines maintainable reference
  constants for a `872 × 210` rail, `296 × 242` lens, `20px` edge band, `36px`
  filter padding, `1.45` content copy scale, and a `1.14` Edge rim multiplier.
  A full Baseline field reaches the calibrated `18–26px` displacement range
  through its central convex bulge, then falls off smoothly at the ellipse edge.
- At `1264 × 948`, [`app/v3/v3.css`](../../app/v3/v3.css) locks the dock to
  `1124 × 210` at `47px` from the bottom: an `872 × 210` rail, a `42px` gap,
  and a `210 × 210` sparkle control. The lens is vertically centered on the
  rail and deliberately extends about `16–17px` above and below it; the static
  slider is `210 × 182`.
- Compact dimensions derive from the live rail ratio, not `transform: scale`.
  Lens dimensions, drag clamp, filter viewport, filter padding, and center
  transform use the same dimensions. The local coordinate anchor remains
  `top: 0`.
- The lens material uses a neutral `0.91` dark-gray body, `1.5px` cool-gray
  rim, `7px` inner dark ring, upper-left highlight, lower-right soft shadow,
  and `100 × 26` top/bottom caustics offset by `-6px`. It avoids an all-around
  cyan-purple glow.
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) fixes the V3 viewport to
  `1264 × 948`, asserts the reference geometry, verifies filters during active
  Baseline and Edge drags, keeps idle lens-hidden semantics, and covers reduced
  motion. Chromium snapshots now include
  `v3-baseline-drag-chromium-darwin.png` and
  `v3-edge-drag-chromium-darwin.png`.
- [`README.md`](../../README.md), [`README.en.md`](../../README.en.md), and
  [`README.zh.md`](../../README.zh.md) describe the current public behavior and
  link this bilingual decision record.

## Verification Evidence

- `npx eslint app/v3/page.tsx tests/e2e/v3.spec.ts` passed.
- `npm test` passed: `vinext build` completed and 5/5 server-rendered HTML
  tests passed.
- `npx playwright test tests/e2e/v3.spec.ts --update-snapshots` passed: 7/7
  headless Chromium tests passed and wrote the Baseline drag snapshot while
  regenerating the Edge drag snapshot.
- `npm run test:e2e` passed: 7/7 headless Chromium tests passed, including the
  `1264 × 948` geometry assertion, active Baseline and Edge filter assertions,
  idle hidden-lens behavior, click travel, mouse/touch/pen drag handling, and
  reduced-motion selection.
- `npm run test:all` passed: the build, 5/5 server-rendered HTML tests, full
  ESLint, and 7/7 headless Chromium E2E tests all passed; `git diff --check`
  passed.
- `npx wrangler deploy --config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --dry-run`
  passed. The same command without `--dry-run` deployed version
  `5785df5f-f296-43d3-ad31-73e45bbc6bc9`.
- Public verification（公开验证）: `https://liquid.hkooii.com/v3` returned HTTPS
  200. A headless browser verified the `296 × 242` lens, `872 × 210` rail,
  hidden static slider, and applied SVG filter during a Baseline drag; the
  console had no errors or warnings, and the public Edge control switched.

## Deployment / Release Status

The verified build is deployed to the existing Cloudflare Worker
`liquid-lab-optics-demo` as version `5785df5f-f296-43d3-ad31-73e45bbc6bc9` and
is publicly available at `https://liquid.hkooii.com/v3`. The deployment used
`--keep-vars`; it did not change production bindings, variables, secrets, or
quotas. Calibration commit `a4be49a` was pushed to `origin/main`.

## Known Limits and Follow-Up

- The visual regression snapshots are Chromium-darwin baselines. Do not use
  them as cross-browser pixel baselines; validate native Safari before a future
  release because SVG `feDisplacementMap` behavior and performance can differ.
- The field is generated after hydration, so the server output intentionally
  contains no displacement image. The active lens receives its filter after the
  client field is ready.
- Reference geometry and material are calibrated from review frames. Future
  changes should re-check transition frames, physical touch hardware, and narrow
  layouts rather than infer timing or optical strength from one static image.
