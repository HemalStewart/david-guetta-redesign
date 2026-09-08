import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { rateLimit, resetRateLimit } from "../../src/lib/newsletter.ts";
import { isPlausibleEmail } from "../../src/lib/validation/email.ts";

describe("email validation", () => {
  it("accepts ordinary addresses", () => {
    for (const value of ["a@b.co", "someone@example.com", " spaced@example.com "]) {
      assert.equal(isPlausibleEmail(value), true, value);
    }
  });

  it("rejects addresses the provider could never use", () => {
    for (const value of ["", "nope", "no@domain", "two@@example.com", "with space@example.com", `${"a".repeat(250)}@example.com`]) {
      assert.equal(isPlausibleEmail(value), false, value);
    }
  });
});

describe("rate limiting", () => {
  beforeEach(() => resetRateLimit());

  it("allows a burst then blocks within the window", () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      assert.equal(rateLimit("1.2.3.4", now), true, `attempt ${attempt}`);
    }
    assert.equal(rateLimit("1.2.3.4", now), false);
  });

  it("starts a fresh window after the interval", () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < 6; attempt += 1) rateLimit("1.2.3.4", now);
    assert.equal(rateLimit("1.2.3.4", now + 61_000), true);
  });

  it("tracks callers independently", () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < 6; attempt += 1) rateLimit("1.2.3.4", now);
    assert.equal(rateLimit("5.6.7.8", now), true);
  });
});
