# V2 Admin Template Enhancement Decision Record（V2 后台模板增强决策记录）

Date: 2026-08-12

Status: released to production（已生产发布） as Cloudflare Worker `liquid-lab-optics-demo` version `58a41f02-7a84-4499-9ce1-dd032b99c3b2`, serving 100% of traffic.

## 1. Scope and Decision（范围与决策）

This batch strengthens `/v2` as the default admin-template（后台模板） reference. It adopts the reliable interaction lifecycle（交互生命周期）, optical calculation structure, capability fallback（能力降级）, theme persistence（主题持久化）, and regression coverage（回归覆盖） proven by V3 while preserving V2's vertical layout and explainable controls.

- `/` still redirects to `/v2`; the route, Liquid Lab identity, vertical sidebar, content cards, menu identifiers（菜单标识） and labels, Baseline/Enhanced control, and single `aria-current` contract remain unchanged.
- V3's horizontal dock, elliptical field（椭圆光场）, continuous-world transform（连续世界变换）, and motion-coupled optics（运动耦合光学） remain out of scope（超出范围）.
- SSR（服务端渲染） still begins with the light theme, expanded sidebar（展开侧栏）, and Baseline optics. The explicit theme preference（显式主题偏好） accepts only `light` or `dark` under `liquid-lab:v2-theme`; it does not add an automatic system-theme mode.

## 2. Delivered Result and Changed Areas（交付结果与改动区域）

- [`app/v2/page.tsx`](../../app/v2/page.tsx) now gives primary mouse, touch, and pen input one Pointer Events lifecycle（指针事件生命周期） with a movement threshold greater than `5px`, pointer capture（指针捕获）, nearest-item preview, final-position flushing（最终位置刷新）, and centralized cancellation cleanup（集中取消清理）. Pointer movement is coalesced（合并） through `requestAnimationFrame`, and click travel keeps the existing `680ms` display plus `160ms` fade timing.
- [`app/v2/lens-optics.ts`](../../app/v2/lens-optics.ts) contains the pure capsule SDF（胶囊形有向距离场）, optical parameters（光学参数）, raster scaling（栅格缩放）, and displacement-field generation（位移场生成）. Raster density（栅格密度） uses `clamp(ceil(devicePixelRatio), 1, 2)` and rebuilds only when a field dependency（场依赖） changes.
- [`app/v2/layout.tsx`](../../app/v2/layout.tsx), [`app/layout.tsx`](../../app/layout.tsx), and [`app/v2/v2.css`](../../app/v2/v2.css) provide validated（已校验） first-paint theme bootstrap（首屏主题引导）, hydration-safe markup（安全客户端接管标记）, persisted manual theme selection（持久化手动主题选择）, cross-tab synchronization（跨标签页同步）, focus treatment（焦点样式）, and forced-colors behavior（强制颜色行为）.
- [`tests/rendered-html.test.mjs`](../../tests/rendered-html.test.mjs), [`tests/e2e/v2.spec.ts`](../../tests/e2e/v2.spec.ts), [`tests/e2e/v2-optics.spec.ts`](../../tests/e2e/v2-optics.spec.ts), and the three Darwin Chromium snapshots cover the server-rendered contract（服务端渲染契约）, interaction behavior, optical helpers（光学辅助函数）, fallback, and current visual baseline（视觉基线）.

## 3. Public Surface and Compatibility Contract（公开界面与兼容契约）

- Existing V2 routes, menu IDs and labels, `data-theme`, `data-sidebar`, `data-optics-tier`, `data-glass-*`, and unique `aria-current` semantics（语义） remain compatible.
- Only a primary pointer is accepted, and mouse interaction requires the left button. Right-click and non-primary pointers do not start a navigation session.
- A pointer move beyond `5px` enters drag preview; releasing flushes the latest position, snaps to the nearest menu item, and commits once. Cancellation, lost capture, resize, page visibility changes, relevant media-query changes（相关媒体查询变化）, or a superseding interaction（后发交互） remove transient state（暂态） and prevent a stale asynchronous commit（过期异步提交）.
- Compact layouts, reduced motion, and forced colors continue to choose direct or simplified behavior. Navigation and semantic selection（语义选中） remain available when the optical enhancement cannot run.

## 4. Interaction, Optics, Theme, and Fallback（交互、光学、主题与降级）

- Enhanced optics retain V2's rounded vertical capsule and controlled replica（可控副本）. The implementation computes in CSS pixels, generates the backing field（底层场） at an adaptive（自适应） `1×` or `2×` raster density, and caps high-density screens（高密度屏幕） at `2×`.
- Enhanced mode requires both Canvas 2D and SVG filter capability detection（能力检测）. If either capability is unavailable, V2 skips the misleading optical lens and performs a static commit; Baseline retains its lightweight temporary plate（临时板层）.
- The manual theme defaults to `light`, validates（校验） stored values before use, persists valid changes（持久化合法修改）, restores them on reload, and reacts to valid `storage` events from other tabs. Invalid data or unavailable storage falls back to `light` without changing the public route.
- The root document suppresses（抑制） only the expected hydration mismatch（客户端接管差异） caused by the pre-hydration theme bootstrap. Forced-colors mode retains visible focus and readable static selection rather than depending on refraction（折射） or color alone.

## 5. Verification Evidence（验证证据）

| Check | Result |
| --- | --- |
| V2-directed Playwright（V2 定向浏览器测试） | Passed, `14/14` in headless Darwin Chromium in `24.8s`; three visual snapshots passed. |
| SSR / render tests（服务端渲染测试） | `npm test` passed, `6/6`; TAP duration was `193.835ms` and command duration was `2.9s`. |
| Lint | `npm run lint` passed in `3.4s`. |
| Test-file lint | The new V2 E2E test files passed ESLint. |
| Build | `npm run build` passed in `2.8s`. |
| Diff formatting | `git diff --check` passed. |
| Process cleanup（进程清理） | No residual（残留） Playwright browser or daemon process remained after verification. |
| V3 isolation（V3 隔离） | The tracked V3 diff was empty after this batch. |
| Independent review（独立审查） | Completed with no remaining P1 or P2 finding. |
| Full-repository E2E（全仓端到端测试） | `npm run test:e2e` passed, `75/75` in headless Chromium. The runner duration was not retained, so no duration is claimed. `npm run test:all` was not run separately. |
| Production smoke（生产冒烟检查） | Both [`workers.dev /v2`](https://liquid-lab-optics-demo.mattamior.workers.dev/v2) and [custom-domain /v2](https://liquid.hkooii.com/v2) returned `200` with `text/html; charset=UTF-8`; both retained SSR light / expanded / Baseline state and exactly one `aria-current`. A real Chromium smoke on workers.dev clicked Product, enabled Enhanced, and observed `0` CLI console errors and `0` warnings. The browser was closed after the check. |

## 6. Deployment and Release Status（部署与发布状态）

- The batch was released to Cloudflare Worker `liquid-lab-optics-demo` version `58a41f02-7a84-4499-9ce1-dd032b99c3b2`, serving 100% of traffic. The deployed routes are [`https://liquid-lab-optics-demo.mattamior.workers.dev/v2`](https://liquid-lab-optics-demo.mattamior.workers.dev/v2) and [`https://liquid.hkooii.com/v2`](https://liquid.hkooii.com/v2).
- The dry run（预演） passed with `npx --no-install wrangler deploy --config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --message "release v2 admin-template enhancement" --dry-run`. Production deploy（生产发布） passed with the same command after removing `--dry-run`.
- The previous 100%-traffic version and production rollback target（生产回滚目标） is `71ca0a4d-6af1-4742-a97a-d9b83c61a820`. The exact rollback command is `npx --no-install wrangler rollback 71ca0a4d-6af1-4742-a97a-d9b83c61a820 --name liquid-lab-optics-demo --message "rollback v2 admin-template enhancement" --yes`.

## 7. Known Risks, Limits, and Follow-up（已知风险、限制与后续工作）

- The directed suite covers Darwin Chromium. Native Safari and physical touch hardware have not been signed off（尚未签署） for this batch.
- `npm run test:e2e` completed the full Chromium integration check（Chromium 集成检查）. `npm run test:all` was not run separately, so this record does not claim that command passed.
- DPR changes, Canvas/SVG capability loss, storage failure, and forced-colors behavior have automated contract coverage（自动化契约覆盖）, but production browser and device combinations can still expose compositor（合成器） differences.
- Future V2 work should preserve the admin-template identity and visible optics controls. V3 layout geometry（布局几何） and motion-coupled fields should remain separate unless a later decision explicitly changes that boundary（明确改变该边界）.
