import React, { Suspense } from "react";
import FriendRequests from "./FriendRequests";
import Birthdays from "./Birthdays";
import Ad from "./Ad";
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
      <Suspense fallback={<RightPanelSkeleton />}>
        <FriendRequests />
      </Suspense>
      <RecentAdded />
      {/* <Birthdays /> */}
      <Ad size="md" />
    </div>
  );
};

export default RightMenu;
