import Image from "next/image";
import Link from "next/link";
import { DjUser } from "@/lib/data";

const DjCard = ({
  username,
  stageName,
  avatar,
  genres,
  country,
  city,
  slug,
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
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3 hover:ring-1 hover:ring-h_red transition-all">
      <Link href={profileHref} className="flex items-center gap-3">
        <Image
          src={avatar || "/noAvatar.png"}
          alt={stageName || username}
          width={56}
          height={56}
          className="w-14 h-14 object-cover rounded-full ring-2 ring-h_red shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-h_white font-semibold text-sm truncate">
            {stageName || username}
          </h3>
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

      <button className="mt-auto bg-h_red hover:bg-h_redDark text-white text-xs px-3 py-1.5 rounded-md w-full transition-colors cursor-pointer">
        Follow
      </button>
    </div>
  );
};

export default DjCard;
