// Run against npm run dev; PLAYWRIGHT_MODULE can select an existing Playwright installation.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${process.env.BASE_URL || "http://localhost:3000"}/about`);
  await page.getByText("I'm a software engineer drawn to ambiguous problems and the systems that bring ideas to life.", { exact: true }).waitFor();
  assert.deepEqual(await page.locator("#how-i-build h3").allTextContents(), ["Frontend", "State & data", "Backend", "AI & testing"]);
  assert.equal(await page.locator("#how-i-build li a").count(), 19, "Merged About retains every profile tool");
  assert.deepEqual(await page.locator("section[aria-labelledby='experience-title'] h3").allTextContents(), ["WALA ICT", "ISB Vietnam", "OneMedic"]);
  const resume = await page.getByRole("link", { name: "Resume", exact: true }).getAttribute("href");
  assert.equal((await page.request.get(new URL(resume, page.url()).href)).status(), 200, "Resume remains available");
  const portrait = page.locator(".about-portrait-card");
  const portraitTransform = () => portrait.evaluate((element) => getComputedStyle(element).transform);
  await portrait.locator("img").evaluate((image) => image.decode());
  assert((await portrait.locator("img").getAttribute("src")).endsWith("/images/about/recently/generated/da-lat-solo-trip.webp"));
  const restingPortrait = await portraitTransform();
  assert.equal(await portrait.evaluate((element) => getComputedStyle(element).transitionDuration), "0.32s");
  await portrait.hover();
  await page.waitForTimeout(400);
  assert(await portrait.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.abs(Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 1) < .01 && Math.abs(Math.hypot(matrix.a, matrix.b) - 1.01) < .001;
  }), "Portrait hover matches reference: -1 degree, scale 1.01");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  assert.equal(await portraitTransform(), restingPortrait, "Portrait returns to its original angle");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await portrait.hover();
  assert.equal(await portraitTransform(), restingPortrait, "Reduced motion skips portrait hover");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(0, 0);
  await page.locator(".recent-print img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  assert(await page.locator(".recent-print img").evaluateAll((images) => images.every((image) => image.currentSrc.includes("/images/about/recently/generated/") && Math.max(image.naturalWidth, image.naturalHeight) <= 720)), "Recent gallery uses resized WebP thumbnails");
  await page.locator('[data-reveal="ready"]').waitFor();
  const entrance = await page.locator(".recent-print img").evaluateAll((images) => {
    images.forEach((image) => { image.style.animation = "none"; });
    void document.body.offsetWidth;
    return images.map((image) => {
      image.style.animation = "";
      const animation = image.getAnimations()[0];
      const timing = animation.effect.getTiming();
      animation.pause();
      animation.currentTime = 150;
      const opacity = Number(getComputedStyle(image).opacity);
      animation.currentTime = timing.delay + timing.duration;
      return { delay: timing.delay, duration: timing.duration, easing: getComputedStyle(image).animationTimingFunction, opacity, finalOpacity: getComputedStyle(image).opacity };
    });
  });
  assert.deepEqual(entrance.map(({ delay }) => delay), Array.from({ length: 11 }, (_, index) => index * 30));
  assert(entrance.every(({ duration, easing, finalOpacity }) => duration === 240 && easing === "cubic-bezier(0.23, 1, 0.32, 1)" && finalOpacity === "1"));
  assert(entrance[0].opacity > .95 && entrance[5].opacity === 0 && entrance[10].opacity === 0, "Photos fade in from left to right, without moving the paper");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [701, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const photos = page.locator(".recent-print");
    for (const [edge, before] of [[photos.first(), false], [photos.last(), true]]) {
      await edge.getByRole("button").hover();
      const gaps = await edge.evaluate((element, before) => {
        const paper = element.querySelector("button").getBoundingClientRect();
        const caption = element.querySelector("figcaption").getBoundingClientRect();
        const heading = element.closest("section").querySelector("h2").getBoundingClientRect();
        return [before ? paper.left - caption.right : caption.left - paper.right, heading.top - caption.bottom];
      }, before);
      assert(gaps.every((gap) => gap >= 5), `Edge captions clear the enlarged photo and section heading at ${width}px`);
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(0, 0);
  const print = page.locator(".recent-print").nth(7);
  const letters = print.locator(".recent-print__letter");
  const opacity = (locator) => locator.evaluate((element) => getComputedStyle(element).opacity);
  await print.getByRole("button").hover();
  await page.waitForTimeout(250);
  assert.equal(await opacity(letters.first()), "1");
  assert.equal(await opacity(letters.last()), "0", "Caption must reveal progressively");
  assert.equal(await letters.nth(1).evaluate((element) => getComputedStyle(element).transitionDelay), "0.18s");
  await page.waitForTimeout(1000);
  assert.equal(await opacity(letters.last()), "1");
  assert.equal(await opacity(page.locator(".recent-print").first()), "1", "Other photos stay bright");
  await page.mouse.move(0, 0);
  assert.equal(await opacity(letters.first()), "0", "Leaving resets the caption");
  await page.keyboard.press("Tab");
  await print.getByRole("button").focus();
  assert.equal(await opacity(letters.last()), "1", "Keyboard focus reveals the complete caption");
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).outlineStyle), "solid", "Keyboard focus keeps its outline");
  await print.getByRole("button").evaluate((element) => element.blur());
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert(await page.locator(".recent-print img").evaluateAll((images) => images.every((image) => getComputedStyle(image).animationName === "none" && getComputedStyle(image).opacity === "1")), "Reduced motion shows every loaded photo immediately");
  await print.getByRole("button").hover();
  assert.equal(await opacity(letters.last()), "1", "Reduced motion skips typing");
  await print.getByRole("button").click();
  const media = page.locator(".photo-lightbox__media");
  assert(await media.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.backgroundColor === "rgb(255, 255, 255)" && parseFloat(style.paddingLeft) >= 10;
  }), "Opened photo has a white frame");
  assert.match(await media.locator(".photo-lightbox__full").getAttribute("src"), /\/recently\/trekking-bich-dam\.webp$/);
  assert(await media.evaluate((element) => {
    const [preview, full] = element.querySelectorAll("img");
    return ["offsetLeft", "offsetTop", "offsetWidth", "offsetHeight"].every((property) => preview[property] === full[property]);
  }), "The original fits the same print frame as the thumbnail");
  await page.keyboard.press("ArrowRight");
  await page.getByRole("dialog", { name: "Trekking Dinh moutain", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert(await print.getByRole("button").evaluate((element) => element === document.activeElement));
  const printBox = await print.boundingBox();
  assert(printBox, "Opened thumbnail must remain visible after Escape");
  assert((await page.locator(".recent-print__paper").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform))).every((transform) => transform === "none"), "Escape keeps every thumbnail at rest while restoring focus");
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).transform), "none", "Escape restores thumbnail size despite returned focus");
  assert.equal(await opacity(print.locator("figcaption")), "0", "Escape hides the caption");
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).outlineStyle), "none", "Escape leaves no enlarged focus ring");
  const neighbor = page.locator(".recent-print").nth(8);
  await neighbor.getByRole("button").hover();
  await page.waitForTimeout(300);
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).transform), "none", "Hovering another photo must not enlarge the restored-focus thumbnail");
  assert.equal(await page.locator(".recent-print__paper").evaluateAll((elements) => elements.filter((element) => getComputedStyle(element).transform !== "none").length), 1, "Only the hovered thumbnail may be enlarged");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  assert((await page.locator(".recent-print__paper").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform))).every((transform) => transform === "none"), "Leaving hover must not reactivate the restored focus");
  await print.getByRole("button").hover();
  assert.equal(await opacity(letters.last()), "1", "Hover works again after Escape");
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).outlineStyle), "none", "Returning the pointer to a restored-focus thumbnail never outlines it");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await print.getByRole("button").click();
  const close = await media.evaluate((element) => {
    const paper = document.querySelectorAll(".recent-print__paper")[7];
    const bounds = (node) => node.getBoundingClientRect().toJSON();
    const isUniform = () => {
      const { a, d } = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return Math.abs(a - d) < .00001;
    };
    const opening = element.getAnimations()[0];
    opening.pause();
    opening.currentTime = 0;
    const openUniform = isUniform();
    opening.currentTime = 100;
    paper.style.transition = "none";
    paper.style.transform = "scale(1.85)";
    const before = bounds(element);
    const resting = bounds(paper.parentElement);
    const expandedWidth = bounds(paper).width;
    document.querySelector(".photo-lightbox__close").click();
    const closing = element.getAnimations()[0];
    closing.pause();
    closing.currentTime = 0;
    const start = bounds(element);
    closing.currentTime = 150;
    const closeUniform = isUniform();
    closing.currentTime = closing.effect.getTiming().duration;
    const end = bounds(element);
    paper.style.transform = "";
    paper.style.transition = "";
    closing.play();
    return { before, start, end, resting, expandedWidth, openUniform, closeUniform };
  });
  assert(close.expandedWidth > close.resting.width, "The source is still enlarged when close begins");
  assert(close.openUniform && close.closeUniform, "Zoom preserves the photo's aspect ratio");
  assert(Math.abs(close.start.width - close.before.width) < 1 && Math.abs(close.start.height - close.before.height) < 1, "Closing starts from the current zoom");
  assert(close.end.width <= close.resting.width + 1 && close.end.height <= close.resting.height + 1, "The last frame fits inside the resting thumbnail");
  assert(Math.abs(close.end.x + close.end.width / 2 - close.resting.x - close.resting.width / 2) < 1, "Closing lands at the center of the resting thumbnail");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.waitForTimeout(300);
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).transform), "none", "Animated close must not reactivate zoom");
  await page.keyboard.press("Tab");
  assert.equal(await opacity(page.locator(".recent-print").nth(8).locator("figcaption")), "1", "Keyboard browsing resumes after closing");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await print.locator("figcaption").evaluate((element) => getComputedStyle(element).display), "none");
  assert.equal(await print.getByRole("button").evaluate((element) => getComputedStyle(element).transform), "none");
  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await touch.goto(`${process.env.BASE_URL || "http://localhost:3000"}/about`);
  const touchPortrait = touch.locator(".about-portrait-card");
  const touchRest = await touchPortrait.evaluate((element) => getComputedStyle(element).transform);
  await touchPortrait.tap();
  await touch.waitForTimeout(400);
  assert.equal(await touchPortrait.evaluate((element) => getComputedStyle(element).transform), touchRest, "Touch does not leave a sticky portrait hover");
  assert(await touch.evaluate(() => document.documentElement.scrollWidth === innerWidth), "Portrait does not overflow mobile");
  const landscape = touch.getByRole("button", { name: "Open Bu Gia Map hiking" });
  await landscape.tap();
  const touchMedia = touch.locator(".photo-lightbox__media");
  assert(await touchMedia.evaluate((element) => {
    const start = element.getAnimations()[0].effect.getKeyframes()[0];
    const { a, d } = new DOMMatrixReadOnly(start.transform);
    return a < 1 && Math.abs(a - d) < .00001;
  }), "A landscape photo zooms from its portrait thumbnail without distortion");
  await touch.getByRole("button", { name: "Close", exact: true }).tap();
  await touch.getByRole("dialog").waitFor({ state: "detached" });

  const toolSelector = "[data-stack-highlight]";
  const mobileTools = touch.getByRole("list", { name: "Frontend tools" });
  await mobileTools.scrollIntoViewIfNeeded();
  const firstHighlight = await mobileTools.locator(toolSelector).getAttribute("href");
  await touch.waitForFunction(({ selector, first }) => {
    const icon = document.querySelector(selector);
    return icon && icon.getAttribute("href") !== first;
  }, { selector: toolSelector, first: firstHighlight });
  assert.equal(await touch.locator(toolSelector).count(), 1, "Touch devices highlight one visible tool at a time");
  await touch.emulateMedia({ reducedMotion: "reduce" });
  await touch.locator(toolSelector).waitFor({ state: "detached" });
  assert.equal(await mobileTools.getByRole("link", { name: "ReactJS", exact: true }).locator("svg").evaluate((icon) => getComputedStyle(icon).color), "rgb(54, 127, 145)", "Reduced motion keeps the brand colors static");

  await page.setViewportSize({ width: 1440, height: 1000 });
  const react = page.getByRole("link", { name: "ReactJS", exact: true });
  await react.hover();
  await page.locator(`${toolSelector}:not([href="https://react.dev"])`).waitFor();
  await page.waitForFunction(() => {
    const icon = document.querySelector('[data-stack-tool][href="https://react.dev"] svg');
    return getComputedStyle(icon).color === "rgb(54, 127, 145)" &&
      document.querySelector('[data-stack-highlight]:not([href="https://react.dev"])');
  });

  for (const shouldTimeout of [false, true]) {
    const cold = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await cold.clock.install();
    let releasePhoto;
    const delayedPhoto = new Promise((resolve) => { releasePhoto = resolve; });
    await cold.route("**/recently/generated/bike-and-sai-gon-atutum.webp", async (route) => {
      await delayedPhoto;
      await route.continue();
    });
    await cold.goto(page.url(), { waitUntil: "domcontentloaded" });
    await cold.locator('[data-reveal="pending"]').waitFor();
    const images = cold.locator(".recent-print img");
    await images.nth(1).evaluate((image) => image.decode());
    assert.equal(await images.nth(1).evaluate((image) => getComputedStyle(image).opacity), "0", "The second thumbnail waits for the first");
    if (shouldTimeout) {
      await cold.clock.runFor(700);
      await cold.locator('[data-reveal="settled"]').waitFor();
      assert.equal(await images.nth(1).evaluate((image) => getComputedStyle(image).opacity), "1", "A slow thumbnail cannot block the strip");
    }
    releasePhoto();
    await images.first().evaluate((image) => image.decode());
    await cold.locator(`[data-reveal="${shouldTimeout ? "settled" : "ready"}"]`).waitFor();
    assert.equal(await images.first().evaluate((image) => image.hasAttribute("data-reveal-photo")), !shouldTimeout, "Late images skip the stagger");
    await cold.close();
  }

  const blocked = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await blocked.route("**/_next/**/*.js", (route) => route.abort());
  await blocked.goto(page.url());
  const fallbackImage = blocked.locator(".recent-print img").first();
  await fallbackImage.scrollIntoViewIfNeeded();
  assert.equal(await fallbackImage.evaluate(async (image) => {
    await image.decode();
    return getComputedStyle(image).opacity;
  }), "1", "Thumbnails remain visible if JavaScript chunks fail to load");
  await blocked.close();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const experience = page.locator("section[aria-labelledby='experience-title'] article").first();
  const neutralPeriod = await experience.locator("p").first().evaluate((element) => getComputedStyle(element).color);
  await experience.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForFunction((before) => {
    const job = document.querySelector("section[aria-labelledby='experience-title'] article");
    const color = getComputedStyle(job.querySelector("p")).color;
    return color !== before && color === getComputedStyle(job, "::before").backgroundColor;
  }, neutralPeriod);
  console.log("PASS: About copy, portrait image/hover/reset/touch, staggered photo arrival, progressive hover, reset, keyboard, reduced motion, white frame, navigation, mobile");
} finally {
  await browser.close();
}
