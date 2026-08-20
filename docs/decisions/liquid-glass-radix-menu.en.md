# Liquid Glass Radix Menu Decision Record

**Date:** 2026-08-19
**Status:** Implemented on `grok/liquid-glass-radix-menu` and released to `liquid-lab-optics-demo`; visual approval pending

## 1. Scope and Decision

The portable deliverable is the floating menu, not the home-screen lab. New work lives on `grok/liquid-glass-radix-menu`. Product mounts copy the kernel and render `LiquidMenu` or one of the finished overlays (`LiquidDropdown`, `LiquidContextMenu`, `LiquidSelect`, `LiquidPopover`, `LiquidDialog`, `LiquidMenubar`). Radix owns open, focus, and dismiss. Optics stay frozen.

This batch releases the `/ui` catalog to production: Menu, Dropdown, and Select still use `LiquidMenu`; Popover / Dialog are cards; Menubar / ContextMenu are action lists. Mobile verification is deferred.

The layer immediately behind the menu must be blur or a solid color so labels stay readable.

## 2. Delivered Result and Changed Areas

- `LiquidMenu` accepts `items`, `value`, `defaultValue`, `onValueChange`, `title`, `theme`, `optics`, optional `scene`, and `host`.
- Kernel `host` is `standalone` (wraps `@radix-ui/react-navigation-menu`) or `nested` (plain `nav`, own arrow/Home/End/Enter). Overlay hosts must pass `nested` so two Radix menus are not stacked.
- `LiquidDropdown` is the first finished overlay: trigger + portal; pointer or reselect closes after the travel fade; Arrow/Home/End browse and commit without dismissing; Enter/Space confirm and close; Escape and outside click dismiss immediately.
- `LiquidContextMenu` is the second finished overlay: right-click host opens a glass action list. Default Cut / Copy / Paste; choosing 复制 fires `onValueChange("copy")` and closes immediately. No standing selection, no traveling lens. The morph pop remains.
- `LiquidSelect` is the third finished overlay: form trigger + Popover portal (not Radix Select) so the travel lens can finish; empty value shows the placeholder. It now uses `density: "compact"`, the three-beat liquid pop, and press-only trigger squash that releases after open.
- `LiquidPopover` is the fourth finished overlay: click trigger + portal glass bubble. `children` is arbitrary content; the default preview is a network-status card, not a menu. `LiquidGlassCard` paints the whole-surface refraction shell only — no traveling lens. Escape, outside click, or the trigger closes it. The three-beat liquid pop and press squash remain.
- `LiquidDialog` is the fifth finished overlay: modal dim + centered glass card. `children` is arbitrary content; the default preview is a delete-confirm card, not a menu. Overlay and Escape dismiss immediately. Press squash and a centered three-beat pop remain.
- `LiquidMenubar` is the sixth finished overlay: a top command bar. Thin File/Edit titles open a glass action list; choosing 打开 fires `onValueChange("file","open")` and closes immediately. No standing selection, no traveling lens. The morph pop remains.
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
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `{ files: 15, source: 'app/apple-clear' }` |
| Browser `/ui/liquid-dropdown` | Desktop 1280×800: open; click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; ArrowDown 信息→设置 → menu stayed open / `onValueChange: settings`; Enter closed and restored trigger focus; Escape closed; click current 设置 closed; click sidebar rail dismissed. Sidebar `LiquidMenu` still `host=standalone` and routed to `/ui/liquid-menu`. Mobile 390×844: pointerdown+click 信息 → travel → closed / `onValueChange: messages`. |
| Sidebar alignment + single travel | After CSS `display:contents` on the Radix viewport and `nowrap` labels: all seven label left edges at 42px, row pitch 66px, hit targets match visuals, Menubar stays inside the shell. Click LiquidDropdown → LiquidDialog: `--apple-selection-y` 66 → 345 overshoot → 330, stays 330 across `/ui/liquid-dialog`; no snap-back. |
| Browser `/ui/liquid-context-menu` | Desktop: right-click 「在此区域右键」 opens 剪切/复制/粘贴 with no selection plate. Click 复制 fires `copy` and closes immediately. No `LiquidMenu` / traveling lens. Mobile not verified. |
| Browser `/ui/liquid-select` | Desktop: trigger shows `选择…`; click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; ArrowDown 信息→设置 stays open / trigger `设置`; Enter closes; Escape closes; click heading dismisses; reselect 设置 closes immediately. Mobile 390×844: pointerdown+click 照片 → travel → trigger `照片` / closed. |
| Browser `/ui/liquid-popover` | Desktop: click 网络 opens a glass card with 「办公室 Wi-Fi」 / 「已连接 · 5 GHz」 and no menu items. Click 断开 → stage value `未连接`, bubble stayed open; click 连接 → `已连接`. Escape closed. No `LiquidMenu` / traveling lens. Mobile not verified. |
| Browser `/ui/liquid-dialog` | Desktop: click 删除相册 opens a centered confirm card with 「删除「旅行」？」 and no menu items. Click 删除 → stage `已删除`, dialog closed. Reopen then overlay or Escape dismisses immediately. No `LiquidMenu` / traveling lens. Mobile not verified. |
| Browser `/ui/liquid-menubar` | Desktop: thin File/Edit command bar at top-left. Click 文件 opens 新建/打开/保存 with no selection plate. Click 打开 fires `file/open` and closes immediately. Escape closed. No `LiquidMenu` / traveling lens. Mobile not verified. |
| Skill install `test-7` | New blank Vite React app at `/Users/jay/Code/Liquid-Glasses-skill-test/test-7`. 14 kernel files + adapter byte-equal. `tsc -b` passed. Desktop: LiquidMenu 信息 travel → `menu: messages`, Enhanced optics. LiquidDropdown 设置 travel → close / `dropdown: settings`. Mobile: 设置 → `menu: settings`. Kernel bundle SHA-256 `60d21ba6c82f365ab71a4ee375d290e33d1f84e9bfa1358363775dbece0cb23c`. Visual approval pending. |
| Compact dropdown | `/ui/liquid-dropdown`: trigger 40×61 / 14px; open panel 200×172, row 36, travel plate 46, radius 16, density=compact. Click 信息 travels then closes. Sidebar still row 58 / density=panel. |
| Dropdown morph pop | Desktop 1280×800: pointerdown trigger `matrix(1.1, 0, 0, 0.84)`; pop samples 68×31 (t0) → 150×112 (t80) → 227×201 overshoot (t270) → 190×158 recover (t420) → 200×172 settle (t700). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; no leftover pop node. Mobile 390×844: same press squash; mid 174×140 then settle 200×172; click 照片 → trigger `照片` / `onValueChange: photos` / closed. Console errors: none. |
| ContextMenu action list | `/ui/liquid-context-menu` desktop 1280×800: right-click opens `liquid-glass-card` 168×116 with 剪切/复制/粘贴 and no `apple-clear-menu` / selection plate. Click 复制 fires `copy` and closes immediately. Console errors: none. Mobile not verified. |
| Nested overlay occlusion | `/ui/liquid-context-menu`: right-click over 「在此区域右键」. Nested backdrop computed `rgba(14, 18, 30, 0.54)` / `blur(40px) saturate(1.8)`. Hint glyphs not readable through the plate. Sidebar `LiquidMenu` still `data-host=standalone`. |
| Select compact + morph | `/ui/liquid-select` desktop: pop 68×31 (t80) → 219×193 overshoot (t270) → 200×172 settle (t700), `data-density=compact`. Trigger squash releases after open (`transform: none`). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed. Mobile 390×844: settle 200×172; click 照片 → trigger `照片` / `onValueChange: photos` / closed. |
| Overlay probe wash | `/ui/liquid-select` desktop 1280×800: default no `is-probe`, `::before` content `none`, toggle `aria-pressed=false` at top-right. Toggle on: 10px type on a 220×16 tile fills the stage evenly with `Liquid glass abcd ABCD 1234` (`test` removed). Click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed. Same toggle on `/ui/liquid-dropdown` (click 信息 → `messages` / closed), `/ui/liquid-context-menu` (right-click → 信息 → `messages` / closed), `/ui/liquid-popover` (network card, bubble stayed open), `/ui/liquid-dialog` (delete-confirm card), `/ui/liquid-menubar` (文件 → 打开 → `file/open` / closed). `/ui/liquid-menu` has no toggle and no probe type. Mobile 390×844 `/ui/liquid-select`: single-column catalog, toggle on, click 照片 → trigger `照片` / `onValueChange: photos` / closed. Console errors: none. |
| Popover bubble card | `/ui/liquid-popover` desktop 1280×800: click 网络 opens `liquid-glass-card` 260×152 with no `apple-clear-menu` / selection plate. Body 「办公室 Wi-Fi」 / 「已连接 · 5 GHz」. Click 断开 → card and stage both `未连接`, bubble stayed open. Escape closed. Console errors: none. Mobile not verified. |
| Dialog modal card | `/ui/liquid-dialog` desktop 1280×800: click 删除相册 opens a centered `liquid-glass-card` 260×152, overlay `rgba(6, 10, 18, 0.46)`, no `apple-clear-menu` / selection plate. Click 删除 → stage `已删除`, dialog closed. Reopen then Escape dismisses immediately. Console errors: none. Mobile not verified. |
| Menubar command bar | `/ui/liquid-menubar` desktop 1280×800: bar at stage 17×17, 111×36. Click 文件 opens `liquid-glass-card` 168×116 with 新建/打开/保存 and no `apple-clear-menu` / selection plate. Click 打开 fires `file/open` and closes immediately. Console errors: none. Mobile not verified. |
| Production deploy | Wrangler `4.92.0`. `npm run build` passed. Dry-run: 27 modules, `1742.22 KiB` / gzip `372.80 KiB`, no bindings. Production Worker `liquid-lab-optics-demo` version `c395db38-be40-43f5-b663-3d56591db275`, message `release liquid glass radix menu catalog`. `https://liquid.hkooii.com/ui` → `307` `/ui/liquid-menu`; all seven `/ui/*` routes `200`; workers.dev `/ui` → `307`; `/v2` still `200`. HTML contains Command bar / Right-click host / Glass bubble. Rollback target `50355dc2-6b65-4b7f-9955-83933c3ce75c`. |

## 4. Deployment and Release Status

Released to existing Worker `liquid-lab-optics-demo` via `dist/server/wrangler.json`. Version `c395db38-be40-43f5-b663-3d56591db275`, 100% traffic. Rollback target is previous version `50355dc2-6b65-4b7f-9955-83933c3ce75c`.

## 5. Known Risks, Limits, and Follow-up

- The morph is a CSS scale of the compact panel, not a true path-morph from the trigger’s rounded rect. Shape interpolation of the glass outline is follow-up.
- Nested host has no typeahead. Radix Dropdown has no `Item` children, so typeahead stays off.
- Arrow browse updates `value` after the travel fade so the plate can stay on the new row while the menu stays open.
- Embedded `backdrop-filter` samples the page behind the stage; the replica still clones the backdrop node, not live pixels under each glyph.
- No remaining overlay stub. Tab bar / Control Center Regular stay out of scope until system screenshots.
- Overlay batches verified desktop only; mobile is later.
