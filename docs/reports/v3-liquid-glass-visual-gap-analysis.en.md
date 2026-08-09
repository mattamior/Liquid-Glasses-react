# V3 Liquid Glass Visual Gap Analysis（视觉差距分析）

Date: 2026-08-10
Status: diagnosis（诊断） and implementation plan（实施方案）; this report contains no visual fix, deployment, or code test run for this batch.

## 1. Executive Summary（执行摘要）

The current `/v3` has accessible horizontal navigation, a temporary lens, a Canvas displacement field, and SVG `feDisplacementMap`. It still differs materially from the complete Longbridge reference set. The largest gap is not one meniscus（弯月面） value: the full viewport contains experiment controls absent from the references, and the lens samples a label-only visual replica rather than a complete navigation scene. Mid-travel frames therefore have a grey centre and too few content fragments.

Keep the local Canvas normal field（法线场） → SVG `feDisplacementMap` approach. Do not add WebGL or runtime reference images. The next batch should first unify world and lens coordinates, replace the partial replica with one complete world sample（完整场景采样）, and remove the hard-coded `scale(1.45)` before tuning the surface layers.

## 2. Scope and Reference Evidence（分析范围与参考证据）

- Scope is the `/v3` desktop reference frame at `1264 × 948`, covering static selection, Open→Activity, Activity→Market, and Edge review frames. V1 and the default V2 are out of scope.
- The user-supplied nine JPEGs live in [`docs/references/v3-longbridge`](../references/v3-longbridge/). Their state mapping, dimensions, and SHA-256 values are in [`reference-index.en.md`](../references/v3-longbridge/reference-index.en.md#L18-L28), including static [`144625`](../references/v3-longbridge/IMG_20260806_144625.jpg), mid-travel [`144645`](../references/v3-longbridge/IMG_20260806_144645.jpg), and leftward mid-travel [`144732`](../references/v3-longbridge/IMG_20260806_144732.jpg).
- Current local regression frames are [`Open→Activity mid`](../../tests/e2e/v3.spec.ts-snapshots/v3-open-to-activity-mid-drag-chromium-darwin.png) and [`Activity→Market mid`](../../tests/e2e/v3.spec.ts-snapshots/v3-activity-to-market-mid-drag-chromium-darwin.png). They are lens crops, not full-viewport reference comparisons.
- The references establish captured appearance and states only; they do not independently establish duration, easing, or filter values. See [`reference-index.en.md`](../references/v3-longbridge/reference-index.en.md#L39-L45).

## 3. CodeGraph Index Evidence and Limits（建图证据与限制）

This batch used the local CLI `@colbymchenry/codegraph@1.5.0`; its executable is `/Users/jay/.local/bin/codegraph`. `codegraph init .` ran with `CODEGRAPH_TELEMETRY=0`. In this version initial indexing is the default and `--index` is deprecated.

| Evidence | Result |
| --- | --- |
| `codegraph status .` | 27 files, 309 nodes, 639 edges; SQLite WAL; index current. |
| `codegraph query V3Page` | `app/v3/page.tsx:229`. |
| `codegraph query createEllipticalField` | `app/v3/page.tsx:108`. |
| `codegraph query LensFilter` | `app/v3/page.tsx:149`, plus a same-named V1 symbol. |
| `codegraph node V3Page` | Returned the current V3Page source with line numbers. |

CodeGraph indexed only 27 TypeScript, TSX, and JavaScript files in this run. It did not index `v3.css`, Markdown, or JPEG. CSS, screenshot, and reference findings therefore use line-numbered source/file searches as supporting evidence; a broad natural-language `explore` result must not be treated as the visual implementation map.

## 4. Current Implementation Map（当前实现地图）

| Area | Path and lines | Current responsibility |
| --- | --- | --- |
| Route and entry | [`app/page.tsx:1-5`](../../app/page.tsx#L1-L5), [`app/v3/layout.tsx:1-15`](../../app/v3/layout.tsx#L1-L15) | The root route redirects to `/v2`; V3 is an independent direct route. |
| Parameters and field | [`app/v3/page.tsx:65-174`](../../app/v3/page.tsx#L65-L174) | Defines the 872×210 rail, 296×242 lens, 24px meniscus, 11px Baseline refraction, and 1.14 Edge multiplier; Canvas creates an elliptical normal field for the SVG displacement filter. |
| Geometry and state machine（状态机） | [`app/v3/page.tsx:363-547`](../../app/v3/page.tsx#L363-L547) | Measures navigation geometry, uses ResizeObserver, and drives click primed/expanding/travelling/idle states. |
| Drag and snap | [`app/v3/page.tsx:579-696`](../../app/v3/page.tsx#L579-L696) | Handles the 5px threshold, frame-limited positions, nearest-tab selection, cancellation, and window fallback. |
| Layer tree | [`app/v3/page.tsx:706-780`](../../app/v3/page.tsx#L706-L780) | Injects CSS variables; renders base, selection, and lens `NavVisual` replicas, SVG defs, and experiment controls. |
| Rail and slider | [`app/v3/v3.css:93-212`](../../app/v3/v3.css#L93-L212) | Styles the capsule rail, four-column base visual, and static selection slider. |
| Lens and content mapping | [`app/v3/v3.css:240-344`](../../app/v3/v3.css#L240-L344) | Positions and transitions the lens, grey viewport, and local world replica; the current replica uses `scale(1.45)`. |
| Surface layers | [`app/v3/v3.css:346-418`](../../app/v3/v3.css#L346-L418) | Draws the inner ring, two meniscus masks, top/bottom poles, and sheen. |
| Automation | [`tests/e2e/v3.spec.ts:47-51`](../../tests/e2e/v3.spec.ts#L47-L51), [`84-119`](../../tests/e2e/v3.spec.ts#L84-L119), [`170-192`](../../tests/e2e/v3.spec.ts#L170-L192), [`249-270`](../../tests/e2e/v3.spec.ts#L249-L270) | Fixes the viewport and key geometry; captures only five local lens frames. |

## 5. Reference-versus-Current Gaps（参考图与当前效果的差异）

| Priority | Gap | Evidence | Current behaviour and impact |
| --- | --- | --- | --- |
| P0 | Full-viewport composition（构图） | The static reference has no title or optics controls; [`page.tsx:731-733`](../../app/v3/page.tsx#L731-L733) always renders both. | Text and controls outside the target necessarily change the hierarchy of the whole image. |
| P0 | Lens content sampling | Reference [`144645`](../references/v3-longbridge/IMG_20260806_144645.jpg) contains large white icon/Chinese-character strokes; the current mid crop is mainly grey at the centre. | A label-only replica cannot continuously represent rail, selection, and environment; mid frames lack the reference content density. |
| P0 | Coordinates and magnification（放大） | [`v3.css:319-329`](../../app/v3/v3.css#L319-L329) hard-codes `scale(1.45)`; the test permits lens-centre error below 4px at [`v3.spec.ts:160-163`](../../tests/e2e/v3.spec.ts#L160-L163). | Reference text/icon positions and coverage cannot be reproduced reliably; a 4px tolerance preserves visible offset. |
| P1 | Surface material（表面材质） | [`v3.css:268-418`](../../app/v3/v3.css#L268-L418) uses fixed grey fill, gradients, and masks. | Contour, inner dark return, and top/bottom caustics（焦散） do not yet read as one continuous neutral thick-glass surface. |
| P1 | Baseline/Edge roles | [`page.tsx:134-136`](../../app/v3/page.tsx#L134-L136) raises Edge by 1.14; [`v3.css:286-294`](../../app/v3/v3.css#L286-L294) also changes border/shadow. | Both modes change several appearances, making it difficult to attribute a difference to refraction rather than border or brightness. |
| P2 | Regression coverage | The reference index says the JPEGs are not pixel baselines; existing tests focus on local crops. | Background, rail, side button, static state, and full viewport composition are not automatically protected. |

## 6. Technical Root Causes（技术根因）

1. The temporary lens at [`page.tsx:773`](../../app/v3/page.tsx#L773) copies only `NavVisual`, while the viewport at [`v3.css:308-317`](../../app/v3/v3.css#L308-L317) has a near-opaque grey fill. It is not a continuous sample of the full underlying scene.
2. World-to-lens transformation is split between React CSS variables and CSS transform, with `scale(1.45)` as a visual approximation. It is not calibrated with icon/text landmarks（锚点） from the reference frames.
3. Rail, lens, and surface appearance are controlled by separate constant groups, without one composition boundary（合成边界） for coordinate space, surface, and sample source.
4. Automation verifies interaction semantics and box geometry but not full-viewport composition, content density, or frame landmarks against the reference scene.

## 7. Recommended Solution（推荐方案）

1. Retain Canvas normal field → SVG `feDisplacementMap`; keep JPEGs review-only. Do not add WebGL, runtime images, or dependencies.
2. Remove the experiment title and optics UI at [`page.tsx:731-733`](../../app/v3/page.tsx#L731-L733) from reference mode, or place them in an explicit demo layer excluded from reference screenshots.
3. Put one complete, single rail/world sample（完整场景采样：rail fill, four items, static selection visual）inside the fixed lens viewport. Apply the displacement filter only to that sample. Do not stitch a stable core and edge from multiple replicas.
4. Remove `scale(1.45)` at [`v3.css:327`](../../app/v3/v3.css#L327). Use one calibrated coordinate transform composed of `lensCenter`, `worldOrigin`, and `opticScale`; fit it from icon/text anchors in the four moving references. Bring final centre error below 1.5px to eliminate the currently permitted visible 4px offset.
5. Lock Baseline geometry, grey fill, inner dark ring, outer rim, and top/bottom caustics first. Edge must be the same geometry with a refraction-strength tier only, not a simultaneous independent scale, border, or shadow change.

## 8. Phased Implementation（分阶段实施）

| Phase | Deliverable | Exit condition |
| --- | --- | --- |
| 0: Measurement | Annotate rail, side button, lens, and icon/text anchors in all nine references; establish the `1264 × 948` baseline. | A reviewable coordinate table exists for every target state. |
| 1: Composition and coordinates | Remove out-of-reference UI; implement one complete world sample; replace `scale(1.45)` and converge centre offset. | Five key frames meet the Section 9 geometry and content-anchor thresholds. |
| 2: Optical surface | Keep the Canvas/SVG pipeline; tune Baseline displacement, inner dark return, rim, and caustics separately; tune Edge strength only. | Baseline and Edge share geometry; the surface has no seam or duplicate glyph. |
| 3: Regression and compatibility | Add full-viewport state screenshots, anchor checks, Chromium/Firefox/WebKit smoke tests, and native Safari review. | Automated checks pass and a manual overlay review records all nine frames. |

## 9. Quantified Acceptance Thresholds（量化验收阈值）

| Item | Threshold |
| --- | --- |
| `1264 × 948` baseline geometry | Each measured anchor for dock, rail, side button, and lens outline is within ≤ 1px. |
| Lens centre and content anchors | Mean centre/icon/text landmark error ≤ 1.5px; maximum ≤ 2px; no remaining 4px tolerance. |
| Content mapping | Text/icon scale error in four moving frames ≤ 2%; no large unsupported pure-grey empty centre in the lens. |
| Layer integrity | Static state has one white selected replica only; moving state has no duplicate glyph, seam, or early committed selection. |
| Regression | Screenshot checks for 1 static full viewport + 4 moving full viewports + 1 Edge full viewport; all existing interaction, reduced-motion, and ARIA checks pass. |
| Performance and logs | At 60Hz drag, position-update p95 ≤ 16.7ms; no page error or console warning; rebuild the field only on size or optics change. |

## 10. Browser Compatibility, Performance, and Rollback（浏览器兼容、性能与回滚）

- Chromium is the automation baseline. Run Firefox and WebKit smoke checks, then require a native Safari manual check because SVG `feDisplacementMap` and CSS masks can differ in rendering and performance.
- The single complete sample should update only transform while dragging. Rebuild the Canvas field only after ResizeObserver or optics changes, never per pointer event, to avoid repeated data-URL allocation.
- Retain the current path behind a feature flag（功能开关） or separate reference-optics variable. If Safari or performance acceptance fails, roll back to the current Baseline visual/interaction path, not Pointer Events, reduced motion, or the `aria-current` contract.

## 11. Current Delivery, Release Status, and Risks（当前交付、发布状态与风险）

This report adds diagnosis, plan, and a CodeGraph-index ignore rule only. It does not implement a visual fix; it does not modify `app/`, `tests/`, snapshots, or existing decision records; it does not deploy; and it does not run code tests in this batch. Local `.codegraph/` data is now ignored by Git and is not a release artifact.

Known risks are JPEG compression/capture timing not being cross-browser pixel truth, pre-existing uncommitted working-tree changes, and CodeGraph not indexing CSS/Markdown/JPEG. The next batch should complete the Phase 0 coordinate table first, run the full test/browser review on a clean reproducible instance, and only then decide whether to deploy.
