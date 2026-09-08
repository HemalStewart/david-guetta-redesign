import { test } from "@playwright/test";

/**
 * Captures the review set into docs/screenshots/. These are the images
 * referenced by docs/QA-REPORT.md — regenerate with `npm run screenshots`.
 */
const DIR = "docs/screenshots";

const WIDTHS = [
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 800 },
  { name: "1440", width: 1440, height: 900 },
];

const ROUTES = [
  { name: "home", path: "/" },
  { name: "live", path: "/live" },
  { name: "music", path: "/music" },
  { name: "release", path: "/music/sample-album" },
  { name: "watch", path: "/watch" },
];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    // The full sweep would be noise; every route is captured at the two
    // decisive widths, and the home page at all five.
    if (route.name !== "home" && !["390", "1440"].includes(width.name)) continue;

    test(`${route.name} @ ${width.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: width.width, height: width.height });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${DIR}/${route.name}-${width.name}.png`, fullPage: true });
    });
  }
}

test("mobile menu open @ 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.screenshot({ path: `${DIR}/mobile-menu-390.png` });
});

test("video dialog open @ 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/watch");
  await page.getByRole("button", { name: /Play video: Featured performance/ }).click();
  await page.screenshot({ path: `${DIR}/video-dialog-1440.png` });
});

test("live filtered with no matches @ 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/live?q=zzzznowhere");
  await page.screenshot({ path: `${DIR}/live-no-matches-1440.png`, fullPage: true });
});

test("newsletter unconnected state @ 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#updates");
  await page.getByLabel("Email address").fill("fan@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByText(/Preview only/).waitFor();
  await page.screenshot({ path: `${DIR}/newsletter-unconnected-1440.png` });
});

test("home at 200% text zoom @ 1440px", async ({ page }) => {
  // Emulates enlarged text by halving the layout viewport, which is what a
  // 200% browser zoom does to available CSS pixels.
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/home-zoom200.png`, fullPage: true });
});

test("404 @ 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/music/not-a-real-release");
  await page.screenshot({ path: `${DIR}/not-found-1440.png` });
});
