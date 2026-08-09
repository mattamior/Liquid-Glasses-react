# V3 液态玻璃视觉差距分析

日期：2026-08-10
状态：诊断与实施方案；本报告不包含视觉修复、部署或本轮代码测试。

## 1. 执行摘要

当前 `/v3` 已具备可访问的横向导航、临时透镜、Canvas 位移场和 SVG
`feDisplacementMap`，但相对完整 Longbridge 参考图集仍存在显著视觉差距。最严重的
差距并非单一弯月面参数，而是：完整视口构图中出现了参考图没有的实验控制内容，且镜片
采样的是标签视觉副本而非完整导航场景，导致中途帧中央偏灰、内容碎片过少。

建议保留 Canvas normal field → SVG `feDisplacementMap` 的本地实现路线，不引入
WebGL 或运行时参考图。下一批次应先统一世界坐标和镜片坐标、以完整 world sample
（完整场景采样）替代局部标签副本，并移除硬编码的 `scale(1.45)`；随后才调收敛表面层。

## 2. 分析范围与参考证据

- 范围是 `/v3` 的桌面基准 `1264 × 948`，包括静态选中、开户→动态、动态→市场及
  Edge 观察帧，不改变 V1 或默认 V2。
- 用户提供的 9 张 JPEG 位于
  [`docs/references/v3-longbridge`](../references/v3-longbridge/)。状态映射、尺寸和
  SHA-256 位于
  [`reference-index.zh.md`](../references/v3-longbridge/reference-index.zh.md#L18-L28)；
  例如静态
  [`144625`](../references/v3-longbridge/IMG_20260806_144625.jpg)、中途
  [`144645`](../references/v3-longbridge/IMG_20260806_144645.jpg) 与左向中途
  [`144732`](../references/v3-longbridge/IMG_20260806_144732.jpg)。
- 当前本地回归帧是
  [`开户→动态中途`](../../tests/e2e/v3.spec.ts-snapshots/v3-open-to-activity-mid-drag-chromium-darwin.png)
  和
  [`动态→市场中途`](../../tests/e2e/v3.spec.ts-snapshots/v3-activity-to-market-mid-drag-chromium-darwin.png)。
  它们是 lens crop，不是全视口参考图比对。
- 参考图只确立外观和捕获状态，不能单独确定时长、缓动或滤镜数值，见
  [`reference-index.zh.md`](../references/v3-longbridge/reference-index.zh.md#L39-L45)。

## 3. CodeGraph 建图证据与限制

本批次使用本机 CLI `@colbymchenry/codegraph@1.5.0`；可执行文件为
`/Users/jay/.local/bin/codegraph`。以 `CODEGRAPH_TELEMETRY=0` 执行
`codegraph init .`，当前版本将初始建图作为默认行为，`--index` 已弃用。

| 证据 | 结果 |
| --- | --- |
| `codegraph status .` | 27 files、309 nodes、639 edges；SQLite WAL；索引最新。 |
| `codegraph query V3Page` | `app/v3/page.tsx:229`。 |
| `codegraph query createEllipticalField` | `app/v3/page.tsx:108`。 |
| `codegraph query LensFilter` | `app/v3/page.tsx:149`，另有 V1 同名符号。 |
| `codegraph node V3Page` | 返回当前 V3Page 源码和行号。 |

CodeGraph 本次只收录 TypeScript、TSX 与 JavaScript 共 27 个代码文件；它不收录
`v3.css`、Markdown 或 JPEG。因此 CSS、测试快照和参考图结论均以带行号的源码/文件
检索补充，不能将宽泛的自然语言 `explore` 结果当作视觉实现地图。

## 4. 当前实现地图

| 区域 | 路径与行号 | 当前职责 |
| --- | --- | --- |
| 路由与入口 | [`app/page.tsx:1-5`](../../app/page.tsx#L1-L5)、[`app/v3/layout.tsx:1-15`](../../app/v3/layout.tsx#L1-L15) | 根路由重定向 `/v2`；V3 是独立直达路由。 |
| 参数与位移场 | [`app/v3/page.tsx:65-174`](../../app/v3/page.tsx#L65-L174) | 定义 872×210 轨道、296×242 镜片、24px 弯月面、11px Baseline 折射、1.14 Edge 倍率；Canvas 生成椭圆 normal field 并交给 SVG 位移滤镜。 |
| 几何与状态机 | [`app/v3/page.tsx:363-547`](../../app/v3/page.tsx#L363-L547) | 测量导航几何、ResizeObserver、点击的 primed/expanding/travelling/idle 状态。 |
| 拖拽与吸附 | [`app/v3/page.tsx:579-696`](../../app/v3/page.tsx#L579-L696) | 5px 阈值、每帧位置更新、最近标签、取消与窗口级兜底。 |
| 图层树 | [`app/v3/page.tsx:706-780`](../../app/v3/page.tsx#L706-L780) | 注入 CSS 变量，渲染 base、selection、lens 三个 `NavVisual` 副本、SVG defs 与实验控制内容。 |
| 轨道与滑块 | [`app/v3/v3.css:93-212`](../../app/v3/v3.css#L93-L212) | 胶囊轨道、四列基础视觉、静态 selection slider。 |
| 镜片与内容映射 | [`app/v3/v3.css:240-344`](../../app/v3/v3.css#L240-L344) | 镜片定位、过渡、灰色 viewport 与局部 world 副本；现有复制品使用 `scale(1.45)`。 |
| 表面层 | [`app/v3/v3.css:346-418`](../../app/v3/v3.css#L346-L418) | 内环、双弯月面 mask、上下极点与 sheen。 |
| 自动化 | [`tests/e2e/v3.spec.ts:47-51`](../../tests/e2e/v3.spec.ts#L47-L51)、[`84-119`](../../tests/e2e/v3.spec.ts#L84-L119)、[`170-192`](../../tests/e2e/v3.spec.ts#L170-L192)、[`249-270`](../../tests/e2e/v3.spec.ts#L249-L270) | 固定视口和关键几何；只截取 5 个局部镜片帧。 |

## 5. 参考图与当前效果的差异

| 优先级 | 差异 | 证据 | 当前表现与影响 |
| --- | --- | --- | --- |
| P0 | 全视口构图 | 参考静态帧没有标题或 optics 控制；[`page.tsx:731-733`](../../app/v3/page.tsx#L731-L733) 恒定渲染两者。 | 参考目标之外的文字和控件必然改变整张图的层级。 |
| P0 | 镜片内容采样 | 参考 [`144645`](../references/v3-longbridge/IMG_20260806_144645.jpg) 有大面积白色图标/中文笔画；当前中途 crop 中央主要是灰色。 | 标签副本无法连续代表轨道、选中态和环境；中途帧缺少参考中的内容密度。 |
| P0 | 坐标与放大 | [`v3.css:319-329`](../../app/v3/v3.css#L319-L329) 硬编码 `scale(1.45)`；测试只允许 lens center 小于 4px 的误差，[`v3.spec.ts:160-163`](../../tests/e2e/v3.spec.ts#L160-L163)。 | 参考帧的文字/图标落点与占比无法被稳定复现；4px 容差会保留可见偏移。 |
| P1 | 表面材质 | [`v3.css:268-418`](../../app/v3/v3.css#L268-L418) 是固定灰色填充、渐变和 mask。 | 轮廓、内暗回流、上下焦散与参考的中性厚玻璃仍未形成同一套连续表面。 |
| P1 | Baseline/Edge 角色 | [`page.tsx:134-136`](../../app/v3/page.tsx#L134-L136) 仅把 Edge 放大 1.14 倍；[`v3.css:286-294`](../../app/v3/v3.css#L286-L294) 也改边框/阴影。 | 两个模式同时改变多种表象，难以判断差异是否来自折射，而非边框或亮度。 |
| P2 | 回归覆盖范围 | 参考索引明确不是像素基线；现有测试重点是局部截图。 | 背景、轨道、侧圆按钮、静态状态和全视口构图没有自动拦截。 |

## 6. 技术根因

1. 临时镜片在 [`page.tsx:773`](../../app/v3/page.tsx#L773) 仅复制 `NavVisual`，而
   viewport 在 [`v3.css:308-317`](../../app/v3/v3.css#L308-L317) 又有近不透明灰色填充；
   它不是一份完整底层场景的连续取样。
2. 世界到镜片的变换分散在 React CSS 变量和 CSS transform 中，并以 `scale(1.45)`
   作为视觉近似；没有用参考帧的 landmark（锚点）校准放大率与中心偏移。
3. 轨道、透镜和表面效果由多组独立常量调节，缺少“同一坐标、同一表面、同一采样源”的
   合成边界。
4. 自动化验证了交互语义和盒模型，却没有验证参考场景的全视口构图、内容密度或逐帧锚点。

## 7. 推荐方案

1. 保留 Canvas normal field → SVG `feDisplacementMap`，继续将 JPEG 仅用于审阅；不引入
   WebGL、运行时图片或新依赖。
2. 为参考模式移除 [`page.tsx:731-733`](../../app/v3/page.tsx#L731-L733) 的实验标题和
   optics UI，或将其放入不参与参考截图的显式演示层。
3. 在固定镜片 viewport 内放置一份完整、单一的 rail/world sample（轨道底、四项、静态
   选中视觉）；只对该 sample 施加位移滤镜。不要把稳定核心和边缘拼成多个复制品。
4. 删除 [`v3.css:327`](../../app/v3/v3.css#L327) 的 `scale(1.45)`，用一个由
   `lensCenter`、`worldOrigin`、`opticScale` 组成的统一坐标变换。根据四个移动参考帧的
   图标和文字锚点标定，并将最终中心误差收敛至 1.5px 以下，修复现有最多 4px 的可见偏移。
5. 先锁定 Baseline 的几何、灰色填充、内暗环、外 rim 和上下焦散；Edge 只使用相同几何的
   位移强度档，不能同时引入独立缩放、边框或阴影变化。

## 8. 分阶段实施

| 阶段 | 交付内容 | 退出条件 |
| --- | --- | --- |
| 0：测量 | 标注九张参考图中轨道、侧圆按钮、镜片、文字/图标锚点；建立 `1264 × 948` 基准。 | 每个目标状态有可复查的坐标表。 |
| 1：构图与坐标 | 移除参考图外的 UI；实现单一完整 world sample；替换 `scale(1.45)` 并收敛中心偏移。 | 5 个关键帧的几何和内容锚点达到第 9 节阈值。 |
| 2：光学表面 | 保持 Canvas/SVG 管线，分别调 Baseline 位移、内暗、rim、焦散；Edge 仅调强度。 | Baseline 与 Edge 的几何一致，表面分层无接缝或重复字形。 |
| 3：回归与兼容 | 新增全视口状态截图、锚点检查、Chromium/Firefox/WebKit 冒烟与 Safari 真机审阅。 | 自动检查通过，人工叠图记录全部 9 帧。 |

## 9. 量化验收阈值

| 项目 | 阈值 |
| --- | --- |
| 1264 × 948 基准几何 | dock、rail、侧圆按钮与镜片外框的每个测量锚点误差 ≤ 1px。 |
| 镜片中心与内容锚点 | 中心和图标/文字 landmark 平均误差 ≤ 1.5px，最大误差 ≤ 2px；不得保留 4px 容差。 |
| 内容映射 | 四个移动帧中文字/图标 scale 误差 ≤ 2%，镜片中央不得出现无参考依据的大面积纯灰空区。 |
| 图层完整性 | 静态态只有一个白色选中副本；移动态没有重复字形、接缝或提前提交的选中态。 |
| 回归 | 1 个静态全视口 + 4 个移动全视口 + 1 个 Edge 全视口的截图检查；原有交互、减少动态和 ARIA 检查全部通过。 |
| 性能与日志 | 60Hz 拖拽时位置更新 p95 ≤ 16.7ms；无页面错误或控制台警告；位移场只在尺寸或 optics 改变时重建。 |

## 10. 浏览器兼容、性能与回滚

- Chromium 是自动化基线；Firefox 和 WebKit 做冒烟检查；必须补充原生 Safari 手动检查，
  因 SVG `feDisplacementMap` 与 CSS mask 可能存在渲染和性能差异。
- 单一完整 sample 应在拖拽时只更新 transform；Canvas 位移图只在 ResizeObserver 或
  optics 切换后重建，避免逐指针事件创建 data URL。
- 以 feature flag（功能开关）或独立 reference optics 变量保留当前实现路径。若 Safari
  或性能验收失败，回退到现有 Baseline 视觉与交互，不回退 Pointer Events、减少动态或
  `aria-current` 契约。

## 11. 当前交付、发布状态与风险

本报告只新增诊断、计划和 CodeGraph 索引忽略规则；没有实现视觉修复、没有修改
`app/`、`tests/`、快照或既有决策记录，没有部署，也没有运行本轮代码测试。CodeGraph 的
本地 `.codegraph/` 数据已从 Git 状态中忽略，不属于发布产物。

已知风险是参考 JPEG 的压缩/捕获时序不适合作为跨浏览器逐像素真值、当前工作树已有其他
未提交改动，以及 CodeGraph 不索引 CSS/Markdown/JPEG。后续批次应先完成阶段 0 的坐标表，
在干净可复现实例中跑完整测试和浏览器审阅，再决定是否发布。
