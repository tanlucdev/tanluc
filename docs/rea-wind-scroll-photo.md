# Wind, scroll and photography review

Inspected 2026-10-28. Reference: https://neelsaswade.com/. Local: http://localhost:3000/.

## Evidence and limits

- Historical REA home capture: `ev_1293245fb9e7cb8fff9a07afe2471eefd69d904c8b35012155b4a344134791cb`, `/tmp/portfolio-rea.MHn7ez/original.json`.
- Historical REA About capture, including the soundscape script: `ev_c36785d5e8ae8e1525ecfd1b225d5fa148a752d7242927014851151bf22af915`, `/tmp/portfolio-rea-browser.Oic7wt/reference-page.json` (2026-10-24).
- New reference navigation: `ev_76be6f4e618bb51ad8586b8f9cb76eab2ff1714137d613f0b74baeafaa0d59c8`. Cloudflare returned a challenge; no challenge was solved. This capture does not verify current reference interactions.
- REA static analysis of the exact, publicly served bundles identified by those captures: `ev_39f1ec21a211c32bf317f5d9871814381a97990870b523d3ffa5f27fbfcc12c7` (meadow, work scroll, reveal, grouping) and `ev_25f99e9de3df0ab346eccf34705fcd76f8e5278f5acd6a2282aedee6c9bb8606` (photography gallery).
- Local REA navigation/scroll capture before implementation: `ev_d1e0c5e776f0f5d46c6a936e108f54086dd4529a2d1ce2b61ed706120b1c2f24`. Home, PageDown, Photography and About completed; REA terminated its owned browser.

Complete new records: `/tmp/portfolio-reference-home-20261028.json`, `/tmp/portfolio-wind-rea-static-20261028.json`, `/tmp/portfolio-photo-rea-static-20261028.json`, `/tmp/portfolio-local-rea-20261028.json`. Downloaded artifacts: `/tmp/portfolio-wind-rea.9nb0s0/`. Temporary paths are not portable repository artifacts.

The static analysis never executed bundle code; shared imports and unselected modules remain unresolved. Its conclusions describe the inspected artifact revision, not a claim that today's live deployment was fully exercised. Local screenshots and actual audio playback were checked separately through Chromium after the in-app browser failed to initialize.

## Wind

The captured `soundscape-DjkgW4yL.js` loads `/audio/meadow-wind-leaves.mp3`, uses gain 0.65 and a session gate, and listens for `portfolio:welcome-gust-sound`. It is a single welcome gust, not a looping ambience or a sound attached to every scroll. Reduced motion, a hidden document, unavailable user activation and a start more than 1.8 seconds late suppress playback.

Browser decoding of the downloaded MP3 established 4.25 seconds, 48 kHz, stereo. Left-channel RMS per second was 0.0326, 0.1435, 0.0326, 0.0102, then approximately zero: a short swell followed by a quiet tail. These are decoded measurements, not a listening-quality assessment.

Reference visual timing, inferred from `hero-meadow-LyxV7Nqt.js`: a welcome wave starts after 500 ms, travels across the meadow over 3200 ms, and applies a 1450 ms local impulse. Sound starts 350 ms before the wave reaches the tree. Browsers may suppress it when the visitor has not interacted yet.

Local design decision: start a finite gust and its sound together on the first trusted interaction inside the visible hero. Keep it out of Photography and About. Expose a stop control; stop on leaving the hero, leaving the page, hiding the tab or enabling reduced motion. This deliberately adapts the trigger to reliable browser playback instead of reproducing a welcome wave that may already have passed before sound is permitted.

Audio source: https://neelsaswade.com/audio/meadow-wind-leaves.mp3. Local copy: `public/audio/meadow-wind-leaves.mp3`. SHA-256: `89da8672ff41a3b427d6b9449290d1a25e9c01d41b80126b6a07ec306ac59d76`. The source supplies no reuse license in the inspected artifacts; attribution does not establish licensing.

## Scroll stages

| Stage | Reference artifact | Local decision |
| --- | --- | --- |
| Hero at rest | Living grass, tree and pointer interactions | Keep the existing meadow; add its missing finite sound cue. |
| Begin handoff | Progress starts at work top minus 1.06 viewport heights; ends at work top minus 0.2 viewport heights | Existing local thresholds already match. |
| Scene motion | Quintic smootherstep, exponent 1.08, 190 ms exponential following; scene descends and shrinks by at most 1.2% | Existing local treatment matches; retain it. |
| Grass dissolution | Fade starts after 12% eased progress; irregular eight-point clip edge; up to 2.8 px blur | Retain the existing layered dissolution. |
| Tree dissolution | Begins later than grass; up to 1.4 px blur; layer moves oppositely by 30 px | Retain depth without adding a new transition system. |
| Work paper | Paper opacity rises with the grass fade; the scene becomes hidden at completion | Keep the local paper handoff and stop wind as the hero exits. |
| Desktop wheel shortcut | First downward wheel can center the first work feature in 900 ms; anchor navigation uses 560 ms | Keep native scrolling locally: the local destination is a card grid, not the reference's large work chapters. |
| Content reveals | IntersectionObserver, 8% threshold and bottom margin -12%; work feature CSS uses 6 px / 250 ms | Optional for future full-width case-study chapters; no blanket animation on every card or paragraph. |
| Mobile / reduced motion | Reference disables wheel interception for coarse pointers and reduced motion | Preserve local mobile document flow and reduced-motion behavior. |

The reference does not establish an elaborate transition for every route. Home's scene handoff, work-section reveals and a photo lightbox are separate behaviors.

## Photography search

The actual Photo navigation route is `/photography` on both sites.

| Behavior | Before locally | Reference artifact / applied direction |
| --- | --- | --- |
| Typing debounce | 350 ms | 600 ms, then wait for current animations; ignore partial IME composition. |
| Removed photographs | Accelerated fall with rotation | Keep the physical fall; use 600-690 ms. |
| Surviving photographs | Reflow after only 100 ms, overlapping the fall | Wait for the fall plus 180 ms, then reflow over 600 ms with `cubic-bezier(.77,0,.175,1)`. |
| Returning photographs | Drop from -100 px with rotation | Rise from 72 px below, fading in without rotation. |
| Gallery height | Shrinks immediately | Hold the larger old/new height until motion completes. |
| Dense hover sound | A tick on every photograph | Silent photo hover; retain explicit click feedback. |

The existing rotating search prompt already follows the reference's four-word, 16-second cycle closely. Local prompt words and search metadata should describe the user's photographs, not the reference collection. A borderless lightbox suits this gallery; the white paper frame remains appropriate for About's printed-photo treatment.

## About recommendation

Keep the editorial serif typography, quiet grid background, narrow reading column and overlapping photo prints. The existing 1.85x hover over 250 ms, caption delay of 150 ms plus 30 ms per letter, and thumbnail-to-lightbox expansion already fit this language. Keyboard focus should reveal complete captions immediately; mobile should keep horizontal browsing without hover enlargement. See `rea-about-hover.md` for the earlier runtime evidence.

Do not add persistent wind, falling paragraphs or full-page scroll snapping here. If a later content reveal is needed, use one restrained 6-10 px fade per section, with reduced motion bypassed. Portrait, real side-project imagery and a working Resume destination matter more than additional motion: the inspected page still contains placeholders and an unconnected Resume button.

The missing About thumbnail `D1206F12-1559-4466-808D-7528942C5269_1_201_a.png` was replaced with the available `sunset-xuan-huong-lake.jpeg` and a matching caption. Other inherited captions also merit an editorial pass against the actual photos; do not invent personal memories from the reference.

## Verification

Use `npm run lint`, `npm run build`, `scripts/check-wind.mjs`, `scripts/check-photography.mjs` and `scripts/check-about.mjs`. Browser scripts accept `PLAYWRIGHT_MODULE`; set `CHROME_PATH` when the installed browser requires an explicit executable. The wind check exercises lifecycle rules; a separate real-playback probe confirmed advancing playback time, duration 4.25 seconds, volume 0.65 and successful muting.

Final local validation: production build passed; lint passed with six existing `@next/next/no-img-element` warnings; Wind, Photography and About browser checks passed. Wind coverage includes blocked session storage across client navigation without replay or a stale mute control. Native audio playback and mute were verified at 1440 px and 390 px widths. The mute target is 44 px tall, keyboard outlined, and sits above the desktop weather text. About's recent-print images decoded successfully.
