# Liquid Glasses React

Liquid Glasses React 是一个受 Apple 液态玻璃设计启发的交互实验，重点研究连续折射、
自适应高光，以及通过流体动效表达的导航层级。

[在线体验](https://liquid.hkooii.com) ·
[English](./README.en.md) ·
[项目入口](./README.md) ·
[液态玻璃方法](./docs/liquid-glass-interface.zh.md) ·
[标志决策记录](./docs/decisions/liquid-lab-logo.zh.md) ·
[V3 决策记录](./docs/decisions/v3-horizontal-navigation-lens.zh.md) ·
[V3 参考校准](./docs/decisions/v3-reference-calibration.zh.md) ·
[V3 视觉差距分析](./docs/reports/v3-liquid-glass-visual-gap-analysis.zh.md) ·
[V3 连续世界取样](./docs/decisions/v3-continuous-world-sampling.zh.md) ·
[Lint 范围决策记录](./docs/decisions/lint-scope-maintenance.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## 在线体验

公开版本部署于 Cloudflare Workers：

<https://liquid.hkooii.com>

| 路由 | 用途 |
| --- | --- |
| `/` | 重定向至当前默认导航实验 `/v2`。 |
| `/v1` | 保留用于对照的冻结归档 Demo。 |
| `/v2` | 默认的纵向导航透镜参考实现。 |
| `/v3` | 独立的横向导航透镜实验；公开版本已使用参考校准实现。 |
| `/brand-preview` | 当前 Liquid Lab 标志的亮暗背景审阅页。 |

V2 仍是默认参考实现。V3 是独立实验，不替换 V2，也不会修改冻结的 V1 Demo。

## 功能特性

### V2：默认纵向导航透镜

- 使用单层连续 SVG 位移贴图采样移动透镜。
- 已提交选中态保持扁平；点击或鼠标拖拽期间才出现临时透镜。
- 亮暗主题独立调校，提供 Baseline/Enhanced 渲染层级。
- 为窄屏、触摸/笔、减少动态和强制颜色环境提供降级路径。

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
- SSR 仍从 `data-optics="baseline"` 开始。`/v3` 默认是 reference presentation，并在
  hydration 后以同一 padding-box 坐标连续取样完整导航世界。Baseline field 使用
  `coreZoom: 0.12`、轮廓处 `24px` 向内弯月面和 `11px` 折射；Edge 保持几何，只将
  弯月面强度提高 14%。`?chrome=demo` 显示审阅控件，`?optics=edge` 选择比较场。
- 历史 V3 与参考校准记录保留已发布历史的范围；连续世界取样决策记录描述当前本地
  实现验证，不代表新的部署或发布。

### 品牌审阅

- `/brand-preview` 并列展示已采纳的 Liquid Lab 标志在亮暗背景下的 48px、32px 与
  24px 尺寸效果。
- 正式标志资产位于 `public/brand/`；浏览器图标为 `public/favicon.svg`。

## 技术实现

界面不使用静态玻璃图片，而是组合以下能力：

- React 19 与 TypeScript
- SVG `feDisplacementMap`：V2 使用 2× 圆角 SDF 位移场，V3 使用局部椭圆位移场
- CSS `backdrop-filter`、渐变、内阴影与混合模式
- V3 使用 Pointer Events、指针捕获、阈值拖拽处理和最近项吸附
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
```

## Agent Skill

可复用的 `liquid-glass-interface` Skill 位于
[`skills/liquid-glass-interface`](./skills/liquid-glass-interface/)。其中
`v2-reference-implementation` 仍是当前默认参考；`v1-fidelity-kit` 仅用于明确
的 V1 原 Demo 复刻。V3 作为独立 `v3-*` 实验被显式选择，不覆盖任一既有基线。

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
