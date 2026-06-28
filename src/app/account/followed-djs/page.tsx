import Image from "next/image";
import Link from "next/link";
import { Users, CircleCheck, MapPin } from "lucide-react";
import { getFollowedDjs } from "@/lib/actions/saves";
import UnfollowDjButton from "@/components/account/RemoveSavedDjButton";

export const metadata = { title: "Followed DJs" };

export default async function FollowedDjsPage() {
  const followedDjs = await getFollowedDjs();

  if (followedDjs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Users className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-white">No followed DJs yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Browse the{" "}
          <Link
            href="/directory"
            className="text-white underline underline-offset-2"
          >
            DJ directory
          </Link>{" "}
          and follow DJs you love.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-4 text-sm text-gray-500">
        Following {followedDjs.length} {followedDjs.length === 1 ? "DJ" : "DJs"}
      </p>
      {followedDjs.map((dj) => (
        <div
          key={dj.id}
          className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5"
        >
          <Link href={`/djs/${dj.slug}`} className="relative shrink-0">
            <Image
              src={dj.avatar ?? "/noAvatar.png"}
              alt={dj.stageName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-red-500/60"
            />
            {dj.plan === "PREMIUM" && (
              <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-black bg-amber-400 text-[9px] font-bold text-black">
                ★
              </span>
            )}
          </Link>

          <Link href={`/djs/${dj.slug}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-white">
                {dj.stageName}
              </span>
              {dj.status === "APPROVED" && (
                <CircleCheck
                  className="h-3.5 w-3.5 shrink-0 text-blue-400"
                  aria-label="Admin approved"
                />
              )}
            </div>
            {(dj.city || dj.country) && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
                <MapPin className="h-3 w-3 shrink-0" />
                {[dj.city?.name, dj.country?.name].filter(Boolean).join(", ")}
              </p>
            )}
            {dj.genres.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {dj.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-red-950/60 px-2 py-0.5 text-xs text-red-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </Link>

          <UnfollowDjButton djProfileId={dj.id} />
        </div>
      ))}
    </div>
  );
}
