# V3 横向导航透镜决策记录

状态：已发布<br>
记录日期：2026-08-07<br>
实现提交：[`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)

## 范围与决策

V3 继续作为独立的横向导航透镜实验。基础层、静态选中层和临时镜片层现在各自独占
视觉职责。直接拖拽会在超过 `5px` 阈值后显示与点击相同的玻璃镜片，并持续跟随主
指针；仅在释放后吸附到最近标签。语义激活标签和 `aria-current` 仍只会在点击旅程
或拖拽吸附结束后提交。

2026-08-07 起，用户提供的 Longbridge 截图集被采纳为未来 V3 保真工作的视觉参考基准。
该集合保存在 [`docs/references/v3-longbridge`](../references/v3-longbridge/) 并附有结构一致
的中英文清单。它仅指导视觉审阅，不改变已发布的交互、语义、无障碍或测试契约。

## 已交付结果与改动区域

- [`/v3`](../../app/v3/page.tsx) 提供明确的基础层、选中层和镜片层标记。基础层只在
  静态选中层可见时隐藏已提交标签；所有镜片活动阶段都会隐藏静态选中层。高不透明
  遮挡层防止灰色与白色文字副本彼此透出。
- Pointer Events 只接受主指针，鼠标仅限左键开始。拖拽位置每动画帧最多更新一次，
  被限制在导航轨道内，并补齐窗口级释放/取消兜底。小幅移动保持普通点击行为；取消、
  页面隐藏、减少动效和尺寸变化都会恢复已提交选中项。
- [`app/v3/v3.css`](../../app/v3/v3.css) 将静态滑块与拖拽、吸附中的镜片分离，保留
  V3 本地坐标系（`top: 0`）及现有厚玻璃材质。
- Edge optics 保留 `1.18` 的镜片副本缩放，但以连续的 `15px` 边缘带、最大 `4.5px`
  法线折射和最大 `1.04` 局部缩放，替代全镜片缩放和高幅度位移。SVG 位移场、滤镜
  区域与 `224 × 184` 本地 viewport 现使用明确且一致的坐标；Baseline 始终不使用滤镜。
- [`playwright.config.ts`](../../playwright.config.ts) 与
  [`tests/e2e/v3.spec.ts`](../../tests/e2e/v3.spec.ts) 新增无头 Chromium 回归覆盖；
  [`package.json`](../../package.json) 新增 `test:e2e` 与 `test:all`。Edge 拖拽截图
  作为视觉回归基线。
- [`docs/references/v3-longbridge`](../references/v3-longbridge/) 现保存 9 张保留原始
  文件名的 JPEG 参考副本及结构一致的中英文索引。每项记录 `1264 × 948` 尺寸、SHA-256
  摘要、捕获状态和视觉用途。

## 验证证据

- `npx eslint app/v3/page.tsx tests/e2e/v3.spec.ts playwright.config.ts` 通过。
- `npm test` 通过：构建完成，SSR HTML 测试 5/5 通过。
- `npm run test:e2e` 通过：无头 Chromium 测试 6/6 通过，覆盖初始单层选中、点击
  转场期间隐藏静态滑块、指针跟随拖拽及延迟提交、小幅移动/右键拒绝，以及 Edge
  optics 截图比对、触控取消回退和触控笔拖拽提交。
- 已本地检查 Edge 拖拽基线截图：中心文字完整，只有边缘存在克制且连续的折射效果。
- 无头 Firefox 与 Playwright WebKit 的 Edge 拖拽冒烟检查均激活了本地滤镜，且没有
  控制台或页面错误。其稳定截图保留了完整的中文标签，没有重复选中层。
- 对 [`https://liquid.hkooii.com/v3?optics=edge`](https://liquid.hkooii.com/v3?optics=edge)
  的公开验证返回 HTTP 200。在 `1365 × 769` 下，真实 Edge 拖拽显示镜片、隐藏静态
  滑块、在释放前保留原选中项、吸附后提交市场标签，并应用本地滤镜；控制台零错误。
- 生成的 `output/**` 实验产物已排除出仓库 lint 范围。V1 的
  `react-hooks/set-state-in-effect` 结果已有记录在案的源码行级豁免，必须在下次修改
  V1 源码时一并修复。
  V3 文件与新增 Playwright 文件的范围内 lint 已通过。
- Longbridge 参考副本已按文件名、尺寸和 SHA-256 摘要与用户提供的源目录进行比对；
  中英文索引具有相同的 9 项状态映射。
- 仅参考资料的验证已通过：9 个文件均使用 `cmp -s`、`shasum -a 256` 和
  `sips -g pixelWidth -g pixelHeight` 检查，`git diff --check` 亦通过；没有更改
  运行时测试或 Playwright 截图基线。

## 发布状态

V3 实现已从提交
[`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)
推送，并发布为 Worker 版本 `35abc13a-02a5-4637-801f-f2e90350483a`。部署使用生成的
`dist/server/wrangler.json` 和 `--keep-vars`；没有修改绑定、变量、密钥、配额或生产配置。

2026-08-07 的截图参考批次没有修改运行时代码、Playwright 快照、部署配置或已发布的
Worker，也没有产生新的发布。

## 已知限制与后续工作

- Chromium 具备完整回归覆盖；Firefox 与 Playwright WebKit 已有无头 Edge 拖拽冒烟
  证据。未来发布前仍需验证原生 Safari，因为 SVG `feDisplacementMap` 在原生 Safari
  与 Playwright WebKit 中的表现和性能仍可能不同。
- 触控取消与触控笔提交已有合成 Pointer Events 覆盖，但仍需真机确认。
- Playwright 浏览器需单独执行 `npx playwright install chromium` 安装；浏览器二进制
  不会提交到仓库。
- 未来 V3 视觉保真改动必须审阅完整的 Longbridge 截图集。静态截图不能作为精确时序、
  滤镜参数或无障碍交互行为的证据；这些改动仍需独立验证。
- 每次完成工作批次后都要同步更新本记录与 README。
