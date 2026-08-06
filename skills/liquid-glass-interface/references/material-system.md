# Material System

Read [apple-design-logic.en.md](apple-design-logic.en.md) first. This reference translates those official semantics into Web rendering mechanics; it does not redefine them.

## Optical Meaning Before Technique

Lensing applies across the complete surface. Keep the interior low-gradient so background structure remains continuous and recognizable; increase position-dependent displacement near rounded edges according to the signed-distance normal. Refraction and distortion are not separate effects: visible distortion is the result of a changing refraction vector across nearby samples.

Do not use whole-surface waves, noise, or stretching to make the effect easier to notice. Do not let blur hide the edge displacement. Larger surfaces may simulate thicker material with deeper shadows, more pronounced edge lensing, and softer scattering, but their interior must remain stable.

Choose an Apple material variant independently from the Web rendering tier:

- **Regular**: default for menus, popovers, sidebars, and substantial text; adapt blur, luminosity, tint, shadow, and dynamic range for legibility.
- **Clear**: use only over rich media when bold foreground content and localized dimming are acceptable.
- **Baseline/Enhanced**: technical capability levels. Either Apple variant may fall back to Baseline; Enhanced does not mean Clear.

## Five-Layer Model

Separate the material into environment, refraction, translucent fill, edge optics, and content. Render text and controls above the optical layers so distortion never harms legibility or pointer geometry.

The environment must contain enough tonal or color variation for refraction to be visible. If the background is uniform, rely on subtle highlights and depth rather than increasing distortion until it becomes decorative noise.

## Two-Level Delivery Strategy

These levels describe Web rendering capability, not Apple's Regular/Clear material variants.

### Baseline: functional glass

Always ship this level first: theme-aware translucent or near-opaque fill, neutral border or inner highlight, depth shadow, and ordinary readable content. Add blur and saturation only when `backdrop-filter` or `-webkit-backdrop-filter` is supported. This level must preserve hierarchy, focus, hit targets, and contrast without any SVG filter.

### Enhanced: controlled scene replica

Web platforms cannot stably and generally feed the live CSS backdrop into SVG `feDisplacementMap`. `backdrop-filter` samples pixels behind an element, while SVG filter inputs do not expose that sampled backdrop as a portable `SourceGraphic`. Do not describe a filter applied to a translucent overlay as true displaced backdrop refraction.

For genuine Web refraction, render a second, presentational copy of an application-controlled visual scene behind the glass. Give the replica the same scene model, size, breakpoints, and world coordinates as the visible environment; translate it by the glass surface's measured scene-relative origin; apply SVG displacement only to that replica; then clip it to the glass shape. Keep the visible scene semantic and interactive, and make the replica `aria-hidden`, inert, and non-interactive.

Never create the replica with DOM screenshots, canvas captures, screen capture APIs, or implicit capture of arbitrary page pixels. It may contain only visual layers the application owns and explicitly permits: for example CSS gradients, decorative SVG, a known canvas scene, or deterministic data-driven artwork. Do not duplicate private page content, user data, forms, messages, or embedded third-party content.

## Refraction With an SVG Displacement Map

Generate or provide a displacement texture whose neutral interior is centered near RGB 128 and whose edge vectors follow the rounded surface. Use the red and green channels as the horizontal and vertical displacement inputs. Keep the filter region slightly larger than the element so displaced pixels are not clipped.

```html
<filter id="liquid-lens" x="-15%" y="-20%" width="130%" height="140%">
  <feImage href="rounded-edge-field" result="map" />
  <feDisplacementMap
    in="SourceGraphic"
    in2="map"
    scale="12"
    xChannelSelector="R"
    yChannelSelector="G"
  />
</filter>
```

Apply the filter to the aligned controlled scene replica, not foreground content and not an unverified overlay. Use identical rounded clipping for the visible surface and the replica. Overscan the replica and expand the SVG filter region by at least the maximum displacement in every direction so displaced pixels do not clip. Tune blur, saturation, contrast, and tint in CSS outside the SVG filter so theme changes remain legible and easy to debug.

### Field requirements

The field is not a decorative gradient. Generate it per lens geometry: RGB 128 at the interior, positive/negative R/G values in an edge band, and vectors that follow the signed-distance normal of the rounded rectangle. The reference implementation's `createRoundedEdgeField({ width, height, radius, edgeBand, strength })` is the copyable implementation and its script asserts center, straight-edge, and corner samples. Do not use `feTurbulence`, repeating CSS gradients, or a fixed image as a substitute for that field.

Keep the optical wrapper's overscan at least `maximum displacement + blur radius` (the reference uses 28 px for scale 18 and blur 2), and make the SVG filter region larger too. The panel itself must not use `overflow: hidden` if a popover or menu is allowed to escape; clip only the replica/fill/edge wrapper.

### React identity and clipping pattern

Generate IDs per component instance. React `useId()` can contain colons, which are legal in an HTML `id` but awkward in CSS selectors and unquoted `url()` values. Encode non-safe characters before using it in SVG IDs, and use quoted fragment URLs from inline React styles; do not target the generated ID with a CSS `#id` selector.

```tsx
import { useId, type CSSProperties } from "react";

function makeSvgSafeId(reactId: string): string {
  return `liquid-${Array.from(reactId, (character) =>
    /[A-Za-z0-9_-]/.test(character)
      ? character
      : `x${character.codePointAt(0)?.toString(16)}x`,
  ).join("")}`;
}

function GlassSurface() {
  const instanceId = makeSvgSafeId(useId());
  const filterId = `${instanceId}-filter`;
  const clipId = `${instanceId}-clip`;
  const opticsStyle = {
    filter: `url("#${filterId}")`,
    clipPath: `url("#${clipId}")`,
  } as CSSProperties;

  return (
    <section className="glass" style={{ clipPath: `url("#${clipId}")` }}>
      <svg aria-hidden="true" width="0" height="0">
        <defs>
          <clipPath id={clipId}><rect width="100%" height="100%" rx="24" /></clipPath>
          <filter id={filterId} x="-15%" y="-20%" width="130%" height="140%">{/* map */}</filter>
        </defs>
      </svg>
      <div className="glass__scene-replica" aria-hidden="true" style={opticsStyle} />
      <div className="glass__fill" aria-hidden="true" />
      <div className="glass__content">...</div>
    </section>
  );
}
```

Keep the replica's overscan, the filter region, the outer clip, and its corner radius synchronized. Measure and update scene-relative alignment with layout/resize/scroll changes only when the visual scene itself moves; do not animate blur or repeatedly snapshot the DOM.

Chromatic dispersion is optional. It is useful only when weak channel offsets reinforce environmental color without creating a permanent outline.

### V2 navigation: one continuous sampler

For ordinary navigation, keep the committed item flat and render one temporary lens only while the user clicks, holds, or mouse-drags. Use one complete, clipped scene replica and one `feDisplacementMap`; do not compose a stable core copy with a second edge-only copy. Their overlap or mask boundary produces visible seams, folded text, and doubled glyphs.

Generate one geometry-specific rounded-rectangle signed-distance field at 2× resolution. Drive both optical changes from the same interior distance:

- keep the stable interior at `1.03` sampling scale;
- over the final `16px`, increase continuously to `1.12` with `pow(1 - smoothstep(0, 16, distance), 2.7)`;
- combine the resulting inverse-scale offset with a rounded-rectangle-normal refraction vector in the field's R/G channels;
- fade the normal vector to zero at both the contour and the interior boundary so it peaks inside the edge band rather than forming a hard ring.

The semantic buttons remain unfiltered. A controlled, `aria-hidden` visual copy of navigation labels and icons may participate in the replica when it is the intended material behind the temporary lens. Hide the flat visual copy while the lens exists, then restore it only after the lens fades and the committed selection changes. Keep fill, reflection, and shadow inside the capsule clip; never add a blurred color strip outside the plate to simulate depth.

## CSS Optics and Fallbacks

Use a restrained combination of:

- translucent theme-aware fill;
- `backdrop-filter` blur and saturation;
- one neutral border or inner highlight;
- soft exterior depth shadow;
- localized gradient or caustic that does not trace the full perimeter.

Start with a functional fallback using fill, border, and shadow. Use this enhancement order:

1. Baseline fill, border, shadow, content, and focus.
2. `backdrop-filter` or `-webkit-backdrop-filter` blur/saturation when CSS feature detection passes.
3. A controlled scene replica only when coordinate alignment is available.
4. SVG `filter` displacement on that replica only after target-browser visual and performance verification.

```css
/* Baseline is outside feature queries. */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass__fill {
    -webkit-backdrop-filter: blur(18px) saturate(1.12);
    backdrop-filter: blur(18px) saturate(1.12);
  }
}

@supports (filter: url("#candidate")) {
  .glass[data-enhanced-refraction="true"] .glass__scene-replica {
    filter: var(--scene-filter);
  }
}
```

`CSS.supports("filter", "url(#candidate)")` checks syntax, not reliable SVG-filter rendering or a valid scene pipeline. Treat it only as a coarse gate; retain the baseline unless the real target browser passes visual QA. Do not make layout, content, or hit targets depend on any filter rendering successfully.

## Tuning Order

1. Choose the functional-layer use and the Regular/Clear variant from official semantics.
2. Establish readable content and shape.
3. Set fill opacity and variant-appropriate blur without hiding background continuity.
4. Align and inspect the controlled scene replica, then add low-gradient interior and stronger geometry-driven edge displacement.
5. Add edge highlight and size-appropriate depth shadow.
6. Tune adaptive contrast and saturation against varied backgrounds.
7. Add optional localized color only after both themes pass review.

## Anti-Patterns

- Low-opacity white fill presented as the complete material.
- Distorting labels, icons, or focus rings with the background.
- Stacking several glass layers that repeatedly sample one another.
- Using high blur to hide a weak material hierarchy.
- Full-perimeter cyan or purple glows that read as neon borders.
- Assuming identical parameters will work in light and dark themes.
- Calling a blurred translucent overlay "refraction" when no controlled scene replica is displaced.
- Capturing arbitrary DOM or private page pixels to fabricate a scene replica.
- Treating Baseline/Enhanced as aliases for Regular/Clear.
- Applying strong whole-surface distortion where Apple-style lensing requires a stable, low-gradient interior.
- Combining core and edge replicas with a hard mask, producing a fold, seam, double glyph, or missing part of a label.
- Treating an archived V1 fidelity asset as the default reference for current navigation.
- Using a QA scene with text deliberately crossing glass as a production layout recommendation.
