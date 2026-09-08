# Content guide

How to change what the site says, without touching layout code.

Today all content lives in typed files under `src/content/`. Every component
reads it through the adapter at `src/lib/content/index.ts` — so when a CMS is
connected later, these instructions move to that CMS and the components do not
change. **Local data files are not a visual editor**: if the client expects to
edit content in a browser, a CMS has to be chosen and connected first
(see [MIGRATION.md](MIGRATION.md)).

Everything is validated when the app loads. A mistake fails the build with a
specific message rather than rendering something wrong.

---

## Change the hero

`src/content/campaign.ts` — exactly one campaign is active at a time.

```ts
titleLines: ["David", "Guetta"],   // each entry is one line of the H1
supportingCopy: "Music. Live. Worldwide.",
primaryAction:   { label: "View shows", href: "/live" },
secondaryAction: { label: "Explore music", href: "/music" },
caption: "Placeholder artwork — approved stage photography required",
```

To run a release-led campaign instead, change `titleLines` to the release
title, point `primaryAction` at the smart link, and set `image` / `mobileImage`.
Nothing about the page layout changes.

Add photography by replacing the `null`s:

```ts
image: {
  src: "/assets/hero/hero-desktop.jpg",
  alt: "",                       // decorative: the H1 already names the artist
  width: 2400, height: 1350,
  focal: { x: 0.68, y: 0.4 },    // 0–1; keeps the subject in frame at every crop
  approval: "approved",
},
mobileImage: { ...same shape, a 4:5 crop... },
```

Set `caption` to `null` once real photography is in, or use it for a photo
credit.

---

## Feature a different release

`src/content/releases.ts`. Set `featured: true` on one release and `false` on
the previous one. **Exactly one** release may be featured — two will fail the
build. It is an editorial choice, so nothing is ever labelled "latest" just
because of its date.

Adding a release:

```ts
{
  id: "rel-007",                    // stable and unique; never reused
  slug: "release-title",            // lowercase-hyphenated; becomes /music/release-title
  title: "Release Title",
  artists: ["David Guetta", "Featured Artist"],
  type: "single",                   // album | ep | single | remix | compilation
  releaseDate: "2026-11-14",        // YYYY-MM-DD
  artwork: { src: "/assets/music/release-title.jpg", alt: "Release Title artwork",
             width: 1500, height: 1500, approval: "approved" },
  placeholder: "artwork",
  description: "Two or three lines of approved campaign copy.",
  smartLink: "https://…",           // preferred; makes a platform chooser unnecessary
  platforms: [],                    // only used when there is no smart link
  tracklist: null,
  credits: null,
  featured: false,
  approval: "approved",
}
```

Rules the validator enforces: unique `id` and `slug`, `YYYY-MM-DD` dates,
square artwork, `https:` links only, at most one featured release.

---

## Update shows

`src/content/events.ts`.

```ts
{
  id: "evt-020",
  title: "Live show",               // shown as secondary text beside the venue
  venue: "Venue name",
  city: "Paris",                    // the dominant text on the row
  country: "France",
  countryCode: "FR",                // ISO 3166-1 alpha-2
  region: "Europe",                 // drives the region filter
  date: "2026-10-03",               // venue-local
  endDate: null,                    // set for a multi-day festival
  startTime: "21:00",               // venue-local HH:mm, or null for date-only
  timezone: "Europe/Paris",         // IANA; decides when the show leaves "upcoming"
  status: "on-sale",
  ticketUrl: "https://…",
  waitlistUrl: null,
  source: "bandsintown",
  lastVerified: "2026-09-08",
  approval: "approved",
}
```

**Statuses and what each one shows**

| `status` | Row shows | Notes |
| --- | --- | --- |
| `on-sale` | "Tickets" link | Requires `ticketUrl`; the build fails without one |
| `on-sale-soon` | "Get updates" → the sign-up section | Use before tickets exist |
| `sold-out` | "Waitlist" if `waitlistUrl` exists, otherwise "No waitlist available" | Never invent a waitlist |
| `postponed` | "New date to be announced" | Stays in the upcoming list |
| `cancelled` | "This show will not take place", row muted | Stays visible; it is skipped only when choosing the *next* show |
| `tickets-unavailable` | Status tag only | The honest default when no link has been supplied |

**Dates and timezones.** A show stays "upcoming" until the end of its final day
*in the venue's timezone* — a Sydney date is still upcoming for a visitor in
Los Angeles until Sydney's day is over. Date-only events stay date-only; never
add `startTime` to make a row look complete. Multi-day events remain visible
through `endDate`, and a cross-month range breaks over two lines rather than
shrinking that row's type.

The next-show strip, the homepage preview and `/live` all derive from this one
list. There is no second, hand-typed "next show" anywhere.

---

## Videos

`src/content/videos.ts`. One video may be `featured: true`.

- `provider: "youtube"` plus `embedId` gives an in-page player, loaded only
  when a visitor clicks — never on scroll.
- `providerUrl` is the official watch page, used when there is no embed or the
  embed fails.
- With neither, the item keeps its still and offers the official YouTube
  channel from `siteSettings.socials`.
- Only set `duration` when it has been verified.

---

## Site-wide settings

`src/content/site.ts`: navigation, social links, contact destinations, radio
URL, store URL, events provider, copyright, and `demoMode`.

- **Adding the shop**: set `storeUrl` and add `{ label: "Shop", href: <url>,
  external: true }` to `nav` after Watch. Both the footer link and the nav item
  appear automatically; neither shows while `storeUrl` is `null`.
- **Contacts**: each entry has `href: null` until the client approves a
  destination. The page then states it is not yet supplied. Do not invent an
  address to fill the gap.
- **Copyright**: `null` renders "copyright holder to be confirmed by the
  client". The current live site's footer shows "What A Music", but that has
  not been confirmed by the owner, so it is not used here.
- **`demoMode`**: drives the "Concept preview" strip. Set it to `false` only
  after every fixture has been replaced with approved content.

---

## Campaign copy

Proposed strings that need client approval before launch:

| Where | Current text |
| --- | --- |
| Hero supporting copy | "Music. Live. Worldwide." |
| Live section heading | "See you out there." |
| Watch section heading | "Watch the set." |
| Updates heading | "Be there for what's next." |
| Updates supporting copy | "New music, show announcements and updates from David Guetta." |
| Newsletter consent | "Yes, send me news about music and live shows." — placeholder wording |

"After the lights come on" is the internal concept name from the brief. It is
not used anywhere in the interface and should not become public copy.

---

## Who owns freshness

Assign an owner and a cadence before launch:

| Content | Suggested cadence |
| --- | --- |
| Tour dates and statuses | Weekly, plus immediately on any on-sale, cancellation or postponement |
| Featured release / campaign | Per release cycle, with an end date agreed in advance |
| Videos | Per upload |
| Store link and products | Whenever the store changes |
| Contacts and policies | On change; reviewed annually |
