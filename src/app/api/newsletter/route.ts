import { NextResponse } from "next/server";
import { isPlausibleEmail } from "@/lib/validation/email";
import { isNewsletterConfigured, rateLimit, usesDoubleOptIn, type NewsletterOutcome } from "@/lib/newsletter";

/**
 * Newsletter endpoint.
 *
 * With no provider configured it returns `unconfigured` and never touches the
 * submitted address. When a provider IS configured, replace the marked block
 * with that provider's current documented API call and map its real response
 * onto these outcomes. Do not return `subscribed` optimistically.
 */
function respond(status: NewsletterOutcome, httpStatus = 200) {
  return NextResponse.json({ status }, { status: httpStatus });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond("invalid-email", 400);
  }

  const { email, consent } = (body ?? {}) as { email?: unknown; consent?: unknown };

  if (typeof email !== "string" || !isPlausibleEmail(email)) {
    return respond("invalid-email", 400);
  }
  if (consent !== true) {
    return respond("invalid-email", 400);
  }

  // Keyed on the proxy-provided client address; the host's own rate limiting
  // should sit in front of this in production.
  const clientKey = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(clientKey)) {
    return respond("rate-limited", 429);
  }

  if (!isNewsletterConfigured()) {
    // Nothing is stored, logged or forwarded.
    return respond("unconfigured");
  }

  try {
    // ---------------------------------------------------------------
    // PRODUCTION INTEGRATION POINT
    // Call the approved provider here using NEWSLETTER_API_KEY and
    // NEWSLETTER_LIST_ID, then map its response:
    //   created + confirmation email sent -> "pending-confirmation"
    //   created + immediately active      -> "subscribed"
    //   already a member                  -> "duplicate"
    //   provider 4xx/5xx or timeout       -> "provider-error"
    // Until that call exists, we must not claim a subscription.
    // ---------------------------------------------------------------
    return respond("provider-error", 502);
  } catch {
    return respond("provider-error", 502);
  }
}

export function GET() {
  return NextResponse.json(
    { configured: isNewsletterConfigured(), doubleOptIn: usesDoubleOptIn() },
    { status: 200 },
  );
}
