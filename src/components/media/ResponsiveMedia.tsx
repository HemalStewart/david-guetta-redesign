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
  /** Small corner tag naming the asset as a placeholder. */
  label?: string | null;
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
  label = null,
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

      {label ? (
        <span className="type-meta absolute left-0 top-0 bg-ink/85 px-2 py-1 text-[0.625rem] text-muted-dark">
          {label}
        </span>
      ) : null}
    </div>
  );
}
