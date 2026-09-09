import { VideoLauncher } from "@/components/media/VideoDialog";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { SiteSettings, Video } from "@/lib/content/types";

/**
 * Performance feature (design.md §7F): one dominant 16:9 still that
 * communicates scale, and an explicit play action.
 */
export function PerformanceFeature({ video, settings }: { video: Video | null; settings: SiteSettings }) {
  if (!video) return null;
  const youtube = settings.socials.find((social) => social.label === "YouTube")?.href ?? null;

  return (
    <section aria-labelledby="performance-heading" className="border-t border-rule-dark bg-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div>
          <div className="scroll-in flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index="03" label="Watch" />
              <h2 id="performance-heading" className="type-display mt-4 text-5xl leading-[0.92] md:text-6xl lg:text-7xl">
                Watch the set.
              </h2>
            </div>
            <ButtonLink href="/watch" variant="quiet-dark">
              All videos <span aria-hidden="true" className="arrow-shift">→</span>
            </ButtonLink>
          </div>

          <div className="mt-10">
            <VideoLauncher video={video} fallbackUrl={youtube} size="feature" placement="home-performance" />
          </div>
        </div>
      </Container>
    </section>
  );
}
