---
name: liquid-glass-interface
description: Build or audit Apple-system Liquid Glass on the Web. Default to a floating menu with whole-surface refraction and a traveling selection lens. Backdrop-filter frost alone is not Liquid Glass. Use V1/V2/V3 only when the request explicitly asks to reproduce those repository studies.
---

# Liquid Glass Interface

Implement Apple-system Liquid Glass on the Web. Read [apple-design-logic.en.md](references/apple-design-logic.en.md) first, then look at the gold stills in [assets/visual-targets/apple/clear-folder/](assets/visual-targets/apple/clear-folder/).

## Select the Contract

Read [strict-conformance-contract.en.md](references/strict-conformance-contract.en.md) and [strict-conformance-contract.json](references/strict-conformance-contract.json) before copying V1/V2/V3 assets. Apple Clear uses the extracted kernel; do not invent a substitute pane.

| Requested result | Select | Required result |
| --- | --- | --- |
| No version, Apple glass, folder, floating panel, Clear | `apple-liquid-glass` | Extracted Clear kernel over a home-screen environment. |
| Original V1 Demo, fidelity, no redesign | `v1-fidelity` | Frozen V1 kernel. Label `V1-inspired` unless every V1 gate passes. |
| Vertical navigation, temporary lens, admin cards | `v2-default` | Strict V2 kernel. Label `V2-inspired` unless every V2 gate passes. |
| V3, horizontal navigation lens, Longbridge-style thick lens | `v3-horizontal` | Strict V3 kernel. Label `V3-inspired` unless every V3 gate passes. |

Use `apple-liquid-glass` when no mode is named. For an unknown `vN`, stop and ask the user to choose Apple Clear, V1, V2, or V3. Never use `/v3-05-failed` or `v3-milestone-05-failed`. Never treat a KPI content card as the default Apple surface.

Only report the selected name when every strict gate passes. If a kernel, state machine, optical layer, DOM role, required route, or evidence requirement changes, report `Apple-inspired`, `V1-inspired`, `V2-inspired`, or `V3-inspired` instead. Only Next.js App Router and Vite with React Router qualify for strict mode; all other frameworks are inspired.

## Strict Workflow

1. Preflight the target framework and select `strict` or `inspired`; do not call an unsupported framework strict.
2. For `apple-liquid-glass`, copy every file in [assets/strict-kernels/apple/](assets/strict-kernels/apple/) and the matching `apple-strict-adapter.tsx`. Mount `LiquidMenu` for an always-visible panel, `LiquidDropdown` for trigger-plus-portal, `LiquidContextMenu` for a right-click action list, `LiquidSelect` for a form-like trigger, `LiquidPopover` for a glass bubble that holds arbitrary children, `LiquidDialog` for a centered modal glass card, or `LiquidMenubar` for a command bar of File/Edit titles. Overlay mounts must pass `host="nested"`. Do not edit optics, the traveling plate, or the spring. The layer immediately behind the menu must be blur or a solid color so labels stay readable. `HomeScreenScene` is lab chrome only (`variant: "lab"`); do not require it in product mounts.
3. For V1/V2/V3, copy exactly one mode's kernel files listed in the machine contract. Do not edit them or mix modes. V2/V3 canonical demo bundles are publication references; strict target hashes use `assets/strict-kernels/`.
4. Copy the matching framework adapter and, for V2/V3, its conformance route and `conformance-scene.tsx` from [assets/](assets/). Apple Clear config may only change title, items, theme, size, optics, brand tokens, and the controlled scene renderer. V2/V3 config remains navigation items, V2 cards, copy, icons, route values, brand tokens, `initialOptics`, and post-commit callback. Preserve the adapter's strict kernel import and `config` hand-off; Vite projects must include `vite/client` types so `import.meta.env.PROD` type-checks. V1 permits only equal-length brand text, links, and outer layout.
5. For V1/V2/V3, copy the schema `2.0` manifest for the selected mode/framework from `assets/liquid-glass.integration.<mode>.<framework>.json` to the target root as `liquid-glass.integration.json`. The unqualified template is only the V2 Next.js starter. Preserve every frozen integration hash; fill product entry points, counts, route consumer, Playwright JSON report hash, and visual-evidence hash. Keep `deviations` empty.
6. Keep V2/V3 conformance routes available in development/test and disabled or protected in production. Their deterministic scene must show a grid, type, and color bands; V2 must exercise Enhanced and V3 must exercise Edge. Apple Clear must keep the wallpaper grid, clock type, and color icons visible through the pane.
7. Run `node <skill>/scripts/verify-apple-clear-kernel.js` when shipping Apple Clear from this repository, or `node <skill>/scripts/verify-target-integration.mjs --root <project> --manifest liquid-glass.integration.json [--json]` for V1/V2/V3. The verifier reads files only and never executes manifest command strings. Obtain explicit human visual approval last. Without that approval, report `implemented-awaiting-visual-approval`.

Read [strict-conformance-contract.zh.md](references/strict-conformance-contract.zh.md) for the same contract in Chinese. Read [react-integration.md](references/react-integration.md), [interactions.md](references/interactions.md), [material-system.md](references/material-system.md), and [themes-and-qa.md](references/themes-and-qa.md) only for the selected implementation work.

## Kernel Boundaries

- **Apple Liquid Glass:** Preserve the extracted floating menu. Mount `LiquidMenu` (`items`, `value` / `defaultValue`, `onValueChange`). Hit targets use Radix Navigation Menu (`asChild`); do not replace them with a restyled Tailwind menu. The menu shell displaces a world replica across the whole surface. Item changes MUST run the temporary traveling lens (`click → dragging → settling → fading`) before committing `aria-current`. Blur is optional scattering only (`<=10px`). If the result is indistinguishable from frosted glass (`backdrop-filter` without position-dependent bending), it is not Liquid Glass.
- **V1:** Preserve every kernel file and interaction. Permit only route mounting, equal-length brand copy, link targets, and outer layout.
- **V2:** Preserve vertical navigation, one transient selection lens, delayed commit of content and `aria-current`, primary mouse/touch/pen drag, controlled replica, and independently refracted cards. Provide at least two configured navigation items and one configured optical card.
- **V3:** Preserve horizontal navigation, one inset slider, travelling lens, preview/commit separation, current-tab-only primary drag, `>5px` threshold, and `260ms` release snap. Provide at least two configured navigation items.

Never filter foreground labels, focus indicators, hit targets, forms, user data, or third-party content. Never substitute CSS blur, a fixed gradient, `feTurbulence`, or `backdrop-filter` for refraction. Keep baseline fully functional for reduced motion, forced colors, unavailable SVG filters, and unavailable backdrop filters.

## Evidence and Output

Store E2E evidence as a SHA-256-locked Playwright JSON report with zero failures and every contract-required title. Store visual evidence as a SHA-256-locked JSON approval record with an identified reviewer, ISO timestamp, and at least one hash-locked screenshot. Before valid visual approval, set `visualApproval.status` to `pending` or `rejected` and report `implemented-awaiting-visual-approval`; validation errors are `non-compliant`, and only valid approved evidence is `strict-complete`. Automated screenshots are evidence, not approval.

Report this table exactly, using `N/A` only for non-strict inspired work:

| Mode | Framework | Schema | Conformance | Kernel SHA-256 | Frozen integration SHA-256 | Deviations | Conformance route | Playwright JSON evidence | Visual evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| selected mode | selected framework | `2.0` | strict/inspired | values | values | value | path/availability | path/hash/result | pending/rejected/approved + path/hash | status |

Run the source asset verifier for the selected mode as a publication check. It does not validate a target project; target verification and E2E are required separately.
