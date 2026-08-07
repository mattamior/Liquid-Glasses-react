# V3 Longbridge Screenshot Reference Index（截图参考索引）

Status: active visual reference（有效视觉参考）<br>
Recorded: 2026-08-07<br>
Reference files: 9 JPEG screenshots

## Scope and Decision

This directory preserves the user-supplied Longbridge screenshots as the visual
reference baseline（视觉参考基准） for future V3 fidelity（保真） work. They are
review material for the `/v3` horizontal navigation lens, not runtime（运行时）
assets, product branding, or an automated pixel baseline（像素基线）.

## Source and Preservation

The source was the user-provided directory
`/Users/jay/Downloads/longbridge-liquidglass/`. The copied JPEGs retain their
original filenames. The table below is the file manifest（文件清单）: it records
the source dimensions, SHA-256 digest, observed state, and intended visual use.

| File | Dimensions | SHA-256 | Observed state | Visual use |
| --- | --- | --- | --- | --- |
| [IMG_20260806_144625.jpg](./IMG_20260806_144625.jpg) | 1264 × 948 | `cbab47279f15084af66ac86ee9cffd903857dfe54d5bcd1665a53aa19b339f27` | Static Open selection | Baseline for the dark rail, muted four-item base layer, white active replica, and inset static selection plate. |
| [IMG_20260806_144634.jpg](./IMG_20260806_144634.jpg) | 1264 × 948 | `eea013b685385c37487c3b48878437e9f14ef859bc4a5723c676822b395b50f3` | Lens aligned with Open | Start/alignment reference for the circular thick-glass lens over the Open item. |
| [IMG_20260806_144645.jpg](./IMG_20260806_144645.jpg) | 1264 × 948 | `8797c20da44db784e30d2a7328afd8f469c8edeff0e91ba8f46deada32b9933b` | Lens moving between Open and Activity | Mid-travel reference for the lens extending beyond the rail and refracting content locally. |
| [IMG_20260806_144654.jpg](./IMG_20260806_144654.jpg) | 1264 × 948 | `b389b06d7ccc3aa3c41734db79393e2cb49a5fcb6e3b55344cc6a9df5d5d8bb3` | Lens over Activity | Destination-area transition reference with enlarged, refracted white icon and label fragments. |
| [IMG_20260806_144715.jpg](./IMG_20260806_144715.jpg) | 1264 × 948 | `64dab301df41a9e1f5555226f65864be51e94dd111fdf20d4d39e9d547ef7db1` | Static Activity selection | Baseline for the Activity resting state and the static selection plate after the lens settles. |
| [IMG_20260806_144724.jpg](./IMG_20260806_144724.jpg) | 1264 × 948 | `fe4ece08d2d0e86942a7e8a566aa3631ead9053ed13cd3b8287158989c5ab047` | Lens aligned with Activity | Start/alignment reference for a second travel from the Activity item. |
| [IMG_20260806_144732.jpg](./IMG_20260806_144732.jpg) | 1264 × 948 | `3b9923b90667a50538497f00df8840ca62192bca962ceeb34d830bc18ccd3a05` | Lens moving between Activity and Market | Mid-travel reference for the leftward lens position, local enlargement, and edge refraction. |
| [IMG_20260806_144739.jpg](./IMG_20260806_144739.jpg) | 1264 × 948 | `8111562561dd17bf493e8ba54af86477b4d4b36d68c281b396238d94082d7836` | Static Market selection | Baseline for the Market resting state and its white active replica. |
| [IMG_20260806_144858.jpg](./IMG_20260806_144858.jpg) | 1264 × 948 | `36699e7c2503a01d62f4c8f1f0c9068962107755c2b847aa71778e45036b4703` | Static Market selection with chart context | Context reference for a selected market state above a detailed chart background. |

## Visual Rules

- Use the screenshots as the primary visual target for the dark pill-shaped
  navigation rail, four muted base items, and the white active visual replica.
- The moving lens is a circular, thick-glass surface that may extend beyond the
  rail. It locally enlarges and refracts the navigation content rather than
  acting as a flat selected-tab background.
- Match the neutral gray/white rim, upper and lower elliptical caustics
  （焦散）, inner dark ring, and local background-dependent refraction before
  adding decorative color effects.
- Review the chart-context screenshot whenever a V3 change can affect contrast
  or legibility against detailed content behind the rail.

## Use Limits

- The screenshots establish appearance and captured states only. They do not
  establish exact durations, easing curves, filter values, shader details, or
  frame rate.
- They do not replace V3's documented semantic, Pointer Events, accessibility,
  responsive, or reduced-motion contracts.
- Do not use these files as runtime assets, project branding, or a replacement
  for the existing Playwright screenshot regression baseline.
- Future V3 visual-fidelity work must review all nine files and record any
  intentional divergence（有意差异） in the V3 decision record.

## Verification and Release Status

The repository copies match the nine source files by filename, `1264 × 948`
dimensions, and SHA-256 digest. This reference-only batch changes no runtime
code, automated screenshot baseline, deployment, or release state.
