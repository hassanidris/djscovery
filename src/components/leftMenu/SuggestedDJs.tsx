import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { ALL_DEMO_DJS } from "@/data/djs";
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

  let suggested: any[] = [];

  if (userId) {
    suggested = await prisma.user.findMany({
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
  }

  const cardHeader = (
    <CardHeader className="border-b border-gray-800 px-4 pt-4 pb-3">
      <CardTitle className="text-h_white flex items-center gap-2 text-sm font-semibold">
        <UserSearch className="text-h_redLight h-4 w-4" />
        Suggested DJs
      </CardTitle>
    </CardHeader>
  );

  if (!suggested.length) {
    const demoSuggestions = ALL_DEMO_DJS.slice(0, 4);
    return (
      <Card className="bg-h_blackLight/50 gap-0 border-gray-800 py-0 shadow-md ring-0">
        {cardHeader}
        <CardContent className="flex flex-col gap-0 px-4 py-3">
          {demoSuggestions.map((dj, index) => (
            <div key={dj.slug}>
              <div className="flex items-center gap-3 py-2.5">
                <Link href={`/djs/${dj.slug}`} className="shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={dj.avatar.url} alt={dj.stageName} />
                    <AvatarFallback className="bg-gray-700 text-xs font-semibold text-gray-200">
                      {dj.stageName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/djs/${dj.slug}`}>
                    <p className="text-h_white truncate text-sm font-medium hover:underline">
                      Dj. {dj.stageName}
                    </p>
                  </Link>
                  {dj.genres[0] && (
                    <Badge className="mt-0.5 border border-gray-700 bg-gray-800 px-1.5 py-0 text-[11px] text-gray-400">
                      {dj.genres[0]}
                    </Badge>
                  )}
                </div>
                <Link
                  href={`/djs/${dj.slug}`}
                  className="bg-h_red/10 text-h_redLight border-h_red/20 hover:bg-h_red/20 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
                >
                  View
                </Link>
              </div>
              {index < demoSuggestions.length - 1 && (
                <Separator className="bg-gray-800/60" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-h_blackLight/50 gap-0 border-gray-800 py-0 shadow-md ring-0">
      {cardHeader}
      <CardContent className="flex flex-col gap-0 px-4 py-3">
        {suggested.map((dj, index) => {
          const displayName = dj.djProfile?.stageName ?? dj.username;
          const genre = dj.djProfile?.genres?.[0]?.genre?.name;

          return (
            <div key={dj.id}>
              <div className="flex items-center gap-3 py-2.5">
                <Link href={`/profile/${dj.username}`} className="shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={dj.image ?? ""} alt={displayName} />
                    <AvatarFallback className="bg-gray-700 text-xs font-semibold text-gray-200">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${dj.username}`}>
                    <p className="text-h_white truncate text-sm font-medium hover:underline">
                      Dj. {displayName}
                    </p>
                  </Link>
                  {genre && (
                    <Badge className="mt-0.5 border border-gray-700 bg-gray-800 px-1.5 py-0 text-[11px] text-gray-400">
                      {genre}
                    </Badge>
                  )}
                </div>
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
