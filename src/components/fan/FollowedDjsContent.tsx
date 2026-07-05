import Link from "next/link";
import { Users } from "lucide-react";
import { getFollowedDjs } from "@/lib/actions/follows";
import FollowedDjListItem from "./FollowedDjListItem";

export default async function FollowedDjsContent() {
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
        <FollowedDjListItem key={dj.id} dj={dj} />
      ))}
    </div>
  );
}
