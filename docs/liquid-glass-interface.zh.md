# Web 液态玻璃界面方法

这套方法将本 Demo 中经过多轮视觉调校的经验整理为可复用的 Web 界面工作流。对应的 Agent Skill 位于 [`skills/liquid-glass-interface`](../skills/liquid-glass-interface/)。

## 版本路由与资产

`/` 会进入当前的 V2 导航实验。`/v1` 仍可直接访问，但作为冻结的归档 Demo；它的视觉与交互不再是当前默认。普通导航从 [`assets/v2-reference-implementation`](../skills/liquid-glass-interface/assets/v2-reference-implementation/) 开始；只有明确要求复刻 V1 原始 Demo 时才使用 [`assets/v1-fidelity-kit`](../skills/liquid-glass-interface/assets/v1-fidelity-kit/)。未来版本以并列的 `vN-*` 资产加入，不覆盖已归档的基线。

## 适用边界

液态玻璃适合承载导航、工具栏、菜单、选择状态和浮动控制层，用材质变化表达层级、上下文或状态转换。若组件只是普通内容卡片，或背景缺少可被折射的视觉信息，应优先采用简单的实色或半透明表面。

本方法面向 React、CSS、SVG 及相近的 Web 技术栈，不提供原生 iOS 或 SwiftUI 实现配方。iOS 26 及以上的原生应用应优先使用系统提供的 Liquid Glass API。

## 苹果官方设计基准

苹果官方资料是本方法的最高级判定标准，优先级依次为 Apple Human Interface Guidelines、Apple Developer Documentation、Apple WWDC 官方设计讲解，最后才是社区实现经验。社区资料只能补充 Web 技术路径，不能改变苹果对功能层级、材料变体、lensing、动态适配、可读性和无障碍的定义。完整规则见 [`apple-design-logic.zh.md`](../skills/liquid-glass-interface/references/apple-design-logic.zh.md)。

Liquid Glass 应位于内容之上的功能层，用于导航、工具栏、菜单、popover 和重要控件；不要普遍用于内容卡片，也不要堆叠 glass-on-glass。整个表面参与折射，但内部保持低梯度、连续、稳定和可辨认；圆角边缘因曲率与折射梯度更高而产生更强的局部弯折。模糊服务于可读性和光散射，不能代替或压过 lensing。

必须区分四个维度：苹果材料变体 Regular/Clear、Web 渲染能力 Baseline/Enhanced、Light/Dark 主题和 Resting/Interactive 状态。菜单与大量文字默认采用 Regular；Clear 仅适用于丰富媒体背景、粗亮前景且允许暗化层的场景。Baseline/Enhanced 绝不是 Regular/Clear 的别名。

盲测可让文字、网格和色带穿过玻璃边缘以证明折射；正式产品稳定状态则应避免干扰性交叉，或使用与 Apple Scroll Edge Effects 语义一致的柔化、淡化或暗化处理。若用户明确选择偏离官方规范，应先标注偏离，并将结果描述为自定义玻璃效果，而不是 Apple-aligned Liquid Glass。

## 五层材质模型

可信的液态玻璃由五个可独立调校和关闭的层级组成：

1. 环境背景：提供可被折射的颜色、明暗和结构。
2. 折射层：重新采样并位移背景，不扭曲前景文字和控件。
3. 透明填充：负责主题色、模糊、饱和度和对比度。
4. 边缘光学：提供克制的高光、阴影和局部焦散。
5. 内容交互：保持文字、图标、焦点和点击区域清晰稳定。

先完成无需滤镜也能工作的布局和降级样式，再加入折射。圆角容器、采样层、滤镜区域和裁切路径必须保持一致，避免边缘断裂或方角闪现。

## 折射管线与两级策略

基础层始终先交付：主题化的半透明或近不透明填充、中性边框或内高光、阴影、可读内容和焦点样式。只有 `backdrop-filter` 或 `-webkit-backdrop-filter` 可用时，才将模糊和饱和度作为增强效果加入。基础层不依赖 SVG 滤镜，必须保留层级、对比度、命中区域和键盘可用性。

增强层用于真实折射。Web 平台无法稳定、通用地把动态 CSS backdrop 直接作为 SVG `feDisplacementMap` 的输入：`backdrop-filter` 采样元素背后的像素，而 SVG 滤镜输入不能可移植地取得该采样结果。因此，不能把对半透明叠层应用 SVG 滤镜误称为真实的背景折射。

真实的 Web 折射需要与环境坐标对齐的“场景副本/重渲染采样层”：应用以同一场景模型、尺寸、断点和世界坐标，在玻璃后方渲染第二份仅展示用的可控视觉场景；按玻璃相对于场景的原点平移它；只对该副本施加 SVG 位移；最后按玻璃形状裁切。可见场景仍保留语义和交互；副本应设置 `aria-hidden`、不可交互。

场景副本只能来自应用明确拥有并允许复制的视觉层，例如 CSS 渐变、装饰 SVG、已知 canvas 场景或确定性数据驱动图形。禁止使用 DOM 截图、canvas/屏幕捕获 API 或隐式捕获任意页面像素；不得复制私有页面内容、用户数据、表单、消息或第三方嵌入内容。

SVG `feDisplacementMap` 可读取圆角边缘位移贴图的红、绿通道，改变场景副本的采样位置；模糊、饱和度、对比度和主题填充继续由 CSS 管理。前景内容必须位于滤镜之外。副本 overscan、SVG filter region、外层裁切和圆角半径必须同步；filter region 至少覆盖最大位移幅度，避免置换像素被裁断。

光学裁切只施加于包含场景副本、位移、高光等效果的光学 wrapper，不能裁切整个 component。语义控件、点击区域、焦点环和阴影留在裁切之外。popover、menu、tooltip 等 overlay 必须位于该裁切外，或经 portal 渲染并明确层叠与定位关系；不得因 `overflow: hidden`、`clip-path` 或 mask 被裁掉或失去点击能力。

每个 SVG `clipPath` 必须选定坐标系：使用 `clipPathUnits="objectBoundingBox"` 时仅使用 0–1 归一化几何并保证目标包围盒非零；使用 `clipPathUnits="userSpaceOnUse"` 时提供与光学 wrapper 一致的明确当前宽高。禁止在零尺寸或坐标含糊的 `<defs>` 中使用百分比几何并假定会匹配组件；无法可靠建立坐标系时，改用仅裁切光学 wrapper 的 CSS 裁切，或省略增强光学层。

### React 实例 ID 与特性检测

每个组件实例都应使用 `useId()` 生成独立的 filter/clip ID。React ID 可能带冒号；它在 HTML `id` 中合法，但会使 CSS 选择器和未加引号的 `url()` 易出错。应编码非安全字符，用内联 React style 中带引号的 `url("#id")`，不要使用 CSS `#id` 选择器定位该 ID。

增强顺序固定为：基础 fill/border/shadow → 检测到 `backdrop-filter` 或 `-webkit-backdrop-filter` 后加入背景模糊 → 可取得坐标对齐副本后渲染副本 → 在真实目标浏览器通过视觉和性能检查后，仅对副本启用标准 SVG `filter`。`CSS.supports("filter", "url(#candidate)")` 只能检查语法，不能证明 SVG 滤镜、对齐或采样管线可用；不可夸大为跨浏览器保证。

```tsx
const toSafeSvgId = (value: string) => `liquid-${Array.from(value, (char) =>
  /[A-Za-z0-9_-]/.test(char) ? char : `x${char.codePointAt(0)?.toString(16)}x`,
).join("")}`;

const instanceId = toSafeSvgId(useId());
const filterId = `${instanceId}-filter`;
const clipId = `${instanceId}-clip`;
const opticsStyle = {
  filter: `url("#${filterId}")`,
  clipPath: `url("#${clipId}")`,
} as CSSProperties;
```

```css
/* 基础层在 feature query 外；标准与 WebKit 前缀均单独检测。 */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass__fill {
    -webkit-backdrop-filter: blur(18px) saturate(1.12);
    backdrop-filter: blur(18px) saturate(1.12);
  }
}
@supports (filter: url("#candidate")) {
  .glass[data-enhanced-refraction="true"] .glass__scene-replica { filter: var(--scene-filter); }
}
```

RGB 色散不是液态玻璃的必要条件。暗色主题可以使用轻微通道偏移强化环境色彩；亮色主题应优先采用同向通道位移、中性白色高光和较低饱和度。若圆角边缘出现固定闭合的蓝色或紫色光圈，应将其视为渲染缺陷，而不是折射效果。

## 状态驱动的动效

菜单开合、选择项、主题和材质模式应成为动效的明确状态来源。顶栏与菜单可以通过共享耦合场、同步位移或透明度表达关系，但展开过程中不应把圆角短暂拉成直角。

当前导航将已提交选中态保持为扁平样式，只在点击、按住或鼠标拖拽期间显示临时玻璃透镜。生命周期为 `click → dragging → settling → fading`：透镜存在时隐藏扁平选中视觉；透镜吸附到目标后淡出；淡出完成才同时提交内容、`aria-current` 与扁平选中态。只有产品明确需要持续材质选中状态时，才使用持续存在的玻璃底板；悬停反馈应明显弱于已提交状态。

鼠标拖拽使用 Pointer Capture 和捕获阶段的 `pointerup` 兜底；在判定最近项前，必须先使用释放事件最后的 `clientY` 更新轨道位置。只有取消或失去捕获才回到起点；正常释放不能因为遗漏中间 move 事件而回退。窄屏、触摸/笔、减少动态和强制颜色路径直接提交，不显示临时透镜。

底板几何位移与内部光学 sweep 是两个独立通道。底板可因任何可靠的几何变化移动或缩放；sweep 仅可由用户触发选择时、在同一定位容器坐标系测得的 previous→next 中心向量驱动：`dx = nextCenterX - previousCenterX`、`dy = nextCenterY - previousCenterY`。禁止固定页面方向、固定 index/DOM 顺序、按 RTL 盲目反转 `dx`，或仅凭 key 改变盲目重播。

跨行项目必须使用二维 `dx/dy`；RTL 使用实测物理坐标；纵向书写、滚动容器、变换和嵌套定位需在同一容器坐标系测量并计入相关滚动偏移。快速连续选择从当前渲染/插值中心（或最新可靠中心）转向新目标，不能排队重放陈旧 sweep。resize、字体加载、响应式重排、本地化、滚动校正、DOM 变更和 observer 回调等非用户布局重测，只更新底板位置，绝不播放 sweep。无法取得可信且同坐标系的二维中心时，省略 sweep，保留底板几何过渡；键盘选择同样以测量结果而非假定箭头方向驱动。

拖动是当前 Demo 的可选特定模式，不是普通菜单的推荐能力。只有浮动面板、画布工具、空间工作区或用户明确要求时才启用，并应从非交互把手开始，使用 Pointer Events、`setPointerCapture` 和容器边界限制，不得抢占按钮、链接或滚动操作。

## 亮暗模式

亮暗主题必须独立调校，而不是只替换文字颜色：

- 暗色模式可使用稍强的位移、环境色和深度阴影，但应避免整块玻璃变成均匀蓝色。
- 亮色模式应降低色散和饱和度，使用中性高光与更浅阴影，并在浅蓝、白色和高对比背景前检查边缘。

主题切换后，信息层级、选中状态、焦点和控件命中区域都必须保持一致。

## 可访问性与性能

- 保持键盘操作、语义状态和可见的 `:focus-visible` 样式。
- 在 `prefers-reduced-motion: reduce` 下取消弹簧过冲、形变、视差和无必要的指针跟随。
- 在滤镜不支持、降低透明度或强制颜色环境中保留功能层级。
- 限制滤镜表面的数量和面积，避免嵌套背景滤镜及动画模糊半径。
- 优先动画化 `transform` 和 `opacity`，并在最低目标设备上检查交互延迟。

## 安全与发布

Skill 只提供界面设计与实现指导，不需要读取凭证、私有文件或个人数据，也不包含遥测、远程资源、隐藏网络请求和自动安装脚本。除非用户明确授权且项目确实需要，不应添加外部依赖或网络访问。

实现和文档使用“受 Apple Liquid Glass 启发”表述，不复制 Apple 的源代码、图像或专有资产。发布时采用 MIT 许可证，并披露功能、适用范围、浏览器限制、性能风险和降级行为。

## 当前 Demo 映射

| 方法 | Demo 实现 |
| --- | --- |
| 默认入口 | `/` 重定向至 `/v2` |
| 归档 Demo | `/v1`，视觉与交互冻结并使用归档元数据 |
| V2 折射 | 一个应用可控的菜单副本与一个连续圆角 SDF `feDisplacementMap` 采样 |
| V2 选择 | 扁平已提交态加临时点击/拖拽透镜；淡出后提交内容 |
| V2 拖拽 | 仅鼠标使用 Pointer Capture、最终释放位置就近吸附、取消回退 |
| 动效降级 | 窄屏、触摸/笔、减少动态、强制颜色和保底路径直接提交 |

## V2 基础与可迁移核心

V2 建立单层连续透镜采样：2× 圆角 SDF 场同时组合稳定的 `1.03` 中心、在最后 `16px` 内陡增至 `1.12` 的连续放大，以及在同一带内达到峰值的法线折射。这替代核心/边缘遮罩，避免接缝、折叠文字、重复或缺失字形，以及滑块底部色块。自动检查只能辅助审查；设计验收仍需隔离可运行页和用户明确体验。

V1 Demo 作为归档保真来源保留，不再是默认行为。可迁移的 V2 核心是五层分层、亮暗独立调校、一个受控且被滤镜处理的副本、隔离的光学裁切、最终释放位置处理、临时透镜状态和直接可访问降级。

## 验收清单

- 折射随背景和组件位置变化，而不是固定描边。
- 高级折射只位移应用可控的场景副本；无 `filter`、`backdrop-filter` 或 `-webkit-backdrop-filter` 时仍保留基础材质。
- SVG ID 在多实例下唯一，且冒号安全；副本 overscan、filter region、裁切和圆角一致。
- 亮色模式没有闭合蓝圈或紫圈。
- 顶栏和菜单在整个开合过程中保持圆角与层级关系。
- V2 透镜只有一个完整副本和一个连续场：不存在核心/边缘硬接缝、折叠文字、重复/缺失字形或裁切胶囊外的色块。
- 临时透镜活动时扁平已提交态消失；透镜淡出后内容、`aria-current` 与扁平选中态才同时出现。
- 正常释放使用最终指针位置并就近吸附；只有取消或失去捕获才回到起点。
- 底板 sweep 仅在用户选择时由 previous→next 的实测二维中心向量驱动；跨行、RTL、纵向、滚动和快速连续选择正确，布局重测不播放。
- 仅光学 wrapper 被裁切；overlay 在裁切外或 portal；SVG `clipPath` 采用明确有效的坐标系。
- 每次盲测均生成隔离可运行页并自动打开本地预览，用户体验后明确通过；文本、结构和截图自动检查不能替代该人工视觉门。
- 只有看见背景网格、文字或色带在玻璃边缘随位置弯曲时，才称增强折射。
- 文字、焦点、键盘操作和触摸目标均可用。
- 窄视口、减少动态效果和无滤镜环境保持功能完整。

## 归档 V1 保真模式

当请求包含“接近 V1 原 Demo”“视觉保真”“9/10”“不要重新设计”或“复现”时，必须使用低自由度保真模式。复制 `skills/liquid-glass-interface/assets/v1-fidelity-kit/`，不得自行改写共享 `SceneArtwork`、按实际几何生成的圆角 SDF 位移场、实例安全 RGB 滤镜、世界坐标对齐副本、亮暗材质参数、toolbar/popover 耦合或测量式选择底板。可修改文案、语义菜单项、布局与共享场景模型中的颜色。

`assets/v2-reference-implementation/` 是当前导航技术基础示例，不是 V1 高保真模板。V1 保真盲测必须在顶部、中部、底部三个滚动位置打开同一菜单，并使可读大字、网格和色带穿过镜片；可见场景与每个副本必须调用同一场景函数，每个表面必须按自己的宽、高和圆角生成位移场。用户未明确体验并通过时，盲测不通过；截图和自动检查只能作为辅助证据。

布局几何同样是一票否决项，不能只凭控制台或点击交互通过：在桌面与 `<=560px` 窄屏下，测量 toolbar 高度必须在 56–76px，返回/标题/更多必须为不重叠的水平三列，标题视觉居中，popover 完全位于视口内。

运行时像素对齐也是一票否决项：在顶部、中部、底部滚动位置，比较相同 visible/replica marker（例如两个场景中的 `[data-fidelity-anchor="word"]`）的滤镜前 DOM 矩形；位置误差与尺寸误差均必须 `<=1px`。不满足时不得称为增强折射。

CSS transform 和 opacity transition 不改变盒模型尺寸，可能不会触发 `ResizeObserver`。必须在相关 surface 的 `transitionend` 或 `animationend` 后，通过一个动画帧重新测量稳态对齐；改变布局的 state 也必须使 geometry 失效，不能采用动画中的测量值。对于视口居中的 fixed coupled menu，使用 kit 的 `fidelity-menu-cluster--viewport-centered`：popover 绝对定位，展开不会改变 cluster 高度或推动 toolbar，并验证受限 popover 仍处于视口内。

## 可见性与长页面性能否决

关闭稳态的 popover 必须卸载，或至少不绘制 border/shadow、不保留 active replica/filter、也不维持 scroll measurement；不能保留近零高度的 glass surface。增强模式在几何尺寸非零且 ready 之前不得生成 field 或 filter。

在穿过镜片边缘的高对比文字或网格上比较 baseline/enhanced。enhanced 必须出现 baseline 没有的局部边缘位移；仅统计 filter primitive 不算证据。surface 应标记 material mode 与共享折射目标，以支持自动 A/B 检查。

固定 lens 的长页面需记录 enhanced/baseline 滚动 rAF 平均值、超过 20ms/33ms 的帧数、最大帧和 DevTools forced reflow。滚动只能命令式更新 replica world origin；宽高、圆角或 stage 尺寸变化才允许重建 React state 和 field。filter window 必须是 lens 尺寸，即使 source world 为完整 stage。无 CPU 降速时，enhanced 不得连续出现超过 33ms 的卡顿，最大值应明显低于此前 84ms，并解释与 baseline 的剩余差距。
