# Liquid Glass Interface Skill 设计规格

## 目标

将 Liquid Glasses React Demo 中经验证的视觉与交互方法沉淀为可复用的 Codex Skill，指导 Agent 为 Web 界面和组件实现可信、克制、可访问的液态玻璃效果。

苹果当前官方设计资料是设计语义和验收结论的最高级来源；原 Demo、fidelity kit 和社区实现只能提供 Web 技术方法，不能覆盖 Apple HIG、Apple Developer Documentation 与 Apple WWDC 官方设计讲解。

Skill 面向 React、CSS 和 SVG 为主的 Web 技术栈；在组件确实需要移动时，可选用 Pointer Events。Skill 不绑定当前 Demo 的版式、文案或具体数值。

## 范围

首版包含：

- 苹果官方来源优先级，以及功能层、lensing、Regular/Clear、尺寸适配、材料动效、Scroll Edge Effects 和无障碍的设计规则
- Web 液态玻璃的适用场景与非适用场景判断
- 背景、折射、边缘高光、内容和交互的分层模型
- 两级材质策略：基础 CSS 材质层，以及与环境坐标对齐的受控场景副本 + SVG 位移
- 菜单展开、选择底板和主题切换的交互模式
- 浮动面板或用户明确要求时的可选拖动模式
- 亮暗主题的独立调校方法
- 可访问性、性能和视觉验收清单
- 当前 Demo 的方法论映射，供开发者阅读

首版不包含：

- 原生 iOS / SwiftUI 实现配方
- 通用完整页面模板；但“接近原 Demo/视觉保真/9/10/不要重新设计/复现”触发时提供低自由度 fidelity kit
- 图像、视频或外部设计资产
- 部署、后端或数据存储方案

## 产物结构

```text
skills/liquid-glass-interface/
  SKILL.md
  LICENSE.txt
  references/
    apple-design-logic.zh.md
    apple-design-logic.en.md
    material-system.md
    interactions.md
    themes-and-qa.md
  assets/fidelity-kit/
    index.tsx
    fidelity.css
  scripts/verify-fidelity-kit.js

docs/
  liquid-glass-interface.zh.md
  liquid-glass-interface.en.md
LICENSE
```

仓库内 Skill 是 GitHub 上唯一的源码与版本源头，可由 Agent 安装器和 Skill 商店读取。全局安装目录只作为工作副本，不再独立维护。为保持跨商店兼容，首版不包含小红书拒绝的 Codex 专属 `agents/openai.yaml`；仓库文档记录完整方法、当前 Demo 中的对应实现和面向开发者的说明。

当请求明确追求原 Demo 视觉保真时，fidelity kit 是唯一可复制的高保真实现：共享场景、每表面 SDF 位移场、实例安全 RGB 滤镜、世界坐标副本、亮暗材质、toolbar/popover 耦合和测量式选择底板不得以局部近似实现替换。普通 reference implementation 仍仅作为技术 baseline。

小红书 SkillHub 使用 `skills/liquid-glass-interface/` 目录直接执行预检与上传。正式发布前必须展示名称、不可变标识、版本、来源和标签，并取得用户明确的“提交”确认。

## Skill 工作流

1. 先读取苹果官方设计逻辑，并按 Apple HIG → Apple Developer Documentation → Apple WWDC → 社区资料的顺序裁决冲突。
2. 判断液态玻璃是否位于功能层并服务于层级、上下文或状态转换；若只是透明卡片，不采用该效果。
3. 独立选择 Apple Regular/Clear、Web Baseline/Enhanced、Light/Dark 和交互状态，不得混淆。
4. 建立独立的背景、折射、边缘高光、内容和交互层，避免用单一半透明背景替代材质。
5. 先实现基础 fill/border/shadow、静态层级与可读性；再按特性检测接入 backdrop 模糊、受控场景副本和 SVG 位移，并保持无滤镜时的可用降级。
6. 让视觉变化由菜单状态、选中项和主题驱动，不以无语义的鼠标跟随作为主效果。
7. 分别调校亮色与暗色主题；亮色模式避免 RGB 色散形成固定闭合蓝圈。
8. 完成键盘焦点、`prefers-reduced-motion`、小尺寸视口和性能验收；每次盲测必须生成隔离可运行页、自动打开本地预览，并在用户亲自体验且明确通过后才算验收。

## 核心决策

### 苹果官方设计权威

整个表面参与 lensing，但中心保持低梯度、连续和可辨认，边缘沿几何法线产生更强局部折射。Regular 是菜单、popover、侧边栏和大量文字的默认材料；Clear 只用于丰富媒体背景、粗亮前景且允许暗化层的场景。较大菜单表现为更厚的材料，具有更深阴影、更明显折射和更柔和散射，但不能破坏内部背景连续性。

正式产品稳定状态避免高对比内容与玻璃持续交叉；折射盲测可有意制造交叉作为证据。材料显现、按压、选择和开合应共同改变光线、lensing、形态和厚度，而不是只使用普通淡入淡出。任何偏离必须明确标注，不能继续宣称 Apple-aligned。

### 材质模型

玻璃必须由五层组成：

1. 环境背景层
2. 背景再采样与位移折射层
3. 透明填充与模糊层
4. 中性边缘高光、阴影或局部焦散层
5. 内容与交互层

每层都可独立降低强度或关闭，以支持调试、降级与主题调校。

### 折射实现

采用两级策略。基础层是 fill、border、shadow 和可读内容；检测到 `backdrop-filter` 或 `-webkit-backdrop-filter` 时才增强模糊与饱和度。它不依赖 SVG，必须在滤镜关闭时仍保持功能、焦点、对比度和命中区域。

增强层才使用 SVG `feDisplacementMap`。Web 平台不能稳定、通用地把动态 CSS backdrop 直接作为该滤镜输入：`backdrop-filter` 的背后像素采样不能可移植地成为 SVG 的 `SourceGraphic`。因此不能把对半透明覆盖层施加 SVG 滤镜称为真实折射。

真实折射要求渲染一份与环境坐标对齐的、仅展示用的应用可控场景副本。副本必须与可见环境共享场景模型、尺寸、断点和世界坐标，按玻璃相对场景原点平移；仅对副本施加 SVG 位移后，再按玻璃形状裁切。前景内容、文字、焦点和点击区域始终独立于滤镜。

禁止 DOM 截图、canvas/屏幕捕获或隐式抓取任意页面像素来构建副本。副本只可包含应用明确拥有且许可复制的 CSS 渐变、装饰 SVG、已知 canvas 场景或确定性数据图形；不得包括私有内容、用户数据、表单、消息和第三方嵌入物。

每个 React 实例应通过 `useId()` 生成独立 filter/clip ID，并编码冒号等非安全字符；用内联 style 的带引号 `url("#id")` 引用，避免 CSS `#id` 选择器。副本 overscan、SVG filter region、外部裁切和圆角半径必须同步，filter region 至少覆盖最大位移幅度。

标准 `filter`、`backdrop-filter` 和 `-webkit-backdrop-filter` 需分别 feature detection。顺序固定为基础层 → backdrop 增强 → 已对齐场景副本 → 经真实浏览器视觉与性能检查的 SVG filter。`CSS.supports("filter", "url(#candidate)")` 只表示语法可接受，不能证明实际 SVG 或跨浏览器采样管线可用。

暗色主题可使用轻微 RGB 分离强化环境色彩。亮色主题改用同向通道位移与中性白色高光，避免色散在圆角裁切后变成固定霓虹描边。

### 交互实现

菜单展开、关闭和项目选择必须由明确状态驱动。工具栏与菜单使用轻量耦合场表达层级关系；选择底板采用位置插值而不是替换背景。

底板的几何位移与内部 sweep 是独立通道。sweep 只在用户选择时，按同一定位容器坐标系中 previous→next 的实测中心向量 `dx/dy` 驱动；禁止固定页面方向、固定 index/DOM 顺序、按 RTL 盲目翻转或因 key 变化盲目重播。跨行采用二维向量，RTL 使用实测物理坐标；纵向书写、滚动容器、变换和嵌套定位均须计入相同坐标系与滚动偏移。快速连续选择从当前渲染/插值中心转向新目标；非用户布局重测只更新底板，不播 sweep；无法可靠取得二维中心时省略 sweep。

裁切只作用于场景副本、位移和高光所在的光学 wrapper，不能裁整组件。焦点、阴影、语义控件和 overlay 保持在裁切外，或让 overlay 通过 portal 渲染。SVG `clipPath` 必须使用归一化非零包围盒的 `objectBoundingBox`，或带明确当前宽高的 `userSpaceOnUse`；禁止零尺寸 defs 内含糊百分比。

拖动不是菜单的默认能力。仅在组件是浮动面板、画布工具、空间化工作区，或用户明确要求可移动时启用。此时只从非按钮的拖动把手开始，使用 Pointer Events 和 `setPointerCapture`；拖动位置必须限制在容器边界内，且不得抢占按钮、链接和滚动交互。

## 反模式

- 仅以低透明度白色矩形冒充液态玻璃
- 在亮色模式保留高强度 RGB 色散，导致闭合蓝色或紫色描边
- 以持续鼠标跟随代替具有语义的状态动效
- 以固定方向、项目 index、DOM 顺序或 key 重播假定 selection sweep 方向
- 因 resize、字体加载或重排等非用户布局重测播放 sweep
- 对整个 component 裁切，导致焦点、阴影或 overlay 被截断
- 在零尺寸 defs 中用含糊百分比定义 SVG `clipPath`
- 将 `feTurbulence`、固定/重复渐变或仅 `backdrop-filter` 称为增强折射
- 展开时改变圆角为直角，造成顶栏与菜单割裂
- 让高亮底板与悬停反馈拥有同等亮度
- 忽略触摸、键盘、减少动态效果和窄视口

## 验收标准

- 已重新检查苹果当前官方资料，且实现通过功能层、Regular/Clear、边缘—中心折射、尺寸适配、材料动效和稳定状态可读性否决项
- 内容在亮暗主题、低对比背景和动态背景前均保持可读
- 折射随环境和组件位置变化，但不产生固定色环
- 高级折射只位移与环境对齐的应用可控场景副本；基础层在所有滤镜不可用时仍完整可用
- 每实例 SVG ID 唯一且冒号安全；副本 overscan、filter region、裁切和圆角一致
- 菜单开合和选择底板都具有明确的状态来源
- sweep 仅由用户选择的实测 previous→next 二维中心向量驱动；跨行、RTL、纵向、滚动和连续选择正确，布局重测不播放
- 只裁光学 wrapper；overlay 位于裁切外或 portal；SVG `clipPath` 坐标系与尺寸明确
- 增强折射必须可见背景网格、文字或色带在玻璃边缘随位置弯曲；不得以噪声、渐变或 blur 冒充
- 若启用拖动，拖动不触发工具栏按钮，且不会移出可见容器
- `prefers-reduced-motion` 下取消非必要动画
- 每次盲测均生成隔离可运行页并自动打开本地预览；用户体验并明确通过后才算验收，文本、结构和截图自动检查不得替代

## 失败与降级

若 SVG `filter`、`backdrop-filter`、`-webkit-backdrop-filter` 或性能预算不满足要求，回退至 fill、border、边缘高光、阴影和功能交互；不得因为关闭高级滤镜而损坏菜单可用性。不得以未经验证的 SVG 支持、场景副本对齐或全页截图替代该回退。

## 验证方式

首版 Skill 通过结构校验，并以当前 Demo 的以下任务进行前向验证：

- 为菜单建立具有明确层级的液态玻璃材质系统
- 为亮色主题移除闭合色散边缘，同时保留局部折射
- 为菜单选项添加低干扰悬停与移动高亮底板

本轮盲测未通过的原因是：静态/结构与截图自动检查无法证明真实折射、光学裁切边界或 sweep 方向。原 Demo 可迁移的核心为五层材质分层、亮暗独立调校、状态耦合、共享选择底板、受限拖动与降级；迁移必须替换固定方向、整组件裁切和自动检查即验收的做法。

验证不修改线上部署。每次盲测必须生成隔离可运行页、自动打开本地预览，并由用户体验后明确通过；仅文本、结构或截图自动检查不能替代人工视觉验收。文档不得记录临时端口或 PID。

发布包还应满足：不读取或传输凭证、私有文件和个人数据；不包含遥测、隐藏网络请求、远程资产或自动安装脚本；保留 MIT 许可证与 Apple 非官方项目声明；完整披露浏览器限制、性能风险和降级行为。
