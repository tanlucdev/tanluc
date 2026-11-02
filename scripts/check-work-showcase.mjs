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
  await page.locator(".portfolio-home-work nav[aria-label='Selected work'][data-ready='true']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".portfolio-home img:not([loading='lazy'])").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
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
  assert.equal(await page.locator("section[id^='work-']").count(), 7, "seven work sections render");
  assert.deepEqual(await page.locator(".portfolio-home-work nav[aria-label='Selected work'] a").allTextContents(), ["Dynamic Models", "Visual Workflow Editor", "Creative & Media Tools", "Workflow Execution", "Cafe Maps", "MedicHIMS", "Grateful Forum"], "project navigation follows the case-study order");
  assert.equal(await page.locator("#work-cafemaps").textContent().then((text) => text?.includes("15,000+ visitors") && text.includes("40,000+ page views")), true, "Cafemaps verified stats render");
  assert.equal(await page.locator("#work-cafemaps").getByRole("link", { name: "Visit cafemaps.net" }).getAttribute("href"), "https://cafemaps.net", "Cafemaps links to the public product");
  assert.equal(await page.locator("[data-work-reference]").count(), 0, "all work previews show the actual product or labelled demonstrations");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "desktop has no horizontal overflow");
  assert.equal(await page.locator(".portfolio-home-work nav[aria-label='Selected work'] a[aria-current='location']").count(), 1, "active project has nav state");
  assert.equal(await page.locator("[data-work-dot]").evaluate((dot) => getComputedStyle(dot).opacity !== "0"), true, "active dot is visible");
  assert.equal(await page.locator("#work-isb-corp").count(), 0, "ISB is removed");
  assert.equal(await page.locator("#work-onemedic video").count(), 0, "MedicHIMS has no unrelated reference video");
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await page.locator(".portfolio-home-work nav[aria-label='Selected work'] a[href='#work-onemedic']").click();
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => location.hash), "#work-onemedic", "nav updates the hash");
  assert.equal(await page.locator(work).evaluate((node) => document.activeElement === node), true, "nav focuses its target");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(base, { waitUntil: "domcontentloaded" });
  await mobile.locator(".portfolio-home-work nav[aria-label='Selected work'][data-ready='true']").waitFor({ state: "attached" });
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
  assert.equal(await mobile.locator(".portfolio-home-work nav[aria-label='Selected work']").evaluate((nav) => getComputedStyle(nav.parentElement).display), "none", "mobile hides the rail");

  await page.getByRole("button", { name: "Resume motion", exact: true }).click();
  for (const target of [page, mobile]) {
    const showcase = target.getByRole("group", { name: "Cafe Maps product showcase", exact: true });
    await showcase.scrollIntoViewIfNeeded();
    if (target === mobile) {
      const disclosure = showcase.getByRole("button", { name: "Behind the scenes", exact: true });
      assert.equal(await disclosure.getAttribute("aria-expanded"), "false", "mobile starts with CMS collapsed");
      assert.equal(await showcase.getByRole("region", { name: "Cafe Maps CMS", exact: true }).count(), 0, "collapsed CMS is outside the accessibility tree");
      await disclosure.click();
      assert.equal(await disclosure.getAttribute("aria-expanded"), "true");
    }
    await showcase.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    assert.equal(await target.locator("#work-cafemaps-title").textContent(), "Cafe Maps");
    assert.equal(await showcase.locator('img[src$="/en-quiz.webp"]').count(), 1, "quiz appears only in the main tour");
    assert.equal(await showcase.locator('[class*="cafePublic"]').locator(":scope > *").count(), 3, "public showcase retains its three tiles");
    if (target === page) assert.ok(await showcase.locator('[class*="cafePublic"]').evaluate((node) => node.getBoundingClientRect().height <= 500), "desktop three-tile preview stays compact");
    const gallery = showcase.locator('img[src$="/editorial-gallery.webp"]');
    assert.ok(await gallery.evaluate((image) => Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight) < 0.02), "gallery keeps its original proportions");
    assert.equal(await showcase.locator('img[src$="/en-quiz-result.webp"]').count(), 1, "supporting tile shows quiz result instead of duplicating its question");
    for (const [label, titles] of [["Cafe Maps discovery", ["Explore", "Cafe details", "Saved", "Quiz", "Contribute"]], ["Cafe Maps CMS", ["Catalogue", "Editing", "Submissions", "Moderation"]]]) {
      const tour = showcase.getByRole("region", { name: label, exact: true });
      await tour.scrollIntoViewIfNeeded();
      for (const [index, title] of titles.entries()) {
        await tour.getByRole("button", { name: title, exact: true }).click();
        assert.equal(await tour.getAttribute("data-screen"), String(index), "manual selection displays the requested screen");
        assert.equal(await tour.getAttribute("data-running"), "false", "manual selection holds the screen for reading");
        assert.equal(await tour.getByRole("link").count(), 1, "only the current screenshot is keyboard accessible");
      }
      await tour.getByRole("button", { name: `Resume ${label}`, exact: true }).click();
      await target.mouse.move(0, 0);
      await target.waitForFunction((name) => document.querySelector(`[aria-label="${name}"]`)?.dataset.running === "true", label);
      const before = await tour.getAttribute("data-screen");
      const started = Date.now();
      await target.waitForFunction(({ name, before }) => document.querySelector(`[aria-label="${name}"]`)?.dataset.screen !== before, { name: label, before }, { timeout: 4500 });
      assert.ok(Date.now() - started >= 3000, "each screen holds for at least three seconds");
      await tour.getByRole("button", { name: `Pause ${label}`, exact: true }).click();
      const held = await tour.getAttribute("data-screen");
      await target.waitForTimeout(200);
      assert.equal(await tour.getAttribute("data-screen"), held);
      await target.emulateMedia({ reducedMotion: "reduce" });
      await target.waitForFunction((name) => document.querySelector(`[aria-label="${name}"]`)?.dataset.running === "false", label);
      assert.equal(await tour.locator('[class*="cafeTourTrack"]').evaluate((node) => getComputedStyle(node).transitionDuration), "0s");
      await tour.getByRole("button", { name: titles[0], exact: true }).click();
      await target.emulateMedia({ reducedMotion: "no-preference" });
    }
    assert.equal(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await target.locator("#work-cafemaps").screenshot({ path: `/tmp/cafemaps-editorial-${target === page ? "desktop" : "mobile"}.png` });
  }

  for (const target of [page, mobile]) {
    const medic = target.getByRole("group", { name: "MedicHIMS product showcase", exact: true });
    for (const [title, names] of [["Services & billing", ["Purchases", "Select a package", "Price breakdown"]], ["A structure for every form.", ["Field configuration", "Template settings", "New template", "New subsection"]]]) {
      if (target === mobile) {
        await medic.getByRole("group", { name: "MedicHIMS topics", exact: true }).getByRole("button", { name: title === "Services & billing" ? title : "Document templates", exact: true }).click();
        assert.equal(await medic.locator('section:visible').count(), 1, "mobile shows one MedicHIMS topic at a time");
      }
      const gallery = medic.getByRole("region", { name: title, exact: true });
      await gallery.scrollIntoViewIfNeeded();
      if (target === page) assert.ok(await gallery.locator("figure").evaluate((node) => Math.abs(node.clientWidth / node.parentElement.clientWidth - .8) < .01), "desktop screenshots use 80% of the gallery width");
      const initialHeight = await gallery.locator('[class*="medicViewport"]').evaluate((node) => node.clientHeight);
      for (const name of names) {
        await gallery.getByRole("button", { name, exact: true }).click();
        assert.equal(await gallery.getByRole("button", { name, exact: true }).getAttribute("aria-pressed"), "true");
        const img = gallery.locator("img");
        await img.evaluate((node) => node.decode());
        assert.ok(await img.evaluate((node) => node.naturalWidth > 0), "real screenshot loads");
        assert.equal(await gallery.getByRole("link").getAttribute("href"), await img.getAttribute("src"), "full-size link follows selection");
        const viewport = gallery.locator('[class*="medicViewport"]');
        if (target === mobile) {
          assert.ok(await viewport.evaluate((node) => node.scrollWidth <= node.clientWidth), "mobile MedicHIMS screenshots fit without horizontal scrolling");
        }
        if (await viewport.getAttribute("data-compact") === "true") {
          assert.ok(await viewport.evaluate((node) => Math.abs(node.clientHeight - node.querySelector("img").clientHeight) <= 1), "short form frames fit the image without empty space");
        } else {
          assert.equal(await viewport.evaluate((node) => node.clientHeight), initialHeight, "full screenshots keep a stable frame");
        }
      }
      await target.emulateMedia({ reducedMotion: "reduce" });
      await gallery.getByRole("button", { name: names[0], exact: true }).click();
      assert.equal(await gallery.getByRole("button", { name: names[0], exact: true }).getAttribute("aria-pressed"), "true", "selection works with reduced motion");
      await target.emulateMedia({ reducedMotion: "no-preference" });
    }
    await medic.getByRole("region", { name: "A structure for every form.", exact: true }).getByRole("region").evaluate((node) => { node.scrollTop = 150; });
    assert.ok(await medic.getByRole("region", { name: "A structure for every form.", exact: true }).getByRole("region").evaluate((node) => node.scrollTop > 0), "long configuration screenshot is scrollable");
    assert.equal(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "MedicHIMS stays inside the viewport");
    await medic.screenshot({ path: `/tmp/medichims-${target === page ? "desktop" : "mobile"}.png` });
  }

  for (const width of [320, 375, 390, 430, 768, 1024, 1079, 1080, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `showcase fits at ${width}px`);
    const showcase = page.getByRole("group", { name: "Cafe Maps product showcase", exact: true });
    const medic = page.getByRole("group", { name: "MedicHIMS product showcase", exact: true });
    const disclosure = showcase.getByRole("button", { name: "Behind the scenes", exact: true });
    if (width < 1080) {
      assert.equal(await showcase.getByRole("region", { name: "Cafe Maps CMS", exact: true }).count(), 0);
      await disclosure.focus();
      await disclosure.press("Enter");
      assert.equal(await disclosure.getAttribute("aria-expanded"), "true", "CMS opens from the keyboard");
      assert.equal(await showcase.getByRole("region", { name: "Cafe Maps CMS", exact: true }).count(), 1);
      await disclosure.press("Enter");
      const topics = medic.getByRole("group", { name: "MedicHIMS topics", exact: true });
      for (const name of ["Document templates", "Services & billing"]) {
        await topics.getByRole("button", { name, exact: true }).focus();
        await topics.getByRole("button", { name, exact: true }).press("Enter");
        assert.equal(await medic.locator('section:visible').count(), 1);
      }
      const tiles = await showcase.locator('[class*="cafePublic"] > a').evaluateAll((items) => items.map((node) => { const rect = node.getBoundingClientRect(); return { top: rect.top, left: rect.left }; }));
      assert.equal(tiles[0].top, tiles[1].top, "supporting tiles share a row on mobile and tablet");
      assert.ok(tiles[1].left > tiles[0].left);
    } else {
      assert.equal(await disclosure.count(), 0, "desktop has no CMS disclosure");
      assert.equal(await showcase.getByRole("region", { name: "Cafe Maps CMS", exact: true }).count(), 1, "CMS stays visible after resizing to desktop");
      assert.equal(await medic.locator('section:visible').count(), 2, "both desktop MedicHIMS galleries remain visible");
    }
    for (const file of ["editorial-gallery", "en-quiz-result"]) {
      assert.ok(await page.locator(`#work-cafemaps img[src$="/${file}.webp"]`).evaluate((image) => {
        const picture = image.getBoundingClientRect(), tile = image.parentElement.getBoundingClientRect();
        return picture.top >= tile.top && picture.bottom <= tile.bottom && picture.left >= tile.left && picture.right <= tile.right;
      }), "supporting screenshots fit their tiles at intermediate widths");
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const [target, direction] of [[page, "row"], [mobile, "column"]]) {
    const footer = target.locator("footer[aria-label='Site footer']");
    assert.equal(await footer.evaluate((node) => getComputedStyle(node).flexDirection), direction, "footer responds to viewport");
    assert.equal(await footer.locator("span").textContent(), "© 2026 Tan Luc");
    await footer.getByRole("link", { name: "Back to top" }).click();
    await target.waitForFunction(() => window.scrollY === 0);
  }

  for (const target of [page, mobile]) {
    const models = target.getByRole("region", { name: "Schema-driven model configuration" });
    await models.scrollIntoViewIfNeeded();
    await models.getByRole("button", { name: /Qwen Image 3.0/ }).click();
    assert.match(await models.textContent(), /Aspect ratio/);
    assert.equal(await models.locator("video").count(), 0, "Dynamic Models focuses on configuration");
    await models.getByRole("button", { name: "Resume model demo" }).click();
    await target.waitForFunction(() => document.querySelector('[data-model-stage]')?.dataset.modelStage === "1");
    assert.match(await models.textContent(), /Prompt is required/);
    await target.waitForFunction(() => document.querySelector('[data-model-stage]')?.dataset.modelStage === "2");
    assert.match(await models.textContent(), /Required inputs validated/);
    await target.waitForFunction(() => document.querySelector('[data-model-stage]')?.dataset.modelStage === "3");
    assert.match(await models.textContent(), /Strength/);
    assert.equal(await models.getByText("Aspect ratio", { exact: true }).count(), 0, "switching models removes unrelated fields");
    await models.getByRole("button", { name: /Happyhorse 1.0/ }).click();
    assert.match(await models.textContent(), /Duration/);
    assert.match(await models.textContent(), /Resolution/);
    const frozen = await models.getAttribute("data-model-stage");
    await target.waitForTimeout(2100);
    assert.equal(await models.getAttribute("data-model-stage"), frozen, "manual selection pauses automatic switching");
    await target.emulateMedia({ reducedMotion: "reduce" });
    await target.waitForFunction(() => document.querySelector('[data-model-stage]')?.dataset.modelStage === "8");
    assert.equal(await models.getAttribute("data-running"), "false", "reduced motion shows completed configuration");
    assert.equal(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await models.screenshot({ path: `/tmp/dynamic-models-${target === page ? "desktop" : "mobile"}.png` });
    await target.emulateMedia({ reducedMotion: "no-preference" });
  }

  for (const target of [page, mobile]) {
    const tools = target.getByRole("region", { name: "Creative media tools demonstration" });
    await tools.scrollIntoViewIfNeeded();
    await tools.getByRole("button", { name: "Source", exact: true }).click();
    assert.equal(await tools.getAttribute("data-tool-stage"), "0");
    await tools.getByRole("button", { name: "Resume tools demo" }).click();
    await target.waitForFunction(() => document.querySelector('[data-tool-stage]')?.dataset.toolStage === "1");
    const edited = tools.locator("img[aria-hidden='true']");
    assert.equal(await edited.evaluate((node) => node.naturalWidth > 0), true, "supplied scene loads");
    await target.waitForFunction(() => getComputedStyle(document.querySelector('[data-tool-stage] img[aria-hidden]')).clipPath.includes("50%"));
    await tools.getByRole("button", { name: "Mask", exact: true }).click();
    await target.waitForFunction(() => getComputedStyle(document.querySelector('[data-tool-stage] img[aria-hidden]')).clipPath.startsWith("ellipse"));
    await tools.getByRole("button", { name: "Transform", exact: true }).click();
    assert.match(await tools.textContent(), /Horizontal/);
    await tools.getByRole("button", { name: "Composite", exact: true }).click();
    await target.waitForFunction(() => getComputedStyle(document.querySelector('[data-tool-stage] [class*="compositeTitle"]')).opacity === "1");
    await tools.screenshot({ path: `/tmp/creative-tools-${target === page ? "desktop" : "mobile"}.png` });

    const execution = target.getByRole("region", { name: "Workflow execution demonstration" });
    await execution.scrollIntoViewIfNeeded();
    await execution.getByRole("button", { name: /01 Validation blocked/ }).click();
    assert.equal(await execution.getByRole("progressbar").getAttribute("value"), "0");
    assert.equal(await execution.locator('[data-state="blocked"]').count(), 1, "validation blocks execution");
    await execution.getByRole("button", { name: "Resume execution demo" }).click();
    await target.waitForFunction(() => document.querySelector('[data-execution-stage]')?.dataset.executionStage === "1");
    assert.equal(await execution.locator('[data-state="blocked"]').count(), 0, "corrected input clears the blocker");
    await target.waitForFunction(() => document.querySelector('[data-execution-stage]')?.dataset.executionStage === "3");
    assert.match(await execution.textContent(), /execution payload/);
    await execution.getByRole("button", { name: /06 Model running/ }).click();
    assert.equal(await execution.locator('[data-state="running"]').count(), 1);
    await execution.getByRole("button", { name: /07 Outputs ready/ }).click();
    assert.equal(await execution.locator('[data-state="complete"]').count(), 3, "completion updates all nodes");
    await execution.screenshot({ path: `/tmp/workflow-execution-${target === page ? "desktop" : "mobile"}.png` });
    await execution.getByRole("button", { name: "Resume execution demo" }).click();
    await target.emulateMedia({ reducedMotion: "reduce" });
    await target.waitForFunction(() => { const node = document.querySelector('[data-execution-stage]'); return node?.dataset.executionStage === "6" && node.dataset.running === "false"; });
    assert.equal(await execution.getAttribute("data-running"), "false");
    await tools.getByRole("button", { name: "Source", exact: true }).click();
    assert.equal(await tools.getAttribute("data-tool-stage"), "0", "reduced motion still allows manual tool selection");
    assert.equal(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await target.emulateMedia({ reducedMotion: "no-preference" });
  }

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(base, { waitUntil: "domcontentloaded" });
  await reduced.locator(work).scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(150);
  assert.equal(await reduced.locator("#work-onemedic img").count(), 2, "reduced motion retains both MedicHIMS galleries");
  const grateful = reduced.getByRole("region", { name: "Grateful Forum preview", exact: true });
  await grateful.scrollIntoViewIfNeeded();
  assert.equal(await grateful.getAttribute("data-running"), "false", "Grateful respects reduced motion");
  assert.equal(await reduced.locator("#work-grateful-forum").getByRole("link", { name: "Visit grateful.forum", exact: true }).getAttribute("href"), "https://grateful.forum/");
  for (const width of [320, 390, 768, 1440]) {
    await reduced.setViewportSize({ width, height: 900 });
    for (const [index, title] of ["Community", "Practice", "Reflect"].entries()) {
      const button = grateful.getByRole("button", { name: title, exact: true });
      await button.focus();
      await button.press("Enter");
      assert.equal(await grateful.getAttribute("data-screen"), String(index));
      assert.equal(await grateful.getByRole("link").count(), 1, "only the selected Grateful screen is accessible");
      assert.ok(await grateful.getByRole("link").evaluate((node) => Math.abs(node.clientHeight - node.parentElement.clientHeight) < 2), "Grateful slides fit the fixed frame without clipping");
      await grateful.locator("img").nth(index).evaluate((image) => image.decode());
    }
    assert.ok(await reduced.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Grateful fits ${width}px`);
  }

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await noJsContext.newPage();
  await noJs.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await noJs.locator("section[id^='work-']").count(), 7, "server-rendered work remains visible without JavaScript");
  assert.match(await noJs.getByRole("link", { name: "Stack & experience", exact: true }).getAttribute("href"), /\/about\/?#how-i-build$/, "Home retains the profile teaser alongside the newer showcase");
  await noJsContext.close();
  console.log("work showcase: pass");
} finally {
  await browser.close();
}
