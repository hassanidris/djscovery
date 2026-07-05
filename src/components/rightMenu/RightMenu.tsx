import React, { Suspense } from "react";
import UserInfoCard from "./UserInfoCard";
import UserMediaCard from "./UserMediaCard";
import { User } from "@prisma/client";
import RecentAdded from "./RecentAdded";
import {
  UserInfoCardSkeleton,
  RightPanelSkeleton,
} from "@/components/ui/skeletons";

const RightMenu = ({ user }: { user?: User }) => {
  return (
    <div className="flex flex-col gap-6">
      {user ? (
        <>
          <Suspense fallback={<UserInfoCardSkeleton />}>
            <UserInfoCard user={user} />
          </Suspense>
          <Suspense fallback={<RightPanelSkeleton />}>
            <UserMediaCard user={user} />
          </Suspense>
        </>
      ) : null}
      <RecentAdded />
    </div>
  );
};

export default RightMenu;
