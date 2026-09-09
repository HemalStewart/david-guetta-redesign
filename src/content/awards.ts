import type { Award } from "@/lib/content/types";

/**
 * A SELECTION of competitive wins.
 *
 * REAL CONTENT, NOT VERIFIED BY THE CLIENT. Read on 9 September 2026 from
 * Wikipedia's "List of awards and nominations received by David Guetta", by
 * parsing the rendered results table and resolving its rowspans, so each row
 * below carries its own year, body and category rather than inheriting one
 * from a neighbouring row.
 *
 * Why this file is deliberately short:
 *
 *  - These are factual claims about a living person. `design.md` §5 lists
 *    "invented awards" among the things to avoid, and a long auto-extracted
 *    table is exactly how a wrong year or category ends up on something that
 *    looks like an artist's official site. Every entry here was checked
 *    individually against the source table.
 *  - Nominations are not included. Only wins.
 *  - No counts, totals or "x-time winner" headlines are derived. If management
 *    wants those framed a particular way, they supply the wording.
 *
 * Management must confirm this list before launch — it is on the launch
 * checklist as a blocking item.
 */
const SOURCE = "https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_David_Guetta";

export const selectedAwards: Award[] = [
  {
    id: "award-ama-2026",
    year: 2026,
    organisation: "American Music Awards",
    category: "Best Dance/Electronic Artist",
    work: null,
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-iheart-2026",
    year: 2026,
    organisation: "iHeartRadio Music Awards",
    category: "Dance Artist of the Year",
    work: null,
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-nrj-2025",
    year: 2025,
    organisation: "NRJ Music Awards",
    category: "DJ of the Year",
    work: null,
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-brit-2023",
    year: 2023,
    organisation: "Brit Awards",
    category: "Producer of the Year",
    work: null,
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-ema-2023",
    year: 2023,
    organisation: "MTV Europe Music Awards",
    category: "Best Electronic",
    work: null,
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-bbma-2023",
    year: 2023,
    organisation: "Billboard Music Awards",
    category: "Top Dance/Electronic Song",
    work: "I’m Good (Blue), with Bebe Rexha",
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-grammy-2011",
    year: 2011,
    organisation: "Grammy Awards",
    category: "Best Remixed Recording, Non-Classical",
    work: "Revolver (David Guetta’s One Love Club Remix)",
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
  {
    id: "award-grammy-2010",
    year: 2010,
    organisation: "Grammy Awards",
    category: "Best Remixed Recording, Non-Classical",
    work: "When Love Takes Over (Electro Extended Remix)",
    sourceUrl: SOURCE,
    approval: "pending-approval",
  },
];

/**
 * Years the artist placed first in DJ Magazine's Top 100 DJs poll, from the
 * ranking table in the same source. Stated as the years themselves rather than
 * a count, so the claim is checkable rather than a slogan.
 */
export const djMagNumberOneYears: number[] = [2011, 2020, 2021, 2023, 2025];
