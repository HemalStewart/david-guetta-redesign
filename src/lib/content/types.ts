/**
 * Content models — design.md §12.
 *
 * Every field the UI renders lives here. The UI must never read from a
 * CMS/provider directly: it reads from the adapter in `./index.ts`, so the
 * demo fixtures can be swapped for the client's real provider later.
 */

/**
 * How trustworthy a piece of content is.
 *  demo             — invented for the concept; never launch content
 *  pending-approval — real, taken from an official source, but rights and
 *                     accuracy are NOT cleared for republication
 *  approved         — supplied and signed off by the client
 */
export type ApprovalStatus = "demo" | "pending-approval" | "approved";

export type FocalPoint = { x: number; y: number };

export type ImageRef = {
  /** Path under /public, or an absolute https URL from an approved host. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 0–1 focal point used for object-position so crops keep the subject. */
  focal?: FocalPoint;
  credit?: string;
  /** Where the file came from, e.g. "davidguetta.com/image-gallery". */
  source?: string;
  approval: ApprovalStatus;
};

/**
 * `null` means "no approved asset supplied yet". The UI renders original
 * abstract placeholder artwork at the correct aspect ratio instead — it never
 * substitutes another artist's photograph or an invented David Guetta image.
 */
export type MaybeImage = ImageRef | null;

export type PlaceholderVariant = "stage" | "crowd" | "artwork" | "portrait";

export type ExternalLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  artistName: string;
  /** Approved vector wordmark. Null => temporary plain-text name. */
  wordmark: { light: string | null; dark: string | null };
  tagline: string;
  nav: { label: string; href: string; external?: boolean }[];
  socials: ExternalLink[];
  contacts: {
    role: string;
    /** Null => tracked as a content requirement, never invented. */
    href: string | null;
    note?: string;
  }[];
  pressKitUrl: string | null;
  radioUrl: string | null;
  storeUrl: string | null;
  eventsProviderUrl: string | null;
  copyright: string | null;
  /** True while fixtures/unconnected services are in use. */
  demoMode: boolean;
};

export type Campaign = {
  id: string;
  /** Display title. Two deliberate lines on the hero. */
  titleLines: string[];
  supportingCopy: string;
  image: MaybeImage;
  mobileImage: MaybeImage;
  placeholder: PlaceholderVariant;
  /** Optional approved atmospheric loop. Poster always renders first. */
  video: { src: string; poster: string } | null;
  primaryAction: ExternalLink;
  secondaryAction: ExternalLink | null;
  caption: string | null;
  approval: ApprovalStatus;
};

export type ReleaseType = "album" | "ep" | "single" | "remix" | "compilation";

export type PlatformLink = {
  platform: string;
  href: string;
};

export type Release = {
  id: string;
  slug: string;
  title: string;
  artists: string[];
  /**
   * Null when the source does not state it. The discography on
   * davidguetta.com lists every entry under /album/ without a type, so these
   * are left null rather than guessed.
   */
  type: ReleaseType | null;
  /** ISO date (YYYY-MM-DD), or null when no release date has been supplied. */
  releaseDate: string | null;
  /** Catalogue order from the source, used when release dates are unknown. */
  sortIndex: number;
  artwork: MaybeImage;
  placeholder: PlaceholderVariant;
  description: string | null;
  /** Verified smart link. Preferred over a platform chooser when present. */
  smartLink: string | null;
  platforms: PlatformLink[];
  tracklist: string[] | null;
  credits: string | null;
  featured: boolean;
  approval: ApprovalStatus;
  /** Where this entry was taken from, for provenance during approval. */
  sourceUrl?: string;
};

export type EventStatus =
  | "on-sale"
  | "on-sale-soon"
  | "sold-out"
  | "cancelled"
  | "postponed"
  | "tickets-unavailable";

export type Region =
  | "Europe"
  | "North America"
  | "South America"
  | "Asia"
  | "Oceania"
  | "Africa"
  | "Middle East";

export type LiveEvent = {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2. */
  countryCode: string;
  region: Region;
  /** Venue-local start date, YYYY-MM-DD. Always present. */
  date: string;
  /** Venue-local end date for multi-day events. */
  endDate: string | null;
  /** Venue-local HH:mm. Null => date-only; never invent a start time. */
  startTime: string | null;
  /** IANA zone for the venue. Drives the archive day boundary. */
  timezone: string;
  status: EventStatus;
  ticketUrl: string | null;
  waitlistUrl: string | null;
  /** Where the row came from, e.g. "demo-fixture" or "bandsintown". */
  source: string;
  lastVerified: string | null;
  approval: ApprovalStatus;
};

export type Video = {
  id: string;
  slug: string;
  title: string;
  /** Official watch page. Used when an embed is unavailable or fails. */
  providerUrl: string | null;
  /** Provider id used for the embed. Null => outbound link only. */
  embedId: string | null;
  provider: "youtube" | null;
  still: MaybeImage;
  placeholder: PlaceholderVariant;
  category: string;
  date: string | null;
  /** Only shown when verified. */
  duration: string | null;
  featured: boolean;
  approval: ApprovalStatus;
};

export type ProductTeaser = {
  id: string;
  title: string;
  image: MaybeImage;
  placeholder: PlaceholderVariant;
  storeUrl: string;
  price: string | null;
  currency: string | null;
  availability: string | null;
  verifiedAt: string | null;
  approval: ApprovalStatus;
};
