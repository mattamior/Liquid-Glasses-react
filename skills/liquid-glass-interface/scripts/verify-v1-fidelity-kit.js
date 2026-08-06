import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(skillRoot, "assets/v1-fidelity-kit");
const source = fs.readFileSync(path.join(root, "index.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "fidelity.css"), "utf8");
const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const appleEnglish = fs.readFileSync(path.join(skillRoot, "references/apple-design-logic.en.md"), "utf8");
const appleChinese = fs.readFileSync(path.join(skillRoot, "references/apple-design-logic.zh.md"), "utf8");
const acceptance = fs.readFileSync(path.join(skillRoot, "references/visual-acceptance.md"), "utf8");
const checks = [
  ["one shared memoized SceneArtwork model", /export const SceneArtwork = memo\(function SceneArtwork[\s\S]*<div className="fidelity-scene"/],
  ["visible stage and replica reuse SceneArtwork", /function FidelityStage[\s\S]*<SceneArtwork copy="visible" \/>[\s\S]*<SceneArtwork copy="replica" \/>/],
  ["instance-safe SVG IDs", /function safeSvgId[\s\S]*useId\(\)/],
  ["geometry-specific field", /createRoundedEdgeField\(geometry\.width, geometry\.height, radius\)/],
  ["SDF edge field", /roundedRectangleDistance[\s\S]*smoothstep/],
  ["RGB filter chain", /red-source[\s\S]*green-source[\s\S]*blue-source[\s\S]*feBlend/],
  ["stage dimensions are measured", /stageWidth: stageRect\.width, stageHeight: stageRect\.height, width: surfaceRect\.width, height: surfaceRect\.height, ready: true/],
  ["replica world uses complete stage dimensions", /width: `\$\{geometry\.stageWidth\}px`, height: `\$\{geometry\.stageHeight\}px`/],
  ["replica world uses exact negative surface origin", /worldPosition\.current = \{ x: -x, y: -y \}[\s\S]*--fidelity-world-x/],
  ["overscan is compensated outside the world", (contents) => /fidelity-replica-overscan" style=\{\{ inset: -overscan \}\}/.test(contents) && /replicaFilterStyle = \{ inset: `\$\{overscan\}px`/.test(contents)],
  ["no uncorrected replica scale", (contents) => !/\.fidelity-replica(?:[^{\s]*)?\{[^}]*transform\s*:\s*scale/.test(contents)],
  ["no manual scroll offset", (contents) => !/scrollY|pageYOffset/.test(contents)],
  ["alignment markers exist", /data-fidelity-scene=\{copy\}[\s\S]*data-fidelity-anchor="grid"[\s\S]*data-fidelity-anchor="word"/],
  ["open state invalidates surface geometry", /useSurfaceGeometry\(stageRef, surfaceRef, geometryKey, updateWorld\)[\s\S]*geometryKey=\{open\}/],
  ["surface transition and animation end reschedule geometry", /addEventListener\("transitionend", scheduleAfterSurfaceMotion\)[\s\S]*addEventListener\("animationend", scheduleAfterSurfaceMotion\)[\s\S]*removeEventListener\("transitionend", scheduleAfterSurfaceMotion\)[\s\S]*removeEventListener\("animationend", scheduleAfterSurfaceMotion/],
  ["motion events are coalesced after the surface itself changes", /event\.target === surfaceNode\) scheduleLayout\(\)/],
  ["centered fixed clusters use an absolute popover contract", /fidelity-menu-cluster--viewport-centered\{position:fixed[\s\S]*fidelity-menu-cluster--viewport-centered \.fidelity-popover\{position:absolute[\s\S]*max-height:min\(330px,calc\(50vh - 48px\)\)/],
  ["ResizeObserver is not the only transform lifecycle signal", (contents) => /ResizeObserver\(scheduleLayout\)/.test(contents) && /transitionend/.test(contents) && /animationend/.test(contents)],
  ["persistent measured selection plate", /usePlate[\s\S]*fidelity-selection/],
  ["dark/light material tokens", /FIDELITY_TUNING[\s\S]*dark:[\s\S]*light:/],
  ["optical-only clipping", /fidelity-optical-clip[\s\S]*overflow:hidden/],
  ["toolbar-popover coupling", /fidelity-coupling[\s\S]*\.fidelity-menu-cluster\.is-open/],
  ["toolbar grid is on the business content wrapper", /\.fidelity-toolbar>\.fidelity-content\{display:grid;width:100%;min-height:64px;padding:8px;box-sizing:border-box;grid-template-columns:48px minmax\(0,1fr\) 48px/],
  ["toolbar surface is not the grid container", (contents) => !/\.fidelity-toolbar\{[^}]*display:grid/.test(contents)],
  ["popover content fills its surface", /\.fidelity-popover>\.fidelity-content\{width:100%;box-sizing:border-box\}/],
  ["narrow viewport retains three toolbar columns", /@media \(max-width:560px\)\{[\s\S]*grid-template-columns:44px minmax\(0,1fr\) 44px/],
  ["closed popover unmounts expensive surface", /const popoverMounted = open \|\| exiting;[\s\S]*popoverMounted \? <RefractedSurface/],
  ["field starts at zero geometry and waits for readiness", /stageWidth: 0, stageHeight: 0, width: 0, height: 0, ready: false[\s\S]*enhancedReady \? createRoundedEdgeField/],
  ["scroll updates world without React state", (contents) => { const match = contents.match(/const updateWorldPosition = \(\) => \{([\s\S]*?)\};/); return Boolean(match) && !match[1].includes("setGeometry") && /window\.addEventListener\("scroll", scheduleWorld/.test(contents); }],
  ["filter window is lens sized, not the full world", /fidelity-replica-filter" style=\{replicaFilterStyle\}[\s\S]*fidelity-replica-world[\s\S]*\.fidelity-replica-world\{overflow:hidden;transform:/],
  ["enhanced material keeps blur low", (contents) => /data-material-mode=enhanced\] \.fidelity-fill\{backdrop-filter:blur\(2px\)/.test(contents) && /replicaFilterStyle = \{[\s\S]*blur\(1px\)/.test(contents)],
  ["material mode controls the surface", /export type MaterialMode = "baseline" \| "enhanced"[\s\S]*data-material-mode=\{mode\}[\s\S]*mode = "enhanced"/],
  ["A/B refraction marker and mode attribute exist", /data-fidelity-anchor="word"[\s\S]*data-material-mode=\{mode\}/],
];
const contents = `${source}\n${css}`;
for (const [name, expression] of checks) {
  const passes = expression instanceof RegExp ? expression.test(contents) : expression(contents);
  if (!passes) throw new Error(`Missing fidelity invariant: ${name}`);
}
const governanceChecks = [
  ["official Apple authority is routed before mechanics", skill.includes("## Apple Design Authority") && skill.indexOf("apple-design-logic.en.md") < skill.indexOf("## Versioned Asset Selection")],
  ["official source priority is explicit", /Human Interface Guidelines[\s\S]*Apple Developer Documentation[\s\S]*Apple WWDC[\s\S]*Community/.test(appleEnglish)],
  ["Apple variants and Web tiers cannot be conflated", appleEnglish.includes("Baseline/Enhanced are not aliases") && appleChinese.includes("Baseline/Enhanced 不是 Regular/Clear 的别名")],
  ["Apple-aligned design has vetoes", acceptance.includes("## Official Apple Design Vetoes") && appleEnglish.includes("## Apple-Aligned Vetoes")],
  ["test scenes are separated from production steady states", appleEnglish.includes("Blind tests and visual QA are deliberate exceptions") && appleChinese.includes("盲测和视觉 QA 是例外")],
];
for (const [name, passes] of governanceChecks) {
  if (!passes) throw new Error(`Missing design-governance invariant: ${name}`);
}
console.log(`v1-fidelity-kit assertions passed (${checks.length + governanceChecks.length} invariants)`);
console.log("manual geometry gate: measure desktop and <=560px toolbar height (56-76px), three non-overlapping columns, centered title, and an in-viewport popover.");
