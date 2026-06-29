import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getCountries, getCitiesForCountry } from "@/lib/actions/locations";
import { getNavUser } from "@/lib/auth/getNavUser";
import ProfileSettingsForm from "@/components/account/ProfileSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/sign-in");

  const { isOrganizer, navRole } = await getNavUser();
  const isOrganizerOnly = isOrganizer && navRole === "organizer";

  if (navRole === "fan") redirect("/fan/settings");

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
    <div className="flex flex-col gap-10">
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
  );
}
