# Official Apple Liquid Glass Design Logic（苹果官方液态玻璃设计逻辑）

Treat this document as the highest-level design authority（最高级设计判定基准） in this Skill. Satisfy Apple's material semantics（材料语义） before choosing a Web technique. Browser limits may require a fallback（降级）, but do not call a deliberate deviation（有意偏离） Apple-aligned Liquid Glass.

## Source Priority（来源优先级）

Resolve conflicts and uncertainty（不确定性） in this order, and recheck the current official pages when design work begins:

1. [Apple Human Interface Guidelines: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
2. [Apple Developer Documentation: Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)
3. [Apple WWDC: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
4. Other official Apple platform documentation and design videos
5. Community articles, experiments, and Web implementation notes

Community sources may inform implementation（实现方法） but cannot override Apple's intended use, hierarchy（层级）, material variants（材料变体）, or legibility（可读性）. If a user explicitly requests a deviation, explain it first and describe the result as a custom glass effect, not a faithful Apple material reproduction（忠实复现）.

## Functional Layer and Scope（功能层级与范围）

Liquid Glass belongs to a functional layer（功能层） floating above content. Prefer it for navigation, toolbars, tab bars, sidebars, menus, popovers, and important controls. Do not spread it across content cards, page backgrounds, or decoration, and avoid glass-on-glass stacking（玻璃叠玻璃）.

The material must clarify hierarchy, state, or the source of an interaction. Prefer a standard material or ordinary translucent（半透明） surface when glass adds only decoration. Native Apple apps should prefer system components; this Skill provides a Web approximation（Web 近似实现）.

## Optical Model: Whole-Surface Refraction, Stronger Edge Gradient（光学模型：全表面折射、边缘梯度更强）

Apple describes lensing（透镜效应） as the defining behavior of Liquid Glass: the material bends, shapes, and concentrates background light in real time to communicate presence, form, and hierarchy.

- The whole surface participates in refraction（折射）; refraction and distortion（扭曲） are not two fully separate regions.
- Rounded edges have higher curvature（曲率） and a stronger refraction gradient（折射梯度）, producing localized bending, concentration of light, and restrained dispersion（克制色散） that follow the surface normal（表面法线）.
- The interior stays low-gradient（低梯度） and visually stable. It may show slight continuous magnification（放大）, translation（位移）, tint change, or scattering（散射）, but not unexplained waves, stretching, or noise.
- Foreground labels, icons, focus rings, and hit targets remain stable and outside background refraction.
- Blur supports legibility and light scattering; it must not replace lensing or dominate the edge refraction.

Interpret “refraction without interior distortion” as low-gradient interior refraction: nearby samples move by almost the same amount, so the background remains continuous, stable, and recognizable（可辨认）. The edge becomes visibly deformed because its displacement gradient increases.

## Four Independent Axes（四个独立维度）

Do not conflate（混淆） these axes:

| Axis（维度） | Options（选项） | Meaning（含义） |
| --- | --- | --- |
| Apple material variant（苹果材料变体） | Regular / Clear | Chosen from content, legibility, and context |
| Web rendering tier（Web 渲染能力） | Baseline / Enhanced | Whether a scene replica and SVG displacement are active |
| Appearance theme（外观主题） | Light / Dark | Independently tuned brightness, dispersion, shadow, and contrast |
| Interaction state（交互状态） | Resting / Interactive | Rest, press, selection, opening, and morphing（形变） |

Baseline/Enhanced are not aliases（别名） for Regular/Clear. A Regular menu may use either Baseline fallback or Enhanced refraction.

## Regular and Clear（Regular 与 Clear）

### Regular

Choose Regular by default for menus, popovers, sidebars, and components with substantial text. It adapts blur, luminosity（亮度）, tint, shadow, and dynamic range（动态范围） to keep foreground content legible. Moderate softening is allowed, but environmental color and structure must remain perceptible（可感知）.

### Clear

Clear is more transparent and prioritizes rich media such as photos and video. Use it only when the background is visually rich, foreground labels are bold and bright, and a dimming layer（暗化层） is acceptable. Clear lacks some Regular adaptive behavior（自适应行为）; add localized dimming instead of an opaque white fill when needed.

Do not casually mix Regular and Clear in one component system. Choose from semantics and legibility, not spectacle（炫技）.

## Size, Environment, and Content Adaptivity（尺寸、环境与内容适配）

- Keep small controls lightweight, transparent, and quiet; increase light and deformation mainly during interaction.
- When glass expands into a larger menu or sidebar, make it feel thicker with deeper shadows, more pronounced lensing/refraction, and softer scattering, without breaking background continuity（连续性）.
- Adapt shadow, tint, and dynamic range to the content underneath. Increase separation over text and reduce it over uniform backgrounds.
- Small controls may switch between light and dark appearances. Avoid distracting whole-surface flips on large menus.
- Let environmental color spill subtly into the surface, highlight, and shadow without forming a fixed blue, cyan, or purple ring.
- Use tint selectively for a primary action or clear semantic purpose. Avoid tinting everything or using a solid fill that destroys translucency.

## Unify Material and Motion（统一材质与运动）

Treat visuals and motion as one system:

- Materialize and remove elements by continuously changing lensing, light, form, and apparent thickness, not through an ordinary fade alone.
- Press, selection, and touch may briefly illuminate or flex the material; keep the resting state quiet.
- When a button opens into a menu, preserve causality（因果关系） among the trigger, connection field, and content so the same material appears to open or merge.
- Preserve rounded geometry, hierarchy, and optical integrity（光学完整性） through morphing. Under reduced motion, keep state changes immediate and clear.

## Scrolling Content, Steady State, and Test Scenes（滚动内容、稳定状态与测试场景）

Apple's Scroll Edge Effects（滚动边缘效果） soften, dissolve, or dim content as it moves under glass to protect the legibility of navigation and controls. A Web implementation should provide the same semantic outcome when a product needs it instead of letting complex body content compete continuously with controls.

Avoid disruptive high-contrast intersections（干扰性交叉） between content and Liquid Glass in a production steady state. Blind tests and visual QA are deliberate exceptions: make text, grids, and color bands cross the lens edge to prove genuine refraction. Never present a test scene as a production layout recommendation.

## Accessibility and Performance（无障碍与性能）

- Reduced Transparency（降低透明度）: increase opacity or frost without breaking hierarchy or operation.
- Increased Contrast（增强对比度）: strengthen foreground, boundaries, and state separation.
- Reduced Motion（减少动态）: reduce elasticity（弹性）, morphing, parallax（视差）, and nonessential light motion.
- When performance is insufficient, reduce displacement, filter area, and optical surface count before falling back to a complete standard material.
- Share or combine rendering resources for adjacent glass effects; hidden or closed glass must not retain active filters.

## Apple-Aligned Vetoes（Apple-aligned 一票否决）

Do not call a result Apple-aligned Liquid Glass when any condition is true:

1. Blur, translucent white fill, noise, or a fixed color ring substitutes for lensing.
2. The whole interior continuously waves, stretches, or distorts and breaks background continuity.
3. The edge lacks localized refraction that follows its geometric normal.
4. Baseline/Enhanced are treated as Regular/Clear.
5. Glass is overused in the content layer or stacked glass-on-glass.
6. Labels, focus, contrast, or hit targets are sacrificed for spectacle.
7. Material parameters do not adapt when size, background, or interaction state changes.
8. A production steady state deliberately creates persistent high-contrast intersections without a legibility treatment.
9. Community trends are used without checking the current official Apple sources.
