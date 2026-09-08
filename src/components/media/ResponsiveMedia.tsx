import Image from "next/image";
import type { MaybeImage, PlaceholderVariant } from "@/lib/content/types";
import { PlaceholderArt } from "./PlaceholderArt";

type Props = {
  image: MaybeImage;
  /** Used only when `image` is null. */
  placeholder: PlaceholderVariant;
  seed: string;
  /** Tailwind aspect utility, e.g. "aspect-square" or "aspect-[16/9]". */
  aspect: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /**
   * Corner tag shown ONLY when generated artwork stands in for a missing
   * asset. Real imagery is never tagged: its rights status is a site-wide
   * statement, not a badge repeated on every tile.
   */
  placeholderLabel?: string | null;
};

/**
 * One media surface for the whole site.
 *
 * When an approved image exists it goes through next/image with an explicit
 * focal point, so the subject survives every crop. When it does not, original
 * abstract artwork fills the same box at the same ratio — the layout never
 * changes shape when real assets arrive.
 */
export function ResponsiveMedia({
  image,
  placeholder,
  seed,
  aspect,
  sizes,
  priority = false,
  className = "",
  placeholderLabel = "Placeholder artwork",
}: Props) {
  const objectPosition = image?.focal ? `${image.focal.x * 100}% ${image.focal.y * 100}%` : "center";

  return (
    <div className={`relative overflow-hidden bg-ink-raised ${aspect} ${className}`}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
      ) : (
        <PlaceholderArt variant={placeholder} seed={seed} className="absolute inset-0 h-full w-full" />
      )}

      {!image && placeholderLabel ? (
        <span className="type-meta absolute left-0 top-0 bg-ink/85 px-2 py-1 text-[0.625rem] text-muted-dark">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  );
}
