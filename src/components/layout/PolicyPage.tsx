import { Container } from "@/components/ui/Container";

/**
 * Reading layout for owner-supplied policy copy: ~70 characters per line.
 * Until approved copy exists, the draft status is stated plainly — an
 * unapproved policy blocks public launch.
 */
export function PolicyPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Container className="pb-24 pt-12 md:pt-20">
      <h1 className="type-display text-[clamp(3rem,9vw,6rem)] leading-[0.9]">{title}</h1>

      <div className="mt-8 max-w-[70ch]">
        <p className="type-meta inline-flex items-center rounded-[2px] border border-dashed border-control-dark px-3 py-2 text-muted-dark">
          Draft placeholder — not legal copy
        </p>
        <div className="mt-6 space-y-5 text-base text-muted-dark md:text-lg">
          <p>
            This page is a layout placeholder. The published {title.toLowerCase()} must be supplied and approved by the
            artist&rsquo;s legal representatives before the site goes live.
          </p>
          {children}
          <p>
            Until that copy exists, this route exists so that navigation, footer links and the newsletter consent link
            all resolve to a real page rather than a dead link.
          </p>
        </div>
      </div>
    </Container>
  );
}
