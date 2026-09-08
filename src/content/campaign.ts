import type { Campaign } from "@/lib/content/types";

/**
 * The active hero campaign. Exactly one is live at a time.
 *
 * Swapping in a release-led campaign means editing this object only: the
 * title, copy, media and primary action all move together without touching
 * the page layout.
 */
export const activeCampaign: Campaign = {
  id: "campaign-identity",
  titleLines: ["David", "Guetta"],
  supportingCopy: "Music. Live. Worldwide.",
  // No approved photography supplied. The UI renders original abstract
  // stage-light artwork at the specified crop ratios instead.
  image: null,
  mobileImage: null,
  placeholder: "stage",
  video: null,
  primaryAction: { label: "View shows", href: "/live" },
  secondaryAction: { label: "Explore music", href: "/music" },
  caption: "Placeholder artwork — approved stage photography required",
  approval: "demo",
};
