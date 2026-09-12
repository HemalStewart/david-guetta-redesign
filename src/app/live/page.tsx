import type { Metadata } from "next";
import { EventList } from "@/components/live/EventRow";
import { EventFilters } from "@/components/live/EventFilters";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getActiveRegions, getSiteSettings, getUpcomingEvents } from "@/lib/content";
import { filterEvents } from "@/lib/content/filter";

export const metadata: Metadata = {
  title: "Live",
  description: "Upcoming David Guetta shows by city and region.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; region?: string }>;

export default async function LivePage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", region = "" } = await searchParams;
  const now = new Date();
  const settings = getSiteSettings();
  const source = await getUpcomingEvents(now);

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
  const regions = await getActiveRegions(now);

  return (
    <>
      <PageHeader index="02" label="Live" title="Live" />

      <Container className="pb-24">
        <EventFilters regions={regions} resultCount={filtered.length} totalCount={all.length} />

        {filtered.length > 0 ? (
          <EventList events={filtered} className="mt-2" />
        ) : all.length === 0 ? (
          <div className="mt-10">
            <h2 className="type-display text-3xl">No upcoming dates are confirmed</h2>
            <p className="mt-4 max-w-prose text-muted-dark">
              Sign up for updates and you will hear about new shows first.
            </p>
            <ButtonLink href="/#updates" variant="outline-dark" className="mt-6">
              Get updates
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10">
            <h2 className="type-display text-3xl">No shows match those filters</h2>
            <p className="mt-4 max-w-prose text-muted-dark">
              Try a different city or region, or clear the filters to see all {all.length} upcoming shows.
            </p>
            <ButtonLink href="/live" variant="outline-dark" className="mt-6">
              Clear filters
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
