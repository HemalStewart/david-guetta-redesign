import type { NextConfig } from "next";

/**
 * Redirect map for the legacy site (docs/MIGRATION.md).
 *
 * Only routes whose replacement is unambiguous are redirected here.
 * `/image-gallery/` and `/7-thealbum/` are deliberately NOT redirected: the
 * first needs equivalent archive content or a considered destination, and the
 * second is a campaign page whose replacement is a client decision. Sending
 * them somewhere unrelated would be worse than leaving them to be resolved.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/discography", destination: "/music", permanent: true },
      { source: "/discography/:path*", destination: "/music", permanent: true },
    ];
  },
};

export default nextConfig;
