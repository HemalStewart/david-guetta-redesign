"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60svh] flex-col justify-center pb-24 pt-16">
      <p className="type-meta text-signal">Something went wrong</p>
      <h1 className="type-display mt-4 text-[clamp(2.5rem,9vw,6rem)] leading-[0.9]">This page didn&rsquo;t load</h1>
      <p className="mt-6 max-w-prose text-base text-muted-dark md:text-lg">
        The page failed to render. This is a problem on our side, not a sign that content is missing.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="on-signal inline-flex min-h-12 items-center justify-center rounded-[2px] bg-signal px-5 py-3 text-sm uppercase tracking-wide text-ink hover:bg-signal-hover"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="outline-dark">
          Home
        </ButtonLink>
      </div>
    </Container>
  );
}
