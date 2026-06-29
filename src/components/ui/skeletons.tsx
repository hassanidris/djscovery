import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

// ── Home: Featured DJs Skeleton ───────────────────────────────────────────────
export function HomeFeaturedDJsSkeleton() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-44 rounded" />
            <Skeleton className="mt-2 h-4 w-60 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-h_blackLight/50 overflow-hidden rounded-xl"
            >
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="flex flex-col gap-3 px-4 pt-10 pb-4">
                <div>
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="mt-1 h-3.5 w-28 rounded" />
                </div>
                <Skeleton className="h-8 w-full rounded" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="mt-auto flex justify-between border-t border-white/5 pt-3">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-28 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Home: Discover DJs Tabs Skeleton ──────────────────────────────────────────
export function HomeDJsTabsSkeleton() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-8 w-44 rounded" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-h_blackLight/50 flex w-48 shrink-0 flex-col gap-3 overflow-hidden rounded-xl p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="flex justify-center gap-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Home: Upcoming Events Skeleton ────────────────────────────────────────────
export function HomeEventsSectionSkeleton() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-52 rounded" />
            <Skeleton className="mt-2 h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-h_blackLight/50 overflow-hidden rounded-xl"
            >
              <Skeleton className="aspect-3/2 w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-full rounded" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <div className="mt-1 flex gap-3">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Home: Open Gigs Skeleton ──────────────────────────────────────────────────
export function HomeGigsSectionSkeleton() {
  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="mt-2 h-4 w-56 rounded" />
          </div>
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10 sm:flex-row sm:items-start"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── DJ Card Skeleton ──────────────────────────────────────────────────────────
export function DjCardSkeleton() {
  return (
    <div className="bg-h_blackLight/50 relative flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

// ── DJ Grid Skeleton ─────────────────────────────────────────────────────────
export function DjGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DjCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Filter Panel Skeleton ────────────────────────────────────────────────────
export function FilterPanelSkeleton() {
  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-3 rounded-xl p-4">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="mt-1 flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
      <Skeleton className="my-1 h-px w-full rounded" />
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

// ── DJ Profile Skeleton ──────────────────────────────────────────────────────
export function DjProfileSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Cover image */}
      <Skeleton className="h-52 w-full rounded-none md:h-72" />

      <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* Avatar + header info */}
        <div className="relative z-10 -mt-14 mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full ring-4 ring-black md:h-32 md:w-32" />
          <div className="flex flex-1 flex-col gap-2 pb-1">
            <Skeleton className="h-7 w-52 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
            <div className="mt-1 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-h_blackLight/50 flex flex-col gap-1.5 rounded-xl p-3"
            >
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-h_blackLight/50 mb-4 flex flex-col gap-2 rounded-xl p-5">
          <Skeleton className="mb-1 h-4 w-16 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>

        {/* Media grid */}
        <div className="bg-h_blackLight/50 mb-4 rounded-xl p-5">
          <Skeleton className="mb-4 h-4 w-24 rounded" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Card Skeleton ─────────────────────────────────────────────────────
export function ProfileCardSkeleton() {
  return (
    <div className="bg-h_blackLight/50 overflow-hidden rounded-xl border border-gray-800/70">
      <Skeleton className="h-20 w-full rounded-none" />
      <div className="-mt-6 flex items-end justify-between px-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <Skeleton className="mb-1 h-7 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 px-4 pt-2 pb-4">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="mt-1 h-px w-full rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

// ── Suggested DJs Skeleton ────────────────────────────────────────────────────
export function SuggestedDJsSkeleton() {
  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-xl border border-gray-800/70 p-4">
      <Skeleton className="h-4 w-28 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ── Post Skeleton ────────────────────────────────────────────────────────────
export function PostSkeleton({ showImage = false }: { showImage?: boolean }) {
  return (
    <div className="bg-h_blackLight/50 flex flex-col gap-4 rounded-xl border border-gray-800/70 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
      {showImage && <Skeleton className="h-48 w-full rounded-lg" />}
      <div className="flex gap-8 pt-1">
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

// ── Feed Skeleton ────────────────────────────────────────────────────────────
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} showImage={i === 1} />
      ))}
    </div>
  );
}

// ── Post Interaction Skeleton ─────────────────────────────────────────────────
export function PostInteractionSkeleton() {
  return (
    <div className="my-1 flex items-center gap-8 py-2">
      <Skeleton className="h-4 w-14 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
    </div>
  );
}

// ── Comment Input Skeleton ────────────────────────────────────────────────────
export function CommentInputSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <Skeleton className="h-9 flex-1 rounded-xl" />
    </div>
  );
}

// ── AddPost Skeleton ─────────────────────────────────────────────────────────
export function AddPostSkeleton() {
  return (
    <div className="bg-h_blackLight/50 flex gap-4 rounded-lg p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Right Panel Skeleton ─────────────────────────────────────────────────────
export function RightPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-h_blackLight/50 flex flex-col gap-3 rounded-xl p-4">
        <Skeleton className="mb-1 h-4 w-28 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-h_blackLight/50 flex flex-col gap-3 rounded-xl p-4">
        <Skeleton className="mb-1 h-4 w-20 rounded" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── User Info Card Skeleton ──────────────────────────────────────────────────
export function UserInfoCardSkeleton() {
  return (
    <div className="bg-h_blackLight/50 overflow-hidden rounded-xl">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="-mt-8 flex flex-col items-center gap-2 px-4 pb-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full ring-4 ring-black" />
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="mt-2 flex w-full justify-center gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-2 h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

// ── Profile Page Skeleton ─────────────────────────────────────────────────────
export function ProfilePageSkeleton() {
  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <div className="flex gap-6 py-6">
        {/* Left sidebar placeholder */}
        <div className="hidden w-[20%] xl:block">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full">
                <Skeleton className="h-64 w-full rounded-md" />
                <Skeleton className="absolute right-0 -bottom-16 left-0 m-auto h-32 w-32 rounded-full ring-4 ring-black" />
              </div>
              <Skeleton className="mt-20 mb-3 h-6 w-36 rounded" />
              <div className="mb-4 flex items-center justify-center gap-12">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton className="h-5 w-10 rounded" />
                    <Skeleton className="h-3 w-14 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <AddPostSkeleton />
            <FeedSkeleton count={2} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden w-[30%] xl:block">
          <div className="flex flex-col gap-4">
            <UserInfoCardSkeleton />
            <RightPanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Become DJ Form Skeleton ───────────────────────────────────────────────────
export function BecomeDjSkeleton() {
  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <Skeleton className="mb-1 h-5 w-40 rounded" />
              <Skeleton className="h-px w-full rounded" />
              <Skeleton className="h-12 w-full rounded-lg" />
              {i < 3 && <Skeleton className="h-12 w-full rounded-lg" />}
            </div>
          ))}
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Gig Listing Page Skeleton ─────────────────────────────────────────────────
export function GigListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner — flat icon style, mirrors /dashboard/dj/gigs page */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <Briefcase className="text-h_red h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-9 w-40 rounded" />
              <Skeleton className="mt-1 h-4 w-64 rounded" />
            </div>
          </div>
          <div className="h-7 w-32 animate-pulse rounded-full bg-white/5" />
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 min-w-48 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10 sm:flex-row sm:items-start"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Organizer Hub: My Gigs Content Skeleton ─────────────────────────────────
export function OrganizerGigsContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="mb-1 h-3 w-12 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 sm:flex-row sm:items-start"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="flex gap-1.5">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Organizer Hub: Followed DJs Content Skeleton ──────────────────────────────
export function FollowedDjsContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
          >
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── My Reviews Content Skeleton ──────────────────────────────────────────────
export function MyReviewsContentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="mb-1 h-4 w-32 rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/6 bg-white/3 px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-3.5 w-3.5 rounded" />
                ))}
              </div>
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="mt-3 h-px w-full rounded" />
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Organizer Hub: Saved Events Content Skeleton ──────────────────────────────
export function SavedEventsContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
          >
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings Form Content Skeleton ───────────────────────────────────────────
export function SettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// ── Fan Settings Skeleton ───────────────────────────────────────────────────
export function FanSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>

        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Fan Account Settings Skeleton ────────────────────────────────────────────
export function FanAccountSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44 rounded" />
        <Skeleton className="h-4 w-56 rounded" />
      </div>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Event Detail Skeleton ─────────────────────────────────────────────────────
export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Top nav bar */}
      <div className="border-b border-zinc-800/60 bg-black/80 px-4 py-3 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8">
        {/* Left poster */}
        <div className="w-full shrink-0 md:w-70 lg:w-80">
          <Skeleton className="aspect-2/3 w-full rounded-2xl" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" />
        </div>

        {/* Right details */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="mb-6 h-9 w-3/4 rounded md:h-11" />
          <div className="mb-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-48 rounded" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Event Listing Page Skeleton ───────────────────────────────────────────────
export function EventListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-36 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="mb-6 flex gap-1 border-b border-zinc-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-t" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-1.5 h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <Skeleton className="hidden h-5 w-16 shrink-0 rounded-full sm:block" />
              <Skeleton className="h-8 w-8 shrink-0 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Gig Review Page Skeleton ──────────────────────────────────────────────────
export function GigReviewPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <Skeleton className="mb-6 h-8 w-32 rounded" />
        <Skeleton className="mb-2 h-8 w-64 rounded" />
        <Skeleton className="mb-6 h-4 w-48 rounded" />
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <Skeleton className="mb-4 h-4 w-48 rounded" />
          <Skeleton className="mb-4 h-4 w-64 rounded" />
          <div className="mb-4 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded" />
            ))}
          </div>
          <Skeleton className="mb-4 h-32 w-full rounded-lg" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gig Detail Skeleton ───────────────────────────────────────────────────────
export function GigDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-8 w-3/4 rounded" />
        <Skeleton className="mb-6 h-4 w-1/2 rounded" />
        <div className="mb-8 flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-5 rounded-xl border border-white/10 p-5">
            <Skeleton className="mb-4 h-4 w-32 rounded" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Organizer Profile Page Skeleton ───────────────────────────────────────────
export function OrganizerProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <Skeleton className="h-52 w-full rounded-none md:h-64" />
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="relative -mt-14 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl ring-4 ring-black" />
          <div className="flex flex-1 flex-col gap-2 pb-1">
            <Skeleton className="h-7 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-9 w-28 shrink-0 rounded-lg" />
        </div>
        <div className="mb-6 rounded-xl border border-white/10 p-5">
          <Skeleton className="mb-3 h-4 w-16 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="mt-1.5 h-3 w-full rounded" />
          <Skeleton className="mt-1.5 h-3 w-3/4 rounded" />
        </div>
        <Skeleton className="mb-4 h-6 w-28 rounded" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-white/10 p-4"
            >
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-2/3 rounded" />
              </div>
              <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications Page Skeleton ───────────────────────────────────────────────
export function NotificationsPageSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <Skeleton className="h-10 flex-1 rounded-none" />
        <Skeleton className="h-10 flex-1 rounded-none" />
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 border-b border-white/10 px-5 py-4 last:border-b-0"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="mt-1 flex items-center gap-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fan Profile Skeleton ─────────────────────────────────────────────────────
export function FanProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32 rounded" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-4">
            <Skeleton className="mb-2 h-3 w-24 rounded" />
            <Skeleton className="h-8 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Notification reminder placeholder */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Pending event reviews */}
      <div>
        <Skeleton className="mb-4 h-4 w-48 rounded" />
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-white/8 bg-white/3 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-10 shrink-0 rounded-md" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                <div className="flex flex-col items-end gap-0.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <Skeleton className="mb-0 h-4 w-28 rounded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/10 p-5"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <Skeleton className="h-8 w-12 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Organizer Dashboard Skeleton ──────────────────────────────────────────────
export function OrganizerDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32 rounded" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Notification reminder placeholder */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-4">
            <Skeleton className="mb-2 h-3 w-20 rounded" />
            <Skeleton className="h-8 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Pending reviews */}
      <div>
        <Skeleton className="mb-4 h-4 w-32 rounded" />
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Profile completeness */}
      <div className="rounded-xl border border-white/10 p-5">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-56 rounded" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mb-4 h-1.5 w-full rounded-full" />
        <div className="mb-4 flex flex-col gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-40 rounded" />
          ))}
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Quick actions */}
      <Skeleton className="mb-0 h-4 w-28 rounded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/10 p-5"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <Skeleton className="h-8 w-12 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Organizer Settings Skeleton ───────────────────────────────────────────────
export function OrganizerSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-t" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// ── Account Settings Skeleton ─────────────────────────────────────────────────
export function AccountSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 self-end rounded-lg" />
    </div>
  );
}

// ── Edit Profile Skeleton ────────────────────────────────────────────────────
export function EditProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-h_blackLight/40 flex flex-col gap-4 rounded-xl border border-white/8 p-6"
        >
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-px w-full rounded" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
