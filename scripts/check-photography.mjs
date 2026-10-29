// Run against npm run dev. Requires Playwright; PLAYWRIGHT_MODULE may point to an existing installation.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [2048, 1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base);
      await page.addStyleTag({ content: "html { scrollbar-gutter: stable; }" });
      await page.evaluate(() => window.scrollTo({ left: 500, top: 0, behavior: "instant" }));
      assert.equal(await page.evaluate(() => scrollX), 0, `Home overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/photography`);
    await page.locator('.photo-gallery[data-ready="true"]').waitFor();
    const total = await page.locator(".photo-result").count();
    assert(total > 0);
    assert.match(await page.locator(".photo-result img").first().getAttribute("src"), /\/generated\/thumbnail\/[a-f0-9]{64}\.webp$/);
    const search = page.getByRole("searchbox");
    const heightBeforeFilter = await page.locator(".photo-gallery").evaluate((element) => element.getBoundingClientRect().height);
    await search.fill("sunsets");
    await page.waitForFunction(() => document.querySelector('[role="status"]').textContent.includes("matching sunsets"));
    const falling = await page.locator('.photo-result[data-visible="false"]').first().evaluate((element) => element.getAnimations().map((animation) => animation.effect.getKeyframes()));
    assert(falling.some((frames) => frames.some((frame) => /rotate/.test(frame.transform))), "Filtered photos must fall and rotate");
    const fallTiming = await page.locator('.photo-result[data-visible="false"]').first().evaluate((element) => element.getAnimations()[0].effect.getTiming());
    assert(fallTiming.duration >= 600 && fallTiming.duration <= 690, "Fall lasts 600-690ms");
    assert((await page.locator(".photo-gallery").evaluate((element) => element.getBoundingClientRect().height)) >= heightBeforeFilter, "Grid holds its old height while photos fall");
    const survivorDelay = await page.locator('.photo-result[data-visible="true"]').first().evaluate((element) => element.getAnimations()[0]?.effect.getTiming().delay ?? 0);
    assert(survivorDelay >= 780, "Survivors reflow after the fall and 180ms gap");
    await page.waitForTimeout(1600);
    assert((await page.locator(".photo-gallery").evaluate((element) => element.getBoundingClientRect().height)) < heightBeforeFilter, "Grid shrinks after animation completes");
    const selected = page.locator('.photo-result[data-visible="true"]');
    assert(await selected.count() > 0 && await selected.count() < total);
    assert.equal(await page.locator('.photo-result[data-visible="false"]').first().getAttribute("tabindex"), "-1");
    const first = selected.first();
    const title = await first.getAttribute("aria-label");
    await first.click();
    assert(await page.getByRole("dialog").evaluate((dialog) => dialog.matches(":modal")));
    assert.match(await page.locator(".photo-lightbox__full").getAttribute("src"), /\/generated\/full\/[a-f0-9]{64}\.webp$/);
    assert(await page.locator(".photo-lightbox__media").evaluate((element) => {
      const style = getComputedStyle(element);
      return style.padding === "0px" && style.borderWidth === "0px" && style.backgroundColor === "rgba(0, 0, 0, 0)" && style.boxShadow === "none";
    }), "Photography lightbox has no frame");
    assert(await page.locator(".photo-lightbox__media").evaluate((element) => element.getAnimations().length > 0), "Photo must zoom from its thumbnail");
    assert.equal(await page.locator(".photo-lightbox__media").evaluate((element) => element.getAnimations()[0].effect.getKeyframes()[0].opacity), "1", "Zoom starts at the visible thumbnail");
    await page.waitForTimeout(650);
    const label = await page.getByRole("dialog").getAttribute("aria-label");
    await page.keyboard.press("ArrowRight");
    assert.notEqual(await page.getByRole("dialog").getAttribute("aria-label"), label);
    await page.keyboard.press("ArrowLeft");
    assert.equal(await page.getByRole("dialog").getAttribute("aria-label"), label);
    await page.keyboard.press("Tab");
    assert(await page.getByRole("dialog").evaluate((dialog) => dialog.contains(document.activeElement)), "Focus stays in modal");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "detached" });
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), title);
    assert.equal(await first.evaluate((element) => getComputedStyle(element).visibility), "visible");
    await search.fill("no-matching-photos-xyz");
    await page.getByText("No photographs found.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Search photographs");
    await page.waitForFunction((count) => document.querySelectorAll('.photo-result[data-visible="true"]').length === count, total);
    const returning = await page.locator('.photo-result[data-visible="true"]').first().evaluate((element) => element.getAnimations().flatMap((animation) => animation.effect.getKeyframes()));
    assert(returning.some((frame) => frame.transform === "translateY(72px)" && !/rotate/.test(frame.transform)), "Returning photos rise without rotation");
    await search.fill("nature");
    await search.fill("city");
    await page.waitForFunction(() => document.querySelector('[role="status"]').textContent.includes("matching city"));
    assert.equal(await page.locator(".photo-result[data-silent-hover='true']").count(), total);
    for (const option of ["Color", "Photography style", "Selected work"]) {
      await page.locator(".photo-sort summary").click();
      await page.getByRole("button", { name: option, exact: true }).click();
      assert.equal(await page.locator(".photo-sort summary").getAttribute("aria-label"), `Sort photos: ${option}`);
    }
    for (const width of [1440, 1000, 800, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(900);
      const boxes = await selected.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().toJSON()));
      assert(boxes.every((box) => box.left >= 0 && box.right <= width + 1 && box.width > 0));
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        assert(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1, "Masonry photos overlap");
      }
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await search.fill("nature");
    await page.waitForFunction(() => document.querySelector('[role="status"]').textContent.includes("matching nature"));
    assert.equal(await page.locator(".photo-result").evaluateAll((elements) => elements.flatMap((element) => element.getAnimations()).length), 0);
    await selected.first().click();
    assert.equal(await page.locator(".photo-lightbox__media").evaluate((element) => element.getAnimations().length), 0);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
    assert.deepEqual(errors, []);
    console.log("PASS: home overflow, masonry, staged search fall/reflow/return, fast input, sorting, zoom, keyboard/focus, mobile, reduced motion");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
