# React Integration Reference

Use `assets/v2-reference-implementation/` as the default behavioral reference for current navigation. Its controlled visual world and temporary lens copy are generated from one menu model; React should follow the same rule. Use `assets/v1-fidelity-kit/` only for explicit archived-V1 reproduction.

## Instance-safe SVG IDs

Every glass instance needs its own filter and clip IDs. `useId()` values may include punctuation, so encode them before constructing the IDs. Use quoted `url("#...")` values in inline styles; do not CSS-select an ID generated this way.

```tsx
import { useId, type CSSProperties } from "react";

function makeSvgSafeId(value: string) {
  return `liquid-${Array.from(value, (character) =>
    /[A-Za-z0-9_-]/.test(character) ? character : `x${character.codePointAt(0)?.toString(16)}x`,
  ).join("")}`;
}

function Glass({ children }: { children: React.ReactNode }) {
  const instance = makeSvgSafeId(useId());
  const filterId = `${instance}-filter`;
  const clipId = `${instance}-clip`;
  const opticsStyle = { filter: `url("#${filterId}")`, clipPath: `url("#${clipId}")` } as CSSProperties;
  return <section className="glass"><svg aria-hidden="true" width="0" height="0"><defs>{/* unique filter + clip */}</defs></svg><div className="glass__optical-clip"><div className="glass__scene-replica" style={opticsStyle} /></div><div className="glass__content">{children}</div></section>;
}
```

## Coordinate lifecycle

Measure world coordinates with `stage.getBoundingClientRect()` and `lens.getBoundingClientRect()`. Give the scene copy the complete measured stage width and height, then position its world origin at exactly `stage.left - lens.left` and `stage.top - lens.top`. Do not add `scrollY` when both rectangles are in viewport coordinates. Keep overscan in a separate lens-sized filter window and compensate its inner inset; overscan must not change the scene origin or dimensions.

Split size and position updates. Use React state only when surface width, height, radius, or stage size changes and the displacement field must be rebuilt. During scroll, coalesce measurements into one `requestAnimationFrame` and imperatively update only the replica world's CSS transform or custom properties; do not call React state setters each frame. Apply the SVG/CSS filter to the lens-sized filter window, not the full-stage world element. Memoize the deterministic scene component so a scroll does not reconcile every replica.

Start enhanced optics only after non-zero geometry is ready. Update when either surface resizes (`ResizeObserver`), the viewport resizes, or the stage/lens transform changes. For transform-driven animations, invalidate geometry from the controlling state and remeasure after the surface's `transitionend` or `animationend`; transforms do not reliably notify `ResizeObserver`. Observe style/class mutations only if external code can change transforms. Disconnect observers and listeners and cancel queued frames on unmount.

At closed steady state, unmount popover optics or otherwise remove their border, shadow, replica, filter, observers, and scroll listener. If a reverse close animation is required, retain the surface only until its exit transition completes.

## Layer and privacy boundaries

Only `.glass__optical-clip` is rounded and clipped. It contains the aligned scene replica, fill, and edge optics. The content layer, focus ring, menus, and popovers remain separate and unfiltered; do not set `overflow: hidden` on the outer glass shell when overlays may escape.

Render only an application-owned, deterministic visual scene into the replica. Never use DOM screenshots, canvas capture of arbitrary page pixels, screen capture APIs, forms, messages, user data, private content, or third-party embeds. If a controlled scene model and coordinate alignment are unavailable, ship baseline glass and do not advertise refraction.

## V2 transient-lens contract

Keep the committed item ID separate from transient interaction state. Model the latter as `{ phase: "click" | "dragging" | "settling" | "fading", targetId, y, isVisible } | null`. The committed ID drives content and `aria-current`; do not update it until the temporary lens finishes fading.

Use one full replica for the lens. Rebuild its 2× SDF field only when the lens width, height, or radius changes. Translate the replica world inversely to the plate's position so one filtered copy stays aligned with the visible navigation. Do not create separate core and edge trees, use XOR masks, or apply a filter to foreground controls.

For mouse dragging, preserve the drag session in a ref. On every normal `pointerup`, first incorporate the final `clientY`, then calculate the nearest target. Call `setPointerCapture`; also install capture-phase window listeners for `pointerup` and `pointercancel`, and clean them up on unmount. Bypass the transient lens and commit directly for narrow layouts, touch or pen input, `prefers-reduced-motion`, and `forced-colors`.
