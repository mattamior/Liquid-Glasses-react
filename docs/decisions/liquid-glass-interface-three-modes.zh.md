# Liquid Glass Interface Skill 三模式决策记录

**日期：** 2026-08-13
**状态：** 已在本地实施；尚未部署或发布

## 1. 范围与决策

将仓库中唯一的 `liquid-glass-interface` Skill 与当前 React 实现同步，并在一个可分发
Skill 内保留三个固定、可显式选择的模式：

- `v1-fidelity`：冻结、低自由度的 V1 复刻。
- `v2-default`：默认的纵向导航与液态玻璃卡片路由。
- `v3-horizontal`：独立的 M04 横向导航透镜路由。

未指定模式时，除非需求明确触发 V1 或 V3，否则选择 `v2-default`。遇到未知 `vN`
必须请求用户选择受支持模式，而不得猜测。`/v3-05-failed` 与
`v3-milestone-05-failed` 继续仅作为失败 M05 的历史归档：它们不是 Skill 资产、模式、
验证器输入或视觉验收基线。

## 2. 交付结果与改动区域

- 用 `skills/liquid-glass-interface/assets/` 下的完整可移植 Next App Router 资产替换过时
  V1 和原生 V2 片段，并新增完整 V3 横向资产。权威源文件在提交
  `dba33b1f996c5219ab78747892b2d3c26057a399` 同步：
  - `app/v1/{layout.tsx,page.tsx,v1.css}` → `v1-fidelity-kit/`
  - `app/v2/{layout.tsx,page.tsx,lens-optics.ts,v2.css}` → `v2-reference-implementation/`
  - `app/v3/{layout.tsx,page.tsx,lens-optics.ts,v3.css}` → `v3-horizontal-navigation/`
- 更新 `SKILL.md`：写入固定模式选择、默认与未知版本处理、M05 排除、可移植复制边界、
  降级和必需输出。
- 更新 V1 验证器，替换过时的 V2 原生页面验证器，并新增 V3 验证器。每个验证器都检查
  源码/资产一致性及其材质、交互、语义或降级契约。
- 新增生成的 `agents/openai.yaml`，并修正 V2 全主指针行为、V3 强制颜色/无滤镜降级相关的
  公共 React、交互与材质参考。
- 更新中英文方法文档和 README 中的 Skill 说明。中文 README 现与既有记录的 V3 M04
  Worker 部署一致；本批次没有改变该部署。

## 3. 验证证据

以下检查均于 2026-08-13 在本地执行。没有命令使用 `--update-snapshots`。

| 检查 | 精确结果 |
| --- | --- |
| `quick_validate.py` | `Skill is valid!` |
| V1 静态验证器 | `v1-fidelity-kit assertions passed { files: 3, source: 'app/v1' }` |
| V2 静态验证器 | `v2-default assertions passed { files: 4, source: 'app/v2' }` |
| V3 静态验证器 | `v3-horizontal assertions passed { files: 4, source: 'app/v3 M04' }` |
| `npm test` | build 通过；渲染路由测试 `6/6` 通过 |
| `npm run lint` | 以 exit `0` 通过 |
| 定向 Playwright | 覆盖 V2/V3 光学与交互套件，`51 passed (20.5s)` |
| `npm run test:all` | build 与渲染路由测试通过；完整 Playwright 套件 `86/86` 通过 |
| `git diff --check` | 通过 |

`agents/openai.yaml` 通过 `skill-creator` 生成器的 `--name` 接口生成。本地 `python3`
缺少 PyYAML，因此以不写文件的内存 YAML shim 调用 `quick_validate.py`；其简化的 Skill
frontmatter 验证已成功完成。没有安装任何依赖。

## 4. 部署与发布状态

本批次只变更仓库内的 Skill 与文档。没有执行 Worker 部署、Skill 发布、远程资产上传或
生产视觉 smoke。既有 V2/V3 路由发布说明属于历史事实，不构成本批次的新发布证据。

## 5. 已知风险、限制与后续工作

- 自动化验证可移植性与仓库契约，但不能替代人工视觉门槛。V1 仍需在桌面与 `<=560px`
  审阅后获得用户明确的高保真通过；V2/V3 仍需人工检查主题、焦点、键盘、透镜折射、
  窄屏、减少动态与强制颜色。
- 资产验证器会在相应的 `app/v1`、`app/v2` 或 M04 `app/v3` 源码改变时有意失败。下一个
  实施批次应同步对应资产，并重跑上述全部检查。
- 必须保持 M05 隔离。维护本 Skill 时，不得将其复制进资产、加入验收基线或修改其快照。

### 严格合规后续决策

本记录保留 2026-08-13 的 source-to-asset 同步证据。三项静态 verifier 仅能证明本仓库可移植资产与其源路由相符，不能证明目标项目合规。后续的[严格合规决策](./liquid-glass-interface-strict-conformance.zh.md)定义了 schema `2.0` strict kernel、六个模式/框架 manifest、冻结 integration 哈希、结构化 E2E/视觉证据、完整源码树污染扫描和强制人工视觉门禁。旧可移植 bundle 及其 verifier 仍是发布参考，不是严格目标 kernel 或目标项目证据。
