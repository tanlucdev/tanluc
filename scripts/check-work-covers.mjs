// Run against npm run dev; use PLAYWRIGHT_MODULE and CHROME_PATH for local tooling.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL || "http://localhost:3002"}/work/`);
    const covers = page.locator("a[data-project]");
    assert.equal(await covers.count(), 4);
    assert.equal(await page.locator("article video, article button").count(), 0, "covers contain no demo controls");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}px`);
    assert.ok(await page.locator("article").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === "none")), "reduced motion disables arrival");
    for (const cover of await covers.all()) {
      assert.equal((await cover.getAttribute("href")).replace(/\/$/, ""), `/work/${await cover.getAttribute("data-project")}`);
    }
    assert.ok(await covers.first().evaluate((node) => {
      const note = node.querySelector(":scope > div > span:last-child").getBoundingClientRect();
      const panels = node.querySelectorAll(":scope > div > div");
      return Array.from(panels).every((panel) => panel.getBoundingClientRect().bottom < note.top);
    }), "model panels clear the illustration caption");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("a[data-project='medichims']").click();
  await page.waitForURL("**/work/medichims/");
  assert.equal(await page.locator("h1").textContent(), "MedicHIMS");
  assert.ok(await page.getByAltText("MedicHIMS service purchases with usage, status, purchase date and expiry date").evaluate((image) => image.complete && image.naturalWidth > 0));
  await page.goto(`${process.env.BASE_URL || "http://localhost:3002"}/work/`);
  await page.setViewportSize({ width: 1440, height: 900 });
  const cover = page.locator("a[data-project='dynamic-model']");
  await cover.focus();
  assert.equal(await cover.evaluate((node) => document.activeElement === node), true);
  assert.notEqual(await cover.evaluate((node) => getComputedStyle(node).outlineStyle), "none");
  await cover.press("Enter");
  await page.waitForURL("**/work/dynamic-model/");
  console.log("Work covers: responsive layout, reduced motion, keyboard navigation passed.");
} finally {
  await browser.close();
}
