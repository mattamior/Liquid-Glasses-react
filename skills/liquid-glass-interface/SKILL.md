---
name: liquid-glass-interface
description: Build or refine Apple-inspired Web Liquid Glass interfaces using official Apple design guidance, layered controlled-scene refraction, accessible fallbacks, and semantic motion. Use for translucent navigation, menus, toolbars, floating panels, selection lenses, or Liquid Glass cards in React, CSS, SVG, or comparable Web stacks; also use when a request says reproduce the V1 Demo, visual fidelity, 9/10, do not redesign, V2 vertical navigation, or V3 horizontal navigation.
---

# Liquid Glass Interface

Build Liquid Glass as a functional interface material, not a low-opacity white rectangle or blur.

## Read First

Read [apple-design-logic.en.md](references/apple-design-logic.en.md) before evaluating or implementing Apple-inspired work. Use its source priority: current Apple Human Interface Guidelines, current Apple Developer Documentation, Apple WWDC design sessions, then community material. Do not call a deliberate deviation Apple-aligned.

Keep four axes separate: Apple material variant (`Regular` / `Clear`), Web rendering tier (`baseline` / `enhanced`), appearance theme, and interaction state. `baseline` / `enhanced` are never asset-mode names or aliases for `Regular` / `Clear`.

## Select One Asset Mode

Use exactly one mode before copying code. Read the mode's asset files and the public references named below.

| Mode | Select when | Asset and result |
| --- | --- | --- |
| `v1-fidelity` | The user explicitly asks to reproduce the V1 original Demo, visual fidelity, 9/10, or not redesign. | [assets/v1-fidelity-kit/](assets/v1-fidelity-kit/): frozen high-fidelity React route. Preserve its stage, menu, theme, floating-panel drag, measured surfaces, and RGB field/filter. |
| `v2-default` | Ordinary Web navigation, sidebars, temporary selection lenses, or Liquid Glass cards. | [assets/v2-reference-implementation/](assets/v2-reference-implementation/): the default React route with vertical navigation and three cards. |
| `v3-horizontal` | The user explicitly asks for V3 or a horizontal four-column navigation lens. | [assets/v3-horizontal-navigation/](assets/v3-horizontal-navigation/): M04 horizontal-navigation React route. It is independent and never replaces V2. |

When no mode is named, use `v2-default` unless the request explicitly triggers V1 or V3. If an unknown `vN` is requested, do not guess or silently map it to V1/V3: state that only these three modes are available and ask the user to choose.

`/v3-05-failed` and `v3-milestone-05-failed` are failed-M05 historical archives. Never copy them, present them as a mode, use them as a default/reference baseline, or add them to a verifier or visual acceptance.

## Copyable Route Assets

Each asset folder is the smallest complete Next App Router route bundle. Copy its `layout.tsx`, `page.tsx`, CSS, and `lens-optics.ts` where present as a unit; do not combine source files from different modes.

- **V1:** Read `assets/v1-fidelity-kit/page.tsx`, `v1.css`, and `layout.tsx`. Run `node skills/liquid-glass-interface/scripts/verify-v1-fidelity-kit.js` after copying. Use low freedom and do not redesign the archived interaction.
- **V2:** Read `assets/v2-reference-implementation/page.tsx`, `lens-optics.ts`, `v2.css`, and `layout.tsx`. It keeps one transient vertical lens, all-primary-pointer drag, V2 theme storage, capability detection, and independently refracted card containers. Run `node skills/liquid-glass-interface/scripts/verify-v2-reference-implementation.js`.
- **V3:** Read `assets/v3-horizontal-navigation/page.tsx`, `lens-optics.ts`, `v3.css`, and `layout.tsx`. It keeps an inset slider, one large travelling lens, current-tab-only all-primary-pointer drag, M04 Baseline/Edge review selection, system-first theme, and direct no-filter/reduced-motion/forced-colors fallback. Run `node skills/liquid-glass-interface/scripts/verify-v3-horizontal-navigation.js`.

## Common Workflow

1. Read [material-system.md](references/material-system.md) before refraction or edge optics, [interactions.md](references/interactions.md) before menu motion or dragging, and [themes-and-qa.md](references/themes-and-qa.md) before acceptance.
2. Establish semantic layout, focus, contrast, and functional baseline fill/border/shadow before optical enhancement.
3. Use independently adjustable environment, controlled refraction replica, translucent fill, edge optics, and undistorted content. Never filter labels, focus, hit targets, forms, user data, or third-party content.
4. Use an application-controlled scene replica only after measured coordinate alignment is ready. Read [react-integration.md](references/react-integration.md) for React IDs, geometry lifecycle, privacy, V2, and V3 contracts.
5. Tune light and dark themes independently. Complete [visual-acceptance.md](references/visual-acceptance.md) before claiming enhanced refraction.

## Material and Motion Rules

Use `Regular` by default for navigation, menus, popovers, sidebars, and substantial text. Use `Clear` only over rich media with bold foreground content and justified local dimming. Keep the refraction interior low-gradient and stable; concentrate stronger geometry-following change near rounded edges. Blur supports legibility and scattering but never substitutes for lensing.

Ship baseline first: readable fill, border, shadow, focus, and controls without SVG. Enhanced Web refraction uses a clipped, `aria-hidden`, application-controlled replica aligned to the visible scene and displaced with `feDisplacementMap`. Do not use screenshots, arbitrary DOM capture, `feTurbulence`, repeated gradients, or `backdrop-filter` alone as claimed refraction.

For V2, keep the committed selection flat while the temporary lens is active; commit content and the single `aria-current` only after settling and fading. Primary mouse, touch, and pen share the `>5px` Pointer Events drag contract. For V3, only the committed button begins a drag; retain one `aria-current`, preview visually, snap in `260ms`, and release pointer capture, timers, and animation frames on every terminal path. Do not make ordinary menus draggable outside these explicit patterns.

## Fallback and Acceptance

Honor reduced motion and forced colors. Keep hierarchy, focus, keyboard operation, and semantic selection when Canvas, SVG, filters, transparency, or motion are unavailable. V2 and V3 use direct/static selection if their required enhanced path is unavailable; V3 explicitly supports SVG/Canvas no-filter fallback and forced colors.

Automated checks support review but never replace the human visual gate. Test rest and transition states, light/dark themes, narrow viewports, keyboard focus, varied backgrounds, and fallback modes. For V1, test the same menu at top, middle, and bottom scroll positions and obtain explicit user approval. Call an implementation enhanced refraction only when controlled background grid, type, or color bands visibly bend by position at the lens edge while foreground content remains stable.

## Output

Report the selected asset mode, Apple material variant, Web rendering tier, theme, changed states, material layers, fallback behavior, accessibility coverage, validation performed, and browser/performance risks. State deliberate deviations from Apple guidance. Do not claim deployment, release, or human visual approval unless actually verified.
