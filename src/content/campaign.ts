import type { Campaign } from "@/lib/content/types";

/**
 * The active hero campaign. Exactly one is live at a time.
 *
 * Swapping in a release-led campaign means editing this object only: the
 * title, copy, media and primary action all move together without touching
 * the page layout.
 *
 * Photography is from the gallery on davidguetta.com (8 September 2026).
 * REAL CONTENT, NOT CLEARED — see ASSET-MANIFEST.md. It is press portraiture
 * rather than the concert photography the brief calls for, and the desktop
 * master is only 1162 px wide, so a proper high-resolution stage frame is
 * still an outstanding request.
 *
 * The subject sits on the LEFT of this frame with clear space on the right,
 * which is the mirror of the composition the brief sketched. The hero is
 * laid out around the actual image rather than cropping across the face.
 */
export const activeCampaign: Campaign = {
  id: "campaign-identity",
  titleLines: ["David", "Guetta"],
  supportingCopy: "Music. Live. Worldwide.",
  image: {
    src: "/assets/hero/hero-desktop.jpg",
    // Decorative: the H1 immediately beside it already names the artist.
    alt: "",
    width: 1162,
    height: 1200,
    // Keeps the face in frame as the crop widens.
    focal: { x: 0.34, y: 0.12 },
    source: "davidguetta.com/image-gallery (015.jpg)",
    approval: "pending-approval",
  },
  mobileImage: {
    src: "/assets/hero/hero-mobile.jpg",
    alt: "",
    width: 800,
    height: 1200,
    focal: { x: 0.52, y: 0.18 },
    source: "davidguetta.com/image-gallery (011.jpg)",
    approval: "pending-approval",
  },
  placeholder: "stage",
  video: null,
  primaryAction: { label: "View shows", href: "/live" },
  secondaryAction: { label: "Explore music", href: "/music" },
  caption: "Photography from davidguetta.com — not rights-cleared",
  approval: "pending-approval",
};
