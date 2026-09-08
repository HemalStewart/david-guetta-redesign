import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LiveEvent } from "../../src/lib/content/types.ts";
import {
  formatDateBlock,
  formatDateBlockLines,
  isUpcoming,
  localDateIn,
  nextEvent,
  pastEvents,
  upcomingEvents,
} from "../../src/lib/dates/index.ts";

/** Minimal event builder — every test states only the fields it cares about. */
function event(overrides: Partial<LiveEvent> & { id: string }): LiveEvent {
  return {
    title: "Live show",
    venue: "Venue to be confirmed",
    city: "Test City",
    country: "Testland",
    countryCode: "TL",
    region: "Europe",
    date: "2026-10-01",
    endDate: null,
    startTime: null,
    timezone: "UTC",
    status: "tickets-unavailable",
    ticketUrl: null,
    waitlistUrl: null,
    source: "test",
    lastVerified: null,
    approval: "demo",
    ...overrides,
  };
}

describe("venue-local day boundary", () => {
  it("keeps a Sydney show upcoming while it is still that day in Sydney", () => {
    const sydney = event({ id: "syd", date: "2027-02-20", timezone: "Australia/Sydney" });
    // 20 Feb 21:00 UTC is already 21 Feb in Sydney — the show is over there.
    assert.equal(isUpcoming(sydney, new Date("2027-02-20T21:00:00Z")), false);
    // 19 Feb 21:00 UTC is 20 Feb in Sydney — still the day of the show.
    assert.equal(isUpcoming(sydney, new Date("2027-02-19T21:00:00Z")), true);
  });

  it("keeps a Los Angeles show upcoming after UTC has rolled over", () => {
    const la = event({ id: "la", date: "2026-11-01", timezone: "America/Los_Angeles" });
    // 2 Nov 03:00 UTC is still 1 Nov in Los Angeles.
    assert.equal(isUpcoming(la, new Date("2026-11-02T03:00:00Z")), true);
    assert.equal(isUpcoming(la, new Date("2026-11-02T09:00:00Z")), false);
  });

  it("resolves the calendar date inside a named timezone", () => {
    assert.equal(localDateIn(new Date("2026-11-02T03:00:00Z"), "America/Los_Angeles"), "2026-11-01");
    assert.equal(localDateIn(new Date("2026-11-02T03:00:00Z"), "Australia/Sydney"), "2026-11-02");
  });
});

describe("multi-day events", () => {
  const festival = event({ id: "fest", date: "2026-10-30", endDate: "2026-11-01", timezone: "America/Los_Angeles" });

  it("stays upcoming through its final day", () => {
    assert.equal(isUpcoming(festival, new Date("2026-10-31T18:00:00Z")), true);
    assert.equal(isUpcoming(festival, new Date("2026-11-01T18:00:00Z")), true);
    assert.equal(isUpcoming(festival, new Date("2026-11-02T18:00:00Z")), false);
  });

  it("formats a range rather than a single date", () => {
    assert.equal(formatDateBlock(festival), "30 OCT – 01 NOV");
    assert.equal(formatDateBlock(event({ id: "a", date: "2026-09-12", endDate: "2026-09-14" })), "12–14 SEP");
    assert.equal(formatDateBlock(event({ id: "b", date: "2026-09-12" })), "12 SEP");
  });
});

describe("upcoming, past and next", () => {
  const now = new Date("2026-09-08T12:00:00Z");
  const events = [
    event({ id: "later", date: "2026-12-01" }),
    event({ id: "past", date: "2026-07-01" }),
    event({ id: "soon", date: "2026-09-19" }),
    event({ id: "cancelled-soonest", date: "2026-09-10", status: "cancelled" }),
  ];

  it("splits on the injected clock, not the machine clock", () => {
    assert.deepEqual(
      upcomingEvents(events, now).map((entry) => entry.id),
      ["cancelled-soonest", "soon", "later"],
    );
    assert.deepEqual(
      pastEvents(events, now).map((entry) => entry.id),
      ["past"],
    );
  });

  it("skips a cancelled show when choosing the next actionable one", () => {
    assert.equal(nextEvent(events, now)?.id, "soon");
  });

  it("keeps a sold-out show as the next show rather than hiding it", () => {
    const soldOut = [event({ id: "sold", date: "2026-09-10", status: "sold-out" }), event({ id: "after", date: "2026-10-10" })];
    assert.equal(nextEvent(soldOut, now)?.id, "sold");
  });

  it("returns null when nothing is upcoming", () => {
    assert.equal(nextEvent([event({ id: "old", date: "2020-01-01" })], now), null);
  });
});

describe("date block line breaking", () => {
  it("keeps a single date and a same-month range on one line", () => {
    assert.deepEqual(formatDateBlockLines(event({ id: "a", date: "2026-09-12" })), ["12 SEP"]);
    assert.deepEqual(formatDateBlockLines(event({ id: "b", date: "2026-09-12", endDate: "2026-09-14" })), ["12–14 SEP"]);
  });

  it("breaks a cross-month range after the dash", () => {
    assert.deepEqual(formatDateBlockLines(event({ id: "c", date: "2026-10-30", endDate: "2026-11-01" })), [
      "30 OCT –",
      "01 NOV",
    ]);
  });
});
