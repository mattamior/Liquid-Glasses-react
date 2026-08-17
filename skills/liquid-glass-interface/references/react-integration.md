# React Integration Reference

Use `assets/strict-kernels/apple/` as the default implementation. It is extracted from `app/apple-clear` and must stay a floating Clear pane over a home-screen scene. Use `assets/v2-reference-implementation/` only when the request names V2 vertical navigation. Use `assets/v1-fidelity-kit/` only for explicit archived-V1 reproduction. Use `assets/v3-horizontal-navigation/` only for the independent, opt-in M04 horizontal-navigation pattern. Never use `/v3-05-failed` as a copyable reference.

## Strict integration boundary

For a strict result, read [strict-conformance-contract.json](strict-conformance-contract.json) before this reference. Copy its selected kernel byte-for-byte and use only the matching `assets/strict-templates/<framework>/` adapter and conformance route. V2/V3 adapters pass typed config into the strict kernel; the kernel must render its supplied navigation/card data and call its supplied route callback only after semantic commitment. Do not fork kernel imports, state, optics, roles, or fallback behavior. A modified kernel, omitted V2/V3 route, or framework other than Next App Router/Vite React Router is an inspired implementation.

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

Use one full replica for the lens. Rebuild its adaptive 1×/2× SDF field only when the lens width, height, or radius changes. Translate the replica world inversely to the plate's position so one filtered copy stays aligned with the visible navigation. Do not create separate core and edge trees, use XOR masks, or apply a filter to foreground controls.

For primary mouse, touch, and pen dragging, preserve the drag session in a ref. On every normal `pointerup`, first incorporate the final `clientY`, then calculate the nearest target. Call `setPointerCapture`; also install capture-phase window listeners for `pointerup` and `pointercancel`, and clean them up on unmount. Bypass the transient lens and commit directly for narrow layouts, `prefers-reduced-motion`, forced colors, or unavailable enhanced capabilities.

## V3 slider, input, and Edge optics contract

Keep V3's committed ID, drag-preview ID, and transition phase separate. Render native gray base buttons, then place one navigation-level selection slider from the measured `x`, `width`, and `center` of the committed or previewed button. The slider contains the material plate and a clipped white visual replica; do not split those into per-tab pseudo-elements. Only the committed base button receives `aria-current="page"`, so SSR and every runtime state expose exactly one current item.

Normal clicks on non-current tabs run the large lens transition and leave the committed ID unchanged until the lens arrives. Only the current button may start dragging. Store the Pointer Events session in a ref, reject non-primary mouse input and overlapping phases, set pointer capture, and use a `5px` threshold before moving the slider. During an accepted mouse/touch/pen drag, clamp the measured slider position to the rail and derive the nearest preview item. On normal release, animate a `260ms` snap and commit without starting the large lens. On cancellation, lost capture, resize, or unmount, restore the committed geometry and release capture, timers, and queued frames. Under reduced motion or when measured geometry is unavailable, select directly.

For V3 Edge optics, separate the world replica from the optical filter viewport. The navigation world replica keeps its full measured navigation dimensions and its transform/scale in world coordinates. Put it inside a fixed viewport with exactly the lens width and height, offset the world replica within that viewport, and apply `feDisplacementMap` to the viewport only. Never filter the translated full-width world element: its filter region is evaluated in the wrong local coordinates and can transparently crop the icon and label. Recalculate both spaces from the same measured tab geometry after resize. The current Baseline path keeps the slider and travelling lens without Edge displacement; reduced motion, forced colors, unavailable SVG constructors, or unavailable Canvas select directly.
