# Apple Clear 默认内核决策记录

**日期：** 2026-08-16
**状态：** 已在 `grok/apple-liquid-glass-skill` 实现；视觉批准待定；未部署

## 1. 范围与决策

Skill 默认不再是 `v2-default`。未点名的请求选择 `apple-liquid-glass`：从 `app/apple-clear` 提取的浮动 Clear 文件夹/面板。V1、V2、V3 仍是显式模拟预设。第一块苹果表面是叠在主屏环境上的 iOS 文件夹 Clear 窗，六张金标在 `docs/assets/v2-card-liquid-glass/`。

本批次不改变该决策。它关闭默认内核的 Liquid Glass 缺口，而不用毛玻璃替代折射：外壳与旅行胶囊仍使用世界副本 `feDisplacementMap`；blur 只作次级散射。

## 2. 交付结果与改动区域

- `/apple-clear` 仍是浮动菜单。外壳在整面采样世界副本并应用 `feDisplacementMap`。条目切换仍走 `click → dragging → settling → fading`，只在 fade 之后提交 `aria-current`。
- 外壳和透镜的 `worldX` / `worldY` 锁定为 `stage − surface`。外扩仍是 `inset: -40`，副本再 inset 回玻璃盒（`inset: 40`），世界原点不再加上 `filterPadding`（40px）。这与 V2 一致：外扩 −40 + 副本 inset 40 + `world = stage − surface`。
- 两个主题下 `.apple-clear-shell__optical` 的 `--apple-clear-occluder` 均为 `transparent`。未对齐或未就绪的副本现在露出实况墙纸，而不再是涂色的 `#3b8ee8` / `#5a2f78` 卡片。
- `bypass()` 只覆盖 `prefers-reduced-motion` 或 `forced-colors`。Enhanced 但 SVG 不受支持、以及 Baseline，仍会跑旅行透镜，不再跳过选择板或立即提交。减少动态 / 强制颜色仍直接提交。
- 填充散射使用 `blur(var(--apple-clear-blur))`。令牌是 `--apple-clear-blur: 10px`。没有把 blur 提高到该令牌之上，也没有用它替代位移。
- 选择扫光是从上一项到下一项测得的中心向量（来自条目或选择板矩形的 `dx` / `dy`），由 WAAPI 播放。已删除固定纵向 `@keyframes apple-selection-sweep`。
- 捕获阶段的 `window` 监听：`pointerup` 结算、`pointercancel` 取消，以便元素捕获丢失时仍能结束拖拽。`lostpointercapture` 仍回到原点。
- 时钟瓷砖是左上角的小型墙纸文字层（`5.5% / 4.5%`，`min(20vw, 136px)`）。图标网格从它之后开始。标题「菜单」与 `09:54` 不再作为第二套文字叠在居中菜单下。
- 同一份四文件提取到 `skills/liquid-glass-interface/assets/strict-kernels/apple/`，并复制到 `Liquid-Glasses-skill-test/test-6/src/liquid-glass/kernel/`。旅行透镜和世界副本位移均保留。
- 旅行填充/外扩：`click` / `dragging` / `settling` 期间强制显示选择板 overscan/副本，填充为叠在副本上的 `0.2`。Idle/fading 仍是 `3%` + `0.5px`。
- 旅行高度：`click` / `dragging` / `settling` 期间选择板是 `74px` 胶囊（`border-radius: 32px`），仍能认出是 idle 高光，而不是 `124px` / `50%` 椭圆。Idle 与 fading 仍是安静的 `58px` / `22px` 胶囊。高度和 `border-radius` 仍按同一套 `680ms` / `260ms` 曲线动画——液体形变保留。位移场按 `74 × (menuWidth − 16)` 预构建，使第一帧旅行就有 `url(#lens)`。**选择板禁止使用 `border-radius: 50%`。**
- 菜单裁剪：`.apple-clear-menu` 为 `overflow: hidden` 且 `border-radius: 28px`，旅行胶囊被同一块圆角 Clear 窗裁掉（含首末项）。旅行高度是 `74`；舞台 / 墙纸不裁剪。`overflow: hidden` 会吃掉菜单自身的 `box-shadow`，所以阴影仍在不裁剪的 `.apple-clear-menu-frame` 包装层。选择板 overscan 仍是 `inset: -40`；靠近窗边缘时菜单裁剪可能切到这圈 overscan。
- 旅行 Y 微调：`--apple-selection-y` 仍是条目轨道。`--apple-travel-y-nudge` 在旅行态为 `-8px`（`(58 − 74) / 2`），idle/fading 为 `0`。选择板 transform 为 `selection-y + nudge`；世界 transform 为 `world-y − selection-y − nudge`，多出的 8px 是同一锁定的更高窗口，而不是向下错切。不用选择板的实时 `getBoundingClientRect` 当世界原点。静止 X 仍预烘焙；不用实时选择板矩形。
- 标签裁剪：`.apple-menu-visual--above` / `--below` 跟着旅行板，不跟着 idle 行。上沿为 `menu-pad + selection-y + travel-y-nudge`，下沿再加 `--apple-selection-height`。旅行板比行高时，轨道小字不会从板缘漏出叠在透镜大字上。透镜标签仍用 `translate3d(0, calc(-12px - var(--apple-selection-y) - var(--apple-travel-y-nudge)), 0)`，字留在条目轨道中心。菜单文字层为 `inset: 0 8px auto 8px`、`grid-auto-rows`、`align-content: start`。clip-path 不单独做动画，跟已注册的高度 / nudge 走。
- Y 运动只由 `.apple-clear-menu` 上已注册的 `@property --apple-selection-y`（及 nudge）驱动。选择板仍用 `transform: translate3d(0, calc(var(--apple-selection-y) + var(--apple-travel-y-nudge)), 0)`，但 **不** 把 `transform` 列入 `transition`。`.apple-selection-plate__world` 与 `.apple-menu-visual--lens` 没有 `transition: transform`。这消除了双重插值：标签洞已到信息、胶囊还停在照片。拖拽仍设 `transition-duration: 0ms`。结算只缩短高度/半径（`260ms, 260ms, 160ms, 160ms`），不再加回 transform 过渡。
- 旅行世界 X 是静止选择板原点 `stage.left − (menu.left + 8)`（y=0，高 58）。作为具体的 `translate3d(worldX, …)` 写在世界层上（`top: 0; left: 0`）。旅行不再重测选择板 X。选择透镜 SDF 为 `radiusCssPx: 32`（与旅行 CSS 半径一致）、`edgeZoneCssPx: 20`、`maximumZoom: 1.09`、`minimumZoom: 1.05`、`edgeRefractionCssPx: 4`，避免较小胶囊抹糊。填充保持 `0.2`；无毛玻璃；无 dock blur。
- 菜单字体：所有标签按 `--apple-menu-size-active: 20px` / `--apple-menu-weight-active: 700` 排版，盒子尺寸不变。未选中字形以 `transform-origin: center` 做 `scale(14/20)`，颜色 `rgb(255 255 255 / 78%)`。选中项与滑块标签为 `scale(1)` + `#fff`。字号变化是绕中心的均匀两轴缩放（静止 14、激活 20），不再是 1px 的 `font-size` 微调。旅行中 above/below 的 `data-selected` 跟 `interaction.targetIndex`。
- 菜单窗、外框和菜单项用 `--apple-menu-radius: 28px`。选择板用同心内圆角 `--apple-plate-radius: 20px`（`28 − 8` 静止内边距）。58px 高的板上写 28px 会变成半圆端，不再像容器的角。选择透镜 SDF `radiusCssPx` 为 `20`。
- 透镜弹簧：按下为 `data-lens-spring="pressed"`（`scale 1.09 / 0.84`，90ms）。旅行 / 拖拽 / 结算为 `"stretch"`（`scaleX 1 / scaleY 1.16`）。横向胀只走 `--apple-plate-inset`，旅行态不得对光学层做 `scaleX`，否则未缩放的选择板外框会在左右形成重影。投影加在 `__optical` 上，跟着玻璃走。消失和静止回到 `"rest"`。Y、胀缩和内边距用 `--apple-spring` 插值。`prefers-reduced-motion` 关闭压扁、拉长和过冲。
- 选中/静止选择板保持通栏宽度（`--apple-plate-inset: 8px`）。旅行内边距为 `-6px`，胶囊可向两侧各超出窗约 6px。菜单 `overflow: visible`，横向胀不被裁掉。透镜标签用 `translateX(calc(8px - var(--apple-plate-inset)))`。世界/场锁在旅行内边距（`PLATE_INSET = -6`）。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/apple-liquid-glass-skill` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`apple-liquid-glass source-to-kernel extraction assertions passed { files: 4, source: 'app/apple-clear' }`。资产与 `test-6` 副本与 `app/apple-clear` 一致。 |
| 中途截图 | `npx playwright test tests/e2e/apple-clear-travel-mid.spec.ts` 通过：`1 [chromium] › tests/e2e/apple-clear-travel-mid.spec.ts:13:1 › writes an apple-clear mid-flight travel capsule PNG (1.4s)`，随后 `1 passed (6.4s)`。主页 → 信息约 340ms 后覆盖写入 `output/playwright/apple-clear-travel-mid.png`。文件 mtime `2026-08-16 11:52:46 +0800`，大小 `373538` 字节。胶囊落在信息上；信息与设置标签可见（无空白行）。选择板是 `74×32` 胶囊（`width > height`，测得高度在 `65–85`）。未对 V2/V3 运行 `--update-snapshots`。未提交。 |
| 菜单字体 token | `--apple-menu-size-idle: 14px`；`--apple-menu-size-active: 20px`。共用圆角 `28px`。静止选择板内边距 `8px`，旅行 `-6px`。Verifier 断言圆角、内边距和 `overflow: visible`。 |
| 消失时字形中心 | 透镜 transform 减去 `--apple-travel-y-nudge`。Verifier 断言 `apple-menu-visual--lens` 含该变量。 |
| 浏览器视觉审阅 | 在人工接受最后一轮 `test-N` 证据前为 `implemented-awaiting-visual-approval` |
| 生产部署 | 未执行 |

## 4. 部署与发布状态

仅仓库与 Skill 资产变更。没有 Worker 部署。

## 5. 已知风险、限制与后续工作

- 标签栏 / Control Center Regular 不在本批次。
- 无人值守的 `test-N` 循环只能代理视觉门。
- 对照六张金标的人工比较仍待完成。
- `test-1` / `test-2` / `test-4` 中已有的 Vite 证明副本仍是 overscan 之前的内核，需要从 `assets/strict-kernels/apple/` 重新复制。本批次只更新了提取件。
- SVG `feDisplacementMap` 仍无法匹配原生 Apple 色散。
- 旅行胶囊使用白/环境填充而非 V2 的青紫环，以免 Clear 窗触发闭合色环否决。
- 旅行态（`click` / `dragging` / `settling`）强制选择板 overscan/副本为 `opacity: 1`，并把填充降到 `0.2`（远低于先前的 `0.72` 乳白色，且不再在 `data-entered="true"` 时抬到 `1`）。填充叠在副本之上，使被置换的墙纸成为主读；既有 inset 发丝线/内高光负责厚度。Idle/fading 仍是安静的 `3%` 填充 + `0.5px` 描边，静止态不加旅行乳白色。没有提高外壳 blur，也没有恢复 dock `blur(22px)`。世界锁定仍是 `calc(var(--apple-world-y) - var(--apple-selection-y))`。
- 74×32 / 58px 轨道改完后中途仍会吃掉信息：`--apple-selection-y` 已由菜单 `@property` 插值，选择板/世界/透镜又对 `transform` 做了一遍过渡，标签洞领先胶囊。这些 `transition` 列表已去掉 `transform`；Y 只跟 `@property`。胶囊仍可能略叠照片/信息（液体鼓起）。高度插值（`58 → 74`）与预构建的 `74px` 场在增高的前几帧会有轻微尺寸差。审阅中途仍是 主页 → 信息。选择 SDF 为 `1.05 / 1.09 / 4`。此 PNG 的人工视觉批准仍待定。
