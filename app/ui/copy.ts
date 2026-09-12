import { type UiLocale } from "./UiLocale";

export interface UiCatalogPropCopy {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
}

export interface UiCatalogCopy {
  slug: string;
  nav: string;
  title: string;
  summary: string;
  usage: string;
  props: readonly UiCatalogPropCopy[];
}

interface LocalePair {
  en: string;
  zh: string;
}

function pair(en: string, zh: string): LocalePair {
  return { en, zh };
}

function chrome(locale: UiLocale, en: string, zh: string) {
  return locale === "en" ? en : `${en} ${zh}`;
}

const NAV = [
  { slug: "liquid-menu", en: "Menu", zh: "菜单" },
  { slug: "liquid-dropdown", en: "Dropdown", zh: "下拉菜单" },
  { slug: "liquid-context-menu", en: "Context Menu", zh: "右键菜单" },
  { slug: "liquid-select", en: "Select", zh: "选择器" },
  { slug: "liquid-popover", en: "Popover", zh: "气泡" },
  { slug: "liquid-dialog", en: "Dialog", zh: "对话框" },
  { slug: "liquid-menubar", en: "Menubar", zh: "菜单栏" },
  { slug: "liquid-button", en: "Button", zh: "按钮" },
  { slug: "liquid-input", en: "Input", zh: "输入框" },
  { slug: "liquid-textarea", en: "Textarea", zh: "文本域" },
  { slug: "liquid-checkbox", en: "Checkbox", zh: "复选框" },
  { slug: "liquid-radio", en: "Radio", zh: "单选" },
  { slug: "liquid-alert", en: "Alert", zh: "确认框" },
  { slug: "liquid-sheet", en: "Sheet", zh: "侧栏" },
  { slug: "liquid-card", en: "Card", zh: "卡片" },
  { slug: "liquid-table", en: "Table", zh: "表格" },
  { slug: "liquid-pagination", en: "Pagination", zh: "分页" },
  { slug: "liquid-pill", en: "Pill", zh: "状态" },
  { slug: "liquid-tree", en: "Tree", zh: "树" },
  { slug: "liquid-toolbar", en: "Toolbar", zh: "工具栏" },
  { slug: "liquid-native-select", en: "Native Select", zh: "原生选择" },
] as const;

const PROP_THEME: UiCatalogPropCopy = {
  name: "theme",
  type: `"light" | "dark"`,
  defaultValue: `"light"`,
  description: "Clear material theme.",
};

const PROP_OPTICS: UiCatalogPropCopy = {
  name: "optics",
  type: `"enhanced" | "baseline"`,
  defaultValue: `"enhanced"`,
  description: "Displacement when supported.",
};

const CATALOG: Record<string, { summary: LocalePair; usage: LocalePair; props: readonly UiCatalogPropCopy[] }> = {
  "liquid-menu": {
    summary: pair(
      "Floating vertical menu. Copy the kernel. Put blur or a solid color immediately behind it.",
      "浮动竖向菜单。复制内核。正后方放模糊或纯色。",
    ),
    usage: pair(
      `import { LiquidMenu } from "../apple-clear/LiquidMenu";

<LiquidMenu
  title="Menu"
  items={[
    { value: "home", label: "Home" },
    { value: "photos", label: "Photos" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
      `import { LiquidMenu } from "../apple-clear/LiquidMenu";

<LiquidMenu
  title="菜单"
  items={[
    { value: "home", label: "主页" },
    { value: "photos", label: "照片" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
    ),
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "built-in four items", description: "One or more `{ value, label }` entries. Travel needs two." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the menu." },
      PROP_THEME,
      { ...PROP_OPTICS, description: "Displacement when supported; baseline otherwise." },
      { name: "scene", type: "(ctx) => ReactNode", defaultValue: "LiquidMenuBackdrop", description: "World replica. Keep it blur or solid." },
      { name: "host", type: `"standalone" | "nested"`, defaultValue: `"standalone"`, description: "Nested skips NavigationMenu so an overlay can own open, focus, and dismiss." },
    ],
  },
  "liquid-dropdown": {
    summary: pair(
      "Trigger plus compact glass menu in a Radix portal. Density is smaller than the folder panel. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
      "触发器加紧凑玻璃菜单，放在 Radix 门户里。密度小于文件夹面板。方向键浏览不关闭。指针、Enter 或重选在旅行透镜提交后关闭。",
    ),
    usage: pair(
      `import { LiquidDropdown } from "../apple-clear/LiquidDropdown";

<LiquidDropdown
  title="Menu"
  items={[
    { value: "home", label: "Home" },
    { value: "photos", label: "Photos" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
      `import { LiquidDropdown } from "../apple-clear/LiquidDropdown";

<LiquidDropdown
  title="菜单"
  items={[
    { value: "home", label: "主页" },
    { value: "photos", label: "照片" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
    ),
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "trigger", type: "ReactNode", defaultValue: "selected label", description: "Trigger contents. Defaults to the selected item label." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the menu." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-context-menu": {
    summary: pair(
      "Right-click host. Action list in a glass card. Click runs the command and closes. No selected row, no traveling lens.",
      "右键宿主。玻璃卡片里的动作列表。点击执行并关闭。没有选中行，没有旅行透镜。",
    ),
    usage: pair(
      `<LiquidContextMenu onValueChange={setValue}>
  Right-click here
</LiquidContextMenu>`,
      `<LiquidContextMenu onValueChange={setValue}>
  在此区域右键
</LiquidContextMenu>`,
    ),
    props: [
      { name: "items", type: "LiquidContextMenuAction[]", defaultValue: "Cut / Copy / Paste", description: "`{ value, label }` actions. Click runs one and closes." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires when an action is chosen. The menu then closes." },
      { name: "children", type: "ReactNode", defaultValue: `"在此区域右键"`, description: "The surface that accepts the context menu." },
      { name: "title", type: "string", defaultValue: `"操作"`, description: "Accessible name of the menu." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-select": {
    summary: pair(
      "Form-like trigger that shows the selected label or placeholder. Compact glass panel with the same liquid pop as LiquidDropdown. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
      "表单式触发器，显示选中标签或占位。紧凑玻璃面板，弹出与 LiquidDropdown 相同。方向键浏览不关闭。指针、Enter 或重选在旅行透镜提交后关闭。",
    ),
    usage: pair(
      `<LiquidSelect items={items} value={value} onValueChange={setValue} placeholder="Select…" />`,
      `<LiquidSelect items={items} value={value} onValueChange={setValue} placeholder="选择…" />`,
    ),
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value. Empty shows the placeholder." },
      { name: "defaultValue", type: "string", defaultValue: "empty", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "placeholder", type: "string", defaultValue: `"选择…"`, description: "Trigger label when nothing is selected." },
      { name: "title", type: "string", defaultValue: `"选择"`, description: "Accessible name of the list." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-popover": {
    summary: pair(
      "Click trigger. Glass bubble card for arbitrary children. Stays open until Escape, outside click, or the trigger.",
      "点击触发。玻璃气泡卡片，可装任意内容。Escape、点外侧或再点触发器关闭。",
    ),
    usage: pair(
      `<LiquidPopover trigger="Network" title="Network">
  <h3>Office Wi-Fi</h3>
  <p>Connected</p>
</LiquidPopover>`,
      `<LiquidPopover trigger="网络" title="网络">
  <h3>办公室 Wi-Fi</h3>
  <p>已连接</p>
</LiquidPopover>`,
    ),
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"卡片"`, description: "Accessible name of the card." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", defaultValue: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the bubble opens or closes." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-dialog": {
    summary: pair(
      "Modal overlay plus centered glass card for arbitrary children. Overlay and Escape dismiss immediately.",
      "模态遮罩加居中玻璃卡片，可装任意内容。点遮罩和 Escape 立刻关闭。",
    ),
    usage: pair(
      `<LiquidDialog trigger="Delete album" title="Delete album">
  <h3>Delete “Travel”?</h3>
  <p>Photos move to Recently Deleted.</p>
</LiquidDialog>`,
      `<LiquidDialog trigger="删除相册" title="删除相册">
  <h3>删除「旅行」？</h3>
  <p>照片会移到最近删除。</p>
</LiquidDialog>`,
    ),
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开对话框"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"对话框"`, description: "Accessible name of the dialog." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", defaultValue: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the dialog opens or closes." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-menubar": {
    summary: pair(
      "Command bar. Thin File / Edit titles open an action list. Click runs the command and closes. No selected row, no traveling lens.",
      "命令条。薄「文件 / 编辑」标题打开动作列表。点击执行并关闭。没有选中行，没有旅行透镜。",
    ),
    usage: pair(
      `<LiquidMenubar groups={groups} onValueChange={(group, value) => {}} />`,
      `<LiquidMenubar groups={groups} onValueChange={(group, value) => {}} />`,
    ),
    props: [
      { name: "groups", type: "LiquidMenubarGroup[]", defaultValue: "File / Edit demo", description: "`{ value, label, items }` command titles and actions." },
      { name: "onValueChange", type: "(group: string, value: string) => void", defaultValue: "—", description: "Fires when an action is chosen. The menu then closes." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-button": {
    summary: pair(
      "Glass capsule button. Press squash matches overlay triggers. Default, secondary, and destructive.",
      "玻璃胶囊按钮。按下挤扁与覆盖层触发器相同。默认、次要、危险三种。",
    ),
    usage: pair(
      `<LiquidButton theme="dark" onClick={onCreate}>Create</LiquidButton>
<LiquidButton variant="secondary">Cancel</LiquidButton>
<LiquidButton variant="destructive">Delete</LiquidButton>`,
      `<LiquidButton theme="dark" onClick={onCreate}>新建</LiquidButton>
<LiquidButton variant="secondary">取消</LiquidButton>
<LiquidButton variant="destructive">删除</LiquidButton>`,
    ),
    props: [
      { name: "variant", type: `"default" | "secondary" | "destructive" | "ghost"`, defaultValue: `"default"`, description: "Fill and role." },
      { name: "size", type: `"default" | "sm" | "icon"`, defaultValue: `"default"`, description: "Height. sm is table actions." },
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Button label." },
      PROP_THEME,
    ],
  },
  "liquid-input": {
    summary: pair(
      "Glass text field with a label. Same fill and type as overlay triggers. Label is LiquidLabel.",
      "带标签的玻璃输入框。填色和字色与覆盖层触发器相同。标签是 LiquidLabel。",
    ),
    usage: pair(
      `<LiquidLabel htmlFor="account">Account</LiquidLabel>
<LiquidInput id="account" value={value} onChange={onChange} />`,
      `<LiquidLabel htmlFor="account">账号</LiquidLabel>
<LiquidInput id="account" value={value} onChange={onChange} />`,
    ),
    props: [
      { name: "id", type: "string", defaultValue: "—", description: "Associates the field with LiquidLabel." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Native input value." },
      { name: "placeholder", type: "string", defaultValue: "—", description: "Empty-field hint." },
      PROP_THEME,
    ],
  },
  "liquid-textarea": {
    summary: pair(
      "Glass multiline field. Same material as LiquidInput. Used for descriptions.",
      "玻璃多行输入。材质与 LiquidInput 相同。用于描述。",
    ),
    usage: pair(
      `<LiquidLabel htmlFor="desc">Description</LiquidLabel>
<LiquidTextarea id="desc" rows={3} />`,
      `<LiquidLabel htmlFor="desc">描述</LiquidLabel>
<LiquidTextarea id="desc" rows={3} />`,
    ),
    props: [
      { name: "id", type: "string", defaultValue: "—", description: "Associates the field with LiquidLabel." },
      { name: "rows", type: "number", defaultValue: "3", description: "Visible text rows." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Native textarea value." },
      PROP_THEME,
    ],
  },
  "liquid-checkbox": {
    summary: pair(
      "Glass checkbox. Radix checked state. Click toggles. No traveling lens.",
      "玻璃复选框。Radix 选中态。点击切换。没有旅行透镜。",
    ),
    usage: pair(
      `<LiquidCheckbox checked={on} onCheckedChange={setOn}>Game 10001</LiquidCheckbox>`,
      `<LiquidCheckbox checked={on} onCheckedChange={setOn}>游戏 10001</LiquidCheckbox>`,
    ),
    props: [
      { name: "checked", type: "boolean", defaultValue: "uncontrolled", description: "Controlled checked state." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", defaultValue: "—", description: "Fires when the box toggles." },
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Label beside the box." },
      PROP_THEME,
    ],
  },
  "liquid-radio": {
    summary: pair(
      "Glass radio group. One value at a time. Used for account status filters.",
      "玻璃单选组。一次一个值。用于账号状态筛选。",
    ),
    usage: pair(
      `<LiquidRadioGroup value={status} onValueChange={setStatus} options={options} />`,
      `<LiquidRadioGroup value={status} onValueChange={setStatus} options={options} />`,
    ),
    props: [
      { name: "options", type: "LiquidRadioOption[]", defaultValue: "—", description: "`{ value, label }` choices." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires when a radio is chosen." },
      PROP_THEME,
    ],
  },
  "liquid-alert": {
    summary: pair(
      "Confirm overlay plus centered glass card. Cancel and action close it. Overlay does not dismiss like Dialog.",
      "确认遮罩加居中玻璃卡片。取消和动作关闭。遮罩不会像 Dialog 那样点即关。",
    ),
    usage: pair(
      `<LiquidAlertDialog trigger="Disable account" title="Disable account">
  <p>This account cannot sign in.</p>
</LiquidAlertDialog>`,
      `<LiquidAlertDialog trigger="禁用账号" title="禁用账号">
  <p>此账号将无法登录。</p>
</LiquidAlertDialog>`,
    ),
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Put Cancel / Action inside." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开确认"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"确认"`, description: "Accessible name of the confirm card." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the confirm opens or closes." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-sheet": {
    summary: pair(
      "Side glass card for details. Overlay and Escape dismiss. Slides in from the right.",
      "侧栏玻璃卡片，用来看详情。点遮罩和 Escape 关闭。从右侧滑入。",
    ),
    usage: pair(
      `<LiquidSheet trigger="Account" title="Account">
  <dl><dt>ID</dt><dd>1</dd></dl>
</LiquidSheet>`,
      `<LiquidSheet trigger="账号" title="账号详情">
  <dl><dt>ID</dt><dd>1</dd></dl>
</LiquidSheet>`,
    ),
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开详情"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"详情"`, description: "Accessible name of the sheet." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the sheet opens or closes." },
      { name: "container", type: "HTMLElement | null", defaultValue: "document.body", description: "Portal mount. Pass the stage to dock the sheet inside it." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-card": {
    summary: pair(
      "Standing glass card. Whole-surface refraction, no traveling lens. Same shell as Popover and Dialog.",
      "常驻玻璃卡片。整面折射，没有旅行透镜。外壳与气泡、对话框相同。",
    ),
    usage: pair(
      `<LiquidGlassCard title="Sign in" theme="dark">
  <h3>BBG Admin</h3>
</LiquidGlassCard>`,
      `<LiquidGlassCard title="登录" theme="dark">
  <h3>BBG Admin</h3>
</LiquidGlassCard>`,
    ),
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "title", type: "string", defaultValue: `"卡片"`, description: "Accessible name of the card." },
      { name: "scene", type: "(ctx) => ReactNode", defaultValue: "LiquidMenuBackdrop", description: "World replica. Keep it blur or solid." },
      PROP_THEME,
      PROP_OPTICS,
    ],
  },
  "liquid-table": {
    summary: pair(
      "Data table on a glass card. Name opens a sheet. Status pills, row actions, and pagination sit in the same panel.",
      "玻璃卡片上的数据表。点名称打开侧栏。状态胶囊、行操作和分页在同一块面板里。",
    ),
    usage: pair(
      `<LiquidTable columns={columns} rows={rows} getRowKey={(row) => row.id} />`,
      `<LiquidTable columns={columns} rows={rows} getRowKey={(row) => row.id} />`,
    ),
    props: [
      { name: "columns", type: "LiquidTableColumn[]", defaultValue: "—", description: "`{ key, header, render }`." },
      { name: "rows", type: "T[]", defaultValue: "—", description: "Current page rows." },
      { name: "getRowKey", type: "(row: T) => string", defaultValue: "—", description: "Stable row id." },
      { name: "empty", type: "ReactNode", defaultValue: `"没有匹配的记录。"`, description: "Empty copy." },
      PROP_THEME,
    ],
  },
  "liquid-pagination": {
    summary: pair(
      "Frontend pager. Ellipsis after 7 pages. Previous / next disable at the ends.",
      "前端分页。超过 7 页出现省略号。首尾页禁用上一页 / 下一页。",
    ),
    usage: pair(
      `const pagination = useLiquidPagination(items, 5);
<LiquidPagination pagination={pagination} />`,
      `const pagination = useLiquidPagination(items, 5);
<LiquidPagination pagination={pagination} />`,
    ),
    props: [
      { name: "pagination", type: "LiquidPaginationState", defaultValue: "—", description: "From `useLiquidPagination`." },
      { name: "summary", type: "string", defaultValue: "count copy", description: "Left-side count text." },
      PROP_THEME,
    ],
  },
  "liquid-pill": {
    summary: pair(
      "Status chip. positive / pending / disabled / muted map ENABLED, PRE_ONLINE, DISABLED, unknown.",
      "状态胶囊。positive / pending / disabled / muted 对应启用、预上线、禁用、未知。",
    ),
    usage: pair(
      `<LiquidPill tone={statusTone(status)}>{status}</LiquidPill>`,
      `<LiquidPill tone={statusTone(status)}>{status}</LiquidPill>`,
    ),
    props: [
      { name: "tone", type: `"positive" | "pending" | "disabled" | "muted"`, defaultValue: `"muted"`, description: "Color role." },
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Chip label." },
      PROP_THEME,
    ],
  },
  "liquid-tree": {
    summary: pair(
      "Nested menu tree. Expand, select a row, optional function checkboxes. Same pattern as menu-function management.",
      "嵌套菜单树。展开、选中一行，可选功能复选。对标菜单功能管理。",
    ),
    usage: pair(
      `<LiquidTree nodes={nodes} selectedId={id} collapsedIds={collapsed} onSelect={setId} onToggle={toggle} />`,
      `<LiquidTree nodes={nodes} selectedId={id} collapsedIds={collapsed} onSelect={setId} onToggle={toggle} />`,
    ),
    props: [
      { name: "nodes", type: "LiquidTreeNode[]", defaultValue: "—", description: "`{ id, label, children, functions }`." },
      { name: "selectedId", type: "string", defaultValue: "—", description: "Selected row." },
      { name: "collapsedIds", type: "Set<string>", defaultValue: "—", description: "Collapsed branch ids." },
      { name: "checkedIds", type: "string[]", defaultValue: "—", description: "Checked function ids." },
      PROP_THEME,
    ],
  },
  "liquid-toolbar": {
    summary: pair(
      "Search field with query and reset. Optional filter children, same as module toolbars.",
      "查询框加查询 / 重置。可挂筛选子节点，对标模块工具栏。",
    ),
    usage: pair(
      `<LiquidToolbar query={q} setQuery={setQ} onSearch={search} onReset={reset} placeholder="Search" />`,
      `<LiquidToolbar query={q} setQuery={setQ} onSearch={search} onReset={reset} placeholder="搜索" />`,
    ),
    props: [
      { name: "query", type: "string", defaultValue: "—", description: "Draft search text." },
      { name: "onSearch", type: "() => void", defaultValue: "—", description: "Commit search." },
      { name: "onReset", type: "() => void", defaultValue: "—", description: "Clear draft and filters." },
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Optional filters." },
      PROP_THEME,
    ],
  },
  "liquid-native-select": {
    summary: pair(
      "Native glass select for forms. Single or multiple. This is what bbg-admin uses inside dialogs, not Radix Select.",
      "表单里的原生玻璃选择。单选或多选。bbg-admin 对话框用的是这个，不是 Radix Select。",
    ),
    usage: pair(
      `<LiquidNativeSelect value={type} onChange={onChange}>
  <option value="SYSTEM">SYSTEM</option>
</LiquidNativeSelect>`,
      `<LiquidNativeSelect value={type} onChange={onChange}>
  <option value="SYSTEM">SYSTEM</option>
</LiquidNativeSelect>`,
    ),
    props: [
      { name: "multiple", type: "boolean", defaultValue: "false", description: "Native multi-select." },
      { name: "value", type: "string | string[]", defaultValue: "uncontrolled", description: "Native select value." },
      { name: "children", type: "ReactNode", defaultValue: "—", description: "`option` nodes." },
      PROP_THEME,
    ],
  },
};

export const UI_CATALOG_SLUGS = NAV.map((item) => item.slug);

const DEFAULT_VALUE_EN: Record<string, string> = {
  '"菜单"': '"Menu"',
  '"选择…"': '"Select…"',
  '"选择"': '"Select"',
  '"在此区域右键"': '"Right-click here"',
  '"操作"': '"Actions"',
  '"打开"': '"Open"',
  '"卡片"': '"Card"',
  '"打开对话框"': '"Open dialog"',
  '"对话框"': '"Dialog"',
  '"打开确认"': '"Open confirm"',
  '"确认"': '"Confirm"',
  '"打开详情"': '"Open details"',
  '"详情"': '"Details"',
};

export function getUiCatalogCopy(slug: string, locale: UiLocale): UiCatalogCopy | undefined {
  const nav = NAV.find((item) => item.slug === slug);
  const entry = CATALOG[slug];
  if (!nav || !entry) return undefined;
  return {
    slug,
    nav: chrome(locale, nav.en, nav.zh),
    title: chrome(locale, nav.en, nav.zh),
    summary: locale === "en" ? entry.summary.en : entry.summary.zh,
    usage: locale === "en" ? entry.usage.en : entry.usage.zh,
    props: entry.props.map((prop) => ({
      ...prop,
      defaultValue: locale === "en" ? (DEFAULT_VALUE_EN[prop.defaultValue] ?? prop.defaultValue) : prop.defaultValue,
    })),
  };
}

export function getNavItems(locale: UiLocale) {
  return NAV.map((item) => ({
    value: item.slug,
    label: chrome(locale, item.en, item.zh),
  }));
}

export function uiChrome(locale: UiLocale) {
  return {
    brand: chrome(locale, "Liquid Glass", "液态玻璃"),
    usage: chrome(locale, "Usage", "用法"),
    props: chrome(locale, "Props", "属性"),
    name: chrome(locale, "Name", "名称"),
    type: chrome(locale, "Type", "类型"),
    defaultValue: chrome(locale, "Default", "默认"),
    description: chrome(locale, "Description", "说明"),
    probe: locale === "en" ? "Glyphs" : "文字底",
    sceneGroup: locale === "en" ? "Preview background" : "Preview background 预览背景",
    scenes: {
      sky: locale === "en" ? "Sky" : "天空",
      dusk: locale === "en" ? "Dusk" : "黄昏",
      meadow: locale === "en" ? "Meadow" : "草地",
      graphite: locale === "en" ? "Graphite" : "石墨",
    },
    themeToLight: locale === "en" ? "Switch to light" : "切换亮色",
    themeToDark: locale === "en" ? "Switch to dark" : "切换暗色",
    localeToEn: locale === "en" ? "Switch to English" : "切换为英文",
    localeToZh: locale === "en" ? "Switch to Chinese" : "切换为中文",
  };
}

export const PREVIEW_MENU_ITEMS = {
  en: [
    { value: "home", label: "Home" },
    { value: "photos", label: "Photos" },
    { value: "messages", label: "Messages" },
    { value: "settings", label: "Settings" },
  ],
  zh: [
    { value: "home", label: "主页" },
    { value: "photos", label: "照片" },
    { value: "messages", label: "信息" },
    { value: "settings", label: "设置" },
  ],
} as const;

export const PREVIEW_COPY = {
  menuTitle: pair("Menu", "菜单"),
  selectTitle: pair("Select", "选择"),
  selectPlaceholder: pair("Select…", "选择…"),
  contextTitle: pair("Actions", "操作"),
  contextSurface: pair("Right-click here", "在此区域右键"),
  contextItems: {
    en: [
      { value: "cut", label: "Cut" },
      { value: "copy", label: "Copy" },
      { value: "paste", label: "Paste" },
    ],
    zh: [
      { value: "cut", label: "剪切" },
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴" },
    ],
  },
  menubarGroups: {
    en: [
      {
        value: "file",
        label: "File",
        items: [
          { value: "new", label: "New" },
          { value: "open", label: "Open" },
          { value: "save", label: "Save" },
        ],
      },
      {
        value: "edit",
        label: "Edit",
        items: [
          { value: "cut", label: "Cut" },
          { value: "copy", label: "Copy" },
          { value: "paste", label: "Paste" },
        ],
      },
    ],
    zh: [
      {
        value: "file",
        label: "文件",
        items: [
          { value: "new", label: "新建" },
          { value: "open", label: "打开" },
          { value: "save", label: "保存" },
        ],
      },
      {
        value: "edit",
        label: "编辑",
        items: [
          { value: "cut", label: "剪切" },
          { value: "copy", label: "复制" },
          { value: "paste", label: "粘贴" },
        ],
      },
    ],
  },
  popover: {
    trigger: pair("Network", "网络"),
    title: pair("Network", "网络"),
    kicker: pair("Status", "状态"),
    name: pair("Office Wi-Fi", "办公室 Wi-Fi"),
    connected: pair("Connected · 5 GHz", "已连接 · 5 GHz"),
    disconnected: pair("Not connected", "未连接"),
    disconnect: pair("Disconnect", "断开"),
    connect: pair("Connect", "连接"),
    stageOn: pair("Connected", "已连接"),
    stageOff: pair("Not connected", "未连接"),
  },
  dialog: {
    trigger: pair("Delete album", "删除相册"),
    title: pair("Delete album", "删除相册"),
    kicker: pair("Confirm", "确认"),
    heading: pair("Delete “Travel”?", "删除「旅行」？"),
    copy: pair("Photos move to Recently Deleted and clear after 30 days.", "照片会移到最近删除，30 天后清除。"),
    cancel: pair("Cancel", "取消"),
    remove: pair("Delete", "删除"),
    deleted: pair("Deleted", "已删除"),
    kept: pair("Not deleted", "未删除"),
  },
  button: {
    primary: pair("Create", "新建"),
    secondary: pair("Reset", "重置"),
    destructive: pair("Delete", "删除"),
    small: pair("Query", "查询"),
    ghost: pair("Edit", "编辑"),
  },
  input: {
    account: pair("Account", "账号"),
    email: pair("Email", "邮箱"),
    placeholder: pair("name@bb.game", "name@bb.game"),
    hint: pair("Region code cannot change after create.", "区域编码创建后不可修改。"),
    code: pair("Region code", "区域编码"),
    error: pair("Code is required.", "编码必填。"),
  },
  textarea: {
    label: pair("Description", "描述"),
    placeholder: pair("Optional note", "可选说明"),
    empty: pair("(empty)", "（空）"),
  },
  checkbox: {
    game: pair("Game", "游戏"),
    empty: pair("(none)", "（无）"),
  },
  radio: {
    all: pair("All", "全部"),
    enabled: pair("Enabled", "启用"),
    disabled: pair("Disabled", "禁用"),
  },
  alert: {
    trigger: pair("Disable account", "禁用账号"),
    title: pair("Disable account", "禁用账号"),
    kicker: pair("Confirm", "确认"),
    heading: pair("Disable admin?", "禁用 admin？"),
    copy: pair("This account cannot sign in until it is enabled again.", "禁用后此账号无法登录，直到重新启用。"),
    cancel: pair("Cancel", "取消"),
    remove: pair("Disable", "禁用"),
    deleted: pair("Disabled", "已禁用"),
    kept: pair("Enabled", "未禁用"),
  },
  sheet: {
    trigger: pair("Account", "账号"),
    title: pair("Account", "账号详情"),
    account: pair("Account", "账号"),
    name: pair("Name", "姓名"),
    person: pair("Ada Admin", "管理员"),
    email: pair("Email", "邮箱"),
    status: pair("Status", "状态"),
    enabled: pair("Enabled", "启用"),
    open: pair("Open", "已打开"),
    closed: pair("Closed", "已关闭"),
  },
  card: {
    title: pair("Sign in", "登录"),
    kicker: pair("BBG Admin", "BBG Admin"),
    heading: pair("Welcome back", "欢迎回来"),
    copy: pair("Glass card over the stage. No traveling lens.", "舞台上的玻璃卡片。没有旅行透镜。"),
    stage: pair("Card", "卡片"),
  },
  table: {
    title: pair("Regions", "区域"),
    search: pair("Search id, name, or code", "搜索 ID、名称或编码"),
    query: pair("Query", "查询"),
    reset: pair("Reset", "重置"),
    region: pair("Region", "区域名称"),
    code: pair("Code", "区域编码"),
    status: pair("Status", "状态"),
    actions: pair("Actions", "操作"),
    edit: pair("Edit", "编辑"),
    remove: pair("Delete", "删除"),
    empty: pair("No matching regions.", "没有匹配的区域。"),
    prev: pair("Previous", "上一页"),
    next: pair("Next", "下一页"),
  },
  pagination: {
    prev: pair("Previous", "上一页"),
    next: pair("Next", "下一页"),
  },
  pill: {
    stage: pair("Status", "状态"),
  },
  tree: {
    title: pair("Menus", "菜单树"),
    empty: pair("(none)", "（无）"),
  },
  toolbar: {
    search: pair("Search user id, account, or name", "搜索用户 ID、账号或姓名"),
    query: pair("Query", "查询"),
    reset: pair("Reset", "重置"),
    empty: pair("(empty)", "（空）"),
  },
  nativeSelect: {
    role: pair("Role type", "角色类型"),
    admins: pair("Admins", "管理员"),
    hint: pair("Hold to pick more than one.", "按住可选多人。"),
  },
};

export function previewText(locale: UiLocale, value: LocalePair) {
  return locale === "en" ? value.en : value.zh;
}
