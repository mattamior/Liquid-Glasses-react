# Liquid Glasses React

An interactive React study of Apple-inspired Liquid Glass — refraction, adaptive
highlights, fluid menu motion, drag interactions, and light/dark themes.

一个基于 React 的液态玻璃交互实验，展示背景折射、自适应高光、菜单流体动效、自由拖动与亮暗主题。

[Live Demo](https://liquid.hkooii.com) ·
[中文说明](./README.zh.md) ·
[English Documentation](./README.en.md) ·
[Liquid Glass Method](./docs/liquid-glass-interface.en.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Highlights

- Real-time SVG displacement refraction with theme-specific optical tuning
- Apple-style toolbar and function menu with coupled opening motion
- Draggable glass menu with bounded positioning
- Animated selection plate, hover feedback, and material controls
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
agents to build layered Web refraction, semantic menu motion, independent theme
tuning, accessible fallbacks, and optional floating-panel dragging.

The Skill contains guidance only. It does not access credentials, personal
data, remote assets, telemetry, or hidden network services.

## License

Released under the [MIT License](./LICENSE).

This project is an independent interface study and is not affiliated with or
endorsed by Apple Inc.
