import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { CircleCheck } from "lucide-react";
import { DjUser } from "@/lib/data";

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
}: DjUser) => {
  const profileHref = slug ? `/djs/${slug}` : `/profile/${username}`;
  const genreList = genres
    ? genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3 hover:ring-1 hover:ring-h_red transition-all relative">
      {isFeatured && (
        <span className="absolute top-3 right-3 bg-h_red text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          ✦ FEATURED
        </span>
      )}

      <Link href={profileHref} className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Image
            src={avatar || "/noAvatar.png"}
            alt={stageName || username}
            width={56}
            height={56}
            className="w-14 h-14 object-cover rounded-full ring-2 ring-h_red"
          />
          {isPremium && (
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon
                icon={faCrown}
                className="h-2.5 w-2.5 text-black"
              />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-h_white font-semibold text-sm truncate">
              {stageName || username}
            </h3>
            {verified && (
              <CircleCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            )}
          </div>
          {(city || country) && (
            <p className="text-gray-400 text-xs truncate">
              {[city, country].filter(Boolean).join(", ")}
            </p>
          )}
          {_count !== undefined && (
            <p className="text-gray-500 text-xs">
              {_count.followers.toLocaleString()} followers
            </p>
          )}
        </div>
      </Link>

      {genreList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genreList.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="text-xs bg-h_redDark/60 text-red-200 px-2 py-0.5 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      <Link
        href={profileHref}
        className="mt-auto bg-h_red hover:bg-h_redDark text-white text-xs px-3 py-1.5 rounded-md w-full transition-colors text-center"
      >
        View Profile
      </Link>
    </div>
  );
};

export default DjCard;
