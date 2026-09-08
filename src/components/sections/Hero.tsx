import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import type { Campaign } from "@/lib/content/types";

/**
 * Hero — identity and live energy (design.md §7B).
 *
 * Phone: an art-directed 4:5 crop with the title in the ink area directly
 * below it, so nothing important ever sits on the performer's face.
 * Desktop: the same image goes full-bleed behind the composition, with the
 * text held in the readable left/bottom-left corner.
 *
 * There is one H1, it is real text, and both calls to action are live routes:
 * nothing here waits on video, a loader or JavaScript.
 */
export function Hero({ campaign }: { campaign: Campaign }) {
  return (
    <section className="relative flex flex-col justify-end lg:min-h-[82svh]">
      <div className="relative lg:absolute lg:inset-0">
        <ResponsiveMedia
          image={campaign.image}
          placeholder={campaign.placeholder}
          seed={campaign.id}
          aspect="aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full"
          sizes="100vw"
          priority
        />
        {/* Two scrims: upward on phone, inward from the left on desktop. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent lg:from-ink/95 lg:via-ink/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/20 lg:to-transparent"
        />
      </div>

      <Container className="relative z-10 pb-12 pt-8 lg:pb-20 lg:pt-40">
        <h1 className="type-display text-[clamp(4.25rem,18vw,13rem)] leading-[0.86]">
          {campaign.titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p className="mt-5 max-w-md text-base text-paper md:text-lg lg:mt-7">{campaign.supportingCopy}</p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-10">
          <ButtonLink href={campaign.primaryAction.href} variant="primary" className="sm:min-w-56">
            {campaign.primaryAction.label} <span aria-hidden="true">→</span>
          </ButtonLink>
          {campaign.secondaryAction ? (
            <ButtonLink href={campaign.secondaryAction.href} variant="quiet-dark" className="sm:ml-4">
              {campaign.secondaryAction.label}
            </ButtonLink>
          ) : null}
        </div>

        {campaign.caption ? (
          <p className="type-meta mt-10 text-muted-dark lg:absolute lg:bottom-20 lg:right-16 lg:mt-0 lg:text-right">
            {campaign.caption}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
