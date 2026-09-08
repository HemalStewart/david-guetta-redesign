import { ButtonLink } from "@/components/ui/ButtonLink";
import type { LiveEvent } from "@/lib/content/types";
import {
  formatDateBlockLines,
  formatEventDateRangeLong,
  formatStartTime,
  machineDate,
  weekdayOf,
  yearOf,
} from "@/lib/dates";
import { EventStatusTag } from "./EventStatus";

/** Only valid actions are offered, and each is named for its own event. */
function EventAction({ event }: { event: LiveEvent }) {
  const context = `${event.city}, ${formatEventDateRangeLong(event)}`;

  if (event.status === "cancelled") {
    return <span className="type-meta text-muted-dark">This show will not take place</span>;
  }

  if (event.status === "on-sale" && event.ticketUrl) {
    return (
      <ButtonLink href={event.ticketUrl} variant="outline-dark" ariaLabel={`Tickets for ${context}`}>
        Tickets
      </ButtonLink>
    );
  }

  if (event.status === "sold-out") {
    return event.waitlistUrl ? (
      <ButtonLink href={event.waitlistUrl} variant="outline-dark" ariaLabel={`Join the waitlist for ${context}`}>
        Waitlist
      </ButtonLink>
    ) : (
      <span className="type-meta text-muted-dark">No waitlist available</span>
    );
  }

  if (event.status === "postponed") {
    return <span className="type-meta text-muted-dark">New date to be announced</span>;
  }

  if (event.status === "on-sale-soon") {
    return (
      <ButtonLink href="/#updates" variant="outline-dark" ariaLabel={`Get on-sale updates for ${context}`}>
        Get updates
      </ButtonLink>
    );
  }

  // "Tickets unavailable" is already stated by the status tag beside this
  // slot, so adding a second inert control would just repeat it.
  return null;
}

export function EventRow({ event }: { event: LiveEvent }) {
  const startTime = formatStartTime(event);

  return (
    <li className="border-b border-rule-dark transition-colors duration-150 hover:bg-paper/[0.04]">
      <article
        className={`grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-12 md:gap-6 md:py-7 lg:min-h-[6.5rem] ${
          event.status === "cancelled" ? "opacity-65" : ""
        }`}
      >
        {/* Date block */}
        <div className="md:col-span-3 lg:col-span-2">
          <time dateTime={machineDate(event)} className="block">
            <span className="type-meta block text-muted-dark">{weekdayOf(event.date)}</span>
            {formatDateBlockLines(event).map((line) => (
              <span
                key={line}
                className="type-display tabular block whitespace-nowrap text-3xl leading-[1.02] md:text-4xl lg:text-[2.5rem]"
              >
                {line}
              </span>
            ))}
            <span className="type-meta block text-muted-dark">{yearOf(event.date)}</span>
          </time>
        </div>

        {/* City takes visual priority; venue and event name are secondary. */}
        <div className="md:col-span-5 lg:col-span-7">
          <h3 className="type-display text-3xl leading-[0.95] md:text-4xl lg:text-[3.25rem]">
            {event.city}
            <span className="sr-only">, {event.country}</span>
          </h3>
          <p className="mt-1 text-sm text-muted-dark md:text-base">
            <span aria-hidden="true">{event.country}</span>
            <span aria-hidden="true"> · </span>
            {event.venue}
            {event.title ? <span className="text-muted-dark"> · {event.title}</span> : null}
            {startTime ? <span className="tabular"> · {startTime}</span> : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:col-span-4 lg:col-span-3 lg:justify-end">
          <EventStatusTag status={event.status} />
          <EventAction event={event} />
        </div>
      </article>
    </li>
  );
}

export function EventList({ events, className = "" }: { events: LiveEvent[]; className?: string }) {
  return (
    <ul className={`border-t border-rule-dark ${className}`}>
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </ul>
  );
}
