import { Skeleton } from "@/components/ui/skeleton";

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
