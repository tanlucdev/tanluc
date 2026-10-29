# Home / Photo / About navigation

Reference: https://neelsaswade.com/, observed 2026-10-29.

## Evidence

REA CLI `capture-browser-scenario` Evidence `ev_141b035c552b4d382cb46af4474142cfa26f9aba727253c7a137f3b3b91c8616`: all six directed links completed (Home–Photo–About–Home–About–Photo–Home). Captured URL per step, final DOM; owned visible Chrome cleanup completed. Full record retained at `/tmp/rea-page-navigation.json` during this session.

Supplemental Chrome runtime/CSS inspection, separate from REA-produced timing evidence:

- Home/About: `.page-enter`, `editorial-enter`, opacity 0–1, 460ms, `cubic-bezier(0.23, 1, 0.32, 1)`, no delay or translation.
- Photo: no page-wide arrival. Grid `[data-ready="true"]` fades 0–1 over 200ms with the same easing, after masonry layout. Each loaded photo separately transitions opacity over 200ms.
- All six reference clicks changed `performance.timeOrigin`: full-document navigations observed, not an exit/enter router crossfade. No outgoing animation observed in these checks.
- Reference CSS disables these animations under reduced motion.

## Reconstruction

Next.js native `app/template.tsx` restarts the incoming opacity animation on route changes and Back/Forward. Header and Soundscape remain outside the template; existing client navigation stays intact, without full-document reloads or artificial waits. This persistent header is a deliberate local continuity improvement, not a claim of exact reference DOM behavior.

Photo skips the wrapper animation; only the ready grid fades over 200ms, avoiding a double fade. No transform: existing fixed-position UI, hero scrolling, masonry, hover and lightbox behavior remain untouched. Reduced motion has no route or grid animation. No dependency/configuration additions or click interception.

Run `BASE_URL=http://localhost:52512 PLAYWRIGHT_MODULE=<module> CHROME_PATH=<executable> node scripts/check-page-navigation.mjs` to check six directions, Back/Forward, fast clicks, header persistence, no document reload, reduced motion and mobile overflow. Existing About, Photo and work-showcase suites cover interaction regressions.

REA MCP remains absent; installed CLI used. Previously observed in-app browser bootstrap failure persists; browser verification used standalone Chrome without configuration changes. Network load speed and exact reference resource timing are not reproduced.
