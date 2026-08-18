# Apple System References 2026-08 Decision Record

**Date:** 2026-08-18
**Status:** Catalogued and redacted on `grok/liquid-glass-radix-menu`; not gold-still approved; not deployed

## 1. Scope and Decision

Twenty-one iPhone stills from `/Users/jay/Downloads/liquid-glass` are working references. They are copied into the repo with semantic names. Originals stay in Downloads.

Sensitive content on the repo copies is locally mosaiced (ffmpeg crop → 1/8 nearest-neighbor scale-down → scale-up → overlay). Dimensions stay `828 × 1792` PNG. Generative inpainting is not used.

This batch only catalogs and redacts. It does not implement Control Center, App Library, lock-screen sheet, or dock. It does not replace the existing Clear folder gold stills in `docs/assets/v2-card-liquid-glass/`.

## 2. Delivered Result and Changed Areas

- [`docs/assets/apple-system-2026-08/`](../assets/apple-system-2026-08/) holds 21 `828 × 1792` PNGs in `app-library/`, `home-screen/`, `lock-screen/`, `control-center/`.
- Bilingual indexes: [`INDEX.en.md`](../assets/apple-system-2026-08/INDEX.en.md), [`INDEX.zh.md`](../assets/apple-system-2026-08/INDEX.zh.md).
- Skill review copies (no home-screen inventory): `skills/liquid-glass-interface/assets/visual-targets/apple/system-2026-08/` (17 files, including redacted `search-list.png`).

Redacted on the repo copies:

- Search list: AdBlocker label; BOCHK icon + label; Bumble icon + label; Facebook icon + label.
- Home screen (all four frames): labels 王者荣耀, Over, 乐活, Karing, 社交网络; Tinder icon inside Over; Bumble icon inside 乐活.
- App Library tiles: 小红书 on grid-idle; 王者荣耀 + Tinder on every frame where the “其他” tile is visible.

System labels, glass, wallpaper, dock, and the search pill stay.

## 3. Verification Evidence

| Check | Exact result |
| --- | --- |
| File count | 21 in docs; 17 in skill (home-screen omitted; redacted `search-list.png` included) |
| Dimensions | Every file `828 × 1792` via `sips`; redacted files `PNG image data, 828 x 1792, 8-bit/color RGBA` via `file` |
| Redaction | Tight crops of mosaiced boxes: bank/dating/personal names unreadable; 钱包/文件/实用工具/设置/翻译/创意 remain |
| Implementation | Not run |

## 4. Deployment and Release Status

Repository asset catalog only. No Worker deploy. Visual approval pending.

## 5. Known Risks, Limits, and Follow-up

- Home-screen icons (game art, social folder glyphs) are still visible; only names and bank/dating marks are mosaiced. Skill still omits the home-screen set.
- Mosaic boxes are hand-measured. A later still with a different scroll offset could leak a label.
- Control Center Regular and App Library search pill are now screenshot-backed; implementation is follow-up, not this batch.
