# V3 Horizontal Navigation Lens Decision Record（横向导航透镜决策记录）

Status: released（已发布）<br>
Recorded: 2026-08-07<br>
Implementation commit: [`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)

## Scope and Decision

Keep V3 as an independent horizontal navigation-lens study. The base, static
selection, and temporary lens visuals now have exclusive visual ownership
（独占视觉所有权）. A direct drag shows the same glass lens as a click, follows
the primary pointer continuously after the `5px` threshold, and snaps to the
nearest tab only on release. The semantic active tab and `aria-current` remain
committed only after a click travel or drag settle completes.

On 2026-08-07, adopt the user-supplied Longbridge screenshot set as the V3
visual-reference baseline（视觉参考基准） for future fidelity（保真） work. The set is
stored at [`docs/references/v3-longbridge`](../references/v3-longbridge/) with
a bilingual manifest（双语清单）. It guides visual review only; it does not
change the released interaction, semantic, accessibility, or test contracts.

## Delivered Result and Changed Areas

- [`/v3`](../../app/v3/page.tsx) exposes explicit base, selection, and lens
  visual-layer markers. The base hides the committed tab only while the static
  selection is visible; the selection is hidden for every active lens phase.
  Opaque visual occlusion（遮挡） prevents gray and white text copies from
  showing through one another.
- Pointer Events now accept only primary input and mouse left-click starts.
  Drag positions are coalesced（合并） to one animation frame, clamped to the
  navigation rail, and guarded by window-level release/cancel fallback. Small
  movements keep ordinary click behavior; cancellation, hidden-page, reduced-
  motion, and resize paths restore the committed selection.
- [`app/v3/v3.css`](../../app/v3/v3.css) keeps the static slider separate from
  the dragging and settling lens, retaining the local V3 coordinate system
  (`top: 0`) and the existing thick-glass material.
- Edge optics keeps the `1.18` lens-copy scale but replaces full-lens zoom and
  high-amplitude displacement with a continuous `15px` edge band, `4.5px`
  maximum normal refraction（法线折射）, and `1.04` maximum local zoom. The SVG
  field, filter region, and `224 × 184` local viewport now use explicit,
  matching coordinates. Baseline remains filter-free.
- [`playwright.config.ts`](../../playwright.config.ts) and
  [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) add headless Chromium
  regression coverage; [`package.json`](../../package.json) adds `test:e2e`
  and `test:all`. The Edge drag screenshot is the visual regression baseline
  （视觉回归基线）.
- [`docs/references/v3-longbridge`](../references/v3-longbridge/) now contains
  the nine original-filename JPEG reference copies and structurally equivalent
  Chinese and English indexes. Each entry records its `1264 × 948` dimensions,
  SHA-256 digest, captured state, and visual purpose.

## Verification Evidence

- `npx eslint app/v3/page.tsx tests/e2e/v3.spec.ts playwright.config.ts`
  passed.
- `npm test` passed: build completed and 5/5 SSR HTML tests passed.
- `npm run test:e2e` passed: 6/6 headless Chromium tests covered initial
  single-layer selection, click-transition slider suppression, pointer-follow
  drag and delayed commit, small-movement/right-click rejection, touch-cancel
  recovery, pen-drag commit, and Edge optics screenshot comparison.
- The Edge drag baseline screenshot was inspected locally: centered text stays
  intact and only the rim has a restrained continuous refraction effect.
- Headless Firefox and Playwright WebKit Edge-drag smoke checks both activated
  the local filter with zero console or page errors. Their stable screenshots
  retained complete Chinese labels without a duplicate selection layer.
- Public verification of [`https://liquid.hkooii.com/v3?optics=edge`](https://liquid.hkooii.com/v3?optics=edge)
  returned HTTP 200. At `1365 × 769`, a real Edge drag showed the lens, hid the
  static slider, kept the original selection until release, committed Market
  after settling, applied the local filter, and emitted zero console errors.
- Generated `output/**` fixtures are excluded from the repository lint surface.
  The V1 `react-hooks/set-state-in-effect` finding has a documented source-line
  suppression and must be resolved with the next V1 source change. The V3 files
  and new Playwright files pass their scoped lint command.
- The Longbridge reference copies were compared with the user-provided source
  directory by filename, dimensions, and SHA-256 digest. The bilingual indexes
  have the same nine-entry state mapping.
- Reference-only verification passed with `cmp -s`, `shasum -a 256`, and
  `sips -g pixelWidth -g pixelHeight` for all nine files; `git diff --check`
  also passed. No runtime test or Playwright screenshot baseline was changed.

## Release Status

The V3 implementation was pushed from commit
[`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)
and released as Worker version `35abc13a-02a5-4637-801f-f2e90350483a`.
Deployment used the generated `dist/server/wrangler.json` and `--keep-vars`;
no bindings, variables, secrets, quotas, or production configuration changed.

The 2026-08-07 screenshot-reference batch did not modify runtime code,
Playwright snapshots, deployment configuration, or the published Worker. It
creates no new release.

## Known Limits and Follow-Up

- Chromium has full regression coverage; Firefox and Playwright WebKit have
  headless Edge-drag smoke evidence. Validate the native Safari application in
  a future release, because SVG `feDisplacementMap` behavior and performance may
  still differ from Playwright WebKit.
- Touch cancellation and pen commit have synthetic Pointer Events coverage, but
  still need physical-device confirmation.
- Playwright browsers are installed separately with
  `npx playwright install chromium`; browser binaries are not committed.
- Future V3 visual-fidelity changes must review the complete Longbridge set.
  Static screenshots are not evidence for exact timing, filter parameters, or
  accessible interaction behavior; validate those changes independently.
- Keep this record and the README updated after each completed work batch.
