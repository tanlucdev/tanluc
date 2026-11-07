// Run against a production build. Same BASE_URL, PLAYWRIGHT_MODULE, CHROME_PATH as check-rebuild-scene.mjs.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.locator('[data-grass-ready="true"]').waitFor();
  const trigger = page.getByRole("button", { name: "Rebuild this scene" });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  for (const rate of [1, 4]) {
    for (const rebuild of [false, true]) {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate });
      const result = await page.evaluate(async (rebuild) => {
        const gaps = [], tasks = [];
        let last = performance.now();
        const start = last;
        const observer = new PerformanceObserver((list) => tasks.push(...list.getEntries().filter((entry) => entry.startTime >= start).map((entry) => Math.round(entry.duration))));
        observer.observe({ type: "longtask" });
        if (rebuild) document.querySelector("button[aria-haspopup='dialog']").click();
        await new Promise((resolve) => {
          const tick = (now) => { gaps.push(now - last); last = now; if (now - start < 2400) requestAnimationFrame(tick); else resolve(); };
          requestAnimationFrame(tick);
        });
        observer.disconnect();
        gaps.shift(); gaps.sort((a, b) => a - b);
        return { fps: Math.round(gaps.length / ((last - start) / 1000)), p95: Math.round(gaps[Math.floor(gaps.length * 0.95)] * 10) / 10, over50: gaps.filter((gap) => gap > 50).length, longTasks: tasks };
      }, rebuild);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      console.log("PERF", JSON.stringify({ rate, rebuild, ...result }));
      assert(result.p95 < 50, "At least 95% of frames complete within 50ms on this test machine");
      if (rebuild) { await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog[open]")); }
    }
  }
  const metrics = async () => {
    await cdp.send("HeapProfiler.collectGarbage");
    return Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.filter((metric) => ["Nodes", "JSEventListeners", "JSHeapUsedSize"].includes(metric.name)).map((metric) => [metric.name, metric.value]));
  };
  await trigger.click(); await page.keyboard.press("Escape"); await page.waitForTimeout(100);
  const before = await metrics();
  for (let cycle = 0; cycle < 12; cycle++) {
    await trigger.click(); await page.waitForTimeout([80, 650, 1800][cycle % 3]); await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
  }
  const after = await metrics();
  console.log("CLEANUP", JSON.stringify({ before, after }));
  assert.equal(after.Nodes, before.Nodes, "No accumulated DOM nodes after 12 cycles");
  assert.equal(after.JSEventListeners, before.JSEventListeners, "No accumulated event listeners after 12 cycles");
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
  const sizes = [[320, 568], [375, 667], [390, 844], [430, 932], [700, 700], [701, 568], [701, 700], [768, 1024], [812, 375], [834, 1112], [1024, 600], [1024, 768], [1280, 720], [1440, 900], [1920, 1080]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `Home overflow at ${width}×${height}`);
    assert(await page.evaluate(() => document.querySelector(".meadow-hero__copy").getBoundingClientRect().bottom <= document.querySelector(".portfolio-home-work").getBoundingClientRect().top), `Intro overlaps Work at ${width}×${height}`);
    const enabled = await trigger.isVisible();
    assert.equal(enabled, true);
    if (enabled) {
      await trigger.click(); await page.waitForTimeout(1600);
      const controls = await page.getByRole("dialog").getByRole("button", { name: "Skip" }).boundingBox();
      assert(controls.x >= 0 && controls.y >= 0 && controls.x + controls.width <= width && controls.y + controls.height <= height, "Skip stays inside viewport");
      assert(await page.locator("[data-cursor-label]").evaluateAll((labels) => labels.every((label) => {
        if (Number(getComputedStyle(label.parentElement).opacity) < 0.1) return true;
        const bounds = label.getBoundingClientRect();
        return bounds.left >= -1 && bounds.top >= -1 && bounds.right <= innerWidth + 1 && bounds.bottom <= innerHeight + 1;
      })), "Agent labels stay inside the viewport");
      await page.screenshot({ path: join(tmpdir(), `rebuild-qa-${width}-${height}.png`) });
      await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    } else await page.screenshot({ path: join(tmpdir(), `rebuild-qa-${width}-${height}.png`) });
    console.log(`PASS: home ${width}×${height}, rebuild ${enabled ? "on" : "off"}`);
  }
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/work/", "/work/dynamic-model/", "/work/cafe-maps/", "/photography/", "/about/", "/play/"]) {
      await page.goto(base + path); await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `${path} overflows at ${width}px`);
      assert(await page.getByRole("navigation", { name: "Main navigation" }).isVisible());
      console.log(`PASS: ${path} ${width}px`);
    }
  }
  for (const width of [701, 768, 834]) {
    await page.setViewportSize({ width, height: 1024 }); await page.goto(`${base}/about/`);
    for (const photo of await page.locator(".recent-print").all()) {
      await photo.hover(); await page.waitForTimeout(280);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, "Photo and caption stay inside tablet viewport after hover transition");
    }
    await page.mouse.move(0, 0);
    for (const edge of [page.locator(".recent-print button").first(), page.locator(".recent-print button").last()]) {
      await edge.focus(); await page.waitForTimeout(280);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, "Focused edge photos expand inward");
    }
  }
  const touch = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true });
  const touchPage = await touch.newPage(); await touchPage.goto(base);
  touchPage.on("pageerror", (error) => errors.push(error.message));
  await touchPage.locator('[data-grass-ready="true"]').waitFor();
  await touchPage.setViewportSize({ width: 390, height: 844 });
  const touchCDP = await touch.newCDPSession(touchPage);
  await touchCDP.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
  const touchPerformance = await touchPage.evaluate(async () => {
    const gaps = [];
    let last = performance.now();
    const start = last;
    await new Promise((resolve) => {
      const tick = (now) => { gaps.push(now - last); last = now; if (now - start < 2400) requestAnimationFrame(tick); else resolve(); };
      requestAnimationFrame(tick);
    });
    gaps.shift(); gaps.sort((a, b) => a - b);
    return { fps: Math.round(gaps.length / ((last - start) / 1000)), p95: gaps[Math.floor(gaps.length * 0.95)] };
  });
  console.log("TOUCH PERF CPU4x", JSON.stringify(touchPerformance));
  assert(touchPerformance.p95 < 50);
  await touchCDP.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await touchPage.getByRole("button", { name: "Skip" }).tap();
  for (const [width, height] of [[320, 568], [390, 844], [812, 375]]) {
    await touchPage.setViewportSize({ width, height });
    await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
    await touchPage.getByRole("dialog").waitFor();
    await touchPage.waitForTimeout(1600);
    assert(await touchPage.locator("[data-cursor-label]").evaluateAll((labels) => labels.every((label) => {
      const box = label.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight;
    })), "Compact labels stay within touch viewport");
    await touchPage.getByRole("button", { name: "Skip" }).tap();
    await touchPage.waitForFunction(() => !document.querySelector("dialog[open]"));
    assert.equal(await touchPage.evaluate(() => document.documentElement.style.overflow), "");
  }
  await touchPage.setViewportSize({ width: 390, height: 844 });
  await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
  await touchPage.getByRole("status").filter({ hasText: "Scene complete" }).waitFor();
  await touchPage.screenshot({ path: join(tmpdir(), "rebuild-touch-complete.png") });
  await touchPage.waitForFunction(() => !document.querySelector("dialog[open]"));
  await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
  await touchPage.setViewportSize({ width: 844, height: 390 });
  await touchPage.waitForFunction(() => !document.querySelector("dialog[open]"));
  assert.equal(await touchPage.evaluate(() => document.documentElement.style.overflow), "");
  await touchCDP.send("Performance.enable");
  const touchMetrics = async () => {
    await touchCDP.send("HeapProfiler.collectGarbage");
    return Object.fromEntries((await touchCDP.send("Performance.getMetrics")).metrics.filter((metric) => ["Nodes", "JSEventListeners", "JSHeapUsedSize"].includes(metric.name)).map((metric) => [metric.name, metric.value]));
  };
  await touchPage.setViewportSize({ width: 390, height: 844 });
  await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
  await touchPage.getByRole("button", { name: "Skip" }).tap();
  await touchPage.waitForFunction(() => !document.querySelector("dialog[open]"));
  const touchBefore = await touchMetrics();
  for (let cycle = 0; cycle < 8; cycle++) {
    await touchPage.getByRole("button", { name: "Rebuild this scene" }).tap();
    await touchPage.waitForTimeout([80, 650, 1800][cycle % 3]);
    await touchPage.getByRole("button", { name: "Skip" }).tap();
    await touchPage.waitForFunction(() => !document.querySelector("dialog[open]"));
    assert.equal(await touchPage.locator("dialog").evaluate((element) => element.getAnimations({ subtree: true }).length), 0, "No cursor animations continue after mobile exit");
  }
  const touchAfter = await touchMetrics();
  console.log("TOUCH CLEANUP", JSON.stringify({ before: touchBefore, after: touchAfter }));
  assert.equal(touchAfter.Nodes, touchBefore.Nodes);
  assert.equal(touchAfter.JSEventListeners, touchBefore.JSEventListeners);
  assert.equal(await touchPage.evaluate(() => document.documentElement.style.overflow), "");
  await touchPage.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "About", exact: true }).tap();
  await touchPage.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/about");
  assert.equal(await touchPage.evaluate(() => document.documentElement.style.overflow), "", "Navigation remains scrollable after repeated mobile rebuilds");
  await touch.close();
  assert.deepEqual(errors, []);
  console.log("PASS: responsive, gallery captions, touch, production performance, repeated cleanup; no runtime errors");
} finally { await browser.close(); }
