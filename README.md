# Liquid Glasses React

An interactive React study of Apple-inspired Liquid Glass: continuous refraction,
adaptive highlights, and navigation lenses.

一个基于 React 的液态玻璃交互实验，研究连续折射、自适应高光与导航透镜。

[Live Demo](https://liquid.hkooii.com) ·
[中文说明](./README.zh.md) ·
[English Documentation](./README.en.md) ·
[Liquid Glass Method](./docs/liquid-glass-interface.en.md) ·
[Logo Decision Record](./docs/decisions/liquid-lab-logo.en.md) ·
[标志决策记录](./docs/decisions/liquid-lab-logo.zh.md) ·
[V2 Admin Template Enhancement](./docs/decisions/v2-admin-template-enhancement.en.md) ·
[V2 后台模板增强](./docs/decisions/v2-admin-template-enhancement.zh.md) ·
[V3 Decision Record](./docs/decisions/v3-horizontal-navigation-lens.en.md) ·
[V3 决策记录](./docs/decisions/v3-horizontal-navigation-lens.zh.md) ·
[V3 Reference Calibration](./docs/decisions/v3-reference-calibration.en.md) ·
[V3 参考校准](./docs/decisions/v3-reference-calibration.zh.md) ·
[V3 Visual Gap Analysis](./docs/reports/v3-liquid-glass-visual-gap-analysis.en.md) ·
[V3 视觉差距分析](./docs/reports/v3-liquid-glass-visual-gap-analysis.zh.md) ·
[V3 Continuous World Sampling](./docs/decisions/v3-continuous-world-sampling.en.md) ·
[V3 连续世界取样](./docs/decisions/v3-continuous-world-sampling.zh.md) ·
[V3 System Theme Toggle](./docs/decisions/v3-system-theme-toggle.en.md) ·
[V3 系统主题切换](./docs/decisions/v3-system-theme-toggle.zh.md) ·
[V3 Motion-Coupled Optics Release](./docs/decisions/v3-motion-coupled-optics.en.md) ·
[V3 运动耦合光学发布](./docs/decisions/v3-motion-coupled-optics.zh.md) ·
[V3 M04 Rollback / Failed M05 Route](./docs/decisions/v3-m04-rollback-failed-route.en.md) ·
[V3 M04 回归 / 失败 M05 路由](./docs/decisions/v3-m04-rollback-failed-route.zh.md) ·
[Lint Decision Record](./docs/decisions/lint-scope-maintenance.en.md) ·
[Lint 决策记录](./docs/decisions/lint-scope-maintenance.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- `/` redirects to the default `/v2` vertical navigation study; frozen `/v1` remains available for archival comparison.
- The source `/v3` route is reference-calibrated at `1264 × 948`: a `1124 × 210` dock, `872 × 210` rail, `296 × 242` temporary lens, and `210 × 182` static selection slider.
- `/v3` is restored exactly to the M04 candidate baseline `d353abed0e5b379989bbcb7d13bb830702eece3f`: `coreZoom: 0.12`, a `24px` inward meniscus, `11px` baseline refraction, and `1.14×` static Edge strength. It keeps the reference presentation, continuous padding-box world sampling, `?chrome=demo`, and `?optics=edge`.
- V3 follows the system color scheme when no preference is stored; its sparkle toggle persists（持久化） only valid `dark` / `light` values in `liquid-lab:v3-theme`, restores them on reload, and synchronizes（跨标签同步） changes across tabs. Theme implementation commit `6fc3897` was first released as Cloudflare Worker version `590a19bb-8b64-4053-af13-a1b0f54fb387`; see the bilingual [system-theme decision](./docs/decisions/v3-system-theme-toggle.en.md) / [系统主题决策](./docs/decisions/v3-system-theme-toggle.zh.md).
- `/v3-05-failed` retains the full interactive M05 implementation from `88abeedca48b14a9aa96d980a4a956bb294461ee` as a direct-access archive. It is `noindex, nofollow`, absent from navigation, and physically isolated from `/v3` except for `liquid-lab:v3-theme`. The annotated `v3-milestone-05-failed` tag still marks failed acceptance, not a usable baseline.
- This route migration is deployed as Worker `liquid-lab-optics-demo` version `71ca0a4d-6af1-4742-a97a-d9b83c61a820`; build, dry-run, and deploy passed with Wrangler `4.92.0`, and the workers.dev [`/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3) entry is available. Custom-domain and full visual production smoke remain pending independent verification. The rollback target is `d910d3b1-cdc6-472f-a504-4d5df526df95`. See the bilingual [M04 rollback / failed M05 route decision](./docs/decisions/v3-m04-rollback-failed-route.en.md) / [M04 回归 / 失败 M05 路由决策](./docs/decisions/v3-m04-rollback-failed-route.zh.md).
- `/brand-preview` is the review surface for the current Liquid Lab logo on light and dark backgrounds.
- V2 remains the default admin-template reference implementation. Its current source
  enhancement unifies primary mouse, touch, and pen interaction, adds adaptive 1×/2×
  capsule optics and static capability fallback, and persists validated light/dark
  themes across reloads and tabs. It is released as Worker `liquid-lab-optics-demo`
  version `58a41f02-7a84-4499-9ce1-dd032b99c3b2`, serving 100% of traffic; see the
  bilingual [V2 enhancement decision](./docs/decisions/v2-admin-template-enhancement.en.md) /
  [V2 增强决策](./docs/decisions/v2-admin-template-enhancement.zh.md). V3 remains an
  independent App-style experiment and does not replace V2.
- The reusable Agent Skill documents versioned assets, layered Web refraction, semantic motion, and accessible fallbacks.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. Verify the rendered
routes with:

```bash
npm test
```

## Agent Skill

The versioned [`liquid-glass-interface` Skill](./skills/liquid-glass-interface/)
helps agents select an explicit V1/V2/V3 reference, build layered Web
refraction, and preserve semantic interaction and accessible fallbacks. It is
guidance only: it does not access credentials, personal data, remote assets,
telemetry, or hidden network services.

## License

Released under the [MIT License](./LICENSE). This independent interface study
is not affiliated with or endorsed by Apple Inc.
