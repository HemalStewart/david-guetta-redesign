import { FeaturedRelease } from "@/components/sections/FeaturedRelease";
import { Hero } from "@/components/sections/Hero";
import { LivePreview } from "@/components/sections/LivePreview";
import { NextShow } from "@/components/sections/NextShow";
import { PerformanceFeature } from "@/components/sections/PerformanceFeature";
import { Updates } from "@/components/sections/Updates";
import {
  getCampaign,
  getFeaturedRelease,
  getFeaturedVideo,
  getNextEvent,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/content";
import { isNewsletterConfigured } from "@/lib/newsletter";

/**
 * Homepage rhythm (design.md §7):
 * dark concert hero → quiet next-show strip → warm-white music feature →
 * dark live listing → large performance image → warm-white invitation → footer.
 *
 * Rendered per request so the next show and the upcoming list are never a
 * stale build artefact.
 */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const now = new Date();
  const settings = getSiteSettings();

  return (
    <>
      <Hero campaign={getCampaign()} />
      <NextShow result={getNextEvent(now)} />
      <FeaturedRelease release={getFeaturedRelease()} />
      <LivePreview result={getUpcomingEvents(now)} settings={settings} />
      <PerformanceFeature video={getFeaturedVideo()} settings={settings} />
      <Updates configured={isNewsletterConfigured()} />
    </>
  );
}
