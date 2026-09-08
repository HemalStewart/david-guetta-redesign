# Migration

Replacing the live site must not quietly break the URLs that already have
inbound links. This is the inventory and the plan.

## What the current site actually is

Inspected in a rendered browser on **8 September 2026** at
<https://davidguetta.com/>.

- The root URL serves **Tour Dates**. Both "Home" and "Tour Dates" in the
  navigation point at the root.
- Tour dates come from a **Bandsintown widget** (artist id `26317`), loaded
  client-side. Events carried RSVP, Tickets, Waitlist and "Notify me" actions.
- The navigation contains a `#` link and a `javascript:void(0)` link.
- The footer reads **"Copyright © 2018 What A Music / Powered by SoBuzzee"**.
  The 2018 date does not indicate when content was last updated, and the legal
  entity has not been confirmed by the owner — so this build does not print it.

### URLs observed

| Existing URL | HTTP | Plan |
| --- | --- | --- |
| `https://davidguetta.com/` | 200 | Becomes the new homepage. **Preserve.** |
| `/discography/` | 200 | **301 → `/music`.** Implemented in `next.config.ts`, covered by a test. |
| `/image-gallery/` | 200 | **Decision required.** Either keep equivalent gallery content at this URL or build an archive route and redirect there. Do **not** point it at an unrelated page. |
| `/7-thealbum/` | 200 | **Decision required.** A campaign page for the album "7". Options: keep it, redirect to that release's detail page once the real catalogue exists, or retire it deliberately. |
| `https://davidguetta.lnk.to/podcast` | 200 | External. Preserved as the Radio Show link in the footer. |

Only the unambiguous redirect is implemented. Guessing a destination for the
other two would be worse than leaving them for the owner to decide.

## Before cutover

1. **Crawl the live site properly.** The list above comes from links on the
   rendered homepage. Run a full crawl and export the server's own URL list,
   including any album, credit or press pages not linked from the homepage.
2. **Pull inbound-link data** from Search Console or an SEO tool. Any URL with
   real inbound links needs an intentional destination.
3. **Check trailing slashes.** The current site uses them (`/discography/`).
   Next.js normalises to no trailing slash by default. Test both forms —
   `/discography` and `/discography/` — after deployment.
4. **Confirm the redirect map with the owner** before it goes live. A redirect
   is a permanent statement about where content moved.

## The tour data question

The current site loads Bandsintown client-side, which means the events are
**not** in the page HTML for crawlers, and the site depends on that widget
staying available.

This build renders events on the server from typed data, which is better for
both. To connect the real source:

1. **Confirm the authorised integration method with Bandsintown.** Do not
   assume the public API is open, and do not scrape the widget. The artist's
   provider relationship determines what is permitted.
2. Implement it inside `src/lib/content/index.ts` only. `getEvents()` already
   returns `ContentResult<T>`, which distinguishes "no events" from "the feed
   failed" — the UI already renders those two differently.
3. Add a caching and freshness policy: serve last-known-good data on failure,
   and label delayed data when appropriate. Never turn a fetch failure into
   "No shows".
4. Map the provider's statuses onto this project's six statuses, and carry
   ticket **and** waitlist URLs across.

## CMS

There is none, and the concept does not need one. Content lives in typed files
that a developer edits.

If the client expects to edit content themselves, choose a CMS **with them**
before adding a service dependency, then implement it behind the same adapter.
"CMS-ready" here means the UI never reads content directly — it does not mean
an editor is connected. Whatever is chosen must have an answer for publishing,
preview, rollback, scheduled changes, required fields, and who owns freshness.

## Route mapping, old to new

| Content type | Old | New |
| --- | --- | --- |
| Tour dates | `/` (widget) | `/live`, plus the homepage preview and next-show strip |
| Discography | `/discography/` | `/music` and `/music/[slug]` |
| Album campaign | `/7-thealbum/` | A release detail page, or a hero campaign |
| Photos | `/image-gallery/` | Not built — needs a decision |
| Videos | Linked out to YouTube | `/watch` |
| Radio / podcast | External `lnk.to` | Footer link, unchanged |
| Contact | Not found on the live site | `/contact` |

## Cutover checklist

- [ ] Full crawl of the live site exported and reviewed
- [ ] Redirect map agreed with the owner, including trailing-slash behaviour
- [ ] `/image-gallery/` and `/7-thealbum/` destinations decided
- [ ] Tour provider integration authorised, built and tested against a failure
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production origin
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true` set **only** on production
- [ ] Sitemap submitted, robots verified on the live host
- [ ] Redirects tested against the deployed site, not only locally
- [ ] DNS change scheduled with a rollback plan and a known TTL
