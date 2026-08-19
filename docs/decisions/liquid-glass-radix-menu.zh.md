# 液态玻璃 Radix 菜单决策记录

**日期:** 2026-08-19
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地；视觉批准待定；未部署

## 1. 范围与决策

可移植交付物是浮动菜单，不是主屏实验室。新工作在 `grok/liquid-glass-radix-menu`。产品安装复制内核并挂载 `LiquidMenu` 或已完成的覆盖层（`LiquidDropdown`、`LiquidContextMenu`、`LiquidSelect`、`LiquidPopover`、`LiquidDialog`、`LiquidMenubar`）。Radix 负责开合、焦点与关闭。光学保持冻结。

本批次把 `LiquidPopover` 改成玻璃气泡卡片：只装 `children`，不再内置 `LiquidMenu`。开合、形变、按下挤扁保留。移动端验收后续再做。

菜单正下方必须是模糊或纯色，以保证文字可读。

## 2. 交付结果与改动区域

- `LiquidMenu` 接受 `items`、`value`、`defaultValue`、`onValueChange`、`title`、`theme`、`optics`、可选 `scene`，以及 `host`。
- 内核 `host` 为 `standalone`（包 `@radix-ui/react-navigation-menu`）或 `nested`（普通 `nav`，自管方向键 / Home / End / Enter）。覆盖层必须传 `nested`，禁止叠两层 Radix 菜单。
- `LiquidDropdown` 是第一个做完的覆盖层：Trigger + Portal；指针或重选在旅行淡出后关闭；方向键 / Home / End 浏览并提交但不关闭；Enter / Space 确认并关闭；Escape 与点外侧立即关闭。
- `LiquidContextMenu` 是第二个做完的覆盖层：右键宿主 + Portal；嵌套宿主键盘与延迟关闭与 `LiquidDropdown` 相同。现为 `density: "compact"`，并使用同一套三拍液态弹出（没有常驻触发器，所以没有挤扁）。
- `LiquidSelect` 是第三个做完的覆盖层：表单 Trigger + Popover Portal（不用 Radix Select），旅行透镜可以走完；空值显示 placeholder。现为 `density: "compact"`，三拍液态弹出，按下挤扁、打开后弹回。
- `LiquidPopover` 是第四个做完的覆盖层：点击 Trigger + Portal 的玻璃气泡卡片。`children` 是任意内容；默认预览是网络状态卡，不是菜单。`LiquidGlassCard` 只画整面折射壳，没有旅行透镜。Escape、点外侧或再点 Trigger 关闭。三拍液态弹出和按下挤扁保留。
- `LiquidDialog` 是第五个做完的覆盖层：模态遮罩 + 居中玻璃菜单；指针或 Enter 在旅行淡出后关闭；点遮罩和 Escape 立刻关闭。
- `LiquidMenubar` 是第六个做完的覆盖层：横向「文件 / 编辑」触发器；每个菜单都是 `host="nested"`；指针或 Enter 在旅行淡出后关闭。不再用 `key` 整棵重挂。
- 目录侧栏（`CatalogNav`）在提交后锁住 pending 选中项，避免 `router.push` 晚到时选择板弹回再播一遍旅行。侧栏标签 `nowrap`、从左侧缩放，长英文名不换行且左缘对齐。
- `/ui` 预览台。左侧目录本身就是 `LiquidMenu`。`/liquid-menu` 重定向到 `/ui/liquid-menu`。Overlay 预览共用 `OverlayPreviewStage`：默认只有渐变；右上角「文字底」打开后以 10px、220×16 图块满铺 `Liquid glass abcd ABCD 1234`。`LiquidMenu` 预览仍是整面渐变，没有开关。
- 覆盖层家族已做完。后续是新表面，不再补未完成的五件套。
- `LiquidDropdown` 使用内核 `density: "compact"`（36px 行、13/16 字、200px、16/12 圆角）。常驻 `LiquidMenu` 仍是 `panel`（58 / 14↔20 / 280）。
- Dropdown 打开是内层三拍液态形变，对标控制中心计算器 →「拷贝上个结果」：按下时触发器挤扁（`scaleX 1.1 / scaleY 0.84`），打开后 120ms 松开并弹回原状；源尺寸小团，过大弹出，再收回 compact。关闭不再重放挤扁。定位仍由 Radix Content 负责。`cssAncestorScale` 不让世界副本吃进动画缩放。
- 嵌套 overlay 衬底（`data-host="nested"`）暗色为 `rgb(14 18 30 / 54%)` + `blur(40px)`（亮色 `rgb(28 48 78 / 52%)`），刚好挡住门户后的页面字。常驻面板仍是 `16%` + `blur(22px)`。折射不变。
- Skill 提取与 `app/apple-clear` 保持字节一致。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`{ files: 15, source: 'app/apple-clear' }` |
| 浏览器 `/ui/liquid-dropdown` | 桌面 1280×800：打开；点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 → 菜单保持打开 / `onValueChange: settings`；Enter 关闭并回到 trigger 焦点；Escape 关闭；点当前「设置」关闭；点左侧栏关闭。侧栏 `LiquidMenu` 仍为 `host=standalone` 并路由到 `/ui/liquid-menu`。移动 390×844：pointerdown+click「信息」→ 旅行 → 关闭 / `onValueChange: messages`。 |
| 侧栏对齐与单次旅行 | Radix viewport `display:contents` + 标签 `nowrap` 后：七个标签左缘均为 42px，行距 66px，命中层与视觉层重合，Menubar 留在壳体里。从 LiquidDropdown 点到 LiquidDialog：`--apple-selection-y` 66 → 345 过冲 → 330，切到 `/ui/liquid-dialog` 后仍停在 330，不再弹回。 |
| 浏览器 `/ui/liquid-context-menu` | 桌面：右键打开 nested host；点「信息」→ 旅行 → `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 保持打开 / `settings`；Enter 关闭；Escape 关闭；点外侧关闭；重选「设置」立刻关闭。移动 390×844 长按打开；pointerdown+click「照片」→ 旅行 → 关闭 / `photos`。`/ui/liquid-dropdown` 仍能打开 nested host。 |
| 浏览器 `/ui/liquid-select` | 桌面：trigger 显示 `选择…`；点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 保持打开 / trigger `设置`；Enter 关闭；Escape 关闭；点标题关闭；重选「设置」立刻关闭。移动 390×844：pointerdown+click「照片」→ 旅行 → trigger `照片` / 已关闭。 |
| 浏览器 `/ui/liquid-popover` | 桌面：点「网络」打开玻璃卡，正文为「办公室 Wi-Fi」/「已连接 · 5 GHz」，没有菜单项。点「断开」→ 舞台值 `未连接`，气泡保持打开；再点「连接」→ `已连接`。Escape 关闭。没有 `LiquidMenu` / 旅行透镜。移动端未验收。 |
| 浏览器 `/ui/liquid-dialog` | 桌面：打开居中模态；点「信息」→ 旅行 → `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 保持打开 / `settings`；Enter 关闭；Escape 关闭；点遮罩关闭；重选「设置」立刻关闭。移动 390×844：pointerdown+click「照片」→ 旅行 → `photos` / 已关闭。 |
| 浏览器 `/ui/liquid-menubar` | 桌面：文件打开 新建/打开/保存；点「打开」→ 旅行 → `file/open` / 已关闭；编辑打开 剪切/复制/粘贴；ArrowDown → `edit/copy` / 保持打开；Enter 关闭；文件→编辑切换菜单；Escape 关闭；点标题关闭。移动 390×844：文件 → 保存 → 旅行 → `file/save` / 已关闭。 |
| Skill 安装 `test-7` | 空白 Vite React 项目：`/Users/jay/Code/Liquid-Glasses-skill-test/test-7`。14 个内核文件 + adapter 字节一致。`tsc -b` 通过。桌面：LiquidMenu 点「信息」旅行 → `menu: messages`，Enhanced。LiquidDropdown 点「设置」旅行后关闭 / `dropdown: settings`。移动：设置 → `menu: settings`。内核包 SHA-256 `60d21ba6c82f365ab71a4ee375d290e33d1f84e9bfa1358363775dbece0cb23c`。视觉批准待定。 |
| 紧凑 Dropdown | `/ui/liquid-dropdown`：trigger 40×61 / 14px；打开面板 200×172，行 36，旅行板 46，圆角 16，density=compact。点「信息」旅行后关闭。侧栏仍是行 58 / density=panel。 |
| Dropdown 形变弹出 | 桌面 1280×800：pointerdown 触发器 `matrix(1.1, 0, 0, 0.84)`；弹出采样 68×31（t0）→ 150×112（t80）→ 过大 227×201（t270）→ 回收 190×158（t420）→ 落稳 200×172（t700）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；无残留 pop 节点。移动 390×844：同样挤扁；中途 174×140，落稳 200×172；点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。控制台无 error。 |
| ContextMenu 紧凑 + 形变 | `/ui/liquid-context-menu` 桌面：右键弹出 `liquid-context-pop-right` 36×58（t80）→ 过大 243×201（t270）→ 落稳 200×172（t700），`data-density=compact`。点「信息」→ 旅行 → `onValueChange: messages` / 已关闭。 |
| 嵌套 overlay 遮挡 | `/ui/liquid-context-menu`：在「在此区域右键」上右键。嵌套衬底计算值为 `rgba(14, 18, 30, 0.54)` / `blur(40px) saturate(1.8)`。提示字不能透过面板读出。侧栏 `LiquidMenu` 仍是 `data-host=standalone`。 |
| Select 紧凑 + 形变 | `/ui/liquid-select` 桌面：弹出 68×31（t80）→ 过大 219×193（t270）→ 落稳 200×172（t700），`data-density=compact`。打开后触发器挤扁松开（`transform: none`）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭。移动 390×844：落稳 200×172；点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。 |
| Overlay 探测底 | `/ui/liquid-select` 桌面 1280×800：默认无 `is-probe`，`::before` 为 `none`，右上角开关 `aria-pressed=false`。打开后以 10px、220×16 图块满铺 `Liquid glass abcd ABCD 1234`（已去掉 `test`）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭。同一开关也在 `/ui/liquid-dropdown`（点「信息」→ `messages` / 已关闭）、`/ui/liquid-context-menu`（右键 →「信息」→ `messages` / 已关闭）、`/ui/liquid-popover`（打开网络卡，气泡保持打开）、`/ui/liquid-dialog`（「信息」→ `messages` / 已关闭）、`/ui/liquid-menubar`（文件 →「打开」→ `file/open` / 已关闭）。`/ui/liquid-menu` 没有开关、没有探测字。移动 390×844 `/ui/liquid-select`：单栏目录，打开探测，点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。控制台无 error。 |
| Popover 气泡卡片 | `/ui/liquid-popover` 桌面 1280×800：点「网络」打开 `liquid-glass-card` 260×152，没有 `apple-clear-menu` / 选择板。正文「办公室 Wi-Fi」/「已连接 · 5 GHz」。点「断开」→ 卡片与舞台均为 `未连接`，气泡保持打开。Escape 关闭。控制台无 error。移动端未验收。 |
| 生产部署 | 未执行 |

## 4. 部署与发布状态

仅仓库与 Skill 资产变更。没有 Worker 部署。

## 5. 已知风险、限制与后续工作

- 形变是 compact 面板的 CSS scale，不是从触发器圆角矩形做真正的路径变形。玻璃轮廓插值是后续。
- 嵌套宿主没有 typeahead。Radix Dropdown 没有 `Item` 子节点，因此不会跟打字跳转。
- 方向键浏览在旅行淡出后更新 `value`，这样面板留在新行上、菜单仍保持打开。
- 嵌入态 `backdrop-filter` 采样舞台后的页面；副本仍克隆 backdrop 节点，不是每个字形下的实时像素。
- 覆盖层占位已清完。Tab bar / 控制中心 Regular 在系统截图到位前不做。
- `LiquidPopover` 本轮只验收桌面；移动端后续再做。
