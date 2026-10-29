// Run against npm run dev; PLAYWRIGHT_MODULE can select an existing Playwright installation.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const base = process.env.BASE_URL || "http://localhost:3000";
const instrument = (page) => page.addInitScript(() => {
  window.__wind = { plays: 0, pauses: 0 };
  HTMLMediaElement.prototype.play = function () { window.__wind.plays += 1; this.dispatchEvent(new Event("playing")); return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function () { window.__wind.pauses += 1; };
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await instrument(page);
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("portfolio:welcome-gust-sound", { detail: { startedAt: performance.now() } })));
  assert.equal(await page.evaluate(() => window.__wind.plays), 0, "Untrusted events cannot play wind");
  await page.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  assert.equal(await page.evaluate(() => window.__wind.plays), 1, "First trusted meadow interaction plays once");
  assert.equal(await page.locator(".meadow-tree-canvas").getAttribute("data-welcome-gust"), "true");
  await page.getByRole("button", { name: "Mute meadow wind" }).waitFor();
  await page.locator(".meadow-hero").click({ position: { x: 50, y: 280 } });
  assert.equal(await page.evaluate(() => window.__wind.plays), 1, "Session gate prevents replay");
  await page.evaluate(() => window.scrollTo(0, 10000));
  await page.waitForTimeout(1500);
  assert.equal(await page.locator(".meadow-scene").getAttribute("data-scroll-state"), "hidden");
  assert(await page.evaluate(() => window.__wind.pauses) > 0, "Leaving the hero stops wind");

  for (const path of ["/about", "/photography"]) {
    await page.goto(`${base}${path}`);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("portfolio:welcome-gust-sound", { detail: { startedAt: performance.now() } })));
    assert.equal(await page.evaluate(() => window.__wind.plays), 0, `${path} cannot start wind`);
  }

  const reduced = await browser.newPage();
  await instrument(reduced);
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(base);
  await reduced.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await reduced.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  assert.equal(await reduced.evaluate(() => window.__wind.plays), 0, "Reduced motion suppresses wind");
  await reduced.close();

  const motionChange = await browser.newPage();
  await instrument(motionChange);
  await motionChange.goto(base);
  await motionChange.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await motionChange.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  await motionChange.emulateMedia({ reducedMotion: "reduce" });
  await motionChange.waitForTimeout(50);
  assert(await motionChange.evaluate(() => window.__wind.pauses) > 0, "Motion preference changes stop wind");
  await motionChange.close();

  const hidden = await browser.newPage();
  await instrument(hidden);
  await hidden.addInitScript(() => Object.defineProperty(document, "hidden", { configurable: true, get: () => true }));
  await hidden.goto(base);
  await hidden.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await hidden.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  assert.equal(await hidden.evaluate(() => window.__wind.plays), 0, "Hidden pages suppress wind");
  await hidden.close();

  const blockedStorage = await browser.newPage();
  await instrument(blockedStorage);
  await blockedStorage.addInitScript(() => {
    Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
  });
  await blockedStorage.goto(base);
  await blockedStorage.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await blockedStorage.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  assert.equal(await blockedStorage.evaluate(() => window.__wind.plays), 1);
  await blockedStorage.getByRole("link", { name: "About", exact: true }).click();
  await blockedStorage.waitForURL(/\/about\/?$/);
  await blockedStorage.locator('a[href="/"]').first().click();
  await blockedStorage.waitForURL(base + "/");
  await blockedStorage.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await blockedStorage.locator(".meadow-hero").click({ position: { x: 30, y: 250 } });
  assert.equal(await blockedStorage.evaluate(() => window.__wind.plays), 1, "Blocked storage still prevents replay across client navigation");
  assert.equal(await blockedStorage.getByRole("button", { name: "Mute meadow wind" }).count(), 0, "No stale mute control after returning home");
  await blockedStorage.close();
  console.log("PASS: trusted one-shot wind, route/visibility/reduced-motion suppression, hero cleanup");
} finally {
  await browser.close();
}
