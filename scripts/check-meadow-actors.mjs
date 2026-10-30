import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://localhost:3000";
const chrome = { executablePath: process.env.CHROME_PATH };
const labels = ["Photography", "Cycling", "Backpacking"];

const actorFrames = async (page) => page.locator(".meadow-actor img").evaluateAll((images) => images.map((image) => ({ complete: image.complete, naturalWidth: image.naturalWidth, src: image.src })));
const activate = async (page, label) => page.getByRole("button", { name: new RegExp(`Show ${label.toLowerCase()}`) }).click();

const browser = await chromium.launch(chrome);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*-frame-*.png", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");

  await page.waitForFunction(() => document.querySelector(".meadow-actor--photo")?.dataset.spriteState === "ready");
  assert.equal(await page.locator(".meadow-actor--photo").getAttribute("data-phase"), "shoot", "Default photographer starts on the ground without spawning or dropping");
  assert.equal(await page.getByRole("button", { name: "Hide photography on the meadow" }).getAttribute("aria-pressed"), "true", "Photography is active by default");
  await page.getByRole("button", { name: "Hide photography on the meadow" }).click();

  await activate(page, "Photography");
  await page.waitForFunction(() => document.querySelector(".meadow-actor--photo")?.dataset.spriteState === "loading");
  await page.getByRole("button", { name: "Hide photography on the meadow" }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator(".meadow-actor--photo").getAttribute("data-sprite-state"), "idle", "Hiding cancels pending preload");

  for (const label of labels) await activate(page, label);
  const staticFrames = await actorFrames(page);
  assert(staticFrames.every(({ src }) => /-frame-1\.png$/.test(src)), "Delayed frames retain the static first frame");
  await page.waitForFunction(() => [...document.querySelectorAll(".meadow-actor")].every((actor) => actor.dataset.spriteState === "ready"));
  await page.waitForFunction(() => [...document.querySelectorAll(".meadow-actor")].every((actor) => actor.dataset.phase === "shoot" || actor.dataset.phase === "move"));
  const seen = [new Set(), new Set(), new Set()];
  for (let index = 0; index < 16; index += 1) {
    (await actorFrames(page)).forEach((frame, actor) => {
      assert(frame.complete && frame.naturalWidth > 0, `${labels[actor]} renders a decoded frame`);
      seen[actor].add(frame.src);
    });
    await page.waitForTimeout(150);
  }
  seen.forEach((frames, index) => {
    assert(frames.size > 1, `${labels[index]} cycles after decoded preload`);
    assert([...frames].every((src) => /(?:photographer|bike-rider|backpacker)-frame-[1-5]\.png$/.test(src)), `${labels[index]} uses valid frames`);
  });
  assert.deepEqual(errors, [], "Preload has no unhandled errors");
  await page.close();

  const failed = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await failed.route("**/bike-rider-frame-2.png", (route) => route.abort());
  await failed.goto(base);
  await failed.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  await activate(failed, "Cycling");
  await failed.waitForFunction(() => document.querySelector(".meadow-actor--bike")?.dataset.spriteState === "fallback");
  assert.match(await failed.locator(".meadow-actor--bike img").getAttribute("src"), /bike-rider-frame-1\.png$/, "Failed preload keeps static fallback");
  await failed.close();

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(base);
  await reduced.waitForFunction(() => document.querySelector(".meadow-scene")?.dataset.scrollState === "hero");
  for (const label of labels.slice(1)) await activate(reduced, label);
  assert.deepEqual(await reduced.locator(".meadow-actor").evaluateAll((actors) => actors.map((actor) => actor.dataset.spriteState)), ["static", "static", "static"], "Reduced motion stays static");
  assert((await actorFrames(reduced)).every(({ src }) => /-frame-1\.png$/.test(src)), "Reduced motion retains first frames");
  await reduced.close();
  console.log("PASS: delayed decoded preloads, cancellation, cycling, failure fallback, reduced motion");
} finally {
  await browser.close();
}
