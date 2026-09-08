import type { SiteSettings } from "@/lib/content/types";

/**
 * Site settings — concept fixture.
 *
 * Destinations marked "verified" were opened from davidguetta.com on
 * 8 September 2026 and resolved. Re-verify before launch (see
 * docs/LAUNCH-CHECKLIST.md); artist links move.
 */
export const siteSettings: SiteSettings = {
  artistName: "David Guetta",
  // No approved vector wordmark supplied — the header uses set type instead.
  wordmark: { light: null, dark: null },
  tagline: "Music. Live. Worldwide.",
  nav: [
    { label: "Live", href: "/live" },
    { label: "Music", href: "/music" },
    { label: "Watch", href: "/watch" },
    { label: "Updates", href: "/#updates" },
    // Shop is added here only once an official store URL is confirmed.
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com/davidguetta/" },
    { label: "YouTube", href: "https://youtube.com/davidguetta" },
    { label: "Facebook", href: "https://facebook.com/davidguetta" },
    { label: "X", href: "https://twitter.com/DavidGuetta" },
  ],
  contacts: [
    { role: "Management", href: null, note: "Approved destination required from the client." },
    { role: "Press", href: null, note: "Approved destination required from the client." },
    { role: "Booking", href: null, note: "Approved destination required from the client." },
  ],
  pressKitUrl: null,
  // Radio Show / podcast route preserved from the current site.
  radioUrl: "https://davidguetta.lnk.to/podcast",
  // No official store confirmed — the Shop module stays out of the build.
  storeUrl: null,
  eventsProviderUrl: "https://www.bandsintown.com/a/26317-david-guetta",
  // Observed on the current footer as "What A Music", but not owner-confirmed.
  copyright: null,
  demoMode: true,
};
