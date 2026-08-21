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
};

export function previewText(locale: UiLocale, value: LocalePair) {
  return locale === "en" ? value.en : value.zh;
}
