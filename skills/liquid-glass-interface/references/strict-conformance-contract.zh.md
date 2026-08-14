# 严格合规合同

机器可读权威文件是 [strict-conformance-contract.json](strict-conformance-contract.json)。本文仅用于解释；目标项目不得放宽 JSON 中的要求。

## 资格

Schema `2.0` 严格模式只支持 Next.js App Router（`next-app-router`）和 Vite + React Router（`vite-react-router`）；其他框架必须使用 inspired 标签。冻结文件哈希变化、非空 `deviations`、缺少路由、证据格式错误或源码树污染均为 `non-compliant`。机器证据通过但视觉批准为 pending 或 rejected 时，报告 `implemented-awaiting-visual-approval`；只有有效批准证据才能报告 `strict-complete`。

## Kernel 与 Adapter 边界

逐字节复制合同列出的所有 kernel 文件。不得修改 kernel 的状态机、光学层、稳定 DOM role、降级行为或源导入。V2/V3 严格 kernel 提供强类型 config，并且**实际渲染**导航数据、卡片数据、文案、图标、路由值、品牌 token 和提交后的路由回调；只能通过对应 adapter/config 模板传入。V1 仍然冻结，只允许等长品牌文案、链接与路由挂载。不得混用 V1/V2/V3 文件。canonical V2/V3 Demo bundle 仅用于发布参考，不是可配置严格 kernel。

机器合同为每个模式/框架组合冻结并哈希 adapter、合规路由、受控场景、Vite 注册文件（如适用）和 Playwright harness。产品入口必须以运行时导入（不能仅 `import type`）并通过 JSX 挂载对应 adapter；V2/V3 必须提供导航 config。对于 Vite，能从产品入口运行时到达的路由使用者必须运行时导入冻结注册文件，并实际通过 `createBrowserRouter`/`useRoutes` 以及 `RouterProvider`/路由渲染消费它。Next 依赖其已哈希的 App Router 文件系统路由。验证器扫描目标项目全部源文本（排除生成和依赖目录）中的 M05 与其他模式 kernel 污染，因此 alias、`require` 和动态导入都不能绕过；验证器绝不执行 manifest 命令。

V2 至少需要两个导航项、一张光学卡片、受控场景和 Enhanced 合规路由。唯一的临时透镜必须在淡出完成后才提交内容和 `aria-current`。V3 至少需要两个导航项和 Edge 合规路由。唯一 inset slider 承担材质；只有当前 tab 可以拖拽；preview 不改变语义；移动超过 5px 后才拖拽；释放后在 260ms 内吸附。

## 合规路由与证据

V2/V3 路由在开发和测试环境必须可用，生产环境必须禁用或受保护。渲染确定性的、由应用拥有的网格、大字号文字和色带；前景必须在滤镜外。V2 必须验证 Enhanced，V3 必须验证 Edge。reduced motion、forced colors、SVG/Canvas 不可用和 backdrop filter 不可用时，仍必须提供完整 Baseline，但它不能替代正常严格路径。

从六个 `../assets/liquid-glass.integration.<mode>.<framework>.json` schema `2.0` 模板中选择一个，并以 `liquid-glass.integration.json` 复制到目标项目根目录；无后缀模板仅作为 V2 Next 起始模板。填写全部冻结路径/哈希、数量、精确选择器、路由使用者、降级和证据路径。`verification.e2e` 必须指向冻结 harness，并提供 SHA-256 锁定的 Playwright JSON 报告；该报告必须记录零失败和所有必需测试标题。`visualApproval` 必须声明 `pending`、`rejected` 或 `approved`；批准时还必须提供 SHA-256 锁定的 JSON 记录，其中包含审核人、有效 ISO 时间及非空且逐项哈希锁定的截图。manifest 的 command/result 字符串不是证据，验证器不会执行它们。`deviations` 必须为空。

使用只读命令验证：

```bash
node <skill>/scripts/verify-target-integration.mjs --root <project> --manifest liquid-glass.integration.json [--json]
```

## 已知 V1 限制

冻结 V1 kernel 保留了 `liquid-lens-filter` 等固定 SVG filter ID。每个 document 只能挂载一个 V1 kernel 实例，否则可能发生 ID 冲突。修改这些 ID 会改变冻结 kernel 哈希，必须通过版本化合同更新处理，不能在目标项目内直接修补。

## 禁止替代方案

不得引用 M05、跨版本文件、截图、任意 DOM 捕获、`feTurbulence`、重复渐变、CSS blur、固定彩圈，或把 `backdrop-filter` 单独称为折射。不得过滤标签、焦点环、命中区域、表单、用户数据或第三方内容。
