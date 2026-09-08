/**
 * Content validation — design.md §12.
 *
 * Runs at module load (server/build time) so bad fixtures or a bad CMS payload
 * fail loudly instead of rendering a broken or misleading page.
 */
import type { LiveEvent, Release, Video } from "./types";

export class ContentError extends Error {
  constructor(message: string) {
    super(`[content] ${message}`);
    this.name = "ContentError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Only https destinations are allowed. Blocks `javascript:` and friends. */
export function assertSafeUrl(value: string, context: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ContentError(`${context}: "${value}" is not an absolute URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new ContentError(`${context}: only https destinations are allowed, got "${parsed.protocol}"`);
  }
  return value;
}

/** Internal routes must be root-relative; hash-only links are never valid. */
export function assertInternalHref(value: string, context: string): string {
  if (value === "#" || value.trim() === "") {
    throw new ContentError(`${context}: dead "#" links are not allowed`);
  }
  if (!value.startsWith("/")) {
    throw new ContentError(`${context}: expected a root-relative route, got "${value}"`);
  }
  return value;
}

export function assertHref(value: string, context: string): string {
  return value.startsWith("/") ? assertInternalHref(value, context) : assertSafeUrl(value, context);
}

function assertUniqueIds(items: { id: string }[], context: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.id) throw new ContentError(`${context}: an entry is missing a stable id`);
    if (seen.has(item.id)) throw new ContentError(`${context}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}

function assertUniqueSlugs(items: { slug: string }[], context: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!SLUG.test(item.slug)) throw new ContentError(`${context}: "${item.slug}" is not a valid slug`);
    if (seen.has(item.slug)) throw new ContentError(`${context}: duplicate slug "${item.slug}"`);
    seen.add(item.slug);
  }
}

export function validateReleases(releases: Release[]): Release[] {
  assertUniqueIds(releases, "releases");
  assertUniqueSlugs(releases, "releases");
  for (const release of releases) {
    if (!release.title.trim()) throw new ContentError(`release ${release.id}: title is required`);
    if (release.artists.length === 0) throw new ContentError(`release ${release.id}: at least one artist is required`);
    if (!ISO_DATE.test(release.releaseDate)) {
      throw new ContentError(`release ${release.id}: releaseDate must be YYYY-MM-DD`);
    }
    if (release.smartLink) assertSafeUrl(release.smartLink, `release ${release.id} smartLink`);
    for (const platform of release.platforms) {
      assertSafeUrl(platform.href, `release ${release.id} platform ${platform.platform}`);
    }
    if (release.artwork) assertArtworkIsSquare(release);
  }
  const featured = releases.filter((release) => release.featured);
  if (featured.length > 1) {
    throw new ContentError(`releases: ${featured.length} releases are flagged featured; exactly one may be`);
  }
  return releases;
}

function assertArtworkIsSquare(release: Release): void {
  const art = release.artwork;
  if (!art) return;
  if (art.width !== art.height) {
    throw new ContentError(`release ${release.id}: artwork must be square, got ${art.width}x${art.height}`);
  }
}

export function validateEvents(events: LiveEvent[]): LiveEvent[] {
  assertUniqueIds(events, "events");
  for (const event of events) {
    if (!ISO_DATE.test(event.date)) throw new ContentError(`event ${event.id}: date must be YYYY-MM-DD`);
    if (event.endDate) {
      if (!ISO_DATE.test(event.endDate)) throw new ContentError(`event ${event.id}: endDate must be YYYY-MM-DD`);
      if (event.endDate < event.date) throw new ContentError(`event ${event.id}: endDate precedes date`);
    }
    if (event.startTime && !HHMM.test(event.startTime)) {
      throw new ContentError(`event ${event.id}: startTime must be HH:mm`);
    }
    if (!isValidTimeZone(event.timezone)) {
      throw new ContentError(`event ${event.id}: "${event.timezone}" is not a known IANA timezone`);
    }
    if (!/^[A-Z]{2}$/.test(event.countryCode)) {
      throw new ContentError(`event ${event.id}: countryCode must be ISO 3166-1 alpha-2`);
    }
    if (event.ticketUrl) assertSafeUrl(event.ticketUrl, `event ${event.id} ticketUrl`);
    if (event.waitlistUrl) assertSafeUrl(event.waitlistUrl, `event ${event.id} waitlistUrl`);
    if (event.status === "on-sale" && !event.ticketUrl) {
      throw new ContentError(
        `event ${event.id}: status "on-sale" requires a ticketUrl — use "tickets-unavailable" instead`,
      );
    }
  }
  return events;
}

export function validateVideos(videos: Video[]): Video[] {
  assertUniqueIds(videos, "videos");
  assertUniqueSlugs(videos, "videos");
  for (const video of videos) {
    if (video.providerUrl) assertSafeUrl(video.providerUrl, `video ${video.id} providerUrl`);
    if (video.embedId && !video.provider) {
      throw new ContentError(`video ${video.id}: embedId supplied without a provider`);
    }
    if (video.embedId && !/^[\w-]{6,20}$/.test(video.embedId)) {
      throw new ContentError(`video ${video.id}: embedId "${video.embedId}" is not a plausible provider id`);
    }
  }
  const featured = videos.filter((video) => video.featured);
  if (featured.length > 1) {
    throw new ContentError(`videos: ${featured.length} videos are flagged featured; exactly one may be`);
  }
  return videos;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone });
    return true;
  } catch {
    return false;
  }
}
