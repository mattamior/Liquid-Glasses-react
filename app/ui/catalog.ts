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
    summary: "Right-click host. Same glass panel in a Radix portal. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
    usage: `<LiquidContextMenu items={items} value={value} onValueChange={setValue}>
  在此区域右键
</LiquidContextMenu>`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "children", type: "ReactNode", defaultValue: "right-click hint", description: "The surface that accepts the context menu." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the menu." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-select",
    title: "LiquidSelect",
    summary: "Form-like trigger that shows the selected label or placeholder. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
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
    summary: "Click trigger. Arrow keys and pointer commit the travel lens; the panel stays open until Escape, outside click, or the trigger.",
    usage: `<LiquidPopover items={items} value={value} onValueChange={setValue} trigger="打开" />`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Panel stays open." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the panel." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-dialog",
    title: "LiquidDialog",
    summary: "Modal overlay plus centered glass menu. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits. Overlay and Escape dismiss immediately.",
    usage: `<LiquidDialog items={items} value={value} onValueChange={setValue} trigger="打开对话框" />`,
    props: [
      { name: "items", type: "LiquidMenuItem[]", defaultValue: "—", description: "Same `{ value, label }` entries as LiquidMenu." },
      { name: "value", type: "string", defaultValue: "uncontrolled", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", defaultValue: "first item", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes." },
      { name: "trigger", type: "ReactNode", defaultValue: `"打开对话框"`, description: "Trigger contents." },
      { name: "title", type: "string", defaultValue: `"菜单"`, description: "Accessible name of the dialog." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
  {
    slug: "liquid-menubar",
    title: "LiquidMenubar",
    summary: "Horizontal trigger row. Each trigger opens a glass menu. Arrow keys browse without dismissing. Pointer, Enter, or reselect closes after the travel lens commits.",
    usage: `<LiquidMenubar groups={groups} onValueChange={(group, value) => {}} />`,
    props: [
      { name: "groups", type: "LiquidMenubarGroup[]", defaultValue: "File / Edit demo", description: "`{ value, label, items }` per trigger." },
      { name: "onValueChange", type: "(group: string, value: string) => void", defaultValue: "—", description: "Fires after the travel lens fades. Pointer or Enter then closes that menu." },
      { name: "theme", type: `"light" | "dark"`, defaultValue: `"light"`, description: "Clear material theme." },
      { name: "optics", type: `"enhanced" | "baseline"`, defaultValue: `"enhanced"`, description: "Displacement when supported." },
    ],
  },
];

export function getUiCatalogEntry(slug: string) {
  return UI_CATALOG.find((entry) => entry.slug === slug);
}
