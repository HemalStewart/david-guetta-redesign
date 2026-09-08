import type { LiveEvent, Region } from "./types";

/** Free-text match across the fields a fan would actually type. */
export function matchesQuery(event: LiveEvent, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  return [event.city, event.country, event.countryCode, event.venue, event.title, event.region]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function filterEvents(
  events: LiveEvent[],
  { query = "", region = "" }: { query?: string; region?: string },
): LiveEvent[] {
  return events.filter((event) => {
    if (region && event.region !== (region as Region)) return false;
    return matchesQuery(event, query);
  });
}
