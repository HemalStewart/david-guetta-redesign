import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Award } from "@/lib/content/types";

/**
 * Recognition (an addition to the brief's homepage rhythm, sitting between the
 * performance feature and the store).
 *
 * Deliberately built as a quiet ruled list — year, body, category — in the same
 * language as the live dates, rather than a row of trophy badges or oversized
 * counts. `design.md` §5 rules out "fake metrics" and "trusted by" strips, and
 * a wall of numerals is how an awards section turns into one.
 *
 * Nothing is summarised into a total. The DJ Mag line states the actual years
 * rather than "5× number one", so a reader can check it.
 */
export function Recognition({ awards, djMagYears }: { awards: Award[]; djMagYears: number[] }) {
  if (awards.length === 0 && djMagYears.length === 0) return null;

  return (
    <section aria-labelledby="recognition-heading" className="border-t border-rule-dark bg-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="scroll-in grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionLabel index="05" label="Recognition" />
            <h2
              id="recognition-heading"
              className="type-display mt-4 text-5xl leading-[0.92] md:text-6xl lg:text-[4.5rem]"
            >
              Selected wins.
            </h2>

            {djMagYears.length > 0 ? (
              <div className="mt-8 border-t border-rule-dark pt-6">
                <p className="type-meta text-muted-dark">DJ Mag Top 100 — number one</p>
                <p className="type-display tabular mt-2 text-3xl leading-none md:text-4xl">
                  {djMagYears.join("  ")}
                </p>
              </div>
            ) : null}

            <p className="mt-8 max-w-prose text-sm text-muted-dark">
              A selection of competitive wins, not a complete list, and nominations are not included. Compiled from a
              public reference and awaiting confirmation by management.
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ul className="border-t border-rule-dark">
              {awards.map((award) => (
                <li key={award.id} className="border-b border-rule-dark">
                  <article className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-5 md:gap-x-8">
                    <p className="type-display tabular text-2xl leading-none text-signal md:text-[1.75rem]">
                      {award.year}
                    </p>
                    <div>
                      <h3 className="type-display text-xl leading-[1.05] md:text-2xl">{award.organisation}</h3>
                      <p className="mt-1 text-sm text-muted-dark">
                        {award.category}
                        {award.work ? <span> — {award.work}</span> : null}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
