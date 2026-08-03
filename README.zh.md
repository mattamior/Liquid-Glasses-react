# Liquid Glasses React

Liquid Glasses React 是一个受 Apple 液态玻璃设计启发的交互实验，重点研究玻璃材质如何折射背景、响应环境色彩，并通过流体动效表达菜单层级关系。

[在线体验](https://liquid.hkooii.com) ·
[English](./README.en.md) ·
[项目入口](./README.md) ·
[液态玻璃方法](./docs/liquid-glass-interface.zh.md) ·
[Agent Skill](./skills/liquid-glass-interface/SKILL.md)

## 在线体验

公开版本部署于 Cloudflare Workers：

<https://liquid.hkooii.com>

## 功能特性

- 使用 SVG 位移贴图实时模拟背景折射
- 为亮色与暗色主题分别调校光学参数
- Apple 风格顶栏与功能菜单的耦合展开动效
- 菜单支持鼠标和指针自由拖动，并限制在展示区域内
- 菜单选项切换时，高亮玻璃底板平滑移动
- 提供折射、磨砂和弹性参数控制
- 支持 Liquid、Clear 和 Frost 三种材质状态
- 尊重 `prefers-reduced-motion`，降低不必要的动画

## 技术实现

界面没有使用静态玻璃图片，而是组合以下浏览器能力：

- React 19 与 TypeScript
- SVG `feDisplacementMap`、`feColorMatrix` 和通道混合
- CSS `backdrop-filter`、渐变、内阴影和混合模式
- Pointer Events 实现拖动交互
- vinext 与 Vite 构建
- Cloudflare Workers 托管

暗色模式保留较明显的 RGB 色散；亮色模式使用中性位移折射和白色焦散高光，避免出现固定的蓝色闭合描边。

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

该命令会生成生产构建，并验证服务端渲染页面。

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
app/
  globals.css        全局视觉系统与液态玻璃样式
  layout.tsx         页面元数据与根布局
  page.tsx           交互逻辑、SVG 滤镜与演示界面
public/
  favicon.svg        项目图标
tests/
  rendered-html.test.mjs
skills/
  liquid-glass-interface/  可供 Agent 安装和商店分发的 Skill 源码
docs/
  liquid-glass-interface.zh.md
  liquid-glass-interface.en.md
```

## Agent Skill

可复用的 `liquid-glass-interface` Skill 位于 [`skills/liquid-glass-interface`](./skills/liquid-glass-interface/)，用于指导 Agent 实现分层折射、语义菜单动效、亮暗主题独立调校、可访问降级，以及仅在合理场景启用的浮动面板拖动。

Skill 只包含实现指导，不访问凭证、个人数据、远程资源、遥测或隐藏网络服务。

## 部署

项目可以使用构建生成的 `dist/server/wrangler.json` 部署到 Cloudflare Workers：

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

部署前需要完成 Cloudflare 登录，并根据自己的账户修改 Worker 名称。

## 项目声明

本项目是独立的界面与光学效果研究，不是 Apple 官方产品，也未获得 Apple Inc. 的认可或授权。Apple 及其相关名称和商标归各自权利人所有。

项目采用 [MIT License](./LICENSE) 开源。
