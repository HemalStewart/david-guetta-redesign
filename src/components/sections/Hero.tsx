import { HeroStill } from "@/components/media/HeroStill";
import { HeroVideoLayer } from "@/components/media/HeroVideoLayer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import type { Campaign } from "@/lib/content/types";

/**
 * Hero — identity and live energy (design.md §7B).
 *
 * Phone: an art-directed 4:5 crop with the title in the ink area directly
 * below it, so nothing important ever sits on the performer's face.
 * Desktop: the same photograph goes full-bleed behind the composition.
 *
 * The brief sketched the performer on the right with type bottom-left. The
 * supplied photograph is the mirror of that — the subject sits left of centre
 * with clear space to the right — so the layout is flipped to suit the image
 * instead of cropping across the face. If a frame with the opposite
 * composition is supplied later, swap `lg:ml-auto lg:text-right` for
 * `lg:mr-auto lg:text-left` and reverse the horizontal scrim.
 *
 * There is one H1, it is real text, and both calls to action are live routes:
 * nothing here waits on video, a loader or JavaScript.
 */
export function Hero({ campaign }: { campaign: Campaign }) {
  return (
    <section className="relative flex flex-col justify-end lg:min-h-[82svh]">
      <div className="relative lg:absolute lg:inset-0">
        {/* Phone gets a portrait crop, desktop the wide frame; the browser
            fetches exactly one of them. The loop layers on top, if allowed. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-raised sm:aspect-[16/10] lg:aspect-auto lg:h-full">
          <HeroStill campaign={campaign} cinematic={!campaign.video} />
          <HeroVideoLayer campaign={campaign} />
        </div>

        {/* Two scrims: upward on phone, inward from the right on desktop. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent lg:from-ink/90 lg:via-ink/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block lg:bg-gradient-to-l lg:from-ink/90 lg:via-ink/30 lg:to-transparent"
        />
        {/* One warm pass of light across the frame as the hero settles. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="light-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-signal/25 to-transparent" />
        </div>
      </div>

      <Container className="relative z-10 pb-12 pt-8 lg:pb-20 lg:pt-40">
        <div className="lg:ml-auto lg:max-w-[44rem] lg:text-right">
          <h1 className="enter enter-1 type-display text-[clamp(4.25rem,18vw,13rem)] leading-[0.86] lg:text-[clamp(6rem,11vw,11rem)]">
            {campaign.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <div className="enter enter-3 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-10 lg:justify-end">
            <ButtonLink href={campaign.primaryAction.href} variant="primary" className="sm:min-w-56 lg:order-2">
              {campaign.primaryAction.label} <span aria-hidden="true" className="arrow-shift">→</span>
            </ButtonLink>
            {campaign.secondaryAction ? (
              <ButtonLink href={campaign.secondaryAction.href} variant="quiet-dark" className="sm:ml-4 lg:order-1 lg:mr-4">
                {campaign.secondaryAction.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
