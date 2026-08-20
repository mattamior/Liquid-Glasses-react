# Liquid Glasses React

Liquid Glasses React 是一个受 Apple 液态玻璃设计启发的交互实验，重点研究连续折射、
自适应高光，以及通过流体动效表达的导航层级。

[在线体验](https://liquid.hkooii.com) ·
[English](./README.en.md) ·
[项目入口](./README.md) ·
[液态玻璃方法](./docs/liquid-glass-interface.zh.md) ·
[标志决策记录](./docs/decisions/liquid-lab-logo.zh.md) ·
[V2 后台模板增强](./docs/decisions/v2-admin-template-enhancement.zh.md) ·
[V2 卡片容器液态玻璃](./docs/decisions/v2-liquid-glass-card-container.zh.md) ·
[V3 决策记录](./docs/decisions/v3-horizontal-navigation-lens.zh.md) ·
[V3 参考校准](./docs/decisions/v3-reference-calibration.zh.md) ·
[V3 视觉差距分析](./docs/reports/v3-liquid-glass-visual-gap-analysis.zh.md) ·
[V3 连续世界取样](./docs/decisions/v3-continuous-world-sampling.zh.md) ·
[V3 系统主题切换](./docs/decisions/v3-system-theme-toggle.zh.md) ·
[V3 运动耦合光学发布](./docs/decisions/v3-motion-coupled-optics.zh.md) ·
[V3 M04 回归 / 失败 M05 路由](./docs/decisions/v3-m04-rollback-failed-route.zh.md) ·
[Lint 范围决策记录](./docs/decisions/lint-scope-maintenance.zh.md) ·
[Liquid Glass Skill 三模式](./docs/decisions/liquid-glass-interface-three-modes.zh.md) ·
[Liquid Glass Skill 严格合规](./docs/decisions/liquid-glass-interface-strict-conformance.zh.md) ·
[Apple Clear 默认内核](./docs/decisions/apple-clear-default-kernel.zh.md) ·
[液态玻璃 Radix 菜单](./docs/decisions/liquid-glass-radix-menu.zh.md) ·
[苹果系统参考截图 2026-08](./docs/decisions/apple-system-references-2026-08.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## 在线体验

公开版本部署于 Cloudflare Workers：

<https://liquid.hkooii.com>

| 路由 | 用途 |
| --- | --- |
| `/` | 重定向至当前默认导航实验 `/v2`。 |
| `/v1` | 保留用于对照的冻结归档 Demo。 |
| `/v2` | 默认的纵向导航透镜参考实现。 |
| `/v3` | 独立横向导航透镜实验；M04 候选基线已恢复并部署。 |
| `/v3-05-failed` | M05 失败候选的公开直达归档；`noindex, nofollow`，不进入站内导航。 |
| `/apple-clear` | Apple Clear 文件夹/面板预览；Skill 默认内核的源实现。 |
| `/ui` | 液态玻璃组件预览台；重定向到 `/ui/liquid-menu`。 |
| `/ui/liquid-menu` | 常驻 `LiquidMenu`。 |
| `/ui/liquid-dropdown` | Trigger + Portal 菜单。 |
| `/ui/liquid-select` | 表单选择。 |
| `/ui/liquid-popover` | 玻璃气泡卡片。 |
| `/ui/liquid-dialog` | 居中模态卡片。 |
| `/ui/liquid-menubar` | 顶栏命令条。 |
| `/ui/liquid-context-menu` | 右键动作列表。 |
| `/liquid-menu` | 重定向到 `/ui/liquid-menu`。 |
| `/brand-preview` | 当前 Liquid Lab 标志的亮暗背景审阅页。 |

Skill 默认身份是 Apple Clear，不再是 V2 后台模板。`/` 仍重定向到 `/v2` 作为本仓库导航实验入口。V3 是独立实验。`/ui` 目录已发布为 Worker `liquid-lab-optics-demo` 版本 `c395db38-be40-43f5-b663-3d56591db275`；回滚目标 `50355dc2-6b65-4b7f-9955-83933c3ce75c`。

## 功能特性

### V2：默认纵向导航透镜

- 使用单层连续 capsule SVG 位移贴图采样移动透镜，以自适应 `1×` 或 `2×` DPR
  生成并限制最高为 `2×`。
- 已提交选中态保持扁平；点击或拖动期间只出现一个临时透镜。主鼠标、触控和触控笔
  共用 `>5px` Pointer Events 阈值、逐帧合并、最终位置刷新与集中清理。
- 亮暗主题独立调校，提供 Baseline/Enhanced 渲染层级。Enhanced 的 Canvas 2D 或
  SVG filter 能力探测失败时执行静态提交；Baseline 保留轻量临时 plate。
- 手动 `light` / `dark` 使用经过校验的 `liquid-lab:v2-theme` 偏好，刷新后保持并跨
  标签页同步。
- 紧凑布局、减少动态和强制颜色降级路径继续保证导航、可见焦点与唯一语义选中。
- 液态玻璃卡片容器重实现已发布为 Worker `liquid-lab-optics-demo` 版本
  `50355dc2-6b65-4b7f-9955-83933c3ce75c`，承载 100% 流量，公开入口为
  [`/v2`](https://liquid.hkooii.com/v2)。发布消息为 `reimplement v2 cards from references`；
  回滚目标为 `1329511c-1c22-4fe9-a639-5c1fa384fa96`。详见
  [V2 卡片容器决策](./docs/decisions/v2-liquid-glass-card-container.zh.md)。

### V3：独立横向导航透镜

- 导航级内嵌选中滑块填满激活项的内层格位；基础导航保持灰色，滑块内的当前图标
  和文字为白色，且只有滑块负责静态选中视觉。
- 点击未激活标签会让大型临时透镜横向经过导航；途经标签不会提前激活。
- 镜片活动期间会隐藏静态滑块，因此途经标签既不会提前激活，也不会产生重复视觉。
- 当前激活标签接受主鼠标、触控和触控笔的 Pointer Events。移动超过 `5px` 后，
  玻璃镜片会在轨道边界内跟随指针、预览最近标签，并在释放后吸附到该标签，再提交
  选中状态。
- 参考校准在 `1264 × 948` 锁定 `1124 × 210` 的 dock 与 `872 × 210` 的轨道；
  暂态透镜为 `296 × 242`，会在上下略微越过轨道，`210 × 182` 的静态滑块则保持
  明显更小。窄屏尺寸从实时轨道比例派生，不使用固定缩放。
- SSR 仍从 `data-optics="baseline"` 开始。`/v3` 已精确恢复为 M04 候选基线
  `d353abed0e5b379989bbcb7d13bb830702eece3f`：默认 reference presentation，并在 hydration 后
  以同一 padding-box 坐标连续取样完整导航世界；Baseline 使用 `coreZoom: 0.12`、`24px` 向内
  弯月面和 `11px` 基础折射，Edge 静态强度为 `1.14×`。`?chrome=demo` 显示审阅控件，
  `?optics=edge` 选择比较场。
- V3 在无存储偏好时跟随系统颜色方案；右侧 sparkle 将合法 `dark` / `light` 写入
  `liquid-lab:v3-theme`，刷新后恢复并跨标签页同步。主题实现提交 `6fc3897` 最初发布为
  Cloudflare Worker 版本 `590a19bb-8b64-4053-af13-a1b0f54fb387`；详见[系统主题决策](./docs/decisions/v3-system-theme-toggle.zh.md)。
- `/v3-05-failed` 保留提交 `88abeedca48b14a9aa96d980a4a956bb294461ee` 的完整可交互 M05，
  作为公开直达归档；它设置 `noindex, nofollow`、不进入站内导航，并且除共享
  `liquid-lab:v3-theme` 外与 `/v3` 物理隔离。annotated tag `v3-milestone-05-failed` 仍仅表示
  发布验收失败，不是可用基线。
- 此路由迁移已发布为 Worker `liquid-lab-optics-demo` 版本
  `71ca0a4d-6af1-4742-a97a-d9b83c61a820`；Wrangler `4.92.0` 下 build、dry-run 与 deploy 均通过，
  workers.dev [`/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3) 入口已可用。custom 域名与完整
  生产视觉 smoke 仍待独立核验；回滚目标为 `d910d3b1-cdc6-472f-a504-4d5df526df95`。详见
  [M04 回归 / 失败 M05 路由决策](./docs/decisions/v3-m04-rollback-failed-route.zh.md)。

### 品牌审阅

- `/brand-preview` 并列展示已采纳的 Liquid Lab 标志在亮暗背景下的 48px、32px 与
  24px 尺寸效果。
- 正式标志资产位于 `public/brand/`；浏览器图标为 `public/favicon.svg`。

## 技术实现

界面不使用静态玻璃图片，而是组合以下能力：

- React 19 与 TypeScript
- SVG `feDisplacementMap`：V2 使用自适应 1×/2× 圆角 SDF 位移场，V3 使用局部椭圆位移场
- CSS `backdrop-filter`、渐变、内阴影与混合模式
- V2 与 V3 使用 Pointer Events、指针捕获、阈值拖拽处理和最近项吸附
- vinext 与 Vite 构建
- Cloudflare Workers 托管

V2 增强折射使用一个完整的可控副本：中心采样保持 `1.03`，靠近圆角轮廓最后
`16px` 连续升至 `1.12`，避免核心/边缘接缝、文字重影和固定蓝色闭合描边。

## 本地开发

### 环境要求

- Node.js `>=22.13.0`
- npm

### 启动项目

```bash
npm install
npm run dev
```

打开开发服务器输出的本地地址。

### 验证项目

```bash
npm test
```

该命令会生成生产构建，并验证服务端渲染路由。

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发预览 |
| `npm run build` | 生成生产构建 |
| `npm run start` | 启动生产构建 |
| `npm test` | 构建并运行渲染测试 |
| `npm run lint` | 检查代码规范 |

## 项目结构

```text
AGENTS.md                         仓库工作流与双语决策记录规则
app/
  page.tsx                        从 / 重定向至 /v2
  v1/                             冻结归档 Demo
  v2/                             默认纵向导航透镜实验
  v3/                             独立横向导航透镜实验
  brand-preview/                  标志审阅路由
public/
  brand/                          当前标志资产与静态预览
  favicon.svg                     浏览器图标
docs/
  decisions/                      重要已完成工作的双语决策记录
  liquid-glass-interface.*.md     液态玻璃方法文档
tests/
  rendered-html.test.mjs          服务端渲染路由断言
skills/
  liquid-glass-interface/         供 Agent 与商店使用的版本化 Skill 源码
    assets/strict-kernels/        冻结 V1/V2/V3 strict kernel
    assets/strict-templates/      冻结 Next.js 与 Vite integration
    assets/liquid-glass.integration.*.json  六个 schema 2.0 manifest 与 V2 Next 起始模板
    scripts/verify-target-integration.mjs   只读目标验证器
```

## Agent Skill

可复用的 `liquid-glass-interface` Skill 位于
[`skills/liquid-glass-interface`](./skills/liquid-glass-interface/)。它提供完整冻结的
V1/V2/V3 kernel，以及适用于 Next.js App Router 和 Vite/React Router 的六个 schema `2.0`
模式/框架 manifest。严格验证会锁定 kernel、adapter、路由、场景、路由注册和 Playwright
harness，检查真实产品运行时挂载与完整源码树，并读取哈希锁定的 Playwright JSON 和视觉证据，
但绝不执行 manifest 命令。视觉审阅 pending 或 rejected 时为
`implemented-awaiting-visual-approval`；机器证据无效时为 `non-compliant`；只有有效 approved
证据才能成为 `strict-complete`。否则必须报告 `V1-inspired`、`V2-inspired` 或
`V3-inspired`。已有安装不会自动升级；V2 仍为默认模式；失败 M05 仍只作为归档。参见
[严格合规决策](./docs/decisions/liquid-glass-interface-strict-conformance.zh.md)。

Skill 只包含实现指导，不访问凭证、个人数据、远程资源、遥测或隐藏网络服务。

## 决策记录

每次重要工作完成后，都会在 [`docs/decisions`](./docs/decisions/) 下留下结构对应
的中英文记录，涵盖范围、决策、改动区域、验证证据、发布状态和后续边界。仓库级
规则见 [AGENTS.md](./AGENTS.md)。

## 部署

项目可以使用构建生成的 `dist/server/wrangler.json` 部署到 Cloudflare Workers：

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

部署前需要完成 Cloudflare 登录，并根据自己的账户选择 Worker 名称。

## 项目声明

本项目是独立的界面与光学效果研究，不是 Apple 官方产品，也未获得 Apple Inc. 的
认可或授权。Apple 及其相关名称和商标归各自权利人所有。

项目采用 [MIT License](./LICENSE) 开源。
