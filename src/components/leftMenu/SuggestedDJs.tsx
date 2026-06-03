import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserSearch } from "lucide-react";
import SuggestFollowBtn from "./SuggestFollowBtn";
import Link from "next/link";

/*
  WHY this component adds left-column value:
  The right panel shows platform-wide trending DJs (discovery).
  This shows DJs YOU specifically don't follow yet — a personalised
  nudge to grow your connections, not just browse the platform.
  Different data, different purpose, same platform intent.

  QUERY LOGIC:
  1. Get the current user's ID from Supabase Auth
  2. Get all IDs they already follow
  3. Find up to 4 users with the DJ role who are NOT in that list
  4. Include their DjProfile for the stage name + first genre

  Falls back gracefully:
  - Not logged in → returns null (ProfileCard already shows the sign-in prompt)
  - No suggestions found → returns null (hides the widget)
*/

const SuggestedDJs = async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const userId = authUser?.id;

  // Get IDs of users the current user already follows
  const followingIds = userId
    ? (
        await prisma.follower.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        })
      ).map((f) => f.followingId)
    : [];

  // Not logged in — return null.
  // ProfileCard (above this in LeftMenu) already shows a sign-in
  // prompt. Showing a second one here would create two redundant
  // boxes, as the user reported. No point duplicating it.
  if (!userId) return null;

  // Find DJs not already followed by the current user
  const suggested = await prisma.user.findMany({
    where: {
      roles: { some: { role: Role.DJ } },
      id: { notIn: [...followingIds, userId] },
      deletedAt: null,
    },
    take: 4,
    include: {
      djProfile: {
        select: {
          stageName: true,
          genres: {
            take: 1,
            include: { genre: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!suggested.length) return null;

  return (
    <Card className="bg-h_blackLight/50 border-gray-800 ring-0 shadow-md py-0 gap-0">
      <CardHeader className="px-4 pt-4 pb-3 border-b border-gray-800">
        <CardTitle className="flex items-center gap-2 text-h_white text-sm font-semibold">
          <UserSearch className="w-4 h-4 text-h_red" />
          Suggested DJs
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-3 flex flex-col gap-0">
        {suggested.map((dj, index) => {
          const displayName = dj.djProfile?.stageName ?? dj.username;
          const genre = dj.djProfile?.genres?.[0]?.genre?.name;

          return (
            <div key={dj.id}>
              <div className="flex items-center gap-3 py-2.5">
                {/* Avatar — links to profile */}
                <Link href={`/profile/${dj.username}`} className="shrink-0">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={dj.image ?? ""} alt={displayName} />
                    <AvatarFallback className="bg-gray-700 text-gray-200 text-xs font-semibold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Name + genre */}
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${dj.username}`}>
                    <p className="text-sm text-h_white font-medium truncate hover:underline">
                      {displayName}
                    </p>
                  </Link>
                  {genre && (
                    <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] px-1.5 py-0 mt-0.5">
                      {genre}
                    </Badge>
                  )}
                </div>

                {/* Follow button — isFollowing is always false here
                    because the query explicitly excludes followed users */}
                <SuggestFollowBtn userId={dj.id} isFollowing={false} />
              </div>

              {index < suggested.length - 1 && (
                <Separator className="bg-gray-800/60" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SuggestedDJs;
