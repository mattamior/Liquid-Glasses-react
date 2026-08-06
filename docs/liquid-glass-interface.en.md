# Web Liquid Glass Interface Method（方法）

This method turns the Demo's iterated（迭代调校的） visual findings into a reusable（可复用的） Web interface workflow（工作流）. The corresponding Agent Skill lives in [`skills/liquid-glass-interface`](../skills/liquid-glass-interface/).

## Versioned Demo and Asset Routing（版本路由与资产）

`/` redirects to the current V2 navigation study. `/v1` remains directly reachable as a frozen archived Demo; its visual and interaction behavior are not the current default. For ordinary navigation, start from [`assets/v2-reference-implementation`](../skills/liquid-glass-interface/assets/v2-reference-implementation/). Use [`assets/v1-fidelity-kit`](../skills/liquid-glass-interface/assets/v1-fidelity-kit/) only when the request explicitly requires reproduction of the V1 original Demo. Add future generations as parallel `vN-*` assets; do not overwrite an archived baseline.

## Scope（适用范围）

Liquid Glass suits navigation, toolbars, menus, selection states（选择状态）, and floating controls where material communicates hierarchy（层级）, context（上下文）, or a state transition（状态转换）. Prefer a simple opaque（不透明） or translucent（半透明） surface when a component is only a content card or its background lacks useful visual information to refract（折射）.

This method targets React, CSS, SVG, and comparable（相近的） Web stacks（技术栈）. It does not provide native iOS or SwiftUI recipes（实现配方）. Native applications on iOS 26 or later should prefer the system Liquid Glass APIs.

## Official Apple Design Authority（苹果官方设计基准）

Treat official Apple sources as the highest-level authority（最高级判定标准） in this method: Apple Human Interface Guidelines first, Apple Developer Documentation second, official Apple WWDC design sessions third, and community implementation experience last. Community material may supplement（补充） Web techniques but cannot redefine Apple's functional hierarchy（功能层级）, material variants（材料变体）, lensing（透镜效应）, adaptivity（动态适配）, legibility（可读性）, or accessibility（无障碍）. See the complete rules in [`apple-design-logic.en.md`](../skills/liquid-glass-interface/references/apple-design-logic.en.md).

Place Liquid Glass in a functional layer above content for navigation, toolbars, menus, popovers, and important controls. Do not spread it across content cards or stack glass-on-glass（玻璃叠玻璃）. The whole surface participates in refraction（折射）, while its interior stays low-gradient（低梯度）, continuous, stable, and recognizable（可辨认）. Rounded edges create stronger localized bending because their curvature（曲率） and refraction gradient are higher. Blur supports legibility and light scattering（光散射）; it must not replace or dominate lensing.

Keep four axes independent: Apple material variant Regular/Clear, Web rendering capability Baseline/Enhanced, Light/Dark theme, and Resting/Interactive state. Use Regular by default for menus and substantial text. Use Clear only over rich media with bold foreground content and an acceptable dimming layer（暗化层）. Baseline/Enhanced are never aliases（别名） for Regular/Clear.

Blind tests may deliberately place text, grids, and color bands across a glass edge to prove refraction. In a production steady state（正式产品稳定状态）, avoid disruptive intersections（干扰性交叉） or provide softening, dissolving, or dimming with the same semantic goal as Apple Scroll Edge Effects（滚动边缘效果）. When a user deliberately chooses a deviation（偏离） from official guidance, identify it first and describe the result as a custom glass effect, not Apple-aligned Liquid Glass.

## Five-Layer Material Model（五层材质模型）

Credible（可信的） Liquid Glass contains five layers that can be tuned（调校） or disabled independently（独立）:

1. Environment（环境）: color, light, and structure that can be sampled（采样）.
2. Refraction（折射）: displaced background sampling that does not distort foreground content.
3. Translucent（半透明） fill: theme tint（主题色调）, blur, saturation（饱和度）, and contrast（对比度）.
4. Edge optics（边缘光学）: restrained highlights, shadows, and localized caustics（焦散）.
5. Content and interaction（交互）: stable text, icons, focus, and hit targets（命中区域）.

Build a functional no-filter fallback（降级方案） before adding refraction. Keep the rounded container, sampling layer, filter region（滤镜区域）, and clipping path（裁切路径） aligned（对齐） to prevent broken edges or temporary square corners.

## Refraction Pipeline and Two-Tier Strategy（折射管线与两级策略）

Always deliver the baseline（基础层） first: theme-aware translucent or near-opaque（近不透明） fill, neutral border or inner highlight, shadow, readable content, and focus styling. Add blur and saturation only when `backdrop-filter` or `-webkit-backdrop-filter` is available. The baseline must retain hierarchy, contrast, hit targets, and keyboard usability（键盘可用性） without an SVG filter.

Use the enhanced tier（增强层） for genuine refraction（真实折射）. Web platforms cannot stably and generally pass a live CSS backdrop directly into SVG `feDisplacementMap`: `backdrop-filter` samples pixels behind an element, while SVG filter inputs cannot portably（可移植地） access that sample. Therefore, do not call an SVG filter on a translucent overlay（覆盖层） true background refraction.

Genuine Web refraction needs an environment-coordinate-aligned scene replica（场景副本/重渲染采样层）. Render a second, presentational（展示用） copy of an application-controlled visual scene behind the glass with the same scene model, dimensions, breakpoints（断点）, and world coordinates（世界坐标）; translate it by the glass origin relative to the scene; apply SVG displacement（位移） only to that replica; then clip it to the glass shape. Keep the visible scene semantic（语义化） and interactive; mark the replica `aria-hidden` and non-interactive（不可交互）.

The replica may contain only visual layers the application explicitly（明确地） owns and permits: CSS gradients（渐变）, decorative SVG, a known canvas scene, or deterministic data-driven artwork（确定性数据驱动图形）. Do not use DOM screenshots, canvas/screen-capture APIs, or implicit（隐式） capture of arbitrary page pixels. Do not duplicate private page content, user data, forms, messages, or third-party embeds（第三方嵌入物）.

SVG `feDisplacementMap` can read the red and green channels of a rounded-edge displacement map（位移贴图） to change sampling coordinates of the scene replica. Keep blur, saturation, contrast, and theme fill in CSS. Keep foreground content outside the filter. Keep replica overscan（超采样边界）, the SVG filter region, the outer clip, and corner radius synchronized（同步）; make the filter region cover at least the maximum displacement so displaced pixels do not clip.

Apply optical clipping（光学裁切） only to the optical wrapper containing the scene replica, displacement, and highlights; never clip the complete component. Keep semantic controls（语义控件）, hit targets（命中区域）, focus rings（焦点环）, and shadows outside it. A popover, menu, tooltip, or other overlay（覆盖层） must be outside that clipping boundary or rendered through a portal（门户） with explicit stacking and positioning; it must not be clipped or made unclickable by `overflow: hidden`, `clip-path`, or a mask（遮罩）.

Choose an explicit（明确的） coordinate system（坐标系） for every SVG `clipPath`. With `clipPathUnits="objectBoundingBox"`, use only normalized（归一化） 0–1 geometry and a non-zero target bounding box. With `clipPathUnits="userSpaceOnUse"`, provide an explicit current width and height matching the optical wrapper. Do not use percentage geometry inside zero-sized or ambiguous（含糊的） `<defs>` and assume it matches the component. If the coordinate system cannot be established reliably（可靠地）, clip only the optical wrapper with CSS or omit the enhanced optical tier（增强光学层）.

### React Instance IDs and Feature Detection（特性检测）

Generate independent（独立） filter/clip IDs with `useId()` for every component instance（组件实例）. React IDs may contain colons; they are legal HTML `id` values but make CSS selectors and unquoted `url()` values fragile（脆弱）. Encode non-safe characters, use quoted `url("#id")` values from inline React styles, and do not target generated IDs with CSS `#id` selectors.

Use this enhancement order: baseline fill/border/shadow → backdrop blur after detecting `backdrop-filter` or `-webkit-backdrop-filter` → scene replica after coordinate alignment is available → standard SVG `filter` on the replica only after visual and performance checks in real target browsers（目标浏览器）. `CSS.supports("filter", "url(#candidate)")` checks syntax only; it does not prove SVG filtering, alignment, or the sampling pipeline（采样管线） across browsers（跨浏览器）.

```tsx
const toSafeSvgId = (value: string) => `liquid-${Array.from(value, (char) =>
  /[A-Za-z0-9_-]/.test(char) ? char : `x${char.codePointAt(0)?.toString(16)}x`,
).join("")}`;

const instanceId = toSafeSvgId(useId());
const filterId = `${instanceId}-filter`;
const clipId = `${instanceId}-clip`;
const opticsStyle = {
  filter: `url("#${filterId}")`,
  clipPath: `url("#${clipId}")`,
} as CSSProperties;
```

```css
/* Keep the baseline outside feature queries; test standard and WebKit-prefixed support. */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass__fill {
    -webkit-backdrop-filter: blur(18px) saturate(1.12);
    backdrop-filter: blur(18px) saturate(1.12);
  }
}
@supports (filter: url("#candidate")) {
  .glass[data-enhanced-refraction="true"] .glass__scene-replica { filter: var(--scene-filter); }
}
```

Chromatic dispersion（色散） is optional, not a definition of Liquid Glass. Dark themes may use weak channel offsets（通道偏移） to reinforce environmental color. Light themes should start with aligned channel displacement, neutral white highlights, and lower saturation. Treat a fixed closed blue or purple ring around a rounded edge as a rendering defect（渲染缺陷）.

## State-Driven Motion（状态驱动动效）

Use menu visibility, selection, theme, and material mode as explicit（明确的） motion sources. Relate a toolbar and menu through a shared coupling field（耦合场）, synchronized（同步） translation, or opacity without temporarily flattening their rounded corners.

For current navigation, keep the committed selection flat and show a temporary glass lens only while a click, press, or mouse drag is in progress. The lifecycle is `click → dragging → settling → fading`: hide the flat selected visual while the lens exists, settle the lens to the destination, fade it, then commit content, `aria-current`, and the flat selected visual together. Use a persistent glass selection plate only when durable material selection is an explicit product requirement. Keep hover feedback visibly quieter than committed selection.

For mouse dragging, use Pointer Capture and a capture-phase `pointerup` fallback. Update the rail position from the release event's final `clientY` before choosing the nearest item. Only cancellation or lost capture returns to the origin; a normal release never falls back because an intermediate move event was missed. Narrow, touch/pen, reduced-motion, and forced-color paths commit directly without the temporary lens.

Plate geometry travel（几何位移） and its internal optical sweep（光学扫光） are independent channels（通道）. The plate may move or resize for any reliable geometry change; emit a sweep only for a user selection, using the previous-to-next measured center vector in the same positioning-container coordinate space: `dx = nextCenterX - previousCenterX`; `dy = nextCenterY - previousCenterY`. Do not use a fixed page direction, fixed item index/DOM order, blindly reverse `dx` for RTL, or replay solely because a key changed.

For wrapped rows, use two-dimensional `dx/dy`; RTL uses measured physical coordinates; vertical writing, scroll containers, transforms（变换）, and nested positioning require measurements in the same container space with relevant scroll offsets. On rapid consecutive selections, travel from the currently rendered/interpolated center (or latest reliable center) to the new target; do not queue stale sweeps. Resize, font loading, responsive reflow（响应式重排）, localization（本地化）, scroll correction, DOM mutation, and observer callbacks are non-user layout remeasurements: update plate geometry but never emit a sweep. If reliable two-dimensional centers in one coordinate system are unavailable, omit the sweep and retain geometry travel. Keyboard selection follows the same measurements, not an assumed arrow-key direction.

Dragging is a Demo-specific optional pattern（可选模式）, not a default recommendation for ordinary menus. Enable it only for floating panels, canvas tools, spatial workspaces（空间工作区）, or an explicit user request. Start from a non-interactive handle, use Pointer Events and `setPointerCapture`, clamp movement to the container, and never steal button, link, or scroll input.

## Light and Dark Modes（亮暗模式）

Tune the themes independently（独立地） instead of changing only text colors:

- Dark mode may use slightly stronger displacement, environmental color, and depth shadows, but the complete surface should not become uniformly（均匀地） blue.
- Light mode should reduce dispersion and saturation, use neutral highlights and lighter shadows, and be checked over pale blue, white, and high-contrast（高对比） backgrounds.

After switching themes, preserve hierarchy, selection, focus, and control hit areas.

## Accessibility and Performance（可访问性与性能）

- Preserve keyboard operation, semantic state（语义状态）, and visible `:focus-visible` styling.
- Under `prefers-reduced-motion: reduce`, remove spring overshoot, morphing（形变）, parallax（视差）, and nonessential pointer-following motion.
- Preserve functional hierarchy when filters are unsupported or when reduced transparency（降低透明度） and forced colors（强制颜色） are active.
- Limit the number and area of filtered surfaces; avoid nested backdrops（嵌套背景滤镜） and animated blur radii（模糊半径）.
- Prefer `transform` and `opacity` for motion, then check latency（延迟） on the lowest target device.

## Safety and Distribution（安全与发布）

The Skill provides interface design and implementation guidance only. It does not need credentials（凭证）, private files, personal data, telemetry（遥测）, remote assets, hidden network requests, or automatic installation scripts. Do not add external dependencies（外部依赖） or network access unless the user explicitly authorizes them and the project requires them.

Describe implementations as inspired by Apple Liquid Glass. Do not copy Apple source code, images, or proprietary（专有） assets. Publish under the MIT license and disclose（披露） the function, scope, browser limitations, performance risks, and fallback behavior（降级行为）.

## Current Demo Mapping（当前 Demo 映射）

| Method（方法） | Demo implementation（Demo 实现） |
| --- | --- |
| Default route（默认入口） | `/` redirects to `/v2` |
| Archived Demo（归档 Demo） | `/v1`, frozen visual and interaction behavior with archived metadata |
| V2 refraction（V2 折射） | One application-controlled menu replica and one continuous rounded-SDF `feDisplacementMap` sample |
| V2 selection（V2 选择） | Flat committed state plus a temporary click/drag lens that fades before committing content |
| V2 dragging（V2 拖拽） | Mouse-only Pointer Capture, final-release nearest-item snapping, cancellation rollback |
| Motion fallback（动效降级） | Direct commit for narrow, touch/pen, reduced-motion, forced-color, and baseline paths |

## V2 Foundation and Transferable Core（V2 基础与可迁移核心）

V2 establishes a single continuous lens sampler: a 2× rounded-SDF field combines a stable `1.03` center, a steep continuous rise to `1.12` across the final `16px`, and normal refraction that peaks inside the same band. This replaces core/edge masking, preventing seams, folded text, duplicate glyphs, missing glyphs, and a colored strip below the lens. Automated checks support review, but an isolated runnable page and explicit human experience remain required before design acceptance.

The V1 Demo remains an archived fidelity source, not the default behavior. The transferable V2 core is five-layer separation, independently tuned themes, one filtered controlled replica, isolated optical clipping, final-release pointer handling, temporary-lens state, and direct accessible fallbacks.

## Acceptance Checklist（验收清单）

- Refraction responds to the background and component position instead of behaving like a fixed outline（固定描边）.
- Enhanced refraction displaces only an application-controlled scene replica; the baseline remains available without `filter`, `backdrop-filter`, or `-webkit-backdrop-filter`.
- SVG IDs are unique（唯一） and colon-safe（冒号安全） across instances, and replica overscan, filter region, clipping, and corner radius remain aligned.
- Light mode has no closed blue or purple ring.
- Toolbar and menu preserve rounded corners and hierarchy throughout opening and closing.
- A V2 lens uses one complete replica and one continuous field: no hard core/edge seam, folded text, duplicate/missing glyphs, or colored strip outside the clipped capsule.
- The flat committed selection disappears while the lens is active, then returns with content and `aria-current` only after the lens fades.
- Normal release uses final pointer position and nearest-item snapping; only cancellation or lost capture returns to the origin.
- A plate sweep occurs only for user selection and uses the measured previous-to-next two-dimensional center vector; wrapped rows, RTL, vertical writing, scrolling, and rapid selection work, while layout remeasurement emits no sweep.
- Only the optical wrapper is clipped; overlays are outside it or in a portal, and each SVG `clipPath` has an explicit valid coordinate system.
- Every blind test creates an isolated runnable page, automatically opens its local preview, and obtains explicit user approval after use; text, structure, and screenshot automation cannot replace this human visual gate（人工视觉门）.
- Call it enhanced refraction only when a background grid, text, or color bands visibly bend at the glass edge as a function of position.
- Text, focus, keyboard operation, and touch targets remain usable.
- Narrow viewports（窄视口）, reduced motion, and no-filter environments remain functional.

## Archived V1 Fidelity Mode（归档 V1 保真模式）

When a request says “match the V1 original Demo”, “visual fidelity（视觉保真）”, “9/10”, “do not redesign（不要重新设计）”, or “reproduce（复现）”, use low freedom. Copy `skills/liquid-glass-interface/assets/v1-fidelity-kit/`; do not locally replace the shared `SceneArtwork`, the rounded SDF (有符号距离场) field generated from actual geometry, the instance-safe RGB filter, the world-coordinate-aligned replica, dark/light material tuning（材质调校）, toolbar/popover coupling（耦合）, or the measured persistent selection plate. Copy, semantic menu items, placement, and colors in the shared scene model may change.

`assets/v2-reference-implementation/` is the current technical navigation baseline（技术基础）, not a V1 high-fidelity template（高保真模板）. A V1 fidelity blind test must open the same menu at top, middle, and bottom scroll positions while readable large type, a grid, and color bands cross the lens. The visible scene and every replica must invoke one scene function, and every surface must generate its field from its own width, height, and radius. Without explicit user experience and approval, the blind test fails; screenshots and automated checks are supporting evidence only.

Layout geometry（布局几何） is also a veto; console output and successful clicks cannot pass it alone. At desktop and `<=560px` narrow viewports（窄视口）, measure a 56–76 px toolbar, non-overlapping horizontal back/title/more columns, a visually centered title, and a popover fully within the viewport（视口）.

Runtime pixel alignment（运行时像素对齐） is also a veto. At top, middle, and bottom scroll positions, compare the pre-filter DOM rectangles of matching visible/replica markers, for example `[data-fidelity-anchor="word"]` inside each scene. Position and size error must each be `<=1px`; otherwise do not call the result enhanced refraction（增强折射）.

CSS transforms（变换） and opacity transitions（透明度过渡） do not change box dimensions and may not notify `ResizeObserver`. Re-measure stable alignment after the relevant surface's `transitionend` or `animationend` with one animation-frame callback; layout-changing state must also invalidate geometry. Do not accept an in-motion measurement. For a viewport-centered fixed coupled menu（耦合菜单）, use the kit's `fidelity-menu-cluster--viewport-centered` contract: its absolutely positioned popover cannot change cluster height and move the toolbar, and its constrained popover must remain within the viewport（视口）.

## Visibility and Long-Page Performance Vetoes（可见性与长页面性能否决）

At rest, a closed popover must be unmounted（卸载） or have no painted border/shadow, active replica/filter, or scroll measurement. Do not retain a near-zero-height glass surface. Do not create an enhanced field or filter before non-zero geometry is ready.

Compare baseline and enhanced over a high-contrast word or grid crossing the lens edge. Enhanced must show localized edge displacement（局部边缘位移） that baseline does not; counting filter primitives is not evidence. Mark material mode and a shared refraction target（折射目标） for automated A/B checks.

For a long page with a fixed lens, record enhanced/baseline scroll rAF mean, frames above 20 ms and 33 ms, maximum frame, and DevTools forced reflow（强制回流）. Scroll must imperatively update only the replica world origin; width, height, radius, or stage-size changes may rebuild React state and the field. Keep the filter window lens-sized even when the source world is full stage-sized. Without CPU throttling（CPU 降速）, enhanced must not show sustained consecutive frames above 33 ms, and its maximum must be materially below the prior 84 ms failure; explain any remaining baseline gap.
