import { expect, test } from "@playwright/test";

/**
 * Page-weight measurement against the production build.
 *
 * design.md §14 sets image budgets (mobile hero ≈250 KB, desktop hero ≈450 KB).
 * The concept ships no hero photograph — the composition is inline SVG — so the
 * meaningful figure is the total transfer for the first view. These thresholds
 * are the project budget, not a Core Web Vitals result: field LCP/INP/CLS
 * cannot be measured from a local run.
 */
async function measure(page: import("@playwright/test").Page, path: string) {
  let bytes = 0;
  let requests = 0;
  page.on("response", async (response) => {
    requests += 1;
    const length = response.headers()["content-length"];
    if (length) bytes += Number(length);
    else {
      try {
        bytes += (await response.body()).length;
      } catch {
        /* redirects and aborted responses have no body */
      }
    }
  });
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return { kb: Math.round(bytes / 1024), requests };
}

test("home page transfer stays inside the project budget @ 1440px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { kb, requests } = await measure(page, "/");
  console.log(`home @1440: ${kb} KB across ${requests} requests`);
  expect(kb).toBeLessThan(700);
});

test("home page transfer stays inside the project budget @ 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { kb, requests } = await measure(page, "/");
  console.log(`home @390: ${kb} KB across ${requests} requests`);
  expect(kb).toBeLessThan(700);
});

test("no third-party player or feed loads before the visitor asks", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname)) external.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external, `unexpected third-party requests: ${external.join(", ")}`).toHaveLength(0);
});
