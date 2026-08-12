# Liquid Glasses React

Liquid Glasses React is an interactive study inspired by Apple's Liquid Glass
design. It explores continuous refraction（连续折射）, adaptive highlights（自适应
高光）, and navigation hierarchy communicated through fluid motion（流体动效）.

[Live Demo](https://liquid.hkooii.com) ·
[中文](./README.zh.md) ·
[Project Home](./README.md) ·
[Liquid Glass Method](./docs/liquid-glass-interface.en.md) ·
[Logo Decision Record](./docs/decisions/liquid-lab-logo.en.md) ·
[V2 Admin Template Enhancement](./docs/decisions/v2-admin-template-enhancement.en.md) ·
[V3 Decision Record](./docs/decisions/v3-horizontal-navigation-lens.en.md) ·
[V3 Reference Calibration](./docs/decisions/v3-reference-calibration.en.md) ·
[V3 Visual Gap Analysis](./docs/reports/v3-liquid-glass-visual-gap-analysis.en.md) ·
[V3 Continuous World Sampling](./docs/decisions/v3-continuous-world-sampling.en.md) ·
[V3 System Theme Toggle](./docs/decisions/v3-system-theme-toggle.en.md) ·
[V3 Motion-Coupled Optics Release](./docs/decisions/v3-motion-coupled-optics.en.md) ·
[V3 M04 Rollback / Failed M05 Route](./docs/decisions/v3-m04-rollback-failed-route.en.md) ·
[Lint Scope Decision Record](./docs/decisions/lint-scope-maintenance.en.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Live Demo

The public version is hosted on Cloudflare Workers:

<https://liquid.hkooii.com>

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/v2`, the current default navigation study. |
| `/v1` | Frozen archived Demo retained for comparison. |
| `/v2` | Default vertical navigation-lens reference implementation. |
| `/v3` | Independent horizontal navigation-lens experiment; the M04 candidate baseline is restored and deployed. |
| `/v3-05-failed` | Public direct-access archive for the failed M05 candidate; `noindex, nofollow` and absent from site navigation. |
| `/brand-preview` | Light/dark review surface for the current Liquid Lab logo. |

V2 remains the default reference. V3 is a separate experiment; it does not
replace V2 or modify the frozen V1 Demo.

## Features

### V2: default vertical navigation lens

- One continuous capsule SVG displacement map（位移贴图） sample for the moving
  lens, generated at adaptive `1×` or `2×` DPR and capped at `2×`.
- Flat committed selection with one temporary lens during click or drag. Primary
  mouse, touch, and pen share a `>5px` Pointer Events threshold, animation-frame
  batching（逐帧合并）, final-position flushing（最终位置刷新）, and centralized cleanup（集中清理）.
- Separately tuned light/dark optics and Baseline/Enhanced rendering tiers.
  Enhanced mode statically commits when Canvas 2D or SVG filter capability
  detection（能力检测） fails; Baseline keeps its lightweight temporary plate.
- Manual `light` / `dark` selection uses the validated `liquid-lab:v2-theme`
  preference, persists（持久化） across reloads, and synchronizes across tabs（跨标签页同步）.
- Compact, reduced-motion, and forced-color fallback paths preserve navigation,
  focus visibility, and a single semantic selection（语义选中）.
- The current V2 enhancement is released to production（已生产发布） as Worker
  `liquid-lab-optics-demo` version `58a41f02-7a84-4499-9ce1-dd032b99c3b2`, serving
  100% of traffic. See the [V2 enhancement decision（V2 增强决策）](./docs/decisions/v2-admin-template-enhancement.en.md).

### V3: independent horizontal navigation lens

- A navigation-level embedded selection slider fills the active inner grid slot;
  the base navigation stays muted while the slider is the only static owner of
  the active white label and icon.
- Clicking a non-active tab launches a large temporary lens across the horizontal
  navigation. The slider is hidden for the full lens phase, so tabs passed
  during travel do not become active or create a duplicate visual.
- The active tab accepts primary mouse, touch, and pen Pointer Events. After a
  `5px` movement threshold, the glass lens follows the pointer within the
  track, previews the nearest tab, and snaps to it on release before the
  selection is committed.
- The reference-calibrated desktop frame locks a `1124 × 210` dock with an
  `872 × 210` rail at `1264 × 948`; the `296 × 242` temporary lens overlaps the
  rail while the `210 × 182` static slider remains visibly smaller. Narrow
  layouts derive these dimensions from the live rail ratio rather than a fixed
  transform scale.
- SSR starts with `data-optics="baseline"`. `/v3` is restored exactly to the M04
  candidate baseline（候选基线） `d353abed0e5b379989bbcb7d13bb830702eece3f`: it keeps the reference
  presentation（参考呈现） and, after hydration（客户端接管）, continuously samples one complete navigation
  world in shared padding-box coordinates. Baseline uses `coreZoom: 0.12`, a `24px` inward
  meniscus, `11px` baseline refraction（基础折射）, and `1.14×` static Edge strength. `?chrome=demo`
  exposes review controls and `?optics=edge` selects the comparison field.
- V3 follows the system color scheme（系统颜色方案） when no preference is stored.
  Its sparkle toggle persists（持久化） valid `dark` / `light` values in `liquid-lab:v3-theme`,
  restores them on reload, and synchronizes them across tabs（跨标签页）. It does not
  change the route, existing query parameters, or optical field. Theme implementation
  commit `6fc3897` was first released as Cloudflare Worker version
  `590a19bb-8b64-4053-af13-a1b0f54fb387`; see the
  [system-theme decision（系统主题决策）](./docs/decisions/v3-system-theme-toggle.en.md).
- `/v3-05-failed` retains the complete interactive M05 implementation from
  `88abeedca48b14a9aa96d980a4a956bb294461ee` as a public direct-access archive. It is
  `noindex, nofollow`, absent from site navigation, and physically isolated（物理隔离） from `/v3`
  except for the shared `liquid-lab:v3-theme`. The annotated tag（注释标签） `v3-milestone-05-failed`
  still marks failed acceptance, not a usable baseline.
- This route migration is deployed as Cloudflare Worker `liquid-lab-optics-demo` version
  `71ca0a4d-6af1-4742-a97a-d9b83c61a820`; build, dry-run（预演）, and deploy completed with Wrangler
  `4.92.0`, and the workers.dev [`/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3) entry is available.
  Custom-domain and complete production visual smoke remain pending independent verification. The rollback target（回滚目标） is
  `d910d3b1-cdc6-472f-a504-4d5df526df95`. See the
  [M04 rollback / failed M05 route decision（M04 回归 / 失败 M05 路由决策）](./docs/decisions/v3-m04-rollback-failed-route.en.md).

### Brand review

- `/brand-preview` compares the adopted Liquid Lab logo on dark and light
  backgrounds at 48px, 32px, and 24px sizes.
- The accepted logo assets are in `public/brand/`; the browser icon is
  `public/favicon.svg`.

## Technical Implementation

The interface does not use a static glass image. It combines:

- React 19 and TypeScript
- SVG `feDisplacementMap`, with an adaptive 1×/2× rounded-SDF field in V2 and a local
  elliptical field in V3
- CSS `backdrop-filter`, gradients, inset shadows, and blend modes（混合模式）
- Pointer Events, pointer capture（指针捕获）, thresholded drag handling, and
  nearest-item snapping in V2 and V3
- vinext and Vite for building
- Cloudflare Workers for hosting

Enhanced V2 refraction uses one complete controlled replica: sampling stays at
`1.03` in the center and rises continuously to `1.12` in the final `16px` near
the rounded contour. It avoids core/edge seams, duplicated labels, and fixed
blue outlines.

## Local Development

### Requirements

- Node.js `>=22.13.0`
- npm

### Start the Project

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

### Verify the Project

```bash
npm test
```

This command creates a production build and validates the server-rendered
routes.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development preview |
| `npm run build` | Create the production build |
| `npm run start` | Start the production build |
| `npm test` | Build and run the render test |
| `npm run lint` | Check code quality rules |

## Project Structure

```text
AGENTS.md                         Repository workflow and bilingual decision-record rule
app/
  page.tsx                        Redirect from / to /v2
  v1/                             Frozen archived Demo
  v2/                             Default vertical navigation-lens study
  v3/                             Independent horizontal navigation-lens study
  brand-preview/                  Logo review route
public/
  brand/                          Current logo assets and static previews
  favicon.svg                     Browser icon
docs/
  decisions/                      Bilingual decision records for important completed work
  liquid-glass-interface.*.md     Liquid Glass method documentation
tests/
  rendered-html.test.mjs          Server-rendered route assertions
skills/
  liquid-glass-interface/         Versioned Skill source for agents and stores
```

## Agent Skill

The reusable `liquid-glass-interface` Skill lives in
[`skills/liquid-glass-interface`](./skills/liquid-glass-interface/). Its
`v2-reference-implementation` remains the current default reference;
`v1-fidelity-kit` is an archived asset for explicit V1 reproduction. V3 is an
independent `v3-*` study that can be selected deliberately rather than
overwriting either baseline.

The Skill contains implementation guidance only. It does not access
credentials, personal data, remote assets, telemetry（遥测）, or hidden network
services.

## Decision Records

Important completed work is recorded in structurally equivalent English and
Chinese documents under [`docs/decisions`](./docs/decisions/). Each record
covers scope, decision, changed areas, verification evidence, release status,
and follow-up limits. See [AGENTS.md](./AGENTS.md) for the repository rule.

## Deployment

The project can be deployed to Cloudflare Workers with the generated
`dist/server/wrangler.json` configuration:

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

Authenticate with Cloudflare and choose a Worker name for your own account
before deploying.

## Project Notice

This project is an independent interface and optical-effects study. It is not
an official Apple product and is not endorsed or authorized by Apple Inc. Apple
and related names and trademarks belong to their respective owners.

The project is released under the [MIT License](./LICENSE).
