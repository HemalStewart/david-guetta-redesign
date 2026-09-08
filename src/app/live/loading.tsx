import { Container } from "@/components/ui/Container";

/**
 * Loading state for the live route — the one page that will do real network
 * work once a tour provider is connected. Deliberately quiet: a skeleton of
 * the page rhythm, not a full-screen preloader.
 *
 * It lives here rather than at the app root on purpose: a root loading.tsx
 * makes every route stream, which flushes a 200 before `notFound()` can set
 * the status, so unknown release slugs would answer 200 instead of 404.
 */
export default function Loading() {
  return (
    <Container className="pb-24 pt-16">
      <p className="type-meta text-muted-dark">Loading shows…</p>
      <div aria-hidden="true" className="mt-6 space-y-4">
        <div className="h-24 w-full max-w-2xl bg-ink-raised" />
        <div className="h-4 w-64 bg-ink-raised" />
        <div className="h-4 w-40 bg-ink-raised" />
      </div>
    </Container>
  );
}
