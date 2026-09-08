import type { Video } from "@/lib/content/types";

/**
 * Videos from the official David Guetta YouTube channel, reached through the
 * playlist that davidguetta.com links to as "Videos", and confirmed one by one
 * through YouTube's oEmbed endpoint on 8 September 2026 — every title and
 * channel below came back from YouTube itself, not from guesswork.
 *
 * REAL CONTENT, NOT CLEARED. Stills are the official YouTube thumbnails, used
 * here as concept placeholders. Approved stills and an approved video
 * selection are still required — see ASSET-MANIFEST.md.
 *
 * `date` and `duration` are null because the source does not state them.
 */
export const officialVideos: Video[] = [
  {
    id: "vid-001",
    slug: "sorana-and-david-guetta-redrum-official-video",
    title: "Sorana & David Guetta - redruM (Official Video)",
    providerUrl: "https://www.youtube.com/watch?v=v8TVixpaBcQ",
    embedId: "v8TVixpaBcQ",
    provider: "youtube",
    still: {
      src: "/assets/video/v8TVixpaBcQ.jpg",
      alt: "Sorana & David Guetta - redruM (Official Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: true,
    approval: "pending-approval",
  },
  {
    id: "vid-002",
    slug: "david-guetta-teddy-swims-tones-and-i-gone-gone-gone-official-music-vid",
    title: "David Guetta, Teddy Swims, Tones and I - Gone Gone Gone [Official Music Video]",
    providerUrl: "https://www.youtube.com/watch?v=8iT9DRe3cHE",
    embedId: "8iT9DRe3cHE",
    provider: "youtube",
    still: {
      src: "/assets/video/8iT9DRe3cHE.jpg",
      alt: "David Guetta, Teddy Swims, Tones and I - Gone Gone Gone [Official Music Video] — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
  {
    id: "vid-003",
    slug: "david-guetta-and-cedric-gervais-a-better-world-official-video",
    title: "David Guetta & Cedric Gervais - A Better World (Official Video)",
    providerUrl: "https://www.youtube.com/watch?v=RRCuysV9Z18",
    embedId: "RRCuysV9Z18",
    provider: "youtube",
    still: {
      src: "/assets/video/RRCuysV9Z18.jpg",
      alt: "David Guetta & Cedric Gervais - A Better World (Official Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
  {
    id: "vid-004",
    slug: "david-guetta-and-willy-william-and-nicky-jam-cuentale-official-video",
    title: "David Guetta & Willy William & Nicky Jam - Cuentale (Official Video)",
    providerUrl: "https://www.youtube.com/watch?v=JXzHn1CFRvE",
    embedId: "JXzHn1CFRvE",
    provider: "youtube",
    still: {
      src: "/assets/video/JXzHn1CFRvE.jpg",
      alt: "David Guetta & Willy William & Nicky Jam - Cuentale (Official Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
  {
    id: "vid-005",
    slug: "david-guetta-and-sia-beautiful-people-official-video",
    title: "David Guetta & Sia - Beautiful People (Official Video)",
    providerUrl: "https://www.youtube.com/watch?v=S2fSojJqyNY",
    embedId: "S2fSojJqyNY",
    provider: "youtube",
    still: {
      src: "/assets/video/S2fSojJqyNY.jpg",
      alt: "David Guetta & Sia - Beautiful People (Official Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
  {
    id: "vid-006",
    slug: "david-guetta-alphaville-and-ava-max-forever-young-official-music-video",
    title: "David Guetta, Alphaville & Ava Max - Forever Young (Official Music Video)",
    providerUrl: "https://www.youtube.com/watch?v=_AfmgOpoCHI",
    embedId: "_AfmgOpoCHI",
    provider: "youtube",
    still: {
      src: "/assets/video/_AfmgOpoCHI.jpg",
      alt: "David Guetta, Alphaville & Ava Max - Forever Young (Official Music Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
  {
    id: "vid-007",
    slug: "david-guetta-and-onerepublic-i-don-t-wanna-wait-official-video",
    title: "David Guetta & OneRepublic - I Don't Wanna Wait (Official Video)",
    providerUrl: "https://www.youtube.com/watch?v=dSDbwfXX5_I",
    embedId: "dSDbwfXX5_I",
    provider: "youtube",
    still: {
      src: "/assets/video/dSDbwfXX5_I.jpg",
      alt: "David Guetta & OneRepublic - I Don't Wanna Wait (Official Video) — video still",
      width: 1280,
      height: 720,
      source: "i.ytimg.com (official YouTube thumbnail)",
      approval: "pending-approval",
    },
    placeholder: "stage",
    category: "Official video",
    // The source does not expose a publication date or a verified duration.
    date: null,
    duration: null,
    featured: false,
    approval: "pending-approval",
  },
];
