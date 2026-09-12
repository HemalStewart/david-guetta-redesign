import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { ListenAction } from "@/components/music/ListenAction";
import { SpotifyEmbed } from "@/components/music/SpotifyEmbed";
import { ReleaseCard, releaseMetaLine, releaseTypeLabel } from "@/components/music/ReleaseCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getRelatedReleases, getReleaseBySlug, getReleases } from "@/lib/content";
import { formatReleaseDate } from "@/lib/dates";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getReleases().map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  if (!release) return { title: "Release not found" };
  const details = [releaseTypeLabel(release.type), release.releaseDate ? formatReleaseDate(release.releaseDate) : null]
    .filter(Boolean)
    .join(", ");
  return {
    title: release.title,
    description: `${release.title} — ${release.artists.join(", ")}${details ? `. ${details}.` : "."}`,
  };
}

export default async function ReleasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  // An unknown slug is a genuine 404, not a redirect to the catalogue.
  if (!release) notFound();

  const related = getRelatedReleases(slug);
  const meta = releaseMetaLine(release);
  // Play the album in place when we have a Spotify destination for it.
  const spotifyAlbum = spotifyUri(release.smartLink ?? release.platforms.find((p) => p.platform === "Spotify")?.href);

  return (
    <>
      <Container className="pb-20 pt-12 md:pt-20">
        <SectionLabel index="01" label="Music" />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <ResponsiveMedia
              image={release.artwork}
              placeholder={release.placeholder}
              seed={release.id}
              aspect="aspect-square"
              sizes="(min-width: 1024px) 40vw, 92vw"
              priority
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h1 className="type-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.9]">{release.title}</h1>
            <p className="mt-4 text-lg text-paper">{release.artists.join(", ")}</p>
            {meta ? <p className="type-meta tabular mt-3 text-muted-dark">{meta}</p> : null}

            {release.description ? (
              <p className="mt-8 max-w-prose text-base text-muted-dark md:text-lg">{release.description}</p>
            ) : null}

            {spotifyAlbum ? (
              <div className="mt-9">
                <SpotifyEmbed uri={spotifyAlbum} title={`${release.title} on Spotify`} height={352} />
              </div>
            ) : (
              <div className="mt-9">
                <ListenAction release={release} variant="primary" tone="dark" />
              </div>
            )}

            {release.tracklist ? (
              <section aria-labelledby="tracklist-heading" className="mt-12">
                <h2 id="tracklist-heading" className="type-meta text-muted-dark">
                  Tracklist
                </h2>
                <ol className="mt-4 border-t border-rule-dark">
                  {release.tracklist.map((track, index) => (
                    <li key={track} className="flex gap-4 border-b border-rule-dark py-3">
                      <span className="tabular w-8 shrink-0 text-muted-dark">{String(index + 1).padStart(2, "0")}</span>
                      <span>{track}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {release.credits ? (
              <section aria-labelledby="credits-heading" className="mt-10">
                <h2 id="credits-heading" className="type-meta text-muted-dark">
                  Credits
                </h2>
                <p className="mt-3 max-w-prose text-sm text-muted-dark">{release.credits}</p>
              </section>
            ) : null}

            <ButtonLink href="/music" variant="quiet-dark" className="mt-12">
              <span aria-hidden="true">←</span> All music
            </ButtonLink>
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <Container className="pb-24">
          <section aria-labelledby="related-heading" className="border-t border-rule-dark pt-10">
            <h2 id="related-heading" className="type-display text-3xl md:text-4xl">
              More music
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ReleaseCard release={item} tone="dark" />
                </li>
              ))}
            </ul>
          </section>
        </Container>
      ) : null}
    </>
  );
}

/** "https://open.spotify.com/album/<id>" -> "album/<id>" for the embed. */
function spotifyUri(url: string | undefined): string | null {
  if (!url) return null;
  const match = /^https:\/\/open\.spotify\.com\/(album|track|playlist)\/([A-Za-z0-9]+)/.exec(url);
  return match ? `${match[1]}/${match[2]}` : null;
}
