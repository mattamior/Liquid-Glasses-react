import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyTargetIntegration } from "../scripts/verify-target-integration.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(fs.readFileSync(path.join(skillRoot, "references/strict-conformance-contract.json"), "utf8"));
const hash = (contents) => crypto.createHash("sha256").update(contents).digest("hex");
function write(root, target, contents) { const absolute = path.join(root, target); fs.mkdirSync(path.dirname(absolute), { recursive: true }); fs.writeFileSync(absolute, contents); }
function copy(root, source, target) { write(root, target, fs.readFileSync(source)); }
function short(mode) { return mode === "v1-fidelity" ? "v1" : mode === "v2-default" ? "v2" : "v3"; }
function template(framework, file) { return path.join(skillRoot, "assets", "strict-templates", framework, file); }
function assetHarness(mode) { return path.join(skillRoot, "assets", mode === "v1-fidelity" ? "v1-playwright-contract.spec.ts" : "playwright-contract-template.spec.ts"); }
function report(titles) { return { stats: { failed: 0 }, suites: titles.map((title) => ({ title, specs: [{ title, tests: [{ status: "passed" }] }] })) }; }
function fixture(modeName, framework) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "liquid-glass-target-")); const mode = contract.modes[modeName]; const frozen = mode.integration.frozen[framework];
  const extension = framework === "next-app-router" ? "app" : "src";
  const kernel = mode.kernel.files.map((entry) => { const target = `${extension}/liquid-glass/kernel/${entry.path}`; copy(root, path.join(skillRoot, mode.kernel.assetRoot, entry.path), target); return { path: target, sha256: entry.sha256 }; });
  const copyFrozen = (key) => { const entry = frozen[key]; if (!entry) return; const source = key === "playwrightHarness" ? assetHarness(modeName) : template(framework, framework === "next-app-router" ? key === "adapter" ? `${short(modeName)}-strict-adapter.tsx` : key === "conformanceRoute" ? `${short(modeName)}-conformance-page.tsx` : "conformance-scene.tsx" : key === "adapter" ? `${short(modeName)}-strict-adapter.tsx` : key === "conformanceRoute" ? `${short(modeName)}-conformance-route.tsx` : key === "routeRegistration" ? `${short(modeName)}-conformance-route-registration.tsx` : "conformance-scene.tsx"); copy(root, source, entry.path); };
  for (const key of Object.keys(frozen)) copyFrozen(key);
  const adapterImport = framework === "next-app-router" ? "../liquid-glass/strict-adapter" : "./liquid-glass/strict-adapter";
  const product = framework === "next-app-router" ? "app/dashboard/page.tsx" : "src/App.tsx";
  const name = mode.integration.adapterName;
  const props = modeName === "v1-fidelity" ? "" : ' navItems={[{ id: "a", label: "A", route: "/a" }, { id: "b", label: "B", route: "/b" }]}' ;
  write(root, product, `import { ${name} } from "${adapterImport}";\n${framework === "vite-react-router" && mode.conformanceRoute.required ? 'import "./router";\n' : ""}export default function Product() { return <${name}${props} />; }\n`);
  const manifest = { schemaVersion: contract.schemaVersion, mode: modeName, conformance: "strict", framework, kernel: { assetRoot: mode.kernel.assetRoot, files: kernel }, adapter: frozen.adapter, frozenIntegration: frozen, product: { entryPoints: [product] }, counts: { ...mode.minimumCounts }, roles: mode.stableDomRoles, optics: { tier: mode.conformanceRoute.opticsTier, ...(mode.conformanceRoute.opticsTier === "enhanced" ? { enhanced: true } : {}), ...(mode.conformanceRoute.opticsTier === "edge" ? { edge: true } : {}) }, fallback: mode.fallback, allowedAdaptations: mode.allowedAdaptations, deviations: [] };
  if (mode.conformanceRoute.required) {
    manifest.conformanceRoute = { ...frozen.conformanceRoute, availability: mode.conformanceRoute.availability };
    manifest.controlledScene = { ...frozen.controlledScene, deterministic: true, grid: true, type: true, colorBands: true };
    if (framework === "next-app-router") manifest.routeRegistration = { path: frozen.conformanceRoute.path };
    else { const consumer = "src/router.tsx"; write(root, consumer, `import { createBrowserRouter, RouterProvider } from "react-router-dom";\nimport { ${mode.integration.routeRegistrationExport} } from "./liquid-glass/${short(modeName)}-conformance-route-registration";\nconst router = createBrowserRouter([...${mode.integration.routeRegistrationExport}()]);\nexport function Routes() { return <RouterProvider router={router} />; }\n`); manifest.routeRegistration = { ...frozen.routeRegistration, consumerPath: consumer }; }
  }
  write(root, "test-results/shot.png", "not-an-image-but-hash-locked-test-evidence");
  const visual = { status: "approved", reviewer: "blind reviewer", approvedAt: "2026-08-13T00:00:00.000Z", screenshots: [{ path: "test-results/shot.png", sha256: hash(fs.readFileSync(path.join(root, "test-results/shot.png"))) }] }; write(root, "test-results/visual.json", JSON.stringify(visual));
  const e2e = report(mode.integration.e2eRequiredTitles); write(root, "test-results/e2e.json", JSON.stringify(e2e));
  manifest.verification = { e2e: { ...frozen.playwrightHarness, reportPath: "test-results/e2e.json", reportSha256: hash(fs.readFileSync(path.join(root, "test-results/e2e.json"))) } }; manifest.visualApproval = { status: "approved", evidencePath: "test-results/visual.json", evidenceSha256: hash(fs.readFileSync(path.join(root, "test-results/visual.json"))) };
  write(root, "liquid-glass.integration.json", JSON.stringify(manifest, null, 2)); return { root, manifest };
}
function persist(current) { write(current.root, "liquid-glass.integration.json", JSON.stringify(current.manifest, null, 2)); }
function check(current) { return verifyTargetIntegration({ root: current.root, manifest: "liquid-glass.integration.json" }); }
function cleanup(current, context) { context.after(() => fs.rmSync(current.root, { recursive: true, force: true })); }

test("accepts all six frozen strict fixtures and keeps pending visual review out of strict-complete", (context) => { for (const mode of Object.keys(contract.modes)) for (const framework of contract.strictFrameworks) { const current = fixture(mode, framework); cleanup(current, context); const result = check(current); assert.equal(result.ok, true, `${mode}/${framework}: ${result.errors.join("\n")}`); assert.equal(result.conformanceStatus, "strict-complete"); } const pending = fixture("v2-default", "next-app-router"); cleanup(pending, context); pending.manifest.visualApproval = { status: "pending", evidencePath: "test-results/visual.json", evidenceSha256: "" }; persist(pending); const pendingResult = check(pending); assert.equal(pendingResult.ok, true, pendingResult.errors.join("\n")); assert.equal(pendingResult.conformanceStatus, "implemented-awaiting-visual-approval"); });
test("rejects type-only, unmounted, and configless product adapters", (context) => { const current = fixture("v3-horizontal", "next-app-router"); cleanup(current, context); write(current.root, "app/dashboard/page.tsx", 'import type { V3StrictAdapter } from "../liquid-glass/strict-adapter"; export default function Product() { return null; }'); const result = check(current); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /runtime-import and actually JSX-mount/); });
test("rejects a changed frozen adapter, route, scene, or harness", (context) => { const current = fixture("v2-default", "vite-react-router"); cleanup(current, context); for (const entry of Object.values(current.manifest.frozenIntegration)) fs.appendFileSync(path.join(current.root, entry.path), "\n// changed"); const result = check(current); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /content hash differs/); });
test("rejects selector substitution and self-reported verifier status", (context) => { const current = fixture("v3-horizontal", "next-app-router"); cleanup(current, context); current.manifest.roles[0].selector = ".fake"; current.manifest.verification.targetVerifier = { status: "passed" }; persist(current); const result = check(current); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /roles must exactly/); });
test("rejects fake E2E reports and fake visual approvals", (context) => { const current = fixture("v3-horizontal", "next-app-router"); cleanup(current, context); write(current.root, "test-results/e2e.json", JSON.stringify({ stats: { failed: 1 }, suites: [] })); write(current.root, "test-results/visual.json", JSON.stringify({ status: "approved", reviewer: "", approvedAt: "bad", screenshots: [] })); const result = check(current); assert.equal(result.ok, false); assert.equal(result.conformanceStatus, "non-compliant"); assert.match(result.errors.join("\n"), /reportSha256|zero failures|Visual approval/); });
test("rejects Vite route consumers that do not consume registration in a live router", (context) => { const current = fixture("v3-horizontal", "vite-react-router"); cleanup(current, context); write(current.root, "src/router.tsx", 'import { createV3ConformanceRoute } from "./liquid-glass/v3-conformance-route-registration"; export const routes = createV3ConformanceRoute();'); const result = check(current); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /createBrowserRouter\/useRoutes/); });
test("rejects M05 and other-mode kernels anywhere in project source, including aliases and dynamic imports", (context) => { const current = fixture("v3-horizontal", "vite-react-router"); cleanup(current, context); write(current.root, "src/hidden.ts", 'const bad = import("@alias/v3-05-failed"); const old = require("LiquidGlassV2Kernel");'); const result = check(current); assert.equal(result.ok, false); assert.match(result.errors.join("\n"), /M05|LiquidGlassV2Kernel/); });
