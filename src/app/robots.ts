import type { MetadataRoute } from "next";

/**
 * The concept preview is not indexable. Flip `allowIndexing` only when the
 * client has approved publication — and remember noindex is not access
 * control; use authentication for a genuinely private preview.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: allowIndexing ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: allowIndexing ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
