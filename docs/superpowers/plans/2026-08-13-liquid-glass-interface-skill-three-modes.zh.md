# Liquid Glass Interface Skill 三模式实施计划

日期：2026-08-13

状态：已确认实施计划

实施状态：已实施

实施决策：[Liquid Glass Interface Skill 三模式决策记录](../../decisions/liquid-glass-interface-three-modes.zh.md)

## 摘要

将仓库中唯一的 `liquid-glass-interface` Skill 同步到当前代码进度，并在一个 Skill 内提供三个固定、可显式选择的模式：冻结高保真复刻 `v1-fidelity`、默认纵向导航与卡片实现 `v2-default`、M04 横向导航实现 `v3-horizontal`。默认模式保持为 V2；失败的 M05 只保留为仓库历史归档，不成为 Skill 资产或可选模式。

本计划只定义后续实现，不改变当前路由、Skill、README、部署或发布状态。

## 模式与选择规则

Skill 保持一个入口：`skills/liquid-glass-interface/SKILL.md`。它必须先要求选择下列模式，并将模式与 Apple 材料变体（`Regular` / `Clear`）、Web 渲染层级（`baseline` / `enhanced`）、主题和交互状态明确分开：

| 固定标识 | 用途与选择条件 | 默认与限制 |
| --- | --- | --- |
| `v1-fidelity` | 用户明确要求“复刻 V1 原 Demo”“视觉保真”“9/10”或“不要重设计”时使用。 | 仅用于冻结 V1 的低自由度复刻；不得作为普通导航默认方案。 |
| `v2-default` | 普通 Web 导航、侧栏、临时选择透镜和液态玻璃卡片时使用。 | 未指定模式时的默认值。 |
| `v3-horizontal` | 用户明确选择 V3 或横向四列导航透镜时使用。 | 独立实验模式；不得替换 V2 默认行为。 |

当用户传入未知 `vN` 标识时，Skill 不得猜测、回退至 V1 或将其当作 V3；应说明仅支持三种固定模式并请求选择。若用户未指定模式且需求不触发 V1/V3 条件，使用 `v2-default`。每个模式开始前仍先读取 Apple 设计逻辑，再读取公共材质、交互、主题与验收参考。

`/v3-05-failed` 与 `v3-milestone-05-failed` 仅作为失败 M05 的直接访问历史归档。Skill 可以说明其历史边界，但不得把它列为模式、复制为资产、设为默认参考、加入验证器，或用作新的视觉验收基线。

## Skill 资产与公共参考

保留一个可分发 Skill，避免拆成三个独立 Skill 或复制整套仓库测试目录。最终目录结构如下：

```text
skills/liquid-glass-interface/
  SKILL.md
  LICENSE.txt
  agents/openai.yaml
  assets/
    v1-fidelity-kit/
      layout.tsx
      page.tsx
      v1.css
    v2-reference-implementation/
      layout.tsx
      page.tsx
      lens-optics.ts
      v2.css
    v3-horizontal-navigation/
      layout.tsx
      page.tsx
      lens-optics.ts
      v3.css
  references/
  scripts/
    verify-v1-fidelity-kit.js
    verify-v2-reference-implementation.js
    verify-v3-horizontal-navigation.js
```

- 更新 `SKILL.md`：写入三模式表、选择和未知版本处理、默认 V2、M05 排除、每种模式的源资产、降级和输出要求。
- 新增 `agents/openai.yaml`：只提供 Skill 展示所需的最小元数据；它不是运行时依赖，也不引入网络访问。
- 保留 `LICENSE.txt` 和 `references/` 的公共设计权威、材质系统、交互、React 集成、主题 QA 与验收门槛；更新其中与当前 V2/V3 实现不一致的表述。
- 保留并调整 V1 验证器；将现有只检查旧原生页面的 V2 验证器替换为当前 React 资产验证器；新增 V3 横向导航验证器。
- 不复制 `app/`、`tests/` 或快照目录整体。每个资产目录只包含可拷贝进 Next App Router 路由的最小完整实现与相应样式、布局启动脚本和光学模块。

## 三种完整可移植资产

### `v1-fidelity`

以冻结的 `app/v1/page.tsx`、`app/v1/v1.css` 和 `app/v1/layout.tsx` 为当前权威源，更新现有 `assets/v1-fidelity-kit/`，使其成为可直接复制的完整 React 路由资产。保留舞台、菜单、主题、浮动菜单拖拽、工具栏与 popover 耦合、几何测量、RGB 位移场和滤镜；不得为了与 V2/V3 统一而重设计或替换其交互。

自动验收须验证页面、样式和布局资产存在，验证可控场景、副本、几何相关位移场、实例安全滤镜、光学裁切、耦合菜单和关闭后资源清理等不变量。人工验收须在桌面与 `<=560px` 视口测量工具栏、三列、标题和 popover 几何；在顶部、中部和底部滚动位置体验同一菜单，并由用户明确通过后才能称为高保真。

### `v2-default`

以当前 `app/v2/page.tsx`、`app/v2/lens-optics.ts`、`app/v2/v2.css` 和 `app/v2/layout.tsx` 建立完整可移植资产，替换现有旧的原生 HTML/CSS/JavaScript V2 参考实现。资产必须保留纵向导航、唯一 `aria-current`、点击到结算再淡出的临时选择透镜、主鼠标/触摸/触控笔共用的 `>5px` Pointer Events 拖拽、主题存储启动脚本、`baseline` / `enhanced` 控制和能力降级。

资产同时必须包含当前三张液态玻璃卡片：可见环境与副本共用 `AmbientScene`，卡片拥有独立圆角边缘位移场、受限 DPR、八项 LRU 缓存、只裁切光学层、`aria-hidden` 装饰层和清晰内容层。Canvas、SVG、`backdrop-filter`、减少动态或强制颜色不可用时，导航与卡片必须保持功能完整的 Baseline 外观。

自动验收须验证四个可移植文件、导航与卡片光学配置、单一可控副本、唯一语义选中、全指针输入、主题持久化和降级路径；沿用仓库 V2 SSR、光学和 E2E 回归覆盖。人工验收须覆盖亮暗主题、Baseline/Enhanced、三张卡片、点击、鼠标/触摸/触控笔拖拽、窄屏、减少动态和强制颜色。

### `v3-horizontal`

新增完整资产 `assets/v3-horizontal-navigation/`，其唯一源是当前 `/v3` 的 M04 基线：`app/v3/page.tsx`、`app/v3/lens-optics.ts`、`app/v3/v3.css` 和 `app/v3/layout.tsx`。资产必须保留四列原生按钮、一个导航级内嵌选中滑块、基础按钮与白色视觉副本分层、点击时的大型旅行透镜、仅当前按钮可开始的主鼠标/触摸/触控笔拖拽、`5px` 阈值、轨道限制、最近标签预览、`260ms` 释放吸附以及取消、失去捕获、尺寸变化和卸载时的回滚与清理。

资产必须保留 Baseline/Edge 查询选择、固定透镜尺寸的滤镜视口与完整导航世界副本、系统优先并可通过 `liquid-lab:v3-theme` 覆盖的主题、SVG 构造器和 Canvas 不可用时的静态选择，以及减少动态和强制颜色下的直接提交。不得从 `/v3-05-failed` 引入 M05 的动态光学配置、缓存或样式。

自动验收须验证四个可移植文件、M04 资产来源、三个视觉世界、固定透镜滤镜视口、唯一 `aria-current`、当前项限制的指针会话、释放清理、主题启动脚本和全部降级。沿用仓库 V3 SSR、光学和 E2E 回归覆盖。人工验收须覆盖桌面和窄屏、点击旅行、鼠标/触摸/触控笔拖拽、中途 Edge 透镜内容、系统与存储主题、无滤镜、减少动态和强制颜色。

## 自动化与人工验收

实现完成后，以下自动化命令必须成功，且不得更新 M05 归档快照：

```bash
node skills/liquid-glass-interface/scripts/verify-v1-fidelity-kit.js
node skills/liquid-glass-interface/scripts/verify-v2-reference-implementation.js
node skills/liquid-glass-interface/scripts/verify-v3-horizontal-navigation.js
npm test
npm run lint
npm run test:e2e -- tests/e2e/v2-optics.spec.ts tests/e2e/v2.spec.ts tests/e2e/v3-optics.spec.ts tests/e2e/v3.spec.ts
git diff --check
```

可额外运行 `npm run test:all` 作为全量回归；若失败，必须记录本次实际输出，不得复用历史失败说明。执行浏览器测试时，必须在成功、失败和超时路径关闭 Playwright 会话，不留下浏览器或守护进程。

自动化不能替代人工视觉门槛。V1 需要用户实际体验并明确通过；V2 和 V3 需要按各自模式的人工场景完成可读性、焦点、键盘、语义选中、背景折射、主题和降级检查。只有在应用可控背景的网格、文字或色带在透镜边缘按位置发生可见弯曲时，才可将结果称为增强折射。

## 假设、文档与完成处理

默认假设是：一个 Skill 内的三模式共享 Apple 设计权威和公共参考；V2 保持默认；完整可移植资产指可复制到 Next App Router 路由的最小文件集，而不是独立 npm 包或完整仓库副本；此工作不增加依赖、远程资产、遥测、凭证访问或发布操作。

实施期间，所有模式资产必须记录其同步的源路径和 Git 提交，防止资产与应用代码漂移。若当前实现与计划发生实质偏离，实施决策记录必须说明偏离、原因和最终选择。

本计划本身不创建决策记录，也不更新 README。实施完成后，该工作属于多文件且改变公开 Skill 界面的重要批次，必须新增结构一致的中英文决策记录：

```text
docs/decisions/liquid-glass-interface-three-modes.en.md
docs/decisions/liquid-glass-interface-three-modes.zh.md
```

该记录必须写入范围与决策、实际交付和变更区域、精确验证证据、部署或发布状态、已知风险和后续同步工作。届时更新 `README.md`、`README.en.md` 和 `README.zh.md` 的决策链接、Skill 说明和结构说明，并同步必要的方法文档。保留本计划作为历史意图；实施完成后在文件头补充指向决策记录的完成状态，若被实质替代则标记为已替代而不是改写为验收记录。
