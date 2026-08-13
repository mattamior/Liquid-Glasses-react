# V2 Liquid-Glass Card Container Decision Record（V2 卡片容器液态玻璃决策记录）

Date: 2026-08-12

Status: verified and released to production（生产）. Cloudflare Worker
`liquid-lab-optics-demo` version `50355dc2-6b65-4b7f-9955-83933c3ce75c` has served
100% of traffic since 2026-08-12 19:52:55 CST（中国标准时间）
(2026-08-12T11:52:55.160Z), with release message `reimplement v2 cards from references`.

## 1. Scope and Decision（范围与决策）

This batch makes V2's three content cards independent liquid-glass containers. The visual target is background colour transmission（背景色彩穿透）, local blur（局部失焦）, cool rim highlights（冷色边缘高光）, restrained shadows（克制阴影）, and crisp foreground content（清晰前景内容）. The three redacted derivative（脱敏衍生） references are for design and manual acceptance only; they are not runtime assets（运行时资产）.

- The `/v2` route, three-column desktop / one-column narrow layout, card information architecture（信息架构）, `<article>` semantics（语义）, menu identifiers（菜单标识）, single `aria-current` contract, and Baseline/Enhanced controls remain intact.
- Folder expansion（文件夹展开）, full-screen background blur（全屏背景模糊）, icon-grid interaction（图标网格交互）, and V3 changes are out of scope（超出范围）. The batch adds no runtime dependency（运行时依赖）, pointer tracking（指针跟随）, or refraction animation（折射动画）.
- Baseline uses stable CSS glass. When capabilities are available, Enhanced adds rounded-rectangle edge refraction（圆角矩形边缘折射） from a controlled decorative environment replica（受控装饰环境副本）.

## 2. Delivered Result and Changed Areas（交付结果与改动区域）

- [`docs/assets/v2-card-liquid-glass/`](../assets/v2-card-liquid-glass/) contains three `828 × 1792` PNG references. [`ambient-surface.png`](../assets/v2-card-liquid-glass/ambient-surface.png) derives from the first original screenshot and pixelates only app and folder name labels locally; its icons, notification badges, status bar, search label, Dock, and wallpaper remain unchanged. [`compact-glass-container.png`](../assets/v2-card-liquid-glass/compact-glass-container.png) and [`full-glass-container.png`](../assets/v2-card-liquid-glass/full-glass-container.png) are byte-for-byte copies of the second and third originals. The images are design and manual-acceptance references only, never runtime assets（运行时资产）; the original screenshots were neither modified nor committed.
- [`app/v2/page.tsx`](../../app/v2/page.tsx) uses the same `AmbientScene` as the sole blueprint（唯一蓝图） for the visible background and Enhanced replica. Each card is fixed as shadow, clipped surface/native backdrop, edge-only Enhanced refraction, rim, and crisp content. Every optical layer is `aria-hidden` and ignores pointer events; actual content still appears exactly once.
- [`app/v2/lens-optics.ts`](../../app/v2/lens-optics.ts) gives independent `V2_CARD_LENS_OPTICS` a desktop `24px` radius, `14px` edge zone, centre zoom `1` to edge zoom `1.035`, `2.4px` refraction, `20px` overscan（超采样边距）, and capped `2×` DPR. A pure sampler（纯采样器） and Canvas share one displacement model; an eight-entry LRU cache（最近最少使用缓存） shares fields by geometry and capped DPR. Established navigation-capsule parameters remain unchanged.
- [`app/v2/v2.css`](../../app/v2/v2.css) uses themed `--v2-card-glass-*` tokens. Light mode is neutral-white `10%` to cool-blue `6%`; dark mode is white `8%` to deep-blue `10%`, with environment-aware rim, top highlight, lower dark rim, and a light `0 12px 32px` shadow. The page environment is frozen（冻结） to keep the replica in phase with the visible background.

## 3. Public Surface, Rendering, and Fallback（公开界面、渲染与降级）

- `.v2-card`, `data-card-optics`, existing V2 data attributes, menu IDs, and accessibility contracts（可访问性契约） remain compatible. No public route, component API, or data shape（数据结构） is added.
- Baseline uses glass fill, rim highlights, shadows, and `backdrop-filter`. Where available, the filter is `blur(16px) saturate(125%) brightness(104%)`; dark mode uses brightness `101%`.
- Enhanced requires Canvas 2D, SVG `feImage` / `feDisplacementMap`, `backdrop-filter`, and a CSS mask. It exposes only an approximately `14px` rounded edge ring while the centre remains native backdrop. If any capability is absent, it remains at Baseline; it neither clones business DOM（业务 DOM） nor applies an SVG filter to body text.
- Under forced colors（强制颜色）, transparent filters and the Enhanced replica are disabled in favor of an opaque system surface and system border. Compact layout, reduced motion, and existing theme/navigation interactions continue independently.

## 4. Verification Evidence（验证证据）

| Check | Result |
| --- | --- |
| Optical pure functions（光学纯函数） and navigation isolation（导航隔离） | V2 optics verification（V2 光学验证） passed, `25/25`, covering rounded-card parameters, established navigation-capsule isolation（既有导航 capsule 隔离）, cache keys（缓存键）, encoding range（编码范围）, overscan, capped DPR, and LRU. |
| SSR / render contract（服务端渲染契约） | Build and SSR tests passed, `6/6`; rendered assertions cover three `<article class="v2-card">` elements, Baseline first paint（Baseline 首屏）, no Enhanced replica/filter, and no duplicate accessible content（重复可访问内容）. |
| V2 Playwright regression（浏览器回归） and visual snapshots（视觉快照） | V2 focused verification（V2 专项验证） passed, `25/25`; mapping-focused verification（映射聚焦验证） passed, `5/5`, covering the controlled scene, card world coordinates（世界坐标）, themes, and fallback paths. |
| Lint and build（检查与构建） | Lint and production build passed. The full suite still has an existing V3 glyph-threshold failure: `0.93 > 0.75`; this batch did not modify V3. |
| Reference integrity（参考完整性） and local redaction review（局部脱敏检查） | Passed: all three images are `828 × 1792`; manual inspection confirmed that only app/folder name labels are pixelated in the first image and the pixel difference outside specified label rectangles is `0`; `cmp` passed for the second and third images, proving byte-for-byte identity with their originals. |
| Release dry run（发布预演） | Wrangler dry run passed: 42 assets, 9 modules, `1378.40 KiB` (gzip `301.42 KiB`), with no bindings. |
| Production smoke（生产冒烟检查） | `/` on workers.dev and the custom domain returned `307`; both `/v2` entries returned `200`, CSS returned `200`, and each page confirmed 3 `<article>` elements plus 3 `data-card-optics` attributes. |

## 5. Deployment and Release Status（部署与发布状态）

- The existing `liquid-lab-optics-demo` Worker was released through `dist/server/wrangler.json`; no new Worker, domain, or binding was created.
- Production version `50355dc2-6b65-4b7f-9955-83933c3ce75c` serves 100% of traffic with message `reimplement v2 cards from references` at 2026-08-12T11:52:55.160Z (19:52:55 CST（中国标准时间）).
- The rollback target（回滚目标） is the prior production version `1329511c-1c22-4fe9-a639-5c1fa384fa96`.

## 6. Known Risks, Limits, and Follow-up（已知风险、限制与后续工作）

- Automated results cover only browsers that were actually run. Native Safari and physical touch hardware still need separate manual acceptance, particularly for compositor（合成器） flicker, clipping misalignment（裁切错位）, and frame drops（掉帧）.
- `backdrop-filter` and SVG compositing（SVG 合成） vary by browser and hardware. Capability detection safely falls back to Baseline, but visual consistency（视觉一致性） still needs confirmation on target devices.
- The full suite remains blocked by the existing V3 glyph threshold `0.93 > 0.75`; it is outside this batch and V3 was not modified.
- The first reference still contains real icons, notifications, and status-bar content outside its labels. It is restricted to controlled repository design reference and must not be used as a public product screenshot or runtime asset.
