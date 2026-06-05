import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import DjProfileHero from "@/components/dj-profile/DjProfileHero";
import DjProfileTabs from "@/components/dj-profile/DjProfileTabs";
import DjProfileContent from "@/components/dj-profile/DjProfileContent";
import DjProfileSidebar from "@/components/dj-profile/DjProfileSidebar";
import DjProfileFree from "@/components/dj-profile/DjProfileFree";
import DjProfilePremium from "@/components/dj-profile/DjProfilePremium";
import type { DjType } from "@prisma/client";
import { getDemodjBySlug } from "@/data/djs";

const DEMO_DJ = {
  stageName: "Amara Pulse",
  avatar: "/rated-6.webp",
  coverImage: "/noCover.png",
  bio: "Bringing the pulse of Lagos to the world stage. Amara blends Afrobeats and Amapiano into euphoric, floor-filling sets that transcend borders. With residencies across London, Paris, and Dubai, she's one of the fastest-rising names in global club culture.",
  city: "Lagos",
  country: "Nigeria",
  genres: ["Afrobeats", "Amapiano", "House"],
  socialLinks: [
    { platform: "instagram", url: "#" },
    { platform: "soundcloud", url: "#" },
    { platform: "tiktok", url: "#" },
    { platform: "spotify", url: "#" },
  ],
  avgRating: 4.8,
  ratingCount: 0,
  followerCount: 5200,
  eventsCount: 0,
};

const DEMO_DJ_TYPES: DjType[] = ["FESTIVAL", "CLUB"];

export default async function DjProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "demo-free") {
    return (
      <div>
        <div className="bg-h_blackLight/60 border-b border-white/8 text-gray-300 text-xs text-center py-2 px-4 font-medium tracking-wide flex items-center justify-center gap-4">
          <span className="opacity-60">Version 1 — Free DJ Profile</span>
          <span className="opacity-30">·</span>
          <Link
            href="/djs/demo-premium"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            Switch to Premium Version →
          </Link>
        </div>
        <DjProfileFree />
      </div>
    );
  }

  if (slug === "demo-premium") {
    return (
      <div>
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs text-center py-2 px-4 font-medium tracking-wide flex items-center justify-center gap-4">
          <span className="opacity-80">Version 2 — Premium DJ Profile</span>
          <span className="opacity-30">·</span>
          <Link
            href="/djs/demo-free"
            className="text-gray-400 underline underline-offset-2 hover:text-gray-200"
          >
            ← Switch to Free Version
          </Link>
        </div>
        <DjProfilePremium />
      </div>
    );
  }

  if (slug === "demo") {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-h_red/10 border-b border-h_red/15 text-red-200 text-xs text-center py-2 px-4 font-medium tracking-wide">
          Layout V1 — Tabbed &nbsp;·&nbsp;{" "}
          <Link
            href="/djs/demo-v2"
            className="underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Switch to V2 (Two-Column) →
          </Link>
        </div>
        <DjProfileHero {...DEMO_DJ} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
          <DjProfileTabs
            bio={DEMO_DJ.bio}
            djTypes={DEMO_DJ_TYPES}
            city={DEMO_DJ.city}
            country={DEMO_DJ.country}
            media={[]}
            events={[]}
            ratings={[]}
            avgRating={0}
            ratingCount={0}
          />
        </div>
      </div>
    );
  }

  if (slug === "demo-v2") {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-h_red/10 border-b border-h_red/15 text-red-200 text-xs text-center py-2 px-4 font-medium tracking-wide">
          Layout V2 — Editorial Two-Column &nbsp;·&nbsp;{" "}
          <Link
            href="/djs/demo"
            className="underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Switch to V1 (Tabs) →
          </Link>
        </div>
        <DjProfileHero {...DEMO_DJ} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="flex gap-8 items-start">
            <div className="flex-1 min-w-0">
              <DjProfileContent
                bio={DEMO_DJ.bio}
                djTypes={DEMO_DJ_TYPES}
                media={[]}
                ratings={[]}
                avgRating={0}
                ratingCount={0}
              />
            </div>
            <div className="hidden lg:block w-72 shrink-0">
              <DjProfileSidebar djTypes={DEMO_DJ_TYPES} events={[]} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── JSON demo data lookup (dev/staging) ─────────────────────────────────
  const demoDj = getDemodjBySlug(slug);
  if (demoDj) {
    if (demoDj.plan === "free") {
      return <DjProfileFree djData={demoDj} viewMode="fan" />;
    }
    return <DjProfilePremium djData={demoDj} viewMode="fan" />;
  }

  // ── Prisma DB lookup (production) ─────────────────────────────────────────
  const dj = await prisma.djProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          _count: { select: { followers: true } },
        },
      },
      city: true,
      country: true,
      genres: { include: { genre: true } },
      djTypes: true,
      socialLinks: true,
      ratings: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true, image: true, name: true } },
        },
      },
      media: {
        where: { type: "IMAGE" },
        take: 12,
        orderBy: { createdAt: "desc" },
      },
      eventsOwned: {
        where: { status: "PUBLISHED", deletedAt: null },
        take: 6,
        orderBy: { startDate: "asc" },
        include: { city: true, country: true },
      },
      _count: {
        select: { ratings: true, eventsOwned: true },
      },
    },
  });

  if (!dj || dj.status === "REJECTED") return notFound();

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (dj.status === "PENDING_APPROVAL" && authUser?.id !== dj.userId)
    return notFound();

  const avgRating =
    dj.ratings.length > 0
      ? dj.ratings.reduce((sum, r) => sum + r.rating, 0) / dj.ratings.length
      : 0;

  return (
    <div className="min-h-screen bg-black">
      {dj.status === "PENDING_APPROVAL" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-sm text-center py-2.5 px-4">
          ⏳ Your profile is pending admin approval and is only visible to you.
        </div>
      )}

      <DjProfileHero
        stageName={dj.stageName}
        avatar={dj.avatar}
        coverImage={dj.coverImage}
        city={dj.city?.name ?? null}
        country={dj.country?.name ?? null}
        genres={dj.genres.map((g) => g.genre.name)}
        socialLinks={dj.socialLinks.map((s) => ({
          platform: s.platform,
          url: s.url,
        }))}
        avgRating={avgRating}
        ratingCount={dj._count.ratings}
        followerCount={dj.user._count.followers}
        eventsCount={dj._count.eventsOwned}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <DjProfileTabs
          bio={dj.bio}
          djTypes={dj.djTypes.map((t) => t.type)}
          city={dj.city?.name ?? null}
          country={dj.country?.name ?? null}
          media={dj.media.map((m) => ({ id: m.id, url: m.url }))}
          events={dj.eventsOwned.map((e) => ({
            id: e.id,
            title: e.title,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate?.toISOString() ?? null,
            venue: e.venue ?? null,
            city: e.city?.name ?? null,
            country: e.country?.name ?? null,
            image: e.image ?? null,
          }))}
          ratings={dj.ratings.map((r) => ({
            id: r.id,
            rating: r.rating,
            review: r.review ?? null,
            createdAt: r.createdAt.toISOString(),
            user: {
              username: r.user.username,
              name: r.user.name ?? null,
              image: r.user.image ?? null,
            },
          }))}
          avgRating={avgRating}
          ratingCount={dj._count.ratings}
        />
      </div>
    </div>
  );
}
