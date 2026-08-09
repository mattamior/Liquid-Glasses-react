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
[Lint Decision Record](./docs/decisions/lint-scope-maintenance.en.md) ·
[Lint 决策记录](./docs/decisions/lint-scope-maintenance.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- `/` redirects to the default `/v2` vertical navigation study; frozen `/v1` remains available for archival comparison.
- The source `/v3` route is reference-calibrated at `1264 × 948`: a `1124 × 210` dock, `872 × 210` rail, `296 × 242` temporary lens, and `210 × 182` static selection slider.
- `/v3` keeps the static slider when idle. Its default Baseline lens hydrates a complete, mild elliptical convex field during click travel and drag; Edge shares the frame geometry and strengthens only the rim refraction.
- The historical V3 record covers the released follow-up revision. The V3 reference-calibration records document the publicly deployed calibration at [`/v3`](https://liquid.hkooii.com/v3).
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
