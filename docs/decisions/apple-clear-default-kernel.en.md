# Apple Clear Default Kernel Decision Record

**Date:** 2026-08-16
**Status:** Implemented on `grok/apple-liquid-glass-skill`; visual approval (视觉批准) pending; not deployed

## 1. Scope and Decision

The Skill default is no longer `v2-default`. Unnamed requests select `apple-liquid-glass`: a floating Clear folder/panel extracted from `app/apple-clear`. V1, V2, and V3 remain explicit simulation presets (模拟预设). The first Apple surface is the iOS-folder Clear pane over a home-screen environment, using the six stills in `docs/assets/v2-card-liquid-glass/` as review gold (审阅金标).

This batch does not change that decision. It closes Liquid Glass gaps in the default kernel without replacing refraction (折射) with frost (毛玻璃): world-replica `feDisplacementMap` stays on the shell and traveling capsule (旅行胶囊); blur remains secondary scatter (散射).

## 2. Delivered Result and Changed Areas

- `/apple-clear` remains a floating menu. The shell still samples a world replica (世界副本) across the whole surface and applies `feDisplacementMap`. Item changes still run `click → dragging → settling → fading` and commit `aria-current` only after the fade.
- Shell and lens `worldX` / `worldY` now lock to `stage − surface`. Overscan stays `inset: -40`, the replica insets back to the glass box (`inset: 40`), and the world origin no longer adds `filterPadding` (40px). This matches V2: overscan −40 + replica inset 40 + `world = stage − surface`.
- `--apple-clear-occluder` on `.apple-clear-shell__optical` is `transparent` in both themes. A misaligned or unready replica now shows live wallpaper instead of a painted `#3b8ee8` / `#5a2f78` card.
- `bypass()` is only `prefers-reduced-motion` or `forced-colors`. Enhanced-with-unsupported-SVG and Baseline still run the traveling lens; they no longer skip the plate or commit instantly. Reduced-motion / forced-colors still commit directly.
- Fill scatter uses `blur(var(--apple-clear-blur))`. The token is `--apple-clear-blur: 10px`. Blur was not raised above that token and was not used as a substitute for displacement.
- Selection sweep is a previous-to-next measured center vector (`dx` / `dy` from item or plate rectangles) played with WAAPI. The fixed vertical `@keyframes apple-selection-sweep` path is gone.
- Capture-phase `window` listeners for `pointerup` (settle) and `pointercancel` (cancel) finish a drag if element capture is lost. `lostpointercapture` still returns to the origin.
- The clock tile is a small top-left wallpaper type layer (`5.5% / 4.5%`, `min(20vw, 136px)`). The icon grid starts after it. Heading `菜单` and `09:54` no longer stack as a second type layer under the centered menu.
- The same four files are extracted to `skills/liquid-glass-interface/assets/strict-kernels/apple/` and copied to `Liquid-Glasses-skill-test/test-6/src/liquid-glass/kernel/`. Traveling lens and world-replica displacement were kept.
- Travel fill/overscan: during `click` / `dragging` / `settling` the plate overscan/replica is forced visible and the fill is `0.2` over the replica. Idle/fading stay `3%` + `0.5px`.
- Travel height: during `click` / `dragging` / `settling` the selection plate is a `74px` pill (`border-radius: 32px`), still recognizably the idle highlight rather than a `124px` / `50%` ellipse. Idle and fading stay the quiet `58px` / `22px` capsule. Height and `border-radius` still animate on the same `680ms` / `260ms` curves — the liquid morph (液体形变) is kept. The displacement field is pre-built at `74 × (menuWidth − 16)` so the first travel frame already has `url(#lens)`. **Never use `border-radius: 50%` on the selection plate.**
- Menu clip: `.apple-clear-menu` is `overflow: hidden` with `border-radius: 28px`, so the traveling pill is cut by the same rounded Clear pane (first and last items included). Travel height is `74`; the stage/wallpaper is not clipped. `overflow: hidden` would hide the menu’s own `box-shadow`, so the shadow stays on a non-clipping `.apple-clear-menu-frame` wrapper. Plate overscan stays `inset: -40`; the menu clip may crop that overscan near the pane edge.
- Travel Y nudge: `--apple-selection-y` remains the item rail. `--apple-travel-y-nudge` is `-8px` (`(58 − 74) / 2`) during travel and `0` at idle/fading. The plate transform is `selection-y + nudge`; the world transform is `world-y − selection-y − nudge`, so the extra 8px is a taller window of the same lock, not a downward crop. Live plate `getBoundingClientRect` is not used as the world origin. Rest X stays baked; no live plate rect.
- Label clip: `.apple-menu-visual--above` / `--below` follow the traveling plate, not the idle row. The top edge is `menu-pad + selection-y + travel-y-nudge`; the bottom edge adds `--apple-selection-height`. When the plate is taller than a row, idle small type cannot leak at the rim and stack on the large lens type. Lens labels still use `translate3d(0, calc(-12px - var(--apple-selection-y) - var(--apple-travel-y-nudge)), 0)` so the active word stays centered on the item rail. Menu visuals use `inset: 0 8px auto 8px`, `grid-auto-rows`, and `align-content: start`. Clip-path is not animated separately; it rides the registered height / nudge.
- Y motion is driven only by the registered `@property --apple-selection-y` (and nudge) on `.apple-clear-menu`. The plate still uses `transform: translate3d(0, calc(var(--apple-selection-y) + var(--apple-travel-y-nudge)), 0)` but **does not** list `transform` in its `transition`. `.apple-selection-plate__world` and `.apple-menu-visual--lens` have no `transition: transform`. This removes the double interpolation (双重插值) that left the 58px hole over 信息 while the pill lagged on 照片. Dragging still sets `transition-duration: 0ms`. Settling shortens height/radius only (`260ms, 260ms, 160ms, 160ms`) and does not reintroduce a transform transition.
- Travel world X is the rest plate origin `stage.left − (menu.left + 8)` (y=0, height=58). It is applied as a concrete `translate3d(worldX, …)` on the world layer (`top: 0; left: 0`). Travel does not remeasure plate X. Selection-lens SDF is `radiusCssPx: 32` (match travel CSS radius), `edgeZoneCssPx: 20`, `maximumZoom: 1.09`, `minimumZoom: 1.05`, `edgeRefractionCssPx: 4` so the smaller pill does not smear. Fill stays at `0.2`; no frost (毛玻璃); no dock blur.
- Menu type: every label lays out at `--apple-menu-size-active: 20px` / `--apple-menu-weight-active: 700` so the box does not change. Unselected glyphs `scale(14/20)` from `transform-origin: center` and use `rgb(255 255 255 / 78%)`. Selected and slider labels use `scale(1)` and `#fff`. The size change is a uniform 2-axis scale around the glyph center (idle 14, active 20), not a 1px `font-size` tweak. `data-selected` on above/below follows `interaction.targetIndex` during travel.
- Menu pane, frame, and items use `--apple-menu-radius: 28px`. The selection plate uses the concentric inner radius `--apple-plate-radius: 20px` (`28 − 8` idle inset). Putting `28px` on the 58px plate made a semicircle cap that no longer read as the pane corner. Selection SDF `radiusCssPx` is `20`.
- Lens spring: press sets `data-lens-spring="pressed"` (`scale 1.09 / 0.84`, 90ms). Travel / drag / settle use `"stretch"` (`scaleX 1 / scaleY 1.16`). Horizontal plump stays on `--apple-plate-inset` only — travel must not `scaleX` the optical layer, or the unscaled plate chrome doubles as a left/right ghost. Drop shadow sits on `__optical` so it travels with the glass. Fade and idle return to `"rest"`. Y, plump, and inset interpolate with `--apple-spring: cubic-bezier(.22, 1.48, .28, 1)`. `prefers-reduced-motion` disables squash, stretch, and overshoot.
- Selected/idle plate keeps full row width (`--apple-plate-inset: 8px`). Travel inset is `-6px` so the capsule can grow ~6px past the pane on each side. Menu `overflow` is `visible` so that X plump is not clipped. Lens labels use `translateX(calc(8px - var(--apple-plate-inset)))`. World/field lock to the travel inset (`PLATE_INSET = -6`).

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| Branch | `grok/apple-liquid-glass-skill` |
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `apple-liquid-glass source-to-kernel extraction assertions passed { files: 4, source: 'app/apple-clear' }`. Asset and `test-6` copies match `app/apple-clear`. |
| Mid-flight capture | `npx playwright test tests/e2e/apple-clear-travel-mid.spec.ts` passed: `1 [chromium] › tests/e2e/apple-clear-travel-mid.spec.ts:13:1 › writes an apple-clear mid-flight travel capsule PNG (1.4s)` then `1 passed (6.4s)`. Overwrote `output/playwright/apple-clear-travel-mid.png` after 主页 → 信息 at ~340ms. File mtime `2026-08-16 11:52:46 +0800`, size `373538` bytes. Pill sits on 信息; 信息 and 设置 are visible labels (no blank row). Plate is a `74×32` pill (`width > height`, measured height in `65–85`). Did not run `--update-snapshots` on V2/V3. No commit. |
| Menu type tokens | `--apple-menu-size-idle: 14px`; `--apple-menu-size-active: 20px`. Shared radius `28px`. Idle plate inset `8px`, travel `-6px`. Verifier asserts radius, insets, and `overflow: visible`. |
| Fade glyph center | Lens transform subtracts `--apple-travel-y-nudge`. Verifier asserts `apple-menu-visual--lens` includes that var. |
| Browser visual review | `implemented-awaiting-visual-approval` until the human reviewer accepts the last `test-N` evidence |
| Production deploy | Not run |

## 4. Deployment and Release Status

Repository and Skill-asset change only. No Worker deploy.

## 5. Known Risks, Limits, and Follow-up

- Tab bar / Control Center Regular is out of this batch.
- Unattended `test-N` loops can only proxy the visual gate.
- Human comparison against the six gold stills is still pending.
- Existing Vite proof copies in `test-1` / `test-2` / `test-4` still ship a pre-overscan kernel until they are re-copied from `assets/strict-kernels/apple/`. This batch updated the extract only.
- SVG `feDisplacementMap` still cannot match native Apple chromatic dispersion (色散).
- The traveling capsule uses a white/environment fill instead of V2’s cyan/purple ring so the Clear pane does not fail the closed-ring veto.
- Travel (`click` / `dragging` / `settling`) now forces the plate overscan/replica to `opacity: 1` and cuts the plate fill to `0.2` (well below the previous `0.72` milk, and no longer raised to `1` when `data-entered="true"`). Fill sits over the replica so displaced wallpaper stays the dominant read, with the existing inset hairline/inner highlight for thickness. Idle/fading stay the quiet `3%` fill + `0.5px` rim; travel milk is not applied at rest. Shell blur and dock `blur(22px)` were not reintroduced. World-lock remains `calc(var(--apple-world-y) - var(--apple-selection-y))`.
- Mid-flight after the 74×32 / 58px-rail change still hid 信息: `--apple-selection-y` was already interpolated by the menu `@property` while the plate/world/lens also transitioned `transform`, so the clip hole led the pill. Transform is no longer on those transition lists; Y follows the `@property` only. Pill may still overlap 照片/信息 slightly (liquid plump). Height interpolation (`58 → 74`) and the pre-built `74px` field are slightly mismatched for the first growth frames. Review mid-flight is 主页 → 信息. Selection SDF is `1.05 / 1.09 / 4`. Human visual approval of this PNG is still pending.
