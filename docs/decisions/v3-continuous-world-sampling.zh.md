# V3 连续世界取样决策记录

日期：2026-08-10

状态：本地实现已验证并已发布生产；Cloudflare Worker 版本 `3f2aff04-1693-4231-aee0-d7c757d7536d` 承载 100% 流量。

## 1. 范围与决策

本记录覆盖 `/v3` 横向导航透镜在完整 Longbridge 参考图集审阅后的连续世界取样
（continuous world sampling）重构。它补充而不改写既有的
[`v3-horizontal-navigation-lens`](./v3-horizontal-navigation-lens.zh.md) 与
[`v3-reference-calibration`](./v3-reference-calibration.zh.md) 记录。

- 保留 Canvas normal field → SVG `feDisplacementMap` 的局部折射管线；不引入 WebGL、
  运行时参考图或新依赖。
- 透镜改为取样单一、完整的导航世界：轨道、四个标签和已提交选中视觉共用 padding-box
  坐标系；不再以独立的 CSS `scale(1.45)` 放大标签副本。
- 默认 `/v3` 是 reference presentation；`?chrome=demo` 才显示实验说明与 optics 控件。
  `?optics=edge` 保留为比较入口，Edge 只改变同一 field 的弯月面折射强度。
- 参考 JPEG 仍只用于人工保真审阅和 landmark 标定，不进入运行时 bundle，也不是跨浏览器
  逐像素真值。

## 2. 已交付结果与改动区域

- [`app/v3/lens-optics.ts`](../../app/v3/lens-optics.ts) 新增 `LensCoordinateSpace`、
  `LensOpticsConfig`、统一 world transform 与椭圆 SDF 位移场生成。field 在中心以
  `coreZoom: 0.12` 产生放大采样，在 `24px` 弯月面带加入 `11px` Baseline 法线折射；
  Edge 使用相同几何和 `1.14` 强度倍率。
- [`app/v3/page.tsx`](../../app/v3/page.tsx) 以 `NavigationWorld` 统一 base、selection
  与 lens 的视觉结构；导航 padding-box 的 origin、tabs、slider、拖拽夹具和 lens
  world transform 使用同一组实时几何。
- [`app/v3/v3.css`](../../app/v3/v3.css) 删除 lens 内容的固定 `1.45` 放大，改为只对
  完整 world sample 应用坐标 transform；reference default 隐藏 demo chrome，Edge 不再
  通过独立材质改变边框或阴影。
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 与新增的
  [`tests/e2e/v3-optics.spec.ts`](../../tests/e2e/v3-optics.spec.ts) 覆盖连续取样、
  坐标、fallback 和 optics 契约。新增 6 个全视口状态基线（其中 1 个 idle），并更新
  5 个 lens crop 基线；数量以当前测试断言与快照文件为准。

## 3. 公共界面与兼容契约

- 公开路由仍为 `/v3`；默认视觉为 `data-chrome="reference"` 和
  `data-optics="baseline"`。`?chrome=demo` 显示调试 chrome，`?optics=edge` 选择 Edge
  比较场。
- 保留 `data-lens-phase`、`data-slider-phase`、`data-preview-id`、selection slider 的
  `data-*` 状态，以及单一 `aria-current="page"` 的提交语义。视觉副本继续
  `aria-hidden`，真实按钮仍是唯一的交互与可访问层。
- 主鼠标、触摸和触控笔的 Pointer Events、5px 拖拽阈值、释放后吸附、取消恢复、
  ResizeObserver、页面隐藏处理与减少动态路径均保持。

## 4. 光学、DPR 与降级

- 位移场以 CSS px 计算，raster resolution 为 `ceil(devicePixelRatio)` 并上限为 `2`；
  仅在尺寸、optics 或有效 DPR 改变时重建，不随 pointer move 创建 Canvas 或 data URL。
- filter padding 保持 `36px`，容纳中心和弯月面组合位移。中心放大进入 field 编码，
  不再与 CSS content scale 叠加。
- Canvas、field 或 SVG filter 不可用时，点击直接提交静态 selection；不会显示无折射的
  临时镜片。`prefers-reduced-motion: reduce` 与 `forced-colors: active` 同样走直接提交，
  后者同时提供系统颜色的静态选中样式。

## 5. 验证证据

- `npx playwright test tests/e2e/v3.spec.ts tests/e2e/v3-optics.spec.ts` 通过：无头
  Chromium 16/16 通过；新增 `forced-colors: active`、Canvas 2D context 不可用，以及 SVG
  filter constructors 不可用时的直接提交 fallback E2E，确认三种情况下均不显示临时镜片，
  且仍提交静态 selection。
- `calculateRasterScale` 契约测试覆盖 DPR `<=1`、`1.x`、`2` 与 `3`：分别得到 `1`、`2`、
  `2`、`2`，锁定有效 raster scale 的 `DPR <= 2` 上限。
- `npm test` 通过：构建完成，服务端渲染测试 5/5 通过；`npm run lint`、`npm run build`
  和 `git diff --check` 均通过。
- 第三轮无头视觉审阅结论为 Go；在记录的关键 landmark 上实测到 `1.151×` 与 `1.125×`
  的内容映射倍率。该结果用于本地参考审阅，不宣称为跨浏览器像素保证。
- 已审阅完整 9 张 Longbridge 参考图，并将静态、开户→动态、动态→市场与 Edge 状态
  映射到自动化关键帧。

## 6. 部署与发布状态

2026-08-10 已发布到 Cloudflare Worker `liquid-lab-optics-demo`。Wrangler `4.92.0` 下，
构建、dry-run 和正式 deploy 均以 exit 0 完成；发布命令使用
`--config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --message`。

新版本 `3f2aff04-1693-4231-aee0-d7c757d7536d` 已承载 100% 流量。custom URL
[`https://liquid.hkooii.com/v3`](https://liquid.hkooii.com/v3) 与 workers.dev URL
[`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3)
均已通过生产 smoke：返回 200 HTML；default、demo、Edge、拖拽、ARIA、SVG filter 与零 console
错误均已检查。发布上传 6 个修改/新增资产并复用 25 个资产，总计 `1298.91 KiB`（gzip
`285.54 KiB`），Worker startup 为 `16ms`。生产截图保存在已忽略的 `output/`，不进入版本控制。

发布前 100% 流量版本为 `98d48f5b-85be-4a21-9bba-f7c756a7a304`，是本次回滚目标；如需回滚，
使用 `npx wrangler rollback 98d48f5b-85be-4a21-9bba-f7c756a7a304 --name liquid-lab-optics-demo`。

## 7. 已知风险、限制与回滚

- Chromium 快照只保护固定的本地环境；Firefox/WebKit 尚未配置为本批次自动化项目，原生
  Safari 也尚未完成手动验收。SVG `feDisplacementMap`、CSS mask 与合成性能仍需在 Safari
  真机复核。
- JPEG 压缩、捕获时序和外部应用上下文不适合作为跨浏览器逐像素真值。窄屏、跨显示器 DPR
  切换和真实触控硬件仍需补充人工审阅。
- 回滚以 Git 提交为边界：可回退连续世界取样实现提交，同时保留 Pointer Events、ARIA、
  reduced-motion 和静态 selection 契约；不保留长期并行的 legacy renderer。

## 8. 既有工作树改动

本批次保留用户原有未提交的 V3 校准、README、决策记录与快照改动，并在连续世界取样
实现上合并它们；没有删除或重写既有 `v3-reference-calibration` 记录。后续提交前必须继续
区分本记录/实现批次与用户原有工作树改动。
