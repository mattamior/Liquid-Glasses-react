# bbg-admin Catalog Controls Decision Record

**Date:** 2026-09-12
**Status:** Implemented on `grok/liquid-glass-radix-menu`; not released to the production Worker

## 1. Scope and Decision

Compare every `~/Code/BBG/bbg-admin` UI pattern and ship `/ui` pages in the same catalog style. Optics stay frozen. `Label` lives on Input. shadcn primitives plus table, pagination, status pill, tree, toolbar, and native `<select>` are covered.

## 2. Delivered Result and Changed Areas

bbg-admin `src/components/ui` has 11 files. Product code uses Button, Input, Label, Textarea, Checkbox, RadioGroup, Select (file exists; product mostly uses native `<select>`), Dialog, AlertDialog, Sheet, and Card.

`/ui` now has 21 entries. New module surfaces: Table, Pagination, Pill, Tree, Toolbar, Native Select. Button gains sm / ghost; Input gains hint / error / disabled. Compact sidebar scrolls; narrow viewports cap the rail at ~32vh so the stage is clickable. Kernel extract is 29 files.

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| Branch | `grok/liquid-glass-radix-menu` |
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `{ files: 23, source: 'app/apple-clear' }` |
| `npm test` | Production build passed. Render tests `12/12` passed, including the eight new `/ui/*` `200`s. |
| Browser desktop 1280×800 | `/ui/liquid-button` click 新建 → `onClick: create`. `/ui/liquid-input` account → `root`. `/ui/liquid-checkbox` check 10002 → `10001, 10002`. `/ui/liquid-radio` click 启用 → `ENABLED`. `/ui/liquid-alert` open 禁用账号, click 禁用 → `已禁用`. `/ui/liquid-sheet` open 账号 with `admin@bb.game`, Escape → `已关闭`. Sidebar Dialog still reaches `/ui/liquid-dialog`. |
| Browser mobile 390×844 | `/ui/liquid-button` in light landed on Button with 15 rail items. Console errors: none. Stage buttons sat below the long rail and were not clicked. |
| Desktop follow-up | `/ui/liquid-table` 亚太 opens sheet `APAC`; page 2 shows 东南亚; search 欧洲 → 1 row. `/ui/liquid-tree` check Write + Regions → `regions · acc-read,acc-write`. `/ui/liquid-toolbar` query admin + Enabled → `admin · ENABLED`. `/ui/liquid-native-select` single + multiple present. |
| Mobile follow-up | `/ui/liquid-table` 390×844 亚太 opens the detail sheet. |
| `npm test` again | Production build passed. `12/12`, including 21 `/ui/*` `200`s. |
| Kernel verifier | `{ files: 29, source: 'app/apple-clear' }` |

## 4. Deployment and Release Status

No Worker deploy. Public site remains `ced4b0d6-f829-4be6-aae8-64869fb453c1`.

## 5. Known Risks, Limits, and Follow-up

- Button, input, checkbox, radio, native select, and toolbar are glass capsules, not whole-surface `feDisplacementMap` shells. Table and tree sit in `LiquidGlassCard`.
- Alert overlay click does not dismiss, unlike Dialog.
- bbg-admin UI patterns are covered. Login is Card+Input+Button, not a separate catalog page.
- Overlay-family mobile verification remains deferred. Not deployed.
