# V3 横向导航透镜决策记录

状态：已发布<br>
记录日期：2026-08-07<br>
实现提交：[`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)

## 范围与决策

V3 继续作为独立的横向导航透镜实验。基础层、静态选中层和临时镜片层现在各自独占
视觉职责。直接拖拽会在超过 `5px` 阈值后显示与点击相同的玻璃镜片，并持续跟随主
指针；仅在释放后吸附到最近标签。语义激活标签和 `aria-current` 仍只会在点击旅程
或拖拽吸附结束后提交。

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
- 全仓 `npm run lint` 仍被本批次外的既有问题阻断：V1 的
  `react-hooks/set-state-in-effect` 错误，以及生成的 `output/blind-tests` lint 结果。
  V3 文件与新增 Playwright 文件的范围内 lint 已通过。

## 发布状态

V3 实现已从提交
[`170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1`](../../../../commit/170f1ddeaade72c16e543e983b6ba5d4c9ef8ab1)
推送，并发布为 Worker 版本 `35abc13a-02a5-4637-801f-f2e90350483a`。部署使用生成的
`dist/server/wrangler.json` 和 `--keep-vars`；没有修改绑定、变量、密钥、配额或生产配置。

## 已知限制与后续工作

- Chromium 具备完整回归覆盖；Firefox 与 Playwright WebKit 已有无头 Edge 拖拽冒烟
  证据。未来发布前仍需验证原生 Safari，因为 SVG `feDisplacementMap` 在原生 Safari
  与 Playwright WebKit 中的表现和性能仍可能不同。
- 触控取消与触控笔提交已有合成 Pointer Events 覆盖，但仍需真机确认。
- Playwright 浏览器需单独执行 `npx playwright install chromium` 安装；浏览器二进制
  不会提交到仓库。
- 每次完成工作批次后都要同步更新本记录与 README。
