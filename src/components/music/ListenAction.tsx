import { ButtonLink, UnavailableAction, type ButtonVariant } from "@/components/ui/ButtonLink";
import type { Release } from "@/lib/content/types";

/**
 * One listening journey for the whole site.
 *
 * A verified smart link is preferred and makes a platform chooser unnecessary.
 * Where only individual platform links exist, they are listed. Where neither
 * has been supplied, the control says so rather than pretending.
 */
export function ListenAction({
  release,
  variant = "primary",
  tone = "light",
}: {
  release: Release;
  variant?: ButtonVariant;
  tone?: "dark" | "light";
}) {
  const context = `${release.title} by ${release.artists.join(", ")}`;

  if (release.smartLink) {
    return (
      <ButtonLink href={release.smartLink} variant={variant} ariaLabel={`Listen to ${context}`}>
        Listen now
      </ButtonLink>
    );
  }

  if (release.platforms.length > 0) {
    return (
      <ul className="flex flex-wrap gap-3">
        {release.platforms.map((platform) => (
          <li key={platform.platform}>
            <ButtonLink
              href={platform.href}
              variant={tone === "light" ? "outline-light" : "outline-dark"}
              ariaLabel={`Listen to ${context} on ${platform.platform}`}
            >
              {platform.platform}
            </ButtonLink>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <UnavailableAction tone={tone} reason={`No verified listening link has been supplied for ${context}.`}>
      Listening link pending
    </UnavailableAction>
  );
}
