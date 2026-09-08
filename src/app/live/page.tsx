import type { Metadata } from "next";
import Link from "next/link";
import { EventList } from "@/components/live/EventRow";
import { EventFilters } from "@/components/live/EventFilters";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getActiveRegions, getPastEvents, getSiteSettings, getUpcomingEvents } from "@/lib/content";
import { filterEvents } from "@/lib/content/filter";

export const metadata: Metadata = {
  title: "Live",
  description: "Upcoming David Guetta shows by city and region. Concept preview with demo content.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; region?: string; view?: string }>;

export default async function LivePage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", region = "", view = "upcoming" } = await searchParams;
  const now = new Date();
  const settings = getSiteSettings();
  const showingPast = view === "past";
  const source = showingPast ? getPastEvents(now) : getUpcomingEvents(now);

  // A failed data source is never rendered as "no shows".
  if (!source.ok) {
    return (
      <>
        <PageHeader index="02" label="Live" title="Live" />
        <Container className="pb-24">
          <div className="border-t border-rule-dark pt-8">
            <h2 className="type-display text-3xl">Dates are temporarily unavailable</h2>
            <p className="mt-4 max-w-prose text-muted-dark">
              The schedule could not be loaded. This is a temporary problem with the data source, not a confirmation
              that there are no shows.
            </p>
            {settings.eventsProviderUrl ? (
              <ButtonLink href={settings.eventsProviderUrl} variant="outline-dark" className="mt-6">
                See dates on the official events provider
              </ButtonLink>
            ) : null}
          </div>
        </Container>
      </>
    );
  }

  const all = source.data;
  const filtered = filterEvents(all, { query: q, region });
  const regions = getActiveRegions(now);
  const hasFilters = Boolean(q || region);

  return (
    <>
      <PageHeader
        index="02"
        label="Live"
        title="Live"
        intro="Every confirmed date, in chronological order. Dates and times are shown in the venue's local time."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/live"
            aria-current={!showingPast ? "page" : undefined}
            className={`type-meta inline-flex min-h-11 items-center rounded-[2px] border px-4 ${
              showingPast ? "border-control-dark text-muted-dark hover:text-paper" : "border-signal text-paper"
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/live?view=past"
            aria-current={showingPast ? "page" : undefined}
            className={`type-meta inline-flex min-h-11 items-center rounded-[2px] border px-4 ${
              showingPast ? "border-signal text-paper" : "border-control-dark text-muted-dark hover:text-paper"
            }`}
          >
            Past shows
          </Link>
        </div>
      </PageHeader>

      <Container className="pb-24">
        <EventFilters regions={regions} resultCount={filtered.length} totalCount={all.length} />

        {filtered.length > 0 ? (
          <EventList events={filtered} className="mt-2" />
        ) : all.length === 0 ? (
          <div className="mt-10">
            <h2 className="type-display text-3xl">
              {showingPast ? "No past shows are listed" : "No upcoming dates are confirmed"}
            </h2>
            <p className="mt-4 max-w-prose text-muted-dark">
              {showingPast
                ? "Past events will appear here once the archive is connected."
                : "Sign up for updates and you will hear about new shows first."}
            </p>
            {!showingPast ? (
              <ButtonLink href="/#updates" variant="outline-dark" className="mt-6">
                Get updates
              </ButtonLink>
            ) : null}
          </div>
        ) : (
          <div className="mt-10">
            <h2 className="type-display text-3xl">No shows match those filters</h2>
            <p className="mt-4 max-w-prose text-muted-dark">
              Try a different city or region, or clear the filters to see all {all.length}{" "}
              {showingPast ? "past" : "upcoming"} shows.
            </p>
            <ButtonLink href={showingPast ? "/live?view=past" : "/live"} variant="outline-dark" className="mt-6">
              Clear filters
            </ButtonLink>
          </div>
        )}

        {settings.eventsProviderUrl ? (
          <p className="mt-12 border-t border-rule-dark pt-8 text-sm text-muted-dark">
            {hasFilters ? "Filtered view. " : ""}Dates in this preview are demo fixtures.{" "}
            <a
              href={settings.eventsProviderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-paper"
            >
              David Guetta on Bandsintown ↗
            </a>{" "}
            is the artist&rsquo;s current events provider.
          </p>
        ) : null}
      </Container>
    </>
  );
}
