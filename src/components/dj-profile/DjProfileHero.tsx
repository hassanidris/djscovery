import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MapPin,
  Users,
  CalendarDays,
  UserPlus,
  Star,
  Crown,
  CircleCheck,
  Pencil,
  Zap,
  Handshake,
  Eye,
} from "lucide-react";
import { SOCIAL_ICONS } from "./dj-profile-shared";
import { ReputationBadge } from "./ReputationBadge";
import { ScoreBreakdown } from "./ScoreBreakdown";
import SaveDjButton from "./SaveDjButton";
import { ShareButton } from "./ShareButton";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";

type HeroVariant = "free" | "premium";

type Props = {
  djData: DjDemoData;
  viewMode: ViewMode;
  isFollowed?: boolean;
  djUserId?: string;
  isFollowing?: boolean;
  reputationScore?: number;
  reputationDetail?: {
    totalScore: number;
    profileQualityScore: number;
    verificationScore: number;
    reviewScore: number;
    reliabilityScore: number;
    activityScore: number;
    newTalentBoost: number;
  } | null;
  status?: string;
  variant?: HeroVariant;
};

export { DjProfileHero };

function DjProfileHero({
  djData,
  viewMode,
  isFollowed = false,
  reputationScore,
  reputationDetail,
  status,
  variant = "free",
}: Props) {
  const isPremium = variant === "premium";
  const isOwner = viewMode === "dj-owner";
  const editHref = djData?.slug ? `/djs/${djData.slug}/edit` : "#";

  const DJ = {
    stageName: djData.stageName,
    avatar: djData.avatar.url,
    coverImage: djData.coverImage.url,
    city: djData.location.city,
    country: djData.location.country,
    genres: djData.genres,
    socialLinks: Object.entries(djData.socials).map(([platform, url]) => ({
      platform,
      url,
    })),
    followerCount: djData.stats.followers,
    avgRating: djData.stats.rating,
    ratingCount: djData.stats.reviews,
    eventsCount: djData.stats.events,
    responseRate: djData.stats.responseRate,
    bookingSuccessRate: djData.stats.bookingRate,
    profileViews: djData.analytics.profileViews.value,
  };

  const djProfileId = parseInt(djData.id);

  return (
    <section className="w-full">
      {/* Cover Image */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isPremium ? "h-72 md:h-105" : "h-64 md:h-96",
        )}
      >
        <Image
          src={DJ.coverImage}
          alt={`Cover photo for DJ ${DJ.stageName}`}
          fill
          className="object-cover"
          priority
        />
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-t",
            isPremium
              ? "from-black via-black/50 to-black/10"
              : "from-black via-black/40 to-transparent",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-r to-transparent",
            isPremium ? "from-h_red/10" : "from-h_red/8",
          )}
        />
        {isPremium && (
          <div className="absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-black to-transparent" />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div
          className={cn(
            "relative z-10 -mt-16 flex flex-col gap-4 pb-5 sm:-mt-14 sm:flex-row sm:items-end",
            isPremium && "-mt-20",
          )}
        >
          {/* Avatar */}
          <div className="relative z-10 shrink-0">
            <div
              className={cn(
                "overflow-hidden rounded-full ring-4 ring-offset-2 ring-offset-black",
                isPremium
                  ? "h-32 w-32 ring-amber-400 sm:h-36 sm:w-36"
                  : "ring-h_red h-28 w-28 sm:h-32 sm:w-32",
              )}
            >
              <Image
                src={DJ.avatar}
                alt={DJ.stageName}
                width={isPremium ? 144 : 128}
                height={isPremium ? 144 : 128}
                className="h-full w-full object-cover"
              />
            </div>
            {isPremium && (
              <div className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-black bg-amber-400">
                <Crown className="h-3.5 w-3.5 text-black" />
              </div>
            )}
          </div>

          {/* Name & Meta */}
          <div className="min-w-0 flex-1 pt-1 sm:pb-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <h1 className="font-heading z-10 text-2xl font-bold tracking-tight text-white md:text-4xl">
                Dj. {DJ.stageName}
              </h1>
              {isPremium && (
                <div className="flex items-center gap-1.5">
                  {status === "APPROVED" && (
                    <Badge className="h-5.5 border-blue-500/25 bg-blue-500/15 text-xs text-blue-400">
                      <CircleCheck className="mr-1 h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  )}
                  <Badge className="h-5.5 border-amber-500/25 bg-amber-500/15 text-xs text-amber-400">
                    <Crown className="mr-1 h-2.5 w-2.5" />
                    Premium
                  </Badge>
                </div>
              )}
              {reputationScore !== undefined && (
                <ReputationBadge
                  score={reputationScore}
                  variant="subtle"
                  showScore={false}
                  className="flex h-5.5 items-center px-2.5 py-0 text-xs font-semibold"
                />
              )}
            </div>

            {/* Location directly under the name */}
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="text-h_red h-3 w-3" /> {DJ.city}, {DJ.country}
            </p>

            {isOwner && reputationDetail && (
              <div className="mt-3">
                <ScoreBreakdown reputationDetail={reputationDetail} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:pb-2">
            {isOwner && djData?.slug ? (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                asChild
              >
                <Link href={editHref}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit Profile
                </Link>
              </Button>
            ) : (
              <>
                {viewMode === "fan" && !isNaN(djProfileId) ? (
                  <SaveDjButton
                    djProfileId={djProfileId}
                    isFollowed={isFollowed}
                  />
                ) : viewMode === "fan" ? (
                  <Button
                    variant="outline"
                    className="border-white/20 text-gray-300 hover:bg-white/5"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Follow
                  </Button>
                ) : null}
              </>
            )}
            <ShareButton />
          </div>
        </div>

        {/* Genres */}
        <div className="mb-4 flex flex-wrap gap-2">
          {DJ.genres.map((g) => (
            <Badge
              key={g}
              className="bg-h_redDark/50 h-6 border-0 text-red-100"
            >
              {g}
            </Badge>
          ))}
        </div>

        {/* Social Links */}
        <div className="mb-6 flex items-center gap-2">
          {DJ.socialLinks.map((l) => {
            const icon = SOCIAL_ICONS[l.platform];
            if (!icon) return null;
            return (
              <a
                key={l.platform}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${l.platform} profile for ${DJ.stageName}`}
                className="focus-visible:ring-h_red flex size-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
              </a>
            );
          })}
        </div>

        <Separator className="bg-white/10" />

        {/* Stats Bar - Free: 3 metrics, Premium: 6 metrics */}
        <DjProfileStats dj={DJ} variant={variant} />

        <Separator className="bg-white/10" />
      </div>
    </section>
  );
}

// Helper component for stats bar
function DjProfileStats({
  dj,
  variant,
}: {
  dj: {
    followerCount: number;
    avgRating: number;
    ratingCount: number;
    eventsCount: number;
    responseRate: number;
    bookingSuccessRate: number;
    profileViews: number;
  };
  variant: HeroVariant;
}) {
  const isPremium = variant === "premium";

  const metrics = isPremium
    ? [
        {
          val: formatNumber(dj.followerCount),
          label: "Followers",
          icon: Users,
        },
        {
          val: dj.avgRating.toFixed(1),
          label: `${dj.ratingCount} reviews`,
          icon: Star,
          amber: true,
        },
        {
          val: dj.eventsCount.toString(),
          label: "Events",
          icon: CalendarDays,
        },
        {
          val: `${dj.responseRate}%`,
          label: "Response Rate",
          icon: Zap,
          green: true,
        },
        {
          val: `${dj.bookingSuccessRate}%`,
          label: "Booking Rate",
          icon: Handshake,
          green: true,
        },
        {
          val: formatNumber(dj.profileViews),
          label: "Monthly Views",
          icon: Eye,
        },
      ]
    : [
        {
          val: formatNumber(dj.followerCount),
          label: "Followers",
          icon: Users,
        },
        {
          val: dj.avgRating.toFixed(1),
          label: `${dj.ratingCount} reviews`,
          icon: Star,
        },
        {
          val: dj.eventsCount.toString(),
          label: "Events",
          icon: CalendarDays,
        },
      ];

  return (
    <dl
      className={cn(
        "py-5",
        isPremium
          ? "grid grid-cols-3 divide-x divide-white/10 md:grid-cols-6"
          : "grid grid-cols-3",
      )}
    >
      {metrics.map((s, i) => {
        const SIcon = s.icon;
        return (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center",
              !isPremium && i < 2 && "border-r border-white/10",
            )}
          >
            <dd
              className={cn(
                "font-bold text-white",
                isPremium ? "text-xl md:text-2xl" : "text-2xl",
              )}
            >
              {s.val}
            </dd>
            <dt
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                s.amber
                  ? "text-amber-400"
                  : s.green
                    ? "text-emerald-400"
                    : "text-gray-500",
              )}
            >
              <SIcon
                className={cn(
                  isPremium ? "h-2.5 w-2.5" : "h-3 w-3",
                  i === 1 && !isPremium && "text-amber-400",
                )}
                aria-hidden="true"
              />
              {s.label}
            </dt>
          </div>
        );
      })}
    </dl>
  );
}
