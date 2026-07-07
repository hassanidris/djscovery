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
    select: {
      id: true,
      userId: true,
      stageName: true,
      slug: true,
      bio: true,
      experienceYears: true,
      experienceLevel: true,
      avatar: true,
      coverImage: true,
      countryId: true,
      cityId: true,
      plan: true,
      bookingEmail: true,
      bookingPhone: true,
      feeMin: true,
      feeMax: true,
      feeCurrency: true,
      managerName: true,
      managerEmail: true,
      managerPhone: true,
      agentName: true,
      agentAgency: true,
      agentEmail: true,
      featuredMixTitle: true,
      featuredMixAudioUrl: true,
      featuredMixDuration: true,
      featuredMixPlays: true,
      featuredVideoTitle: true,
      featuredVideoUrl: true,
      featuredVideoThumbnail: true,
      featuredVideoDuration: true,
      featuredVideoViews: true,
      availabilityTimezone: true,
      availabilityMonth: true,
      availabilityDays: true,
      genres: { include: { genre: { select: { id: true, name: true } } } },
      djTypes: { select: { type: true } },
      socialLinks: { select: { platform: true, url: true } },
      city: { select: { id: true, name: true } },
      country: { select: { id: true, name: true } },
      venues: {
        orderBy: { createdAt: "desc" },
        include: { city: true, country: true },
      },
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

  const galleryImages = await prisma.media.findMany({
    where: { djProfileId: dj.id, type: "IMAGE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, path: true, bucket: true },
  });

  const plan = (dj.plan ?? "FREE") as "FREE" | "PREMIUM";

  const profileData = {
    stageName: dj.stageName,
    bio: dj.bio ?? "",
    experienceYears: dj.experienceYears ?? null,
    experienceLevel: dj.experienceLevel ?? null,
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
    managerName: dj.managerName ?? "",
    managerEmail: dj.managerEmail ?? "",
    managerPhone: dj.managerPhone ?? "",
    agentName: dj.agentName ?? "",
    agentAgency: dj.agentAgency ?? "",
    agentEmail: dj.agentEmail ?? "",
    featuredMixTitle: dj.featuredMixTitle ?? "",
    featuredMixAudioUrl: dj.featuredMixAudioUrl ?? "",
    featuredMixDuration: dj.featuredMixDuration ?? "",
    featuredMixPlays: dj.featuredMixPlays ?? 0,
    featuredVideoTitle: dj.featuredVideoTitle ?? "",
    featuredVideoUrl: dj.featuredVideoUrl ?? "",
    featuredVideoThumbnail: dj.featuredVideoThumbnail ?? "",
    featuredVideoDuration: dj.featuredVideoDuration ?? "",
    featuredVideoViews: dj.featuredVideoViews ?? 0,
    availabilityTimezone: dj.availabilityTimezone ?? "",
    availabilityMonth: dj.availabilityMonth ?? "",
    availabilityDays:
      (dj.availabilityDays as Array<{
        day: number;
        status: string;
      }> | null) ?? [],
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <EditDjProfileForm
          profile={profileData}
          countries={countries}
          initialCities={existingCities}
          userId={user.id}
          galleryImages={galleryImages}
        />
      </div>
    </div>
  );
}
