# V3 M04 Rollback and Failed M05 Route Decision Record

**Date:** 2026-08-12
**Status:** Deployed to production; full visual smoke remains pending independent verification

## 1. Scope and Decision

This decision separates the two V3 historical implementations into explicit public-route responsibilities:

- `/v3` is restored exactly to M04 commit
  `d353abed0e5b379989bbcb7d13bb830702eece3f` as the current candidate baseline（候选基线）.
- `/v3-05-failed` retains the complete interactive M05 implementation from commit
  `88abeedca48b14a9aa96d980a4a956bb294461ee` for direct access and historical review（历史复核）.
- The pushed annotated tag（注释标签） `v3-milestone-05-failed` still means only that release acceptance failed. It is not a usable baseline and does not approve, roll back, or redeploy anything.

This record replaces the old route statement that “`/v3` is the current M05 implementation”. The M05 motion-coupled-optics decision remains the factual record for that historical implementation.

## 2. Route and Isolation Contract

`/v3-05-failed` is a publicly direct-access archive route, but it is not in site navigation. Its layout sets
`noindex, nofollow` so search indexing（搜索索引） cannot present the failed candidate as the current product.

The two routes share only the theme-persistence key `liquid-lab:v3-theme`, preserving valid `dark` / `light`
preferences. Apart from that, the M05 archive is physically isolated（物理隔离） from M04:

- The archive uses its own `v3-05-failed-*` classes, CSS variables, HTML bootstrap marker, SVG filter IDs, and field-cache schema; it must not reuse `.v3-*` or `--v3-*` selectors.
- Archive-wide `html`, `body`, and `:has()` selectors match only an archive marker or archive root, and cannot change `/v3`, V1, or V2.
- Each route owns its page, optics module, styles, E2E cases, and snapshot directory. Query parameters `?chrome=demo` and `?optics=edge`, ARIA, fallback, and theme semantics remain in their respective routes.

## 3. Test and Snapshot Ownership

M04 and the M05 archive each own an independent test entry and **21 PNG snapshots**. This verification only assigned existing visual assets to their matching route; it did not update any snapshot pixels.

| Route | Independent test result | Snapshots |
| --- | --- | --- |
| `/v3` (M04) | `23/23` | 21 PNG files |
| `/v3-05-failed` (M05 archive) | `25/25` | 21 PNG files |

The combined full E2E result is `61/61`. This allows the M04 rollback and M05 historical review to fail and be diagnosed independently, without overwriting each other’s visual baseline（视觉基线）.

## 4. Verification Evidence

The following local evidence was collected without updating snapshots:

| Check | Result |
| --- | --- |
| CodeGraph | Healthy: 29 files / 377 nodes / 1055 edges |
| M04 E2E | `23/23` passed |
| M05 archive E2E | `25/25` passed |
| Full E2E | `61/61` passed |
| `npm test` | `6/6` passed |
| `npm run lint`, `npm run build`, and `git diff --check` | passed |

Verification did not run `--update-snapshots`. One glyph bounding-box check produced a transient `0.94` value; subsequent reruns passed, so this observation is a non-blocking caveat（非阻塞警示）, not a visual-baseline change.

## 5. Compatibility, Risks, and Limits

M04 keeps its existing browser fallbacks（浏览器降级）, forced-colors, reduced-motion, and SVG/Canvas fallback behavior. The Safari Retina manual findings for filters, masks, `:has()`, and drag can be inherited, but native Safari touch gestures and the frame-by-frame performance gate were not re-accepted in this batch; they must be completed before the next milestone.

Public direct access to the archive does not recommend it for use: the failed-tag meaning always takes priority over accessibility. Navigation must not add an entry to that route, and it must not be used for new visual approval.

## 6. Deployment and Rollback

The route migration is deployed to Cloudflare Worker `liquid-lab-optics-demo` as new version
`71ca0a4d-6af1-4742-a97a-d9b83c61a820`. With Wrangler `4.92.0`, `npm run build`, dry-run（预演）, and
production deploy（生产发布） all completed with exit `0`; dry-run contained `9` modules and `42` assets,
totaling `1358.09 KiB` (`297.92 KiB` gzip). Production uploaded `5` new/modified assets, reused `28`, and
reported `15ms` Worker startup（Worker 启动）. The workers.dev URL
[`https://liquid-lab-optics-demo.mattamior.workers.dev/v3`](https://liquid-lab-optics-demo.mattamior.workers.dev/v3)
is this release's Worker entry.

The custom URL `https://liquid.hkooii.com` and the complete production visual smoke for both routes remain
pending independent verification by the visual agent（视觉代理）; they must not be recorded as passed before
that check. The prior production version `d910d3b1-cdc6-472f-a504-4d5df526df95` is the rollback target（回滚目标） for this route migration:

```bash
npx wrangler rollback d910d3b1-cdc6-472f-a504-4d5df526df95 --name liquid-lab-optics-demo --message "rollback M04 route migration" --yes
```

## 7. Follow-up Work

After the visual agent completes custom/Worker URL production smoke, record its result. The next milestone must also repeat Safari touch, frame-by-frame performance, and glyph bounding-box measurements. V2 remains the default reference implementation; this decision does not replace V1 or V2.
