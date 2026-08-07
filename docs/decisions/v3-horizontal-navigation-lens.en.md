# V3 Horizontal Navigation Lens Decision Record（横向导航透镜决策记录）

Status: released（已发布）<br>
Recorded: 2026-08-07<br>
Implementation commit: [`de33e654cfecf5f73e56b6afa18dd1806d00d800`](../../../../commit/de33e654cfecf5f73e56b6afa18dd1806d00d800)

## Scope and Decision

Introduce V3 as an independent horizontal navigation-lens study. The navigation
uses an inset selected slider（内嵌选中滑块） instead of extending the selected
surface to the shell edge. Ordinary tab activation keeps the travelling large
lens transition; direct dragging changes the selected tab by snapping to the
nearest slot without replaying that transition.

## Delivered Result and Changed Areas

- [`/v3`](../../app/v3/page.tsx) provides four-column horizontal navigation
  with a navigation-level selection slider and a clipped white visual duplicate
  of the active or dragged-preview tab. The base navigation remains gray.
- [`app/v3/v3.css`](../../app/v3/v3.css) gives desktop navigation a `10px`
  inner edge and narrower mobile insets, so the selected slider fills its inner
  grid slot while retaining shell margin.
- Pointer Events support primary mouse, touch, and pen input from the current
  active tab. It uses pointer capture（指针捕获）, a `5px` drag threshold,
  boundary clamping（边界钳制）, cancellation fallback（取消回退）, and `260ms`
  snapping（吸附） to the nearest tab.
- Edge optics（边缘光学） uses a lens-sized local viewport for the SVG
  displacement filter. The navigation world copy remains available inside the
  large lens during the transition instead of being transparently clipped.

## Verification Evidence

- `npm test` passed: 5 of 5 tests.
- `git diff --check` passed before the released implementation was committed.
- Desktop Baseline verification confirmed a `10px` right shell margin for the
  last selected slider, gray base navigation content, and white slider content.
- Local interaction checks confirmed mouse dragging, the drag threshold,
  cancellation fallback, and subsequent ordinary click activation. Mobile
  geometry and reduced-motion direct activation were also checked.
- A transition sample at about `340ms` retained the original `aria-current`
  while the large lens travelled through intermediate tabs. Edge optics showed
  refracted icon and text content without a blank filter region.
- Public verification of [`https://liquid.hkooii.com/v3`](https://liquid.hkooii.com/v3)
  returned HTTP 200. At `1365 × 769`, a public Edge transition sample was in
  the travelling phase with a `224 × 184` lens, a `+1px` lens-to-navigation
  center delta, the expected displacement filter, and zero console errors or
  warnings.

## Release Status

The V3 implementation was released from commit
[`de33e654cfecf5f73e56b6afa18dd1806d00d800`](../../../../commit/de33e654cfecf5f73e56b6afa18dd1806d00d800)
in Worker version `9e1e76c7-2474-48bb-9a74-29c1bbbdea83`. The public route
above was verified after deployment.

## Known Limits and Follow-Up

- Public post-release verification did not independently replay mouse drag or
  test a physical touch or pen device. The Pointer Events path has local mouse
  coverage; touch and pen still need device-browser confirmation.
- The refraction is a deliberate SVG approximation（近似） of liquid glass, not
  a platform-native material implementation.
- Keep this record and the README updated after each completed work batch. Any
  later public interaction, route, or release change must include the matching
  documentation update.
