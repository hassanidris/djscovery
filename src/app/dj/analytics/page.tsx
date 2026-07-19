import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import DjAnalyticsDashboard from "@/components/dj/DjAnalyticsDashboard";
import {
  getDjFollowerCount,
  getDjBookingCount,
  getDjMediaStats,
  getDjProfileViews,
  getDjProfileViewsOverTime,
  getDjFollowerGrowthOverTime,
  getDjBookingsByStatus,
  getDjTopMedia,
  getDjProfileViewSources,
  getDjResponseRate,
  getDjBookingRate,
  getDjTopCities,
} from "@/lib/queries/dj-stats";
import { normalisePlan, hasFeature } from "@/lib/plan-features";

export const metadata = { title: "Analytics — DJcovery" };

export default async function DjAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true, plan: true },
  });

  if (!djProfile) redirect("/become-dj");

  const plan = normalisePlan(djProfile.plan);
  const hasAdvancedAnalytics = hasFeature(plan, "advancedAnalyticsAccess");
  const days = hasAdvancedAnalytics ? 30 : 7;
  const [
    followers,
    bookings,
    mediaStats,
    profileViews,
    viewsOverTime,
    followersOverTime,
    bookingsByStatus,
    topMedia,
    sources,
    responseRate,
    bookingRate,
    topCities,
  ] = await Promise.all([
    getDjFollowerCount(djProfile.id),
    getDjBookingCount(djProfile.id),
    getDjMediaStats(djProfile.id),
    getDjProfileViews(djProfile.id),
    getDjProfileViewsOverTime(djProfile.id, days),
    getDjFollowerGrowthOverTime(djProfile.id, days),
    getDjBookingsByStatus(djProfile.id),
    getDjTopMedia(djProfile.id, 5),
    getDjProfileViewSources(djProfile.id),
    getDjResponseRate(djProfile.id),
    getDjBookingRate(djProfile.id),
    getDjTopCities(djProfile.id, 5),
  ]);

  return (
    <DjAnalyticsDashboard
      slug={djProfile.slug}
      plan={plan}
      totals={{
        followers,
        bookings,
        profileViews,
        mediaPlays: mediaStats.plays,
        mediaViews: mediaStats.views,
        responseRate,
        bookingRate,
      }}
      viewsOverTime={viewsOverTime}
      followersOverTime={followersOverTime}
      bookingsByStatus={bookingsByStatus}
      topMedia={topMedia}
      sources={sources}
      topCities={topCities}
    />
  );
}
