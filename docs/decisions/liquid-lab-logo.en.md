# Liquid Lab Logo Decision Record（标志决策记录）

Status: adopted（已采纳） as the current baseline（基线）<br>
Recorded: 2026-08-07<br>
Implementation commit: [`465c7b2`](../../../../commit/465c7b2)

## Scope

Define an original Liquid Lab logo that is legible（清晰可辨） at compact sizes,
supports light and dark interfaces, and communicates the project's study of
refraction（折射）, highlights（高光）, and layered glass（分层玻璃）. This is an
independent visual identity（独立视觉身份）; it does not copy the X logo,
Cloudflare marks, or Apple artwork.

## Decision

The selected mark is a rounded, filled `L` monogram（字母组合）. Its form remains
readable at small sizes while its material describes a thick glass corner:

- A cool spectrum（冷调色谱） moves from teal `#4bd4d2` through ice blue
  `#639dea` to soft violet `#9674cc` in dark mode.
- Light mode uses lower-saturation（较低饱和度） counterparts: `#a8e1df`,
  `#a9bce0`, and `#c5b4d5`.
- A translucent（半透明） interior surface, a restrained white rim highlight
  （边缘高光）, and an opposing dark refraction（折射） line create the glass depth.
- The highlight and shadow are derived（派生） from the same four-pixel inset
  geometry（内缩几何） as the interior surface. They are not independent
  decorative outlines, which prevents their corners and vertical edges from
  drifting out of alignment（错位）.

## Decision Process

1. A simple monochrome（单色） `L` was explored first for X-like restraint
   （克制感） and compact recognition. It did not communicate the project's
   material study.
2. A hollow fine-outline（中空细描边） variant was tested in black and white.
   Its nested contours（嵌套轮廓） competed with each other and became ambiguous
   （含混） at small sizes, so it was rejected.
3. A warm yellow-orange-red solid treatment（方案） was explored for high
   contrast. It was rejected because it echoed Cloudflare's palette（色盘） too
   strongly rather than establishing an ownable（可建立独特识别的） Liquid Lab
   identity.
4. The current cool teal-blue-violet material was selected. It keeps dark-mode
   optics（光学效果） expressive while reducing saturation（饱和度） in light mode.
5. The inner highlight was visually reviewed at large scale. Its path was then
   rebuilt to follow the interior boundary（内层边界） exactly; the opposite
   shadow follows the matching lower-right boundary.

## Delivered Assets and Integration

| Purpose | Path |
| --- | --- |
| Dark-mode logo | [`public/brand/liquid-lab-logo.svg`](../../public/brand/liquid-lab-logo.svg) |
| Light-mode logo | [`public/brand/liquid-lab-logo-light.svg`](../../public/brand/liquid-lab-logo-light.svg) |
| Reusable mark | [`public/brand/liquid-lab-mark.svg`](../../public/brand/liquid-lab-mark.svg) |
| Browser icon | [`public/favicon.svg`](../../public/favicon.svg) |
| Theme-aware（主题感知） V2 placement | [`app/v2/page.tsx`](../../app/v2/page.tsx) and [`app/v2/v2.css`](../../app/v2/v2.css) |
| Review surface（审查页） | [`/brand-preview`](../../app/brand-preview/page.tsx) |

`/brand-preview` shows dark and light backgrounds side by side with 48px,
32px, and 24px checks. The logo batch was verified locally first. It was later
released together with the V3 navigation batch, so the review page is now
publicly available at [`/brand-preview`](https://liquid.hkooii.com/brand-preview).

## Verification

- SVG syntax validation（语法校验） passed for all logo, favicon, and
  static-preview SVGs.
- Focused lint（定向 lint） passed for the V2 and preview changes.
- `npm test` passed: 5 of 5 rendered-route（服务端渲染路由） tests, including
  `/brand-preview`.
- Browser review at `1440 × 1024` found no console errors and confirmed the
  corrected highlight alignment（高光对齐） on both backgrounds.
- Subsequent release verification confirmed
  [`https://liquid.hkooii.com/brand-preview`](https://liquid.hkooii.com/brand-preview)
  returned HTTP 200. This is release evidence recorded after the local logo
  verification, not a claim that the original logo batch deployed itself.

## Release Status

The implementation was committed as [`465c7b2`](../../../../commit/465c7b2). It was
released together with the V3 navigation work in Worker version
`9e1e76c7-2474-48bb-9a74-29c1bbbdea83`. The public review route above was
verified after that release.

## Follow-Up Boundary

The current logo is the accepted baseline（基线）, not a mandate to stop
exploration. Any later concept should be presented beside this baseline in the
preview page, checked at 24px and 32px, and accepted explicitly before it
replaces the current assets. A promising direction is one continuous refraction
window（折射窗） at the `L` corner rather than additional nested contours.

## Documentation Rule for Future Work Batches

After every completed work batch, update the affected documentation. A
substantial（重要） batch also requires a bilingual decision record under
`docs/decisions/`; a lightweight（轻量） batch must update at least the most
relevant existing document. Update the README when the batch changes project
identity, behavior, architecture（架构）, public surface（公开界面）, public route
（公开路由）, or operating status（运行状态）. See [`AGENTS.md`](../../AGENTS.md)
for the repository-wide rule（仓库级规则）.
