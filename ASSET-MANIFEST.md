# Asset manifest

Updated **8 September 2026**.

> **Rights status: NOT CLEARED.**
> Every image, the wordmark and every video below was taken from David Guetta's
> own public properties — davidguetta.com and the official YouTube channel — so
> that the concept could be reviewed with real material instead of placeholders.
> Sourcing something from the artist's own site is **not** the same as being
> licensed to republish it. Nothing here is approved, and none of it may go
> live until the client confirms the rights position and supplies production
> masters. This blocks launch on its own.

No client assets were supplied directly: `../incoming-assets/` was empty at the
start of the build. Everything downloaded is kept, unmodified, in
`../incoming-assets/from-live-site/` so the provenance of each file is
inspectable.

## What is shipping

| Asset | File in `public/assets/` | Source | Original size | Approval | Replacement required |
| --- | --- | --- | --- | --- | --- |
| Wordmark (light) | `brand/wordmark-light.png` | `davidguetta.com/wp-content/uploads/2016/09/logo-light@2x.png` | 2000 × 256 PNG | pending | **Yes** — licensed vector (SVG) master |
| Wordmark (dark) | `brand/wordmark-dark.png` | `…/logo-dark.png` | 500 × 64 PNG | pending | **Yes** — licensed vector master |
| Hero, desktop | `hero/hero-desktop.jpg` | `davidguetta.com/image-gallery` (`015.jpg`) | 1162 × 1200 | pending | **Yes** — see note below |
| Hero, phone | `hero/hero-mobile.jpg` | `davidguetta.com/image-gallery` (`011.jpg`) | 800 × 1200 | pending | **Yes** |
| Release artwork × 8 | `music/*.jpg` | `davidguetta.com/discography` + each `/album/…` page | 640 × 640 (album 7: 960 × 960) | pending | Yes — 1500 × 1500 masters |
| Video stills × 7 | `video/<youtube-id>.jpg` | `i.ytimg.com` official thumbnails | 1280 × 720 | pending | Yes — approved stills |
| Favicon | `src/app/icon.svg` | Original abstract beam mark drawn for this concept | — | placeholder | **Yes** — approved brand icon |
| Fonts | Barlow Condensed 700, Inter 400/500 | Google Fonts, self-hosted by `next/font` | — | SIL OFL | Only if brand typography is supplied |

### Hero photography — a real limitation

The brief asks for concert photography at monumental scale. The gallery on the
live site is **press portraiture**, not live performance, and the largest usable
frame is 1162 px wide. Two consequences, both visible in the build:

- On a 1440 px display the hero image is upscaled by roughly 1.25×. It holds up
  in review but is not launch quality.
- The chosen frame has the subject **left** of centre with clear space to the
  right — the mirror of the composition the brief sketched. The hero layout was
  flipped to suit the photograph rather than cropping across the face. If a
  stage frame with the opposite composition arrives, `src/components/sections/
  Hero.tsx` documents the one-line change to flip it back.

A high-resolution approved stage photograph (≈2400 px landscape, plus a 4:5
portrait crop for phones) remains the single highest-value outstanding asset.

### Generated placeholder artwork — still in use

`src/components/media/PlaceholderArt.tsx` draws original abstract SVG whenever a
content model has no image: a lit-stage treatment (beams, truss, crowd line) and
a hard-edged sleeve treatment with four seeded archetypes. Nothing currently
uses it, because every model now has a real image — but it stays, so a newly
added release or video renders correctly instead of breaking, and it is what
appears if an image path is ever wrong. Generated artwork always carries a
visible "Placeholder artwork" tag. Real imagery does **not** carry a per-tile
badge: its rights status is a site-wide statement in the header strip, not
something to repeat on every thumbnail.

## Content taken with the assets

| Content | Source | What was NOT taken |
| --- | --- | --- |
| 8 release titles, artwork, official page URLs, Spotify album links | `davidguetta.com/discography` and each `/album/…` page | Release dates, release types, tracklists, credits and descriptions — the source publishes none of these, so all are `null`. WordPress upload-folder dates (2022/03 …) are upload dates, not release dates, and were deliberately not used. |
| 7 videos: titles, YouTube ids, watch URLs, thumbnails | The official channel playlist linked from the site as "Videos"; every title and channel re-confirmed one at a time through YouTube's oEmbed endpoint | Publication dates and durations — not stated by the source, so `null`. |
| Wordmark, socials, radio/podcast link, events provider | `davidguetta.com` | — |

The source lists **"I'm Good (Blue)" twice**, with identical artwork and the
same Spotify album. The duplicate was dropped and the surviving entry uses the
clean `im-good-blue` slug rather than the source's `im-good-blue-2`.

**Tour dates were deliberately not taken.** The live site loads them from a
Bandsintown widget; scraping that into the build would put unverified event
claims in front of fans. `src/content/events.ts` remains invented demo fixtures,
clearly marked, with real cities and IANA timezones so the filtering and
day-boundary logic can be exercised honestly. See `docs/MIGRATION.md` for how to
connect the real provider.

## How replacement works

`ResponsiveMedia` renders `next/image` when a content model supplies an
`ImageRef` and generated artwork when that field is `null`. To swap an asset:

1. Put the file in `public/assets/{brand,hero,music,video}/`.
2. Update the `image` / `artwork` / `still` field in `src/content/*` with the
   real `width`, `height`, a `source` note, and `approval: "approved"`.
3. `focal` is `{ x, y }` in the range 0–1 and drives `object-position`, so the
   subject survives every crop. Set it deliberately for the hero.

Release artwork is validated as square; a non-square file fails the build.

A unit test asserts that every shipped image carries a `source`, is served from
`/assets/`, and is marked `pending-approval` — so nothing can quietly acquire
an approved status it was never granted.

## Still required from the client

| Item | Blocks |
| --- | --- |
| **Written confirmation of rights** for the wordmark, photography, artwork and video stills currently in the build | Everything. This is the gate. |
| Licensed vector wordmark (SVG, light + dark) | Header, footer, favicon |
| High-resolution stage photography, desktop + phone crops, with agreed focal points | The first impression, and image quality above 1162 px |
| Release dates, types, credits, tracklists and descriptions | `/music` metadata, the type and year filters, sorting by date |
| Smart links (preferred over the per-platform Spotify links now in place) | The listening journey |
| Tour data or authorised provider access, with ticket and waitlist URLs | `/live`, next-show strip, homepage preview |
| Approved video selection and stills | `/watch`, homepage performance feature |
| Management / press / booking destinations | `/contact` |
| Approved privacy and terms copy | `/privacy`, `/terms`, newsletter consent |
| Newsletter provider, sender identity, approved consent wording | Updates section |
| Legal entity for the copyright line | Footer |
| Official store URL (optional) | Shop nav item and merch module |

Reference sites named in the brief (Martin Garrix, Swedish House Mafia, Calvin
Harris, Dua Lipa) were inspected for hierarchy only. No asset, logo, artwork or
page composition was taken from any of them.
