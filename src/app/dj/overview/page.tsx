import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Users,
  Handshake,
  BarChart3,
  ArrowUpRight,
  Briefcase,
  Music,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getDjProfileCompleteness } from "@/lib/utils/dj-profile";
import {
  getDjFollowerCount,
  getDjBookingCount,
  getDjMediaStats,
  getDjProfileViews,
} from "@/lib/queries/dj-stats";

export const metadata = { title: "Overview — DJcovery" };

export default async function DjOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    include: {
      djTypes: { select: { type: true } },
      socialLinks: { select: { id: true } },
      media: { select: { id: true, type: true } },
      country: { select: { name: true } },
      city: { select: { name: true } },
    },
  });

  if (!djProfile) redirect("/become-dj");

  const { score, missing } = getDjProfileCompleteness({
    stageName: djProfile.stageName,
    avatar: djProfile.avatar,
    coverImage: djProfile.coverImage,
    bio: djProfile.bio,
    genres: djProfile.djTypes,
    socialLinks: djProfile.socialLinks,
    media: djProfile.media,
    feeMin: djProfile.feeMin,
    feeMax: djProfile.feeMax,
    countryId: djProfile.countryId,
    cityId: djProfile.cityId,
  });

  const [followers, bookings, mediaStats, profileViews] = await Promise.all([
    getDjFollowerCount(djProfile.id),
    getDjBookingCount(djProfile.id),
    getDjMediaStats(djProfile.id),
    getDjProfileViews(djProfile.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        {djProfile.slug && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/djs/${djProfile.slug}`} target="_blank">
              <ArrowUpRight className="h-4 w-4" />
              View Public Profile
            </Link>
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {profileViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{followers.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Profile Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{score}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile completeness */}
      {missing.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">
                  Complete your profile to get more bookings
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-400"
              >
                {score}%
              </Badge>
            </div>

            <Progress
              value={score}
              className="mb-4 h-1.5 bg-white/10 *:data-[slot=progress-indicator]:bg-amber-400"
            />

            <ul className="mb-4 flex flex-col gap-1.5">
              {missing.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="outline" size="sm" asChild>
              <Link href="/dj/settings">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Complete profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {score === 100 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-2 py-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              Your profile is 100% complete — you&apos;re ready to get booked!
            </span>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Media performance */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
          Media Performance
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Total Plays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mediaStats.plays.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mediaStats.views.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Quick actions */}
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="transition-colors hover:border-white/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <SlidersHorizontal className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Edit Profile</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Update your stage name, bio, and photos
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dj/settings">Go →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-white/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Music className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Add Media</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Upload mixes, videos, and press photos
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dj/media">Go →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-white/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Briefcase className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse Gigs</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Find and apply for available gigs
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/gigs">Go →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-colors hover:border-white/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">View Analytics</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Track your profile performance
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dj/analytics">Go →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tips */}
      <Card className="border-white/8 bg-white/3">
        <CardContent className="pt-5">
          <h2 className="mb-3 text-sm font-semibold text-white">
            Tips to grow your profile
          </h2>
          <ul className="flex flex-col gap-2">
            {[
              "Keep your media updated with recent mixes and videos.",
              "Respond quickly to booking inquiries to improve your response rate.",
              "Share your DJcovery profile link on social media to drive traffic.",
              "Add press items and endorsements to build social proof.",
            ].map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="bg-h_red/15 text-h_redLight mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
