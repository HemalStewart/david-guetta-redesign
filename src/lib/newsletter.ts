import type { FormState } from "@/components/sections/NewsletterForm";

/**
 * Newsletter provider configuration — server only.
 *
 * The provider key never reaches the browser. Only the resolved boolean from
 * `isNewsletterConfigured()` is passed to a client component.
 */
export function isNewsletterConfigured(): boolean {
  return Boolean(process.env.NEWSLETTER_PROVIDER && process.env.NEWSLETTER_API_KEY && process.env.NEWSLETTER_LIST_ID);
}

/** Double opt-in changes what "success" is allowed to say. */
export function usesDoubleOptIn(): boolean {
  return process.env.NEWSLETTER_DOUBLE_OPT_IN === "true";
}

export type NewsletterOutcome = Extract<
  FormState,
  "subscribed" | "pending-confirmation" | "duplicate" | "rate-limited" | "provider-error" | "unconfigured" | "invalid-email"
>;

/** Naive fixed-window limiter. Replace with the host's real rate limiting. */
const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export function rateLimit(key: string, now = Date.now()): boolean {
  const record = attempts.get(key);
  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return true;
  }
  record.count += 1;
  return record.count <= MAX_ATTEMPTS;
}

export function resetRateLimit(): void {
  attempts.clear();
}
