import type { ProductTeaser } from "@/lib/content/types";

/**
 * Products from the official store at https://store.davidguetta.com, read from
 * its public Shopify product feed on 9 September 2026.
 *
 * Prices and availability are shown because they came from the store's own
 * live data, which is the only condition under which `design.md` §7G allows
 * showing them. Nothing about stock levels, scarcity, countdowns or demand is
 * invented, and this site does not handle checkout — every action goes to the
 * store, which owns the transaction.
 *
 * `verifiedAt` is when the feed was read. Prices and stock drift, so the
 * production build should either re-read the feed on a schedule or drop the
 * price line entirely and link to the store — both paths are supported.
 *
 * REAL CONTENT, NOT CLEARED. There is a second live store at
 * davidguettashop.com; the client needs to confirm which one is canonical
 * before this ships. See ASSET-MANIFEST.md.
 */
export const storeProducts: ProductTeaser[] = [
  {
    id: "prod-001",
    title: "VARSITY JACKET",
    image: {
      src: "/assets/store/teddy-collector.png",
      alt: "VARSITY JACKET — official store product photograph",
      width: 1200,
      height: 1200,
      source: "store.davidguetta.com",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    storeUrl: "https://store.davidguetta.com/products/teddy-collector",
    price: "289.00",
    currency: "EUR",
    availability: "in-stock",
    verifiedAt: "2026-09-09",
    approval: "pending-approval",
  },
  {
    id: "prod-002",
    title: "HOODIE ROCK STADIUM",
    image: {
      src: "/assets/store/hoodie-rock-stadium.png",
      alt: "HOODIE ROCK STADIUM — official store product photograph",
      width: 1200,
      height: 1200,
      source: "store.davidguetta.com",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    storeUrl: "https://store.davidguetta.com/products/hoodie-rock-stadium",
    price: "65.00",
    currency: "EUR",
    availability: "in-stock",
    verifiedAt: "2026-09-09",
    approval: "pending-approval",
  },
  {
    id: "prod-003",
    title: "VINYLE « NOTHING BUT THE BEAT »",
    image: {
      src: "/assets/store/double-vinyle-nothing-but-the-beat.png",
      alt: "VINYLE « NOTHING BUT THE BEAT » — official store product photograph",
      width: 1200,
      height: 1200,
      source: "store.davidguetta.com",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    storeUrl: "https://store.davidguetta.com/products/double-vinyle-nothing-but-the-beat",
    price: "23.00",
    currency: "EUR",
    availability: "in-stock",
    verifiedAt: "2026-09-09",
    approval: "pending-approval",
  },
  {
    id: "prod-004",
    title: "CASQUETTE PATCH COULEUR (modèle au choix)",
    image: {
      src: "/assets/store/casquette-patch-couleur-modele-au-choix.png",
      alt: "CASQUETTE PATCH COULEUR (modèle au choix) — official store product photograph",
      width: 1200,
      height: 1200,
      source: "store.davidguetta.com",
      approval: "pending-approval",
    },
    placeholder: "artwork",
    storeUrl: "https://store.davidguetta.com/products/casquette-patch-couleur-modele-au-choix",
    price: "30.00",
    currency: "EUR",
    availability: "in-stock",
    verifiedAt: "2026-09-09",
    approval: "pending-approval",
  },
];
