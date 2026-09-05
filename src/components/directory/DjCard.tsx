import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { DjUser } from "@/lib/data";
import SaveDjButton from "@/components/dj-profile/FollowDjButton";
import { ReputationBadge } from "@/components/dj-profile/ReputationBadge";
import { GenreBadge } from "@/components/forms/GenreBadge";
import { formatNumber } from "@/lib/utils/currency";
import { useMemo } from "react";
import React from "react";

const DjCard = ({
  username,
  stageName,
  avatar,
  genres,
  country,
  city,
  slug,
  isPremium,
  isFeatured,
  status,
  _count,
  djProfileId,
  isFollowed = false,
  reputationScore = 0,
  gigReviews = [],
  eventReviews = [],
  ratings = [],
}: DjUser & { isFollowed?: boolean }) => {
  const profileHref = slug ? `/djs/${slug}` : `/profile/${username}`;

  const genreList = useMemo(() => {
    return genres
      ? genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];
  }, [genres]);

  const formattedName = useMemo(() => {
    const normalized = (stageName || username).trim();
    return /^[Dd][Jj]\.?\s/i.test(normalized)
      ? normalized
      : `Dj. ${normalized}`;
  }, [stageName, username]);

  return (
    <div
      className="bg-h_blackLight/50 hover:ring-h_red hover:shadow-h_red/5 group relative flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 hover:ring-1"
      style={{ padding: "var(--space-4)", gap: "var(--space-3)" }}
    >
      {djProfileId !== undefined && (
        <div
          className="absolute top-3 right-3 z-10"
          style={{ top: "var(--space-3)", right: "var(--space-3)" }}
        >
          <SaveDjButton
            djProfileId={djProfileId}
            isFollowed={isFollowed}
            compact
          />
        </div>
      )}
      <Link
        href={profileHref}
        className="focus-visible:ring-h_red flex items-center gap-3 outline-none focus-visible:rounded-lg focus-visible:ring-2"
      >
        <div className="relative shrink-0">
          <Image
            src={avatar || "/noAvatar.png"}
            alt={stageName || username}
            width={56}
            height={56}
            className="ring-h_red h-14 w-14 rounded-full object-cover ring-2"
          />
          {isPremium && (
            <div className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-black bg-amber-400">
              <Crown className="h-2.5 w-2.5 text-black" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div
            className="flex items-center gap-1.5"
            style={{ gap: "var(--space-1)" }}
          >
            <h3 className="text-h_white truncate text-sm font-semibold">
              {formattedName}
            </h3>
            {status === "APPROVED" && (
              <span title="Admin approved">
                <CircleCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              </span>
            )}
          </div>
          {(city || country) && (
            <p className="truncate text-xs text-gray-400">
              {[city, country].filter(Boolean).join(", ")}
            </p>
          )}
          <div
            className="mt-1 flex items-center gap-2"
            style={{ marginTop: "var(--space-1)", gap: "var(--space-2)" }}
          >
            <ReputationBadge
              score={reputationScore}
              variant="subtle"
              showScore={false}
              className="px-2 py-0.5 text-xs"
            />
          </div>
        </div>
      </Link>

      {genreList.length > 0 && (
        <div
          className="mt-1 flex flex-wrap gap-1"
          style={{ marginTop: "var(--space-1)", gap: "var(--space-1)" }}
        >
          {genreList.slice(0, 2).map((genre) => (
            <GenreBadge key={genre} variant="red">
              {genre}
            </GenreBadge>
          ))}
          {genreList.length > 2 && (
            <GenreBadge variant="red">
              {"+" + (genreList.length - 2)}
            </GenreBadge>
          )}
        </div>
      )}

      <div
        className="my-2 border-t border-gray-700/50"
        style={{ margin: "var(--space-2) 0" }}
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          {(() => {
            const total =
              gigReviews.length + eventReviews.length + ratings.length;
            if (total === 0) return "New";
            return `${total} review${total === 1 ? "" : "s"}`;
          })()}
        </span>
        {_count !== undefined && (
          <span className="text-xs text-gray-400">
            {formatNumber(_count.followers)} follower
            {_count.followers === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
};

function areDjCardPropsEqual(
  prevProps: DjUser & { isFollowed?: boolean },
  nextProps: DjUser & { isFollowed?: boolean },
): boolean {
  return (
    prevProps.username === nextProps.username &&
    prevProps.stageName === nextProps.stageName &&
    prevProps.avatar === nextProps.avatar &&
    prevProps.genres === nextProps.genres &&
    prevProps.country === nextProps.country &&
    prevProps.city === nextProps.city &&
    prevProps.slug === nextProps.slug &&
    prevProps.isPremium === nextProps.isPremium &&
    prevProps.isFeatured === nextProps.isFeatured &&
    prevProps.status === nextProps.status &&
    prevProps.djProfileId === nextProps.djProfileId &&
    prevProps.isFollowed === nextProps.isFollowed &&
    prevProps.reputationScore === nextProps.reputationScore &&
    prevProps._count?.followers === nextProps._count?.followers &&
    (prevProps.gigReviews?.length ?? 0) ===
      (nextProps.gigReviews?.length ?? 0) &&
    (prevProps.eventReviews?.length ?? 0) ===
      (nextProps.eventReviews?.length ?? 0) &&
    (prevProps.ratings?.length ?? 0) === (nextProps.ratings?.length ?? 0)
  );
}

export default React.memo(DjCard, areDjCardPropsEqual);
