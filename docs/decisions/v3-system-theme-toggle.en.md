# V3 System Theme Toggle Decision Record（系统主题切换决策记录）

Date: 2026-08-10

Status: released to production（已生产发布）; implementation commit `6fc3897` maps to Cloudflare Worker version `590a19bb-8b64-4053-af13-a1b0f54fb387`, serving 100% of traffic.

## 1. Scope and Decision（范围与决策）

This record covers system-theme following and persisted explicit themes（持久化显式主题） for `/v3`. It supplements, rather than rewrites, the continuous-world-sampling, reference-calibration, or earlier release records.

- With no stored theme, the default follows `prefers-color-scheme`（首选颜色方案） and uses `useSyncExternalStore`（外部状态订阅） for theme and forced-colors changes.
- A manual theme accepts only valid `dark` / `light` values from `liquid-lab:v3-theme`. The sparkle button writes that key and restores it after reload; no URL parameter, cookie, global theme provider（全局主题提供器）, or return-to-system UI is added.
- The V3 layout inline bootstrap（内联启动脚本） reads that key before children and writes a first-paint marker（首帧标记） only on itself. The SSR first frame uses that marker or a CSS media query（媒体查询） for light or dark. It does not write React-managed `html` / `body` attributes; after hydration（客户端接管）, its marker attribute is removed and root `data-theme` takes over.
- Before hydration, ARIA is neutral and omits `aria-pressed`; twin icons and CSS resolve sun or moon from the same marker/system media condition, avoiding opposite visual and assistive-technology semantics.
- The `storage` event（存储事件） synchronizes valid values across tabs. `removeItem`, `clear`, or an invalid value returns to system. A storage read/write failure still keeps the current session state.
- The `/v3` route, existing `?chrome=demo` / `?optics=edge` queries, continuous world sampling, lens field, geometry, and filter contracts are unchanged.

## 2. Theme Surface and Accessibility Contract（主题界面与可访问性契约）

- The right sparkle control is the sole theme button. It preserves dock dimensions, native keyboard behavior, and the focus-visible outline. Its dynamic `aria-label` and `title` describe the next toggle target; after hydration, `aria-pressed` states whether light is selected.
- In forced-colors（强制颜色）, the button is disabled, does not write storage, and the page keeps system `Canvas` / `CanvasText`; reduced motion adds no theme animation.
- Sun and moon remain in the DOM and are `aria-hidden`; CSS displays only the icon matching the current system or resolved theme. The teal badge is the interaction accent from the 9/9 V3 references, not brand artwork or a status indicator: `#28e7d0` in dark and `#008D7C` in light.
- `data-theme` represents only a persisted explicit override; `data-theme-preference` and the post-hydration `data-resolved-theme` support public-state checks without expanding to other routes.

## 3. Visual System and Changed Areas（视觉系统与改动区域）

- [`app/v3/layout.tsx`](../../app/v3/layout.tsx) places an inline first-paint bootstrap marker with value validation before V3 children; [`app/v3/page.tsx`](../../app/v3/page.tsx) adds system-media subscriptions, hydration state, persisted override, cross-tab storage synchronization（跨标签同步）, marker removal, and the accessible theme button. Subscriptions and animation frames have cleanup.
- [`app/v3/v3.css`](../../app/v3/v3.css) consolidates V3 page, rail, selection, lens, caustic（焦散）, sheen（光泽）, and control colors into scoped tokens. Light active text is `#101820`; light caustic surface is 38%, sheen is 30% / 12%, and inner ring / shadow are 16%.
- Explicit `data-theme="light"` / `data-theme="dark"` takes priority over system media rules. Without an explicit override, system-light tokens equal the light tokens. Dark tokens retain their previously accepted values.
- [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) and current snapshots cover the storage-free system first frame, stored first-paint marker, reload restore, cross-tab synchronization, clear/invalid return to system, storage-failure session fallback（会话回退）, button toggle, forced-colors disabled state, and navigation/lens states under themes. Across the full theme batch, 10 light PNGs were added to the prior 11, and 6 dark full PNGs were updated when sparkle became sun/moon; the later persistence revision（持久化后续修订） made no further PNG change. The final total is 21 assertions/files: 12 full viewport and 9 lens crops.

## 4. Verification Evidence（验证证据）

- `npx playwright test tests/e2e/v3.spec.ts tests/e2e/v3-optics.spec.ts --project=chromium` passed: 26/26 headless Chromium tests.
- `npm test` passed: the build completed and 5/5 server-rendered tests passed; `npm run lint`, `npm run build`, and `git diff --check` also passed.
- Two theme visual audits were Go. Static, drag, and Edge comparisons passed in both themes. Contrast was reviewed for text, active state, control, and caustic areas.
- This is local Chromium and manual-review evidence. The theme batch makes no pixel-fidelity claim（逐像素保真声明） against a new light reference image.

## 5. Deployment and Release Status（部署与发布状态）

On 2026-08-10, implementation commit `6fc3897` was released to Cloudflare Worker `liquid-lab-optics-demo`. With Wrangler `4.92.0`, build, dry-run（预演）, and the production deploy（生产发布） all completed with exit 0. The dry run produced 8 modules and 40 assets; the production release uploaded 6 modified/new assets, reused 25 assets, and reported `18ms` Worker startup（Worker 启动）.

New version `590a19bb-8b64-4053-af13-a1b0f54fb387` serves 100% of traffic. The custom URL（自定义 URL） [`https://liquid.hkooii.com/v3`](https://liquid.hkooii.com/v3) and workers.dev URL [`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3) both returned 200 HTML. Real production smoke checks（生产冒烟检查） covered system light/dark, persisted reload, cross-tab synchronization（跨标签同步）, clear-to-system, opposite-system prepaint marker removal, forced-colors, demo chrome, real Edge drag/release, and zero console errors.

## 6. Known Risks, Limits, and Follow-Up（已知风险、限制与后续工作）

- No light reference images were supplied. The light theme is judged by legibility（可读性）, material continuity（材质连续性）, and current V3 geometry; it does not claim external-product pixel fidelity.
- Firefox/WebKit are not configured as automation projects for this batch, and native Safari has not received manual acceptance. Safari still needs review of `prefers-color-scheme`, `forced-colors`, CSS `:has()`, SVG filters, and compositing（合成） performance.
- The production-smoke CLI did not independently subscribe to `pageerror`; production did not precisely compare geometry before and after a theme change, although local E2E 26/26 covers that invariant（不变量）. The lack of a light reference remains a limit.
- The inline bootstrap is a trusted constant and the current project configuration has no CSP blocking it. If strict（严格） `script-src` is added later, this inline script needs a nonce or hash; otherwise the persisted-theme first frame falls back to system theme. A shareable theme URL is still not implemented; any future version must separately define priority and migration strategy（迁移策略） against storage and system preference.

## 7. Rollback（回滚）

The production rollback target（生产回滚目标） is the prior 100%-traffic version `3f2aff04-1693-4231-aee0-d7c757d7536d`; the exact command is `npx wrangler rollback 3f2aff04-1693-4231-aee0-d7c757d7536d --name liquid-lab-optics-demo`. Code rollback remains at the theme-implementation commit boundary: remove the bootstrap, system-theme subscriptions, persisted-theme state, theme tokens, theme snapshots, and this record to restore the earlier dark V3. Clearing `liquid-lab:v3-theme` should be a separate migration decision, so a future re-enable does not unexpectedly restore an old preference. Do not roll back continuous world sampling, DPR, fallback, ARIA, Pointer Events, or the released production version.
