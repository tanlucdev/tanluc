// Run against npm run start. BASE_URL can target a deployed preview or production.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/markdown.ts", import.meta.url), "utf8");
const { prefersMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext })).toString("base64")}`);
for (const [accept, expected] of [
  ["", false], ["*/*", false], ["text/html", false], ["text/markdown", true],
  ["TEXT/MARKDOWN", true], ["text/markdown; charset=utf-8", true],
  ["text/markdown;q=0", false], ["text/markdown;q=invalid", false],
  ["text/markdown;q=0.5, text/html;q=0.9", false],
  ["text/markdown;q=0.9, text/html;q=0.5", true],
  ["text/markdown, text/html", true], ["text/markdown;q=0.5, */*", false],
]) assert.equal(prefersMarkdown(accept), expected, accept);

const base = process.env.BASE_URL ?? "http://127.0.0.1:3180";
const request = (path, accept = "text/html", method = "GET") => fetch(new URL(path, base), {
  headers: { Accept: accept }, method, signal: AbortSignal.timeout(60000),
});
const checkVary = (response) => assert.match(response.headers.get("vary") ?? "", /(?:^|[,\s])accept(?:$|[,\s])/i);
const plainText = (html) => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

const html = await request("/");
assert.equal(html.status, 200);
assert.match(html.headers.get("content-type"), /text\/html/);
const body = await html.text();
assert.equal((body.match(/<h1\b/g) ?? []).length, 1);
assert.match(body, /<h1[^>]*>Tan Luc<\/h1>/);
assert(plainText(body).length >= 500);
assert.match(body, /<title>Tan Luc — Software Engineer<\/title>/);
assert.match(body, /rel="canonical" href="https:\/\/tanluc.dev\/"/);
assert(!body.includes("luc.works"));
let lastHeading = 0;
for (const [, level] of body.matchAll(/<h([1-6])\b/g)) {
  assert(Number(level) <= lastHeading + 1, "Headings must not skip a level");
  lastHeading = Number(level);
}
const stylesheets = [...body.matchAll(/<link\b(?=[^>]*rel="stylesheet")[^>]*href="([^"]+)"/g)].map((match) => match[1]);
const css = (await Promise.all(stylesheets.map(async (path) => (await request(path)).text()))).join("\n");
assert.match(css, /\.[\w-]*[Bb]ottom[\w-]*\{[^}]*background:var\(--paper\)/);
assert(!/\.[\w-]*[Bb]ottom[\w-]*\{[^}]*border-radius:/.test(css), "Footer corners stay square");

for (const accept of ["text/markdown", "TEXT/MARKDOWN", "text/markdown;q=1, text/html;q=0.5"]) {
  const response = await request("/", accept);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/markdown/);
  checkVary(response);
  const markdown = await response.text();
  assert(markdown.startsWith("# Tan Luc — Software Engineer\n"));
  assert(markdown.length >= 500 && markdown.includes("Cafe Maps"));
  assert(!markdown.includes("<html"));
}
for (const accept of ["text/html", "*/*", "text/markdown;q=0", "text/markdown;q=0.2, text/html;q=1"]) {
  const response = await request("/", accept);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
}
const head = await request("/", "text/markdown", "HEAD");
assert.equal(head.status, 200);
assert.match(head.headers.get("content-type"), /text\/markdown/);
assert.equal(await head.text(), "");
for (const path of ["/__agent-readiness-404/", "/work/unknown-study/", "/images/unknown-agent-image.png"]) {
  const response = await request(path, "text/markdown");
  assert.equal(response.status, 404, path);
  assert.match(response.headers.get("content-type"), /text\/markdown/);
  checkVary(response);
  const markdown = await response.text();
  assert(markdown.length >= 20 && markdown.includes("[agent instructions](https://tanluc.dev/llms.txt)"));
}
const missingHTML = await request("/__agent-readiness-404/");
assert.equal(missingHTML.status, 404);
assert.match(missingHTML.headers.get("content-type"), /text\/html/);
assert.match(await missingHTML.text(), /This page could not be found/);

const llms = await request("/llms.txt");
assert.equal(llms.status, 200);
assert.match(llms.headers.get("content-type"), /text\/plain/);
const instructions = await llms.text();
assert.match(instructions, /^# Tan Luc\n\n> /);
assert.match(instructions, /## When to use this\n/);
for (const section of instructions.split(/^## .+$/m).slice(1)) {
  assert(section.trim().split("\n").every((line) => /^- \[.+\]\(https:\/\/[^)]+\)/.test(line)), "llms.txt H2 sections contain link lists");
}
const robots = await request("/robots.txt");
assert.equal(robots.status, 200);
assert.match(await robots.text(), /User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/tanluc.dev\/sitemap.xml/);
const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get("content-type"), /(?:application|text)\/xml/);
const xml = await sitemap.text();
assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const workSource = await readFile(new URL("../src/content/work.ts", import.meta.url), "utf8");
for (const [, slug] of workSource.matchAll(/slug: "([^"]+)"/g)) assert(urls.includes(`https://tanluc.dev/work/${slug}/`));
const links = new Set([...urls, ...[...instructions.matchAll(/\]\((https:\/\/tanluc.dev[^)]+)\)/g)].map((match) => match[1])]);
for (const url of links) {
  const path = new URL(url).pathname;
  for (const accept of ["text/html", "text/markdown"]) {
    const response = await request(path, accept);
    assert.equal(response.status, 200, `${path} (${accept})`);
    await response.body?.cancel();
  }
}
console.log(`PASS: negotiation, raw HTML/H1/headings, metadata, square footer CSS, HTML/Markdown 404, llms.txt, robots.txt, sitemap, ${links.size} public URLs.`);
