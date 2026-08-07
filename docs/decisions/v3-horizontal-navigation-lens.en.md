# V3 Horizontal Navigation Lens Decision Record（横向导航透镜决策记录）

Status: locally verified; release pending（本地验证完成，等待发布）<br>
Recorded: 2026-08-07<br>
Current implementation: uncommitted local revision（未提交的本地修订）<br>
Previous public release: [`de33e654cfecf5f73e56b6afa18dd1806d00d800`](../../../../commit/de33e654cfecf5f73e56b6afa18dd1806d00d800)

## Scope and Decision

Keep V3 as an independent horizontal navigation-lens study. The base, static
selection, and temporary lens visuals now have exclusive visual ownership
（独占视觉所有权）. A direct drag shows the same glass lens as a click, follows
the primary pointer continuously after the `5px` threshold, and snaps to the
nearest tab only on release. The semantic active tab and `aria-current` remain
committed only after a click travel or drag settle completes.

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
- Repository-wide `npm run lint` remains blocked by pre-existing issues outside
  this batch: a V1 `react-hooks/set-state-in-effect` error and generated
  `output/blind-tests` lint findings. The V3 files and new Playwright files
  pass their scoped lint command.

## Release Status

No commit, push, deployment, production configuration, or public smoke test
was performed for this revision. The previous public release remains the
commit listed above; this local revision must be committed and deployed through
the normal release workflow before its behavior can be claimed as public.

## Known Limits and Follow-Up

- Chromium has full regression coverage; Firefox and Playwright WebKit have
  headless Edge-drag smoke evidence. Validate the native Safari application
  before release, because SVG `feDisplacementMap` behavior and performance may
  still differ from Playwright WebKit.
- Touch cancellation and pen commit have synthetic Pointer Events coverage, but
  still need physical-device confirmation.
- Playwright browsers are installed separately with
  `npx playwright install chromium`; browser binaries are not committed.
- Keep this record and the README updated after each completed work batch.
