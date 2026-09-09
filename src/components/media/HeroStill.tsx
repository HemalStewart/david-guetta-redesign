import { getImageProps } from "next/image";
import { PlaceholderArt } from "@/components/media/PlaceholderArt";
import type { Campaign } from "@/lib/content/types";

const DESKTOP = "(min-width: 64rem)";

/**
 * The hero still, art-directed with a real <picture>.
 *
 * Two <Image> elements in a `hidden`/`lg:hidden` pair look right but are a
 * waste: the browser fetches both, so every desktop visitor also downloaded the
 * portrait crop meant for phones (measured at 93 KB, requested at w=1920
 * because a display:none element has no layout width to size against).
 *
 * `getImageProps` gives us Next's optimised srcSets while the browser picks
 * exactly one source from the media queries. This is a server component, so
 * none of it reaches the client bundle either.
 */
export function HeroStill({ campaign, cinematic }: { campaign: Campaign; cinematic: boolean }) {
  const desktop = campaign.image;
  const mobile = campaign.mobileImage ?? campaign.image;

  if (!desktop && !mobile) {
    return <PlaceholderArt variant={campaign.placeholder} seed={campaign.id} className="absolute inset-0 h-full w-full" />;
  }

  const common = { quality: 78, priority: true, fill: true as const, alt: "" };
  const desktopProps = desktop
    ? getImageProps({ ...common, src: desktop.src, sizes: "100vw", alt: desktop.alt }).props
    : null;
  const mobileProps = mobile
    ? getImageProps({ ...common, src: mobile.src, sizes: "100vw", alt: mobile.alt }).props
    : null;

  const fallbackProps = desktopProps ?? mobileProps;
  const shown = desktop ?? mobile;
  if (!fallbackProps || !shown) return null;
  const objectPosition = shown.focal ? `${shown.focal.x * 100}% ${shown.focal.y * 100}%` : "center";

  return (
    <picture>
      {desktopProps ? <source media={DESKTOP} srcSet={desktopProps.srcSet} sizes={desktopProps.sizes} /> : null}
      {mobileProps ? (
        <source media={`not all and ${DESKTOP}`} srcSet={mobileProps.srcSet} sizes={mobileProps.sizes} />
      ) : null}
      <img
        src={fallbackProps.src}
        alt={shown.alt}
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${cinematic ? "ken-burns" : ""}`}
        style={{ objectPosition }}
      />
    </picture>
  );
}
