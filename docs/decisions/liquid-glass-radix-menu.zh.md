# 液态玻璃 Radix 菜单决策记录

**日期:** 2026-08-18
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地；视觉批准待定；未部署

## 1. 范围与决策

可移植交付物是浮动菜单，不是主屏实验室。新工作在 `grok/liquid-glass-radix-menu`。产品安装复制内核并挂载 `LiquidMenu`、`LiquidDropdown` 或 `LiquidContextMenu`。Radix 负责开合、焦点与关闭。光学保持冻结。

本批次只做完 **LiquidContextMenu**。其他未完成的覆盖层此处不改。

菜单正下方必须是模糊或纯色，以保证文字可读。

## 2. 交付结果与改动区域

- `LiquidMenu` 接受 `items`、`value`、`defaultValue`、`onValueChange`、`title`、`theme`、`optics`、可选 `scene`，以及 `host`。
- 内核 `host` 为 `standalone`（包 `@radix-ui/react-navigation-menu`）或 `nested`（普通 `nav`，自管方向键 / Home / End / Enter）。覆盖层必须传 `nested`，禁止叠两层 Radix 菜单。
- `LiquidDropdown` 是第一个做完的覆盖层：Trigger + Portal；指针或重选在旅行淡出后关闭；方向键 / Home / End 浏览并提交但不关闭；Enter / Space 确认并关闭；Escape 与点外侧立即关闭。
- `LiquidContextMenu` 是第二个做完的覆盖层：右键宿主 + Portal；嵌套宿主键盘与延迟关闭与 `LiquidDropdown` 相同。
- 目录侧栏（`CatalogNav`）在提交后锁住 pending 选中项，避免 `router.push` 晚到时选择板弹回再播一遍旅行。侧栏标签 `nowrap`、从左侧缩放，长英文名不换行且左缘对齐。
- `/ui` 预览台。左侧目录本身就是 `LiquidMenu`。`/liquid-menu` 重定向到 `/ui/liquid-menu`。
- `LiquidSelect`、`LiquidPopover`、`LiquidDialog`、`LiquidMenubar` 仍是上一轮五件套的目录占位，本批次不完成。
- Skill 提取与 `app/apple-clear` 保持字节一致。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`{ files: 14, source: 'app/apple-clear' }` |
| 浏览器 `/ui/liquid-dropdown` | 桌面 1280×800：打开；点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 → 菜单保持打开 / `onValueChange: settings`；Enter 关闭并回到 trigger 焦点；Escape 关闭；点当前「设置」关闭；点左侧栏关闭。侧栏 `LiquidMenu` 仍为 `host=standalone` 并路由到 `/ui/liquid-menu`。移动 390×844：pointerdown+click「信息」→ 旅行 → 关闭 / `onValueChange: messages`。 |
| 侧栏对齐与单次旅行 | Radix viewport `display:contents` + 标签 `nowrap` 后：七个标签左缘均为 42px，行距 66px，命中层与视觉层重合，Menubar 留在壳体里。从 LiquidDropdown 点到 LiquidDialog：`--apple-selection-y` 66 → 345 过冲 → 330，切到 `/ui/liquid-dialog` 后仍停在 330，不再弹回。 |
| 浏览器 `/ui/liquid-context-menu` | 桌面：右键打开 nested host；点「信息」→ 旅行 → `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 保持打开 / `settings`；Enter 关闭；Escape 关闭；点外侧关闭；重选「设置」立刻关闭。移动 390×844 长按打开；pointerdown+click「照片」→ 旅行 → 关闭 / `photos`。`/ui/liquid-dropdown` 仍能打开 nested host。 |
| 生产部署 | 未执行 |

## 4. 部署与发布状态

仅仓库与 Skill 资产变更。没有 Worker 部署。

## 5. 已知风险、限制与后续工作

- 嵌套宿主没有 typeahead。Radix Dropdown 没有 `Item` 子节点，因此不会跟打字跳转。
- 方向键浏览在旅行淡出后更新 `value`，这样面板留在新行上、菜单仍保持打开。
- 嵌入态 `backdrop-filter` 采样舞台后的页面；副本仍克隆 backdrop 节点，不是每个字形下的实时像素。
- 下一批次：只做完 `LiquidSelect`，复用 `host="nested"`。
