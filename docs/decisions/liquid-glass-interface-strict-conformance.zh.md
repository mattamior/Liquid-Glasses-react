# Liquid Glass Interface 严格合规决策记录

**日期：** 2026-08-13
**状态：** 已在本地实现；等待最终应用检查与人工视觉批准；未部署或发布

## 1. 范围与决策

`liquid-glass-interface` Skill 现以 schema `2.0` 作为可验证的严格合规合同，而不是宽松风格参考。只有所选冻结 kernel、冻结 integration、产品运行时挂载、路由、源码树扫描、结构化 E2E 报告和视觉证据全部通过，才能使用 `v1-fidelity`、`v2-default` 或 `v3-horizontal` 严格名称。机器证据无效时为 `non-compliant`；存在核心偏离或框架不受支持时，必须使用 `V1-inspired`、`V2-inspired` 或 `V3-inspired`。

严格集成支持 Next.js App Router 和 Vite/React Router。六个模式/框架 manifest 是受支持的安装入口。V2 仍为默认模式。M05 和 `/v3-05-failed` 仍是历史归档，严格目标项目禁止引用。

## 2. 严格合同与公开界面

- 每个模式都提供完整参数化且不可修改的 kernel。Product adapter 只能通过 kernel config 传入文档规定的业务数据、路由回调、文案、图标、品牌 tokens 和外围布局；不得改变状态机、光学、稳定 roles 或降级。
- Schema `2.0` 为 kernel 和每个框架 integration 冻结 SHA-256：adapter、V2/V3 合规路由、受控场景、Vite 路由注册和 Playwright harness。目标产品必须运行时 import 并以 JSX 挂载 adapter；Vite 还必须在真实 React Router 树中消费冻结路由注册。
- V2 至少需要两个导航项、一张光学卡片、延迟语义提交、全主指针拖拽、受控副本和 Enhanced 光学。V3 至少需要两个导航项、preview/commit 分离、仅当前项可拖拽、大于 5px 的阈值、260ms 吸附和 Edge 光学。
- V2/V3 合规路由在开发/测试环境可用，在生产环境禁用或受保护。其确定性场景包含网格、大字号文字和色带，同时前景交互保持在滤镜外。
- `verify-target-integration.mjs` 只读文件，绝不执行 manifest 命令。它检查冻结哈希、运行时可达性、精确 roles 与降级、结构化 Playwright JSON、视觉证据哈希，并扫描完整目标源码树中的 M05 或跨模式污染。
- 机器证据可以在视觉批准 pending 或 rejected 时通过；此时状态为 `implemented-awaiting-visual-approval`。只有包含审核人、ISO 时间戳和哈希锁定截图的有效 approved 视觉 JSON，才能报告 `strict-complete`。

## 3. 交付结果与改动区域

- 新增 schema `2.0` 机器合同及结构等价的中英文指南、完整 strict V1/V2/V3 kernel、六个模式/框架 manifest 和一个 V2 Next.js 起始别名。
- 新增冻结 Next.js/Vite adapter、V2/V3 合规路由与受控场景、Vite 路由注册示例、V1 与 V2/V3 Playwright harness，以及结构化证据字段。
- Target verifier 现强制检查产品挂载、Vite 路由消费、完整源码树 M05/跨模式扫描、冻结 integration 哈希、Playwright JSON 结果/标题，以及视觉 JSON/截图哈希，并且不执行声明的命令。
- 更新 `SKILL.md`、agent 元数据、React 集成指南、双语方法文档、README 和历史三模式记录。原三项 source-to-asset verifier 仍只检查发布资产同步。

## 4. 验证证据

下列证据区分本批次已确认检查和仍由主代理负责的最终检查。Pending 不代表通过。

| 检查项 | 精确结果 |
| --- | --- |
| Skill 验证 | 官方 `quick_validate.py` 直接运行因宿主 Python 缺少 PyYAML 而失败；同一官方脚本通过不写文件的内存 YAML shim 后通过。未安装依赖。 |
| Target verifier Node 测试 | 状态修正后运行 `node --test skills/liquid-glass-interface/tests/verify-target-integration.test.mjs`：`7/7` 通过、`0` 失败（`527.431916ms`）；覆盖全部六个模式/框架 fixtures、视觉待批准、冻结 integration、运行时挂载/路由、结构化证据和完整源码树污染反例 |
| V1/V2/V3 source-to-asset verifier | 三项均通过，并明确报告只验证发布资产 |
| 六个目标装配与 TypeScript | Next.js/Vite × V1/V2/V3 临时装配 `6/6` 通过；V2/V3 完整参数化 strict kernel 通过类型检查 |
| `npm test` | 生产 build 通过；渲染路由测试 `6/6` 通过 |
| `npm run lint` | exit `0` 通过；已移除过时 verifier helper，没有报告 warning |
| 定向 V2/V3 Playwright | `51/51` 通过 |
| 完整应用 E2E | `npm run test:all`：`85` 通过、`1` 失败；`tests/e2e/v3-05-failed.spec.ts:449` 的 glyph width difference 期望 `<=0.75`，实际为 `0.92`。这是未改动的 M05 历史归档，不得写成通过。 |
| 真实目标项目浏览器合同 E2E | 未执行；Node fixtures 不能替代真实 Next.js 或 Vite 目标运行 |
| 人工视觉批准 | 未执行；当前状态为 `implemented-awaiting-visual-approval` |
| 清理与差异检查 | `git diff --check` 通过；没有遗留 Playwright、Chromium、Vinext 或 Vite 进程 |

## 5. 部署与发布状态

本批次只变更仓库 Skill 资产、验证与文档。未执行生产部署、Skill 发布、远程上传或生产合规路由暴露。历史 V2/V3 部署是独立事实，不能证明 schema `2.0` 目标合规。

## 6. 风险、迁移与后续工作

- 已有安装不会自动成为 strict。必须选择六个 manifest 之一，恢复精确冻结文件，在真实产品入口挂载 adapter，注册合规路由，使用 JSON reporter 运行冻结 Playwright harness，并获得人工视觉批准；否则使用 inspired 标签。
- 冻结 V1 kernel 保留了 `liquid-lens-filter` 等固定 SVG filter ID；同一 document 中多个 V1 实例可能冲突。在版本化 kernel 提供实例安全 ID 前，每个 document 只挂载一个 V1 实例。
- Kernel 或 integration 变化属于迁移事件。必须对合同进行版本化，并一起重新生成所有受影响的哈希、manifest、fixture 和文档；不得在目标项目中编辑冻结文件。
- M05 历史 E2E 失败仍未解决，且不属于严格模式。严格 Skill 维护不得修改其归档或快照。
- 被忽略的测试结果产物和既有未跟踪 `tsconfig.tsbuildinfo` 仍保留在 worktree；未删除，也未当作发布证据。
- 合规路由使用确定性 fixtures，不使用产品或用户数据，并对普通生产流量保持不可用。人工审阅仍负责判断可读性、焦点、键盘操作、折射、主题、窄屏、减少动态和强制颜色行为。
