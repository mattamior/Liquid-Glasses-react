# Enhanced Refraction Acceptance Gate

## Official Apple Design Vetoes

Read [apple-design-logic.en.md](apple-design-logic.en.md) before this technical gate. A result may pass the Web refraction checks below yet still fail Apple-aligned design acceptance.

Do not call the result Apple-aligned when any condition is true:

1. The component does not belong to a floating functional layer, or glass is overused in content and decoration.
2. The implementation conflates the Apple material variant (`Regular`/`Clear`) with the Web rendering tier (`baseline`/`enhanced`).
3. The whole interior waves, stretches, or distorts instead of remaining low-gradient, continuous, stable, and recognizable.
4. Rounded edges lack stronger localized lensing that follows geometry, or blur/fill dominates the claimed enhanced effect.
5. A menu or substantial-text popover behaves like Clear without a justified media-rich context, bold foreground, and dimming strategy.
6. Size, background, or interaction changes do not adapt shadow, tint, dynamic range, lensing, or scattering where needed.
7. Material appears or disappears through a generic fade alone instead of preserving a causal relationship through light, lensing, and form.
8. Glass-on-glass, opaque fills, fixed color rings, or excessive tint break the functional hierarchy.
9. A production steady state keeps disruptive high-contrast content intersections without a legibility or Scroll Edge Effects treatment. QA scenes may create these intersections only to test refraction.
10. Current official Apple guidance was not checked before relying on community patterns.

An implementation may be called **enhanced refraction** only when all of these are true:

1. The visible background and optical copy come from the same application-controlled scene model/component, not a screenshot or arbitrary DOM capture.
2. The copy is placed from measured world coordinates and is updated for resize, scroll, and transform-driven layout changes.
3. The SVG pipeline uses a real `feDisplacementMap` whose RG field is neutral near 128 at the center and follows rounded-rectangle normals at edges and corners.
4. The scene gives observers something to verify: a grid, a nonuniform color band, and readable large type cross the lens; all show a visible, localized bend at the edge.
5. Replica overscan and SVG filter region cover maximum displacement plus blur, and only the optical wrapper is clipped.
6. Foreground labels, focus treatments, hit targets, menus, and popovers are outside the filtered/captured layer.
7. Light mode has independently reduced chroma so there is no static cyan, purple, or blue perimeter ring.

If any item is missing, call the result **baseline glass**: fill, border, shadow, and optional ordinary backdrop blur. Do not describe blur alone, a fixed colored outline, `feTurbulence`, or a repeated local gradient as enhanced refraction.

## Fidelity-Mode Vetoes

For requests to match or reproduce the original Demo, fail the blind test when any condition below is true:

1. The visible environment and every replica do not invoke the same scene function/component.
2. A surface stretches, reuses, or approximates a field instead of generating its RG field from that surface's measured width, height, and radius.
3. The reviewer has not opened the same menu at top, middle, and bottom scroll positions over readable large type, a grid, and color bands.
4. The user has not explicitly passed the experienced page. Screenshot, DOM, field, or image-diff checks are supporting evidence only.
5. The layout geometry has not passed review. At desktop and at `<=560px`, measure a 56–76 px toolbar, three horizontal non-overlapping back/title/more columns, a centered title, and a popover fully inside the viewport. Console output and successful clicks do not replace this veto.
6. Runtime pixel alignment has not passed review. At top, middle, and bottom scroll positions, compare the pre-filter DOM rectangles of matching visible/replica markers (for example `[data-fidelity-anchor="word"]` within `[data-fidelity-scene="visible"]` and `"replica"`). Position and size error must each be `<=1px`; otherwise do not call the result enhanced refraction.

CSS transforms and opacity transitions do not change box size and therefore may not notify `ResizeObserver`. Re-measure stable alignment after the relevant surface's `transitionend` or `animationend`, using one animation-frame callback; state that changes layout must also invalidate geometry. Do not accept an in-motion measurement. For a viewport-centered fixed coupled menu, use the kit's `fidelity-menu-cluster--viewport-centered` contract: its popover is absolutely positioned so opening it cannot alter cluster height and move the toolbar; verify the constrained popover remains in the viewport.

## Visibility and Long-Page Performance Vetoes

At rest, a closed popover must be unmounted or otherwise have no painted border/shadow, no active replica/filter, and no scroll measurement. Do not retain a near-zero-height glass surface. Do not create an enhanced field or filter before non-zero geometry is ready.

Compare baseline and enhanced over a high-contrast word or grid crossing the lens edge. Enhanced must show a localized edge displacement that baseline does not; counting filter primitives is not evidence. Mark the surface mode and a shared refraction target so this comparison can be automated.

For a long page with a fixed lens, record enhanced and baseline scroll rAF mean, frames above 20 ms, frames above 33 ms, maximum frame, and DevTools forced reflow. Scroll must imperatively update only the replica world origin; width, height, radius, or stage-size changes may rebuild React state and the field. The filter window must remain lens-sized, even though its source world remains full stage-sized. Without CPU throttling, enhanced must not show sustained consecutive frames above 33 ms, and its maximum must be materially below the previous 84 ms failure; explain any remaining gap to baseline.

## Manual visual check

At rest and after scrolling/resizing, toggle baseline/enhanced and dark/light. In enhanced mode, the grid, color bands, and word must stay world-aligned while bending only near the lens boundary. In baseline mode, the same content remains readable but no SVG displacement is claimed. Open an overlay and confirm it can extend beyond the rounded optical wrapper.
