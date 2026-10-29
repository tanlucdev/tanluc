# Work showcase reference investigation

Reference: https://neelsaswade.com/ — observed 2026-10-28.
Scope: project showcase below the existing meadow hero. The hero is outside the change scope.

## Evidence and limits

REA CLI 6.7.0, `capture-browser-scenario`, Chromium 156.0.8078.73,
1440 × 1000 viewport, light mode, normal motion, blocked service workers.

Successful Evidence ID:
`ev_e52e5ac62a16ce4c60f80e66450491ffa246d695390d82a68a69b70c0ef7356b`.
The scenario navigated to `https://neelsaswade.com/#work-psychic`, waited for
`#work-psychic .is-visible`, then captured DOM, screenshot and URL.
All steps completed; no missing or truncated sections. Owned browser cleanup:
`terminated-owned-process`. Screenshot SHA-256:
`9f409a7a1fdb182c2283998ac7a1ea2cda750ba993ecd5a105767eae97797c51`.
Full session artifact: `/tmp/neels-rea-reference.json` (temporary, not committed).

An earlier attempt to click the initially hidden navigation timed out. Its
Evidence ID is `ev_75dce7f7471a689eada92ebe783ab28760db0433b8642040f7f6ded16b5636a5`;
it is incomplete and does not establish successful navigation.

REA MCP was absent in this session. Installed CLI supplied the Evidence;
no MCP, provider, credential or router configuration was changed.
The in-app browser bootstrap failed with `Cannot redefine property: process`.
Additional computed-style measurements and motion samples used the existing
standalone Playwright installation, separately from REA. These are ordinary
browser observations, not additional REA Evidence records.

## Observed structure and styling

| Element | Reference behavior |
| --- | --- |
| Outer showcase | `width: min(100% - 64px, 1445px)` |
| Desktop layout | `180px minmax(0, 1145px)`; gap `clamp(32px, 5vw, 120px)` |
| Sticky navigation | top `calc(116px + clamp(29.9px, 2.645vw, 41.4px))`; 16px gap |
| Navigation text | Geist 14px/1.4; inactive `#999691`, active `#43413e` |
| Heading | Newsreader italic `clamp(26px, 2.3vw, 36px)/1.15`, `#7d7a73` |
| Metadata | Geist 14px/1.4; company then year |
| Media | aspect ratio `1145/500`; columns `708fr 417fr`; 20px gap; 12px corners |
| Summary | Geist 16px/1.6, `#7d7a73`; 24px top margin |
| Tablet | navigation hidden below 1080px |
| Mobile | 16px gutters; primary media above two secondary tiles; 12px gaps |

At 1440px with a reserved 15px scrollbar: showcase x=32, width=1361;
content x=284, width=1109; media height=484.266; media columns 685.344/403.656.
At 390px with that scrollbar: showcase x=16, width=343; media grid height=413.688.
Platform scrollbar differences can change available width without changing CSS.
The reference sets a global stable scrollbar gutter. The existing portfolio
does not. Its available content width can therefore be 15px wider in Chromium
at the same viewport. Global scrollbar styles are preserved to avoid changing
the completed hero; this prevents claiming universal pixel-for-pixel equality.

## Observed motion and inspected implementation

Public shipped CSS and JavaScript were read separately using ordinary download
and text inspection. Static declarations establish implementation choices;
they are not proof that every branch executed.

- Reveal: once, observer threshold .08, bottom root margin -12%; opacity and
  6px vertical translation over 250ms, `cubic-bezier(.23, 1, .32, 1)`.
- Navigation: staggered 600ms entrance, starting at 150ms with 50ms increments.
  The active 3px dot moves over 250ms, `cubic-bezier(.77, 0, .175, 1)`.
  Active sections are observed inside the viewport band from 20% to 35% height.
- Navigation clicks: center the selected section using a 560ms custom eased
  scroll, update history, move keyboard focus without an additional scroll.
- Proactive cards: 18 images, permutation `index * 7 % 18`, advance every
  3400ms; 750ms transform transitions. Position uses 16.35cqw vertical steps,
  12-degree X rotations and scale `max(.8, 1 - abs(offset) * .035)`.
  Independent runtime samples confirmed the card transform changed.
- Homepage: interactive before/after panel and a looping vertical card track.
- Artifacts: `1145/450` composition with 10px row gap; document/edit panels and
  cycling stacked email/chat skins. A 15-second Web Animations sequence uses
  24/15/6cqw starting offsets, scales 1/.94/.88, and changing stacking order.
- Animation/video lifecycle: visibility and reduced-motion gates are present
  in shipped components. Local verification must check the reconstruction's
  lifecycle separately.

Source URLs: `/_next/static/css/index.souV6DFN.css`,
`/_next/static/chunks/reveal-DoDj4PK_.js`,
`/_next/static/chunks/work-nav-Cn-4wsPD.js`,
`/_next/static/chunks/work-scroll-gEKMw6Tw.js`,
`/_next/static/chunks/psychic-cards-Bjbg6_es.js`,
`/_next/static/chunks/homepage-comparison-CIV_k9-0.js`,
`/_next/static/chunks/homepage-cards-7QOlwm-s.js`,
`/_next/static/chunks/artifact-skins-Ct_KT5B2.js`.

The reference also intercepts an initial desktop wheel gesture to enter work.
The reconstruction deliberately leaves that hero behavior alone because the
user explicitly excluded changes to the completed first section.

### Follow-up: hero-to-work handoff (2026-10-29)

The user subsequently requested this missing transition explicitly, superseding
the earlier decision to omit the first-wheel shortcut. The company order is now
WALA ICT, ISB Corp, Onemedic; the first destination must follow the data order.

New passive REA inspections of the live reference, Chrome 156, 1440 × 900:

- Before wheel: `ev_d6225ba0835e3729aec6d7d60daa9abad16861351773f8ed41602ac63638b44d`.
- After wheel: `ev_cbfc77c5c9da02dbd33f11e422bd17e1e8566c0ec49fa2a2f00df63cc285a061`.
- Temporary complete records: `/tmp/hero-work-reference-before.json` and
  `/tmp/hero-work-reference-after.json`. Both are attach-limited and
  policy-filtered; neither reports truncation. Prior network activity,
  unrequested script sources, unsupported frames and third-party origins are
  outside these captures. REA did not perform the wheel action.

Separate Playwright observations performed a downward wheel of 60px from
scrollY 0. The page settled at scrollY 1018; the first project measured
top 135.406px, bottom 765.516px, height 630.109px in the 900px viewport.
Screenshots before, during and after verified the project became fully visible.
These geometry and timing samples are ordinary browser observations, not REA
Evidence fields. The in-app browser again failed to initialize with
`Cannot redefine property: process`; existing standalone Chrome was used instead.

The inspected shipped `work-scroll-gEKMw6Tw.js` specifies the initial 900ms
transition with cubic-bezier(.77, 0, .175, 1), compared with 560ms for navigation.
Its destination is the project document top minus
`max(32, (innerHeight - projectHeight) / 2)`. The initial shortcut applies only
at scrollY <= 8, on fine-pointer desktop >= 1080px, for a downward predominantly
vertical wheel without Ctrl/Meta, outside editable/dialog/nested-scroll targets.
Positive wheel bursts are consumed while entering; upward input or other user
interaction cancels. This is an entry handoff, not snapping every project.
Sections taller than the viewport align with a 32px top inset instead of being
scaled down. Mobile and reduced-motion users retain native wheel/document flow.

Local verification used the same 1440 × 900 viewport and 60px wheel: WALA
settled at scrollY 934, top 172.781px, bottom 728.203px, height 555.422px.
The complete heading, media and summary fit inside the viewport; the different
project height explains the different centered destination. Hero source and
global styles were not changed.
Local passive REA records:
`ev_4f121d6eacad2da97c5f5f66198a944c7e98fc5c228857b4ce9067cedcd64392`
(before),
`ev_3c7ff8e7af23ab89e4191833c704936cf44141a861669a9f4db3e5261865c50d`
(after), saved under `/tmp/hero-work-local-{before,after}.json`.

Independent checks passed at 1440 × 900 and 1100 × 700: the full first project
fits after a small wheel burst, both initially and after returning to the top.
`npx tsc --noEmit`, `git diff --check`, and `scripts/check-wind.mjs` passed.
The hero/global-style SHA-256 values below remain unchanged.
The extended `scripts/check-work-showcase.mjs` also passed independently,
including wheel bursts, reverse cancellation, rearming, native mobile/reduced
motion, existing navigation, footer and media lifecycle. Targeted ESLint found
no errors and the same eight existing image-optimization warnings. Implementation
used `cx/gpt-5.6-terra`; the Lead reviewed the change and browser observations.

## Why companies and products appear together

Observed: navigation lists Proactive intelligence, Homepage redesign, Artifacts,
Growth and Web3 at Snap. Four sections identify Glean as the company; one
identifies Snap. Years run 2026, 2026, 2026, 2025, 2022.

Inference: this is a curated project portfolio, broadly recent-first, rather
than a company-by-company employment history. Projects describe the work;
company and year establish its context. Glean repeats because the author shows
several distinct contributions at the same employer. The author’s private
editorial intent cannot be proved from the page alone.

For this portfolio, Onemedic → ISB Corp → Wala ICT is the user-requested display
order. Dates, project names, personal contributions and outcomes remain pending
user content. Reference product media is temporary visual material, not evidence
of work performed for those companies.

## Reconstruction verification

REA captured `http://localhost:3000/#work-onemedic` with the same 1440 × 1000
viewport and motion settings. Evidence:
`ev_ea4f988ec8a9c207caaa07591dde0eedf3185e66ac0b93627d0fcc336e6c20c1`.
Navigation, visible-reveal wait and final DOM/screenshot/URL capture completed;
no missing or truncated sections. Screenshot SHA-256:
`3af993d2dc8a9738ae739101bc34cc7024e0535c774546ae186890aed8f079d9`.
Owned browser cleanup completed. Full temporary record:
`/tmp/portfolio-rea-work.json`.

Independent browser inspection found no page errors or horizontal overflow at
1440 × 1000 and 390 × 844. Mobile gutters measured 16px. Pixel equality is not
claimed: copy, company labels, number of entries, scrollbar allocation and
animation capture time differ. The reconstruction adds an explicit motion pause
control and preserves the existing hero's scroll behavior.

Hero preservation was checked against the task-start SHA-256 values:

- `src/components/hero/HeroMeadow.tsx`:
  `5c624cb3174605cc5c0d3a3d3eb8010072ad84a189eb624742c12a0413cc2eaa`
- `src/components/hero/reveals.ts`:
  `6cb58e91c4dec7ce769854f60026641bb9aa042927177eb6fc9bda8038ae9c9d`
- `src/app/globals.css`:
  `8fce7e88d89c5b41a92e30f6f6a9fb2f6561dda23ec04f032ebaa8a2069b8473`

All three remained unchanged during this task; their pre-existing uncommitted
changes belong to the user.

Validation: `scripts/check-work-showcase.mjs` passed against localhost. It checks
desktop/mobile overflow, active navigation and focus, visible rolodex motion,
offscreen video pausing, stream focus pausing, motion control, reduced motion
and server-rendered fallback. `npx tsc --noEmit` and `git diff --check` passed.
`npm run lint` exited successfully: 0 errors, 14 `no-img-element` warnings
(6 in the untouched hero, 8 in the reference-media showcase).

Run the browser check with an installed Playwright module and browser:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs CHROME_PATH=/absolute/path/to/chrome node scripts/check-work-showcase.mjs
```

The browser check itself adds no dependency to the application. Work used
`cx/gpt-5.6-luna` for read-only repository discovery and `cx/gpt-5.6-terra`
with high effort for the single implementation stream. The Lead reviewed code,
screenshots and actual check output before acceptance.
