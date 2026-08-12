# V2 后台模板增强决策记录

日期：2026-08-12

状态：已生产发布为 Cloudflare Worker `liquid-lab-optics-demo` 版本 `58a41f02-7a84-4499-9ce1-dd032b99c3b2`，承载 100% 流量。

## 1. 范围与决策

本批次增强 `/v2` 作为默认后台模板参考实现的可靠性。它吸收 V3 已验证的交互生命周期、光学计算结构、能力降级、主题持久化和回归覆盖，同时保留 V2 的纵向布局与可解释控件。

- `/` 继续重定向到 `/v2`；路由、Liquid Lab 身份、纵向侧栏、内容卡片、菜单标识与文案、Baseline/Enhanced 控件及唯一 `aria-current` 契约保持不变。
- V3 的横向 dock、椭圆光场、连续世界变换和运动耦合光学仍不在本批次范围内。
- SSR 仍从浅色主题、展开侧栏和 Baseline 光学开始。V2 显式主题偏好只接受 `liquid-lab:v2-theme` 下的 `light` 或 `dark`，不增加自动系统主题模式。

## 2. 交付结果与改动区域

- [`app/v2/page.tsx`](../../app/v2/page.tsx) 让主鼠标、触控与触控笔共用一套 Pointer Events 生命周期，包括大于 `5px` 的移动阈值、pointer capture、最近项预览、最终位置刷新与集中取消清理。pointer move 通过 `requestAnimationFrame` 合并，点击移动继续使用既有 `680ms` 展示加 `160ms` 淡出时序。
- [`app/v2/lens-optics.ts`](../../app/v2/lens-optics.ts) 集中纯 capsule SDF、光学参数、栅格倍率与位移场生成。栅格密度采用 `clamp(ceil(devicePixelRatio), 1, 2)`，只在场依赖变化时重建。
- [`app/v2/layout.tsx`](../../app/v2/layout.tsx)、[`app/layout.tsx`](../../app/layout.tsx) 与 [`app/v2/v2.css`](../../app/v2/v2.css) 提供经过校验的首屏主题 bootstrap、hydration 安全标记、手动主题持久化、跨标签页同步、焦点样式和强制颜色行为。
- [`tests/rendered-html.test.mjs`](../../tests/rendered-html.test.mjs)、[`tests/e2e/v2.spec.ts`](../../tests/e2e/v2.spec.ts)、[`tests/e2e/v2-optics.spec.ts`](../../tests/e2e/v2-optics.spec.ts) 与三张 Darwin Chromium 快照覆盖服务端渲染契约、交互行为、光学辅助函数、降级和当前视觉基线。

## 3. 公开界面与兼容契约

- 既有 V2 路由、菜单 ID 与文案、`data-theme`、`data-sidebar`、`data-optics-tier`、`data-glass-*` 和唯一 `aria-current` 语义保持兼容。
- 只接受主 pointer，鼠标交互还必须使用左键；右键和非主 pointer 不启动导航会话。
- pointer 移动超过 `5px` 后进入拖动预览；释放时刷新最新位置、吸附最近菜单项并且只提交一次。取消、失去捕获、resize、页面可见性变化、相关媒体查询变化或后来的交互会移除暂态，并阻止过期异步提交。
- 紧凑布局、减少动态和强制颜色继续使用直接或简化行为。光学增强无法运行时，导航和语义选中仍然可用。

## 4. 交互、光学、主题与降级

- Enhanced 光学保留 V2 的纵向圆角 capsule 与可控副本。实现使用 CSS 像素计算，以自适应 `1×` 或 `2×` 栅格密度生成底层场，并在高密度屏幕上限制为 `2×`。
- Enhanced 模式同时要求 Canvas 2D 和 SVG filter 能力。任一能力不可用时，V2 跳过具有误导性的光学 lens 并执行静态提交；Baseline 保留轻量临时 plate。
- 手动主题默认 `light`，使用前校验存储值，持久化合法修改，刷新后恢复，并响应其他标签页发出的合法 `storage` 事件。数据非法或存储不可用时回退 `light`，不改变公开路由。
- 根文档只抑制 hydration 前主题 bootstrap 产生的预期 hydration 差异。强制颜色模式保留可见焦点和可读静态选中，不依赖折射或仅靠颜色表达状态。

## 5. 验证证据

| 检查 | 结果 |
| --- | --- |
| V2 定向 Playwright | 通过，Darwin 无头 Chromium `14/14`，耗时 `24.8s`；三张视觉快照通过。 |
| SSR / 渲染测试 | `npm test` 通过，`6/6`；TAP 耗时 `193.835ms`，命令耗时 `2.9s`。 |
| Lint | `npm run lint` 通过，耗时 `3.4s`。 |
| 测试文件 lint | 新增 V2 E2E 测试文件通过 ESLint。 |
| Build | `npm run build` 通过，耗时 `2.8s`。 |
| Diff 格式 | `git diff --check` 通过。 |
| 进程清理 | 验证结束后没有残留 Playwright browser 或 daemon 进程。 |
| V3 隔离 | 本批次完成后，V3 的受跟踪 diff 为空。 |
| 独立审查 | 已完成，没有遗留 P1 或 P2 问题。 |
| 全仓 E2E | `npm run test:e2e` 通过，无头 Chromium `75/75`。运行器耗时未保留，因此不声明耗时；`npm run test:all` 未单独执行。 |
| 生产 smoke | [`workers.dev /v2`](https://liquid-lab-optics-demo.mattamior.workers.dev/v2) 与[自定义域名 /v2](https://liquid.hkooii.com/v2) 都返回 `200` 和 `text/html; charset=UTF-8`；两者均保留 SSR 浅色 / 展开 / Baseline 状态及唯一 `aria-current`。workers.dev 的真实 Chromium smoke 成功点击 Product、启用 Enhanced，CLI console errors 为 `0`、warnings 为 `0`；检查后已关闭浏览器。 |

## 6. 部署与发布状态

- 本批次已发布为 Cloudflare Worker `liquid-lab-optics-demo` 版本 `58a41f02-7a84-4499-9ce1-dd032b99c3b2`，承载 100% 流量。已部署路由为 [`https://liquid-lab-optics-demo.mattamior.workers.dev/v2`](https://liquid-lab-optics-demo.mattamior.workers.dev/v2) 和 [`https://liquid.hkooii.com/v2`](https://liquid.hkooii.com/v2)。
- dry-run 使用 `npx --no-install wrangler deploy --config dist/server/wrangler.json --name liquid-lab-optics-demo --keep-vars --message "release v2 admin-template enhancement" --dry-run` 并成功通过。正式发布使用同一命令移除 `--dry-run` 后成功通过。
- 前一个 100% 流量版本及生产回滚目标为 `71ca0a4d-6af1-4742-a97a-d9b83c61a820`。准确回滚命令为 `npx --no-install wrangler rollback 71ca0a4d-6af1-4742-a97a-d9b83c61a820 --name liquid-lab-optics-demo --message "rollback v2 admin-template enhancement" --yes`。

## 7. 已知风险、限制与后续工作

- 定向测试覆盖 Darwin Chromium；本批次尚未完成原生 Safari 和真实触控硬件签署。
- `npm run test:e2e` 已完成全量 Chromium 集成检查。`npm run test:all` 未单独执行，因此本文档不声称该命令通过。
- DPR 变化、Canvas/SVG 能力缺失、存储失败和强制颜色已有自动化契约覆盖，但生产浏览器与设备组合仍可能暴露合成器差异。
- 后续 V2 工作应保持后台模板身份和可见光学控件。除非未来决策明确改变边界，否则 V3 布局几何和运动耦合场应继续保持独立。
