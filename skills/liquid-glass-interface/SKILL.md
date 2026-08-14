---
name: liquid-glass-interface
description: Build or audit strict Apple-inspired Web Liquid Glass interfaces. Use for translucent navigation, menus, toolbars, floating panels, selection lenses, and Liquid Glass cards in React; use especially when a request requires the V1 original Demo, V2 vertical navigation, V3 horizontal navigation, visual fidelity, or verifiable implementation compliance.
---

# Liquid Glass Interface

Implement a versioned Liquid Glass contract, not a loose visual reference. Read [apple-design-logic.en.md](references/apple-design-logic.en.md) first.

## Select the Contract

Read [strict-conformance-contract.en.md](references/strict-conformance-contract.en.md) and [strict-conformance-contract.json](references/strict-conformance-contract.json) before copying assets. The JSON is the machine authority; the bilingual files explain it.

| Requested result | Select | Required result |
| --- | --- | --- |
| Original V1 Demo, fidelity, no redesign | `v1-fidelity` | Frozen V1 kernel. |
| No version, vertical navigation, temporary lens, cards | `v2-default` | Strict V2 kernel with Enhanced conformance route. |
| V3, horizontal navigation lens | `v3-horizontal` | Strict V3 kernel with Edge conformance route. |

Use `v2-default` when no mode is named. For an unknown `vN`, stop and ask the user to choose V1, V2, or V3. Never use `/v3-05-failed` or `v3-milestone-05-failed`.

Only report the selected name when every strict gate passes. If a kernel, state machine, optical layer, DOM role, required route, or evidence requirement changes, report `V1-inspired`, `V2-inspired`, or `V3-inspired` instead. Only Next.js App Router and Vite with React Router qualify for strict mode; all other frameworks are inspired.

## Strict Workflow

1. Preflight the target framework and select `strict` or `inspired`; do not call an unsupported framework strict.
2. Copy exactly one mode's kernel files listed in the machine contract. Do not edit them or mix modes. V2/V3 canonical demo bundles are publication references; strict target hashes use `assets/strict-kernels/`.
3. Copy the matching framework adapter and, for V2/V3, its conformance route and `conformance-scene.tsx` from [assets/](assets/). Pass typed V2/V3 config that the kernel renders: navigation items, V2 cards, copy, icons, route values, brand tokens, `initialOptics`, and post-commit callback. Preserve the adapter's strict kernel import and `config` hand-off; Vite projects must include `vite/client` types so `import.meta.env.PROD` type-checks. V1 permits only equal-length brand text, links, and outer layout.
4. Copy the schema `2.0` manifest for the selected mode/framework from `assets/liquid-glass.integration.<mode>.<framework>.json` to the target root as `liquid-glass.integration.json`. The unqualified template is only the V2 Next.js starter. Preserve every frozen integration hash; fill product entry points, counts, route consumer, Playwright JSON report hash, and visual-evidence hash. Keep `deviations` empty.
5. Keep V2/V3 conformance routes available in development/test and disabled or protected in production. Their deterministic scene must show a grid, type, and color bands; V2 must exercise Enhanced and V3 must exercise Edge.
6. Run `node <skill>/scripts/verify-target-integration.mjs --root <project> --manifest liquid-glass.integration.json [--json]`, the frozen Playwright harness, and the host project's checks. The verifier reads files only and never executes manifest command strings. Obtain explicit human visual approval last.

Read [strict-conformance-contract.zh.md](references/strict-conformance-contract.zh.md) for the same contract in Chinese. Read [react-integration.md](references/react-integration.md), [interactions.md](references/interactions.md), [material-system.md](references/material-system.md), and [themes-and-qa.md](references/themes-and-qa.md) only for the selected implementation work.

## Kernel Boundaries

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
