# Liquid Glass Interface Skill Implementation Plan

**Goal:** Publish a reusable Web Liquid Glass Skill whose GitHub source can be installed by agents and distributed through Skill stores without maintaining divergent copies.

**Architecture:** Keep the canonical Skill at `skills/liquid-glass-interface/` in this repository. Use `SKILL.md` for the core workflow, `references/` for progressive disclosure, and `LICENSE.txt` for package-level licensing. Keep the package limited to file types accepted by all confirmed stores; omit optional Codex-only UI metadata when it prevents direct distribution. Treat global installations as derived copies. Keep user-facing method documentation in matched Chinese and English files.

## Constraints

- Treat current official Apple guidance as the primary design authority（首要设计权威） in this order: HIG, Apple Developer Documentation, Apple WWDC design sessions, then community implementation notes.
- Keep Apple Regular/Clear variants（材料变体） separate from Web Baseline/Enhanced rendering tiers（渲染等级）.
- Target React, CSS, SVG, and comparable Web stacks; exclude native SwiftUI recipes.
- Treat dragging as optional for floating panels or explicit requests, never as a default menu behavior.
- Keep plate geometry travel separate from its optical sweep: derive a sweep only from a user selection's measured previous-to-next two-dimensional center vector; omit it when reliable measurement is unavailable or layout-only remeasurement occurs.
- Clip only optical wrappers; keep focus, controls, and overlays outside clipping or render overlays through a portal. Require explicit SVG `clipPath` coordinate systems and dimensions.
- Call enhanced refraction only when a controlled background grid, text, or color band visibly bends at the glass edge by position; turbulence, fixed/repeated gradients, and blur alone are not evidence.
- Every blind test requires an isolated runnable page, automatic opening of its local preview, and explicit user approval after experience. Automated text, structure, or screenshot checks cannot pass visual acceptance.
- Keep `SKILL.md` under 500 lines with only `name` and `description` in frontmatter.
- Do not include credentials, telemetry, remote assets, hidden network requests, or automatic installation scripts.
- Use the MIT license and describe the work as Apple-inspired and unofficial.
- Do not publish to any external store until the user approves the exact preview.

## Task 1: Canonical Skill package

- [x] Initialize `skills/liquid-glass-interface/` with `SKILL.md`, `LICENSE.txt`, and `references/`.
- [x] Define the five-layer material workflow, semantic motion, independent theme tuning, accessibility, fallbacks, and safety boundaries.
- [x] Add focused material, interaction, and theme/QA references.
- [x] Add matched Chinese and English official-design references covering source priority, functional-layer use, lensing, Regular/Clear, adaptivity（适配）, motion, Scroll Edge Effects（滚动边缘效果）, accessibility, and Apple-aligned vetoes.
- [x] Route every Apple-inspired task through the official-design reference before implementation mechanics.
- [x] Add measured-direction, optical-clipping, SVG-coordinate, genuine-refraction, and mandatory human-visual-gate rules after the blind-test failure.
- [ ] Run structural and content validation.

## Task 2: Public documentation and licensing

- [x] Add `docs/liquid-glass-interface.zh.md` and `docs/liquid-glass-interface.en.md` with matching scope and conclusions.
- [x] Document the blind-test failure and the original Demo's transferable core without temporary local-preview identifiers.
- [x] Add a low-freedom fidelity kit extracted from the original Demo, routing triggers, invariant verification, and three-scroll-position human vetoes.
- [x] Bind toolbar layout to the fidelity content wrapper and add desktop/narrow geometry vetoes to prevent wrapper-layout regressions.
- [x] Keep each replica as a full stage-sized world at the exact negative surface origin; add marker-based top/middle/bottom pixel-alignment vetoes.
- [x] Re-measure surfaces after layout-state invalidation and transition/animation completion; provide a centered-fixed cluster contract whose absolute popover cannot move its toolbar.
- [x] Unmount closed popover optics, split scroll world-origin writes from field/state rebuilds, and add material visibility plus long-page performance vetoes.
- [x] Synchronize the official Apple design authority, material-variant distinctions, test/production separation, and deviation labeling across the public Chinese and English method documents.
- [x] Link the method and Skill from every README entry point.
- [x] Add the MIT `LICENSE`.
- [ ] Check document parity, links, spelling, and whitespace.

## Task 3: Repository verification

- [ ] Run the Skill validator.
- [ ] Run repository tests and lint.
- [ ] Inspect the complete diff for unrelated changes and sensitive content.
- [ ] Review the Skill against the Xiaohongshu service agreement and uploader package restrictions.
- [ ] Confirm the isolated blind-test page opens locally and the user explicitly passes the experienced interaction; do not mark acceptance from automation alone.

## Task 4: Xiaohongshu SkillHub preview

- [ ] Install the official `skillhub-upload` CLI from the URL published in `uploader.md`.
- [ ] Run `whoami`; use device OAuth only if required.
- [ ] Load the current platform tags instead of hardcoding one.
- [ ] Run `publish <absolute-skill-path> --dry-run --agent --source original --tag <tag>`.
- [ ] Present the exact name, immutable identifier, version, description, source, and tags to the user.
- [ ] Run the real publish command only after the user explicitly says “提交”.

## Task 5: Version control and other stores

- [ ] Commit and push only after explicit user approval.
- [ ] Use the GitHub commit/tag as the release source of truth.
- [ ] Add store-specific manifests or generated adapters only when a confirmed target store requires them; do not duplicate the authored Skill content.
