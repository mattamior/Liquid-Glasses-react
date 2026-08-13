import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("redirects the root route to the current V2 demo", async () => {
  const response = await render("/");
  assert.equal(response.status, 307);
  assert.equal(
    new URL(response.headers.get("location"), "http://localhost/").pathname,
    "/v2",
  );
});

test("renders the frozen Liquid Lab V1 demo", async () => {
  const response = await render("/v1");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab V1 — Archived Demo/);
  assert.match(html, /demo-shell theme-light/);
  assert.match(html, /LIGHT,/);
  assert.match(html, /ENTER PLAYGROUND/);
  assert.match(html, /MATERIAL CONTROLS/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("renders the Liquid Lab V2 navigation demo", async () => {
  const response = await render("/v2");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab V2/);
  assert.match(html, /data-theme="light"/);
  assert.match(html, /data-sidebar="expanded"/);
  assert.match(html, /主页/);
  assert.match(html, /产品/);
  assert.match(html, /动态/);
  assert.match(html, /关于/);
  assert.match(html, /data-optics-tier="baseline"/);
  assert.match(html, /data-glass-active="false"/);
  assert.match(html, /id="v2-theme-bootstrap"/);
  assert.match(html, /<nav\b[^>]*aria-label="页面导航"/);
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(html, /aria-label="液态玻璃渲染方式"/);
  assert.match(html, /v2-menu-visual-item" data-selected="true"/);
  assert.equal((html.match(/<article\b[^>]*class="v2-card"/g) ?? []).length, 3);
  assert.equal((html.match(/data-card-optics="baseline"/g) ?? []).length, 3);
  assert.equal((html.match(/class="v2-card-content"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length > 0, true);
  assert.doesNotMatch(html, /v2-card-filter-definitions/);
  assert.doesNotMatch(html, /v2-card-optics-rim/);
  assert.doesNotMatch(html, /data-v2-scene="replica"/);
  assert.doesNotMatch(html, /data-refraction="baseline"/);
  assert.doesNotMatch(html, /v2-menu-visual-world--lens/);
  assert.doesNotMatch(html, /v2-menu-visual-world--above/);
  assert.doesNotMatch(html, /v2-menu-visual-world--below/);
  assert.doesNotMatch(html, /data-lens-source/);
  assert.doesNotMatch(html, /REFRACT|LIGHT/);
});

test("renders the local Liquid Lab brand preview", async () => {
  const response = await render("/brand-preview");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab — Brand preview/);
  assert.match(html, /LIQUID LAB \/ MARK REVIEW/);
  assert.match(html, /标志深浅色预览/);
  assert.match(html, /暗色模式/);
  assert.match(html, /亮色模式/);
  assert.match(html, /brand-preview__mark--hero/);
});

test("renders the independent Liquid Lab V3 navigation lens demo", async () => {
  const response = await render("/v3");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab V3 — Horizontal navigation lens/);
  assert.match(html, /aria-label="V3 liquid glass study"/);
  assert.match(html, /data-optics="baseline"/);
  assert.match(html, /<nav\b[^>]*aria-label="主导航"/);
  assert.match(html, /class="v3-selection-slider"[^>]*data-active-id="open"[^>]*data-phase="idle"/);
  assert.match(html, /class="v3-selection-slider"[^>]*data-visible="true"/);
  assert.match(html, /class="v3-lens-optics-viewport"/);
  assert.match(html, /data-visual-layer="base"/);
  assert.match(html, /data-visual-layer="selection"/);
  assert.match(html, /data-visual-layer="lens"/);

  for (const label of ["关注", "市场", "动态", "开户"]) {
    assert.match(
      html,
      new RegExp(`<button\\b[^>]*aria-label="切换到${label}"`),
    );
  }

  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /data-lens="moving"/);
  assert.doesNotMatch(html, /data-moving="true"/);
});

test("renders the isolated V3 M05 failed-release archive without indexing it", async () => {
  const response = await render("/v3-05-failed");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab V3 — M05 Failed Release Archive/);
  assert.match(html, /<meta[^>]+name="robots"[^>]+content="noindex,\s*nofollow"/);
  assert.match(html, /id="v3-05-failed-theme-bootstrap"/);
  assert.match(html, /class="v3-05-failed-demo"/);
  assert.match(html, /class="v3-05-failed-selection-slider"[^>]*data-active-id="open"[^>]*data-phase="idle"/);
  assert.match(html, /<nav\b[^>]*aria-label="主导航"/);
  assert.doesNotMatch(html, /class="v3-demo"/);
});
