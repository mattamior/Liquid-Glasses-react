#!/usr/bin/env node
/** Read-only validation for a target project's Liquid Glass strict evidence. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(scriptDirectory, "..");
const contractPath = path.join(skillRoot, "references", "strict-conformance-contract.json");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json"]);
const ignoredDirectories = new Set(["node_modules", "dist", "build", ".git", ".next", ".wrangler", "coverage"]);

function usage() { return "Usage: node verify-target-integration.mjs --root <project> --manifest <file> [--json]"; }
function plain(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function sha256(filePath) { return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex"); }
function readText(filePath) { return fs.readFileSync(filePath, "utf8"); }
function readJson(filePath, label, errors) { try { return JSON.parse(readText(filePath)); } catch (error) { errors.push(`${label} is not valid JSON: ${error.message}`); return null; } }
function resolveInside(root, candidate, label, errors) {
  if (typeof candidate !== "string" || candidate.trim() === "") { errors.push(`${label} must be a non-empty relative path.`); return null; }
  const resolved = path.resolve(root, candidate);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) { errors.push(`${label} must stay inside --root.`); return null; }
  return resolved;
}
function file(root, candidate, label, errors) {
  const resolved = resolveInside(root, candidate, label, errors);
  if (!resolved) return null;
  try { if (fs.statSync(resolved).isFile()) return resolved; } catch { /* reported below */ }
  errors.push(`${label} is missing: ${candidate}.`); return null;
}
function requireObject(value, label, errors) { if (!plain(value)) { errors.push(`${label} must be an object.`); return false; } return true; }
function requireArray(value, label, errors) { if (!Array.isArray(value)) { errors.push(`${label} must be an array.`); return false; } return true; }
function scriptKind(filePath) { return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : filePath.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.TS; }
function ast(filePath) { return ts.createSourceFile(filePath, readText(filePath), ts.ScriptTarget.Latest, true, scriptKind(filePath)); }
function visit(node, predicate) { let found = false; const walk = (current) => { if (predicate(current)) { found = true; return; } ts.forEachChild(current, walk); }; walk(node); return found; }
function identifierText(node) { return ts.isIdentifier(node) ? node.text : undefined; }
function sourceFiles(root) {
  const result = [];
  const scan = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) { if (!ignoredDirectories.has(entry.name)) scan(path.join(directory, entry.name)); }
      else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) result.push(path.join(directory, entry.name));
    }
  };
  scan(root); return result;
}
function resolveImport(root, importer, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(importer), specifier);
  if (base !== root && !base.startsWith(`${root}${path.sep}`)) return "outside";
  const candidates = [base, ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"].map((extension) => `${base}${extension}`), ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"].map((extension) => path.join(base, `index${extension}`))];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}
function runtimeImports(root, importer, errors) {
  const closure = new Set(); const pending = [importer];
  while (pending.length) {
    const current = pending.pop(); if (!current || closure.has(current)) continue;
    closure.add(current); const tree = ast(current);
    for (const statement of tree.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.importClause?.isTypeOnly) continue;
      const resolved = resolveImport(root, current, statement.moduleSpecifier.text);
      if (resolved === "outside") errors.push(`Relative import escapes target root: ${statement.moduleSpecifier.text} from ${current}.`);
      else if (resolved) pending.push(resolved);
      else if (statement.moduleSpecifier.text.startsWith(".")) errors.push(`Relative runtime import cannot be resolved: ${statement.moduleSpecifier.text} from ${current}.`);
    }
  }
  return closure;
}
function hashEntry(root, value, label, expected, errors) {
  if (!requireObject(value, label, errors)) return null;
  if (value.path !== expected.path) errors.push(`${label}.path must equal ${expected.path}.`);
  if (value.sha256 !== expected.sha256) errors.push(`${label}.sha256 must equal the frozen contract hash.`);
  const target = file(root, value.path, `${label}.path`, errors);
  if (target && sha256(target) !== expected.sha256) errors.push(`${label}.path content hash differs from the frozen contract.`);
  return target;
}
function verifyFrozenIntegration(root, manifest, mode, errors) {
  const expected = mode.integration?.frozen?.[manifest.framework];
  if (!expected) { errors.push(`No frozen integration contract for ${manifest.framework}.`); return {}; }
  const actual = manifest.frozenIntegration;
  if (!requireObject(actual, "frozenIntegration", errors)) return {};
  const resolved = {};
  for (const [key, entry] of Object.entries(expected)) resolved[key] = hashEntry(root, actual[key], `frozenIntegration.${key}`, entry, errors);
  for (const key of Object.keys(actual)) if (!(key in expected)) errors.push(`frozenIntegration contains unsupported entry: ${key}.`);
  return resolved;
}
function verifyKernel(root, manifest, mode, errors) {
  if (!requireObject(manifest.kernel, "kernel", errors) || !requireArray(manifest.kernel.files, "kernel.files", errors)) return [];
  if (manifest.kernel.assetRoot !== mode.kernel.assetRoot) errors.push(`kernel.assetRoot must equal ${mode.kernel.assetRoot}.`);
  const expected = new Map(mode.kernel.files.map((entry) => [entry.path, entry])); const targets = [];
  for (const [index, entry] of manifest.kernel.files.entries()) {
    if (!plain(entry)) { errors.push(`kernel.files[${index}] must be an object.`); continue; }
    const contractEntry = [...expected.values()].find((item) => path.basename(entry.path ?? "") === item.path);
    if (!contractEntry) { errors.push(`kernel.files[${index}] is not a contract kernel file.`); continue; }
    expected.delete(contractEntry.path);
    if (entry.sha256 !== contractEntry.sha256) errors.push(`kernel.files[${index}].sha256 does not match the contract.`);
    const target = file(root, entry.path, `kernel.files[${index}].path`, errors);
    if (target) { targets.push(target); if (sha256(target) !== contractEntry.sha256) errors.push(`Kernel content hash differs from the frozen contract: ${entry.path}.`); }
  }
  for (const entry of expected.values()) errors.push(`kernel.files omits required frozen kernel file ${entry.path}.`);
  return targets;
}
function verifyProduct(root, manifest, mode, adapterPath, errors) {
  if (!requireObject(manifest.product, "product", errors) || !requireArray(manifest.product.entryPoints, "product.entryPoints", errors) || manifest.product.entryPoints.length === 0) { errors.push("product.entryPoints must contain at least one business entry point."); return new Set(); }
  const closure = new Set(); let mounted = false;
  for (const [index, entry] of manifest.product.entryPoints.entries()) {
    const product = file(root, entry, `product.entryPoints[${index}]`, errors); if (!product) continue;
    const entryClosure = runtimeImports(root, product, errors); for (const item of entryClosure) closure.add(item);
    const tree = ast(product); const localNames = new Set();
    for (const statement of tree.statements) if (ts.isImportDeclaration(statement) && !statement.importClause?.isTypeOnly && ts.isStringLiteral(statement.moduleSpecifier) && resolveImport(root, product, statement.moduleSpecifier.text) === adapterPath) {
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) if (item.name.text === `${mode.integration.adapterName}` || item.propertyName?.text === `${mode.integration.adapterName}`) localNames.add(item.name.text);
    }
    const actualMount = visit(tree, (node) => {
      const tag = (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) ? identifierText(node.tagName) : undefined;
      if (!tag || !localNames.has(tag)) return false;
      if (manifest.mode === "v1-fidelity") return true;
      const names = new Set(node.attributes.properties.filter(ts.isJsxAttribute).map((attribute) => attribute.name.text));
      return names.has("navItems");
    });
    mounted ||= actualMount;
  }
  if (!mounted) errors.push("A product entry must runtime-import and actually JSX-mount the matching adapter; V2/V3 require navItems config.");
  return closure;
}
function hasViteRouterConsumption(root, consumer, registrationPath, registrationExport) {
  const tree = ast(consumer); const registrationNames = new Set();
  for (const statement of tree.statements) if (ts.isImportDeclaration(statement) && !statement.importClause?.isTypeOnly && ts.isStringLiteral(statement.moduleSpecifier) && resolveImport(root, consumer, statement.moduleSpecifier.text) === registrationPath) {
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) if (item.propertyName?.text === registrationExport || item.name.text === registrationExport) registrationNames.add(item.name.text);
  }
  const source = readText(consumer);
  return registrationNames.size > 0 && /(?:createBrowserRouter|useRoutes)\s*\(/.test(source) && [...registrationNames].some((name) => new RegExp(`\\b${name}\\s*\\(`).test(source)) && (/RouterProvider/.test(source) || /useRoutes\s*\(/.test(source));
}
function verifyRoute(root, manifest, mode, frozen, productClosure, errors) {
  if (!mode.conformanceRoute.required) return new Set();
  if (!requireObject(manifest.conformanceRoute, "conformanceRoute", errors)) return new Set();
  const route = frozen.conformanceRoute;
  if (manifest.conformanceRoute.path !== mode.integration.frozen[manifest.framework].conformanceRoute.path) errors.push("conformanceRoute.path must equal its frozen integration path.");
  if (manifest.conformanceRoute.sha256 !== mode.integration.frozen[manifest.framework].conformanceRoute.sha256) errors.push("conformanceRoute.sha256 must equal its frozen integration hash.");
  if (manifest.conformanceRoute.availability !== mode.conformanceRoute.availability) errors.push("conformanceRoute.availability must equal the contract value.");
  if (manifest.controlledScene?.path !== mode.integration.frozen[manifest.framework].controlledScene.path || manifest.controlledScene?.sha256 !== mode.integration.frozen[manifest.framework].controlledScene.sha256) errors.push("controlledScene must be the frozen renderer wired into the frozen conformance route.");
  const closure = new Set(route ? runtimeImports(root, route, errors) : []);
  if (manifest.framework === "next-app-router") {
    if (manifest.routeRegistration?.path !== manifest.conformanceRoute.path) errors.push("Next App Router routeRegistration.path must be the frozen filesystem route.");
  } else {
    const registration = frozen.routeRegistration;
    if (!registration || manifest.routeRegistration?.path !== mode.integration.frozen[manifest.framework].routeRegistration.path || manifest.routeRegistration?.sha256 !== mode.integration.frozen[manifest.framework].routeRegistration.sha256) errors.push("Vite routeRegistration must equal the frozen registration template.");
    const consumer = file(root, manifest.routeRegistration?.consumerPath, "routeRegistration.consumerPath", errors);
    if (!consumer) return closure;
    const consumerClosure = runtimeImports(root, consumer, errors); for (const item of consumerClosure) closure.add(item);
    if (!registration || !consumerClosure.has(registration)) errors.push("Vite route consumer must runtime-import frozen route registration.");
    if (![...productClosure].includes(consumer)) errors.push("Vite route consumer must be runtime-reachable from product.entryPoints.");
    if (!hasViteRouterConsumption(root, consumer, registration, mode.integration.routeRegistrationExport)) errors.push("Vite route consumer must pass the frozen registration into createBrowserRouter/useRoutes and mount RouterProvider/useRoutes output.");
  }
  return closure;
}
function verifyFields(root, manifest, mode, frozen, errors) {
  if (!requireObject(manifest.counts, "counts", errors)) return null;
  for (const [key, minimum] of Object.entries(mode.minimumCounts)) if (!Number.isInteger(manifest.counts[key]) || manifest.counts[key] < minimum) errors.push(`counts.${key} must be an integer >= ${minimum}.`);
  if (!requireArray(manifest.roles, "roles", errors) || JSON.stringify(manifest.roles) !== JSON.stringify(mode.stableDomRoles)) errors.push("roles must exactly equal the mode's frozen role selectors and order.");
  if (!requireObject(manifest.optics, "optics", errors) || (mode.conformanceRoute.opticsTier !== "baseline" && (manifest.optics.tier !== mode.conformanceRoute.opticsTier || manifest.optics[mode.conformanceRoute.opticsTier] !== true))) errors.push("optics must declare the mandated strict tier.");
  if (!requireObject(manifest.fallback, "fallback", errors) || JSON.stringify(manifest.fallback) !== JSON.stringify(mode.fallback)) errors.push("fallback must exactly equal the frozen contract.");
  if (!requireArray(manifest.allowedAdaptations, "allowedAdaptations", errors) || JSON.stringify(manifest.allowedAdaptations) !== JSON.stringify(mode.allowedAdaptations)) errors.push("allowedAdaptations must exactly equal the frozen contract.");
  if (!requireArray(manifest.deviations, "deviations", errors) || manifest.deviations.length) errors.push("deviations must be empty to claim strict conformance.");
  const harness = frozen.playwrightHarness;
  if (!requireObject(manifest.verification, "verification", errors) || !requireObject(manifest.verification.e2e, "verification.e2e", errors)) return null;
  if (manifest.verification.e2e.path !== mode.integration.frozen[manifest.framework].playwrightHarness.path || manifest.verification.e2e.sha256 !== mode.integration.frozen[manifest.framework].playwrightHarness.sha256 || (harness && sha256(harness) !== mode.integration.frozen[manifest.framework].playwrightHarness.sha256)) errors.push("verification.e2e must reference an intact frozen Playwright harness.");
  verifyE2eReport(root, manifest.verification.e2e, mode, errors);
  return verifyVisualEvidence(root, manifest.visualApproval, errors);
}
function requiredTitles(report) { const titles = []; const scan = (value) => { if (!value || typeof value !== "object") return; if (typeof value.title === "string") titles.push(value.title); for (const child of Object.values(value)) if (Array.isArray(child)) child.forEach(scan); else if (child && typeof child === "object") scan(child); }; scan(report); return titles; }
function verifyE2eReport(root, e2e, mode, errors) {
  const report = file(root, e2e.reportPath, "verification.e2e.reportPath", errors); if (!report) return;
  if (typeof e2e.reportSha256 !== "string" || sha256(report) !== e2e.reportSha256) errors.push("verification.e2e.reportSha256 must match the report bytes.");
  const value = readJson(report, "Playwright JSON report", errors); if (!value) return;
  const failed = value.stats?.failed ?? value.failures ?? 0;
  if (failed !== 0) errors.push("Playwright JSON report must record zero failures.");
  const titles = requiredTitles(value); for (const title of mode.integration.e2eRequiredTitles) if (!titles.includes(title)) errors.push(`Playwright JSON report omits required test title: ${title}.`);
}
function validIso(value) { return typeof value === "string" && !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value); }
function verifyVisualEvidence(root, approval, errors) {
  if (!requireObject(approval, "visualApproval", errors)) return null;
  if (approval.status === "pending" || approval.status === "rejected") return approval.status;
  if (approval.status !== "approved") { errors.push("visualApproval.status must be pending, rejected, or approved."); return null; }
  const evidence = file(root, approval.evidencePath, "visualApproval.evidencePath", errors); if (!evidence) return;
  if (typeof approval.evidenceSha256 !== "string" || sha256(evidence) !== approval.evidenceSha256) errors.push("visualApproval.evidenceSha256 must match the evidence bytes.");
  const value = readJson(evidence, "Visual approval evidence", errors); if (!value) return;
  if (value.status !== "approved" || typeof value.reviewer !== "string" || !value.reviewer.trim() || !validIso(value.approvedAt)) errors.push("Visual approval evidence requires approved status, reviewer, and a valid ISO timestamp.");
  if (!Array.isArray(value.screenshots) || value.screenshots.length === 0) { errors.push("Visual approval evidence requires non-empty screenshots."); return; }
  for (const [index, shot] of value.screenshots.entries()) { const target = file(root, shot?.path, `visual approval screenshot ${index}.path`, errors); if (!target || typeof shot?.sha256 !== "string" || sha256(target) !== shot.sha256) errors.push(`Visual approval screenshot ${index} hash must match.`); }
  return "approved";
}
function verifyForbiddenProjectText(root, mode, errors) {
  const otherKernels = Object.entries({ "v1-fidelity": "LiquidGlassV1Kernel", "v2-default": "LiquidGlassV2Kernel", "v3-horizontal": "LiquidGlassV3Kernel" }).filter(([name]) => name !== mode).map(([, kernel]) => kernel);
  const blocked = ["v3-05-failed", "v3-milestone-05-failed", "m05", ...otherKernels];
  for (const entry of sourceFiles(root)) { const contents = readText(entry).toLowerCase(); const match = blocked.find((token) => contents.includes(token.toLowerCase())); if (match) errors.push(`Forbidden cross-version or M05 reference "${match}" found in ${entry}.`); }
}
function parseArguments(args) { const values = { json: false }; for (let index = 0; index < args.length; index += 1) { if (args[index] === "--json") { values.json = true; continue; } if (["--root", "--manifest"].includes(args[index])) { const value = args[++index]; if (!value || value.startsWith("--")) throw new Error(`Missing value for ${args[index - 1]}.`); values[args[index - 1].slice(2)] = value; continue; } throw new Error(`Unknown argument: ${args[index]}.`); } if (!values.root || !values.manifest) throw new Error(usage()); return values; }

export function verifyTargetIntegration({ root: requestedRoot, manifest: requestedManifest }) {
  const errors = []; const root = path.resolve(requestedRoot); const contract = readJson(contractPath, "Skill strict conformance contract", errors); const manifestPath = resolveInside(root, requestedManifest, "--manifest", errors); const manifest = manifestPath ? readJson(manifestPath, "Target integration manifest", errors) : null;
  if (!contract || !manifest) return { ok: false, errors, mode: null, conformanceStatus: null };
  const mode = contract.modes?.[manifest.mode];
  if (manifest.schemaVersion !== contract.schemaVersion) errors.push(`schemaVersion must equal ${contract.schemaVersion}.`);
  if (!mode || manifest.conformance !== "strict" || !contract.strictFrameworks.includes(manifest.framework)) errors.push("A strict target must declare a supported mode and framework.");
  let visualStatus = null;
  if (mode && manifest.conformance === "strict" && contract.strictFrameworks.includes(manifest.framework)) {
    const frozen = verifyFrozenIntegration(root, manifest, mode, errors); verifyKernel(root, manifest, mode, errors);
    const adapterPath = frozen.adapter; const productClosure = verifyProduct(root, manifest, mode, adapterPath, errors); verifyRoute(root, manifest, mode, frozen, productClosure, errors); visualStatus = verifyFields(root, manifest, mode, frozen, errors); verifyForbiddenProjectText(root, manifest.mode, errors);
  }
  const conformanceStatus = errors.length > 0
    ? contract.invalidEvidenceStatus
    : visualStatus === "approved"
      ? "strict-complete"
      : contract.statusBeforeVisualApproval;
  return { ok: errors.length === 0, errors, mode: manifest.mode ?? null, conformanceStatus, manifestPath, contractPath };
}
function main() { try { const values = parseArguments(process.argv.slice(2)); const result = verifyTargetIntegration(values); if (values.json) process.stdout.write(`${JSON.stringify(result)}\n`); else if (result.ok) process.stdout.write(`target integration verified: ${result.mode} (${result.conformanceStatus})\n`); else process.stderr.write(`target integration verification failed (${result.errors.length}):\n${result.errors.map((error) => `- ${error}`).join("\n")}\n`); process.exitCode = result.ok ? 0 : 1; } catch (error) { process.stderr.write(`target integration verification failed: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 2; } }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
