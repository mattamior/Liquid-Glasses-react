# Lint Scope Maintenance Decision Record（Lint 范围维护决策记录）

Status: adopted（已采纳）<br>
Recorded: 2026-08-07

## Scope and Decision

Keep repository lint focused on maintained application source. Exclude generated
and experimental `output/**` fixtures from ESLint, while retaining every
application route, including V1, in the lint surface. Suppress the single V1
`react-hooks/set-state-in-effect` finding only at its source line; it does not
change runtime behavior and is not a broader rule disable.

## Delivered Result and Changed Areas

- [`eslint.config.mjs`](../../eslint.config.mjs) globally ignores `output/**`,
  which contains screenshots, bundled assets, and experimental fixtures rather
  than deployable application source.
- [`app/v1/page.tsx`](../../app/v1/page.tsx) documents a local
  `react-hooks/set-state-in-effect` exception beside the deferred displacement
  map initialization. V1 remains included in repository lint.
- The README links this record so the lint contract（lint 约定） and its
  exception are discoverable.

## Verification Evidence

- `npm run lint` passed after the scope update; no generated `output/**`
  findings were scanned.
- `npm test` passed: build completed and 5/5 SSR HTML tests passed.
- `git diff --check` passed.

## Release Status

This is a local lint-policy and documentation update. No push, deployment,
public-route change, or production configuration change was performed for this
decision.

## Known Limits and Follow-Up

- At the next V1 source change, replace the effect-based displacement-map
  initialization with a render-safe initialization strategy and remove the
  line-level suppression.
- Do not expand the V1 exception or exclude `app/v1/**`; a new lint finding in
  V1 must remain visible unless it has an independently documented decision.
- Generated output is intentionally outside lint, but must still remain outside
  deployable application source and should not be committed as production code.
