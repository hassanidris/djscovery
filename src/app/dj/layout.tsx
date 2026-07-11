import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MapPin, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getNavUser } from "@/lib/auth/getNavUser";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DjNav from "@/components/dj/DjNav";
import DjHeaderAvatar from "@/components/dj/DjHeaderAvatar";

export const metadata: Metadata = {
  title: "DJ Hub",
};

async function DjLayoutHeader() {
  const { displayName, avatarSrc, initials, djSlug } = await getNavUser();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const djProfile = user
    ? await prisma.djProfile.findUnique({
        where: { userId: user.id },
        select: {
          stageName: true,
          plan: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      })
    : null;

  const location = [djProfile?.city?.name, djProfile?.country?.name]
    .filter(Boolean)
    .join(", ");

  const isPremium = djProfile?.plan === "PREMIUM";

  return (
    <div className="mb-8 flex items-center gap-4">
      <DjHeaderAvatar
        avatarSrc={avatarSrc}
        displayName={displayName}
        initials={initials}
        djSlug={djSlug}
      />
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">
            Dj. {djProfile?.stageName || displayName}
          </h1>
          {isPremium && (
            <Badge
              variant="secondary"
              className="border-amber-500/30 bg-amber-500/20 text-xs text-amber-400"
            >
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        {location && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
        )}
      </div>
    </div>
  );
}

function DjLayoutHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-center gap-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
  );
}

export default async function DjLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, navRole } = await getNavUser();

  if (!isLoggedIn) redirect("/sign-in");
  if (navRole !== "dj" && navRole !== "admin") redirect("/become-dj");

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Suspense fallback={<DjLayoutHeaderSkeleton />}>
          <DjLayoutHeader />
        </Suspense>

        {/* Sidebar + main content */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <DjNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
