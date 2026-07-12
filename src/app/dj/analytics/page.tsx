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
} from "@/lib/queries/dj-stats";

export const metadata = { title: "Analytics — DJcovery" };

export default async function DjAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  });

  if (!djProfile) redirect("/become-dj");

  const days = 30;
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
  ]);

  return (
    <DjAnalyticsDashboard
      slug={djProfile.slug}
      totals={{
        followers,
        bookings,
        profileViews,
        mediaPlays: mediaStats.plays,
        mediaViews: mediaStats.views,
      }}
      viewsOverTime={viewsOverTime}
      followersOverTime={followersOverTime}
      bookingsByStatus={bookingsByStatus}
      topMedia={topMedia}
      sources={sources}
    />
  );
}
