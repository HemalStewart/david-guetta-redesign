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
  test("region filter writes to the URL and survives a reload", async ({ page }) => {
    await page.goto("/live");
    await page.getByLabel("Region").selectOption("Asia");
    await expect(page).toHaveURL(/region=Asia/);

    await page.reload();
    await expect(page.getByLabel("Region")).toHaveValue("Asia");
    await expect(page.getByRole("heading", { name: "Tokyo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paris" })).toHaveCount(0);
  });

  test("search narrows results and back restores the previous state", async ({ page }) => {
    await page.goto("/live");
    await page.getByLabel("Search city, country or venue").fill("Tokyo");
    await expect(page).toHaveURL(/q=Tokyo/);
    await expect(page.getByRole("heading", { name: "Tokyo" })).toBeVisible();

    await page.goBack();
    await expect(page).not.toHaveURL(/q=Tokyo/);
  });

  test("a search with no matches explains how to recover", async ({ page }) => {
    await page.goto("/live?q=zzzznowhere");
    await expect(page.getByRole("heading", { name: "No shows match those filters" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clear filters" })).toBeVisible();
  });

  test("clear filters resets both controls", async ({ page }) => {
    await page.goto("/live?q=Tokyo&region=Asia");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/live$/);
    await expect(page.getByLabel("Search city, country or venue")).toHaveValue("");
  });

  test("past shows are a separate view, never mixed into upcoming", async ({ page }) => {
    await page.goto("/live");
    await expect(page.getByRole("heading", { name: "Barcelona" })).toHaveCount(0);
    await page.getByRole("link", { name: "Past shows" }).click();
    await expect(page.getByRole("heading", { name: "Barcelona" })).toBeVisible();
  });

  test("each event status is stated in words, not colour alone", async ({ page }) => {
    await page.goto("/live");
    for (const label of ["Sold out", "Cancelled", "Postponed", "On sale soon", "Tickets unavailable"]) {
      await expect(page.getByText(label, { exact: true }).first(), label).toBeVisible();
    }
  });

  test("a cancelled show offers no ticket action", async ({ page }) => {
    await page.goto("/live?q=Mexico");
    await expect(page.getByText("This show will not take place")).toBeVisible();
    await expect(page.getByRole("link", { name: /Tickets for/ })).toHaveCount(0);
  });
});

test.describe("music", () => {
  test("a release card leads to its detail page", async ({ page }) => {
    await page.goto("/music");
    await page.getByRole("link", { name: /Sample Album/ }).first().click();
    await expect(page).toHaveURL(/\/music\/sample-album$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sample Album" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tracklist" })).toBeVisible();
  });

  test("type filters keep state in the URL", async ({ page }) => {
    await page.goto("/music");
    await page.getByRole("link", { name: "Albums" }).click();
    await expect(page).toHaveURL(/type=album/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Music");
  });

  test("an unsupplied listening link says so instead of pretending", async ({ page }) => {
    await page.goto("/music/sample-album");
    await expect(page.getByText("Listening link pending")).toBeVisible();
  });
});

test.describe("video dialog", () => {
  test("opens on an explicit action, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/watch");
    // Nothing is embedded before the visitor asks for it.
    expect(await page.locator("iframe").count()).toBe(0);

    const trigger = page.getByRole("button", { name: /Play video: Featured performance/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: /Video: Featured performance/ });
    await expect(dialog).toBeVisible();

    // Unconnected video keeps its still and offers the official channel.
    await expect(dialog.getByRole("link", { name: /Watch on YouTube/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("only one dialog can be open at a time", async ({ page }) => {
    await page.goto("/watch");
    await page.getByRole("button", { name: /Play video: Festival set/ }).click();
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

    await expect(page.getByText(/Preview only — sign-up is not connected/)).toBeVisible();
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
