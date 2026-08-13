# V2 卡片容器液态玻璃决策记录

日期：2026-08-12

状态：已验证并发布至生产。Cloudflare Worker `liquid-lab-optics-demo` 版本
`50355dc2-6b65-4b7f-9955-83933c3ce75c` 自 2026-08-12 19:52:55 CST
（2026-08-12T11:52:55.160Z）起承载 100% 流量，发布消息为
`reimplement v2 cards from references`。

## 1. 范围与决策

本批次将 V2 的三张内容卡片设为独立的液态玻璃容器，以背景色彩穿透、局部失焦、冷色边缘高光、克制阴影和清晰前景内容为视觉目标。六张局部脱敏参考图仅用于设计与人工验收，不进入运行时代码；白天组三图已由 `IMG_0268.PNG`、`IMG_0269.PNG`、`IMG_0270.PNG` 替换此前的白天参考来源，夜晚组三图来自 `IMG_0264.PNG`、`IMG_0266.PNG`、`IMG_0267.PNG`。

- 保留 `/v2` 路由、三列桌面/单列窄屏布局、卡片信息架构、`<article>` 语义、菜单标识、唯一 `aria-current` 契约与 Baseline/Enhanced 控件。
- 不实现文件夹展开、全屏背景模糊、图标网格交互或 V3 改动；不新增运行时依赖、指针跟随或折射动画。
- Baseline 使用稳定的 CSS 玻璃；Enhanced 在能力可用时叠加基于受控装饰环境副本的圆角矩形边缘折射。

## 2. 交付结果与改动区域

- [`docs/assets/v2-card-liquid-glass/`](../assets/v2-card-liquid-glass/) 包含六张 `828 × 1792` PNG 参考图：白天组为 [`ambient-surface.png`](../assets/v2-card-liquid-glass/ambient-surface.png)、[`compact-glass-container.png`](../assets/v2-card-liquid-glass/compact-glass-container.png)、[`full-glass-container.png`](../assets/v2-card-liquid-glass/full-glass-container.png)，分别对应首页环境、紧凑文件夹玻璃状态和完整文件夹玻璃状态；该组由 `IMG_0268.PNG`、`IMG_0269.PNG`、`IMG_0270.PNG` 生成。夜晚组为 [`night-ambient-surface.png`](../assets/v2-card-liquid-glass/night-ambient-surface.png)、[`night-compact-glass-container.png`](../assets/v2-card-liquid-glass/night-compact-glass-container.png)、[`night-full-glass-container.png`](../assets/v2-card-liquid-glass/night-full-glass-container.png)，具有同样的首页环境、紧凑文件夹玻璃状态和完整文件夹玻璃状态，对应 `IMG_0264.PNG`、`IMG_0266.PNG`、`IMG_0267.PNG`。所有清晰可辨的应用名称仅在标签局部作马赛克：两张首页图各处理 20 个应用/文件夹名称；四张文件夹玻璃状态图各处理两个银行应用名称标签。图标、文件夹标题、背景、玻璃效果及指定标签框外像素保持原样，不进行重绘。六图仅用于设计与人工验收，不进入运行时代码；原始截图未被修改或提交。
- [`app/v2/page.tsx`](../../app/v2/page.tsx) 的内部 `LiquidCardSurface` 以同一 `AmbientScene` 作为可见背景与 Enhanced 副本的唯一蓝图。每张卡片固定为阴影、裁切表面/native backdrop、仅边缘的 Enhanced 折射、rim 与锐利内容；所有光学层均为 `aria-hidden` 且不接收 pointer events，实际内容仍只出现一次。
- [`app/v2/lens-optics.ts`](../../app/v2/lens-optics.ts) 的独立 `V2_CARD_LENS_OPTICS` 使用桌面 `24px` 圆角、`14px` 边缘区、中心 `1` 至边缘 `1.035` 放大、`2.4px` 折射、`20px` overscan 与最高 `2×` DPR。纯采样器与 Canvas 共用位移模型，最多 8 项 LRU 缓存按几何与受限 DPR 共享；既有导航 capsule 参数不变。
- [`app/v2/v2.css`](../../app/v2/v2.css) 使用主题化 `--v2-card-glass-*` tokens。浅色为中性白 `10%` 至冷蓝 `6%`，深色为白色 `8%` 至深蓝 `10%`；配合环境色 rim、顶部高光、底部弱暗边和 `0 12px 32px` 轻阴影。页面环境已冻结，避免副本与可见背景相位漂移。

## 3. 公开界面、渲染与降级

- 保留 `.v2-card`、`data-card-optics`、既有 V2 data attributes、菜单 ID 和可访问性契约；没有新增公开路由、组件 API 或数据结构。
- Baseline 使用玻璃填充、边缘高光、阴影和 `backdrop-filter`。可用时滤镜为 `blur(16px) saturate(125%) brightness(104%)`；深色主题 brightness 为 `101%`。
- Enhanced 需要 Canvas 2D、SVG `feImage`/`feDisplacementMap`、`backdrop-filter` 与 CSS mask。它只显示约 `14px` 的圆角边缘环，中心保持 native backdrop；任一能力缺失时保持 Baseline，不克隆业务 DOM，也不把 SVG filter 应用于正文。
- forced-colors 下关闭透明滤镜与增强副本，改用不透明系统表面和系统边框。紧凑布局、减少动态和既有主题/导航交互继续独立工作。

## 4. 验证证据

| 检查 | 结果 |
| --- | --- |
| 光学纯函数与导航隔离 | V2 光学验证通过，`25/25`；覆盖圆角卡片参数、既有导航 capsule 隔离、缓存键、编码范围、overscan、DPR 上限和 LRU。 |
| SSR / 渲染契约 | 构建与 SSR 测试通过，`6/6`；渲染断言覆盖三张 `<article class="v2-card">`、Baseline 首屏、无 Enhanced 副本/滤镜和无重复可访问内容。 |
| V2 Playwright 回归与视觉快照 | V2 专项验证通过，`25/25`；映射聚焦验证通过，`5/5`，覆盖受控场景与卡片世界坐标、主题与降级路径。 |
| Lint 与构建 | lint 与生产构建通过。全量测试仍保留一个既有 V3 glyph 阈值失败：`0.93 > 0.75`；本批次未修改 V3。 |
| 文档参考图完整性与局部脱敏检查 | 已核验：六图均为 `828 × 1792`；白天 `ambient/compact/full` 的 SHA-256 分别为 `172fa934ed31e0369118455b91384ffdaf14272e0e56f05c049c55d5ad088d70`、`d07753f9850275310e963a0fca005945d5b284f8a6122e26458e89a3041f0275`、`a96df5ea693fff3166a54d67552a5971620747393f6a6804bca88763a78f0f80`，夜晚 `night-ambient/night-compact/night-full` 的 SHA-256 分别为 `a117a54e519eaff77c0592ce90acc4b84fee647c9dfea40fa724665813be1592`、`cc7ceb2d6aeeed85b330ae9cb5d537ff0da6dfd0732d80d88b00b3e53376bcdd`、`923d67aee16ff13228e0360b236dcb09126f202b0dec5f0836c3aa0b4b5839e6`。两张首页图各局部马赛克 20 个应用/文件夹名称，四张文件夹状态图各局部马赛克两个银行应用名称标签；图标、文件夹标题、背景和玻璃效果不重绘。 |
| 发布 dry-run | Wrangler dry-run 通过：42 个 assets、9 个 modules、`1378.40 KiB`（gzip `301.42 KiB`），无 bindings。 |
| 生产 smoke | workers.dev 与自定义域名的 `/` 均返回 `307`；两个 `/v2` 入口均返回 `200`，CSS 均返回 `200`；页面均确认 3 个 `<article>` 与 3 个 `data-card-optics`。 |

## 5. 部署与发布状态

- 已使用 `dist/server/wrangler.json` 对既有 `liquid-lab-optics-demo` Worker 发布；未创建新 Worker、域名或 bindings。
- 生产版本为 `50355dc2-6b65-4b7f-9955-83933c3ce75c`，100% 流量，发布消息 `reimplement v2 cards from references`，时间为 2026-08-12T11:52:55.160Z（19:52:55 CST）。
- 回滚目标为先前生产版本 `1329511c-1c22-4fe9-a639-5c1fa384fa96`。

## 6. 已知风险、限制与后续工作

- 自动化结果仅能覆盖已运行的浏览器；原生 Safari 与真实触控硬件仍需单独人工验收，重点检查合成器闪烁、裁切错位和掉帧。
- `backdrop-filter` 与 SVG 合成表现因浏览器和硬件而异；能力探测失败会安全退回 Baseline，但仍应在目标设备确认视觉一致性。
- 全量测试仍被既有 V3 glyph 阈值 `0.93 > 0.75` 阻塞；它不属于本批次，未修改 V3。
- 六张参考图仍保留真实图标、文件夹标题、通知、状态栏及其他非应用名称内容；即使文件夹内银行标签已局部马赛克，它们也只适用于受控仓库内的设计参考，不得作为公开产品截图或运行时资产。
