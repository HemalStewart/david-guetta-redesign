# Launch checklist

Two separate questions. The first is answered; the second is not.

- **Is the concept complete?** Yes. It runs, it is designed for phone and
  desktop, every required route exists, and every journey in the brief works
  with honest states where nothing has been supplied.
- **Is it ready to publish?** **No.** Everything below the line is outstanding,
  and most of it depends on the client rather than on code.

> **Blocker before anything else:** the wordmark, photography, release artwork
> and video stills in this build were taken from davidguetta.com and the
> official YouTube channel so the design could be reviewed with real material.
> They are **not rights-cleared**. Confirm the rights position, or replace them
> with licensed masters, before this is deployed anywhere public — including a
> password-protected preview shared outside the client's team.

---

## Done

### Design and build
- [x] Design tokens, typography, grid and shared controls per `design.md` §6
- [x] Homepage rhythm: hero → next-show strip → featured release → upcoming
      shows → performance feature → updates → footer
- [x] All required routes: `/`, `/live`, `/music`, `/music/[slug]`, `/watch`,
      `/contact`, `/privacy`, `/terms`, 404, error boundary
- [x] Sticky header with a readable scrim over the hero
- [x] Mobile menu: focus trap, Escape, focus restoration, scroll lock
- [x] Video dialog: explicit play, one player at a time, no embed before a click
- [x] Live search and region filters with URL state, back/refresh/share support
- [x] Release type and year filters, working without JavaScript
- [x] Venue-timezone day boundaries, date ranges and date-only events
- [x] Newsletter state model, including the honest unconfigured state
- [x] Every event status rendered in words, not colour alone
- [x] `robots` set to noindex, `sitemap.xml`, per-page metadata
- [x] `/discography` → `/music` permanent redirect

### Verification
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass
- [x] `npm test` — 46 unit tests pass
- [x] `npm run test:e2e` — 68 interaction, responsive, motion, video and weight tests pass
- [x] `npm run build` — pass
- [x] Contrast measured; two failures found and fixed
- [x] No horizontal overflow at 360 / 390 / 768 / 1024 / 1440 px
- [x] 200% zoom reviewed
- [x] Zero third-party requests on first load

### Handoff
- [x] `README.md`, `ASSET-MANIFEST.md`, `.env.example`
- [x] `docs/CONTENT-GUIDE.md`, `docs/QA-REPORT.md`, `docs/MIGRATION.md`
- [x] Screenshots in `docs/screenshots/`
- [x] Store module, conditional on a confirmed store URL, linking out with no
      checkout of any kind on this site
- [x] Recognition module listing wins only, with no derived totals
- [x] Restrained CSS motion: hero entrance, scroll-linked settle, artwork
      hover, arrow shift — all reduced-motion aware, none able to hide content

---

## Outstanding — client content and approvals

Nothing here can be resolved by the build team alone.

- [ ] **Rights confirmation for every sourced asset** (wordmark, hero
      photography, 8 release artworks, 7 video stills) — see `ASSET-MANIFEST.md`
- [ ] **Licensed vector wordmark** (SVG, light and dark) — the build currently
      uses the 2016 PNG from the live site
- [ ] **High-resolution stage photography**, desktop and phone crops, with
      agreed focal points — the current hero is press portraiture at 1162 px and
      upscales on large displays
- [ ] **Release metadata**: dates, types, credits, tracklists and descriptions.
      None are published by the source, so all are `null` and the type/year
      filters stay hidden until they arrive.
- [ ] **Smart links** per release, preferred over the per-platform Spotify
      links currently in place
- [ ] **Full artist credits** — the discography lists only "David Guetta";
      featured artists appear in titles and on sleeves but are not confirmed
- [ ] **Confirmation of the awards list.** Eight wins and the DJ Mag
      number-one years are compiled from Wikipedia's awards table. These are
      factual claims about a living person on something that looks like an
      official site — management must confirm them or supply a replacement
      list. **Blocking.**
- [ ] **Which store is canonical**: `store.davidguetta.com` (linked now) or
      `davidguettashop.com`. Both are live.
- [ ] **How store prices stay accurate**: re-read the Shopify feed on a
      schedule, or drop the price line and link out. The figures in the build
      are a 9 September 2026 snapshot.
- [ ] **Tour data**: authorised provider access or an approved export, with
      ticket and waitlist URLs and accurate statuses
- [ ] **Video URLs and stills**, approved for embedding
- [ ] **Management, press and booking destinations** — currently stated as not
      supplied, never invented
- [ ] **Privacy and terms copy**, legally approved. Both pages are marked
      "Draft placeholder — not legal copy" and this blocks launch outright.
- [ ] **Copyright holder / legal entity** for the footer
- [ ] **Newsletter consent wording**, approved
- [ ] **Approved stage footage** to replace the original generated loop —
      6–10 s, silent, no strobe, with a poster frame that matches it
- [ ] A decision on which hero leads: the atmospheric loop (active) or the
      photograph (`portraitCampaign`, one line away)
- [ ] **Optional**: press kit
- [ ] Replace the placeholder favicon (`src/app/icon.svg`) with the approved brand icon

## Outstanding — services

- [ ] **Newsletter provider** configured (`NEWSLETTER_PROVIDER`,
      `NEWSLETTER_API_KEY`, `NEWSLETTER_LIST_ID`, `NEWSLETTER_DOUBLE_OPT_IN`)
      **and** the provider call implemented in `src/app/api/newsletter/route.ts`
      — it is a documented stub today. Test every response path, and make sure
      double opt-in says "check your inbox" rather than claiming success.
- [ ] **Tour provider** integration, authorised, with caching, last-known-good
      fallback and a tested failure path
- [ ] **Analytics** provider, owner-approved. `src/lib/analytics/index.ts` is a
      no-op with call sites already placed. Never attach form values or email
      addresses to an event.
- [ ] Server-side abuse controls in front of the newsletter endpoint — the
      in-memory limiter in `src/lib/newsletter.ts` is per-instance and is not
      sufficient on its own

## Outstanding — testing gaps

- [ ] **Mobile Safari and desktop Safari** — untested. Check `100dvh` on the
      mobile menu and the sticky header over the hero.
- [ ] **Firefox** — untested
- [ ] **A real phone and a real tablet** — only emulated viewports were used
- [ ] **A screen reader pass** (VoiceOver and NVDA)
- [ ] **Lighthouse and axe** on the deployed production build
- [ ] **Field Core Web Vitals** after launch — the `design.md` §14 targets
      cannot be claimed before real-user data exists
- [ ] Feed-failure and empty-schedule states, once a provider can actually fail

## Outstanding — deployment

- [ ] Hosting platform chosen (must support server rendering and a route handler)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production origin
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true` on production **only**
- [ ] Preview deployments left noindex **and** password protected —
      `noindex` is not access control
- [ ] Secrets set through the host's environment configuration, never committed
- [ ] Redirect map from `docs/MIGRATION.md` agreed and tested on the deployed site
- [ ] Trailing-slash behaviour checked against the old URLs
- [ ] `/image-gallery/` and `/7-thealbum/` destinations decided
- [ ] Every outbound link re-verified on the launch date
- [ ] DNS cutover scheduled, with a rollback plan and a known TTL

---

## The gate

**Do not set `siteSettings.demoMode = false` until every demo fixture is gone.**
It is the single switch that removes the "Concept preview" strip, and turning it
off early would make invented content look approved.

Before publishing, confirm all of these are true:

- No file under `src/content/` contains `approval: "demo"` or
  `approval: "pending-approval"`
- No "Placeholder artwork" tag renders anywhere on the site
- Every asset in `public/assets/` is a licensed master, not a file downloaded
  from the live site
- Tour dates come from the real provider, not `src/content/events.ts`
- Both policy pages carry approved legal copy, not the draft banner
- The footer prints a real copyright holder
- The newsletter either genuinely subscribes people or still says it is not
  connected — it must never show a success message it did not receive
- `NEXT_PUBLIC_ALLOW_INDEXING` is `true` only on the production origin
