# Build status

**Last updated:** 8 September 2026

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
- Original abstract placeholder artwork (stage and sleeve treatments)
- Full handoff docs and screenshots

## Checks already run — do not repeat unless the code changes

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, 0 warnings |
| `npm test` | 31 pass |
| `npm run test:e2e` | 52 pass |
| `npm run build` | Pass |
| Contrast audit | Pass after two fixes |

## Known gaps

- No Safari, Firefox, real-device, screen-reader, Lighthouse or axe testing
- No field Core Web Vitals
- Feed-failure and provider-connected newsletter paths are implemented but
  unreachable from fixtures

## Next steps, in order

1. Collect client assets and content (`ASSET-MANIFEST.md` lists exactly what).
2. Replace fixtures in `src/content/` (`CONTENT-GUIDE.md` explains how).
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
- Never invent a release, show, venue, contact or ticket link to fill a gap.
- Never show a newsletter success the provider did not confirm.
- Never render a feed failure as "no shows".
- Content is validated at load; do not weaken the validators to make bad data
  render.
