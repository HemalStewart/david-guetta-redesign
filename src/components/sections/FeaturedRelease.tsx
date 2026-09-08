import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { ListenAction } from "@/components/music/ListenAction";
import { releaseTypeLabel } from "@/components/music/ReleaseCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Release } from "@/lib/content/types";
import { formatReleaseDate } from "@/lib/dates";

/**
 * Featured release (design.md §7D). Warm-white section.
 *
 * "Featured" is an editorial flag on the release, never "the newest one we
 * happened to have" — so it is never labelled "latest".
 */
export function FeaturedRelease({ release }: { release: Release | null }) {
  if (!release) return null;

  return (
    <section aria-labelledby="featured-release-heading" className="on-paper bg-paper text-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <ResponsiveMedia
              image={release.artwork}
              placeholder={release.placeholder}
              seed={release.id}
              aspect="aspect-square"
              sizes="(min-width: 1024px) 40vw, 92vw"
              label={release.approval === "demo" ? "Placeholder artwork" : null}
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <SectionLabel index="01" label="Music" tone="light" />
            <p className="type-meta mt-6 text-signal-ink">Featured release</p>
            <h2
              id="featured-release-heading"
              className="type-display mt-3 text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.9]"
            >
              {release.title}
            </h2>
            <p className="mt-4 text-lg text-ink">{release.artists.join(", ")}</p>
            <p className="type-meta mt-3 text-muted-light">
              {releaseTypeLabel(release.type)} <span aria-hidden="true">·</span>{" "}
              <span className="tabular">{formatReleaseDate(release.releaseDate)}</span>
            </p>

            {release.description ? (
              <p className="mt-6 max-w-prose text-base text-ink/80 md:text-lg">{release.description}</p>
            ) : null}

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ListenAction release={release} tone="light" />
              <ButtonLink href={`/music/${release.slug}`} variant="quiet-light" className="sm:ml-2">
                Release details
              </ButtonLink>
              <ButtonLink href="/music" variant="quiet-light" className="sm:ml-6">
                All music
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
