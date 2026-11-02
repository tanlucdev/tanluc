// Run against npm run dev; PLAYWRIGHT_MODULE and CHROME_PATH select existing browser tooling.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const base = process.env.BASE_URL || "http://localhost:3000";

try {
  for (const width of [320, 390, 700, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width <= 700, hasTouch: width <= 700 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__meadowPaints = 0;
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (...args) {
        if (this.canvas.classList.contains("meadow-tree-canvas")) window.__meadowPaints += 1;
        return clear.apply(this, args);
      };
    });
    await page.goto(base);
    const scene = page.locator(".meadow-scene");
    await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.grassReady === "true");
    assert.equal(await scene.getAttribute("data-scroll-state"), "hero");

    await page.evaluate(() => window.scrollTo({ top: innerHeight * .4, behavior: "instant" }));
    await page.waitForTimeout(1200);
    assert.equal(await scene.getAttribute("data-scroll-state"), "transitioning");
    const middle = await scene.evaluate((node) => {
      const style = getComputedStyle(node);
      return { opacity: Number(style.opacity), transform: style.transform, grass: Number(style.getPropertyValue("--meadow-layer-opacity")), tree: Number(style.getPropertyValue("--tree-layer-opacity")) };
    });
    assert.ok(middle.grass > 0 && middle.grass < middle.tree, "grass dissolves before the tree");
    if (width <= 700) {
      assert.ok(middle.opacity > 0 && middle.opacity < 1, "mobile scene fades during native scrolling");
      assert.equal(middle.transform, "none", "mobile scene stays in document flow");
    } else assert.notEqual(middle.transform, "none", "desktop scene descends during handoff");

    await page.evaluate(() => window.scrollTo({ top: document.getElementById("work").getBoundingClientRect().top + scrollY + innerHeight, behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hidden");
    assert.equal(await scene.evaluate((node) => getComputedStyle(node).visibility), "hidden");
    await page.waitForTimeout(100);
    const paints = await page.evaluate(() => window.__meadowPaints);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.__meadowPaints), paints, "offscreen meadow stops painting");

    const project = page.locator("#work-grateful-forum");
    await project.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => getComputedStyle(document.querySelector("#work-grateful-forum > div")).opacity === "1");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
    assert.equal(await scene.evaluate((node) => Number(getComputedStyle(node).opacity)), 1, "reverse scrolling restores the meadow");
    assert.equal(await project.locator(":scope > div").evaluate((node) => Number(getComputedStyle(node).opacity)), 1, "project reveals do not replay");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.scrollTo({ top: innerHeight, behavior: "instant" }));
    await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hidden");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "no horizontal overflow");
    assert.deepEqual(errors, [], "no browser errors");
    await page.close();
    console.log(`section motion: ${width}px passed`);
  }
} finally {
  await browser.close();
}
