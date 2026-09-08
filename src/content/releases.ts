import type { Release } from "@/lib/content/types";

/**
 * Releases taken from the official discography at
 * https://davidguetta.com/discography/ on 8 September 2026.
 *
 * REAL CONTENT, NOT CLEARED. Titles, artwork and store links come from the
 * artist's own site. Nothing here has been approved for republication, and the
 * rights position on the artwork has not been checked — see ASSET-MANIFEST.md.
 *
 * What the source does NOT provide, and what is therefore null rather than
 * guessed: release dates, release types, descriptions, tracklists and credits.
 * The WordPress upload folder dates (2022/03, 2022/09 …) are upload dates, not
 * release dates, so they are not used. `sortIndex` preserves the catalogue
 * order the source itself displays.
 *
 * The source lists "I'm Good (Blue)" twice, with identical artwork and the
 * same Spotify album; the duplicate has been dropped.
 */
export const officialReleases: Release[] = [
  {
    id: "rel-001",
    slug: "im-good-blue",
    title: "I’m Good (Blue)",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 0,
    artwork: {
      src: "/assets/music/im-good-blue.jpg",
      alt: "I’m Good (Blue) — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/7M842DMhYVALrXsw3ty7B3" },
    ],
    tracklist: null,
    credits: null,
    featured: true,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/im-good-blue-2/",
  },
  {
    id: "rel-002",
    slug: "what-would-you-do-feat-bryson-tiller-chaney-remix",
    title: "What Would You Do? (feat. Bryson Tiller) [CHANEY Remix]",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 1,
    artwork: {
      src: "/assets/music/what-would-you-do-feat-bryson-tiller-chaney-remix.jpg",
      alt: "What Would You Do? (feat. Bryson Tiller) [CHANEY Remix] — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/2nNsYY3mIVPvcattQ1oiTa" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/what-would-you-do-feat-bryson-tiller-chaney-remix/",
  },
  {
    id: "rel-003",
    slug: "crazy-what-love-can-do",
    title: "Crazy What Love Can Do",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 2,
    artwork: {
      src: "/assets/music/crazy-what-love-can-do.jpg",
      alt: "Crazy What Love Can Do — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/0GnxssqYa2RU9EdWHhZ707" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/crazy-what-love-can-do/",
  },
  {
    id: "rel-004",
    slug: "what-would-you-do",
    title: "What Would You Do?",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 3,
    artwork: {
      src: "/assets/music/what-would-you-do.jpg",
      alt: "What Would You Do? — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/2MUZjEfjTAJp5zroItascD" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/what-would-you-do/",
  },
  {
    id: "rel-005",
    slug: "trampoline-feat-missy-elliott-bia-and-doechii",
    title: "Trampoline (feat. Missy Elliott, BIA and Doechii)",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 4,
    artwork: {
      src: "/assets/music/trampoline-feat-missy-elliott-bia-and-doechii.jpg",
      alt: "Trampoline (feat. Missy Elliott, BIA and Doechii) — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/2Pr2gqGNGdyyqUMCkQ0V2V" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/trampoline-feat-missy-elliott-bia-and-doechii/",
  },
  {
    id: "rel-006",
    slug: "silver-screen-shower-scene",
    title: "Silver Screen (Shower Scene)",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 5,
    artwork: {
      src: "/assets/music/silver-screen-shower-scene.jpg",
      alt: "Silver Screen (Shower Scene) — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/0EFe9GlKaRf2NgyNTxkni1" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/silver-screen-shower-scene/",
  },
  {
    id: "rel-007",
    slug: "super-gremlin-david-guetta-trap-house-mix",
    title: "Super Gremlin (David Guetta Trap House Mix)",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 6,
    artwork: {
      src: "/assets/music/super-gremlin-david-guetta-trap-house-mix.jpg",
      alt: "Super Gremlin (David Guetta Trap House Mix) — release artwork",
      width: 640,
      height: 640,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
      { platform: "Spotify", href: "https://open.spotify.com/album/4lBW3nIldVUoYL4mKWo6XO" },
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/album/super-gremlin-david-guetta-trap-house-mix/",
  },
  {
    id: "rel-008",
    slug: "7",
    title: "7",
    // The discography lists "David Guetta" as the artist for every entry.
    // Featured artists appear in the titles and on the sleeves; full credits
    // still need to be confirmed by the client.
    artists: ["David Guetta"],
    type: null,
    releaseDate: null,
    sortIndex: 7,
    artwork: {
      src: "/assets/music/album_7.jpg",
      alt: "7 — release artwork",
      width: 960,
      height: 960,
      source: "davidguetta.com/discography",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    description: null,
    smartLink: null,
    platforms: [
    ],
    tracklist: null,
    credits: null,
    featured: false,
    approval: "pending-approval",
    sourceUrl: "https://davidguetta.com/7-thealbum/",
  },
];
