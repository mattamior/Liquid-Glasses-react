# V3 系统主题切换决策记录

日期：2026-08-10

状态：本地实现并验证完成；本主题批次未部署、未发布。

## 1. 范围与决策

本记录覆盖 `/v3` 的系统主题跟随与持久化显式主题。它补充而不改写连续世界取样、参考校准或既有发布记录。

- 未存储主题时以 `prefers-color-scheme` 跟随系统，并通过 `useSyncExternalStore` 订阅主题和强制颜色变化。
- 手动主题只接受 `liquid-lab:v3-theme` 中合法的 `dark` / `light`。点击 sparkle 后写入该 key 并在刷新后恢复；不增加 URL 参数、cookie、全局 theme provider 或“返回系统”界面。
- V3 layout 的内联 bootstrap 在 children 前读取该 key，并只在自身写入首帧 marker；SSR 首帧由此 marker 或 CSS media query 决定浅/深色。它不写 React 管理的 `html` / `body` 属性；hydration 后移除 marker 属性，由 root `data-theme` 接管。
- hydration 前使用中性的 ARIA 名称、不输出 `aria-pressed`，并由双图标的 CSS 与 marker/系统媒体条件同源决定 sun/moon，避免首帧视觉与辅助技术语义相反。
- `storage` event 在跨标签页同步合法值；`removeItem`、`clear` 或非法值回到系统。读写 storage 失败时仍保留当前会话状态。
- 不改动 `/v3` 路由、既有 `?chrome=demo` / `?optics=edge` 查询、连续 world sampling、透镜 field、几何或滤镜契约。

## 2. 主题界面与可访问性契约

- 右侧 sparkle 控件成为唯一主题按钮，保留原有 dock 尺寸、原生键盘行为和 focus-visible 轮廓；其动态 `aria-label` 与 `title` 说明下一次切换目标，hydration 后 `aria-pressed` 表示浅色是否已选中。
- 强制颜色模式中按钮 disabled，不写 storage，页面继续采用系统 `Canvas` / `CanvasText`；减少动态时不新增主题动画。
- sun/moon 均保留在 DOM 中且 `aria-hidden`，CSS 只显示与当前系统或已解析主题相符的图标。teal badge 是 9/9 张 V3 参考图中的交互 accent，不是品牌标志或状态指示：深色为 `#28e7d0`，浅色为 `#008D7C`。
- `data-theme` 仅表示持久化显式 override；`data-theme-preference` 和 hydration 后的 `data-resolved-theme` 用于公开状态检查，不扩大到其它路由。

## 3. 视觉系统与改动区域

- [`app/v3/layout.tsx`](../../app/v3/layout.tsx) 在 V3 children 前放置经过合法值校验的内联首帧 bootstrap marker；[`app/v3/page.tsx`](../../app/v3/page.tsx) 增加系统媒体订阅、hydration 状态、持久化 override、跨标签页 storage 同步、marker 移除与可访问主题按钮。订阅和 animation frame 均有 cleanup。
- [`app/v3/v3.css`](../../app/v3/v3.css) 将 V3 的页面、轨道、选中层、lens、caustic、sheen 与控制器颜色收敛为 scoped tokens。浅色 active 文本为 `#101820`；浅色 caustic surface 为 38%，sheen 为 30% / 12%，inner ring / shadow 为 16%。
- 显式 `data-theme="light"` / `data-theme="dark"` 优先于系统媒体规则；无显式 override 时，system-light token 与浅色 token 保持等值。dark token 保留此前已验收的数值。
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 与当前快照覆盖无存储的系统首帧、存储首帧 marker、刷新恢复、跨标签页同步、clear/非法值回到系统、storage 失败会话回退、按钮切换、强制颜色 disabled，以及主题下的导航与 lens 状态。整个主题批次在原有 11 张基础上新增 10 张浅色 PNG，并因 sparkle 改为 sun/moon 更新 6 张深色 full PNG；持久化后续修订本身未再改 PNG。最终为 21 个 assertions/files：12 张 full viewport、9 张 lens crop。

## 4. 验证证据

- `npx playwright test tests/e2e/v3.spec.ts tests/e2e/v3-optics.spec.ts --project=chromium` 通过：无头 Chromium 26/26。
- `npm test` 通过：构建完成，服务端渲染测试 5/5 通过；`npm run lint`、`npm run build` 与 `git diff --check` 均通过。
- 两轮主题视觉审阅均为 Go；深浅主题的静态、拖拽与 Edge 对比均通过。文本、active state、按钮和焦散区域已进行对比度复核。
- 以上是本地 Chromium 与人工审阅证据；主题批次没有使用新的浅色参考图作逐像素保真声明。

## 5. 部署与发布状态

本主题批次未部署、未发布、未推送，也没有修改 Cloudflare Worker、生产绑定、变量、密钥或配额。既有 `/v3` 生产版本及其发布记录保持不变。

## 6. 已知风险、限制与后续工作

- 未提供浅色参考图，因此浅色主题以可读性、材质连续性和当前 V3 几何为准，不宣称与外部产品逐像素高保真。
- Firefox/WebKit 未配置为本批次自动化项目；原生 Safari 尚未完成手动验收。仍需在 Safari 中复核 `prefers-color-scheme`、`forced-colors`、CSS `:has()`、SVG filter 与合成性能。
- 内联 bootstrap 是受信任的常量，当前没有 CSP 配置拦截它；若未来启用严格 `script-src`，必须为该内联脚本配置 nonce 或 hash，否则持久主题首帧会退化为系统主题。可分享主题 URL 仍未实现，若未来加入，必须单独定义它与 storage、系统偏好的优先级和迁移策略。

## 7. 回滚

回滚以本主题实现提交为边界：移除 bootstrap、系统主题订阅、持久化主题状态、主题 token、主题快照和本记录即可恢复先前深色 V3。是否清除 `liquid-lab:v3-theme` 应作为独立迁移决定，避免未来重新启用时意外恢复旧偏好。不要回退连续 world sampling、DPR、fallback、ARIA、Pointer Events 或已发布的生产版本。
