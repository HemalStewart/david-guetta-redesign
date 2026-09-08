import Link from "next/link";
import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import type { Release } from "@/lib/content/types";
import { formatReleaseDate } from "@/lib/dates";

const TYPE_LABELS: Record<NonNullable<Release["type"]>, string> = {
  album: "Album",
  ep: "EP",
  single: "Single",
  remix: "Remix",
  compilation: "Compilation",
};

export function releaseTypeLabel(type: Release["type"]): string | null {
  return type ? TYPE_LABELS[type] : null;
}

/**
 * Type and year, joined only where they are actually known.
 * Returns null when the client has supplied neither, so the UI can omit the
 * line rather than print "Unknown · Unknown".
 */
export function releaseMetaLine(release: Release): string | null {
  const parts = [releaseTypeLabel(release.type), release.releaseDate?.slice(0, 4) ?? null].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Flat image-and-text composition: no shadow, no border box, no badge stack.
 * The whole card is one link, so there are never competing clickable controls
 * nested inside each other.
 */
export function ReleaseCard({ release, tone = "light" }: { release: Release; tone?: "dark" | "light" }) {
  const muted = tone === "light" ? "text-muted-light" : "text-muted-dark";
  const meta = releaseMetaLine(release);

  return (
    <article>
      <Link href={`/music/${release.slug}`} className="group block">
        <ResponsiveMedia
          image={release.artwork}
          placeholder={release.placeholder}
          seed={release.id}
          aspect="aspect-square"
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
          className="transition-opacity duration-200 group-hover:opacity-90"
        />
        {meta ? <p className={`type-meta tabular mt-4 ${muted}`}>{meta}</p> : null}
        <h3 className={`type-display text-2xl leading-[0.98] group-hover:text-signal md:text-[1.75rem] ${meta ? "mt-2" : "mt-4"}`}>
          {release.title}
        </h3>
        <p className={`mt-1 text-sm ${muted}`}>{release.artists.join(", ")}</p>
        {release.releaseDate ? (
          <span className="sr-only">Released {formatReleaseDate(release.releaseDate)}</span>
        ) : null}
      </Link>
    </article>
  );
}
