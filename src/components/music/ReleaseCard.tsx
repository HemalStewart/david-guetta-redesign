import Link from "next/link";
import { ResponsiveMedia } from "@/components/media/ResponsiveMedia";
import type { Release } from "@/lib/content/types";
import { formatReleaseDate } from "@/lib/dates";

const TYPE_LABELS: Record<Release["type"], string> = {
  album: "Album",
  ep: "EP",
  single: "Single",
  remix: "Remix",
  compilation: "Compilation",
};

export function releaseTypeLabel(type: Release["type"]): string {
  return TYPE_LABELS[type];
}

/**
 * Flat image-and-text composition: no shadow, no border box, no badge stack.
 * The whole card is one link, so there are never competing clickable controls
 * nested inside each other.
 */
export function ReleaseCard({ release, tone = "light" }: { release: Release; tone?: "dark" | "light" }) {
  const muted = tone === "light" ? "text-muted-light" : "text-muted-dark";

  return (
    <article>
      <Link href={`/music/${release.slug}`} className="group block">
        <ResponsiveMedia
          image={release.artwork}
          placeholder={release.placeholder}
          seed={release.id}
          aspect="aspect-square"
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
          label={release.approval === "demo" ? "Placeholder" : null}
          className="transition-opacity duration-200 group-hover:opacity-90"
        />
        <p className={`type-meta mt-4 ${muted}`}>
          {TYPE_LABELS[release.type]} <span aria-hidden="true">·</span>{" "}
          <span className="tabular">{release.releaseDate.slice(0, 4)}</span>
        </p>
        <h3 className="type-display mt-2 text-2xl leading-[0.98] group-hover:text-signal md:text-[1.75rem]">
          {release.title}
        </h3>
        <p className={`mt-1 text-sm ${muted}`}>{release.artists.join(", ")}</p>
        <span className={`sr-only`}>Released {formatReleaseDate(release.releaseDate)}</span>
      </Link>
    </article>
  );
}
