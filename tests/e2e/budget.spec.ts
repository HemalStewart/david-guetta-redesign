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
 *  - Bytes are split at the load event. The hero loop and the lazy imagery
 *    further down the page are requested only after it, so they are reported
 *    separately rather than folded into one number that would misrepresent
 *    what a visitor waits for on arrival. Note that the loop keeps the network
 *    busy, which delays networkidle and pulls more lazy images into the
 *    "after" bucket — another reason not to read a single total.
 *  - The assertion is a generous regression guard — it catches someone dropping
 *    in an unoptimised 5 MB hero — not a performance claim. Field LCP/INP/CLS
 *    cannot be measured from a local run at all.
 */
async function measure(page: import("@playwright/test").Page, path: string) {
  let initialBytes = 0;
  let laterBytes = 0;
  let initialRequests = 0;
  let loaded = false;

  page.on("response", async (response) => {
    const length = response.headers()["content-length"];
    let size = length ? Number(length) : 0;
    if (!length) {
      try {
        size = (await response.body()).length;
      } catch {
        /* redirects and aborted responses have no body */
      }
    }
    if (loaded) {
      laterBytes += size;
    } else {
      initialBytes += size;
      initialRequests += 1;
    }
  });

  await page.goto(path);
  await page.waitForLoadState("load");
  loaded = true;
  // Everything after this point — the hero loop, and lazy imagery further down
  // the page — is counted separately. Folding it into one number would
  // misrepresent what a visitor actually waits for on arrival.
  await page.waitForLoadState("networkidle");

  return {
    initialKb: Math.round(initialBytes / 1024),
    laterKb: Math.round(laterBytes / 1024),
    requests: initialRequests,
  };
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
  const { initialKb, laterKb, requests } = await warmThenMeasure(browser, page, { width: 1440, height: 900 }, "/");
  console.log(`home @1440: ${initialKb} KB / ${requests} requests to load, +${laterKb} KB after (loop + lazy imagery)`);
  expect(initialKb).toBeLessThan(900);
});

test("home page transfer stays inside the project budget @ 390px", async ({ browser, page }) => {
  const { initialKb, laterKb, requests } = await warmThenMeasure(browser, page, { width: 390, height: 844 }, "/");
  console.log(`home @390: ${initialKb} KB / ${requests} requests to load, +${laterKb} KB after (lazy imagery)`);
  expect(initialKb).toBeLessThan(900);
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
