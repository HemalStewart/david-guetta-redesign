# Build status

**Last updated:** 9 September 2026

## State

The concept is **complete and verified locally**. Stages 1–7 of `design.md` §16
are done. It is not production ready, and cannot be until the client supplies
content and services — see `LAUNCH-CHECKLIST.md`.

## Finished

- Design system, layout, all seven routes, 404 and error boundary
- Homepage section rhythm exactly as specified in `design.md` §7
- Header, accessible mobile menu, footer
- Live search, region filter, URL state, past-shows archive, all six statuses
- Venue-timezone day boundaries, date ranges, date-only events
- Music catalogue, filters, release detail with tracklist and credits
- Watch page, accessible video dialog with honest unconnected state
- Newsletter state model plus a server endpoint that refuses to claim success
- Typed content adapter with load-time validation
- Real assets sourced from davidguetta.com and the official YouTube channel:
  wordmark, hero photography, 8 releases with artwork and Spotify links,
  7 embeddable videos with official stills — all marked `pending-approval`
- Original abstract placeholder artwork retained as the fallback for any model
  without an image (stage and sleeve treatments)
- Store module (conditional on a confirmed store), 4 real products with live
  prices, currency and stock from the official Shopify feed — no checkout here
- Recognition module: 8 selected wins plus DJ Mag number-one years, wins only,
  no derived totals
- 13 official videos, up from 7
- Hero video pipeline: original 8 s generated loop, poster-first, requested
  only after load, desktop only, reduced-motion and Save-Data aware, real pause
  control, pauses off-screen, still never removed
- Art-directed hero `<picture>` so only one crop is ever fetched
- CSS motion: hero entrance, Ken Burns, light sweep, scroll-linked settle,
  artwork hover, arrow shift, dialog entrance, live-row nudge — all
  reduced-motion aware, none able to hide content
- Full handoff docs and screenshots

## Checks already run — do not repeat unless the code changes

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, 0 warnings |
| `npm test` | 46 pass |
| `npm run test:e2e` | 68 pass |
| `npm run build` | Pass |
| Contrast audit | Pass after two fixes |

## Known gaps

- **Rights are not cleared on any sourced asset.** This blocks launch on its own.
- **The awards list is compiled from Wikipedia and unconfirmed by management.**
  Factual claims about a living person; blocking.
- **Two live stores exist** — the client must say which is canonical.
- Store prices are a 9 September 2026 snapshot, not live data.
- Hero photography is press portraiture at 1162 px, not concert photography at
  the resolution the brief asks for
- No release dates, types, credits or tracklists exist, so those filters and
  sort orders are unexercised by real data
- Tour dates are still invented demo fixtures
- No Safari, Firefox, real-device, screen-reader, Lighthouse or axe testing
- No field Core Web Vitals
- Feed-failure and provider-connected newsletter paths are implemented but
  unreachable from fixtures

## Next steps, in order

1. **Confirm the rights position on every sourced asset** — see
   `ASSET-MANIFEST.md`. Nothing else matters until this is answered.
2. Collect production masters and the missing metadata, then replace what is in
   `src/content/` (`CONTENT-GUIDE.md` explains how).
3. Implement the tour provider inside `src/lib/content/index.ts`, including the
   failure path.
4. Implement the newsletter provider call in `src/app/api/newsletter/route.ts`
   and test every response path.
5. Decide `/image-gallery/` and `/7-thealbum/`; finish the redirect map.
6. Re-run the full QA pass, adding Safari, Firefox, a real device, a screen
   reader, and Lighthouse on the deployed build.
7. Set `siteSettings.demoMode = false` only when no demo content remains.

## Rules to preserve

- The UI never imports `src/content/*` directly — always through the adapter.
- Never invent a release, show, venue, contact, ticket link, release date or
  release type to fill a gap. If the source does not state it, it is `null`.
- Never mark content `approved` that the client has not signed off.
- Never derive an award total or a "x-time winner" claim. State the years.
- A scroll-linked animation may move content; it may never fade it.
- Never show a newsletter success the provider did not confirm.
- Never render a feed failure as "no shows".
- Content is validated at load; do not weaken the validators to make bad data
  render.
