# Themes and Visual QA

Read [apple-design-logic.en.md](apple-design-logic.en.md) first. Theme is independent from the Apple material variant and the Web rendering tier: Light/Dark, Regular/Clear, and Baseline/Enhanced are three separate decisions.

## Apple Variant and Adaptivity Checks

- Use Regular by default for menus, popovers, sidebars, and substantial text. Its blur, luminosity, tint, shadow, and dynamic range may adapt to protect legibility without hiding environmental continuity.
- Use Clear only over rich media with bold foreground content and a justified localized dimming layer. Do not use it merely because greater transparency looks more dramatic.
- Increase material depth carefully with size: larger menus may use deeper shadows, stronger edge lensing, and softer scattering while retaining a stable low-gradient interior.
- Adapt separation to the background. Text beneath glass may justify stronger shadow or softening; uniform backgrounds need less treatment.
- Treat deliberate high-contrast intersections as QA evidence, not a default production steady state. Use a Scroll Edge Effects-style softening, dissolving, or dimming treatment when scrolling content competes with controls.

## Dark Theme Tuning

Dark environments can tolerate slightly stronger displacement, saturation, colored caustics, and depth shadows because bright edges remain localized. Keep text and icons neutral, and check that glass does not collapse into a uniformly blue surface.

## Light Theme Tuning

Tune light mode independently. Begin with aligned displacement channels, lower saturation, a neutral white highlight, and a lighter shadow. High RGB dispersion combined with rounded clipping often becomes a fixed closed neon ring; treat that as a rendering defect, not as required refraction.

Keep the center transparent enough to reveal the environment without making the edge the dominant feature. Test over pale blue, white, high-contrast, and moving backgrounds.

## Accessibility and Motion

- Map Reduced Transparency to a more opaque or frostier functional fallback, Increased Contrast to stronger foreground and boundary separation, and Reduced Motion to less elasticity, morphing, parallax, and nonessential light movement.
- Preserve at least WCAG 2.2 4.5:1 contrast for body text across representative background samples. Large text and UI component boundaries, including visible focus indicators, must reach at least 3:1.
- Provide visible `:focus-visible` treatment that does not depend on transparency.
- Keep interactive targets at least as large as the host product requires.
- Support keyboard navigation and screen-reader state independently of animation.
- Under `prefers-reduced-motion: reduce`, remove nonessential interpolation, spring overshoot, parallax, and pointer-following motion.
- Ensure `forced-colors` and no-filter fallbacks retain hierarchy and controls. A reduced-transparency media query is an optional platform enhancement, not a cross-browser baseline; the formal fallback must work when SVG filters or `backdrop-filter` are absent.

## Performance

Limit the number and area of filtered surfaces. Avoid animating blur radii, large filter regions, or several nested backdrops. Prefer transforms and opacity for motion.

Profile the open, close, selection, hover, scroll, and resize paths on the lowest target device. At the target refresh rate, the interaction must not continuously miss the frame budget; use 16.7 ms per frame as the 60 Hz reference. If the material affects responsiveness, degrade in this order:

1. Disable or reduce SVG displacement.
2. Reduce filter area or displacement texture resolution.
3. Disable `backdrop-filter` and retain the fill, border, shadow, focus, and selection hierarchy.

## Browser and Fallback Matrix

Validate each supported product target, not only the development browser. At minimum, use this matrix:

| Target | Required checks |
| --- | --- |
| Chromium | Normal material, disabled SVG displacement, disabled `backdrop-filter`, forced colors, and reduced motion. |
| Safari/WebKit | Normal material with `-webkit-backdrop-filter`, disabled SVG displacement, disabled backdrop filtering, and reduced motion. |
| Firefox | Normal supported path, disabled SVG displacement, disabled `backdrop-filter`, forced colors, and reduced motion. Do not assume WebKit-prefixed behavior. |
| Target WebView | The actual embedded-engine version, normal path, no SVG displacement, no backdrop filtering, forced/high-contrast mode where exposed, and reduced motion. |

For every matrix cell, confirm that content remains readable and clickable, focus is visible, keyboard behavior and current-selection semantics remain correct, rounded clipping is intact, and the fallback preserves a usable hierarchy. In light mode, also inspect pale blue, white, high-contrast, and moving backgrounds for a fixed blue, cyan, or purple closed ring.

## Mandatory Human Visual Gate

Every blind test must produce an isolated, runnable page for the specific component and states under review. Open its local preview automatically, then obtain an explicit user experience and approval before calling the work accepted. Do not treat text review, DOM/structure checks, automated screenshots, or image-diff results as a substitute for this gate; they can identify defects but cannot pass it.

The human review must exercise the resting state, open/close transition, selection changes (including rapid changes), light and dark themes, narrow or wrapped layout, keyboard focus, and at least one varied background. Record the user's pass/fail conclusion and any requested correction, but do not record temporary local ports, process IDs, or machine-specific preview details in reusable documentation.

## Genuine-Refraction Evidence

Only call a result **enhanced refraction** when the reviewer can see a background grid, text, or color bands bend by a position-dependent amount at the glass edge while foreground content remains stable. Move the glass or the controlled background to confirm that the bend follows their relative geometry.

The following are not enhanced refraction and must be described honestly as texture, decoration, blur, or fallback material: `feTurbulence`; a fixed-gradient pseudo-element; locally repeated gradients; or `backdrop-filter` alone. A fixed ring, noise field, or generic blur does not demonstrate displaced environmental sampling.

## Review Checklist

- Does the glass communicate a navigation, control, or spatial relationship?
- Are environment, refraction, fill, edge optics, and content independently identifiable?
- Does refraction respond to the environment rather than behave like a fixed border?
- Does the reviewer observe position-dependent bending of a background grid, text, or color bands at the glass edge—not merely turbulence, gradients, repeated texture, or blur?
- Was the blind-test page opened locally and explicitly approved by the user after interacting with it? Automated checks alone cannot pass this item.
- Is there any fixed blue, cyan, or purple closed ring in light mode?
- Do toolbar and menu remain rounded and visually related throughout opening and closing?
- Does the selection plate stay inside the menu with restrained overshoot?
- Is hover visibly quieter than selection?
- Are text, focus, keyboard behavior, and hit targets intact?
- Does the selection plate remeasure after font loading, resize, scrolling, item mutation, and narrow-screen reflow?
- During a V2 navigation interaction, does exactly one continuous replica appear with no hard core/edge boundary, folded text, duplicate glyph, missing glyph, or colored material strip below the lens?
- Does the center remain at the stable sampling scale while edge magnification and normal refraction increase continuously toward the rounded contour?
- Does the temporary lens hide the idle flat selection, then fade before the target content, `aria-current`, and flat selection commit?
- Does a release between rows use the final pointer position and settle to the nearest item, while only cancellation or lost capture returns to the origin?
- Does an optical sweep use the prior-to-next measured two-dimensional center vector, including wrapped rows, RTL, vertical writing, scroll containers, and rapid selections; and remain absent for layout-only remeasurement?
- Are clipping/masking rules confined to the optical wrapper, with focus and overlays outside it or in a portal?
- Does every SVG `clipPath` declare a valid `objectBoundingBox` or explicit `userSpaceOnUse` coordinate system rather than ambiguous percentage geometry in zero-sized defs?
- Does reduced motion remove nonessential animation?
- Do narrow viewports, no-filter fallback, and forced-colors modes remain functional?
- Has every target in the browser matrix passed its required fallback checks?
- Does text meet 4.5:1 and large text/UI boundaries meet 3:1, including focus indicators?
- Does the lowest target device avoid sustained frame-budget misses during interaction, or does it apply the prescribed degradation order?
