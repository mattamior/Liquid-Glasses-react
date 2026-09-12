# Default Entry `/ui` Decision Record

**Date:** 2026-09-12
**Status:** Implemented on `grok/liquid-glass-radix-menu`; not released to the production Worker

## 1. Scope and Decision

The public root `/` now auto-navigates to `/ui` instead of `/v2`. The portable deliverable is the floating menu and overlay catalog, not the V2 admin template. `/ui` still continues to `/ui/liquid-menu`. `/v2`, `/v3`, and `/apple-clear` stay direct. Optics, component behavior, and the Skill kernel are unchanged.

## 2. Delivered Result and Changed Areas

- `app/page.tsx`: `redirect("/ui")`.
- `tests/rendered-html.test.mjs`: root assertion now expects `/ui`; added `/ui` → `/ui/liquid-menu`.
- README and `docs/liquid-glass-interface.*.md` current-entry copy now describe `/ui`.

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| Branch | `grok/liquid-glass-radix-menu` |
| Local curl | `GET /` → `307` `http://127.0.0.1:3000/ui`; `GET /ui` → `307` `http://127.0.0.1:3000/ui/liquid-menu`; `GET /ui/liquid-menu` `200`; `GET /v2` `200` |
| Browser desktop 1280×800 | Opening `http://127.0.0.1:3000/` landed on `/ui/liquid-menu`, title `Liquid Glass UI`, stage `LiquidMenu`, `onValueChange: home`. Sidebar Dropdown landed on `/ui/liquid-dropdown` with trigger 「主页」. |
| Browser `/v2` | `http://127.0.0.1:3000/v2` title `Liquid Lab V2 — Navigation lens`, `aria-label="页面导航"`, 3 `.v2-card` elements. |
| Browser mobile 390×844 | Opening `/` landed on `/ui/liquid-menu`. Sidebar Dropdown landed on `/ui/liquid-dropdown`. Console errors: none. |
| `npm test` | Production build passed. Render tests `12/12` passed, `0` failed, including the root `/ui` redirect and the `/ui` catalog index redirect. |

## 4. Deployment and Release Status

No Worker deploy. Public site `https://liquid.hkooii.com` is still version `ced4b0d6-f829-4be6-aae8-64869fb453c1`, which sends `/` to `/v2`.

## 5. Known Risks, Limits, and Follow-up

- Until release, production `/` and this branch disagree.
- Two hops: `/` → `/ui` → `/ui/liquid-menu`. A later batch can send the root straight to `/ui/liquid-menu` if a single hop is wanted.
- `/v2` is no longer the automatic entry; it remains the vertical navigation-lens reference.
