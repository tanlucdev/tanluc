# About photo arrival

Target: https://neelsaswade.com/about, observed 2026-10-29.

- REA CLI `capture-browser-scenario`: `ev_c39db4f31c122b4f3b9d6827d0b5839dd32c460cb90a97730310e989ad6bcabd`. Navigation and 2-second wait completed; owned Chrome cleaned up. This capture establishes navigation only, not animation timing.
- Supplemental Chrome/Playwright runtime and live stylesheet inspection: `.life-print__paper img` fades opacity over 240ms, `cubic-bezier(0.23, 1, 0.32, 1)`, delay `--print-index * 30ms`. Eleven photos use indices 0–10. No entrance translation; paper rotation stays unchanged.
- Reference images use `data-loaded="true"`; reduced-motion skips the opacity transition. Load completion can alter actual ordering on a cold connection: this is not a strict sequential loader.
- Reconstruction: existing gallery only; cached-image completion check, per-image load event, same timing on image opacity. CSS animation with backwards fill reproduces the delayed fade even for cached images. No JavaScript-disabled hiding; no extra dependency.
- Runnable check: `BASE_URL=http://localhost:52512 PLAYWRIGHT_MODULE=<playwright module> CHROME_PATH=<Chrome executable> node scripts/check-about.mjs`.

REA MCP was absent; installed CLI used without configuration changes. In-app browser bootstrap failed (`Cannot redefine property: process`); supplemental checks used standalone Chrome. Runtime measurements above are supplemental evidence, not REA-generated timing Evidence.

## Portrait hover

- REA visible-Chrome DOM capture: `ev_23ebb884a653a58040e07a5790a85632c0dc0faef17dd429b0343c50e85edca4`. Selected `.about-page__portrait-card` visible; owned browser cleanup completed. The earlier headless attempt did not reach the requested element; cancelled with cleanup complete.
- Supplemental live CSS and mouse checks: rest `rotate(1.5deg)`; fine-pointer hover `rotate(-1deg) scale(1.01)`; transition `320ms cubic-bezier(0.22, 0.7, 0.2, 1)`. Leaving restores rest. Reduced motion retains the resting angle. No click behavior added.
- Replaced the local placeholder with `images/about/recently/da-lat-solo-trip.jpg`, generated from the user's original HEIC in the original worktree. Original preserved. Existing 200/248px frame, 10px padding, 3:4 crop, 8px inner radius retained; 2px outer radius matched to reference.
- `scripts/check-about.mjs` now checks source/decode, hover matrix, reset, reduced motion, touch and mobile overflow, alongside existing gallery/lightbox regression checks.
