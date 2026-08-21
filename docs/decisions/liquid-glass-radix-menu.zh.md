# 液态玻璃 Radix 菜单决策记录

**日期:** 2026-08-20
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地并发布到 `liquid-lab-optics-demo`；本批次亮色对比度修正尚未发布；视觉批准待定

## 1. 范围与决策

可移植交付物是浮动菜单，不是主屏实验室。新工作在 `grok/liquid-glass-radix-menu`。产品安装复制内核并挂载 `LiquidMenu` 或已完成的覆盖层（`LiquidDropdown`、`LiquidContextMenu`、`LiquidSelect`、`LiquidPopover`、`LiquidDialog`、`LiquidMenubar`）。Radix 负责开合、焦点与关闭。光学保持冻结。

本批次修 `/ui` 亮色，但仍是液态玻璃，不是旧 frosted 白卡片。侧栏选中板加一层浅透镜对比；嵌套 overlay 亮色用浅霜 + 白字，不再套海军蓝，也不改成实心白底深字。光学仍冻结。移动端验收后续再做。

菜单正下方必须是模糊或纯色，以保证文字可读。

## 2. 交付结果与改动区域

- `LiquidMenu` 接受 `items`、`value`、`defaultValue`、`onValueChange`、`title`、`theme`、`optics`、可选 `scene`，以及 `host`。
- 内核 `host` 为 `standalone`（包 `@radix-ui/react-navigation-menu`）或 `nested`（普通 `nav`，自管方向键 / Home / End / Enter）。覆盖层必须传 `nested`，禁止叠两层 Radix 菜单。
- `LiquidDropdown` 是第一个做完的覆盖层：Trigger + Portal；指针或重选在旅行淡出后关闭；方向键 / Home / End 浏览并提交但不关闭；Enter / Space 确认并关闭；Escape 与点外侧立即关闭。
- `LiquidContextMenu` 是第二个做完的覆盖层：右键宿主打开玻璃动作列表。默认剪切 / 复制 / 粘贴；点「复制」立刻 `onValueChange("copy")` 并关闭。没有常驻选中、没有旅行透镜。弹出形变保留。
- `LiquidSelect` 是第三个做完的覆盖层：表单 Trigger + Popover Portal（不用 Radix Select），旅行透镜可以走完；空值显示 placeholder。现为 `density: "compact"`，三拍液态弹出，按下挤扁、打开后弹回。
- `LiquidPopover` 是第四个做完的覆盖层：点击 Trigger + Portal 的玻璃气泡卡片。`children` 是任意内容；默认预览是网络状态卡，不是菜单。`LiquidGlassCard` 只画整面折射壳，没有旅行透镜。Escape、点外侧或再点 Trigger 关闭。三拍液态弹出和按下挤扁保留。
- `LiquidDialog` 是第五个做完的覆盖层：模态遮罩 + 居中玻璃卡片。`children` 是任意内容；默认预览是删除确认卡，不是菜单。点遮罩和 Escape 立刻关闭。按下挤扁与居中三拍弹出保留。
- `LiquidMenubar` 是第六个做完的覆盖层：顶栏命令条。薄「文件 / 编辑」标题打开玻璃动作列表；点「打开」立刻 `onValueChange("file","open")` 并关闭。没有常驻选中、没有旅行透镜。弹出形变保留。
- 目录侧栏（`CatalogNav`）在提交后锁住 pending 选中项，避免 `router.push` 晚到时选择板弹回再播一遍旅行。侧栏标签 `nowrap`、从左侧缩放，长英文名不换行且左缘对齐。
- `/ui` 预览台。左侧目录本身就是 `LiquidMenu`。标题行右侧有语言开关（中文 / EN）和亮暗图标开关，分别写入 `liquid-glass:ui-locale` 与 `liquid-glass:ui-theme`。英文全英文。中文时栏框（品牌、侧栏、标题、Usage / Props）中英双语，舞台红框文案只显示中文。侧栏与七个预览都吃 `theme`。内核光学与折射场不变。`/liquid-menu` 重定向到 `/ui/liquid-menu`。七个预览共用舞台背景：天空 / 黄昏 / 草地 / 石墨，色块在右上角「文字底」左侧，写入 `liquid-glass:ui-stage-scene`。`LiquidMenu` 预览与 overlay 一样居中，并有「文字底」。色块是平涂圆，没有纵向渐变。Overlay 预览「文字底」打开后以 10px、220×16 图块满铺 `Liquid glass abcd ABCD 1234`。
- 覆盖层家族已做完。后续是新表面，不再补未完成的五件套。
- `LiquidDropdown` 使用内核 `density: "compact"`（36px 行、13/16 字、200px、16/12 圆角）。常驻 `LiquidMenu` 仍是 `panel`（58 / 14↔20 / 280）。
- Dropdown 打开是内层三拍液态形变，对标控制中心计算器 →「拷贝上个结果」：按下时触发器挤扁（`scaleX 1.1 / scaleY 0.84`），打开后 120ms 松开并弹回原状；源尺寸小团，过大弹出，再收回 compact。关闭不再重放挤扁。定位仍由 Radix Content 负责。`cssAncestorScale` 不让世界副本吃进动画缩放。
- 嵌套 overlay 衬底（`data-host="nested"`）与常驻面板同一套填色：亮色 `rgb(255 255 255 / 16%)`，暗色 `rgb(12 16 28 / 28%)`，模糊 `40px`。不再用固定海军蓝。常驻面板仍是 `16%` + `blur(22px)`。折射不变。
- Overlay 触发器、Menubar、Context 表面、Dialog 遮罩带 `data-theme`。亮色是浅玻璃 + 白字；暗色仍是原来的半透明深底白字。
- `/ui` 亮色侧栏选中板为 `rgb(255 255 255 / 28%)` 透镜，不是实心白条。亮色侧栏字在选中板之上，避免浅霜把深色字冲淡。亮色舞台描边改为 `rgb(255 255 255 / 58%)`，浅色天空上不再画出一条深色顶边。独立 `LiquidMenu` 预览亮色仍是白字配彩壁纸，选中板仍是 `4%` 白。
- Skill 提取与 `app/apple-clear` 保持字节一致。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 源码到内核 verifier | `node skills/liquid-glass-interface/scripts/verify-apple-clear-kernel.js` 通过：`{ files: 15, source: 'app/apple-clear' }` |
| 浏览器 `/ui/liquid-dropdown` | 桌面 1280×800：打开；点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 → 菜单保持打开 / `onValueChange: settings`；Enter 关闭并回到 trigger 焦点；Escape 关闭；点当前「设置」关闭；点左侧栏关闭。侧栏 `LiquidMenu` 仍为 `host=standalone` 并路由到 `/ui/liquid-menu`。移动 390×844：pointerdown+click「信息」→ 旅行 → 关闭 / `onValueChange: messages`。 |
| 侧栏对齐与单次旅行 | Radix viewport `display:contents` + 标签 `nowrap` 后：七个标签左缘均为 42px，行距 66px，命中层与视觉层重合，Menubar 留在壳体里。从 LiquidDropdown 点到 LiquidDialog：`--apple-selection-y` 66 → 345 过冲 → 330，切到 `/ui/liquid-dialog` 后仍停在 330，不再弹回。 |
| 浏览器 `/ui/liquid-context-menu` | 桌面：在「在此区域右键」上右键，打开动作列表 剪切/复制/粘贴，没有选中板。点「复制」立刻 `copy` 并关闭。没有 `LiquidMenu` / 旅行透镜。移动端未验收。 |
| 浏览器 `/ui/liquid-select` | 桌面：trigger 显示 `选择…`；点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；ArrowDown 信息→设置 保持打开 / trigger `设置`；Enter 关闭；Escape 关闭；点标题关闭；重选「设置」立刻关闭。移动 390×844：pointerdown+click「照片」→ 旅行 → trigger `照片` / 已关闭。 |
| 浏览器 `/ui/liquid-popover` | 桌面：点「网络」打开玻璃卡，正文为「办公室 Wi-Fi」/「已连接 · 5 GHz」，没有菜单项。点「断开」→ 舞台值 `未连接`，气泡保持打开；再点「连接」→ `已连接`。Escape 关闭。没有 `LiquidMenu` / 旅行透镜。移动端未验收。 |
| 浏览器 `/ui/liquid-dialog` | 桌面：点「删除相册」打开居中确认卡，「删除「旅行」？」/ 没有菜单项。点「删除」→ 舞台 `已删除`，对话框关闭。再开后点遮罩或 Escape 立刻关闭。没有 `LiquidMenu` / 旅行透镜。移动端未验收。 |
| 浏览器 `/ui/liquid-menubar` | 桌面：左上角薄命令条「文件 / 编辑」。点「文件」打开动作列表 新建/打开/保存，没有选中板。点「打开」立刻 `file/open` 并关闭。Escape 关闭。没有 `LiquidMenu` / 旅行透镜。移动端未验收。 |
| Skill 安装 `test-7` | 空白 Vite React 项目：`/Users/jay/Code/Liquid-Glasses-skill-test/test-7`。14 个内核文件 + adapter 字节一致。`tsc -b` 通过。桌面：LiquidMenu 点「信息」旅行 → `menu: messages`，Enhanced。LiquidDropdown 点「设置」旅行后关闭 / `dropdown: settings`。移动：设置 → `menu: settings`。内核包 SHA-256 `60d21ba6c82f365ab71a4ee375d290e33d1f84e9bfa1358363775dbece0cb23c`。视觉批准待定。 |
| 紧凑 Dropdown | `/ui/liquid-dropdown`：trigger 40×61 / 14px；打开面板 200×172，行 36，旅行板 46，圆角 16，density=compact。点「信息」旅行后关闭。侧栏仍是行 58 / density=panel。 |
| Dropdown 形变弹出 | 桌面 1280×800：pointerdown 触发器 `matrix(1.1, 0, 0, 0.84)`；弹出采样 68×31（t0）→ 150×112（t80）→ 过大 227×201（t270）→ 回收 190×158（t420）→ 落稳 200×172（t700）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭；无残留 pop 节点。移动 390×844：同样挤扁；中途 174×140，落稳 200×172；点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。控制台无 error。 |
| ContextMenu 动作列表 | `/ui/liquid-context-menu` 桌面 1280×800：右键打开 `liquid-glass-card` 168×116，动作 剪切/复制/粘贴，没有 `apple-clear-menu` / 选择板。点「复制」立刻 `copy` / 已关闭。控制台无 error。移动端未验收。 |
| 嵌套 overlay 遮挡 | `/ui/liquid-context-menu`：在「在此区域右键」上右键。嵌套衬底计算值为 `rgba(14, 18, 30, 0.54)` / `blur(40px) saturate(1.8)`。提示字不能透过面板读出。侧栏 `LiquidMenu` 仍是 `data-host=standalone`。 |
| Select 紧凑 + 形变 | `/ui/liquid-select` 桌面：弹出 68×31（t80）→ 过大 219×193（t270）→ 落稳 200×172（t700），`data-density=compact`。打开后触发器挤扁松开（`transform: none`）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭。移动 390×844：落稳 200×172；点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。 |
| Overlay 探测底 | `/ui/liquid-select` 桌面 1280×800：默认无 `is-probe`，`::before` 为 `none`，右上角开关 `aria-pressed=false`。打开后以 10px、220×16 图块满铺 `Liquid glass abcd ABCD 1234`（已去掉 `test`）。点「信息」→ 旅行 → trigger `信息` / `onValueChange: messages` / 已关闭。同一开关也在 `/ui/liquid-dropdown`（点「信息」→ `messages` / 已关闭）、`/ui/liquid-context-menu`（右键 →「信息」→ `messages` / 已关闭）、`/ui/liquid-popover`（打开网络卡，气泡保持打开）、`/ui/liquid-dialog`（打开删除确认卡）、`/ui/liquid-menubar`（文件 →「打开」→ `file/open` / 已关闭）。`/ui/liquid-menu` 没有开关、没有探测字。移动 390×844 `/ui/liquid-select`：单栏目录，打开探测，点「照片」→ trigger `照片` / `onValueChange: photos` / 已关闭。控制台无 error。 |
| Popover 气泡卡片 | `/ui/liquid-popover` 桌面 1280×800：点「网络」打开 `liquid-glass-card` 260×152，没有 `apple-clear-menu` / 选择板。正文「办公室 Wi-Fi」/「已连接 · 5 GHz」。点「断开」→ 卡片与舞台均为 `未连接`，气泡保持打开。Escape 关闭。控制台无 error。移动端未验收。 |
| Dialog 模态卡片 | `/ui/liquid-dialog` 桌面 1280×800：点「删除相册」打开居中 `liquid-glass-card` 260×152，遮罩 `rgba(6, 10, 18, 0.46)`，没有 `apple-clear-menu` / 选择板。点「删除」→ 舞台 `已删除`，对话框关闭。再开后 Escape 立刻关闭。控制台无 error。移动端未验收。 |
| Menubar 命令条 | `/ui/liquid-menubar` 桌面 1280×800：命令条贴舞台左上 17×17，尺寸 111×36。点「文件」打开 `liquid-glass-card` 168×116，动作 新建/打开/保存，没有 `apple-clear-menu` / 选择板。点「打开」立刻 `file/open` / 已关闭。控制台无 error。移动端未验收。 |
| 生产部署 | Wrangler `4.92.0`。`npm run build` 通过。dry-run：27 modules、`1742.22 KiB` / gzip `372.80 KiB`，无 bindings。正式发布 Worker `liquid-lab-optics-demo` 版本 `c395db38-be40-43f5-b663-3d56591db275`，消息 `release liquid glass radix menu catalog`。`https://liquid.hkooii.com/ui` → `307` `/ui/liquid-menu`；七条 `/ui/*` 均为 `200`；workers.dev `/ui` → `307`；`/v2` 仍为 `200`。HTML 含 Command bar / Right-click host / Glass bubble。回滚目标 `50355dc2-6b65-4b7f-9955-83933c3ce75c`。 |
| 目录短名 | `/ui/liquid-context-menu` 桌面：侧栏与页标题为 Menu / Dropdown / Context Menu / Select / Popover / Dialog / Menubar。路由仍是 `/ui/liquid-*`。Usage 仍写 `<LiquidContextMenu />`。Context Menu 单行、未换行。 |
| `/ui` 亮暗切换 | `/ui/liquid-menu` 桌面：默认 `data-theme=dark`，开关 `aria-pressed=true` 文案「亮色」。点「亮色」后 `data-theme=light`，开关文案「暗色」，侧栏字色为深色，舞台仍是渐变。切到 Dropdown / Context Menu 后仍为 light。刷新后仍为 light。再点「暗色」回到 dark。控制台无 error。 |
| 旅行板叠字 | `/ui/liquid-menu` 桌面：旅行中途 `stretchY=1.16`、板高 74、nudge −8。above/below 裁切再扩 `--apple-lens-clip-overshoot`（约 6px）。停在两行中间时板缘不再叠大小字。落稳单行。控制台无 error。 |
| `/ui` 亮色对比度 | 桌面 1280×800。亮色侧栏选中板 `rgba(255,255,255,0.28)` 透镜，字 `#132033`。`/ui/liquid-dropdown` 与 `/ui/liquid-context-menu` 打开后嵌套衬底 `rgba(90,150,210,0.44)` / `blur(40px)`，行字白，trigger / 卡片动作仍是白字浅玻璃，不是实心白卡片。独立 `/ui/liquid-menu` 预览仍是白字、选中板 `0.04` 白。切回暗色：嵌套衬底 `rgba(14,18,30,0.54)`。控制台无 error。本批次未发布。 |
| `/ui` 舞台背景 | 桌面 1280×800 `/ui/liquid-menubar`：右上角四个色块在「文字底」左侧。默认 `data-scene=sky`。点黄昏 → `dusk`，草地 → `meadow`，石墨 → `graphite`。切到 Dropdown 仍为 graphite。刷新后仍为 graphite。点回天空 → `sky`。「文字底」仍可开关。`/ui/liquid-menu` 居中、有「文字底」，舞台四角无缺口。色块为平涂圆。Dropdown 打开后玻璃跟舞台：草地透绿，黄昏透紫。控制台无 error。 |
| `/ui` 语言与主题位置 | 桌面 1280×800 `/ui/liquid-dialog`：语言与主题开关在标题行右侧，侧栏品牌行不再有太阳/月亮。默认中文：标题 `Dialog 对话框`，简介中文，触发器「删除相册」。点 EN：标题 `Dialog`，简介英文，触发器 `Delete album`，侧栏无中文。刷新仍为 EN。点回 中文。主题开关仍切亮暗。控制台无 error。 |

## 4. 部署与发布状态

已用 `dist/server/wrangler.json` 发布既有 Worker `liquid-lab-optics-demo`。版本 `c395db38-be40-43f5-b663-3d56591db275`，100% 流量。回滚目标为上一版 `50355dc2-6b65-4b7f-9955-83933c3ce75c`。本批次亮色对比度修正只在本地 `grok/liquid-glass-radix-menu`，尚未发布。

## 5. 已知风险、限制与后续工作

- 形变是 compact 面板的 CSS scale，不是从触发器圆角矩形做真正的路径变形。玻璃轮廓插值是后续。
- 嵌套宿主没有 typeahead。Radix Dropdown 没有 `Item` 子节点，因此不会跟打字跳转。
- 方向键浏览在旅行淡出后更新 `value`，这样面板留在新行上、菜单仍保持打开。
- 嵌入态 `backdrop-filter` 采样舞台后的页面；副本仍克隆 backdrop 节点，不是每个字形下的实时像素。
- 覆盖层占位已清完。Tab bar / 控制中心 Regular 在系统截图到位前不做。
- Overlay 本轮只验收桌面；移动端后续再做。
