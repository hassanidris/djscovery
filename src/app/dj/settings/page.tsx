import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import DjSettingsTabs from "@/components/dj/DjSettingsTabs";
import { getGenres } from "@/lib/actions/genre";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function DjSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const dj = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      stageName: true,
      bio: true,
      avatar: true,
      coverImage: true,
      countryId: true,
      cityId: true,
      bookingEmail: true,
      bookingPhone: true,
      feeMin: true,
      feeMax: true,
      feeCurrency: true,
      slug: true,
      plan: true,
      managerName: true,
      managerEmail: true,
      managerPhone: true,
      agentName: true,
      agentAgency: true,
      agentEmail: true,
      genres: {
        select: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
      djTypes: {
        select: {
          type: true,
        },
      },
      socialLinks: {
        select: {
          platform: true,
          url: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      country: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!dj) redirect("/become-dj");

  const [countries, initialCities, allGenres] = await Promise.all([
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
    getGenres(),
  ]);

  const profileData = {
    id: dj.id,
    stageName: dj.stageName,
    bio: dj.bio ?? "",
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
    plan: dj.plan,
    managerName: dj.managerName ?? "",
    managerEmail: dj.managerEmail ?? "",
    managerPhone: dj.managerPhone ?? "",
    agentName: dj.agentName ?? "",
    agentAgency: dj.agentAgency ?? "",
    agentEmail: dj.agentEmail ?? "",
  };

  return (
    <div className="min-h-screen bg-black">
      <div
        className="mx-auto max-w-7xl px-4 py-10 md:px-8"
        style={{ padding: "var(--space-10) var(--space-4)" }}
      >
        <div className="flex flex-col gap-6" style={{ gap: "var(--space-6)" }}>
          <div>
            <h1
              className="font-heading text-2xl font-bold text-white"
              style={{ letterSpacing: "-0.025em" }}
            >
              Profile Settings
            </h1>
            <p className="text-sm text-gray-400">
              Manage your public DJ profile information.
            </p>
          </div>
          <Card
            className="bg-h_blackLight/30 border-white/8 p-6"
            style={{ padding: "var(--space-6)" }}
          >
            <DjSettingsTabs
              profile={profileData}
              countries={countries}
              initialCities={initialCities}
              allGenres={allGenres}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
