import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60svh] flex-col justify-center pb-24 pt-16">
      <p className="type-meta text-signal">404</p>
      <h1 className="type-display mt-4 text-[clamp(3rem,12vw,9rem)] leading-[0.88]">Page not found</h1>
      <p className="mt-6 max-w-prose text-base text-muted-dark md:text-lg">
        That page does not exist. It may have moved, or the link may be out of date.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <ButtonLink href="/live" variant="primary">
          View shows <span aria-hidden="true" className="arrow-shift">→</span>
        </ButtonLink>
        <ButtonLink href="/music" variant="outline-dark">
          Explore music
        </ButtonLink>
        <ButtonLink href="/" variant="quiet-dark" className="sm:ml-4">
          Home
        </ButtonLink>
      </div>
    </Container>
  );
}
