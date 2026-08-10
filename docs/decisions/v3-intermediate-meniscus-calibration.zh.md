# V3 中间弯月面校准记录

日期：2026-08-07

> **历史中间记录**
>
> 本记录保留连续世界取样之前紧邻的一轮参考校准。其中 CSS `scale(1.45)` 标签副本、`24px` / `11px` 弯月面与双椭圆掩膜均为历史值，并非当前实现；连续世界取样批次没有重新验证这些值。
>
> 请参阅更早的[参考校准记录](./v3-reference-calibration.zh.md)以及当前的[连续世界取样决策](./v3-continuous-world-sampling.zh.md)。

## 范围与决策

本记录覆盖 `/v3` 按完整 Longbridge 参考图集完成的一轮本地细化；它补充而不改写更早的
参考校准记录。

- `296 × 242` 暂态透镜、`872 × 210` 轨道、LensPhase 状态机、Pointer Events、ARIA
  行为、静态滑块视觉归属和减少动态路径均保持不变。
- Baseline 与 Edge 在连续的 `24px` 弯月面带内沿椭圆法线向内采样。Baseline 在轮廓处
  达到 `11px`；Edge 保持几何，以 1.14 倍达到 `12.54px`。中央凸透镜场与边缘带平滑
  重叠，以避免环形断层。
- 历史材质加入中性的带掩膜弯月面聚光和相邻的内侧暗回流带。它不依赖移动方向，也不
  使用彩色发光、WebGL、运行时图片或新依赖。
- 九张 Longbridge 图片仍只用于视觉审阅；不会加入运行时 bundle 或逐像素自动化基线。

## 已交付结果与改动区域

- [`app/v3/page.tsx`](../../app/v3/page.tsx) 将更早的向外 `20px` 边缘场替换为
  `24px`、向内 `11px` 的 Baseline 弯月面场。Edge 仅以 1.14 倍改变场强；保留
  `36px` 滤镜留白、CSS `scale(1.45)` 内容副本和参考几何。
- [`app/v3/v3.css`](../../app/v3/v3.css) 为冷灰聚光带与内侧暗回流新增独立的椭圆掩膜。
  rim、暗环、上下焦散与 sheen 已收敛为一个水滴表面。
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 记录 Baseline 开户→动态的中途与
  目标帧、动态→市场的起点与中途帧，以及对应的 Edge 中途帧。两张泛化拖拽快照由这些
  具名过渡快照替代。
- [`README.md`](../../README.md)、[`README.en.md`](../../README.en.md) 和
  [`README.zh.md`](../../README.zh.md) 描述当时的内向弯月面行为及已发布演示。

## 验证证据

- `npx playwright test tests/e2e/v3.spec.ts --update-snapshots` 当时通过：无头
  Chromium 测试 8/8 通过，写入五张具名弯月面快照。
- `npm run test:all` 当时通过：`vinext build`、服务端渲染 HTML 测试 5/5、全量 ESLint
  与无头 Chromium E2E 测试 8/8 均通过。
- `git diff --check` 当时通过。
- 已审阅完整的九张 Longbridge 图片。移动帧 `144645`、`144654`、`144724` 与
  `144732` 用于验收：文字和图标会在轮廓内被压缩和弯折，而非仅处在更亮的圆形描边后方。

## 部署/发布状态

历史已验证构建使用生成的 `dist/server/wrangler.json` 与 `--keep-vars` 部署到 Cloudflare
Worker `liquid-lab-optics-demo`，版本为 `98d48f5b-85be-4a21-9bba-f7c756a7a304`。没有修改
绑定、变量、密钥或配额；该批次没有推送。

历史公开验证在
[`https://liquid.hkooii.com/v3?optics=edge`](https://liquid.hkooii.com/v3?optics=edge)
返回 HTTPS 200。无头鼠标拖拽进入 `dragging`、显示透镜、隐藏静态滑块、应用本地 SVG
filter，并在释放后提交目标项；浏览器报告零错误、零警告。

## 已知限制与后续工作

- Chromium-darwin 快照保护已审阅的过渡位置，而非跨浏览器像素。发布前应验证原生
  Safari，因为 SVG `feDisplacementMap` 与 CSS 掩膜的渲染及性能可能不同。
- 位移场在 hydration 后创建，因此服务端渲染 HTML 有意不包含位移图像。
- 提供的图片只确立已捕获的外观，不能确立精确时序、滤镜数值或着色器行为。后续工作
  应复查全部九帧并在真实触控硬件上确认。
