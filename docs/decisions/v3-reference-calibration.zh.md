# V3 参考校准液态玻璃透镜

日期：2026-08-07

> **历史记录（已由连续世界取样决策取代）**
>
> 本记录保留当时的参考校准决策，不能代表当前工作树。其中 `1.45` 内容副本缩放、双 mask 弯月面及相关校准值均为旧值；当前实现以连续世界取样为准。
>
> 本文所列部署与公开验证陈述均属于当时的历史证据，本批次未重新验证。后续的[中间弯月面校准记录](./v3-intermediate-meniscus-calibration.zh.md)与当前[连续世界取样决策](./v3-continuous-world-sampling.zh.md)分别记录其后的历史与当前实现。

## 范围与决策

本记录将 `/v3` 的源码实现按照完整的 `v3-reference-baseline` 帧进行校准；不会改写历史
[`v3-horizontal-navigation-lens`](./v3-horizontal-navigation-lens.zh.md) 记录。

- `/v3` 默认使用校准后的 Baseline 模式。服务端渲染 HTML 仍为
  `data-optics="baseline"`；Canvas 生成的位移场只会在 hydration 后创建。
- 暂态透镜只会在点击 travel 与指针拖拽期间显示；idle 会回到静态选中滑块。保留
  LensPhase 状态机、Pointer Events、键盘/ARIA 行为、减少动态路径，以及带
  `aria-hidden` 的透镜视觉层。
- Baseline 现在会在镜片 active 时应用完整、克制的椭圆凸透镜位移场。此前仅按参考帧
  的解读建议 Baseline 无滤镜，但用户决策优先；Edge 保持相同帧几何，只将边缘折射
  增强 14% 以供比较。
- 已审阅的参考帧仍只用于审阅，不会加入运行时 bundle；没有新增依赖。

## 已交付结果与改动区域

- [`app/v3/page.tsx`](../../app/v3/page.tsx) 定义了可维护的参考常量：`872 × 210`
  轨道、`296 × 242` 透镜、`20px` 边缘带、`36px` 滤镜留白、`1.45` 内容副本缩放，
  以及 `1.14` Edge 边缘倍率。完整 Baseline 位移场通过中心凸起进入已校准的
  `18–26px` 位移范围，再在椭圆边缘平滑回落。
- 在 `1264 × 948` 下，[`app/v3/v3.css`](../../app/v3/v3.css) 将 dock 锁定为
  `1124 × 210`，底部距离 `47px`：内部为 `872 × 210` 轨道、`42px` 间距和
  `210 × 210` sparkle 控件。透镜与轨道纵向居中，并有意在其上下各越过约
  `16–17px`；静态滑块为 `210 × 182`。
- 紧凑尺寸从实时轨道比例派生，不使用 `transform: scale`。透镜尺寸、拖拽夹具、
  滤镜 viewport、滤镜留白和中心 transform 使用同一组尺寸。本地坐标锚点仍为
  `top: 0`。
- 透镜材质使用中性深灰 `0.91` 主体、`1.5px` 冷灰 rim、`7px` 内暗环、左上高光、
  右下软阴影，以及偏移 `-6px` 的 `100 × 26` 上下 caustic，避免整圈青紫发光。
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 将 V3 viewport 固定为
  `1264 × 948`，断言参考几何、验证 active Baseline 与 Edge 拖拽的滤镜，保留 idle
  透镜隐藏语义并覆盖减少动态。Chromium 快照现在包括
  `v3-baseline-drag-chromium-darwin.png` 与
  `v3-edge-drag-chromium-darwin.png`。
- [`README.md`](../../README.md)、[`README.en.md`](../../README.en.md) 和
  [`README.zh.md`](../../README.zh.md) 说明当前公开行为，并链接这对双语决策记录。

## 验证证据

- `npx eslint app/v3/page.tsx tests/e2e/v3.spec.ts` 通过。
- `npm test` 通过：`vinext build` 完成，服务端渲染 HTML 测试 5/5 通过。
- `npx playwright test tests/e2e/v3.spec.ts --update-snapshots` 通过：无头
  Chromium 测试 7/7 通过，写入 Baseline 拖拽快照并重新生成 Edge 拖拽快照。
- `npm run test:e2e` 通过：无头 Chromium 测试 7/7 通过，覆盖 `1264 × 948` 几何
  断言、active Baseline 与 Edge 滤镜断言、idle 透镜隐藏、点击 travel、鼠标/触控/
  触控笔拖拽，以及减少动态选中。
- `npm run test:all` 通过：构建、服务端渲染 HTML 测试 5/5、全量 ESLint 与无头
  Chromium E2E 测试 7/7 均通过；`git diff --check` 通过。
- `npx wrangler deploy --config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --dry-run`
  通过；随后不带 `--dry-run` 的同一命令部署成功。部署版本为
  `5785df5f-f296-43d3-ad31-73e45bbc6bc9`。
- 公开验证：`https://liquid.hkooii.com/v3` 返回 HTTPS 200。无头浏览器在 Baseline
  拖拽时验证 `296 × 242` 透镜、`872 × 210` 轨道、隐藏的静态滑块与已应用的 SVG
  filter；控制台没有错误或警告，公开 Edge 控件可切换。

## 部署/发布状态

已将已验证构建部署到既有 Cloudflare Worker `liquid-lab-optics-demo`，版本为
`5785df5f-f296-43d3-ad31-73e45bbc6bc9`；现通过
`https://liquid.hkooii.com/v3` 提供公开演示。部署使用 `--keep-vars`，没有修改
生产绑定、变量、密钥或配额。校准实现提交 `a4be49a` 已推送至 `origin/main`。

## 已知限制与后续工作

- 视觉回归快照是 Chromium-darwin 基线，不能作为跨浏览器像素基线；未来发布前需要
  验证原生 Safari，因为 SVG `feDisplacementMap` 的行为与性能可能不同。
- 位移场会在 hydration 后生成，因此服务端输出有意不包含位移图像；active 透镜会在
  客户端位移场就绪后获得滤镜。
- 参考几何与材质来自审阅帧校准。未来改动应复查过渡帧、实体触控硬件与窄屏布局，
  不应仅从单张静态图推断时序或光学强度。
