# Liquid Glass Interface Skill Three-Mode Implementation Plan

Date: 2026-08-13

Status: approved implementation plan

Implementation status: implemented

Implementation decision: [Liquid Glass Interface Three-Mode Skill Decision Record](../../decisions/liquid-glass-interface-three-modes.en.md)

## Summary（摘要）

Synchronize（同步） the repository's only `liquid-glass-interface` Skill with the current codebase and provide three fixed, explicitly selectable modes inside one Skill: frozen high-fidelity（高保真） reproduction `v1-fidelity`, default vertical-navigation and card implementation `v2-default`, and M04 horizontal-navigation implementation `v3-horizontal`. V2 remains the default; failed M05 remains only a repository historical archive（历史归档）, not a Skill asset or selectable mode.

This plan defines subsequent（后续） implementation only. It does not change current routes, the Skill, README files, deployment, or release status.

## Modes and Selection Rules（模式与选择规则）

The Skill keeps one entry point: `skills/liquid-glass-interface/SKILL.md`. It must require selection of one mode below and keep the mode separate from Apple material variants (`Regular` / `Clear`), Web rendering tiers (`baseline` / `enhanced`), theme, and interaction state:

| Fixed identifier（固定标识） | Purpose and selection condition（用途与选择条件） | Default and limit（默认与限制） |
| --- | --- | --- |
| `v1-fidelity` | Use only when the user explicitly asks to “reproduce the V1 original Demo”, “visual fidelity”, “9/10”, or “do not redesign”. | Frozen V1 low-freedom reproduction only; never the ordinary-navigation default. |
| `v2-default` | Use for ordinary Web navigation, sidebars, temporary selection lenses, and Liquid Glass cards. | Default when no mode is specified. |
| `v3-horizontal` | Use only when the user explicitly selects V3 or a horizontal four-column navigation lens. | An independent experiment（独立实验）; it must not replace V2 default behavior. |

When the user supplies an unknown `vN` identifier, the Skill must not guess, fall back to V1, or treat it as V3. It must explain that only the three fixed modes are supported and request a selection. When no mode is specified and the request does not trigger V1 or V3, use `v2-default`. Every mode still reads Apple design logic first, then the shared material, interaction, theme, and acceptance references.

`/v3-05-failed` and `v3-milestone-05-failed` remain a direct-access historical archive（历史归档） for failed M05. The Skill may explain that boundary, but must not list it as a mode, copy it as an asset, set it as the default reference, add it to a verifier（验证器）, or use it as a new visual-acceptance baseline.

## Skill Assets and Shared References（Skill 资产与公共参考）

Keep one distributable（可分发） Skill. Do not split it into three independent Skills or copy the full repository test tree. The final directory layout is:

```text
skills/liquid-glass-interface/
  SKILL.md
  LICENSE.txt
  agents/openai.yaml
  assets/
    v1-fidelity-kit/
      layout.tsx
      page.tsx
      v1.css
    v2-reference-implementation/
      layout.tsx
      page.tsx
      lens-optics.ts
      v2.css
    v3-horizontal-navigation/
      layout.tsx
      page.tsx
      lens-optics.ts
      v3.css
  references/
  scripts/
    verify-v1-fidelity-kit.js
    verify-v2-reference-implementation.js
    verify-v3-horizontal-navigation.js
```

- Update `SKILL.md` with the three-mode table, selection and unknown-version handling, default V2, M05 exclusion（排除）, each mode's source asset, fallback（降级）, and output requirements.
- Add `agents/openai.yaml` with only the minimum presentation metadata（展示元数据） required for the Skill. It is not a runtime dependency（运行时依赖） and introduces no network access.
- Retain `LICENSE.txt` and the shared design authority, material system, interactions, React integration, theme QA, and acceptance references in `references/`; update statements that no longer match current V2 or V3 behavior.
- Retain and adapt the V1 verifier; replace the existing V2 verifier that checks only the old native-page asset with a current React-asset verifier; add a V3 horizontal-navigation verifier.
- Do not copy the complete `app/`, `tests/`, or snapshot directories. Each asset directory contains only the smallest complete implementation that can be copied into a Next App Router route: its styles, layout bootstrap（布局启动脚本）, and optics module where applicable（适用时）.

## Three Complete Portable Assets（三种完整可移植资产）

### `v1-fidelity`

Use frozen `app/v1/page.tsx`, `app/v1/v1.css`, and `app/v1/layout.tsx` as the current authoritative（权威） source. Update the existing `assets/v1-fidelity-kit/` so it is a complete React route asset that can be copied directly. Retain the stage, menu, theme, floating-menu drag, toolbar/popover coupling（耦合）, geometry measurement, RGB displacement field, and filter. Do not redesign or replace its interaction merely to align it with V2 or V3.

Automated acceptance must verify the page, style, and layout assets, plus invariants（不变量） for the controlled scene, replica（副本）, geometry-specific displacement field, instance-safe filter, optical clipping, coupled menu, and closed-state resource cleanup（资源清理）. Manual acceptance must measure toolbar, three-column, title, and popover geometry on desktop and at `<=560px`; experience the same menu at top, middle, and bottom scroll positions; and obtain explicit user approval before calling it high fidelity.

### `v2-default`

Use current `app/v2/page.tsx`, `app/v2/lens-optics.ts`, `app/v2/v2.css`, and `app/v2/layout.tsx` to create the complete portable asset, replacing the existing old native HTML/CSS/JavaScript V2 reference implementation. The asset must retain vertical navigation, exactly one `aria-current`, a temporary selection lens that commits only after click, settling, and fading, shared primary mouse/touch/pen `>5px` Pointer Events dragging, theme-storage bootstrap, `baseline` / `enhanced` controls, and capability fallback（能力降级）.

The asset must also contain the current three Liquid Glass cards: visible environment and replica share `AmbientScene`; cards own an independent rounded-edge displacement field, capped DPR, eight-entry LRU cache, optical-only clipping, `aria-hidden` decorative layers, and crisp content. When Canvas, SVG, `backdrop-filter`, reduced motion, or forced colors are unavailable, navigation and cards must retain a complete functional Baseline appearance.

Automated acceptance must verify the four portable files, navigation and card optics configuration, one controlled replica, unique semantic selection, all-pointer input, theme persistence（主题持久化）, and fallback paths; retain repository V2 SSR, optics, and E2E regression coverage. Manual acceptance must cover light/dark themes, Baseline/Enhanced, all three cards, click, mouse/touch/pen drag, narrow viewports, reduced motion, and forced colors.

### `v3-horizontal`

Add the complete `assets/v3-horizontal-navigation/` asset. Its only source is the current M04 baseline at `/v3`: `app/v3/page.tsx`, `app/v3/lens-optics.ts`, `app/v3/v3.css`, and `app/v3/layout.tsx`. The asset must retain four native buttons, one navigation-level inset selection slider, layered muted base buttons and white visual replica, a large travelling lens on click, primary mouse/touch/pen drag that may begin only on the current button, a `5px` threshold, rail clamping（轨道限制）, nearest-tab preview, a `260ms` release snap, and rollback and cleanup on cancellation, lost capture, resize, and unmount.

The asset must retain Baseline/Edge query selection, a fixed lens-sized filter viewport containing the complete navigation-world replica, system-first theme with optional `liquid-lab:v3-theme` override, static selection when SVG constructors or Canvas are unavailable, and direct commits for reduced motion and forced colors. It must not import M05 dynamic-optics configuration, caching, or styles from `/v3-05-failed`.

Automated acceptance must verify the four portable files, M04 asset provenance（来源）, three visual worlds, fixed lens filter viewport, exactly one `aria-current`, current-item-restricted pointer session, release cleanup, theme bootstrap, and all fallbacks. Retain repository V3 SSR, optics, and E2E regression coverage. Manual acceptance must cover desktop and narrow viewports, click travel, mouse/touch/pen drag, mid-travel Edge lens content, system and stored themes, no filter, reduced motion, and forced colors.

## Automated and Manual Acceptance（自动化与人工验收）

After implementation, all commands below must pass, and M05 archive snapshots must not be updated:

```bash
node skills/liquid-glass-interface/scripts/verify-v1-fidelity-kit.js
node skills/liquid-glass-interface/scripts/verify-v2-reference-implementation.js
node skills/liquid-glass-interface/scripts/verify-v3-horizontal-navigation.js
npm test
npm run lint
npm run test:e2e -- tests/e2e/v2-optics.spec.ts tests/e2e/v2.spec.ts tests/e2e/v3-optics.spec.ts tests/e2e/v3.spec.ts
git diff --check
```

`npm run test:all` may run as additional full regression（全量回归）. If it fails, record the actual output from that run; do not reuse a historical failure statement. Browser-test execution must close Playwright sessions on success, failure, and timeout, leaving no browser or daemon process（守护进程）.

Automation cannot replace the human visual gate. V1 requires real user experience and explicit approval. V2 and V3 require their mode-specific manual checks for legibility（可读性）, focus, keyboard operation, semantic selection, background refraction, themes, and fallbacks. Call a result enhanced refraction only when a grid, word, or color band from an application-controlled background visibly bends by position at the lens edge.

## Assumptions, Documentation, and Completion Handling（假设、文档与完成处理）

The defaults are that the three modes share Apple design authority and shared references inside one Skill; V2 remains default; a complete portable asset means the smallest file set that can be copied into a Next App Router route, not an independent npm package or complete repository copy; and this work adds no dependencies, remote assets, telemetry, credential access, or publication action.

During implementation, every mode asset must record the synchronized（同步的） source path and Git commit to prevent asset/application drift（漂移）. If implementation materially deviates（实质偏离） from this plan, the implementation decision record must state the deviation, reason, and final choice.

This plan itself creates no decision record and does not update README files. When implementation finishes, this is a substantial（重要） multi-file batch that changes the public Skill surface, so create structurally equivalent Chinese and English decision records:

```text
docs/decisions/liquid-glass-interface-three-modes.en.md
docs/decisions/liquid-glass-interface-three-modes.zh.md
```

Those records must state scope and decision, actual delivery and changed areas, exact verification evidence, deployment or release status, known risks, and follow-up synchronization work. At that time update decision links, Skill description, and structure notes in `README.md`, `README.en.md`, and `README.zh.md`, and synchronize necessary method documents. Retain this plan as historical intent; after implementation, add a completion status linking to the decision records. If it is materially superseded（实质替代）, mark it superseded rather than rewriting it as an acceptance record.
