import React, { Suspense } from "react";
import ProfileCard from "./ProfileCard";
import SuggestedDJs from "./SuggestedDJs";
import { Skeleton } from "@/components/ui/skeleton";

/*
  WHY only these two widgets:
  - ProfileCard: your identity — avatar, username, follower count,
    quick link to your own profile. Not in the navbar.
  - SuggestedDJs: personalised DJ suggestions based on who you
    don't follow yet — different from the right panel's platform-wide
    trending list. Drives the core discovery loop.

  Everything else that was here (My Posts, Albums, Videos, News,
  Marketplace) linked to "/" with dead routes and described features
  that don't exist in DJscovery. Removed to reduce noise.
*/

const LeftMenu = ({ type }: { type: "home" | "profile" }) => {
  return (
    <div className="flex flex-col gap-5">
      {type === "home" && (
        <Suspense
          fallback={<Skeleton className="h-36 w-full rounded-xl bg-gray-800" />}
        >
          <ProfileCard />
        </Suspense>
      )}
      <Suspense
        fallback={<Skeleton className="h-48 w-full rounded-xl bg-gray-800" />}
      >
        <SuggestedDJs />
      </Suspense>
    </div>
  );
};

export default LeftMenu;
