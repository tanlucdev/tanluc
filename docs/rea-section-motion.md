# Hero → project motion, 2026-11-02

Reference: https://neelsaswade.com/. Existing investigations:
[work showcase](rea-work-showcase.md), [meadow handoff](rea-wind-scroll-photo.md).

## Evidence and limits

REA CLI 6.7.0 opened the reference at 390 × 844 with normal motion.
Evidence `ev_349f0f3c9fcfe2fd2218372ef005f34d2ea3a2c25f3ff923ecc88fc75c673f1c`
captured a Cloudflare challenge, not the portfolio. No challenge was solved.
Current live visual equality therefore remains unverified.

The publicly served bundles remained accessible. REA analyzed the downloaded
`hero-meadow-LyxV7Nqt.js` and `work-scroll-gEKMw6Tw.js` as inert JavaScript:
`ev_b3cee0d80a2619686f53372e10451847eb23f3b96776ab9345eb10977f2e1c83`.
Imports outside these two files remain unresolved; static analysis does not
establish runtime execution. Ordinary text inspection also covered the shipped
`/_next/static/css/index.souV6DFN.css`.

Downloaded SHA-256 identities:

- Hero: `f74c7e59aa52919caf36f8e12af096b5d05eb35c6ce46e47404da60c327586b4`.
- Work scroll: `c722adf7628d209b5e4beba877176fc0071a5f00ec018825eb64a53a38fa4e47`.
- CSS: `66f2ce1fa55a0de981dea9a5d6f6a4c9849746f46c2202b5f06c41879f3f5efb`.

Complete temporary records: `/tmp/portfolio-motion-rea/{mobile,static}-evidence.json`.
These paths are session artifacts, not portable repository dependencies.

## Findings and implementation

The existing desktop implementation already matches the quintic handoff curve,
190ms exponential following, delayed tree dissolution, 900ms initial wheel entry,
560ms project navigation and once-only 6px/250ms project reveals. Retained these.
Corrected the final scene-opacity curve to the reference's cubic smoothstep.

At ≤700px the reference positions the scene absolutely inside the hero, uses
`opacity: calc(1 - var(--work-paper-opacity, 0))`, and retains layer dissolution.
The local mobile overrides forced full opacity and disabled every layer effect.
Removed those overrides; moved paper opacity to the home ancestor so both the
scene and work inherit the same progress. Mobile retains native document scrolling.
Completed the 50ms navigation stagger for all seven local projects.

Local performance adaptation: stop canvas painting outside the viewport or while
the document is hidden; resume when visible. No animation dependency was added.

## Reproduction

Run `scripts/check-section-motion.mjs` against the local server, setting
`PLAYWRIGHT_MODULE`, `CHROME_PATH` and `BASE_URL` for existing browser tooling.
It checks 320, 390, 700, 768 and 1440px: mid-transition mobile fade/desktop movement,
grass-before-tree dissolution, hidden canvas inactivity, reverse scrolling,
once-only project reveals, reduced motion, overflow and browser errors.
These checks are ordinary Playwright observations, not REA Evidence.

Validation passed: the five-width motion check, the existing complete work
showcase browser check, TypeScript, production build and `git diff --check`.
ESLint completed with zero errors and 18 existing image-related warnings.
