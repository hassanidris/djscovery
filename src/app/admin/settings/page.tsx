import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import { getNavUser } from "@/lib/auth/getNavUser";
import ProfileSettingsForm from "@/components/account/ProfileSettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return (
      <div className="text-muted-foreground text-sm">
        Please sign in to view settings.
      </div>
    );
  }

  const { isOrganizer, navRole } = await getNavUser();
  const isOrganizerOnly = isOrganizer && navRole === "organizer";

  const [dbUser, countries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        name: true,
        username: true,
        image: true,
        countryId: true,
        cityId: true,
      },
    }),
    isOrganizerOnly ? Promise.resolve([]) : getCountries(),
  ]);

  const initialCities =
    !isOrganizerOnly && dbUser?.countryId
      ? await getCitiesForCountry(dbUser.countryId)
      : [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Manage your account details and preferences.
      </p>
      <div className="mt-8">
        <ProfileSettingsForm
          currentEmail={authUser.email ?? ""}
          initialName={dbUser?.name ?? dbUser?.username ?? ""}
          username={dbUser?.username ?? ""}
          currentAvatar={dbUser?.image ?? null}
          initialCountryId={dbUser?.countryId ?? null}
          initialCityId={dbUser?.cityId ?? null}
          countries={countries}
          initialCities={initialCities}
          isOrganizerOnly={isOrganizerOnly}
        />
      </div>
    </div>
  );
}
