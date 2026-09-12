import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Award } from "@/lib/content/types";

/**
 * Recognition — a wall of award plates rather than a list.
 *
 * The awarding bodies' emblems are registered trademarks, so none are sourced
 * here. Each plate is built to carry the weight on its own — a very large year,
 * the body set in the display face, the category beneath — and to take an
 * official emblem in the corner the moment the client supplies one.
 *
 * Two rules that survive from the first version: wins only, no nominations;
 * and no derived totals. The DJ Mag block states the actual years, so a reader
 * can check it, rather than claiming "five times number one".
 */
function AwardPlate({ award }: { award: Award }) {
  return (
    <li className="group relative flex min-h-52 flex-col justify-between border border-rule-dark bg-ink-raised p-6 transition-colors duration-200 hover:border-signal md:min-h-56 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="type-display tabular text-4xl leading-none text-signal md:text-5xl">{award.year}</p>
        {award.logo ? (
          <Image
            src={award.logo.src}
            alt={award.logo.alt}
            width={award.logo.width}
            height={award.logo.height}
            className="h-8 w-auto opacity-70 md:h-9"
          />
        ) : null}
      </div>

      <div>
        <h3 className="type-display text-xl leading-[1.02] md:text-2xl">{award.organisation}</h3>
        <p className="mt-2 text-sm text-muted-dark">{award.category}</p>
        {award.work ? <p className="mt-1 text-sm text-muted-dark/80">{award.work}</p> : null}
      </div>
    </li>
  );
}

export function Recognition({ awards, djMagYears }: { awards: Award[]; djMagYears: number[] }) {
  if (awards.length === 0 && djMagYears.length === 0) return null;

  return (
    <section aria-labelledby="recognition-heading" className="border-t border-rule-dark bg-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="scroll-in flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="05" label="Recognition" />
            <h2 id="recognition-heading" className="type-display mt-4 text-5xl leading-[0.92] md:text-6xl lg:text-7xl">
              Selected wins.
            </h2>
          </div>
        </div>

        {djMagYears.length > 0 ? (
          <div className="mt-12 border-y border-rule-dark py-8 md:flex md:items-center md:gap-10 md:py-10">
            <p className="type-meta shrink-0 text-muted-dark md:w-64">DJ Mag Top 100 — number one</p>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3 md:mt-0">
              {djMagYears.map((year) => (
                <li key={year} className="type-display tabular text-4xl leading-none md:text-6xl lg:text-7xl">
                  {year}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((award) => (
            <AwardPlate key={award.id} award={award} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
