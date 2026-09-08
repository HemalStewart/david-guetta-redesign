/**
 * Date, range and venue-timezone handling — design.md §9.
 *
 * Rules this module enforces:
 *  - A date-only event stays date-only. We never invent a start time.
 *  - An event stays "upcoming" through the end of its final day *in the venue's
 *    timezone*, not the visitor's. A Sydney show is still upcoming for someone
 *    in Los Angeles until Sydney's day is over.
 *  - Every function takes an explicit `now`, so tests can inject a clock.
 */
import type { LiveEvent } from "@/lib/content/types";

/** The calendar date (YYYY-MM-DD) that `instant` falls on inside `timeZone`. */
export function localDateIn(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Last venue-local day on which the event is still happening. */
export function eventEndDate(event: LiveEvent): string {
  return event.endDate ?? event.date;
}

export function isUpcoming(event: LiveEvent, now: Date): boolean {
  return localDateIn(now, event.timezone) <= eventEndDate(event);
}

export function isPast(event: LiveEvent, now: Date): boolean {
  return !isUpcoming(event, now);
}

/** Chronological, with a stable id tiebreak so ordering never flickers. */
export function byDateAscending(a: LiveEvent, b: LiveEvent): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const aTime = a.startTime ?? "";
  const bTime = b.startTime ?? "";
  if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  return a.id.localeCompare(b.id);
}

export function upcomingEvents(events: LiveEvent[], now: Date): LiveEvent[] {
  return events.filter((event) => isUpcoming(event, now)).sort(byDateAscending);
}

export function pastEvents(events: LiveEvent[], now: Date): LiveEvent[] {
  return events.filter((event) => isPast(event, now)).sort((a, b) => -byDateAscending(a, b));
}

/**
 * The next event a visitor can act on. Sold-out and cancelled shows are NOT
 * skipped — hiding them would imply a later show is the next one.
 */
export function nextEvent(events: LiveEvent[], now: Date): LiveEvent | null {
  return upcomingEvents(events, now).find((event) => event.status !== "cancelled") ?? null;
}

type DateParts = { year: number; month: number; day: number };

function parseIsoDate(value: string): DateParts {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Weekday of a calendar date, computed without timezone drift. */
export function weekdayOf(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function monthOf(isoDate: string): string {
  return MONTHS[parseIsoDate(isoDate).month - 1];
}

export function dayOf(isoDate: string): string {
  return String(parseIsoDate(isoDate).day).padStart(2, "0");
}

export function yearOf(isoDate: string): string {
  return String(parseIsoDate(isoDate).year);
}

/** "12 SEP" or, for a multi-day event, "12–14 SEP" / "30 SEP – 02 OCT". */
export function formatDateBlock(event: LiveEvent): string {
  const start = event.date;
  const end = eventEndDate(event);
  if (start === end) return `${dayOf(start)} ${monthOf(start)}`;
  if (monthOf(start) === monthOf(end) && yearOf(start) === yearOf(end)) {
    return `${dayOf(start)}–${dayOf(end)} ${monthOf(start)}`;
  }
  return `${dayOf(start)} ${monthOf(start)} – ${dayOf(end)} ${monthOf(end)}`;
}

/**
 * The date block split for display. A range that crosses a month is too wide
 * to sit on one line beside a city name, so it breaks after the dash rather
 * than shrinking the type on that row alone.
 */
export function formatDateBlockLines(event: LiveEvent): string[] {
  const start = event.date;
  const end = eventEndDate(event);
  if (start === end) return [`${dayOf(start)} ${monthOf(start)}`];
  if (monthOf(start) === monthOf(end) && yearOf(start) === yearOf(end)) {
    return [`${dayOf(start)}–${dayOf(end)} ${monthOf(start)}`];
  }
  return [`${dayOf(start)} ${monthOf(start)} –`, `${dayOf(end)} ${monthOf(end)}`];
}

/** Long form for prose and accessible names: "Saturday 12 September 2026". */
export function formatLongDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatEventDateRangeLong(event: LiveEvent): string {
  const end = eventEndDate(event);
  return event.date === end ? formatLongDate(event.date) : `${formatLongDate(event.date)} to ${formatLongDate(end)}`;
}

/** Venue-local start time, or null for a date-only event. */
export function formatStartTime(event: LiveEvent): string | null {
  return event.startTime ? `${event.startTime} local time` : null;
}

/** Machine-readable value for <time datetime> and structured data. */
export function machineDate(event: LiveEvent): string {
  return event.startTime ? `${event.date}T${event.startTime}` : event.date;
}

export function formatReleaseDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
