# Liquid Glass Radix Menu Decision Record

**Date:** 2026-08-19
**Status:** Implemented on `grok/liquid-glass-radix-menu`; visual approval pending; not deployed

## 1. Scope and Decision

The portable deliverable is the floating menu, not the home-screen lab. New work lives on `grok/liquid-glass-radix-menu`. Product mounts copy the kernel and render `LiquidMenu` or one of the finished overlays (`LiquidDropdown`, `LiquidContextMenu`, `LiquidSelect`, `LiquidPopover`, `LiquidDialog`, `LiquidMenubar`). Radix owns open, focus, and dismiss. Optics stay frozen.

This batch gives `LiquidPopover` the same compact density, three-beat morph, and press-only trigger squash as Select. Commit still stays open. Mobile verification is deferred.

The layer immediately behind the menu must be blur or a solid color so labels stay readable.

## 2. Delivered Result and Changed Areas

- `LiquidMenu` accepts `items`, `value`, `defaultValue`, `onValueChange`, `title`, `theme`, `optics`, optional `scene`, and `host`.
- Kernel `host` is `standalone` (wraps `@radix-ui/react-navigation-menu`) or `nested` (plain `nav`, own arrow/Home/End/Enter). Overlay hosts must pass `nested` so two Radix menus are not stacked.
- `LiquidDropdown` is the first finished overlay: trigger + portal; pointer or reselect closes after the travel fade; Arrow/Home/End browse and commit without dismissing; Enter/Space confirm and close; Escape and outside click dismiss immediately.
- `LiquidContextMenu` is the second finished overlay: right-click surface + portal; same nested-host keyboard and delayed close as `LiquidDropdown`. It now uses `density: "compact"` and the same three-beat liquid pop (no trigger squash; there is no standing trigger).
- `LiquidSelect` is the third finished overlay: form trigger + Popover portal (not Radix Select) so the travel lens can finish; empty value shows the placeholder. It now uses `density: "compact"`, the three-beat liquid pop, and press-only trigger squash that releases after open.
- `LiquidPopover` is the fourth finished overlay: click trigger + portal; commit stays open until Escape, outside click, or the trigger. It now uses `density: "compact"`, the three-beat liquid pop, and press-only trigger squash that releases after open.
- `LiquidDialog` is the fifth finished overlay: modal dim + centered glass menu; pointer or Enter closes after the travel fade; overlay and Escape dismiss immediately.
- `LiquidMenubar` is the sixth finished overlay: horizontal File/Edit triggers; each menu is `host="nested"`; pointer or Enter closes after the travel fade. No `key` remount.
- Catalog sidebar (`CatalogNav`) keeps a pending selected index after commit so a late `router.push` cannot spring the plate back and replay travel. Sidebar labels `nowrap` and scale from the left so long English names stay on one row and share a left edge.
- `/ui` catalog. Left rail is itself a `LiquidMenu`. `/liquid-menu` redirects to `/ui/liquid-menu`. Overlay preview stages share `OverlayPreviewStage`: default wash only; top-right `文字底` toggle tiles 10px `Liquid glass abcd ABCD 1234` on a 220×16 repeat so the stage fills evenly. `LiquidMenu` preview stays a single wash with no toggle.
- Overlay family is complete. Further work is new surfaces, not another unfinished 5-pack.
- `LiquidDropdown` uses kernel `density: "compact"` (36px rows, 13/16 type, 200px, 16/12 radius). Standalone `LiquidMenu` stays `panel` (58 / 14↔20 / 280).
- Dropdown open is a three-beat liquid morph on the inner wrap, matching Control Center calculator → copy-result chip: press-only trigger squash (`scaleX 1.1 / scaleY 0.84`) that releases 120ms after open so the trigger returns to rest; source-sized blob, oversized overshoot, compact settle. Closing does not replay the squash. Radix still owns Content placement. `cssAncestorScale` keeps the world replica off the animated scale.
- Nested overlay underlay (`data-host="nested"`) is `rgb(14 18 30 / 54%)` + `blur(40px)` in dark (light: `rgb(28 48 78 / 52%)`) so page type behind portals is just unreadable. Standalone panel underlay stays `16%` + `blur(22px)`. Refraction is unchanged.
- Skill extract stays byte-equal with `app/apple-clear`.

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| Branch | `grok/liquid-glass-radix-menu` |
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `{ files: 14, source: 'app/apple-clear' }` |
| Browser `/ui/liquid-dropdown` | Desktop 1280×800: open; click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; ArrowDown 信息→设置 → menu stayed open / `onValueChange: settings`; Enter closed and restored trigger focus; Escape closed; click current 设置 closed; click sidebar rail dismissed. Sidebar `LiquidMenu` still `host=standalone` and routed to `/ui/liquid-menu`. Mobile 390×844: pointerdown+click 信息 → travel → closed / `onValueChange: messages`. |
| Sidebar alignment + single travel | After CSS `display:contents` on the Radix viewport and `nowrap` labels: all seven label left edges at 42px, row pitch 66px, hit targets match visuals, Menubar stays inside the shell. Click LiquidDropdown → LiquidDialog: `--apple-selection-y` 66 → 345 overshoot → 330, stays 330 across `/ui/liquid-dialog`; no snap-back. |
| Browser `/ui/liquid-context-menu` | Desktop: right-click opens nested host; click 信息 → travel → `onValueChange: messages` / closed; ArrowDown 信息→设置 stays open / `settings`; Enter closes; Escape closes; outside pointerdown closes; reselect 设置 closes immediately. Mobile 390×844 long-press opens; pointerdown+click 照片 → travel → closed / `photos`. `/ui/liquid-dropdown` still opens nested host. |
| Browser `/ui/liquid-select` | Desktop: trigger shows `选择…`; click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; ArrowDown 信息→设置 stays open / trigger `设置`; Enter closes; Escape closes; click heading dismisses; reselect 设置 closes immediately. Mobile 390×844: pointerdown+click 照片 → travel → trigger `照片` / closed. |
| Browser `/ui/liquid-popover` | Desktop: click trigger opens; click 信息 → travel → `onValueChange: messages` / stayed open; ArrowDown → `settings` / stayed open; Enter stayed open; Escape closed; click heading dismissed; trigger toggle closed. Mobile 390×844: pointerdown+click 照片 → travel → `photos` / stayed open. |
| Browser `/ui/liquid-dialog` | Desktop: trigger opens centered modal; click 信息 → travel → `onValueChange: messages` / closed; ArrowDown 信息→设置 stays open / `settings`; Enter closes; Escape closes; overlay pointerdown dismisses; reselect 设置 closes immediately. Mobile 390×844: pointerdown+click 照片 → travel → `photos` / closed. |
| Browser `/ui/liquid-menubar` | Desktop: 文件 opens 新建/打开/保存; click 打开 → travel → `file/open` / closed; 编辑 opens 剪切/复制/粘贴; ArrowDown → `edit/copy` / stayed open; Enter closed; switch 文件→编辑 swaps menus; Escape closed; click heading dismissed. Mobile 390×844: 文件 → 保存 → travel → `file/save` / closed. |
| Skill install `test-7` | New blank Vite React app at `/Users/jay/Code/Liquid-Glasses-skill-test/test-7`. 14 kernel files + adapter byte-equal. `tsc -b` passed. Desktop: LiquidMenu 信息 travel → `menu: messages`, Enhanced optics. LiquidDropdown 设置 travel → close / `dropdown: settings`. Mobile: 设置 → `menu: settings`. Kernel bundle SHA-256 `60d21ba6c82f365ab71a4ee375d290e33d1f84e9bfa1358363775dbece0cb23c`. Visual approval pending. |
| Compact dropdown | `/ui/liquid-dropdown`: trigger 40×61 / 14px; open panel 200×172, row 36, travel plate 46, radius 16, density=compact. Click 信息 travels then closes. Sidebar still row 58 / density=panel. |
| Dropdown morph pop | Desktop 1280×800: pointerdown trigger `matrix(1.1, 0, 0, 0.84)`; pop samples 68×31 (t0) → 150×112 (t80) → 227×201 overshoot (t270) → 190×158 recover (t420) → 200×172 settle (t700). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; no leftover pop node. Mobile 390×844: same press squash; mid 174×140 then settle 200×172; click 照片 → trigger `照片` / `onValueChange: photos` / closed. Console errors: none. |
| ContextMenu compact + morph | `/ui/liquid-context-menu` desktop: right-click pop `liquid-context-pop-right` 36×58 (t80) → 243×201 overshoot (t270) → 200×172 settle (t700), `data-density=compact`. Click 信息 → travel → `onValueChange: messages` / closed. |
| Nested overlay occlusion | `/ui/liquid-context-menu`: right-click over 「在此区域右键」. Nested backdrop computed `rgba(14, 18, 30, 0.54)` / `blur(40px) saturate(1.8)`. Hint glyphs not readable through the plate. Sidebar `LiquidMenu` still `data-host=standalone`. |
| Select compact + morph | `/ui/liquid-select` desktop: pop 68×31 (t80) → 219×193 overshoot (t270) → 200×172 settle (t700), `data-density=compact`. Trigger squash releases after open (`transform: none`). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed. Mobile 390×844: settle 200×172; click 照片 → trigger `照片` / `onValueChange: photos` / closed. |
| Overlay probe wash | `/ui/liquid-select` desktop 1280×800: default no `is-probe`, `::before` content `none`, toggle `aria-pressed=false` at top-right. Toggle on: 10px type on a 220×16 tile fills the stage evenly with `Liquid glass abcd ABCD 1234` (`test` removed). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed. Same toggle on `/ui/liquid-dropdown` (click 信息 → `messages` / closed), `/ui/liquid-context-menu` (right-click → 信息 → `messages` / closed), `/ui/liquid-popover` (信息 → `messages` / stayed open), `/ui/liquid-dialog` (信息 → `messages` / closed), `/ui/liquid-menubar` (文件 → 打开 → `file/open` / closed). `/ui/liquid-menu` has no toggle and no probe type. Mobile 390×844 `/ui/liquid-select`: single-column catalog, toggle on, click 照片 → trigger `照片` / `onValueChange: photos` / closed. Console errors: none. |
| Popover compact + morph | `/ui/liquid-popover` desktop 1280×800: pointerdown trigger `matrix(1.1, 0, 0, 0.84)`; pop 68×31 (t0) → 104×58 (t80) → 240×217 overshoot (t270) → 191×159 recover (t420) → 200×172 settle (t700), `data-density=compact`. Trigger squash releases after open (`transform: none`). Click 信息 → travel → `onValueChange: messages` / stayed open; Escape closed. Console errors: none. Mobile not verified. |
| Production deploy | Not run |

## 4. Deployment and Release Status

Repository and Skill-asset change only. No Worker deploy.

## 5. Known Risks, Limits, and Follow-up

- The morph is a CSS scale of the compact panel, not a true path-morph from the trigger’s rounded rect. Shape interpolation of the glass outline is follow-up.
- Nested host has no typeahead. Radix Dropdown has no `Item` children, so typeahead stays off.
- Arrow browse updates `value` after the travel fade so the plate can stay on the new row while the menu stays open.
- Embedded `backdrop-filter` samples the page behind the stage; the replica still clones the backdrop node, not live pixels under each glyph.
- No remaining overlay stub. Tab bar / Control Center Regular stay out of scope until system screenshots.
- This `LiquidPopover` batch verified desktop only; mobile is later.
