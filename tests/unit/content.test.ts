import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoEvents } from "../../src/content/events.ts";
import { officialReleases } from "../../src/content/releases.ts";
import { officialVideos } from "../../src/content/videos.ts";
import { activeCampaign } from "../../src/content/campaign.ts";
import { siteSettings } from "../../src/content/site.ts";
import { filterEvents, matchesQuery } from "../../src/lib/content/filter.ts";
import {
  assertInternalHref,
  assertSafeUrl,
  ContentError,
  validateEvents,
  validateReleases,
  validateVideos,
} from "../../src/lib/content/validate.ts";
import type { LiveEvent, Release } from "../../src/lib/content/types.ts";

describe("shipped fixtures", () => {
  it("pass every validator", () => {
    assert.doesNotThrow(() => validateReleases(officialReleases));
    assert.doesNotThrow(() => validateEvents(demoEvents));
    assert.doesNotThrow(() => validateVideos(officialVideos));
  });

  it("carry exactly one featured release and one featured video", () => {
    assert.equal(officialReleases.filter((release) => release.featured).length, 1);
    assert.equal(officialVideos.filter((video) => video.featured).length, 1);
  });

  it("contain nothing marked approved — no fixture can pass for signed-off content", () => {
    for (const item of [...officialReleases, ...demoEvents, ...officialVideos]) {
      assert.notEqual(item.approval, "approved", `${item.id} claims approval it does not have`);
    }
  });

  it("record where every real image came from, so provenance survives to approval", () => {
    const images = [
      activeCampaign.image,
      activeCampaign.mobileImage,
      ...officialReleases.map((release) => release.artwork),
      ...officialVideos.map((video) => video.still),
    ].filter((image) => image !== null);

    assert.ok(images.length > 0);
    for (const image of images) {
      assert.equal(image.approval, "pending-approval");
      assert.ok(image.source, `an image is missing its source: ${image.src}`);
      assert.ok(image.src.startsWith("/assets/"), `${image.src} is not a local asset`);
    }
  });

  it("keeps every release traceable to the page it came from", () => {
    for (const release of officialReleases) {
      assert.ok(release.sourceUrl?.startsWith("https://davidguetta.com/"), `${release.id} has no source URL`);
    }
  });

  it("states no release date or type that the source did not provide", () => {
    for (const release of officialReleases) {
      assert.equal(release.releaseDate, null, `${release.id} claims an unverified release date`);
      assert.equal(release.type, null, `${release.id} claims an unverified release type`);
    }
  });

  it("only offers listening links that are real store URLs", () => {
    for (const release of officialReleases) {
      for (const platform of release.platforms) {
        assert.ok(platform.href.startsWith("https://open.spotify.com/"), platform.href);
      }
    }
  });

  it("only embeds videos with a verified provider id and official watch URL", () => {
    for (const video of officialVideos) {
      assert.equal(video.provider, "youtube");
      assert.ok(video.embedId, `${video.id} has no embed id`);
      assert.ok(video.providerUrl?.startsWith("https://www.youtube.com/watch?v="), `${video.id}`);
      assert.equal(video.date, null);
      assert.equal(video.duration, null);
    }
  });

  it("expose only https destinations in site settings", () => {
    const urls = [
      ...siteSettings.socials.map((social) => social.href),
      siteSettings.radioUrl,
      siteSettings.eventsProviderUrl,
      siteSettings.storeUrl,
      siteSettings.pressKitUrl,
    ].filter((value): value is string => typeof value === "string");
    for (const url of urls) assert.doesNotThrow(() => assertSafeUrl(url, "site settings"));
  });

  it("has no dead navigation entries", () => {
    for (const item of siteSettings.nav) {
      assert.notEqual(item.href, "#");
      assert.ok(item.href.startsWith("/"), `${item.href} is not a real route`);
    }
  });
});

describe("URL guards", () => {
  it("rejects javascript: and non-https schemes", () => {
    assert.throws(() => assertSafeUrl("javascript:alert(1)", "test"), ContentError);
    assert.throws(() => assertSafeUrl("http://example.com", "test"), ContentError);
    assert.doesNotThrow(() => assertSafeUrl("https://example.com", "test"));
  });

  it("rejects dead hash links", () => {
    assert.throws(() => assertInternalHref("#", "test"), ContentError);
    assert.doesNotThrow(() => assertInternalHref("/live", "test"));
  });
});

describe("content validators", () => {
  const baseEvent: LiveEvent = {
    id: "e1",
    title: "Live show",
    venue: "Venue",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    date: "2026-10-03",
    endDate: null,
    startTime: null,
    timezone: "Europe/Paris",
    status: "tickets-unavailable",
    ticketUrl: null,
    waitlistUrl: null,
    source: "test",
    lastVerified: null,
    approval: "demo",
  };

  it("refuses an on-sale event with no ticket link", () => {
    assert.throws(() => validateEvents([{ ...baseEvent, status: "on-sale" }]), ContentError);
  });

  it("refuses an unknown timezone", () => {
    assert.throws(() => validateEvents([{ ...baseEvent, timezone: "Mars/Olympus" }]), ContentError);
  });

  it("refuses an end date before the start date", () => {
    assert.throws(() => validateEvents([{ ...baseEvent, endDate: "2026-10-01" }]), ContentError);
  });

  it("refuses duplicate ids", () => {
    assert.throws(() => validateEvents([baseEvent, { ...baseEvent, city: "Lyon" }]), ContentError);
  });

  it("refuses more than one featured release", () => {
    const release = officialReleases[1] as Release;
    assert.throws(() => validateReleases([officialReleases[0], { ...release, featured: true }]), ContentError);
  });
});

describe("live search and region filters", () => {
  it("matches city, country, venue and event name", () => {
    const paris = demoEvents.find((entry) => entry.city === "Paris")!;
    assert.equal(matchesQuery(paris, "paris"), true);
    assert.equal(matchesQuery(paris, "FRANCE"), true);
    assert.equal(matchesQuery(paris, "venue"), true);
    assert.equal(matchesQuery(paris, "tokyo"), false);
    assert.equal(matchesQuery(paris, "  "), true);
  });

  it("combines region and text filters", () => {
    const europeOnly = filterEvents(demoEvents, { region: "Europe" });
    assert.ok(europeOnly.length > 0);
    assert.ok(europeOnly.every((entry) => entry.region === "Europe"));

    assert.equal(filterEvents(demoEvents, { region: "Asia", query: "Paris" }).length, 0);
    assert.equal(filterEvents(demoEvents, { region: "Europe", query: "Paris" }).length, 1);
  });

  it("returns everything when no filter is applied", () => {
    assert.equal(filterEvents(demoEvents, {}).length, demoEvents.length);
  });
});
