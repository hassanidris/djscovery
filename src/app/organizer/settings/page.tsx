import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import OrganizerSettingsTabs from "@/components/organizer/OrganizerSettingsTabs";

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

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const initialCities = profile.countryId
    ? await prisma.city.findMany({
        where: { countryId: profile.countryId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

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
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Organizer Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage how your profile appears to DJs and on gig listings.
          </p>
        </div>
        <OrganizerSettingsTabs
          profile={profileData}
          countries={countries}
          initialCities={initialCities}
        />
      </div>
    </div>
  );
}
