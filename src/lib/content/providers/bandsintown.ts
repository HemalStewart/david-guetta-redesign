import type { ContentResult } from "@/lib/content";
import type { EventStatus, LiveEvent, Region } from "@/lib/content/types";
import { validateEvents } from "@/lib/content/validate";

/**
 * Live events, from the artist's own events provider.
 *
 * This is the same source davidguetta.com already uses — its widget calls
 * Bandsintown with the app id below — so the dates here are the dates the
 * artist's team publishes, not a copy we maintain.
 *
 * Failure is modelled, never swallowed: a provider error returns
 * `{ ok: false }` and the UI shows a temporary-unavailability state with a link
 * to the provider. A failed fetch is never rendered as "no shows".
 */
const ENDPOINT = "https://rest.bandsintown.com/artists/david%20guetta/events";
const APP_ID = process.env.TOUR_PROVIDER_APP_ID ?? "js_davidguetta.com";

/** Refetch every 15 minutes; on-sale states change during a day. */
const REVALIDATE_SECONDS = 900;

type BandsintownOffer = { type?: string; status?: string; url?: string };

type BandsintownEvent = {
  id: string;
  url?: string;
  datetime?: string;
  title?: string;
  /** "datetime" | "range" — whether the clock time is meaningful. */
  datetime_display_rule?: string;
  festival_start_date?: string;
  festival_end_date?: string;
  sold_out?: boolean;
  on_sale_datetime?: string;
  offers?: BandsintownOffer[];
  venue?: {
    name?: string;
    city?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
};

/**
 * Last good payload, kept in module memory.
 *
 * If the provider fails after a successful fetch, showing the dates we last
 * saw is far better than showing nothing — and far better than implying the
 * schedule is empty. Stale data is labelled by `lastVerified` on each event.
 */
let lastKnownGood: LiveEvent[] | null = null;

export async function fetchLiveEvents(): Promise<ContentResult<LiveEvent[]>> {
  try {
    const response = await fetch(`${ENDPOINT}?app_id=${encodeURIComponent(APP_ID)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) throw new Error(`provider responded ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("provider returned an unexpected shape");

    const events = validateEvents(
      payload
        .map((entry) => mapEvent(entry as BandsintownEvent))
        .filter((event): event is LiveEvent => event !== null),
    );
    lastKnownGood = events;
    return { ok: true, data: events };
  } catch {
    // Serve the last good payload rather than an empty schedule.
    return lastKnownGood ? { ok: true, data: lastKnownGood } : { ok: false, reason: "unavailable" };
  }
}

function mapEvent(raw: BandsintownEvent): LiveEvent | null {
  const venue = raw.venue;
  if (!raw.id || !raw.datetime || !venue?.city || !venue.country) return null;

  const isRange = raw.datetime_display_rule === "range";
  const date = raw.datetime.slice(0, 10);
  const endDate = isRange && raw.festival_end_date ? raw.festival_end_date.slice(0, 10) : null;

  // The clock time is only shown when the provider says it is real. For a
  // multi-day range it is not, and we do not invent one.
  const time = raw.datetime.slice(11, 16);
  const startTime = !isRange && time && time !== "00:00" ? time : null;

  const tickets = raw.offers?.find((offer) => offer.type === "Tickets" && offer.url);
  const { status, ticketUrl } = resolveStatus(raw, tickets);

  return {
    id: `bit-${raw.id}`,
    title: raw.title?.trim() || "Live show",
    venue: venue.name?.trim() || "Venue to be confirmed",
    city: titleCase(venue.city),
    country: venue.country,
    countryCode: countryCode(venue.country),
    region: regionFor(venue.country),
    date,
    endDate: endDate && endDate > date ? endDate : null,
    startTime,
    timezone: zoneFromLongitude(venue.longitude),
    status,
    ticketUrl,
    // The provider exposes no waitlist destination, so we never imply one.
    waitlistUrl: null,
    source: "bandsintown",
    lastVerified: new Date().toISOString(),
    approval: "approved",
  };
}

function resolveStatus(
  raw: BandsintownEvent,
  tickets: BandsintownOffer | undefined,
): { status: EventStatus; ticketUrl: string | null } {
  if (raw.sold_out) return { status: "sold-out", ticketUrl: null };

  // An announced future on-sale is "soon", not "buy now".
  if (raw.on_sale_datetime && new Date(raw.on_sale_datetime).getTime() > Date.now()) {
    return { status: "on-sale-soon", ticketUrl: null };
  }

  if (tickets?.url && tickets.status === "available") {
    return { status: "on-sale", ticketUrl: tickets.url };
  }
  return { status: "tickets-unavailable", ticketUrl: null };
}

/**
 * Approximate IANA zone from the venue's longitude.
 *
 * Used ONLY for the archive day boundary — deciding when an event stops being
 * upcoming. Displayed dates and times come straight from the provider, already
 * in venue-local time, so an hour of imprecision here cannot show a wrong time
 * to anyone. Without a longitude we fall back to the last zone on earth to
 * finish a day, which can only ever keep an event listed slightly too long —
 * the safe direction to be wrong in.
 */
function zoneFromLongitude(longitude: string | undefined): string {
  const lng = Number(longitude);
  if (!Number.isFinite(lng)) return "Etc/GMT+12";
  const offset = Math.max(-12, Math.min(14, Math.round(lng / 15)));
  // Etc/GMT signs are inverted: Etc/GMT-2 is UTC+2.
  return offset === 0 ? "UTC" : `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
}

/** "Sant Josep De Sa Talaia" arrives shouting from the provider. */
function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()))
    .join(" ")
    .replace(/^./, (character) => character.toUpperCase());
}

const COUNTRY_CODES: Record<string, string> = {
  Spain: "ES",
  Netherlands: "NL",
  France: "FR",
  Germany: "DE",
  "United States": "US",
  "United Kingdom": "GB",
  Belgium: "BE",
  Italy: "IT",
  Portugal: "PT",
  Switzerland: "CH",
  Austria: "AT",
  Poland: "PL",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Ireland: "IE",
  Canada: "CA",
  Mexico: "MX",
  Brazil: "BR",
  Argentina: "AR",
  Chile: "CL",
  Colombia: "CO",
  Japan: "JP",
  China: "CN",
  India: "IN",
  Thailand: "TH",
  Singapore: "SG",
  "South Korea": "KR",
  Australia: "AU",
  "New Zealand": "NZ",
  "United Arab Emirates": "AE",
  Israel: "IL",
  Turkey: "TR",
  "Saudi Arabia": "SA",
  "South Africa": "ZA",
  Morocco: "MA",
  Egypt: "EG",
};

const REGIONS: Record<string, Region> = {
  ES: "Europe",
  NL: "Europe",
  FR: "Europe",
  DE: "Europe",
  GB: "Europe",
  BE: "Europe",
  IT: "Europe",
  PT: "Europe",
  CH: "Europe",
  AT: "Europe",
  PL: "Europe",
  SE: "Europe",
  NO: "Europe",
  DK: "Europe",
  IE: "Europe",
  TR: "Europe",
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  CL: "South America",
  CO: "South America",
  JP: "Asia",
  CN: "Asia",
  IN: "Asia",
  TH: "Asia",
  SG: "Asia",
  KR: "Asia",
  AU: "Oceania",
  NZ: "Oceania",
  AE: "Middle East",
  IL: "Middle East",
  SA: "Middle East",
  ZA: "Africa",
  MA: "Africa",
  EG: "Africa",
};

function countryCode(country: string): string {
  // "XX" keeps validation happy while making an unmapped country obvious.
  return COUNTRY_CODES[country] ?? "XX";
}

function regionFor(country: string): Region {
  return REGIONS[countryCode(country)] ?? "Europe";
}
