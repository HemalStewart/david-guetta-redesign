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
  // The official wordmark from davidguetta.com (a 2000x256 PNG, no vector
  // available publicly). Real, but not cleared for republication.
  wordmark: { light: "/assets/brand/wordmark-light.png", dark: "/assets/brand/wordmark-dark.png" },
  tagline: "Music. Live. Worldwide.",
  nav: [
    { label: "Live", href: "/live" },
    { label: "Music", href: "/music" },
    { label: "Watch", href: "/watch" },
    { label: "Updates", href: "/#updates" },
    // Placed after Watch, per design.md §4, now that an official store exists.
    { label: "Shop", href: "https://store.davidguetta.com", external: true },
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
  // Official Shopify store on the artist's own domain (name "DAVID GUETTA",
  // FR, EUR). Note there is a second live store at davidguettashop.com — the
  // client must confirm which is canonical.
  storeUrl: "https://store.davidguetta.com",
  eventsProviderUrl: "https://www.bandsintown.com/a/26317-david-guetta",
  // The artist's own Spotify playlist, linked from the current site's footer.
  spotifyPlaylist: "playlist/1ONoVwmw96EtWKfcdsrVZf",
  // As shown on the current site's own footer. Confirm the exact legal entity
  // and wording with management before launch.
  copyright: "What A Music",
};
