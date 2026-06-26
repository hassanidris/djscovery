import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { Skeleton } from "@/components/ui/skeleton";
import FanNav from "@/components/fan/FanNav";

export const metadata: Metadata = {
  title: "Fan Hub",
};

async function FanLayoutHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fanProfile = await prisma.fanProfile.findUnique({
    where: { userId: user.id },
    select: {
      name: true,
      avatar: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
    },
  });

  if (!fanProfile) return null;

  const location = [fanProfile.city?.name, fanProfile.country?.name]
    .filter(Boolean)
    .join(", ");

  const initials = fanProfile.name.slice(0, 2).toUpperCase();

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
        {fanProfile.avatar ? (
          <Image
            src={fanProfile.avatar}
            alt={fanProfile.name}
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
        <h1 className="text-xl font-bold text-white">{fanProfile.name}</h1>
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

function FanLayoutHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-center gap-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
  );
}

export default async function FanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const fanProfile = await prisma.fanProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!fanProfile) redirect("/become-fan");

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Suspense fallback={<FanLayoutHeaderSkeleton />}>
          <FanLayoutHeader />
        </Suspense>

        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <FanNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
