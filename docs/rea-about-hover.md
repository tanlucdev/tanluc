# About gallery: REA findings

Target: https://neelsaswade.com/about, inspected 2026-10-24 with REA CLI 6.7.0.

- REA page/script capture: `ev_c36785d5e8ae8e1525ecfd1b225d5fa148a752d7242927014851151bf22af915`.
- REA hovered viewport capture: `ev_d8f94f88ec6f4a90606c496d2fc859b3fd4c8f36075e7a0e18ac0b86883e1793`.
- Complete captures: `/tmp/portfolio-rea-browser.Oic7wt/reference-page.json` and `reference-hover-confirmed.json`. These temporary files are not portable repository artifacts.

Direct browser hover and CSS inspection corroborated the following behavior:

- The photo scales to 1.85 over 250 ms with `cubic-bezier(0.23, 1, 0.32, 1)`, retaining its rotation.
- Caption letters reveal through 1 ms opacity transitions using `step-end`, starting at 150 ms, staggered by 30 ms. Leaving resets the caption.
- Adjacent photographs stay opaque; the section heading dims.
- Keyboard focus and reduced motion reveal the caption immediately. Mobile hides it.

REA passively captured the page and pixels; browser automation performed hover and read computed CSS. REA 6.7.0's scenario action schema does not expose hover. Capture-window network evidence does not establish prior activity. Local photo assets and labels differ from the reference.

Regression check: `scripts/check-about.mjs`, against `npm run dev`. Set `PLAYWRIGHT_MODULE` to an existing Playwright installation and `CHROME_PATH` when a bundled browser is unavailable.
