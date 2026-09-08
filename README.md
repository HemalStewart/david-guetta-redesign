# David Guetta — website concept

An unpublished redesign concept built from `../design.md`. It runs, it is
responsive, and every journey in the brief works — but it is **not** an
official David Guetta site and it is **not** production ready. All content is
demo fixtures and original placeholder artwork, and no external service is
connected. See [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) for exactly
what stands between this and a launch.

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
contrast ratio of every design token pair.

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
                       PerformanceFeature, Updates, NewsletterForm
    music/             ReleaseCard, ReleaseFilters, ListenAction
    live/              EventRow, EventFilters, EventStatus
    media/             ResponsiveMedia, PlaceholderArt, VideoDialog
    ui/                ButtonLink, Container, SectionLabel, PageHeader
  content/             demo fixtures — the only place fake content lives
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

Where the client has supplied nothing, the site says so rather than inventing:

- No approved photography → original abstract artwork at the correct ratios.
- No ticket links → each row shows its real status; no dead "Tickets" button.
- No listening links → "Listening link pending".
- No video URLs → the still stays and the official YouTube channel is offered.
- No newsletter provider → the form validates locally and reports
  "Preview only — sign-up is not connected". **No address is stored or sent.**
- No approved copyright holder or policy copy → both are marked unapproved.

The "Concept preview" strip at the top of every page is driven by
`siteSettings.demoMode` in `src/content/site.ts`. It disappears when that is
set to `false` — do not set it until the fixtures are gone.
