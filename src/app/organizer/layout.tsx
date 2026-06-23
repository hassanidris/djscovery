import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getNavUser } from "@/lib/auth/getNavUser";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OrganizerNav from "@/components/organizer/OrganizerNav";

export const metadata: Metadata = {
  title: "Organizer Hub",
};

const ORGANIZER_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  COMPANY: "Company",
  VENUE: "Venue",
  AGENCY: "Agency",
  FESTIVAL: "Festival",
};

async function OrganizerLayoutHeader() {
  const { displayName, avatarSrc, initials } = await getNavUser();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orgProfile = user
    ? await prisma.organizerProfile.findUnique({
        where: { userId: user.id },
        select: {
          organizerType: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      })
    : null;

  const location = [orgProfile?.city?.name, orgProfile?.country?.name]
    .filter(Boolean)
    .join(", ");

  const typeLabel = orgProfile?.organizerType
    ? (ORGANIZER_TYPE_LABELS[orgProfile.organizerType] ??
      orgProfile.organizerType)
    : null;

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
            {initials}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
          {typeLabel && (
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
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

function OrganizerLayoutHeaderSkeleton() {
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

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isOrganizer, navRole } = await getNavUser();

  if (!isLoggedIn) redirect("/sign-in");
  if (!isOrganizer && navRole !== "admin") redirect("/become-organizer");

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Suspense fallback={<OrganizerLayoutHeaderSkeleton />}>
          <OrganizerLayoutHeader />
        </Suspense>

        {/* Sidebar + main content */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <OrganizerNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
