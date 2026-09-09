import { FeaturedRelease } from "@/components/sections/FeaturedRelease";
import { Hero } from "@/components/sections/Hero";
import { LivePreview } from "@/components/sections/LivePreview";
import { MerchFeature } from "@/components/sections/MerchFeature";
import { NextShow } from "@/components/sections/NextShow";
import { PerformanceFeature } from "@/components/sections/PerformanceFeature";
import { Recognition } from "@/components/sections/Recognition";
import { Updates } from "@/components/sections/Updates";
import {
  getAwards,
  getCampaign,
  getDjMagNumberOneYears,
  getFeaturedRelease,
  getFeaturedVideo,
  getNextEvent,
  getProducts,
  getSiteSettings,
  getStoreUrl,
  getUpcomingEvents,
} from "@/lib/content";
import { isNewsletterConfigured } from "@/lib/newsletter";

/**
 * Homepage rhythm (design.md §7, plus the two modules added since):
 *
 *   dark hero
 *   → quiet next-show strip      (dark, raised)
 *   → warm-white music feature   (paper)
 *   → dark live listing          (ink)
 *   → large performance image    (ink)
 *   → store                      (paper)   conditional on a confirmed store
 *   → recognition                (ink)     conditional on approved awards
 *   → warm-white fan invitation  (paper)
 *   → dark footer
 *
 * The dark/warm-white alternation is the point of that ordering: Recognition
 * sits between the store and the sign-up rather than beside the performance
 * feature, so no two warm-white bands ever meet.
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
      <MerchFeature products={getProducts()} storeUrl={getStoreUrl()} />
      <Recognition awards={getAwards()} djMagYears={getDjMagNumberOneYears()} />
      <Updates configured={isNewsletterConfigured()} />
    </>
  );
}
