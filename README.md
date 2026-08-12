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
[V3 Motion-Coupled Optics (Local, Unreleased)](./docs/decisions/v3-motion-coupled-optics.en.md) ·
[V3 运动耦合光学（本地未发布）](./docs/decisions/v3-motion-coupled-optics.zh.md) ·
[Lint Decision Record](./docs/decisions/lint-scope-maintenance.en.md) ·
[Lint 决策记录](./docs/decisions/lint-scope-maintenance.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- `/` redirects to the default `/v2` vertical navigation study; frozen `/v1` remains available for archival comparison.
- The source `/v3` route is reference-calibrated at `1264 × 948`: a `1124 × 210` dock, `872 × 210` rail, `296 × 242` temporary lens, and `210 × 182` static selection slider.
- `/v3` now defaults to the reference presentation and samples one continuous navigation world in padding-box coordinates. Its Baseline field uses `coreZoom: 0.12`, a continuous `36px` meniscus band（弯月面带）, and `10.05px` baseline refraction（基础折射）; Edge preserves geometry and material, applies the `1.14×` static strength, and adds its motion-coupled profile only while moving. `?chrome=demo` exposes review controls and `?optics=edge` selects the comparison field.
- V3 follows the system color scheme when no preference is stored; its sparkle toggle persists（持久化） only valid `dark` / `light` values in `liquid-lab:v3-theme`, restores them on reload, and synchronizes（跨标签同步） changes across tabs. Theme implementation commit `6fc3897` is released as Cloudflare Worker version `590a19bb-8b64-4053-af13-a1b0f54fb387` at 100% traffic; use the custom [`/v3`](https://liquid.hkooii.com/v3) or [workers.dev `/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3). See the bilingual [system-theme decision](./docs/decisions/v3-system-theme-toggle.en.md) / [系统主题决策](./docs/decisions/v3-system-theme-toggle.zh.md).
- A locally verified, unreleased V3 batch adds original shared navigation glyphs（导航图标字形） and cached motion-coupled radial/tangential optics（运动耦合径向/切向光学）. Local checks include full E2E `35/35` and a Go visual gate, while the requested frame-by-frame（逐帧） `>= 60fps` gate remains open; production remains `v3-milestone-04`. See the bilingual [motion-coupled-optics decision](./docs/decisions/v3-motion-coupled-optics.en.md) / [运动耦合光学决策](./docs/decisions/v3-motion-coupled-optics.zh.md).
- The preceding continuous-world-sampling release `3f2aff04-1693-4231-aee0-d7c757d7536d` is the current production rollback target; see the bilingual [continuous-world-sampling decision](./docs/decisions/v3-continuous-world-sampling.en.md) / [连续世界取样决策](./docs/decisions/v3-continuous-world-sampling.zh.md).
- `/brand-preview` is the review surface for the current Liquid Lab logo on light and dark backgrounds.
- V2 remains the default reference implementation; V3 is an independent experiment and does not replace it.
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
