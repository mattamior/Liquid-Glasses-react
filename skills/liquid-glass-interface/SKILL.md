---
name: liquid-glass-interface
description: Build or refine Apple-inspired Web Liquid Glass interfaces using current official Apple design guidance as the primary authority, with layered refraction, Regular/Clear semantics, adaptive edge optics, semantic motion, independent light and dark tuning, accessibility, and graceful fallbacks. Use for translucent navigation, menus, toolbars, floating panels, selection plates, or controls in React, CSS, SVG, or comparable Web stacks; also use when a request says match/reproduce the original Demo, visual fidelity, 9/10, or do not redesign; and when diagnosing flat glassmorphism, fixed color rings, disconnected menu motion, excessive hover emphasis, or unsafe draggable controls.
---

# Liquid Glass Interface

Build Liquid Glass as an interface material that communicates hierarchy and state. Do not treat a low-opacity white rectangle or blur alone as the effect.

## Apple Design Authority

Before evaluating or implementing an Apple-inspired result, read [apple-design-logic.en.md](references/apple-design-logic.en.md). An equivalent Chinese edition is available at [apple-design-logic.zh.md](references/apple-design-logic.zh.md).

Use this source order: current Apple Human Interface Guidelines, current Apple Developer Documentation, Apple WWDC design sessions, then community implementation material. Community techniques may solve Web limitations but may not redefine Apple's hierarchy, material variants, lensing, adaptivity, motion, or legibility rules.

Treat the official logic as the primary acceptance standard, including when a user proposes a visual model. Correct an inaccurate premise instead of silently encoding it. If the user deliberately chooses a deviation after it is identified, implement it as a custom glass effect and do not describe it as Apple-aligned.

Keep four axes separate: Apple material variant (`Regular` or `Clear`), Web rendering tier (`baseline` or `enhanced`), appearance theme (`light` or `dark`), and interaction state. Baseline/Enhanced are never aliases for Regular/Clear.

## Fidelity Mode: Match the Original Demo

When the request says **match/reproduce the original Demo**, **visual fidelity**, **9/10**, or **do not redesign**, use low freedom. Copy `assets/fidelity-kit/` as a unit before changing content. It is the canonical high-fidelity asset, extracted from this repository's Demo; `assets/reference-implementation/` is only a small technical baseline, not a fidelity template.

Do not replace `SceneArtwork`, `createRoundedEdgeField`, the instance-safe RGB filter, `RefractedSurface`, dark/light tuning, toolbar-popover coupling, or the measured persistent selection plate with locally written equivalents. You may change copy, semantic menu items, placement, responsive layout, and scene colors only through the shared scene model. Generate the RG field from every actual surface width, height, and radius; never stretch one fixed field across surfaces.

Run `node skills/liquid-glass-interface/scripts/verify-fidelity-kit.js` after copying the kit. For a fidelity blind test, test the same menu at top, middle, and bottom scroll positions over readable large type, a grid, and color bands. The user must explicitly pass the experienced page; screenshots and automated checks cannot pass it.

## Workflow

1. Read the official design logic, then inspect the existing component, background, interaction states, browser targets, accessibility requirements, and performance constraints.
2. Decide whether glass belongs to the floating functional layer and clarifies navigation, controls, spatial hierarchy, or a transition. Prefer an ordinary opaque or translucent surface when it does not; avoid content-layer glass and glass-on-glass.
3. Establish readable layout, focus behavior, and the baseline material (fill, border, shadow) before adding optical effects.
4. Read [material-system.md](references/material-system.md) before implementing refraction or edge optics. For ordinary work, start with the technical baseline at [reference-implementation/index.html](assets/reference-implementation/index.html), then read [react-integration.md](references/react-integration.md). For fidelity mode, copy [assets/fidelity-kit/index.tsx](assets/fidelity-kit/index.tsx) and [fidelity.css](assets/fidelity-kit/fidelity.css) instead.
5. Read [interactions.md](references/interactions.md) before implementing menus, selection plates, coupled motion, or optional dragging.
6. Tune light and dark themes independently, then complete [themes-and-qa.md](references/themes-and-qa.md).
7. Verify the result in a real browser at rest, during transitions, over varied backgrounds, with keyboard input, on a narrow viewport, with reduced motion enabled, and with advanced optics disabled.

## Build the Material

Keep these layers independently adjustable:

1. Environment: meaningful color, light, and structure behind the surface.
2. Refraction: an optional clipped scene replica that displaces the environment without distorting foreground content.
3. Translucent fill: tint, blur, saturation, and contrast appropriate to the theme.
4. Edge optics: restrained highlights, shadows, and localized caustics that respond to shape and environment.
5. Content: undistorted labels, icons, focus indicators, and hit targets above the optical layers.

The whole surface participates in lensing, but its spatial gradient must follow geometry. Keep the center low-gradient, continuous, stable, and recognizable. Concentrate stronger position-dependent bending near rounded edges, where curvature is higher. Blur may support Regular-material legibility or soft scattering, but it must not replace lensing or dominate the enhanced result.

Choose the Apple material variant semantically. Use Regular by default for menus, popovers, sidebars, and substantial text; allow controlled blur, luminosity, tint, and shadow adaptation for legibility. Use Clear only over visually rich media when bold foreground content and a localized dimming treatment are acceptable. Do not mix variants casually.

Use two levels. The baseline is fill, border, shadow, then `backdrop-filter` when supported. The enhanced level is an environment-coordinate-aligned replica of an application-controlled visual scene, filtered and clipped behind the fill. Web platforms cannot reliably pass the live CSS backdrop directly into SVG `feDisplacementMap`; do not imply otherwise. Read [material-system.md](references/material-system.md) for the replica, React IDs, detection order, and privacy constraints.

## Reference Routing

- Official Apple semantics and vetoes: [apple-design-logic.en.md](references/apple-design-logic.en.md), with equivalent [Chinese edition](references/apple-design-logic.zh.md). Read this before all other references for Apple-inspired work.
- Technical baseline, not fidelity template: [assets/reference-implementation/index.html](assets/reference-implementation/index.html), [styles.css](assets/reference-implementation/styles.css), and [script.js](assets/reference-implementation/script.js). It demonstrates a shared scene model, rounded RG field, SVG `feDisplacementMap`, world-coordinate alignment, themes, and baseline/enhanced switches.
- Fidelity asset: [assets/fidelity-kit/index.tsx](assets/fidelity-kit/index.tsx) and [fidelity.css](assets/fidelity-kit/fidelity.css). It preserves the original Demo's scene complexity, geometry-specific SDF field, RGB filter, material tokens, coupled menu motion, and measured plate. Validate it with [scripts/verify-fidelity-kit.js](scripts/verify-fidelity-kit.js).
- React production integration: [react-integration.md](references/react-integration.md). Use it for per-instance IDs, measurement lifecycle, clipping boundaries, and privacy limits.
- Optical acceptance gate: [visual-acceptance.md](references/visual-acceptance.md). Do not call an implementation enhanced refraction unless every gate passes.
- Field-only check: run `node skills/liquid-glass-interface/scripts/verify-edge-field.js`.

Match the filter region, clipping path, and corner radius. Keep every layer removable so the component remains usable when standard `filter`, `backdrop-filter`, or `-webkit-backdrop-filter` are unsupported or too expensive.

## Add Semantic Motion

Drive motion from explicit interface state: open or closed, selected item, theme, material mode, or intentional panel position. Couple related toolbar and menu surfaces through a shared field or coordinated transform without temporarily flattening their rounded corners.

Treat material and motion as one system. Prefer changes in lensing, illumination, shape, connection, and apparent thickness over an ordinary fade-only transition. Keep the resting state visually quiet; let interaction energize the material. Larger menus may use deeper shadows, more pronounced lensing, and softer scattering than small controls while preserving a stable interior.

Move one persistent selection plate between items. Keep hover feedback quieter than the selected plate. Avoid continuous pointer-following effects unless they communicate a real interaction.

Do not make ordinary menus draggable. Enable dragging only for a genuine floating panel, canvas tool, spatial workspace, or an explicit user request; then follow the pointer, focus, capture, and boundary rules in the interaction reference.

## Theme and Accessibility Checks

Treat light mode as a separate optical system. Reduce chromatic separation and saturation when a displaced rounded edge becomes a fixed blue or purple ring. Preserve visible focus, readable text, adequate targets, and complete keyboard operation.

Apply Scroll Edge Effects semantics when moving body content competes with a floating control: soften, dissolve, or dim the content near the control to protect legibility. In production steady states, avoid disruptive high-contrast intersections between content and glass. Deliberately cross text, grids, and color bands only in QA scenes that need to prove refraction.

Honor `prefers-reduced-motion`; remove nonessential spring, morphing, and parallax motion while retaining immediate state changes. Keep the functional surface intact when filters, transparency, or motion are disabled.

## Safety and Scope

- Do not request, read, store, or transmit credentials, private files, personal data, or analytics for this visual workflow.
- Do not add external packages, remote assets, telemetry, or network calls unless the user explicitly requests them and the project requires them.
- Do not copy Apple artwork, source code, or proprietary assets. Describe the result as Apple-inspired unless the user owns the relevant rights.
- For native iOS 26 or later, prefer the platform's native Liquid Glass APIs. This skill intentionally provides Web guidance, not SwiftUI implementation recipes.
- Explain material limitations and browser fallbacks when handing off the result.

## Output Expectations

Report the Apple material variant, Web rendering tier, theme, component and states changed, material layers used, fallback behavior, accessibility coverage, validation performed, and any browser or performance risks. State any deliberate deviation from official Apple guidance. Keep demo-specific behavior out of reusable recommendations.
