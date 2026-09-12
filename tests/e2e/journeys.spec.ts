import { expect, test } from "@playwright/test";

/**
 * Behaviour checks for the journeys the brief names. These deliberately assert
 * on what a visitor can do, not on markup shape.
 */

test.describe("navigation", () => {
  test("every primary route resolves and has one H1", async ({ page }) => {
    for (const route of ["/", "/live", "/music", "/watch", "/contact", "/privacy", "/terms"]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1"), route).toHaveCount(1);
    }
  });

  test("the legacy discography URL redirects to /music", async ({ page }) => {
    await page.goto("/discography");
    await expect(page).toHaveURL(/\/music$/);
  });

  test("an unknown release slug is a 404, not a redirect", async ({ page }) => {
    const response = await page.goto("/music/not-a-real-release");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("no page exposes a dead # link", async ({ page }) => {
    for (const route of ["/", "/live", "/music", "/watch", "/contact"]) {
      await page.goto(route);
      const dead = await page.locator('a[href="#"], a[href^="javascript:"]').count();
      expect(dead, route).toBe(0);
    }
  });

  test("the skip link moves focus to the main landmark", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    // Background scrolling is locked while the menu is open.
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("navigating from the menu closes it and lands on the route", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog", { name: "Site menu" }).getByRole("link", { name: "Live" }).click();
    await expect(page).toHaveURL(/\/live$/);
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  });
});

test.describe("live page", () => {
  /**
   * Dates come from the artist's live provider now, so these are written
   * against whatever it returns rather than against fixed cities.
   */
  test("region filter writes to the URL and survives a reload", async ({ page }) => {
    await page.goto("/live");
    const options = await page.getByLabel("Region").locator("option").allTextContents();
    const region = options.find((option) => option !== "All regions");
    test.skip(!region, "provider returned no events to filter");

    await page.getByLabel("Region").selectOption(region!);
    await expect(page).toHaveURL(new RegExp(`region=${encodeURIComponent(region!)}`));

    await page.reload();
    await expect(page.getByLabel("Region")).toHaveValue(region!);
    await expect(page.locator("main li article h3").first()).toBeVisible();
  });

  test("search narrows results and back restores the previous state", async ({ page }) => {
    await page.goto("/live");
    // The heading carries a screen-reader-only ", COUNTRY" suffix, so take the
    // city on its own as the search term.
    // textContent, not innerText: the heading is uppercased in CSS, and
    // toContainText matches against the underlying text.
    const heading = (await page.locator("main li article h3").first().textContent()) ?? "";
    const city = heading.split(",")[0].trim();
    test.skip(!city, "provider returned no events to search");

    await page.getByLabel("Search city, country or venue").fill(city);
    await expect(page).toHaveURL(/q=/);
    await expect(page.locator("main li article h3").first()).toContainText(city);

    await page.goBack();
    await expect(page).not.toHaveURL(/q=/);
  });

  test("a search with no matches explains how to recover", async ({ page }) => {
    await page.goto("/live?q=zzzznowhere");
    await expect(page.getByRole("heading", { name: "No shows match those filters" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
  });

  test("clear filters resets both controls", async ({ page }) => {
    await page.goto("/live?q=Paris&region=Europe");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/live$/);
    await expect(page.getByLabel("Search city, country or venue")).toHaveValue("");
  });

  test("only upcoming dates are listed — there is no past-shows view", async ({ page }) => {
    await page.goto("/live");
    await expect(page.getByRole("link", { name: "Past shows" })).toHaveCount(0);
    await expect(page.getByText(/upcoming shows/)).toBeVisible();
  });

  /**
   * Status must never be carried by colour alone. Rather than naming statuses
   * the provider may or may not be returning today, this asserts that every
   * rendered row states its status in words.
   */
  test("every event states its status in words, not colour alone", async ({ page }) => {
    await page.goto("/live");
    const rows = page.locator("main li article");
    const count = await rows.count();
    test.skip(count === 0, "provider returned no events");

    const KNOWN = ["On sale", "On sale soon", "Sold out", "Cancelled", "Postponed", "Tickets unavailable"];
    for (let index = 0; index < count; index += 1) {
      // Status tags are uppercased in CSS, so compare case-insensitively.
      const text = (await rows.nth(index).innerText()).toLowerCase();
      expect(
        KNOWN.some((label) => text.includes(label.toLowerCase())),
        `row ${index} has no status word:\n${text}`,
      ).toBe(true);
    }
  });

  test("a ticket link is named for its own event", async ({ page }) => {
    await page.goto("/live");
    const tickets = page.getByRole("link", { name: /^Tickets for / });
    test.skip((await tickets.count()) === 0, "provider returned no on-sale events");
    await expect(tickets.first()).toHaveAttribute("href", /^https:\/\//);
  });
});

test.describe("music", () => {
  test("a release card leads to its detail page", async ({ page }) => {
    await page.goto("/music");
    await page.getByRole("link", { name: /Crazy What Love Can Do/ }).first().click();
    await expect(page).toHaveURL(/\/music\/crazy-what-love-can-do$/);
    await expect(page.getByRole("heading", { level: 1, name: "Crazy What Love Can Do" })).toBeVisible();
  });

  test("no release states a date or type the source never published", async ({ page }) => {
    await page.goto("/music/crazy-what-love-can-do");
    // Unknown metadata is omitted, not printed as "to be confirmed".
    await expect(page.getByText(/to be confirmed/i)).toHaveCount(0);
  });

  test("filters stay hidden while their metadata is missing", async ({ page }) => {
    await page.goto("/music");
    await expect(page.getByRole("link", { name: "Albums" })).toHaveCount(0);
  });

  test("the featured playlist is embedded from Spotify and loads lazily", async ({ page }) => {
    await page.goto("/music");
    const frame = page.locator('iframe[src*="open.spotify.com/embed/playlist/"]');
    await expect(frame).toHaveCount(1);
  });

  test("a filter passed in the URL still resolves rather than erroring", async ({ page }) => {
    const response = await page.goto("/music?type=album");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "No releases match those filters" })).toBeVisible();
  });

  test("a release with a store destination plays in place", async ({ page }) => {
    await page.goto("/music/crazy-what-love-can-do");
    const frame = page.locator('iframe[src*="open.spotify.com/embed/album/"]');
    await expect(frame).toHaveCount(1);
  });
});

test.describe("video dialog", () => {
  test("opens on an explicit action, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/watch");
    // Nothing is embedded before the visitor asks for it.
    expect(await page.locator("iframe").count()).toBe(0);

    const trigger = page.getByRole("button", { name: /Play video: Sorana & David Guetta - redruM/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: /Video: Sorana & David Guetta - redruM/ });
    await expect(dialog).toBeVisible();

    // The player is created only now, and points at the privacy-preserving host.
    await expect(dialog.locator("iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/v8TVixpaBcQ/,
    );
    await expect(dialog.getByRole("link", { name: /Watch on YouTube/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("only one dialog can be open at a time", async ({ page }) => {
    await page.goto("/watch");
    await page.getByRole("button", { name: /Play video: David Guetta & Sia/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("newsletter", () => {
  test("rejects an invalid address without sending anything", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/#updates");
    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    expect(requests.some((url) => url.includes("/api/newsletter"))).toBe(false);
  });

  test("requires consent before it will accept a valid address", async ({ page }) => {
    await page.goto("/#updates");
    await page.getByLabel("Email address").fill("fan@example.com");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText("Please confirm you want to receive these updates.")).toBeVisible();
  });

  test("states honestly that it is not connected and transmits nothing", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/#updates");
    await page.getByLabel("Email address").fill("fan@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText(/Sign-up isn’t connected yet/)).toBeVisible();
    expect(requests.some((url) => url.includes("/api/newsletter"))).toBe(false);
  });

  test("the API refuses to claim a subscription when no provider is configured", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      data: { email: "fan@example.com", consent: true },
    });
    const body = (await response.json()) as { status: string };
    expect(["unconfigured", "rate-limited"]).toContain(body.status);
    expect(body.status).not.toBe("subscribed");
  });
});

test.describe("responsive integrity", () => {
  const WIDTHS = [360, 390, 768, 1024, 1440];
  const ROUTES = ["/", "/live", "/music", "/music/sample-collaboration-with-a-deliberately-long-placeholder-title", "/watch", "/contact"];

  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ROUTES) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${route} @ ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("no horizontal overflow with the mobile menu open", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("primary controls meet the 44px touch target floor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    for (const name of ["View shows", "Explore music"]) {
      const box = await page.getByRole("link", { name }).first().boundingBox();
      expect(box!.height, name).toBeGreaterThanOrEqual(44);
    }
    const menu = await page.getByRole("button", { name: "Menu" }).boundingBox();
    expect(menu!.height).toBeGreaterThanOrEqual(44);
    expect(menu!.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe("motion never hides content", () => {
  /**
   * Regression guard. An earlier JS reveal-on-scroll left whole sections blank
   * in a full-page render — visually broken, and invisible to anyone whose
   * observer never fired. The replacement is CSS-only and additive, and this
   * asserts it stays that way: every homepage section must be visible and have
   * real height when the whole document is rendered at once.
   */
  // Located by the ids each section points its aria-labelledby at, so the
  // test does not break every time a headline is reworded.
  const SECTION_IDS = [
    "next-show-heading",
    "featured-release-heading",
    "live-preview-heading",
    "performance-heading",
    "store-heading",
    "recognition-heading",
    "updates-heading",
  ];

  test("every homepage section renders without being scrolled to", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    for (const id of SECTION_IDS) {
      const node = page.locator(`#${id}`);
      await expect(node, id).toBeVisible();
      const box = await node.boundingBox();
      expect(box!.height, `${id} has no height`).toBeGreaterThan(0);
      const opacity = await node.evaluate((el) => {
        let current: HTMLElement | null = el as HTMLElement;
        let lowest = 1;
        while (current) {
          lowest = Math.min(lowest, Number(getComputedStyle(current).opacity));
          current = current.parentElement;
        }
        return lowest;
      });
      expect(opacity, `${id} is transparent`).toBeGreaterThan(0.9);
    }
  });

  test("below-the-fold sections are not left transparent before scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    // Read every animated wrapper without scrolling to it first.
    const opacities = await page.$$eval(".scroll-in", (nodes) =>
      nodes.map((node) => Number(getComputedStyle(node).opacity)),
    );
    expect(opacities.length).toBeGreaterThan(0);
    for (const opacity of opacities) expect(opacity).toBeGreaterThan(0.9);
  });

  test("reduced motion disables the entrance animations entirely", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const names = await page.$$eval("h1, .scroll-in", (nodes) =>
      nodes.map((node) => getComputedStyle(node).animationName),
    );
    for (const name of names) expect(name).toBe("none");
  });
});

test.describe("store", () => {
  test("the shop is reachable from the primary navigation as an external link", async ({ page }) => {
    await page.goto("/");
    const shop = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /Shop/ });
    await expect(shop).toHaveAttribute("href", "https://store.davidguetta.com");
    await expect(shop).toHaveAttribute("target", "_blank");
    await expect(shop).toHaveAttribute("rel", /noopener/);
  });

  test("products link out to the store and never offer checkout here", async ({ page }) => {
    await page.goto("/");
    const product = page.getByRole("link", { name: /on the official store$/ }).first();
    await expect(product).toHaveAttribute("href", /^https:\/\/store\.davidguetta\.com\/products\//);
    // No basket, no checkout, no payment field anywhere on this site.
    await expect(page.getByRole("button", { name: /add to (cart|basket)|checkout|buy now/i })).toHaveCount(0);
  });

  test("a price is always shown with its currency", async ({ page }) => {
    await page.goto("/");
    const store = page.locator("section", { has: page.locator("#store-heading") });
    await expect(store.getByText(/€\d/).first()).toBeVisible();
  });
});

test.describe("recognition", () => {
  test("lists wins with years and says it is a selection", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.locator("#recognition-heading") });
    await expect(section.getByRole("heading", { name: "Grammy Awards" }).first()).toBeVisible();
    await expect(section.getByRole("heading", { name: "Selected wins." })).toBeVisible();
  });

  test("states DJ Mag number-one years rather than a headline total", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.locator("#recognition-heading") });
    await expect(section.getByText("DJ Mag Top 100 — number one")).toBeVisible();
    // A count like "5x number one" would be a derived claim; years are checkable.
    await expect(section.getByText(/\d+\s*[×x]\s*number one/i)).toHaveCount(0);
  });
});

test.describe("hero video", () => {
  /**
   * The loop is an enhancement. These assert it can never become a
   * precondition for a usable hero.
   */
  test("the hero is complete when the media is blocked", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Block every media path: the "blocked, consent-refused or missing" case.
    await page.route("**/hero-loop.*", (route) => route.abort());
    await page.route("**youtube-nocookie.com/**", (route) => route.abort());
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "View shows" })).toBeVisible();
    // The poster is a real <img>, server-rendered, and stays put.
    const poster = page.locator("picture img").first();
    await expect(poster).toBeVisible();
    expect((await poster.boundingBox())!.height).toBeGreaterThan(100);
  });

  test("no video and no third party is requested on a phone viewport", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => {
      if (/hero-loop\.(webm|mp4)|youtube/.test(request.url())) requested.push(request.url());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(900);
    expect(requested, "phones must get the still, not the loop").toHaveLength(0);
    await expect(page.locator("video")).toHaveCount(0);
  });

  test("no video and no third party is requested under reduced motion", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => {
      if (/hero-loop\.(webm|mp4)|youtube/.test(request.url())) requested.push(request.url());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(900);
    expect(requested).toHaveLength(0);
    await expect(page.locator("video")).toHaveCount(0);
  });

  test("on desktop the embed is muted, looped and hidden from assistive tech", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const frame = page.locator('iframe[src*="youtube-nocookie"]');
    await expect(frame).toHaveCount(1);
    const src = (await frame.getAttribute("src"))!;
    expect(src).toContain("mute=1");
    expect(src).toContain("controls=0");
    expect(src).toContain("cc_load_policy=0");
    // No loop and no playlist: either makes the player show its own
    // prev/play/next overlay when a clip starts, and controls=0 does not
    // suppress that. The montage is cycled by us instead, one clip at a time.
    const params = new URL(src).searchParams;
    expect(params.get("playlist")).toBeNull();
    expect(params.get("loop")).toBeNull();
    // Scenery, not content: no keyboard trap, nothing announced.
    await expect(frame).toHaveAttribute("aria-hidden", "true");
    await expect(frame).toHaveAttribute("tabindex", "-1");
  });

  test("the embed is never served from the tracking domain", async ({ page }) => {
    const hosts = new Set<string>();
    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host.includes("youtube")) hosts.add(host);
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('iframe[src*="youtube"]').waitFor();
    expect([...hosts]).not.toContain("www.youtube.com");
  });

  test("pausing removes the third-party frame entirely", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('iframe[src*="youtube"]').waitFor();

    await page.getByRole("button", { name: /Pause background/ }).click();
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
    await page.getByRole("button", { name: /Play background/ }).click();
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(1);
  });

  test("a clip is hidden until the player has settled, so its chrome is never seen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const frame = page.locator('iframe[src*="youtube"]');
    await frame.waitFor();
    // Mounted but transparent while YouTube shows its start-up overlay.
    await expect(frame).toHaveCSS("opacity", "0");
    // ...and visible once it has settled.
    await expect(frame).toHaveCSS("opacity", "1", { timeout: 9000 });
  });

  test("the montage advances to the next clip on its own", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");

    const frame = page.locator('iframe[src*="youtube"]');
    await frame.waitFor();
    const first = (await frame.getAttribute("src"))!;
    // clipSeconds is 20; allow for the settle delay on the next clip too.
    await expect
      .poll(async () => page.locator('iframe[src*="youtube"]').getAttribute("src"), { timeout: 30_000 })
      .not.toBe(first);
  });

  test("scrolling away tears the embed down", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('iframe[src*="youtube"]').waitFor();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  });
});
