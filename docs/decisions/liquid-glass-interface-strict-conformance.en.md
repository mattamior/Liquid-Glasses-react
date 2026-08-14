# Liquid Glass Interface Strict-Conformance Decision Record

**Date:** 2026-08-13
**Status:** Implemented locally; final application checks and visual approval pending; not deployed or published

## 1. Scope and Decision

The `liquid-glass-interface` Skill now uses schema `2.0` as a verifiable strict-conformance（严格合规） contract, not a loose style reference. `v1-fidelity`, `v2-default`, and `v3-horizontal` are strict names only when the selected frozen kernel, frozen integration, product runtime mount（运行时挂载）, route, source-tree scan, structured E2E report, and visual evidence all pass. Invalid machine evidence is `non-compliant`; a core deviation or unsupported framework must use `V1-inspired`, `V2-inspired`, or `V3-inspired`.

Strict integration supports Next.js App Router and Vite/React Router. The six mode/framework manifests are the supported installation entries. V2 remains the default mode. M05 and `/v3-05-failed` remain historical archives and are prohibited in strict targets.

## 2. Strict Contract and Public Surface

- Each mode provides a complete parameterized（参数化） immutable kernel. Product adapters may pass only the documented business data, route callback, copy, icons, brand tokens, and outer layout through the kernel config; they may not change its state machine, optics, stable roles, or fallbacks.
- Schema `2.0` freezes SHA-256 values for the kernel and each framework integration: adapter, V2/V3 conformance route, controlled scene, Vite route registration, and Playwright harness. The target product must runtime-import and JSX-mount the adapter. Vite must also consume the frozen route registration through a live React Router tree.
- V2 requires at least two navigation items, one optical card, delayed semantic commit, all-primary-pointer drag, a controlled replica, and Enhanced optics. V3 requires at least two navigation items, preview/commit separation, current-item-only drag, a greater-than-5px threshold, 260ms snap, and Edge optics.
- V2/V3 conformance routes are available in development/test and disabled or protected in production. Their deterministic（确定性的） scene contains a grid, large type, and colour bands while foreground interaction remains outside filters.
- `verify-target-integration.mjs` reads files only and never executes manifest commands. It checks frozen hashes, runtime reachability（运行时可达性）, exact roles and fallbacks, structured Playwright JSON, visual-evidence hashes, and the complete target source tree for M05 or cross-mode contamination（污染）.
- Machine evidence may pass while visual approval is pending or rejected; that state is `implemented-awaiting-visual-approval`. Only valid approved visual JSON with reviewer, ISO timestamp, and hash-locked screenshots permits `strict-complete`.

## 3. Delivered Result and Changed Areas

- Added the schema `2.0` machine contract and equivalent English/Chinese guides, complete strict V1/V2/V3 kernels, six mode/framework manifests, and a V2 Next.js starter alias.
- Added frozen Next.js and Vite adapters, V2/V3 conformance routes and controlled scenes, Vite route registration examples, V1 and V2/V3 Playwright harnesses, and structured evidence fields.
- Upgraded target verification to enforce product mounts, Vite route consumption, all-tree M05/cross-mode scanning, frozen integration hashes, Playwright JSON results/titles, and visual JSON/screenshot hashes without executing declared commands.
- Updated `SKILL.md`, agent metadata, React integration guidance, bilingual method documents, README files, and the historical three-mode record. The original three source-to-asset verifiers remain publication synchronization checks only.

## 4. Verification Evidence

Evidence below distinguishes checks already confirmed in this batch from final checks still owned by the main agent. Pending does not mean passed.

| Check | Exact result |
| --- | --- |
| Skill validation | Official `quick_validate.py` direct run failed because host Python lacks PyYAML; the same official script passed with a non-writing in-memory YAML shim. No dependency was installed. |
| Target verifier Node tests | After the status correction, `node --test skills/liquid-glass-interface/tests/verify-target-integration.test.mjs`: `7/7` passed, `0` failed (`527.431916ms`); covers all six mode/framework fixtures, pending visual review, frozen integration, runtime mount/router, structured evidence, and full-tree contamination failures |
| V1/V2/V3 source-to-asset verifiers | All three passed and explicitly report publication-assets-only scope |
| Six target assemblies and TypeScript | Next.js/Vite × V1/V2/V3 temporary assemblies passed `6/6`; V2/V3 complete parameterized strict kernels type-check |
| `npm test` | Production build passed; rendered-route tests `6/6` passed |
| `npm run lint` | Passed with exit `0`; obsolete verifier helper removed, leaving no reported warnings |
| Targeted V2/V3 Playwright | `51/51` passed |
| Complete application E2E | `npm run test:all`: `85` passed, `1` failed at `tests/e2e/v3-05-failed.spec.ts:449`; expected glyph width difference `<=0.75`, received `0.92`. This is the untouched historical M05 archive, not a pass. |
| Real target-project browser contract E2E | Not run; Node fixtures do not replace a real Next.js or Vite target run |
| Human visual approval | Not performed; current status is `implemented-awaiting-visual-approval` |
| Cleanup and diff | `git diff --check` passed; no Playwright, Chromium, Vinext, or Vite process remained |

## 5. Deployment and Release Status

This batch changes repository Skill assets, verification, and documentation only. No production deployment, Skill publication, remote upload, or production conformance-route exposure occurred. Historical V2/V3 deployments are separate facts and do not prove schema `2.0` target conformance.

## 6. Risks, Migration, and Follow-up

- Existing installations do not become strict automatically. Select one of the six manifests, restore exact frozen files, mount the adapter in a real product entry, register the conformance route, run the frozen Playwright harness with JSON reporting, and obtain human visual approval. Otherwise use the inspired label.
- The frozen V1 kernel retains fixed SVG filter IDs, including `liquid-lens-filter`; multiple V1 instances in one document may collide. Mount one V1 instance per document until a versioned kernel revision provides instance-safe IDs.
- Kernel or integration changes are migration events. Version the contract and regenerate every affected hash, manifest, fixture, and document together; do not edit frozen files in a target project.
- The historical M05 E2E failure remains unresolved and is outside strict mode. Do not change its archive or snapshots as part of strict Skill maintenance.
- Ignored test-result artifacts and the existing untracked `tsconfig.tsbuildinfo` remain in the worktree; they were not deleted or treated as release evidence.
- A conformance route uses deterministic fixtures, never product or user data, and remains unavailable to ordinary production traffic. Human review still decides legibility（可读性）, focus, keyboard use, refraction, themes, narrow layouts, reduced motion, and forced-colours behaviour.
