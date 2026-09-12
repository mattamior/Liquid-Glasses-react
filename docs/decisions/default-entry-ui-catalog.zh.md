# 默认入口改为 `/ui` 决策记录

**日期:** 2026-09-12
**状态:** 已在 `grok/liquid-glass-radix-menu` 落地；未发布到生产 Worker

## 1. 范围与决策

公开站点根路径 `/` 的自动导航从 `/v2` 改为 `/ui`。可移植交付物是浮动菜单与覆盖层目录，不是 V2 后台模板。`/ui` 仍转到 `/ui/liquid-menu`。`/v2`、`/v3`、`/apple-clear` 保持直达。光学、组件行为与 Skill 内核不变。

## 2. 交付结果与改动区域

- `app/page.tsx`：`redirect("/ui")`。
- `tests/rendered-html.test.mjs`：根路由断言改为 `/ui`；新增 `/ui` → `/ui/liquid-menu`。
- README 与 `docs/liquid-glass-interface.*.md` 的当前入口描述改为 `/ui`。

## 3. 验证证据

| 检查 | 精确结果 |
| --- | --- |
| 分支 | `grok/liquid-glass-radix-menu` |
| 本地 curl | `GET /` → `307` `http://127.0.0.1:3000/ui`；`GET /ui` → `307` `http://127.0.0.1:3000/ui/liquid-menu`；`GET /ui/liquid-menu` `200`；`GET /v2` `200` |
| 浏览器桌面 1280×800 | 打开 `http://127.0.0.1:3000/` 落到 `/ui/liquid-menu`，标题 `Liquid Glass UI`，舞台 `LiquidMenu`，`onValueChange: home`。点侧栏 Dropdown 落到 `/ui/liquid-dropdown`，触发器「主页」。 |
| 浏览器 `/v2` | `http://127.0.0.1:3000/v2` 标题 `Liquid Lab V2 — Navigation lens`，`aria-label="页面导航"`，3 张 `.v2-card`。 |
| 浏览器移动 390×844 | 打开 `/` 落到 `/ui/liquid-menu`。点侧栏 Dropdown 落到 `/ui/liquid-dropdown`。控制台无 error。 |
| `npm test` | 生产 build 通过。渲染测试 `12/12` 通过、`0` 失败，含根路由 `/ui` 与 `/ui` 目录索引跳转。 |

## 4. 部署与发布状态

未执行 Worker 部署。公开站点 `https://liquid.hkooii.com` 当前版本仍为 `ced4b0d6-f829-4be6-aae8-64869fb453c1`，根路径仍指向 `/v2`。

## 5. 已知风险、限制与后续工作

- 发布前，生产 `/` 与本分支入口不一致。
- 两跳：`/` → `/ui` → `/ui/liquid-menu`。需要单跳时可把根路径直接指到 `/ui/liquid-menu`。
- `/v2` 不再是自动入口，但仍是导航透镜参考实现。
