import type { Video } from "@/lib/content/types";

/**
 * DEMO FIXTURES — not real David Guetta videos.
 *
 * No provider id or watch URL is invented, so `embedId` and `providerUrl` are
 * null and every item renders its unconnected state. The verified official
 * YouTube channel link on siteSettings is the real outbound destination until
 * the client supplies approved video URLs.
 */
export const demoVideos: Video[] = [
  {
    id: "vid-001",
    slug: "featured-performance",
    title: "Featured performance (placeholder)",
    providerUrl: null,
    embedId: null,
    provider: null,
    still: null,
    placeholder: "crowd",
    category: "Live set",
    date: null,
    duration: null,
    featured: true,
    approval: "demo",
  },
  {
    id: "vid-002",
    slug: "festival-set-placeholder",
    title: "Festival set (placeholder)",
    providerUrl: null,
    embedId: null,
    provider: null,
    still: null,
    placeholder: "stage",
    category: "Live set",
    date: null,
    duration: null,
    featured: false,
    approval: "demo",
  },
  {
    id: "vid-003",
    slug: "music-video-placeholder",
    title: "Music video (placeholder)",
    providerUrl: null,
    embedId: null,
    provider: null,
    still: null,
    placeholder: "artwork",
    category: "Music video",
    date: null,
    duration: null,
    featured: false,
    approval: "demo",
  },
  {
    id: "vid-004",
    slug: "behind-the-scenes-placeholder",
    title: "Behind the scenes (placeholder)",
    providerUrl: null,
    embedId: null,
    provider: null,
    still: null,
    placeholder: "portrait",
    category: "Documentary",
    date: null,
    duration: null,
    featured: false,
    approval: "demo",
  },
];
