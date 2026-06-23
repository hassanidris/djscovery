import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import OrganizerSettingsTabs from "@/components/organizer/OrganizerSettingsTabs";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function OrganizerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    include: {
      socialLinks: {
        select: { platform: true, url: true },
        orderBy: { id: "asc" },
      },
      country: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    },
  });

  if (!profile) redirect("/become-organizer");
  if (profile.status !== "ACTIVE" || profile.deletedAt !== null)
    redirect("/become-organizer");

  const [countries, initialCities] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    profile.countryId
      ? prisma.city.findMany({
          where: { countryId: profile.countryId },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const profileData = {
    displayName: profile.displayName,
    organizerType: profile.organizerType,
    bio: profile.bio ?? "",
    logoUrl: profile.logoUrl ?? "",
    coverImageUrl: profile.coverImageUrl ?? "",
    website: profile.website ?? "",
    contactEmail: profile.contactEmail ?? "",
    phone: profile.phone ?? "",
    countryId: profile.countryId,
    cityId: profile.cityId,
    countryName: profile.country?.name ?? "",
    cityName: profile.city?.name ?? "",
    socialLinks: profile.socialLinks,
    slug: profile.slug,
  };

  return (
    <OrganizerSettingsTabs
      profile={profileData}
      countries={countries}
      initialCities={initialCities}
    />
  );
}
