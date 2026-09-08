import type { Metadata } from "next";
import Link from "next/link";
import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { ReleaseCard, releaseMetaLine } from "@/components/music/ReleaseCard";
import { ReleaseFilters } from "@/components/music/ReleaseFilters";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFeaturedRelease, getReleaseYears, getReleases } from "@/lib/content";
import type { ReleaseType } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Music",
  description: "Releases and discography. Concept preview with demo content.",
};

type SearchParams = Promise<{ type?: string; year?: string }>;

export default async function MusicPage({ searchParams }: { searchParams: SearchParams }) {
  const { type = "", year = "" } = await searchParams;
  const all = getReleases();
  const featured = getFeaturedRelease();
  const featuredMeta = featured ? releaseMetaLine(featured) : null;

  const filtered = all.filter((release) => {
    if (type && release.type !== (type as ReleaseType)) return false;
    if (year && release.releaseDate?.slice(0, 4) !== year) return false;
    return true;
  });

  const availableTypes = [...new Set(all.map((release) => release.type))].filter(
    (type): type is ReleaseType => type !== null,
  );
  // Filters only exist for metadata the client has actually supplied.
  const missingMetadata = all.some((release) => !release.type || !release.releaseDate);

  return (
    <>
      <PageHeader
        index="01"
        label="Music"
        title="Music"
        intro="Releases, remixes and albums. Every entry links to its detail page and, once connected, to verified listening destinations."
      />

      <Container className="pb-24">
        {featured && !type && !year ? (
          <section aria-labelledby="featured-heading" className="mb-14 border-t border-rule-dark pt-10">
            <h2 id="featured-heading" className="type-meta text-signal">
              Featured release
            </h2>
            <div className="mt-6 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-4 lg:col-span-3">
                <Link href={`/music/${featured.slug}`} className="group block" tabIndex={-1} aria-hidden="true">
                  <ResponsiveMedia
                    image={featured.artwork}
                    placeholder={featured.placeholder}
                    seed={featured.id}
                    aspect="aspect-square"
                    sizes="(min-width: 768px) 30vw, 92vw"
                    priority
                    className="transition-opacity duration-200 group-hover:opacity-90"
                  />
                </Link>
              </div>
              <div className="md:col-span-8 lg:col-span-7 lg:col-start-5">
                <h3 className="type-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.92]">
                  <Link href={`/music/${featured.slug}`} className="hover:text-signal">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-3 text-base text-paper md:text-lg">{featured.artists.join(", ")}</p>
                {featuredMeta ? <p className="type-meta tabular mt-2 text-muted-dark">{featuredMeta}</p> : null}
                {featured.description ? (
                  <p className="mt-6 max-w-prose text-base text-muted-dark md:text-lg">{featured.description}</p>
                ) : null}
                <ButtonLink href={`/music/${featured.slug}`} variant="outline-dark" className="mt-8">
                  Release details
                </ButtonLink>
              </div>
            </div>
          </section>
        ) : null}

        <ReleaseFilters availableTypes={availableTypes} years={getReleaseYears()} activeType={type} activeYear={year} />

        {missingMetadata ? (
          <p className="mt-6 max-w-prose text-sm text-muted-dark">
            Release type and year filters appear automatically once that metadata is supplied. The official
            discography this preview draws from does not publish release dates or types, and none have been
            invented here.
          </p>
        ) : null}

        {filtered.length > 0 ? (
          <>
            <p className="type-meta mt-6 text-muted-dark">
              <span className="tabular">{filtered.length}</span> of <span className="tabular">{all.length}</span>{" "}
              releases
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((release) => (
                <li key={release.id}>
                  <ReleaseCard release={release} tone="dark" />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-10">
            <h2 className="type-display text-3xl">No releases match those filters</h2>
            <p className="mt-4 max-w-prose text-muted-dark">Clear the filters to see the full catalogue.</p>
            <ButtonLink href="/music" variant="outline-dark" className="mt-6">
              Clear filters
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
