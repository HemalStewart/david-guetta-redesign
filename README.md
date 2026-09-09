# David Guetta — website concept

An unpublished redesign concept built from `../design.md`. It runs, it is
responsive, and every journey in the brief works — but it is **not** an
official David Guetta site and it is **not** production ready.

> **The imagery, wordmark, release artwork and videos are real material taken
> from davidguetta.com and the official YouTube channel, and are NOT
> rights-cleared.** They are in the build so the design can be reviewed with
> real content. Do not publish this anywhere public until the client confirms
> the rights position. Show dates are still invented demo fixtures, and no
> external service is connected.

See [ASSET-MANIFEST.md](ASSET-MANIFEST.md) for the provenance of every file and
[docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) for what stands between
this and a launch.

## Requirements

- Node.js 20.9+ (built and verified on **v24.10.0**)
- npm 10+ (verified on **11.6.0**)

## Run it

```bash
npm install
npm run dev
```

Then open the address the dev server prints (normally <http://localhost:3000>).

Production build and serve:

```bash
npm run build
npm start
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Node's built-in runner) — date/timezone, filters, content validation, newsletter |
| `npm run test:e2e` | Playwright: journeys, responsive integrity, page weight, screenshots |
| `npm run screenshots` | Regenerates `docs/screenshots/` only |
| `npm run verify` | typecheck → lint → unit tests → build |

`npm run test:e2e` builds the app and serves it on port 3100 itself; nothing
needs to be running first. Install browsers once with
`npx playwright install chromium`.

There is also `node tests/tools/contrast.mjs`, which prints the measured
contrast ratio of every design token pair, and
`python3 tools/make-hero-loop.py`, which regenerates the original hero loop
(needs Pillow, numpy and ffmpeg).

## Versions in use

Resolved once at setup and pinned by `package-lock.json`:

| Package | Version |
| --- | --- |
| next | 16.3.4 |
| react / react-dom | 19.2.8 |
| tailwindcss | 4.x (CSS-first `@theme`, configured in `src/app/globals.css`) |
| typescript | 5.x |
| @playwright/test | 1.63.0 |

## What is where

```text
src/
  app/                 routes, metadata, robots, sitemap, error and 404 states
    api/newsletter/    server endpoint; returns "unconfigured" until a provider exists
  components/
    layout/            Header (+ mobile menu), Footer, DemoNotice, PolicyPage
    sections/          Hero, NextShow, FeaturedRelease, LivePreview,
                       PerformanceFeature, MerchFeature, Recognition,
                       Updates, NewsletterForm
    music/             ReleaseCard, ReleaseFilters, ListenAction
    live/              EventRow, EventFilters, EventStatus
    media/             ResponsiveMedia, PlaceholderArt, VideoDialog,
                       HeroStill (art-directed <picture>), HeroVideoLayer
    ui/                ButtonLink, Container, SectionLabel, PageHeader
  content/             site settings, campaign, releases, events, videos,
                       awards, products — the only place content lives
  lib/
    content/           the adapter every component reads through, plus validation
    dates/             venue-timezone and date-range handling
    validation/        shared email check
    analytics/         event adapter (not connected)
  newsletter.ts        server-side provider configuration
tests/
  unit/                pure logic, run by node --test
  e2e/                 Playwright journeys, responsive checks, page weight, screenshots
  tools/contrast.mjs   design-token contrast measurement
docs/                  QA report, migration map, content guide, launch checklist
```

## Two things to know before editing

1. **No component imports `src/content/*` directly.** Everything reads through
   `src/lib/content/index.ts`. To connect a CMS or tour provider, change that
   file only — fetch, map into the models in `src/lib/content/types.ts`, run
   the same validators, keep the same return shapes.

2. **Fixtures are validated at module load.** A duplicate id, an unknown IANA
   timezone, a `javascript:` URL, an end date before its start date, or an
   "on sale" event with no ticket link fails the build rather than rendering
   something misleading.

## Honest states, by design

Where something is unknown or unsupplied, the site says so rather than
inventing a value:

- **No release dates or types.** The official discography does not publish
  them, so both are `null`, the detail page says "to be confirmed", and the
  type/year filters stay hidden with a line explaining why. Upload-folder
  dates were **not** repurposed as release dates.
- **No ticket links.** Each row shows its real status; there is no dead
  "Tickets" button anywhere.
- **No newsletter provider.** The form validates locally and reports "Preview
  only — sign-up is not connected". **No address is stored or transmitted** —
  a test records network traffic to prove it.
- **No approved copyright holder or policy copy.** Both are marked unapproved.
- **No image supplied at all** → original abstract artwork at the correct
  ratio, tagged "Placeholder artwork".

Listening links are real Spotify album URLs taken from each release's own page
on davidguetta.com. Videos are real, embedded only on an explicit click, from
ids confirmed through YouTube's oEmbed endpoint. Store prices come from the
official Shopify feed and are shown with their currency and read date — the
site never handles a transaction, and no cart or checkout exists anywhere.

Awards are the one piece of content that needs the most scrutiny: eight wins
compiled from a public reference, marked as a selection, excluding nominations,
with no derived totals, and awaiting management confirmation.

The "Concept preview" strip at the top of every page is driven by
`siteSettings.demoMode` in `src/content/site.ts`. It disappears when that is set
to `false` — do not set it until the rights position is confirmed and the demo
show dates are gone.
