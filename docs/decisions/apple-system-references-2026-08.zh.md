# 苹果系统参考截图 2026-08 决策记录

**日期:** 2026-08-18
**状态:** 已在 `grok/liquid-glass-radix-menu` 编目并打码；未批准金标；未部署

## 1. 范围与决策

`/Users/jay/Downloads/liquid-glass` 里 21 张 iPhone 静帧是工作参考。以语义化文件名拷进仓库。原图留在 Downloads。

仓库副本上的敏感内容用本地马赛克处理（ffmpeg 裁切 → 1/8 邻近缩小 → 放大 → 叠回）。尺寸保持 `828 × 1792` PNG。不用生成式重绘。

本批次只编目和打码。不实现控制中心、App 资源库、锁屏片层或 Dock。不替代 `docs/assets/v2-card-liquid-glass/` 里已有的 Clear 文件夹金标。

## 2. 交付结果与改动区域

- [`docs/assets/apple-system-2026-08/`](../assets/apple-system-2026-08/) 存 21 张 `828 × 1792` PNG，目录为 `app-library/`、`home-screen/`、`lock-screen/`、`control-center/`。
- 中英索引：[`INDEX.en.md`](../assets/apple-system-2026-08/INDEX.en.md)、[`INDEX.zh.md`](../assets/apple-system-2026-08/INDEX.zh.md)。
- Skill 审阅副本（不含主屏清单）：`skills/liquid-glass-interface/assets/visual-targets/apple/system-2026-08/`（17 张，含已打码的 `search-list.png`）。

仓库副本已打码：

- 搜索列表：AdBlocker 文字；BOCHK 图标+文字；Bumble 图标+文字；Facebook 图标+文字。
- 主屏（四帧）：王者荣耀、Over、乐活、Karing、社交网络；Over 里的 Tinder；乐活里的 Bumble。
- App 资源库砖：grid-idle 的小红书；「其他」砖可见处的王者荣耀和 Tinder。

系统标签、玻璃、壁纸、Dock、搜索条保留。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 文件数 | docs 21 张；skill 17 张（去掉主屏；收入已打码的 `search-list.png`） |
| 尺寸 | `sips` 每张都是 `828 × 1792`；打码后 `file` 为 `PNG image data, 828 x 1792, 8-bit/color RGBA` |
| 打码 | 马赛克框紧裁：银行/交友/个人名不可读；钱包/文件/实用工具/设置/翻译/创意仍在 |
| 实现 | 未执行 |

## 4. 部署与发布状态

仅仓库资产编目。没有 Worker 部署。视觉批准待定。

## 5. 已知风险、限制与后续工作

- 主屏图标（游戏画、社交文件夹微标）仍可见；只打了名字和银行/交友标记。Skill 仍不含主屏组。
- 马赛克框是手测的。以后滚动位置不同的静帧可能漏字。
- 控制中心 Regular 和 App 资源库搜索条现在有系统截图可依；实现是后续，不是本批次。
