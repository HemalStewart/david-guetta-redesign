# QA report

**Date:** 8 September 2026
**Build:** local production build (`next build`, then `next start`)
**Machine:** macOS (Darwin 25.6.0), Node v24.10.0, npm 11.6.0
**Browser under test:** Chromium 153 (Playwright 1.63 bundled headless shell)

This records what was actually run. Anything not run is listed under
[Not verified](#not-verified) rather than assumed to pass.

---

## Commands and results

| Command | Result |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | **Pass** — no errors |
| `npm run lint` (`eslint`) | **Pass** — 0 errors, 0 warnings |
| `npm test` (`node --test`) | **Pass** — 31 tests, 10 suites, 0 failures |
| `npm run build` | **Pass** — 17 routes generated |
| `npm run test:e2e` (`playwright test`) | **Pass** — 52 tests, 0 failures |
| `node tests/tools/contrast.mjs` | Ran; results below |

Route output from the production build:

```text
ƒ /                     dynamic (next show and upcoming list must never be stale)
ƒ /live                 dynamic
ƒ /music                dynamic (filter params)
● /music/[slug]         6 pages prerendered
○ /contact /privacy /terms /watch /_not-found /robots.txt /sitemap.xml
ƒ /api/newsletter
```

---

## Unit tests — 31 passing

`tests/unit/`, run on the real source modules with an injected clock.

**Dates and venue timezones** (11)
- A Sydney show is still upcoming at 2027-02-19 21:00 UTC (20 Feb in Sydney) and
  no longer upcoming at 2027-02-20 21:00 UTC (21 Feb there).
- A Los Angeles show is still upcoming at 03:00 UTC the following day.
- `localDateIn` resolves the same instant to different calendar dates per zone.
- A 30 Oct – 1 Nov festival stays upcoming through 1 November and drops out on
  2 November.
- Upcoming/past split uses the injected clock, not the machine clock.
- `nextEvent` skips a cancelled show but keeps a sold-out one.
- `nextEvent` returns null when nothing is upcoming.
- Date block formatting: single date, same-month range, cross-month range split
  over two lines.

**Content and filters** (15)
- All shipped fixtures pass every validator.
- Exactly one featured release and one featured video.
- Every fixture is marked `approval: "demo"`.
- All site-settings URLs are `https:`; no nav entry is `#`.
- `javascript:` and `http:` are rejected; `#` is rejected as an internal href.
- An `on-sale` event without a ticket link fails validation.
- An unknown IANA timezone fails validation.
- An `endDate` before its `date` fails validation.
- Duplicate ids fail validation.
- A second featured release fails validation.
- Search matches city, country and venue, is case-insensitive, and treats
  whitespace as no filter.
- Region and text filters combine correctly.

**Newsletter** (5)
- Email validation accepts ordinary addresses and rejects six malformed cases.
- Rate limiting allows a burst of 5 then blocks, resets after the window, and
  tracks callers independently.

---

## Interaction tests — 52 passing

`tests/e2e/`, against the production build.

**Navigation and structure**
- All seven primary routes return 200 and have exactly one `<h1>`.
- `/discography` permanently redirects to `/music`.
- An unknown release slug returns **HTTP 404** with the 404 page — not a
  redirect and not a soft 200.
- No page exposes `href="#"` or a `javascript:` link.
- The skip link is the first tab stop and becomes visible on focus.

**Mobile menu (390 px)**
- Opens, sets `aria-modal`, locks background scrolling.
- Escape closes it and focus returns to the Menu button.
- Navigating from the menu closes it and lands on the route.

**Live page**
- Region filter writes `?region=` and survives a reload.
- Search writes `?q=`; browser Back restores the previous state.
- No matches shows a recovery message and a Clear filters link.
- Clear filters resets both controls and the URL.
- Past shows are a separate view — Barcelona (a past fixture) never appears in
  Upcoming.
- All five statuses render as words, not colour alone.
- A cancelled show offers no ticket action.

**Music**
- A card navigates to its detail page; the tracklist renders.
- Type filters keep state in the URL.
- A release with no listening link shows "Listening link pending".

**Video**
- Zero `<iframe>` elements exist before a visitor clicks.
- The dialog opens, is labelled, offers the official channel for an
  unconnected video, closes on Escape and restores focus.
- Only one dialog can be open; closing removes it.

**Newsletter**
- An invalid address is rejected client-side and **no request is made**.
- A valid address without consent is refused.
- With consent, the form reports "Preview only — sign-up is not connected" and
  **still makes no request** — network traffic was recorded to confirm it.
- `POST /api/newsletter` with a valid body returns `unconfigured`, never
  `subscribed`.

**Responsive integrity**
- No horizontal overflow on `/`, `/live`, `/music`, a long-titled release
  detail, `/watch` and `/contact` at **360, 390, 768, 1024 and 1440 px**.
- No overflow at 360 px with the mobile menu open.
- Hero CTAs and the Menu button are ≥44 px.

**Page weight** (production build, local network)
- `/` at 1440 px: **320–385 KB across 21 requests** over three runs.
- `/` at 390 px: **319–383 KB across 17 requests**.
- **Zero third-party requests** on first load — no player, font CDN, social
  embed or analytics beacon.

The weight is almost entirely framework JavaScript and two self-hosted font
families; the composition uses no raster images. Inter 600 was found to be
unused and removed from the font load during this pass.

---

## Contrast (`node tests/tools/contrast.mjs`)

Targets: 4.5:1 normal text, 3:1 large text and control boundaries (WCAG 2.2 AA).

| Pair | Ratio | Verdict |
| --- | --- | --- |
| paper on ink | 16.72 | Pass |
| ink on paper | 16.72 | Pass |
| muted-dark on ink | 9.30 | Pass |
| muted-dark on ink-raised | 8.60 | Pass |
| ink on signal-hover | 7.16 | Pass |
| signal on ink | 6.05 | Pass |
| ink on signal (buttons) | 6.05 | Pass |
| muted-light on paper | 5.59 | Pass |
| control-light border on paper | 5.59 | Pass |
| signal-ink on paper (labels) | 5.35 | Pass |
| control-dark border on ink | 3.96 | Pass (3:1 target) |
| control-dark border on ink-raised | 3.67 | Pass (3:1 target) |
| rule-dark / rule-light dividers | 1.65 / 1.45 | Below 3:1 — decorative only |

**Two failures were found and fixed during this pass:**

1. `signal` (#FF5738) on `paper` measured **2.77:1** and was being used for the
   `01 / MUSIC` section index and the "Featured release" label on warm-white
   sections. Added `signal-ink` (#B82F0C, 5.35:1) for signal-coloured text on
   paper. `signal` is still used freely on ink, where it measures 6.05:1.
2. Form controls and outline buttons used the decorative `rule-dark` token
   (**1.65:1**) as their visible boundary. Added `control-dark` (3.96:1) and
   `control-light` (5.59:1) and applied them to inputs, selects, filter chips,
   outline buttons and status tags.

Decorative dividers remain below 3:1 deliberately: they carry no meaning and
never form the boundary of a control.

---

## Manual review

- **Keyboard**: tab order follows reading order on every route. Skip link
  first. Menu and video dialogs trap focus, close on Escape, and restore focus
  to their trigger (asserted in tests, not only by eye).
- **200% zoom**: emulated by halving the layout viewport to 720 px. The layout
  reflows to the tablet arrangement; no clipped content, no lost controls, no
  horizontal scrolling. Screenshot: `screenshots/home-zoom200.png`.
- **Status without colour**: every event state is a word, and cancelled rows
  are additionally muted.
- **Failure states reviewed by rendering them**: no-match filters, unknown
  release slug, unconnected video, unconnected newsletter. The feed-failure and
  empty-schedule branches are implemented (`ContentResult<T>` distinguishes
  "empty" from "unavailable") but cannot be triggered from fixtures — see below.

---

## Screenshots

In `docs/screenshots/`, regenerate with `npm run screenshots`.

| File | What it shows |
| --- | --- |
| `home-360/390/768/1024/1440.png` | Full homepage at all five review widths |
| `home-zoom200.png` | Homepage at 720 px (200% zoom equivalent) |
| `live-390/1440.png` | Live listing with filters |
| `live-no-matches-1440.png` | Filtered to zero results |
| `music-390/1440.png` | Catalogue with the featured block and filters |
| `release-390/1440.png` | Release detail with tracklist and credits |
| `watch-390/1440.png` | Video collection |
| `mobile-menu-390.png` | Menu open, social links at the bottom |
| `video-dialog-1440.png` | Dialog with the honest unconnected state |
| `newsletter-unconnected-1440.png` | Sign-up reporting it is not connected |
| `not-found-1440.png` | 404 |

---

## Issues found and fixed during this pass

| Issue | Fix |
| --- | --- |
| Reveal-on-scroll animation left whole sections invisible in a full-page render — content genuinely hidden, not just unanimated | Entrance animation removed. Motion is now limited to hover/focus colour changes and dialog fades. |
| An inline bootstrap script stamped an attribute on `<html>`, causing a React hydration mismatch | Removed with the animation. |
| A root `loading.tsx` made every route stream, flushing HTTP 200 before `notFound()` could set the status — unknown release slugs answered **200** | Moved to `/live` only, where a provider fetch will actually happen. Unknown slugs now return a real 404. |
| The header's `backdrop-filter` created a containing block, anchoring the fixed mobile menu to the header's box and clipping its social links off-screen | Menu dialog moved out of `<header>` to a sibling element. |
| Release placeholders were indistinguishable from the hero photography placeholder — a grid of six identical stage images | Separate "sleeve" treatment with four seeded archetypes. |
| Rows showed both a "Tickets unavailable" tag and an inert dashed "Tickets" control | Inert control removed; the status tag already says it. |
| "Cancelled" was rendered with a strikethrough *through the word*, which reads as "not cancelled" | Strikethrough removed; the row is muted instead. |
| `/music` featured block left a large void beside the artwork | Title, artists, date and copy moved into the right column. |
| A cross-month date range overflowed its column | Ranges now break after the dash across two lines. |
| Two contrast failures (see above) | New `signal-ink` and `control-*` tokens. |
| Inter 600 was loaded but never used | Removed from the font load. |

---

## Not verified

Stated plainly so nobody assumes otherwise.

- **Lighthouse / axe**: not run. Neither tool is installed in this environment.
  Contrast was measured directly and keyboard, focus, landmark, heading and
  status-without-colour behaviour was asserted in tests, but no automated
  accessibility audit has been run.
- **Core Web Vitals**: no field LCP, INP or CLS figures exist. A local
  measurement cannot produce them. The 75th-percentile targets in `design.md`
  §14 remain goals, not results.
- **Real browsers**: only Chromium was tested. **Mobile Safari, desktop Safari
  and Firefox were not.** Two areas deserve a real-device check: `100dvh` on
  the mobile menu, and iOS Safari's handling of the sticky header over the
  hero.
- **Real devices**: none. Touch targets were measured in an emulated viewport.
- **Screen readers**: none. Roles, names, `aria-current`, live regions and
  focus management were verified programmatically, which is not the same thing.
- **Feed failure and empty-schedule states**: the code paths exist and the
  adapter models them, but they cannot be exercised without a provider that can
  fail. Cover them when the tour integration is built.
- **Provider-connected newsletter states** (`subscribed`, `pending-confirmation`,
  `duplicate`, real `provider-error`): unreachable until a provider exists. The
  endpoint currently returns `provider-error` if it is ever reached with
  configuration present, because the provider call is still a documented stub.
- **Outbound destinations**: the four social links, the radio/podcast link and
  the Bandsintown artist page were opened on 8 September 2026 and resolved.
  Bandsintown returns 403 to plain `curl` (bot protection) but loads in a
  browser. Re-verify all of them at launch.
