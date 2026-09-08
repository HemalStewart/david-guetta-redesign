import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { EventStatusTag } from "@/components/live/EventStatus";
import type { ContentResult } from "@/lib/content";
import type { LiveEvent } from "@/lib/content/types";
import { formatDateBlock, formatEventDateRangeLong, formatStartTime, machineDate, yearOf } from "@/lib/dates";

/**
 * Next-show strip (design.md §7C).
 *
 * Derived from the same events data as every other date on the site — there is
 * no second, hand-typed "next show". A sold-out or postponed next show is
 * still shown as the next show; skipping it would imply a later date is next.
 */
function Band({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="next-show-heading" className="border-y border-rule-dark bg-ink-raised">
      <Container className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        {children}
      </Container>
    </section>
  );
}

export function NextShow({ result }: { result: ContentResult<LiveEvent | null> }) {
  if (!result.ok) {
    return (
      <Band>
        <h2 id="next-show-heading" className="type-meta text-signal">
          Show dates
        </h2>
        <p className="flex-1 text-sm text-muted-dark md:text-base">
          Dates are temporarily unavailable. This is a loading problem, not an empty schedule.
        </p>
        <Link href="/live" className="type-meta inline-flex min-h-11 items-center text-paper hover:text-signal">
          Try the live page →
        </Link>
      </Band>
    );
  }

  const event = result.data;

  // No verified upcoming event: invite updates rather than showing an empty band.
  if (!event) {
    return (
      <Band>
        <h2 id="next-show-heading" className="type-meta text-signal">
          Get live updates
        </h2>
        <p className="flex-1 text-sm text-muted-dark md:text-base">
          No upcoming dates are confirmed right now. Be first to hear when new shows are announced.
        </p>
        <ButtonLink href="/#updates" variant="outline-dark">
          Get updates
        </ButtonLink>
      </Band>
    );
  }

  const startTime = formatStartTime(event);
  const context = `${event.city}, ${formatEventDateRangeLong(event)}`;

  return (
    <Band>
      <h2 id="next-show-heading" className="type-meta text-signal md:w-28 md:shrink-0">
        Next show
      </h2>

      <div className="flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
        <time dateTime={machineDate(event)} className="type-display tabular text-2xl md:text-3xl">
          {formatDateBlock(event)} {yearOf(event.date)}
        </time>
        <p className="type-display text-2xl md:text-3xl">{event.city}</p>
        <p className="text-sm text-muted-dark">
          {event.venue}
          {startTime ? <span className="tabular"> · {startTime}</span> : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <EventStatusTag status={event.status} />
        {event.status === "on-sale" && event.ticketUrl ? (
          <ButtonLink href={event.ticketUrl} variant="primary" ariaLabel={`Tickets for ${context}`}>
            Tickets
          </ButtonLink>
        ) : event.status === "sold-out" && event.waitlistUrl ? (
          <ButtonLink href={event.waitlistUrl} variant="outline-dark" ariaLabel={`Join the waitlist for ${context}`}>
            Waitlist
          </ButtonLink>
        ) : event.status === "sold-out" ? (
          <span className="type-meta text-muted-dark">No waitlist available</span>
        ) : event.status === "on-sale-soon" ? (
          <ButtonLink href="/#updates" variant="outline-dark" ariaLabel={`Get on-sale updates for ${context}`}>
            Get updates
          </ButtonLink>
        ) : null}
      </div>
    </Band>
  );
}
