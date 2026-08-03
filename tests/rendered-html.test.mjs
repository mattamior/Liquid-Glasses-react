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

test("redirects the root route to the frozen V1 demo", async () => {
  const response = await render("/");
  assert.equal(response.status, 307);
  assert.equal(
    new URL(response.headers.get("location"), "http://localhost/").pathname,
    "/v1",
  );
});

test("renders the frozen Liquid Lab V1 demo", async () => {
  const response = await render("/v1");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Liquid Lab/);
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
  assert.match(html, /data-refraction="baseline"/);
});
