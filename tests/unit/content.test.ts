import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { djMagNumberOneYears, selectedAwards } from "../../src/content/awards.ts";
import { demoEvents } from "../../src/content/events.ts";
import { storeProducts } from "../../src/content/products.ts";
import { officialReleases } from "../../src/content/releases.ts";
import { officialVideos } from "../../src/content/videos.ts";
import { atmosphericCampaign, portraitCampaign } from "../../src/content/campaign.ts";
import { siteSettings } from "../../src/content/site.ts";
import { filterEvents, matchesQuery } from "../../src/lib/content/filter.ts";
import {
  assertInternalHref,
  assertSafeUrl,
  ContentError,
  validateAwards,
  validateEvents,
  validateProducts,
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

  it("record where every image came from, so provenance survives to approval", () => {
    const images = [
      atmosphericCampaign.image,
      atmosphericCampaign.mobileImage,
      portraitCampaign.image,
      portraitCampaign.mobileImage,
      ...officialReleases.map((release) => release.artwork),
      ...officialVideos.map((video) => video.still),
      ...storeProducts.map((product) => product.image),
    ].filter((image) => image !== null);

    assert.ok(images.length > 0);
    for (const image of images) {
      assert.ok(image.source, `an image is missing its source: ${image.src}`);
      assert.ok(image.src.startsWith("/assets/"), `${image.src} is not a local asset`);

      // Only artwork this project generated itself may claim approval.
      // Anything lifted from an official source stays pending until the
      // client confirms the rights position.
      const isOriginal = image.source!.startsWith("Original");
      if (!isOriginal) {
        assert.equal(image.approval, "pending-approval", `${image.src} claims approval it does not have`);
      }
    }
  });

  it("ship an original, self-generated hero loop rather than lifted footage", () => {
    const video = atmosphericCampaign.video;
    assert.ok(video, "the atmospheric campaign must carry a loop");
    assert.ok(video.sources.length >= 2, "offer webm and mp4");
    for (const source of video.sources) {
      assert.ok(source.src.startsWith("/assets/hero/"), source.src);
    }
    // The poster must be the loop's own frame, or the swap is visible.
    assert.equal(video.poster, "/assets/hero/hero-loop-poster.jpg");
    assert.equal(atmosphericCampaign.image?.src, video.poster);
    assert.ok(video.durationSeconds >= 6 && video.durationSeconds <= 10, "design.md §7B asks for 6-10s");
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
      if (item.external) {
        assert.doesNotThrow(() => assertSafeUrl(item.href, `nav ${item.label}`));
      } else {
        assert.ok(item.href.startsWith("/"), `${item.href} is not a real route`);
      }
    }
  });

  it("only advertises the shop while a store URL is confirmed", () => {
    const shop = siteSettings.nav.find((item) => item.label === "Shop");
    if (siteSettings.storeUrl) {
      assert.ok(shop, "a confirmed store must appear in the navigation");
      assert.equal(shop?.href, siteSettings.storeUrl);
      assert.equal(shop?.external, true);
    } else {
      assert.equal(shop, undefined, "the shop must not appear without a confirmed store");
    }
  });
});

describe("awards", () => {
  it("pass validation and are all wins with a traceable source", () => {
    assert.doesNotThrow(() => validateAwards(selectedAwards));
    for (const award of selectedAwards) {
      assert.ok(award.sourceUrl.startsWith("https://"), award.id);
      assert.equal(award.approval, "pending-approval", `${award.id} claims approval it does not have`);
    }
  });

  it("reject an implausible ceremony year", () => {
    assert.throws(() => validateAwards([{ ...selectedAwards[0], year: 1492 }]), ContentError);
    assert.throws(() => validateAwards([{ ...selectedAwards[0], year: 2999 }]), ContentError);
  });

  it("reject an award with no source to check it against", () => {
    assert.throws(
      () => validateAwards([{ ...selectedAwards[0], sourceUrl: "" }]),
      ContentError,
    );
  });

  it("state DJ Mag number-one years rather than a derived total", () => {
    assert.ok(djMagNumberOneYears.length > 0);
    for (const year of djMagNumberOneYears) {
      assert.ok(Number.isInteger(year) && year > 1990 && year <= new Date().getFullYear(), String(year));
    }
  });
});

describe("store products", () => {
  it("pass validation and link to the official store", () => {
    assert.doesNotThrow(() => validateProducts(storeProducts));
    for (const product of storeProducts) {
      assert.ok(product.storeUrl.startsWith("https://store.davidguetta.com/"), product.id);
      assert.equal(product.approval, "pending-approval");
    }
  });

  it("never show a price without a currency and a read time", () => {
    assert.throws(
      () => validateProducts([{ ...storeProducts[0], currency: null }]),
      ContentError,
    );
    assert.throws(
      () => validateProducts([{ ...storeProducts[0], verifiedAt: null }]),
      ContentError,
    );
  });

  it("reject a price that is not a plain amount", () => {
    assert.throws(() => validateProducts([{ ...storeProducts[0], price: "from 29" }]), ContentError);
  });

  it("reject an unknown availability value", () => {
    assert.throws(() => validateProducts([{ ...storeProducts[0], availability: "selling fast" }]), ContentError);
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
