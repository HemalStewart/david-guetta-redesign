"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { isPlausibleEmail } from "@/lib/validation/email";

/**
 * Newsletter form (design.md §7H).
 *
 * Every state in the brief is modelled explicitly. Success is only ever shown
 * because the provider said so — and when the provider is not configured, the
 * form short-circuits *before* any network call, so no address is stored or
 * transmitted and no fake success is displayed.
 */
export type FormState =
  | "idle"
  | "invalid-email"
  | "consent-required"
  | "submitting"
  | "subscribed"
  | "pending-confirmation"
  | "duplicate"
  | "rate-limited"
  | "provider-error"
  | "unconfigured";

const MESSAGES: Record<Exclude<FormState, "idle" | "submitting">, string> = {
  "invalid-email": "Enter a valid email address.",
  "consent-required": "Please confirm you want to receive these updates.",
  subscribed: "You're signed up. Thanks for joining.",
  "pending-confirmation": "Almost there — check your inbox and confirm your address to finish signing up.",
  duplicate: "This address is already on the list.",
  "rate-limited": "Too many attempts. Please wait a moment and try again.",
  "provider-error": "Sign-up is temporarily unavailable. Please try again shortly.",
  unconfigured: "Preview only — sign-up is not connected. Your address was not stored or sent anywhere.",
};

const ERROR_STATES: FormState[] = ["invalid-email", "consent-required", "rate-limited", "provider-error"];

export function NewsletterForm({ configured }: { configured: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const emailId = useId();
  const consentId = useId();
  const messageId = useId();
  const emailRef = useRef<HTMLInputElement>(null);

  const submitting = state === "submitting";
  const showError = ERROR_STATES.includes(state);
  const fieldInvalid = state === "invalid-email";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // No duplicate submissions while a request is open.

    if (!isPlausibleEmail(email)) {
      setState("invalid-email");
      emailRef.current?.focus();
      return;
    }
    if (!consent) {
      setState("consent-required");
      return;
    }

    // Unconfigured provider: stop here. Nothing leaves the browser.
    if (!configured) {
      setState("unconfigured");
      return;
    }

    setState("submitting");
    track("newsletter_submit", { placement: "home-updates" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });
      const result = (await response.json()) as { status?: FormState };
      const next = result.status ?? "provider-error";
      setState(next);
      if (next === "subscribed" || next === "pending-confirmation") {
        track("newsletter_success", { placement: "home-updates" });
        setEmail("");
        setConsent(false);
      }
    } catch {
      setState("provider-error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 max-w-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={emailId} className="type-meta block text-muted-light">
            Email address
          </label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state !== "idle" && state !== "submitting") setState("idle");
            }}
            aria-invalid={fieldInvalid || undefined}
            aria-describedby={state === "idle" || submitting ? undefined : messageId}
            className="mt-2 h-12 w-full rounded-[2px] border border-control-light bg-transparent px-4 text-base text-ink outline-none placeholder:text-muted-light focus-visible:border-ink"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="on-signal inline-flex min-h-12 items-center justify-center rounded-[2px] bg-signal px-6 py-3 text-sm uppercase tracking-wide text-ink transition-colors hover:bg-signal-hover disabled:opacity-70"
        >
          {submitting ? "Signing up…" : "Sign up"}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (state === "consent-required") setState("idle");
          }}
          className="mt-1 h-5 w-5 shrink-0 accent-signal-ink"
        />
        <label htmlFor={consentId} className="text-sm text-muted-light">
          Yes, send me news about music and live shows. Wording to be approved by the client.{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
            Privacy
          </Link>
        </label>
      </div>

      {/* One live region carries every outcome, so nothing is announced twice. */}
      <p
        id={messageId}
        role="status"
        aria-live="polite"
        className={`mt-4 min-h-6 text-sm ${showError ? "text-ink" : "text-muted-light"}`}
      >
        {state === "idle" || submitting ? "" : MESSAGES[state as keyof typeof MESSAGES]}
      </p>

      {!configured ? (
        <p className="type-meta mt-2 inline-flex items-center rounded-[2px] border border-dashed border-control-light px-2 py-1 text-muted-light">
          Provider not connected
        </p>
      ) : null}
    </form>
  );
}
