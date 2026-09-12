import type { Metadata } from "next";
import { VideoLauncher } from "@/components/media/VideoDialog";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFeaturedVideo, getSiteSettings, getVideos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Watch",
  description: "Selected performances and videos. Concept preview with demo content.",
};

export default function WatchPage() {
  const settings = getSiteSettings();
  const featured = getFeaturedVideo();
  const rest = getVideos().filter((video) => !video.featured);
  const youtube = settings.socials.find((social) => social.label === "YouTube")?.href ?? null;

  return (
    <>
      <PageHeader
        index="03"
        label="Watch"
        title="Watch"
      />

      <Container className="pb-24">
        {featured ? (
          <section aria-labelledby="featured-video-heading" className="border-t border-rule-dark pt-10">
            <h2 id="featured-video-heading" className="type-meta text-signal">
              Featured
            </h2>
            <div className="mt-6">
              <VideoLauncher video={featured} fallbackUrl={youtube} size="feature" placement="watch-featured" />
            </div>
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section aria-labelledby="more-videos-heading" className="mt-16 border-t border-rule-dark pt-10">
            <h2 id="more-videos-heading" className="type-display text-3xl md:text-4xl">
              More videos
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((video) => (
                <li key={video.id}>
                  <VideoLauncher video={video} fallbackUrl={youtube} placement="watch-grid" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {youtube ? (
          <div className="mt-16 border-t border-rule-dark pt-8">
            <p className="max-w-prose text-sm text-muted-dark">
              Video URLs have not been supplied for this preview, so each item opens with its still and the official
              channel rather than a player.
            </p>
            <ButtonLink href={youtube} variant="outline-dark" className="mt-6">
              Official YouTube channel
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </>
  );
}
