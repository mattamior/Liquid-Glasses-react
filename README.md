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
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- `/` redirects to the default `/v2` vertical navigation study; frozen `/v1` remains available for archival comparison.
- Independent `/v3` explores a horizontal lens: an exclusive embedded selection layer, temporary click/drag lens, full Pointer Events dragging, and a local Edge optics viewport with restrained rim refraction.
- The linked V3 decision records describe the current locally verified follow-up revision; deployment remains pending.
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
