import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import EditDjProfileForm from "@/components/dj-profile/EditDjProfileForm";
import PremiumProfileManager from "@/components/dj-profile/PremiumProfileManager";

export const metadata: Metadata = {
  title: "DJ Profile Settings",
};

export default async function DjSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const dj = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    include: {
      genres: { include: { genre: { select: { id: true, name: true } } } },
      djTypes: { select: { type: true } },
      socialLinks: { select: { platform: true, url: true } },
      city: { select: { id: true, name: true } },
      country: { select: { id: true, name: true } },
    },
  });

  const plan = (dj?.plan ?? "FREE") as "FREE" | "PREMIUM";

  if (!dj) redirect("/become-dj");

  const [countries, existingCities, allMedia] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    dj.countryId
      ? prisma.city.findMany({
          where: { countryId: dj.countryId },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    prisma.media.findMany({
      where: { djProfileId: dj.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        type: true,
        url: true,
        path: true,
        bucket: true,
        sortOrder: true,
        isSpotlight: true,
        title: true,
        duration: true,
        thumbnail: true,
        createdAt: true,
      },
    }),
  ]);

  const profileData = {
    id: dj.id,
    stageName: dj.stageName,
    bio: dj.bio ?? "",
    experienceYears: dj.experienceYears,
    avatar: dj.avatar ?? "",
    coverImage: dj.coverImage ?? "",
    countryId: dj.countryId,
    cityId: dj.cityId,
    countryName: dj.country?.name ?? "",
    cityName: dj.city?.name ?? "",
    genres: dj.genres.map((g) => g.genre.name),
    djTypes: dj.djTypes.map((t) => t.type),
    socialLinks: dj.socialLinks,
    bookingEmail: dj.bookingEmail ?? "",
    bookingPhone: dj.bookingPhone ?? "",
    feeMin: dj.feeMin ?? null,
    feeMax: dj.feeMax ?? null,
    feeCurrency: dj.feeCurrency ?? "USD",
    slug: dj.slug,
    plan,
    // Team
    managerName: dj.managerName ?? "",
    managerEmail: dj.managerEmail ?? "",
    managerPhone: dj.managerPhone ?? "",
    agentName: dj.agentName ?? "",
    agentAgency: dj.agentAgency ?? "",
    agentEmail: dj.agentEmail ?? "",
    // Availability
    availabilityTimezone: dj.availabilityTimezone ?? "",
    availabilityMonth: dj.availabilityMonth ?? "",
    availabilityDays:
      (dj.availabilityDays as Array<{
        day: number;
        status: string;
      }> | null) ?? [],
  };

  return (
    <div className="flex flex-col gap-8">
      <EditDjProfileForm
        profile={profileData}
        countries={countries}
        initialCities={existingCities}
        userId={user.id}
        allMedia={allMedia}
      />
      <PremiumProfileManager djProfileId={dj.id} plan={plan} />
    </div>
  );
}
