import { EventList } from "@/components/live/EventRow";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ContentResult } from "@/lib/content";
import type { LiveEvent, SiteSettings } from "@/lib/content/types";

/**
 * Upcoming shows preview (design.md §7E).
 *
 * Deliberately has no search or filters — those belong on /live. A failed feed
 * says so and offers the canonical provider; it is never rendered as "no shows".
 */
export function LivePreview({
  result,
  settings,
  limit = 6,
}: {
  result: ContentResult<LiveEvent[]>;
  settings: SiteSettings;
  limit?: number;
}) {
  return (
    <section aria-labelledby="live-preview-heading" className="bg-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div>
          <SectionLabel index="02" label="Live" />
          <h2 id="live-preview-heading" className="type-display mt-4 text-5xl leading-[0.92] md:text-6xl lg:text-7xl">
            See you out there.
          </h2>

          {!result.ok ? (
            <div className="mt-12 border-t border-rule-dark pt-8">
              <p className="max-w-prose text-base text-paper md:text-lg">
                Show dates are temporarily unavailable. This is a problem loading the schedule — it does not mean there
                are no shows.
              </p>
              {settings.eventsProviderUrl ? (
                <ButtonLink href={settings.eventsProviderUrl} variant="outline-dark" className="mt-6">
                  See dates on the official events provider
                </ButtonLink>
              ) : null}
            </div>
          ) : result.data.length === 0 ? (
            <div className="mt-12 border-t border-rule-dark pt-8">
              <p className="max-w-prose text-base text-paper md:text-lg">
                No upcoming dates are confirmed right now. Sign up below and you will hear about new shows first.
              </p>
              <ButtonLink href="/#updates" variant="outline-dark" className="mt-6">
                Get updates
              </ButtonLink>
            </div>
          ) : (
            <>
              <EventList events={result.data.slice(0, limit)} className="mt-12" />
              <div className="mt-10">
                <ButtonLink href="/live" variant="outline-dark">
                  All shows <span aria-hidden="true">→</span>
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
