# Liquid Glasses React

Liquid Glasses React is an interactive study inspired by Apple's Liquid Glass
design. It explores how glass material can refract（折射） its surroundings,
adapt to environmental color, and communicate menu hierarchy through fluid
motion（流体动效）.

[Live Demo](https://liquid.hkooii.com) ·
[中文](./README.zh.md) ·
[Project Home](./README.md) ·
[Liquid Glass Method](./docs/liquid-glass-interface.en.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## Live Demo

The public version is deployed on Cloudflare Workers:

<https://liquid.hkooii.com>

`/` redirects to the current V2 navigation study. `/v1` remains directly
available as a frozen archived Demo.

## Features

- V2 default route with one continuous SVG displacement map（位移贴图） sample
- Flat committed selection plus a temporary click/drag navigation lens
- Deterministic mouse release, nearest-item snapping, and delayed content commit
- Separately tuned light/dark optics with baseline/enhanced rendering tiers
- Direct compact, touch/pen, reduced-motion, and forced-color fallbacks
- Frozen V1 Demo retained at `/v1`

## Technical Implementation

The interface does not use a static glass image. It combines these browser and
runtime capabilities:

- React 19 and TypeScript
- One SVG `feDisplacementMap` with a 2× rounded-SDF field
- CSS `backdrop-filter`, gradients, inset shadows, and blend modes（混合模式）
- Pointer Events, capture, and final-release snapping for mouse dragging
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

This command creates a production build and validates the server-rendered page.

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
app/
  globals.css        Global visual system and Liquid Glass styles
  layout.tsx         Metadata and root layout
  page.tsx           Interaction logic, SVG filters, and demo interface
public/
  favicon.svg        Project icon
tests/
  rendered-html.test.mjs
skills/
  liquid-glass-interface/  Versioned Skill source for agents and stores
docs/
  liquid-glass-interface.zh.md
  liquid-glass-interface.en.md
```

## Agent Skill

The reusable `liquid-glass-interface` Skill lives in [`skills/liquid-glass-interface`](./skills/liquid-glass-interface/). Its `v2-reference-implementation` is the current default for navigation; `v1-fidelity-kit` is an archived asset used only for explicit V1 Demo reproduction. Future generations use parallel `vN-*` assets rather than overwriting earlier baselines.

The Skill contains implementation guidance only. It does not access credentials, personal data, remote assets, telemetry（遥测）, or hidden network services.

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

This project is an independent interface and optical-effects study. It is not an
official Apple product and is not endorsed or authorized by Apple Inc. Apple and
related names and trademarks belong to their respective owners.

The project is released under the [MIT License](./LICENSE).
