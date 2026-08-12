# V3 运动耦合光学决策记录

日期：2026-08-12

状态：仅本地验证、尚未发布；本批次未暂存、未提交、未部署，也未创建 tag。生产环境仍为 `v3-milestone-04`。

## 1. 范围与决策

本记录覆盖 `/v3` 在既有连续世界取样和持久主题基础上的本地光学与导航图标增强。图表背景不在本批次范围内。

- 四个导航项使用一套原创、共享的 `NavigationGlyph` 资产：Open 为 `70px`，Activity 为 `79px`，Market 为 `88px`，Follow 为 `70px`。base、静态 slider 与 transient lens 继续复用同一个 `NavigationWorld`；sun、moon 与 teal badge 保持不变。
- 折射场保留 `1×` world transform，并采用连续的径向与切向位移。动态状态由 `LensFieldState` 表示，方向为 `none` / `left` / `right`，速度层级为 `0`–`3`；tier 0 规范化为无方向静态场。
- 点击和拖拽只把真实状态机的方向与速度层级接入光学 profile，不改变既有 phase、settle、commit 时序。Baseline 与 Edge 共用几何和表面材质；Edge 仍保留静态增量，并且只在运动 profile 中增加可见位移覆盖。
- 动态场生成使用 `125ms` latest-pending 合并调度。LRU 总容量为 `16`，动态 profile 上限为 `14`，因此名义工作集最多可为静态 profile 留出 `2` 个容量；这不是硬保留，静态条目仍可能按同一 LRU 策略淘汰。pointer 的位置更新仍走原有 animation frame，不会在每次 pointer move 时重建场。
- 位移图编码改为 `fieldScaleCssPx: 64`，代表每个轴 `±32 CSS px`；缓存 schema 为 `v3-continuous-field-4`，滤镜 padding 保持 `36px`。这只扩大编码量程，不改变已验收的位移数学。

## 2. 交付结果与改动区域

- [`app/v3/lens-optics.ts`](../../app/v3/lens-optics.ts) 定义连续 field、signed sample 编码、profile key 规范化、LRU 与 `125ms` latest-pending 调度。静态 landmark 保持 `coreZoom: 0.12`、`coreFalloffStart: 0.70`、`meniscusBandCssPx: 36`、`baselineMeniscusRefractionCssPx: 10.05` 和 Edge 静态倍率 `1.14`。
- 运动 profile 在约 `r = 0.45`–`0.92` 的平滑区间叠加径向、切向和方向分量；左右方向互为镜像，tier 0 严格不含动态增量。切向量为 `3.5`，基础方向量为 `2.5`，rim 运动倍率为 `0.22`；Edge 的运动倍率为 `3.2`、额外方向量为 `2`，中段权重归一化为 `0.28`。
- [`app/v3/page.tsx`](../../app/v3/page.tsx) 将真实 click / drag 状态映射到 `LensFieldState`，并让 base、slider 与 lens 继续使用同一组原创图标和标签。对外路由、查询参数、ARIA、fallback 与 `data-*` 检查接口均未改变。
- [`app/v3/v3.css`](../../app/v3/v3.css) 保持深浅主题共用的镜片结构：可见 surface tint、约 `2px` rim、inner-dark 区域、上下 `72px × 22px` caustic 和单一低频 sheen。Baseline 与 Edge 没有独立的 shell、颜色或材质分支。
- [`tests/e2e/v3-optics.spec.ts`](../../tests/e2e/v3-optics.spec.ts)、[`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 与 [`tests/e2e/v3.spec.ts-snapshots/`](../../tests/e2e/v3.spec.ts-snapshots/) 覆盖纯光学接口、交互行为和当前视觉基线。

## 3. 保持不变的契约

- `/v3`、`?chrome=demo`、`?optics=edge`、持久主题、强制颜色、减少动态和 Canvas / SVG 不可用时的静态提交 fallback 保持原行为。
- dock、rail、lens、slider、padding-box world origin 及 `1×` world transform 保持既有几何；本批次没有恢复 CSS scale，也没有增加 magic offset。
- click、drag、settle 与 commit 的公开时序不变；新增的方向和 tier 只控制内部 field profile，不改变 active / preview 的 ARIA 所有权。
- 现有 `data-*` 状态和测试入口保持兼容；未新增公开 API、URL 状态、render prop、WebGL 路径或长期 legacy renderer。
- 深色、浅色、系统主题与持久化 override 的优先级不变；图表背景明确超出本批次范围。

## 4. 验证证据

| 检查 | 结果 |
| --- | --- |
| CodeGraph 健康同步 | 通过；`29 files / 376 nodes / 1038 edges`。 |
| 纯光学测试 | 通过，`10/10`。 |
| 完整 E2E | 通过，无头 Chromium `35/35`。 |
| Lint | `npm run lint` 通过。 |
| Build | `npm run build` 通过。 |
| SSR / npm test | `npm test` 通过，`5/5`。 |
| Diff 格式 | `git diff --check` 通过。 |
| 视觉快照 | `21` 张 PNG 与 assertions 一一对应：`12` 张 full viewport、`9` 张 lens crop；记录的 manifest SHA-256 前缀为 `509f…`。 |

## 5. 视觉、兼容与性能门槛

- 最终视觉 Gate 为 **Go**：深色镜片非文字中心 `p50 = 58.73`，指定 Edge 运动 landmark 位移 `D = 4.603px`；`fieldScaleCssPx: 64` 下 RGBA 编码没有饱和。表面、rim、inner-dark、caustic 与主题对比均保留在 Baseline / Edge 的共享材质路径中。
- 原生 Safari Retina 人工检查为 **Go**，`backingScaleFactor = 2`。主题、SVG filter、mask、CSS `:has()` 与真实 drag 均通过，console 无错误；本轮没有进行触摸交互验收。
- 系统录屏请求为 `r60`，实际文件为 `2446 × 1370`、`404` frames、`8.026667s`，平均 `50.290fps`，记录的 SHA-256 前缀为 `e1f…`。因此“逐帧 `>= 60fps`”门槛没有通过，slider 在 `<= 2` frames 内恢复也尚未签署。
- `fieldScaleCssPx: 64` 将每轴编码范围扩为 `±32px`；当前审阅确认 RGBA 无饱和，`36px` padding 仍覆盖场的轴向位移与抗锯齿余量。

## 6. 发布状态与回退

- 本批次仅存在于本地工作树：尚未暂存、提交、push、部署或创建 tag。生产环境仍是 `v3-milestone-04`，本记录不改变现有 Cloudflare 流量或生产回滚目标。
- 若本地结果需要撤回，应以本批次的 app、tests、snapshots、README 和本决策记录为一个边界回退。该操作是源代码工作树 / 后续提交的回退，不是生产环境 rollback；不得触碰当前生产版本。
- 在逐帧 `>= 60fps` 与 slider `<= 2` frames 门槛签署前，不应把本记录改写为已发布状态。

## 7. 已知风险、限制与后续工作

- 录屏平均值 `50.290fps` 不能证明逐帧 `>= 60fps`；下一步需要可重复的逐帧时间序列和 slider 恢复帧计数，并单独签署两项性能门槛。
- Safari Retina 已覆盖主题、滤镜、mask、`:has()` 与 drag，但未覆盖真实触摸手势；发布前仍需完成触摸设备或等效硬件检查。
- 当前视觉 Gate 证明指定构图与 landmark 达标，不代表图表背景或其它未纳入场景已完成；图表仍是明确的后续批次。
- 只有在未通过门槛关闭、快照与 manifest 重新核对后，才能决定 commit、部署与新 milestone tag；本批次不预先声明这些发布动作。
