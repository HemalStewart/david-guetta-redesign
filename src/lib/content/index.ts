/**
 * Content adapter — the single boundary between the UI and wherever content
 * actually comes from.
 *
 * Today every getter reads validated local fixtures. To connect a CMS or a
 * tour provider, change only this file: fetch, map into the models in
 * `./types.ts`, run the same validators, and keep the same return shapes.
 * No component imports `@/content/*` directly.
 */
import { activeCampaign } from "@/content/campaign";
import { demoEvents } from "@/content/events";
import { officialReleases } from "@/content/releases";
import { siteSettings } from "@/content/site";
import { officialVideos } from "@/content/videos";
import { nextEvent, pastEvents, upcomingEvents } from "@/lib/dates";
import type { Campaign, LiveEvent, Region, Release, SiteSettings, Video } from "./types";
import { validateEvents, validateReleases, validateVideos } from "./validate";

/** Fixtures are validated once, at module load, so bad data fails loudly. */
const releases = validateReleases(officialReleases);
const events = validateEvents(demoEvents);
const videos = validateVideos(officialVideos);

/**
 * Distinguishes "the provider returned nothing" from "the provider failed".
 * A failure must never be rendered as "no shows" — design.md §9.
 */
export type ContentResult<T> = { ok: true; data: T } | { ok: false; reason: "unavailable" };

export function getSiteSettings(): SiteSettings {
  return siteSettings;
}

export function getCampaign(): Campaign {
  return activeCampaign;
}

/**
 * Newest verified release date first. Entries with no supplied date fall back
 * to the catalogue order from the source, and sort after everything dated —
 * we do not guess a date to place them.
 */
export function getReleases(): Release[] {
  return [...releases].sort((a, b) => {
    if (a.releaseDate && b.releaseDate) return a.releaseDate < b.releaseDate ? 1 : -1;
    if (a.releaseDate) return -1;
    if (b.releaseDate) return 1;
    return a.sortIndex - b.sortIndex;
  });
}

export function getFeaturedRelease(): Release | null {
  return releases.find((release) => release.featured) ?? null;
}

export function getReleaseBySlug(slug: string): Release | null {
  return releases.find((release) => release.slug === slug) ?? null;
}

export function getRelatedReleases(slug: string, limit = 3): Release[] {
  return getReleases()
    .filter((release) => release.slug !== slug)
    .slice(0, limit);
}

/** Only years the client has actually supplied become filter options. */
export function getReleaseYears(): number[] {
  const years = new Set(
    releases
      .map((release) => release.releaseDate?.slice(0, 4))
      .filter((year): year is string => Boolean(year))
      .map(Number),
  );
  return [...years].sort((a, b) => b - a);
}

/**
 * All events, wrapped in a result. A real provider integration returns
 * `{ ok: false }` on failure so the UI can show a temporary-unavailability
 * state with the canonical provider link.
 */
export function getEvents(): ContentResult<LiveEvent[]> {
  return { ok: true, data: events };
}

export function getUpcomingEvents(now: Date): ContentResult<LiveEvent[]> {
  const result = getEvents();
  return result.ok ? { ok: true, data: upcomingEvents(result.data, now) } : result;
}

export function getPastEvents(now: Date): ContentResult<LiveEvent[]> {
  const result = getEvents();
  return result.ok ? { ok: true, data: pastEvents(result.data, now) } : result;
}

export function getNextEvent(now: Date): ContentResult<LiveEvent | null> {
  const result = getEvents();
  return result.ok ? { ok: true, data: nextEvent(result.data, now) } : result;
}

/** Only regions that actually have upcoming events become filter options. */
export function getActiveRegions(now: Date): Region[] {
  const result = getUpcomingEvents(now);
  if (!result.ok) return [];
  const regions = new Set(result.data.map((event) => event.region));
  return [...regions].sort();
}

export function getVideos(): Video[] {
  return videos;
}

export function getFeaturedVideo(): Video | null {
  return videos.find((video) => video.featured) ?? null;
}

export function getVideoBySlug(slug: string): Video | null {
  return videos.find((video) => video.slug === slug) ?? null;
}

/** Merch is conditional: no confirmed store URL means the module is absent. */
export function getStoreUrl(): string | null {
  return siteSettings.storeUrl;
}

export * from "./types";
