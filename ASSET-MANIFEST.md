# Asset manifest

Status on **8 September 2026**. No client assets were supplied for this build:
`incoming-assets/` at the project root was empty.

Nothing in this repository is an approved David Guetta asset. There is no
photograph of the artist anywhere in the build, real or generated, and no other
artist's imagery has been copied.

## What is actually shipping

| Asset | File | Type | Rights / approval | Alt text | Replacement required |
| --- | --- | --- | --- | --- | --- |
| Wordmark | *(none)* | Set type — "David Guetta" in Barlow Condensed 700 | Placeholder typography, not a logo | n/a (link is labelled "David Guetta — home") | **Yes** — approved `wordmark-light.svg` / `wordmark-dark.svg` |
| Hero image | *(none)* | Generated inline SVG, `PlaceholderArt` variant `stage` | Original work created for this concept | Decorative (`aria-hidden`); the H1 carries the identity | **Yes** — `hero-desktop.jpg` (≈2400 px landscape) and `hero-mobile.jpg` (≈1200 px, 4:5) |
| Hero video loop | *(none)* | Not implemented | — | — | Optional; approved 6–10 s silent loop + poster |
| Release artwork ×6 | *(none)* | Generated inline SVG, `PlaceholderArt` variant `artwork` | Original work created for this concept | Decorative; the title and artists are real text | **Yes** — 1500 × 1500 px masters per release |
| Video stills ×4 | *(none)* | Generated inline SVG, variants `crowd` / `stage` / `artwork` / `portrait` | Original work created for this concept | Decorative | **Yes** — 16:9 approved stills |
| Merch photography | *(none)* | Module omitted — no store confirmed | — | — | Only if an official store is confirmed |
| Press kit | *(none)* | Contact page states it is unavailable | — | — | Optional; rights-cleared |
| Favicon | `src/app/icon.svg` | Abstract beam mark, inline SVG | Original placeholder created for this concept — not a logo, and not invented initials | n/a | **Yes** — approved brand icon |
| Fonts | Barlow Condensed 700, Inter 400/500 | Google Fonts, served self-hosted by `next/font` | SIL Open Font License | n/a | Only if the client supplies licensed brand typography |

### About the placeholder artwork

`src/components/media/PlaceholderArt.tsx` draws every placeholder as inline
SVG, deterministically from the item's id. Two treatments:

- **Stage** (hero, video stills): beams, a lighting truss, haze and a crowd
  line. Abstract; it never depicts a person.
- **Sleeve** (release artwork): one of four hard-edged graphic archetypes —
  disc, bands, arc, split — so a catalogue grid does not read as one repeated
  image.

They hold the correct aspect ratios and focal composition, so dropping in real
photography is a content change, not a redesign. Every placeholder carries a
visible "Placeholder" tag, and the site-wide "Concept preview" strip states the
same thing.

## How replacement works

`ResponsiveMedia` renders `next/image` when a content model supplies an
`ImageRef`, and `PlaceholderArt` when that field is `null`. So the swap is:

1. Put the file in `public/assets/{brand,hero,music,video}/`.
2. Set the `image` / `artwork` / `still` field in `src/content/*` to
   `{ src, alt, width, height, focal, approval: "approved" }`.
3. `focal` is `{ x, y }` in the range 0–1 and drives `object-position`, so the
   subject survives every crop. Set it deliberately for the hero.

Release artwork is validated as square; a non-square file fails the build.

## Still required from the client

| Item | Blocks |
| --- | --- |
| Approved wordmark (light + dark SVG) | Header, footer, favicon |
| Hero photography, desktop + phone crops, with agreed focal points | The whole first impression |
| Release artwork, titles, credits, dates, verified smart/platform links | `/music` and `/music/[slug]` |
| Tour data or provider access, with ticket and waitlist URLs | `/live`, next-show strip, homepage preview |
| Approved video URLs and 16:9 stills | `/watch`, homepage performance feature |
| Management / press / booking destinations | `/contact` |
| Approved privacy and terms copy | `/privacy`, `/terms`, newsletter consent |
| Newsletter provider, sender identity and approved consent wording | Updates section |
| Legal entity for the copyright line | Footer |
| Official store URL (optional) | Shop nav item and merch module |

Reference sites named in the brief were inspected for hierarchy only. No asset,
logo, artwork or page composition was copied from any of them.
