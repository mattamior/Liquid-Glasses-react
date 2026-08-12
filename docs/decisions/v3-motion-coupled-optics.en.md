# V3 Motion-Coupled Optics Decision Record（V3 运动耦合光学决策记录）

Date: 2026-08-12

Status: released to production（已生产发布）; implementation commit `d702d2b` maps to Cloudflare Worker `liquid-lab-optics-demo` version `d910d3b1-cdc6-472f-a504-4d5df526df95`, serving 100% of traffic. No new milestone tag has been created.

## 1. Scope and Decision（范围与决策）

This record covers the production optical and navigation-glyph（导航图标字形） enhancement for `/v3` on top of continuous-world sampling（连续世界取样） and the persisted theme. The chart background is out of scope（超出范围） for this batch.

- All four navigation items use one original, shared `NavigationGlyph` asset set: Open is `70px`, Activity is `79px`, Market is `88px`, and Follow is `70px`. The base, static slider, and transient lens continue to reuse one `NavigationWorld`; sun, moon, and the teal badge stay unchanged.
- The refraction field（折射场） keeps the `1×` world transform and uses continuous radial（径向） and tangential（切向） displacement. `LensFieldState` represents dynamic state with `none` / `left` / `right` direction and velocity tiers（速度层级） `0`–`3`; tier 0 is canonicalized（规范化） to a direction-free static field.
- Click and drag connect the real state-machine direction and velocity tier to the optical profile without changing existing phase, settle, or commit timing. Baseline and Edge share geometry and surface material; Edge keeps its static increase and adds visible displacement coverage only in the moving profile.
- Dynamic-field generation uses `125ms` latest-pending coalescing（最新待处理合并调度）. Total LRU（最近最少使用缓存） capacity is `16`, and the dynamic-profile cap is `14`, so the nominal working set（名义工作集） can leave up to two capacity slots for static profiles. This is not a hard reservation（硬保留）: static entries can still be evicted（淘汰） by the same LRU policy. Pointer-position updates keep the existing animation-frame path and do not rebuild the field on every pointer move.
- Displacement-map encoding now uses `fieldScaleCssPx: 64`, representing `±32 CSS px` on each axis. The cache schema（缓存架构版本） is `v3-continuous-field-4`, and filter padding stays at `36px`. This expands encoding range only; it does not change the accepted displacement mathematics.

## 2. Delivered Result and Changed Areas（交付结果与改动区域）

- [`app/v3/lens-optics.ts`](../../app/v3/lens-optics.ts) defines the continuous field, signed-sample encoding（有符号采样编码）, profile-key canonicalization, LRU, and `125ms` latest-pending scheduler. Static landmarks remain `coreZoom: 0.12`, `coreFalloffStart: 0.70`, `meniscusBandCssPx: 36`, `baselineMeniscusRefractionCssPx: 10.05`, and Edge static multiplier `1.14`.
- The moving profile adds radial, tangential, and directional parts over a smooth range around `r = 0.45`–`0.92`; left and right mirror each other, and tier 0 contains no dynamic increase. Tangential strength is `3.5`, base directional strength is `2.5`, and the rim motion multiplier is `0.22`; the Edge motion multiplier is `3.2`, its extra directional strength is `2`, and the mid-range weight is normalized to `0.28`.
- [`app/v3/page.tsx`](../../app/v3/page.tsx) maps real click / drag state to `LensFieldState` and keeps the base, slider, and lens on the same original glyph and label set. Public routes, query parameters, ARIA, fallback（降级路径）, and `data-*` inspection interfaces are unchanged.
- [`app/v3/v3.css`](../../app/v3/v3.css) keeps one lens structure for dark and light themes: visible surface tint（表面着色）, an approximately `2px` rim, the inner-dark region, top and bottom `72px × 22px` caustics（焦散）, and one low-frequency sheen（低频光泽）. Baseline and Edge have no separate shell, color, or material branch.
- [`tests/e2e/v3-optics.spec.ts`](../../tests/e2e/v3-optics.spec.ts), [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts), and [`tests/e2e/v3.spec.ts-snapshots/`](../../tests/e2e/v3.spec.ts-snapshots/) cover pure optical interfaces, interaction behavior, and the current visual baseline.

## 3. Preserved Contracts（保持不变的契约）

- `/v3`, `?chrome=demo`, `?optics=edge`, persisted themes, forced colors, reduced motion, and the static-commit fallback when Canvas / SVG is unavailable keep their existing behavior.
- Dock, rail, lens, slider, padding-box world origin, and the `1×` world transform keep the accepted geometry. This batch does not restore a CSS scale or add a magic offset.
- Public click, drag, settle, and commit timing is unchanged. The new direction and tier control only the internal field profile and do not change active / preview ARIA ownership.
- Existing `data-*` state and test entry points remain compatible（保持兼容）. No public API, URL state, render prop, WebGL path, or long-term legacy renderer（旧版渲染器） is added.
- Dark, light, system-theme, and persisted-override priority remains unchanged. The chart background is explicitly out of scope.

## 4. Verification Evidence（验证证据）

| Check | Result |
| --- | --- |
| CodeGraph healthy sync（健康同步） | Passed; `29 files / 376 nodes / 1038 edges`. |
| Pure optics tests（纯光学测试） | Passed, `10/10`. |
| Full E2E | Passed, `35/35` in headless Chromium. |
| Lint | `npm run lint` passed. |
| Build | `npm run build` passed. |
| SSR / npm test | `npm test` passed, `5/5`. |
| Diff formatting | `git diff --check` passed. |
| Visual snapshots（视觉快照） | `21` PNGs map one-to-one to assertions: `12` full viewport and `9` lens crops; the recorded manifest（清单） SHA-256 prefix is `509f…`. |

## 5. Visual, Compatibility, and Performance Gates（视觉、兼容与性能门槛）

- The final visual gate is **Go**: the dark lens non-text center is `p50 = 58.73`, the specified moving Edge landmark displacement is `D = 4.603px`, and RGBA encoding has no saturation（饱和） with `fieldScaleCssPx: 64`. Surface, rim, inner-dark, caustic, and theme contrast remain on the material path shared by Baseline and Edge.
- A manual native Safari Retina review is **Go** with `backingScaleFactor = 2`. Theme, SVG filter, mask, CSS `:has()`, and real drag passed with no console errors; touch interaction was not reviewed in this pass.
- The system recording requested `r60`, but the actual file is `2446 × 1370`, `404` frames, `8.026667s`, and an average `50.290fps`; its recorded SHA-256 prefix is `e1f…`. Therefore, the frame-by-frame（逐帧） `>= 60fps` gate did not pass, and slider recovery within `<= 2` frames is not signed off（尚未签署）.
- `fieldScaleCssPx: 64` expands the per-axis encoding range to `±32px`. The current review confirms no RGBA saturation, and `36px` padding still covers field-axis displacement plus anti-aliasing（抗锯齿） margin.
- The custom-domain production smoke is **Go**: system dark/light resolved to `rgb(5, 15, 19)` / `rgb(244, 247, 248)`; theme write plus reload restore, default chrome hidden, and visible `?chrome=demo` controls passed. At the Edge Activity→Market `16ms` midpoint, the state was `phase=dragging`, `data-preview-id=market`, and `aria-current=动态`, with the slider hidden and the `296 × 242` lens/filter visible. Scale was `64`, padding was `-36 / -36 / 368 × 314`, world scale was `1×`, and the field was `R 4–179 / G 52–201` with `0` endpoints at 0/255. Release committed Market, restored the slider, and hid the lens; forced-colors disabled the theme button, wrote no storage, and used direct static commit. Console errors and page errors were both `0` throughout.
- The workers.dev production smoke was a brief Edge load+click: it reached Activity with final `phase=idle`, a present field, DPR `1`, and `0` console or page errors. It did not repeat the custom domain's full theme/drag matrix（完整主题/拖拽矩阵）. Both production `/v3` URLs returned `200 / text/html; charset=utf-8`.

## 6. Release Status and Rollback（发布状态与回退）

- Implementation commit `d702d2b` was pushed to `main` and released as Cloudflare Worker `liquid-lab-optics-demo` version `d910d3b1-cdc6-472f-a504-4d5df526df95`, serving 100% of traffic. The custom URL（自定义 URL） [`https://liquid.hkooii.com/v3`](https://liquid.hkooii.com/v3) and workers.dev URL [`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3) both passed production smoke（生产冒烟检查）.
- With Wrangler `4.92.0`, `npm run build`, dry-run（预演）, and production deploy（生产发布） all completed with exit `0`. The dry run contained `8` modules, `40` assets, and `1313.60 KiB` total upload (`289.65 KiB` gzip). Production uploaded `5` new/modified assets, reused `26`, and reported `19ms` Worker startup（Worker 启动）.
- The prior 100%-traffic version is `590a19bb-8b64-4053-af13-a1b0f54fb387`. The exact production rollback command（生产回退命令） is `npx wrangler rollback 590a19bb-8b64-4053-af13-a1b0f54fb387 --name liquid-lab-optics-demo --message "rollback v3 motion-coupled optics" --yes`. Code rollback should treat the implementation commit, tests, 21 snapshots, README entries, and this decision record as one batch boundary; do not confuse production rollback with source rollback.

## 7. Known Risks, Limits, and Follow-Up（已知风险、限制与后续工作）

- A `50.290fps` recording average does not prove frame-by-frame `>= 60fps`. The next step needs a repeatable per-frame time series（逐帧时间序列） and a slider-recovery frame count, followed by separate sign-off for both performance gates.
- Safari Retina covers theme, filter, mask, `:has()`, and drag, but not a real touch gesture. This release has not completed that check; a touch device or equivalent hardware check must be completed before the next milestone acceptance（下一里程碑验收）.
- The current visual gate proves the specified composition and landmark, not the chart background or another excluded scene. The chart remains an explicit later batch.
- This batch is deployed, but frame-by-frame `>= 60fps` and slider `<= 2` frames remain explicit open limits and must not be marked passed because of production release. A new milestone tag remains a separate release decision（独立发布决策） and is not predeclared here.
