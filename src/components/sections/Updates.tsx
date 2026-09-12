import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Updates (design.md §7H). A single in-page invitation — never a pop-up.
 * `configured` is resolved on the server so the provider key never reaches the
 * browser; only the boolean does.
 */
export function Updates({ configured }: { configured: boolean }) {
  return (
    <section id="updates" aria-labelledby="updates-heading" className="on-paper scroll-mt-24 bg-paper text-ink">
      <Container className="py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          <h2 id="updates-heading" className="type-display text-5xl leading-[0.92] md:text-7xl lg:text-8xl">
            Be there for what&rsquo;s next.
          </h2>
          <p className="mt-6 max-w-prose text-lg text-muted-light md:text-xl">
            New music, show announcements and tour news — first, and direct.
          </p>
          <NewsletterForm configured={configured} />
        </div>
      </Container>
    </section>
  );
}
