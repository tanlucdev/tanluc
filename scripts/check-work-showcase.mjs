// Run against npm run dev; PLAYWRIGHT_MODULE and CHROME_PATH select local browser tooling.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const base = process.env.BASE_URL || "http://localhost:3000";
const work = "#work-onemedic";
const firstWork = "#work-wala-ict";

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator(".portfolio-home-work nav[data-ready='true']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".portfolio-home img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.evaluate(() => window.scrollTo(0, 0));
  const initialTarget = await page.locator(firstWork).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return window.scrollY + rect.top - Math.max(32, (window.innerHeight - rect.height) / 2);
  });
  assert.ok(initialTarget > 450, "first work starts below the initial desktop viewport");
  await page.mouse.wheel(0, 420);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(200);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(850);
  const handoffTop = await page.evaluate(() => window.scrollY);
  assert.ok(Math.abs(handoffTop - initialTarget) < 3, "initial wheel centers the whole WALA section without burst overshoot");
  assert.equal(await page.locator(firstWork).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.height > window.innerHeight || (rect.top >= 0 && rect.bottom <= window.innerHeight);
  }), true, "handoff fully reveals WALA when it fits");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(100);
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(950);
  assert.ok(await page.evaluate((target) => window.scrollY < target - 80, initialTarget), "upward wheel cancels the handoff");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(1050);
  assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - initialTarget) < 3, "returning to the top rearms the handoff");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(150);
  assert.ok(await page.evaluate((target) => window.scrollY < target - 100, initialTarget), "reduced motion keeps initial wheel native");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(work).scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("[data-work-dot]")).opacity) > .95);
  assert.equal(await page.locator("section[id^='work-']").count(), 4, "four projects render");
  assert.deepEqual(await page.locator(".portfolio-home-work nav a").allTextContents(), ["Dynamic Models", "Cafemaps", "MedicHIMS", "ISB project"], "project navigation follows the case-study order");
  assert.equal(await page.locator("#work-cafemaps").textContent().then((text) => text?.includes("500 registered users") && text.includes("15,000 visits") && text.includes("50 community-contributed cafes")), true, "Cafemaps stats render");
  assert.equal(await page.locator("#work-cafemaps").getByRole("link", { name: "Visit cafemaps.net" }).getAttribute("href"), "https://cafemaps.net", "Cafemaps links to the public product");
  assert.equal(await page.locator("[data-work-reference]").count(), 3, "reference previews are honestly labelled");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "desktop has no horizontal overflow");
  assert.equal(await page.locator(".portfolio-home-work nav a[aria-current='location']").count(), 1, "active project has nav state");
  assert.equal(await page.locator("[data-work-dot]").evaluate((dot) => getComputedStyle(dot).opacity !== "0"), true, "active dot is visible");
  const firstVideo = page.locator("#work-onemedic video");
  assert.equal(await firstVideo.evaluate((video) => !video.paused), true, "visible media plays");
  const rolodex = page.locator("#work-onemedic [role='img'] img").first();
  const beforeCard = await rolodex.evaluate((card) => getComputedStyle(card).transform);
  await page.waitForTimeout(3500);
  assert.notEqual(await rolodex.evaluate((card) => getComputedStyle(card).transform), beforeCard, "visible rolodex advances");
  await page.locator(firstWork).scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  assert.equal(await firstVideo.evaluate((video) => video.paused), true, "offscreen media pauses");
  await page.locator(work).scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const reducedCard = await rolodex.evaluate((card) => getComputedStyle(card).transform);
  await page.waitForTimeout(3500);
  assert.equal(await rolodex.evaluate((card) => getComputedStyle(card).transform), reducedCard, "motion preference changes stop rolodex");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause motion" }).click();
  const pausedCard = await rolodex.evaluate((card) => getComputedStyle(card).transform);
  await page.waitForTimeout(3500);
  assert.equal(await rolodex.evaluate((card) => getComputedStyle(card).transform), pausedCard, "motion control stops rolodex");
  await page.locator(".portfolio-home-work nav a[href='#work-isb-corp']").click();
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => location.hash), "#work-isb-corp", "nav updates the hash");
  assert.equal(await page.locator("#work-isb-corp").evaluate((node) => document.activeElement === node), true, "nav focuses its target");
  const stream = page.locator("#work-isb-corp [role='region']");
  await stream.focus();
  assert.equal(await stream.locator("div").first().evaluate((node) => getComputedStyle(node).animationPlayState), "paused", "focused card stream pauses");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(base, { waitUntil: "domcontentloaded" });
  await mobile.locator(".portfolio-home-work nav[data-ready='true']").waitFor({ state: "attached" });
  await mobile.evaluate(() => document.fonts.ready);
  await mobile.evaluate(() => window.scrollTo(0, 0));
  const mobileTarget = await mobile.locator(firstWork).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return window.scrollY + rect.top - Math.max(32, (window.innerHeight - rect.height) / 2);
  });
  await mobile.mouse.wheel(0, 420);
  await mobile.waitForTimeout(150);
  assert.ok(await mobile.evaluate((target) => window.scrollY < target - 100, mobileTarget), "mobile keeps initial wheel native");
  await mobile.locator(work).scrollIntoViewIfNeeded();
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "mobile has no horizontal overflow");
  await mobile.locator("#work-cafemaps").scrollIntoViewIfNeeded();
  assert.ok(await mobile.locator("[data-cafemaps-stats]").evaluate((node) => node.getBoundingClientRect().height < 80), "Cafemaps stats remain compact on mobile");
  assert.equal(await mobile.locator(".portfolio-home-work nav").evaluate((nav) => getComputedStyle(nav.parentElement).display), "none", "mobile hides the rail");

  for (const [target, direction] of [[page, "row"], [mobile, "column"]]) {
    const footer = target.locator("footer[aria-label='Site footer']");
    assert.equal(await footer.evaluate((node) => getComputedStyle(node).flexDirection), direction, "footer responds to viewport");
    assert.equal(await footer.locator("span").textContent(), "© 2026 Tan Luc");
    await footer.getByRole("link", { name: "Back to top" }).click();
    await target.waitForFunction(() => window.scrollY === 0);
  }

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(base, { waitUntil: "domcontentloaded" });
  await reduced.locator(work).scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(150);
  assert.equal(await reduced.locator(".portfolio-home-work video").first().evaluate((video) => video.paused), true, "reduced motion pauses video");
  assert.equal(await reduced.locator(".portfolio-home-work [class*='cardStream']").evaluate((node) => getComputedStyle(node).animationName), "none", "reduced motion disables card animation");

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await noJsContext.newPage();
  await noJs.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await noJs.locator("section[id^='work-']").count(), 4, "server-rendered work remains visible without JavaScript");
  assert.match(await noJs.getByRole("link", { name: "Stack & experience", exact: true }).getAttribute("href"), /\/about\/?#how-i-build$/, "Home retains the profile teaser alongside the newer showcase");
  await noJsContext.close();
  console.log("work showcase: pass");
} finally {
  await browser.close();
}
