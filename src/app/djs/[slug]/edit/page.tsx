import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import EditDjProfileForm from "@/components/dj-profile/EditDjProfileForm";

export default async function EditDjProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/sign-in?next=/djs/${slug}/edit`);

  const dj = await prisma.djProfile.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: { select: { id: true, name: true } } } },
      djTypes: { select: { type: true } },
      socialLinks: { select: { platform: true, url: true } },
      city: { select: { id: true, name: true } },
      country: { select: { id: true, name: true } },
    },
  });

  if (!dj) return notFound();
  if (dj.userId !== user.id) return notFound();

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const existingCities = dj.countryId
    ? await prisma.city.findMany({
        where: { countryId: dj.countryId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];

  const profileData = {
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
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <EditDjProfileForm
          profile={profileData}
          countries={countries}
          initialCities={existingCities}
          userId={user.id}
        />
      </div>
    </div>
  );
}
