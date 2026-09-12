# LiquidSheet 侧栏挂入舞台与折射对齐

**日期:** 2026-09-12
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地；未发布到生产 Worker

## 1. 范围与决策

`/ui/liquid-sheet` 原先把侧栏 portal 到 `document.body`，整页铺开，玻璃采样停在滑入起点。结果是：侧栏盖住目录导航，折射对不齐舞台，看起来像截了一块页面而不是玻璃板。

决策：预览把 `container` 设成舞台节点，侧栏从舞台右侧滑入；`StageWash` 在挂载期间每帧对齐，让复制内核对齐舞台。产品不传 `container` 时仍挂 `document.body`，作为视口右侧栏。不改位移核、旅行透镜、弹簧。

## 2. 交付结果与改动区域

- `LiquidSheet` 增加 `container`；进出场动画挂在 Radix `Content` 上，关闭时 Presence 会等滑出。
- `liquid-controls.css`：右侧栏 300/320px、无缩放、`data-contained` 改为绝对定位。
- 预览：`OverlayPreviewStage` 提供 portal；Sheet / Table 详情挂进舞台。
- `LiquidGlassCard` 在祖先 animation/transition 期间持续测量 `worldX/Y`。
- 内核提取同步到 Skill。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`{ files: 29, source: 'app/apple-clear' }` |
| 浏览器桌面 1280×800 | `/ui/liquid-sheet` 点「账号」→ 舞台右侧 300×496 玻璃栏，`StageWash` 与 `.ui-studio__preview` 矩形重合，sky/dusk/light 折射连续。Escape 关闭。 |
| 浏览器移动 390×844 | 侧栏仍在舞台内，宽 300px，左侧露出舞台。 |
| `/ui/liquid-table` | 点「亚太」打开同结构右侧栏，标题「亚太」。 |

## 4. 部署与发布状态

未执行 Worker 部署。公开站点仍为 `ced4b0d6-f829-4be6-aae8-64869fb453c1`。

## 5. 已知风险、限制与后续工作

- 预览 overlay 采样的是舞台洗色，不是真实 DOM 背景。产品要自己传 `scene`。
- 全高栏的位移场按像素生成，比菜单卡片重；栏宽限制在 300–320px。
- 表格预览里侧栏叠在表格玻璃上，属目录演示，不是产品推荐的 glass-on-glass。
