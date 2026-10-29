// Run against npm run dev; optional BASE_URL, PLAYWRIGHT_MODULE, CHROME_PATH.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const base = process.env.BASE_URL || "http://localhost:3000";
const normalPath = (path) => path.replace(/\/$/, "") || "/";
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.arrivals = [];
    document.addEventListener("animationstart", ({ target, animationName }) => {
      if (animationName !== "page-arrive") return;
      const style = getComputedStyle(target);
      window.arrivals.push({ path: location.pathname, gallery: target.matches(".photo-gallery"), duration: style.animationDuration, easing: style.animationTimingFunction });
    });
  });
  await page.goto(base);
  await page.locator(".route-arrival").waitFor();
  await page.evaluate(() => { window.originalHeader = document.querySelector("header"); });
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  const checkArrival = async (path) => {
    await page.waitForURL((url) => normalPath(url.pathname) === path);
    await page.waitForFunction((path) => window.arrivals.some((event) => (event.path.replace(/\/$/, "") || "/") === path), path);
    const events = await page.evaluate(() => window.arrivals);
    const event = events.find((event) => normalPath(event.path) === path);
    assert.equal(event.duration, path === "/photography" ? "0.2s" : "0.46s");
    assert.equal(event.gallery, path === "/photography");
    assert.equal(event.easing, "cubic-bezier(0.23, 1, 0.32, 1)");
    assert.equal(events.length, 1, "One arrival, no double fade on Photo");
    await page.waitForTimeout(500);
    assert.equal(await page.locator(".route-arrival").evaluate((element) => getComputedStyle(element).opacity), "1");
    assert(await page.evaluate(() => document.querySelector("header") === window.originalHeader), "Header stays mounted");
    assert.equal(await page.evaluate(() => performance.timeOrigin), timeOrigin, "Navigation does not reload the document");
    assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), "No horizontal overflow");
    console.log(`PASS: arrival ${path}`);
  };
  for (const [name, path] of [["Photo", "/photography"], ["About", "/about"], ["Tan Luc", "/"], ["About", "/about"], ["Photo", "/photography"], ["Tan Luc", "/"]]) {
    await page.evaluate(() => { window.arrivals = []; });
    await page.locator("header").getByRole("link", { name, exact: true }).click();
    await checkArrival(path);
  }
  await page.evaluate(() => { window.arrivals = []; });
  await page.goBack();
  await checkArrival("/photography");
  await page.evaluate(() => { window.arrivals = []; });
  await page.goForward();
  await checkArrival("/");
  await page.locator("header").getByRole("link", { name: "Photo", exact: true }).click();
  await page.locator("header").getByRole("link", { name: "About", exact: true }).click();
  await page.waitForURL((url) => normalPath(url.pathname) === "/about");
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".route-arrival").evaluate((element) => getComputedStyle(element).opacity), "1", "Rapid navigation never leaves a hidden page");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ["Photo", "Tan Luc", "About"]) {
    await page.locator("header").getByRole("link", { name, exact: true }).click();
    assert.equal(await page.locator(".route-arrival").evaluate((element) => getComputedStyle(element).animationName), "none");
    if (name === "Photo") {
      await page.locator('.photo-gallery[data-ready="true"]').waitFor();
      assert.equal(await page.locator(".photo-gallery").evaluate((element) => getComputedStyle(element).animationName), "none");
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  }
  assert.deepEqual(errors, []);
  console.log("PASS: six directions, Back/Forward, rapid clicks, persistent header, no reload, reduced motion, mobile");
} finally {
  await browser.close();
}
