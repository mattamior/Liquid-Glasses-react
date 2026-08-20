export interface UiCatalogProp {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
}

export interface UiCatalogEntry {
  slug: string;
  title: string;
  summary: string;
  props: readonly UiCatalogProp[];
  usage: string;
}

export const UI_CATALOG: readonly UiCatalogEntry[] = [
  {
    slug: "liquid-menu",
    title: "LiquidMenu",
    summary: "Floating vertical menu. Copy the kernel. Put blur or a solid color immediately behind it.",
    usage: `import { LiquidMenu } from "../apple-clear/LiquidMenu";

<LiquidMenu
  title="菜单"
  items={[
    { value: "home", label: "主页" },
    { value: "photos", label: "照片" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "built-in four items", description: "One or more `{ value, label }` entries. Travel needs two." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the menu." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported; baseline otherwise." },
      { name: "scene", type: "(ctx) => ReactNode", defaultValue: "LiquidMenuBackdrop", description: "World replica. Keep it blur or solid." },
      { name: "host", type: `"standalone" | "nested"`, defaultValue: `"standalone"`, description: "Nested skips NavigationMenu so an overlay can own open, focus, and dismiss." },
    ],
  },
  {
    slug: "liquid-dropdown",
    title: "LiquidDropdown",
    summary: "Trigger plus compact glass menu in a Radix portal. Density is smaller than the folder panel. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
    usage: `import { LiquidDropdown } from "../apple-clear/LiquidDropdown";

<LiquidDropdown
  title="菜单"
  items={[
    { value: "home", label: "主页" },
    { value: "photos", label: "照片" },
  ]}
  value={value}
  onValueChange={setValue}
/>`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "trigger", type: "ReactNode", defaultValue: "selected label", description: "Trigger contents. Defaults to the selected item label." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the menu." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-context-menu",
    title: "LiquidContextMenu",
    summary: "Right-click host. Action list in a glass card. Click runs the command and closes. No selected row, no traveling lens.",
    usage: `<LiquidContextMenu onValueChange={setValue}>
  在此区域右键
</LiquidContextMenu>`,
    props: [
      { name: "items", type: "LiquidContextMenuAction[]", defaultValue: "Cut / Copy / Paste", description: "`{ value, label }` actions. Click runs one and closes." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires when an action is chosen. The menu then closes." },
      { name: "children", type: "ReactNode", defaultValue: `"在此区域右键"`, description: "The surface that accepts the context menu." },
      { name: "title", type: "string", defaultValue: `"操作"`, description: "Accessible name of the menu." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-select",
    title: "LiquidSelect",
    summary: "Form-like trigger that shows the selected label or placeholder. Compact glass panel with the same liquid pop as LiquidDropdown. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
    usage: `<LiquidSelect items={items} value={value} onValueChange={setValue} placeholder="选择…" />`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value. Empty shows the placeholder." },
      { name: "defaultValue", type: "string", defaultValue: "empty", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "placeholder", type: "string", defaultValue: `"选择…"`, description: "Trigger label when nothing is selected." },
      { name: "title", type: "string", defaultValue: `"选择"`, description: "Accessible name of the list." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-popover",
    title: "LiquidPopover",
    summary: "Click trigger. Glass bubble card for arbitrary children. Stays open until Escape, outside click, or the trigger. Not a menu.",
    usage: `<LiquidPopover trigger="网络" title="网络">
  <h3>办公室 Wi-Fi</h3>
  <p>已连接</p>
</LiquidPopover>`,
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"卡片"`, description: "Accessible name of the card." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", defaultValue: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the bubble opens or closes." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-dialog",
    title: "LiquidDialog",
    summary: "Modal overlay plus centered glass card for arbitrary children. Overlay and Escape dismiss immediately. Not a menu.",
    usage: `<LiquidDialog trigger="删除相册" title="删除相册">
  <h3>删除「旅行」？</h3>
  <p>照片会移到最近删除。</p>
</LiquidDialog>`,
    props: [
      { name: "children", type: "ReactNode", defaultValue: "—", description: "Card body. Any content; not a LiquidMenu." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开对话框"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"对话框"`, description: "Accessible name of the dialog." },
      { name: "open", type: "boolean", defaultValue: "uncontrolled", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", defaultValue: "false", description: "Initial open state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", defaultValue: "—", description: "Fires when the dialog opens or closes." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-menubar",
    title: "LiquidMenubar",
    summary: "Command bar. Thin File / Edit titles open an action list. Click runs the command and closes. No selected row, no traveling lens.",
    usage: `<LiquidMenubar groups={groups} onValueChange={(group, value) => {}} />`,
    props: [
      { name: "groups", type: "LiquidMenubarGroup[]", defaultValue: "File / Edit demo", description: "`{ value, label, items }` command titles and actions." },
      { name: "onValueChange", type: "(group: string, value: string) => void", defaultValue: "—", description: "Fires when an action is chosen. The menu then closes." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
];

export function getUiCatalogEntry(slug: string) {
  return UI_CATALOG.find((entry) => entry.slug === slug);
}
