import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getNavUser } from "@/lib/auth/getNavUser";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, displayName, avatarSrc, initials, isOrganizer, navRole } =
    await getNavUser();
  if (!isLoggedIn) redirect("/sign-in");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOrganizerOnly = isOrganizer && navRole === "organizer";

  let location = "";
  if (user) {
    if (isOrganizerOnly) {
      const orgProfile = await prisma.organizerProfile.findUnique({
        where: { userId: user.id },
        select: {
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      });
      location = [orgProfile?.city?.name, orgProfile?.country?.name]
        .filter(Boolean)
        .join(", ");
    } else if (navRole === "fan") {
      const fanProfile = await prisma.fanProfile.findUnique({
        where: { userId: user.id },
        select: {
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      });
      location = [fanProfile?.city?.name, fanProfile?.country?.name]
        .filter(Boolean)
        .join(", ");
    } else {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      });
      location = [dbUser?.city?.name, dbUser?.country?.name]
        .filter(Boolean)
        .join(", ");
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 md:px-8">
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
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {location || "Your account"}
            </p>
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
