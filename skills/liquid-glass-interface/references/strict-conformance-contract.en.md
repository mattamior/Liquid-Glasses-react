# Strict Conformance Contract（严格合规合同）

The machine-readable authority is [strict-conformance-contract.json](strict-conformance-contract.json). Use this guide to interpret it; do not loosen JSON requirements in a target project.

## Qualification

Schema `2.0` strict mode supports only Next.js App Router (`next-app-router`) and Vite with React Router (`vite-react-router`). All other frameworks require an inspired label. A changed frozen-file hash, non-empty deviation list, missing route, malformed evidence, or contaminated source tree is `non-compliant`. When machine evidence passes but visual approval is pending or rejected, report `implemented-awaiting-visual-approval`; only valid approved evidence permits `strict-complete`.

## Kernel and Adapter Boundary

Copy every listed kernel file byte-for-byte. Do not edit a kernel state machine, optics layer, stable DOM role, fallback, or source import. V2/V3 strict kernels expose typed config that **actually renders** navigation data, card data, copy, icons, route values, brand tokens, and a post-commit route callback; use only the matching adapter/config template. V1 remains frozen and permits only equal-length brand copy, links, and route mounting. Do not mix V1/V2/V3 files. The canonical V2/V3 demo bundles remain publication references, not configurable strict kernels.

The machine contract（机器合同） freezes and hashes the adapter, conformance route, controlled scene, Vite registration (when applicable), and Playwright harness for every mode/framework pair. A product entry must make a runtime—not type-only—import and JSX mount of the matching adapter; V2/V3 must provide navigation config. For Vite, a product-reachable route consumer must runtime-import the frozen registration and actually consume it through `createBrowserRouter`/`useRoutes` plus `RouterProvider`/rendered routes. Next relies on its hashed App Router filesystem route. The verifier scans all target source text (excluding generated/dependency directories) for M05 and other-mode kernel contamination, so aliases, `require`, and dynamic imports cannot hide it. It never executes a manifest command.

V2 requires at least two navigation items, one optical card, a controlled scene, and an Enhanced conformance route. Its sole temporary lens delays content and `aria-current` commitment until fading completes. V3 requires at least two navigation items and an Edge conformance route. Its sole inset slider owns the material, only the current tab can drag, preview remains nonsemantic, movement exceeds 5 px before dragging, and release snaps in 260 ms.

## Conformance Route and Evidence

V2/V3 routes must be available in development/test and disabled or protected in production. Render deterministic application-owned grid, large type, and color bands; keep foreground outside filters. V2 must prove Enhanced and V3 must prove Edge. Baseline remains required for reduced motion, forced colors, unavailable SVG/Canvas, and unavailable backdrop filtering, but cannot replace the normal strict path.

Select one of the six `../assets/liquid-glass.integration.<mode>.<framework>.json` schema `2.0` templates and copy it to the target root as `liquid-glass.integration.json`; the unqualified template remains only the V2 Next starter. Fill every frozen path/hash, count, exact selector, route consumer, fallback, and evidence path. `verification.e2e` must name the frozen harness and a SHA-256-locked Playwright JSON report that records zero failures and every required test title. `visualApproval` must declare `pending`, `rejected`, or `approved`; approval additionally requires a SHA-256-locked JSON record with a reviewer, valid ISO time, and non-empty hash-locked screenshots. Manifest command/result strings are not evidence and are never executed. Keep `deviations` empty.

Run the read-only verifier with:

```bash
node <skill>/scripts/verify-target-integration.mjs --root <project> --manifest liquid-glass.integration.json [--json]
```

## Known V1 Limitation（已知 V1 限制）

The frozen V1 kernel retains fixed SVG filter IDs such as `liquid-lens-filter`. Mount only one V1 kernel instance per document; multiple instances can collide（发生 ID 冲突）. Changing those IDs would change the frozen kernel hash and requires a versioned contract update rather than a target-project patch.

## Prohibited Substitutions

Do not reference M05, cross-version files, screenshots, arbitrary DOM capture, `feTurbulence`, repeated gradients, CSS blur, fixed color rings, or `backdrop-filter` alone as refraction. Never filter labels, focus rings, hit targets, forms, user data, or third-party content.
