# QA report

**Date:** 8 September 2026 (updated after real assets were sourced)
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
| `npm test` (`node --test`) | **Pass** — 47 tests, 12 suites, 0 failures |
| `npm run build` | **Pass** — 17 routes generated |
| `npm run test:e2e` (`playwright test`) | **Pass** — 71 tests, 0 failures |
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

## Unit tests — 47 passing

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

**Content provenance** (5, added when real assets were sourced)
- No fixture is marked `approved` — nothing can pass for signed-off content.
- Every shipped image records a `source`, is served from `/assets/`, and is
  marked `pending-approval`.
- Every release carries a `sourceUrl` back to the page it came from.
- No release states a release date or type, because the source publishes
  neither.
- Listening links are real `open.spotify.com/album/` URLs; every video has a
  verified YouTube id, an official watch URL, and null date/duration.

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

**Awards** (4)
- The shipped list validates; every entry is `pending-approval` with an https
  source URL.
- An implausible ceremony year (1492, 2999) is rejected.
- An award with no source URL is rejected.
- DJ Mag number-one years are stated as years, and each is a plausible integer.

**Store products** (4)
- The shipped products validate and all link to `store.davidguetta.com`.
- A price without a currency is rejected; a price without `verifiedAt` is
  rejected. A price can never be displayed without both.
- A price that is not a plain amount ("from 29") is rejected.
- An unknown availability value ("selling fast") is rejected.

**Newsletter** (5)
- Email validation accepts ordinary addresses and rejects six malformed cases.
- Rate limiting allows a burst of 5 then blocks, resets after the window, and
  tracks callers independently.

---

## Interaction tests — 71 passing

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
- A card navigates to its detail page.
- No release claims a date or type the source never published — the detail page
  says "to be confirmed" for both.
- Filters stay hidden while their metadata is missing, and the page explains why.
- A type passed directly in the URL still returns 200 and the no-match state.
- The listening control resolves to a real Spotify album URL and its accessible
  name identifies the release.

**Video**
- Zero `<iframe>` elements exist before a visitor clicks.
- On click the dialog mounts a player pointed at
  `youtube-nocookie.com/embed/v8TVixpaBcQ`, is labelled, offers the official
  watch URL alongside, closes on Escape and restores focus.
- Only one dialog can be open; closing removes it and stops playback.

**Newsletter**
- An invalid address is rejected client-side and **no request is made**.
- A valid address without consent is refused.
- With consent, the form reports "Preview only — sign-up is not connected" and
  **still makes no request** — network traffic was recorded to confirm it.
- `POST /api/newsletter` with a valid body returns `unconfigured`, never
  `subscribed`.

**Store**
- Shop appears in the primary navigation as a real external anchor with
  `target="_blank"` and `rel="noopener"`.
- Product tiles link to `store.davidguetta.com/products/…`.
- **No add-to-cart, checkout or buy control exists anywhere on the site** —
  asserted, because the store owns the transaction.
- Every displayed price carries its currency, and the read date is stated.

**Recognition**
- Wins render with their years, and the section states that it is a selection,
  excludes nominations, and awaits confirmation by management.
- The DJ Mag line shows years; a derived "5× number one"-style claim is
  asserted **absent**.

**Motion** (3, and the reason they exist)
- Every homepage section — located by its `aria-labelledby` id, not its
  wording — is visible with real height and full opacity **without being
  scrolled to**.
- Every `.scroll-in` wrapper reads back an opacity above 0.9 before any
  scrolling happens.
- Under `prefers-reduced-motion: reduce`, `animationName` is `none` on the H1
  and on every animated wrapper.

**Hero video** (7)
- With every media path aborted — the hosted loop and the embed — the H1, the
  primary CTA and the poster still render. Media can never become a
  precondition for a usable hero.
- **Nothing is requested on a 390 px viewport**: no video file, no third party.
- **Nothing is requested under `prefers-reduced-motion: reduce`.**
- On desktop the embed is muted with controls, captions, keyboard and
  fullscreen suppressed, and carries **neither `loop` nor `playlist`** — either
  makes the player show its own prev/play/next overlay when a clip starts, and
  `controls=0` does not suppress that. The montage is cycled by the layer
  instead, one clip at a time.
- A freshly mounted clip stays transparent until the player has settled (4.2 s
  on the first, cold mount; 2.6 s after), so the start-up overlay is never
  visible. The still underneath is what shows in the meantime.
- The montage advances to the next clip on its own, verified by polling the
  iframe's `src` across a transition.
- The embed is served from `youtube-nocookie.com`, never `www.youtube.com`.
- The frame is `aria-hidden` with `tabindex="-1"`: scenery, not content, and
  not a keyboard trap.
- "Pause background" removes the third-party frame from the DOM entirely, and
  scrolling away tears it down — the only reliable way to stop a third-party
  player without loading their API script.

**Responsive integrity**
- No horizontal overflow on `/`, `/live`, `/music`, a long-titled release
  detail, `/watch` and `/contact` at **360, 390, 768, 1024 and 1440 px**.
- No overflow at 360 px with the mobile menu open.
- Hero CTAs and the Menu button are ≥44 px.

**Page weight** (production build, local network, real photography in place)
Bytes are now split at the `load` event, because a single total would
misrepresent what a visitor waits for — the hero loop and the lazy imagery
further down the page are fetched only afterwards.

- `/` at 1440 px: **778 KB over 17 requests to load**, then +163 KB (loop and
  lazy imagery).
- `/` at 390 px: **768 KB over 16 requests to load**, no video at all.

The bulk is framework JavaScript (224 KB + 162 KB) and two self-hosted font
files (62 KB). The heaviest image on first load is a 40 KB video still.

**A real waste was found and fixed while measuring.** The hero rendered the
phone crop and the desktop frame as two `<Image>` elements in a
`lg:hidden` / `hidden lg:block` pair. That looks right but the browser fetches
both, so every desktop visitor also downloaded the portrait crop — at `w=1920`,
because an element inside `display:none` has no layout width to size against.
Measured at 93 KB per desktop visit. `HeroStill` now builds a real `<picture>`
from `getImageProps`, so exactly one source is fetched, and it moved off the
client bundle in the process. The `<video poster>` attribute was also dropped:
the still is already painted underneath and the video only fades in once it can
play, so the poster attribute just re-downloaded the same frame (40 KB) for
something no one sees.
- **Nothing third-party loads before the load event**, so no outside host can
  delay the first paint. **A phone loads no third party at all.**
- After load, the desktop hero embed pulls in **seven** Google/YouTube domains:
  `www.youtube-nocookie.com`, `rr*.googlevideo.com`, `i.ytimg.com`,
  `www.gstatic.com`, `fonts.gstatic.com`, `jnn-pa.googleapis.com` and
  `www.google.com`. The test allows exactly that family and fails on anything
  else, and prints the measured list on every run. This footprint is the
  argument for consent gating — see the launch checklist.
- Streaming the hero montage adds roughly **2.9 MB after load** on desktop.
  None of it is on the critical path, and none of it is requested on phones.

Two honest caveats on this measurement. `next start` optimises images on
demand, so the first request for a size is larger and slower than the cached
variant a CDN would serve; each test therefore warms the page and then measures
in a **fresh browser context**, because warming and measuring in the same page
just reads the browser cache and reports a number no real visitor experiences.
The remaining desktop spread reflects which AVIF/WebP variant the optimiser has
ready. The assertion is a regression guard at 1200 KB, not a performance claim.
Inter 600 was found to be unused and removed from the font load.

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
| `hero-video-1440.png` | The hero with the atmospheric loop playing |
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
| The scroll-linked reveal animated opacity, leaving every below-the-fold section at opacity 0 until scrolled — the same class of bug as the JS reveal removed earlier | Scroll animation made transform-only; three tests added to lock it in. |
| The hero fetched both the phone crop and the desktop frame on every visit (93 KB wasted per desktop load) | Replaced the two-`<Image>` pair with a real art-directed `<picture>` built from `getImageProps`. |
| The `<video poster>` attribute re-downloaded a frame nobody sees, since the still sits underneath | Attribute removed. |
| The page-weight test reported a single total, which the post-load video inflated by keeping the network busy and pulling lazy images into `networkidle` | Bytes are now split at the `load` event and reported separately. |
| Store product images rendered as blank squares in full-page captures — 1.3 MB transparent PNGs that the on-demand optimiser had not finished processing, and which a `fullPage` capture never requests because it does not scroll | Sources downscaled to 1200 px, and the screenshot helper now walks the page to trigger lazy loads before capturing. |
| The page-weight test warmed and measured in the same page, so it reported a browser-cache figure (67 KB) that no visitor would ever see | Measurement moved to a fresh browser context after warming. |
| `networkidle` never settled on image-heavy routes at 390 px, hanging the screenshot run | Switched to `load` plus a settle beat. |
| Release placeholders were generated sleeves; real artwork was available on the client's own site | Replaced with the real catalogue (see below). |
| The hero photograph's subject sits left of centre — the mirror of the composition the brief sketched | Hero layout flipped to the right rather than cropping across the face. |
| Per-tile "Placeholder" badges became wrong once imagery was real | Badges now render only for generated artwork; rights status is stated once, site-wide. |
| The demo notice claimed everything was placeholder content, which stopped being true | Rewritten to separate uncleared real assets from invented show dates. |

---

## Motion — what was added, and what the tests caught

Added this pass: a staggered hero entrance on load, a scroll-linked settle on
section headings, artwork scale inside its clipped frame on hover, and a 2 px
arrow shift on primary actions. All of it is CSS, all of it inside
`prefers-reduced-motion: no-preference`, and the scroll-linked part is
additionally behind `@supports (animation-timeline: view())`.

The first implementation animated **opacity** on that scroll timeline. The new
test failed immediately: a `view()` timeline sits at progress 0 for anything
not yet scrolled into view, so every below-the-fold section rendered at opacity
0 — invisible in a full-document capture, in print, and to any reader that
never scrolls. This is the *second* time this project produced that bug; the
first was a JavaScript IntersectionObserver in the original build.

The fix was to make the scroll-linked animation **transform-only**. It can move
content a few pixels; it cannot hide it. The three motion tests above now lock
that in, and the CSS carries a comment saying why.

## Assets sourced from the live site

Added after the first pass, at the client's request. Provenance is recorded in
full in `ASSET-MANIFEST.md`; what matters for QA:

- The wordmark, hero photography, 8 release artworks and 7 video stills were
  downloaded from davidguetta.com and `i.ytimg.com`. Originals are kept
  unmodified in `../incoming-assets/from-live-site/`.
- **Rights are not cleared.** A unit test asserts nothing is marked `approved`.
- Every video title and channel was re-confirmed individually through YouTube's
  oEmbed endpoint rather than trusted from a scrape. All 7 returned author
  "David Guetta".
- All 8 Spotify album URLs were checked and returned HTTP 200.
- Release dates and types were **not** inferred. WordPress upload-folder dates
  are upload dates, not release dates, and were not repurposed.
- Tour dates were deliberately **not** scraped from the site's Bandsintown
  widget; `events.ts` remains invented fixtures.
- The source's duplicate "I'm Good (Blue)" entry (identical artwork, same
  Spotify album) was dropped.

Added on the second pass:

- 13 videos (up from 7), each re-confirmed through oEmbed.
- 4 products from the official Shopify feed at `store.davidguetta.com`, with
  live prices, currency and stock. Product PNGs were downscaled from 1772 px to
  1200 px, roughly halving each file.
- 8 award wins and the DJ Mag number-one years, parsed from the rendered
  Wikipedia table with rowspans resolved. **Rights and accuracy unverified;
  management confirmation is a blocking launch item.**

## Not verified

Stated plainly so nobody assumes otherwise.

- **Lighthouse / axe**: not run. Neither tool is installed in this environment.
  Contrast was measured directly and keyboard, focus, landmark, heading and
  status-without-colour behaviour was asserted in tests, but no automated
  accessibility audit has been run.
- **Core Web Vitals**: no field LCP, INP or CLS figures exist. A local
  measurement cannot produce them. The 75th-percentile targets in `design.md`
  §14 remain goals, not results.
- **Video across browsers**: the loop was only exercised in Chromium. Safari's
  autoplay rules for muted inline video, and its handling of VP9, need a real
  check. The H.264 fallback exists for exactly that reason but is untested
  outside Chromium.
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
- **Outbound destinations**: the four social links, the radio/podcast link, the
  Bandsintown artist page, all 8 Spotify album URLs and all 7 YouTube watch URLs
  were checked on 8 September 2026 and resolved. Bandsintown returns 403 to
  plain `curl` (bot protection) but loads in a browser. Re-verify all of them at
  launch.
- **Rights and licensing**: not assessed. Whether these assets may be
  republished is a question for the client and their legal representatives, not
  something this build can answer.
- **Full artist credits**: the discography lists only "David Guetta" for every
  entry. Featured artists appear in release titles and on the sleeves, but the
  credit lists shown on the site are the source's, not verified.
