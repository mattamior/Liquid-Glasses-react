# V3 Continuous World Sampling Decision Record（连续世界取样决策记录）

Date: 2026-08-10

Status: locally implemented, verified, and released to production（生产）; Cloudflare Worker version `3f2aff04-1693-4231-aee0-d7c757d7536d` serves 100% of traffic.

## 1. Scope and Decision（范围与决策）

This record covers the continuous world sampling（连续世界取样） refactor of the
`/v3` horizontal navigation lens after review against the complete Longbridge
reference set. It supplements, rather than rewrites,
[`v3-horizontal-navigation-lens`](./v3-horizontal-navigation-lens.en.md) and
[`v3-reference-calibration`](./v3-reference-calibration.en.md).

- Keep the local Canvas normal field（法线场） → SVG `feDisplacementMap` pipeline;
  do not add WebGL, runtime reference images, or dependencies.
- The lens now samples one complete navigation world: rail, four tabs, and the
  committed selection share padding-box coordinates. It no longer magnifies a
  label replica with an independent CSS `scale(1.45)`.
- Default `/v3` is the reference presentation（参考呈现）. `?chrome=demo` exposes
  experiment copy and optics controls; `?optics=edge` remains a comparison
  entry where Edge changes only the meniscus（弯月面） refraction strength of the
  same field.
- Reference JPEGs remain review and landmark-calibration material only. They
  are not bundled at runtime or treated as cross-browser pixel truth.

## 2. Delivered Result and Changed Areas（已交付结果与改动区域）

- [`app/v3/lens-optics.ts`](../../app/v3/lens-optics.ts) adds
  `LensCoordinateSpace`, `LensOpticsConfig`, one world transform, and an
  elliptical SDF（有符号距离场） displacement field. The field uses
  `coreZoom: 0.12`, a `24px` meniscus band, and `11px` Baseline normal
  refraction; Edge keeps the geometry with a `1.14` strength multiplier.
- [`app/v3/page.tsx`](../../app/v3/page.tsx) uses `NavigationWorld` for base,
  selection, and lens visuals. Navigation padding-box origin, tabs, slider,
  drag clamp, and lens-world transform share one live geometry model.
- [`app/v3/v3.css`](../../app/v3/v3.css) removes the fixed `1.45` lens-content
  scale and applies only the complete world-sample coordinate transform. The
  reference default hides demo chrome; Edge no longer changes border or shadow
  through an independent material treatment（材质处理）.
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) and new
  [`tests/e2e/v3-optics.spec.ts`](../../tests/e2e/v3-optics.spec.ts) cover
  continuous sampling, coordinates, fallback, and optics contracts. Six
  full-viewport state baselines, including one idle state, were added and five
  lens-crop baselines were updated; counts follow the current assertions and
  snapshot files.

## 3. Public Surface and Compatibility Contract（公共界面与兼容契约）

- The public route remains `/v3`; its default visual state is
  `data-chrome="reference"` and `data-optics="baseline"`. `?chrome=demo` shows
  debug chrome, while `?optics=edge` selects the Edge comparison field.
- Preserve `data-lens-phase`, `data-slider-phase`, `data-preview-id`, selection
  slider `data-*` state, and one committed `aria-current="page"`. Visual
  replicas remain `aria-hidden`; real buttons remain the sole interactive and
  accessible layer.
- Primary mouse, touch, and pen Pointer Events, the 5px drag threshold,
  release snapping, cancellation recovery, ResizeObserver, page-visibility
  handling, and the reduced-motion path are retained.

## 4. Optics, DPR, and Fallback（光学、DPR 与降级）

- The field is calculated in CSS pixels. Raster resolution is
  `ceil(devicePixelRatio)` capped at `2`; it rebuilds only when size, optics,
  or effective DPR changes, never per pointer move with a new Canvas or data
  URL.
- Filter padding remains `36px` to contain combined core and meniscus offset.
  Core magnification is encoded in the field and is no longer compounded with
  a CSS content scale.
- If Canvas, field, or SVG filter is unavailable, selection commits directly to
  the static slider and no unrefracted temporary lens is shown.
  `prefers-reduced-motion: reduce` and `forced-colors: active` use the same
  direct-commit path; forced colors also receives a system-color static style.

## 5. Verification Evidence（验证证据）

- `npx playwright test tests/e2e/v3.spec.ts tests/e2e/v3-optics.spec.ts`
  passed: 16/16 headless Chromium tests passed. New E2E coverage includes
  `forced-colors`（强制颜色）, an unavailable Canvas 2D context（Canvas 2D 上下文不可用）, and
  unavailable SVG filter constructors（SVG filter 构造函数不可用） direct-commit fallback（直接提交降级）;
  all three suppress the temporary lens and still commit the static selection.
- `calculateRasterScale` contract test（契约测试） covers DPR `<=1`, `1.x`, `2`, and `3`:
  results are `1`, `2`, `2`, and `2`, locking the effective raster-scale
  cap（上限） at `DPR <= 2`.
- `npm test` passed: the build completed and 5/5 server-rendered tests passed;
  `npm run lint`, `npm run build`, and `git diff --check` also passed.
- The third headless visual review was Go. Recorded key landmarks measured
  `1.151×` and `1.125×` content-mapping scale. This is local reference-review
  evidence, not a cross-browser pixel guarantee.
- All nine Longbridge references were reviewed, and static, Open→Activity,
  Activity→Market, and Edge states were mapped to automated key frames.

## 6. Deployment and Release Status（部署与发布状态）

Released on 2026-08-10 to Cloudflare Worker `liquid-lab-optics-demo`. With
Wrangler `4.92.0`, build, dry-run（预演）, and the production deploy（生产发布） all completed with
exit 0. The deploy command used
`--config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --message`.

New version `3f2aff04-1693-4231-aee0-d7c757d7536d` serves 100% of traffic. The
custom URL（自定义 URL） [`https://liquid.hkooii.com/v3`](https://liquid.hkooii.com/v3) and
workers.dev URL
[`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3)
both passed production smoke checks（生产冒烟检查）: 200 HTML, default, demo, Edge,
drag, ARIA, SVG filter, and zero console errors. The release uploaded six
modified/new assets and reused 25 assets, totaling `1298.91 KiB` (`285.54 KiB`
gzip) with `16ms` Worker startup（Worker 启动）. Production screenshots remain in ignored
`output/` and are not versioned.

The prior 100%-traffic version `98d48f5b-85be-4a21-9bba-f7c756a7a304` is the
rollback target（回滚目标）. If needed, run
`npx wrangler rollback 98d48f5b-85be-4a21-9bba-f7c756a7a304 --name liquid-lab-optics-demo`.

## 7. Known Risks, Limits, and Rollback（已知风险、限制与回滚）

- Chromium snapshots protect one fixed local environment. Firefox/WebKit are
  not configured as automation projects for this batch, and native Safari has
  not received manual acceptance. SVG `feDisplacementMap`, CSS mask（掩膜）, and
  compositing（合成） performance still require Safari-device review.
- JPEG compression, capture timing, and external-app context are not suitable
  as cross-browser pixel truth. Narrow layouts, cross-display DPR changes, and
  real touch hardware still need manual review.
- Roll back at the Git-commit boundary: revert the continuous-world-sampling
  implementation while preserving Pointer Events, ARIA, reduced motion, and
  static-selection contracts. Do not retain a long-lived parallel legacy
  renderer.

## 8. Existing Working-Tree Changes（既有工作树改动）

This batch preserves the user's pre-existing uncommitted V3 calibration,
README, decision-record, and snapshot changes, merging them into the
continuous-world-sampling implementation. It does not delete or rewrite the
existing `v3-reference-calibration` record. Before committing, continue to
separate this decision/implementation batch from the user's earlier
working-tree changes.
