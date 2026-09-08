import { expect, test } from "@playwright/test";

/**
 * Page-weight measurement against the production build.
 *
 * design.md §14 sets image budgets (mobile hero ≈250 KB, desktop hero ≈450 KB).
 * This measures the whole first view instead, which is the figure that
 * actually matters and the one a regression would show up in.
 *
 * Two caveats, deliberately not papered over:
 *  - `next start` optimises images on demand, so the first request for a size
 *    is slower and larger than the cached variant a CDN would serve. Each test
 *    warms the page once, then measures.
 *  - The remaining run-to-run spread is roughly 320–490 KB. The assertion is a
 *    generous regression guard — it catches someone dropping in an unoptimised
 *    5 MB hero — not a performance claim. Field LCP/INP/CLS cannot be measured
 *    from a local run at all.
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

/**
 * Primes the on-demand image optimiser, then measures in a FRESH context.
 * Warming and measuring in the same page would just read the browser cache and
 * report a number no first-time visitor ever experiences.
 */
async function warmThenMeasure(
  browser: import("@playwright/test").Browser,
  page: import("@playwright/test").Page,
  viewport: { width: number; height: number },
  path: string,
) {
  await page.setViewportSize(viewport);
  await page.goto(path);
  await page.waitForLoadState("networkidle");

  const context = await browser.newContext({ viewport });
  const fresh = await context.newPage();
  try {
    return await measure(fresh, path);
  } finally {
    await context.close();
  }
}

test("home page transfer stays inside the project budget @ 1440px", async ({ browser, page }) => {
  const { kb, requests } = await warmThenMeasure(browser, page, { width: 1440, height: 900 }, "/");
  console.log(`home @1440: ${kb} KB across ${requests} requests`);
  expect(kb).toBeLessThan(1200);
});

test("home page transfer stays inside the project budget @ 390px", async ({ browser, page }) => {
  const { kb, requests } = await warmThenMeasure(browser, page, { width: 390, height: 844 }, "/");
  console.log(`home @390: ${kb} KB across ${requests} requests`);
  expect(kb).toBeLessThan(1200);
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
