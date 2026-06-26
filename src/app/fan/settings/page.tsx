import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import BecomeFanForm from "@/components/BecomeFanForm";

export const metadata = { title: "Profile Settings" };

export default async function FanSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [fanProfile, countries] = await Promise.all([
    prisma.fanProfile.findUnique({
      where: { userId: user.id },
      select: { name: true, bio: true, countryId: true, cityId: true },
    }),
    getCountries(),
  ]);

  if (!fanProfile) redirect("/become-fan");

  const initialCities = fanProfile.countryId
    ? await getCitiesForCountry(fanProfile.countryId)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Update your display name, bio, and location.
        </p>
      </div>

      <BecomeFanForm
        initialName={fanProfile.name}
        initialBio={fanProfile.bio ?? ""}
        initialCountryId={fanProfile.countryId}
        initialCityId={fanProfile.cityId}
        countries={countries}
        initialCities={initialCities}
        isSettingsMode={true}
      />
    </div>
  );
}
