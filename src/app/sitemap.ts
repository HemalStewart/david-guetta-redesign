import type { MetadataRoute } from "next";
import { getReleases } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  const staticRoutes = ["", "/live", "/music", "/watch", "/contact", "/privacy", "/terms"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));

  const releaseRoutes = getReleases().map((release) => ({
    url: `${siteUrl}/music/${release.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...releaseRoutes];
}
