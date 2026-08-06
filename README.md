# Liquid Glasses React

An interactive React study of Apple-inspired Liquid Glass — continuous refraction,
adaptive highlights, transient navigation lenses, and light/dark themes.

一个基于 React 的液态玻璃交互实验，展示连续背景折射、自适应高光、临时导航透镜与亮暗主题。

[Live Demo](https://liquid.hkooii.com) ·
[中文说明](./README.zh.md) ·
[English Documentation](./README.en.md) ·
[Liquid Glass Method](./docs/liquid-glass-interface.en.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- V2 default route with one continuous SVG displacement lens
- Flat committed selection plus a temporary click/drag navigation lens
- V1 archived Demo retained at `/v1`
- Independent light/dark tuning and accessible baseline fallbacks
- Responsive light and dark themes
- Cloudflare Workers deployment

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

```bash
npm test
```

## Agent Skill

The reusable `liquid-glass-interface` Skill is versioned in
[`skills/liquid-glass-interface`](./skills/liquid-glass-interface/). It teaches
agents to select a versioned V1/V2 asset, build layered Web refraction, and ship
semantic motion with accessible fallbacks.

The Skill contains guidance only. It does not access credentials, personal
data, remote assets, telemetry, or hidden network services.

## License

Released under the [MIT License](./LICENSE).

This project is an independent interface study and is not affiliated with or
endorsed by Apple Inc.
