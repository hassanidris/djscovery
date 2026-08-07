import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { Heart, MessageCircle, Music2 } from "lucide-react";
import AddPost from "./AddPost";

/*
  WHY a server wrapper instead of modifying AddPost directly:
  AddPost is a "use client" component — it can't query the DB.
  This wrapper runs on the server, checks the DJ role, and decides
  which UI to render before the client bundle even loads.

  ROLE LOGIC:
  - Not logged in    → AddPost renders its own "Sign Up" prompt
  - Logged in as DJ  → AddPost renders the full compose form
  - Logged in as Fan → show a clear, friendly explanation card
                       (fans can like, comment, and reply — just not post)

  WHY fans can't post:
  DJcovery is a platform where DJs are the content creators.
  Letting everyone post would dilute the feed and make it a generic
  social network. Fans engage through reactions, which still keeps
  them active and connected without blurring that distinction.
*/

const AddPostWrapper = async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const userId = authUser?.id;

  // Not logged in — AddPost handles the sign-up prompt itself
  if (!userId) return <AddPost />;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      image: true,
      roles: { where: { role: Role.DJ }, select: { role: true } },
      djProfile: { select: { avatar: true, stageName: true } },
    },
  });

  const avatarUrl = dbUser?.djProfile?.avatar ?? dbUser?.image ?? null;
  const displayName = dbUser?.djProfile?.stageName ?? dbUser?.username ?? null;

  // DJ — show the full compose form
  if (dbUser?.roles.length)
    return <AddPost avatarUrl={avatarUrl} displayName={displayName} />;

  // Fan (logged in, not a DJ) — show engagement info card
  return (
    <div className="bg-h_blackLight/50 flex items-center gap-4 rounded-lg border border-gray-800/60 p-4 shadow-md">
      {/* Icons hint at what fans CAN do */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="bg-h_red/10 border-h_red/20 flex h-9 w-9 items-center justify-center rounded-xl border">
          <Music2 className="text-h_redLight h-4 w-4" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-h_white text-sm font-medium">Only DJs can post</p>
        <p className="mt-0.5 text-xs text-gray-400">
          You can{" "}
          <span className="inline-flex items-center gap-1 text-gray-300">
            <Heart className="text-h_redLight h-3 w-3" /> like
          </span>
          ,{" "}
          <span className="inline-flex items-center gap-1 text-gray-300">
            <MessageCircle className="h-3 w-3 text-blue-400" /> comment
          </span>{" "}
          and reply to any post.
        </p>
      </div>
    </div>
  );
};

export default AddPostWrapper;
