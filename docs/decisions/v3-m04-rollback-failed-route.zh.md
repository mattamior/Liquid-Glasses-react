# V3 M04 回归与失败 M05 路由决策记录

**日期：** 2026-08-12
**状态：** 已部署生产；完整视觉 smoke 仍待独立核验

## 1. 范围与决策

本决策将当前 V3 的两个历史实现分离为明确的公开路由职责：

- `/v3` 精确恢复至 M04 提交
  `d353abed0e5b379989bbcb7d13bb830702eece3f`，作为当前候选基线。
- `/v3-05-failed` 保留 M05 提交
  `88abeedca48b14a9aa96d980a4a956bb294461ee` 的完整可交互实现，供直接访问和历史复核。
- 已推送的 annotated tag `v3-milestone-05-failed` 仍只表示发布验收失败；它不是可用基线，也不表示批准、回滚或重新部署。

这份记录取代旧的“`/v3` 即 M05 当前实现”的路由表述；M05 运动耦合光学决策仍是该历史实现的事实记录。

## 2. 路由与隔离契约

`/v3-05-failed` 是公开可直接访问的归档路由，但不进入站内导航。其 layout 设置
`noindex, nofollow`，避免搜索索引将失败候选当作当前产品。

两条路由共享唯一的主题持久化键 `liquid-lab:v3-theme`，从而保留用户的合法 `dark` / `light`
偏好。除此之外，M05 归档与 M04 物理隔离：

- 归档使用独立的 `v3-05-failed-*` 类、CSS 变量、HTML bootstrap marker、SVG filter ID 和字段缓存 schema；不得复用 `.v3-*` 或 `--v3-*` 选择器。
- 归档的全局 `html`、`body` 与 `:has()` 选择器仅匹配归档 marker 或归档根，不能改变 `/v3`、V1 或 V2。
- 两条路由分别拥有页面、光学模块、样式、E2E 用例和快照目录；查询参数 `?chrome=demo` 与 `?optics=edge`、ARIA、降级与主题语义在各自路由中保留。

## 3. 测试与快照归属

M04 与 M05 归档各自拥有独立测试入口和 **21 个 PNG 快照**。此次验证只将既有视觉资产归属到对应路由；没有更新任何快照像素。

| 路由 | 独立测试结果 | 快照 |
| --- | --- | --- |
| `/v3`（M04） | `23/23` | 21 个 PNG |
| `/v3-05-failed`（M05 归档） | `25/25` | 21 个 PNG |

完整 E2E 合并结果为 `61/61`。这使 M04 回归和 M05 历史复核可以独立失败、独立定位，而不会互相覆盖视觉基线。

## 4. 验证证据

本地、未更新快照的验证证据如下：

| 检查 | 结果 |
| --- | --- |
| CodeGraph | 健康：29 files / 377 nodes / 1055 edges |
| M04 E2E | `23/23` 通过 |
| M05 归档 E2E | `25/25` 通过 |
| 完整 E2E | `61/61` 通过 |
| `npm test` | `6/6` 通过 |
| `npm run lint`、`npm run build`、`git diff --check` | 通过 |

验证没有执行 `--update-snapshots`。单次字形 bounding-box 检查出现 `0.94` 的暂态值；后续重跑通过，因此该观测被记录为非阻塞警示而非视觉基线变更。

## 5. 兼容性、风险与限制

M04 的现有浏览器降级、强制颜色、减少动态和 SVG/Canvas fallback 行为保持不变。Safari Retina 的滤镜、mask、`:has()` 与拖拽人工检查结论可继承，但原生 Safari 触摸手势和逐帧性能门槛仍未在本批次重新验收；应在下一里程碑前完成。

归档路由的公开直达性不等于推荐使用：M05 的失败 tag 语义始终优先于其可访问性。导航不应新增指向该路由的入口，也不应把它用于新的视觉批准。

## 6. 部署与回滚

路由迁移已发布到 Cloudflare Worker `liquid-lab-optics-demo`，新版本为
`71ca0a4d-6af1-4742-a97a-d9b83c61a820`。Wrangler `4.92.0` 下，`npm run build`、dry-run
和正式 deploy 均以 exit `0` 完成；dry-run 包含 `9` 个 modules 和 `42` 个 assets，总计
`1358.09 KiB`（gzip `297.92 KiB`）。正式发布上传 `5` 个新增/修改 assets、复用 `28` 个，
Worker startup 为 `15ms`。workers.dev URL
[`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3)
是本次发布的 Worker 入口。

custom URL `https://liquid.hkooii.com` 与两个路由的完整生产视觉 smoke 仍待视觉代理单独核验；
在该核验完成前，不得把它们记录为已通过。前一生产版本
`d910d3b1-cdc6-472f-a504-4d5df526df95` 是本次路由迁移的回滚目标，命令为：

```bash
npx wrangler rollback d910d3b1-cdc6-472f-a504-4d5df526df95 --name liquid-lab-optics-demo --message "rollback M04 route migration" --yes
```

## 7. 后续工作

视觉代理完成 custom/Worker URL 的生产 smoke 后，应补记结果；下一里程碑还应完成 Safari 触摸、逐帧性能与字形 bounding-box 的重复测量。V2 仍是默认参考实现，本决策不会替换 V1/V2。
