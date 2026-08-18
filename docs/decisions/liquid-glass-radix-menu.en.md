# Liquid Glass Radix Menu Decision Record

**Date:** 2026-08-18
**Status:** Implemented on `grok/liquid-glass-radix-menu`; visual approval pending; not deployed

## 1. Scope and Decision

The portable deliverable is the floating menu, not the home-screen lab. New work lives on `grok/liquid-glass-radix-menu`. Product mounts copy the kernel and render `LiquidMenu`, `LiquidDropdown`, or `LiquidContextMenu`. Radix owns open, focus, and dismiss. Optics stay frozen.

This batch finishes **only** `LiquidContextMenu`. Other unfinished overlays are not patched here.

The layer immediately behind the menu must be blur or a solid color so labels stay readable.

## 2. Delivered Result and Changed Areas

- `LiquidMenu` accepts `items`, `value`, `defaultValue`, `onValueChange`, `title`, `theme`, `optics`, optional `scene`, and `host`.
- Kernel `host` is `standalone` (wraps `@radix-ui/react-navigation-menu`) or `nested` (plain `nav`, own arrow/Home/End/Enter). Overlay hosts must pass `nested` so two Radix menus are not stacked.
- `LiquidDropdown` is the first finished overlay: trigger + portal; pointer or reselect closes after the travel fade; Arrow/Home/End browse and commit without dismissing; Enter/Space confirm and close; Escape and outside click dismiss immediately.
- `LiquidContextMenu` is the second finished overlay: right-click surface + portal; same nested-host keyboard and delayed close as `LiquidDropdown`.
- Catalog sidebar (`CatalogNav`) keeps a pending selected index after commit so a late `router.push` cannot spring the plate back and replay travel. Sidebar labels `nowrap` and scale from the left so long English names stay on one row and share a left edge.
- `/ui` catalog. Left rail is itself a `LiquidMenu`. `/liquid-menu` redirects to `/ui/liquid-menu`.
- `LiquidSelect`, `LiquidPopover`, `LiquidDialog`, and `LiquidMenubar` remain catalog stubs from the earlier 5-pack. They are not completed in this batch.
- Skill extract stays byte-equal with `app/apple-clear`.

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| Branch | `grok/liquid-glass-radix-menu` |
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `{ files: 14, source: 'app/apple-clear' }` |
| Browser `/ui/liquid-dropdown` | Desktop 1280×800: open; click 信息 → travel → trigger `信息` / `onValueChange: messages` / closed; ArrowDown 信息→设置 → menu stayed open / `onValueChange: settings`; Enter closed and restored trigger focus; Escape closed; click current 设置 closed; click sidebar rail dismissed. Sidebar `LiquidMenu` still `host=standalone` and routed to `/ui/liquid-menu`. Mobile 390×844: pointerdown+click 信息 → travel → closed / `onValueChange: messages`. |
| Sidebar alignment + single travel | After CSS `display:contents` on the Radix viewport and `nowrap` labels: all seven label left edges at 42px, row pitch 66px, hit targets match visuals, Menubar stays inside the shell. Click LiquidDropdown → LiquidDialog: `--apple-selection-y` 66 → 345 overshoot → 330, stays 330 across `/ui/liquid-dialog`; no snap-back. |
| Browser `/ui/liquid-context-menu` | Desktop: right-click opens nested host; click 信息 → travel → `onValueChange: messages` / closed; ArrowDown 信息→设置 stays open / `settings`; Enter closes; Escape closes; outside pointerdown closes; reselect 设置 closes immediately. Mobile 390×844 long-press opens; pointerdown+click 照片 → travel → closed / `photos`. `/ui/liquid-dropdown` still opens nested host. |
| Production deploy | Not run |

## 4. Deployment and Release Status

Repository and Skill-asset change only. No Worker deploy.

## 5. Known Risks, Limits, and Follow-up

- Nested host has no typeahead. Radix Dropdown has no `Item` children, so typeahead stays off.
- Arrow browse updates `value` after the travel fade so the plate can stay on the new row while the menu stays open.
- Embedded `backdrop-filter` samples the page behind the stage; the replica still clones the backdrop node, not live pixels under each glyph.
- Next batch: finish `LiquidSelect` only, reusing `host="nested"`.
