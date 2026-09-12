# LiquidSheet docks to the stage and keeps refraction aligned

**Date:** 2026-09-12
**Status:** Landed on `grok/liquid-glass-radix-menu`; not published to the production Worker

## 1. Scope and decision

`/ui/liquid-sheet` used to portal onto `document.body` and fill the viewport. The replica wash froze at the slide-in start, so the pane covered catalog chrome and sampled the wrong background.

Decision: the catalog passes the stage node as `container` so the sheet slides in from the stage’s right edge. `StageWash` realigns every frame while mounted. Product mounts that omit `container` still portal to `document.body` as a viewport-right column. Displacement kernel, traveling plate, and spring stay frozen.

## 2. What landed

- `LiquidSheet` accepts `container`. Enter/exit motion lives on Radix `Content` so Presence waits for the slide-out.
- `liquid-controls.css`: 300/320px right column, no scale, `data-contained` is absolutely positioned.
- Previews: `OverlayPreviewStage` exposes the portal; Sheet and Table detail mount into the stage.
- `LiquidGlassCard` remesures `worldX/Y` while an ancestor animation or transition is running.
- Kernel extract copied into the Skill.

## 3. Evidence

| Check | Result |
| --- | --- |
| Branch | `grok/liquid-glass-radix-menu` |
| Source-to-kernel verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` passed: `{ files: 29, source: 'app/apple-clear' }` |
| Browser desktop 1280×800 | `/ui/liquid-sheet` open 账号 → 300×496 glass column on the stage right. `StageWash` box matches `.ui-studio__preview`. sky/dusk/light refraction stays continuous. Escape dismisses. |
| Browser mobile 390×844 | Sheet stays inside the stage, 300px wide, stage remains visible on the left. |
| `/ui/liquid-table` | Click 亚太 opens the same right column titled 亚太. |

## 4. Publish status

Worker was not deployed. Public site remains `ced4b0d6-f829-4be6-aae8-64869fb453c1`.

## 5. Risks and follow-up

- Catalog overlays sample the stage wash, not the live DOM. Product mounts must pass their own `scene`.
- Full-height field generation is heavier than a menu card; width is capped at 300–320px.
- The table preview stacks the sheet on a glass table. That is catalog chrome, not a product recommendation.
