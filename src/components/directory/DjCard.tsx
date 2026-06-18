import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { CircleCheck } from "lucide-react";
import { DjUser } from "@/lib/data";
import SaveDjButton from "@/components/dj-profile/SaveDjButton";
import { formatNumber } from "@/lib/utils/currency";

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
  verified,
  _count,
  djProfileId,
  isSaved = false,
}: DjUser & { isSaved?: boolean }) => {
  const profileHref = slug ? `/djs/${slug}` : `/profile/${username}`;
  const genreList = genres
    ? genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  const formatDjName = (name: string) => {
    const normalized = name.trim();
    return /^[Dd][Jj]\.?\s/i.test(normalized)
      ? normalized
      : `Dj. ${normalized}`;
  };

  return (
    <div className="bg-h_blackLight/50 hover:ring-h_red hover:shadow-h_red/5 group relative flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 hover:scale-[1.015] hover:shadow-lg hover:ring-1">
      {djProfileId !== undefined && (
        <div className="absolute top-3 right-3 z-10">
          <SaveDjButton djProfileId={djProfileId} isSaved={isSaved} compact />
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
              <FontAwesomeIcon
                icon={faCrown}
                className="h-2.5 w-2.5 text-black"
              />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-h_white truncate text-sm font-semibold">
              {formatDjName(stageName || username)}
            </h3>
            {verified && (
              <CircleCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            )}
          </div>
          {(city || country) && (
            <p className="truncate text-xs text-gray-400">
              {[city, country].filter(Boolean).join(", ")}
            </p>
          )}
          {_count !== undefined && (
            <p className="text-xs text-gray-500">
              {formatNumber(_count.followers)} followers
            </p>
          )}
        </div>
      </Link>

      {genreList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genreList.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="bg-h_redDark/60 rounded-full px-2 py-0.5 text-xs text-red-200"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      <Link
        href={profileHref}
        className="bg-h_red hover:bg-h_redDark focus-visible:ring-h_red mt-auto w-full cursor-pointer rounded-md px-3 py-1.5 text-center text-xs text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-95"
      >
        View Profile
      </Link>
    </div>
  );
};

export default DjCard;
