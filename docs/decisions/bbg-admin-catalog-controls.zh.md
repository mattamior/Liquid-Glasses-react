# bbg-admin 未覆盖控件接入 `/ui` 决策记录

**日期:** 2026-09-12
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地；未发布到生产 Worker

## 1. 范围与决策

对照 `~/Code/BBG/bbg-admin` 的全部界面模式，做成 `/ui` 同风格目录页。光学仍冻结。`Label` 挂在 Input 预览。shadcn 原语与模块级表格、分页、状态胶囊、树、工具栏、原生 `<select>` 全部覆盖。

## 2. 交付结果与改动区域

bbg-admin `src/components/ui` 共 11 个文件。产品代码实际用到：Button、Input、Label、Textarea、Checkbox、RadioGroup、Select（文件在、产品多用原生 `<select>`）、Dialog、AlertDialog、Sheet、Card。

`/ui` 现有 21 项。新增模块级：Table、Pagination、Pill、Tree、Toolbar、Native Select。按钮补 sm / ghost；输入补 hint / error / disabled。侧栏 compact 且可滚动；窄屏侧栏封顶约 32vh，舞台可点。内核提取 29 文件。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`{ files: 23, source: 'app/apple-clear' }` |
| `npm test` | 生产 build 通过。渲染测试 `12/12` 通过，含新增 8 条 `/ui/*` `200`。 |
| 浏览器桌面 1280×800 | `/ui/liquid-button` 点「新建」→ `onClick: create`。`/ui/liquid-input` 账号改为 `root`。`/ui/liquid-checkbox` 勾选 10002 → `10001, 10002`。`/ui/liquid-radio` 点「启用」→ `ENABLED`。`/ui/liquid-alert` 点「禁用账号」打开 alertdialog，点「禁用」→ `已禁用`。`/ui/liquid-sheet` 点「账号」打开详情 `admin@bb.game`，Escape → `已关闭`。侧栏点 Dialog 仍到 `/ui/liquid-dialog`。 |
| 浏览器移动 390×844 | `/ui/liquid-button` 亮色落到 Button 页，15 项侧栏在。控制台无 error。舞台按钮在长侧栏下，未点到。 |
| 浏览器桌面补全 | `/ui/liquid-table` 点「亚太」打开 Sheet `APAC`；第 2 页到「东南亚」；搜「欧洲」→ 共 1 条。`/ui/liquid-tree` 勾选写入、点区域 → `regions · acc-read,acc-write`。`/ui/liquid-toolbar` 查询 admin + 启用 → `admin · ENABLED`。`/ui/liquid-native-select` 单选 + 多选在。 |
| 浏览器移动补全 | `/ui/liquid-table` 390×844 点「亚太」打开详情 Sheet。 |
| `npm test` 二次 | 生产 build 通过。`12/12`，含 21 条 `/ui/*` `200`。 |
| 内核 verifier | `{ files: 29, source: 'app/apple-clear' }` |

## 4. 部署与发布状态

未执行 Worker 部署。公开站点仍为 `ced4b0d6-f829-4be6-aae8-64869fb453c1`。

## 5. 已知风险、限制与后续工作

- 按钮、输入、复选、单选、原生选择、工具栏是玻璃胶囊，不是整面 `feDisplacementMap` 壳。表格和树放在 `LiquidGlassCard` 里。
- Alert 点遮罩默认不关，与 Dialog 不同。
- bbg-admin 对照的界面模式已齐。登录页是 Card+Input+Button 组合，不单开。
- Overlay 家族移动端仍待专项验收。未发生产。
