# Liquid Glasses React

Liquid Glasses React is an interactive study inspired by Apple's Liquid Glass
design. It explores how glass material can refract（折射） its surroundings,
adapt to environmental color, and communicate menu hierarchy through fluid
motion（流体动效）.

[Live Demo](https://liquid-lab-optics-demo.mattamior.workers.dev) ·
[中文](./README.zh.md) ·
[Project Home](./README.md)

## Live Demo

The public version is deployed on Cloudflare Workers:

<https://liquid-lab-optics-demo.mattamior.workers.dev>

## Features

- Real-time background refraction using an SVG displacement map（位移贴图）
- Separately tuned optical parameters for light and dark themes
- Coupled opening motion between an Apple-style toolbar and function menu
- Free pointer dragging with bounded positioning（边界限制）
- A moving glass selection plate for menu transitions
- Controls for refraction, frost, and elasticity（弹性）
- Liquid, Clear, and Frost material states
- Reduced motion behavior through `prefers-reduced-motion`

## Technical Implementation

The interface does not use a static glass image. It combines these browser and
runtime capabilities:

- React 19 and TypeScript
- SVG `feDisplacementMap`, `feColorMatrix`, and channel blending（通道混合）
- CSS `backdrop-filter`, gradients, inset shadows, and blend modes（混合模式）
- Pointer Events for dragging
- vinext and Vite for building
- Cloudflare Workers for hosting

Dark mode preserves stronger RGB dispersion（RGB 色散）. Light mode uses neutral
displacement refraction and white caustic highlights（焦散高光） to avoid a fixed
blue outline around the glass.

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
```

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
