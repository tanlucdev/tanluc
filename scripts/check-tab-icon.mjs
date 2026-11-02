// Run against npm run dev; PLAYWRIGHT_MODULE and CHROME_PATH select existing browser tooling.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL || "http://localhost:3003");
  await page.waitForFunction(() => document.querySelector('link[data-tab-icon]'));
  const icons = () => page.locator('link[data-tab-icon]').evaluateAll((links) => links.map((link) => link.href));
  const green = await icons();
  assert(green.some((href) => href.includes("/icon.svg")));
  const response = await page.request.get(green.find((href) => href.includes("/icon.svg")));
  assert((await response.text()).includes('fill="#5d631d"'));
  for (const hidden of [true, false, true, false]) {
    await page.evaluate((value) => {
      Object.defineProperty(document, "hidden", { configurable: true, value });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
    const current = await icons();
    if (hidden) assert(current.every((href) => decodeURIComponent(href).includes('fill="#93938c"')));
    else assert.deepEqual(current, green);
  }
  console.log("PASS: green square; visibility changes switch to gray and restore green twice");
} finally {
  await browser.close();
}
