# Interaction Patterns

Follow [apple-design-logic.en.md](apple-design-logic.en.md): material and motion are one system. Opening, closing, pressing, and selecting should modulate lensing, illumination, form, connection, or apparent thickness rather than rely on an ordinary fade alone. Keep the resting state quiet and preserve causal continuity between trigger and result.

## Menu Hierarchy and Coupled Motion

Drive toolbar and menu transitions from one open-state model. Express their relationship with a restrained coupling field, coordinated transforms, or synchronized opacity and scale. Preserve rounded clipping throughout the animation; do not briefly expose square corners or stretch the toolbar into the menu.

Keep the motion directional and causal: the control changes state, the relationship field appears, and the menu settles. Reverse the same relationship when closing. Avoid an effect that visually connects only to the trigger icon when the intended relationship is between the toolbar and the menu surface.

## Navigation Selection Lenses

For ordinary navigation, use a flat committed selection state and a temporary glass lens. The glass is an interaction artifact, not the durable selected style: show it for `click`, `dragging`, `settling`, and `fading`; hide the flat visual selected state while it exists; fade it out after arrival; then commit the target content, `aria-current`, and flat selected state.

On click, move the temporary lens from the committed item to the target, then fade before committing. On a mouse press of the committed item, reveal it without scaling; after movement exceeds a small threshold, clamp the drag to the first-to-last item rail. On release, update from the final `clientY` before choosing the nearest item, settle there, then fade. Only `pointercancel` and lost pointer capture return to the origin. Use Pointer Capture and a window-capture `pointerup` fallback so release outside the original button cannot leave the lens stranded.

Keep a persistent measured glass selection plate only when the product explicitly needs a durable material-selected state. Use hover only as a low-contrast preview. Selected, hovered, focused, and pressed states must remain distinguishable.

## Explicit V3 Horizontal Navigation Exception

V3 is a separate, opt-in pattern; it does not change the V2 default above. Use a navigation-level inset selection slider rather than a per-tab active pseudo-element. The slider fills the measured inner grid cell and owns both the durable material plate and a clipped white visual replica of the committed or previewed tab. Keep the underlying native buttons gray and semantic.

Exactly one committed button has `aria-current="page"`. The slider preview must never move this attribute. A click on a non-current button starts the large horizontal lens; it may cross intermediate tabs, but only the destination becomes current after its transition completes. Block click and drag re-entry while the large lens, a release snap, a fallback path, or unmount cleanup is running.

Only the current button begins a V3 drag. Accept primary mouse, touch, and pen. Set `touch-action: none` on this V3 control, call `setPointerCapture(pointerId)`, and wait for a `5px` threshold before suppressing ordinary click behavior. After the threshold, clamp the slider to the rail and preview the nearest measured tab. On normal release, snap within `260ms` to the nearest tab and commit directly; do not replay the travelling lens. On `pointercancel`, lost capture, or a `ResizeObserver` result during the drag, restore the committed tab. Every terminal path releases capture and cancels pending timers and animation frames.

### Geometry and Responsive Layout

Do not measure the plate only when `selectedId` changes. Measure the selected item relative to the plate's positioning container, including the container's scroll offset when the menu itself scrolls. Recalculate when any of these can change geometry:

- the selected item or menu container changes size, using `ResizeObserver`;
- fonts finish loading (`document.fonts.ready` where available), because late font metrics can change item width or wrapping;
- the viewport, a responsive container, or the menu's scroll position changes;
- items are added, removed, localized, or wrap onto a new row.

Coalesce these signals into one `requestAnimationFrame` measurement. Disconnect observers, remove listeners, and cancel a queued animation frame when the component unmounts. This prevents layout-thrashing and stale plate coordinates.

An equal-width, single-row grid may derive the plate transform from its selected index and known cell width. Dynamic-width items, wrapping labels, variable gaps, and responsive layout changes must use measured geometry. In particular, do not retain desktop coordinates after a narrow-screen reflow.

Clamp the plate and any spring interpolation to the menu's inner padding. Limit or clip overshoot on both axes so the plate cannot cross the menu edge during a size or position transition.

### Plate Travel and Optical Sweep Are Separate Channels

The selection plate's geometry and its internal optical sweep are independent channels. The plate may move or resize whenever the selected item's measured rectangle changes. The sweep is optional and must be driven by the **previous-to-next measured center vector** in the plate container's two-dimensional coordinate space:

`dx = nextCenterX - previousCenterX`; `dy = nextCenterY - previousCenterY`.

Use that vector to orient, offset, or time the sweep. Never infer direction from a fixed page axis, item index/order, DOM order, language direction, or a key change that blindly replays an animation. A re-render or remount is not evidence of user travel.

- For wrapped menus, use both `dx` and `dy`; a row change is diagonal or vertical travel, not necessarily left/right travel.
- For RTL, use the measured physical coordinates. Do not negate `dx` merely because `direction: rtl` is set.
- For vertical writing modes, scrolling containers, transforms, and nested positioning contexts, measure centers in the same positioning-container space and include relevant scroll offsets.
- On rapid consecutive user selections, restart from the currently rendered/interpolated plate center (or latest reliable measured center) toward the new target. Do not queue stale sweeps or let an earlier transition dictate the later direction.
- A resize, font load, responsive reflow, localization, scroll correction, mutation, observer callback, or other non-user layout remeasurement may reposition the plate but must not emit a sweep.
- If either center is unavailable, stale, from incompatible coordinate spaces, or cannot support reliable two-dimensional measurement, omit the sweep and retain the geometry transition.

Treat keyboard activation as a user selection and derive the same vector from measurements; do not substitute an assumed arrow-key direction.

### Optical Clipping and Overlays

Clip only the optical wrapper that contains the scene replica, displacement, highlights, or material effects. Keep the component root, semantic controls, focus indicators, and hit targets outside that clipping boundary unless their geometry itself requires clipping. Applying `overflow: hidden`, `clip-path`, or a mask to the whole component commonly clips focus rings, shadows, and floating content.

Menus, popovers, tooltips, and other overlays must render outside the clipped optical wrapper or through a portal with an explicit stacking and positioning relationship. Verify that an open overlay is neither visually cut off nor made unclickable by the glass surface's clipping or stacking context.

### SVG `clipPath` Coordinate Rules

Choose one explicit coordinate system for every SVG clip path:

- Use `clipPathUnits="objectBoundingBox"` only with normalized geometry (`0`–`1`) and a non-zero target bounding box.
- Use `clipPathUnits="userSpaceOnUse"` when geometry is measured in CSS/SVG pixels, and set an explicit, current width and height that match the clipped optical wrapper.

Do not define percentage geometry inside a zero-sized or otherwise ambiguous `<defs>` SVG and assume it resolves against the component. A clip path whose coordinate system or dimensions cannot be established reliably is a reason to use CSS clipping on the optical wrapper, or to omit the enhanced optical layer.

### State Priority

Treat state as a deliberate hierarchy rather than one shared bright background:

1. `pressed` is transient feedback and may be strongest while active.
2. `focus-visible` remains an explicit, opaque-enough indicator above the optical layers.
3. `selected` is the committed semantic current state. In the V2 default, it is a flat visual fill while idle and is temporarily hidden while the interaction lens is active.
4. `hover` is a quieter preview and must not visually equal selected.

Do not remove the selected plate when a selected item receives hover or focus. Keyboard focus may move independently of selection; preserve both signals without relying solely on transparency or animation.

## Optional Floating-Panel Dragging

Do not add dragging to ordinary menus. The documented V3 horizontal navigation is a narrow opt-in exception with the current-tab and semantic protections above. Otherwise, use dragging only when the component represents a movable tool, floating panel, spatial workspace object, or the user explicitly asks for it.

When dragging is justified:

1. Start only from a non-interactive drag handle or safe toolbar background.
2. Reject secondary mouse buttons and pointers that start on buttons, links, form controls, or scrollable content.
3. Call `setPointerCapture(pointerId)` after a valid drag begins.
4. Store the pointer origin and panel origin; derive movement from their delta instead of accumulating events.
5. Clamp the complete panel cluster within the visible container after accounting for scale and responsive layout.
6. Release capture on pointer up or cancellation and restore normal selection behavior.
7. Preserve keyboard access to every control and provide a reset position when displacement can hide content.

Avoid global document listeners unless the component cannot use pointer capture. Set `touch-action` only on the drag handle, not on the complete menu.

## Input and Focus Rules

- Use native buttons and links before recreating their behavior.
- Keep focus indicators outside distorted sampling layers.
- Do not let drag gestures trigger toolbar actions or text selection.
- Ensure touch targets remain usable when surfaces morph or move.
- Use `aria-expanded`, `aria-controls`, and current-selection semantics where applicable.
- Under reduced motion, replace springs and morphs with immediate or short opacity changes.
